import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: feeId } = await params;
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'worker') {
      return NextResponse.json({ error: 'Forbidden - Worker access required' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { reason, requested_days } = body;

    // Validate required fields
    if (!reason || !requested_days) {
      return NextResponse.json(
        { error: 'Missing required fields: reason, requested_days' },
        { status: 400 }
      );
    }

    // Validate requested days
    if (typeof requested_days !== 'number' || requested_days < 1 || requested_days > 30) {
      return NextResponse.json(
        { error: 'Invalid requested_days. Must be between 1 and 30' },
        { status: 400 }
      );
    }

    const { data: fee, error: feeError } = await client
      .from('fees')
      .select('id, worker_id, status, due_date')
      .eq('id', feeId)
      .single();

    if (feeError || !fee) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    if (fee.worker_id !== session.user_id) {
      return NextResponse.json({ error: 'Forbidden - Fee does not belong to this worker' }, { status: 403 });
    }

    if (!['unpaid', 'overdue', 'pending_verification'].includes(String(fee.status))) {
      return NextResponse.json({ error: 'Extension requests only allowed for outstanding fees' }, { status: 400 });
    }

    const currentDueDate = fee.due_date ? new Date(fee.due_date) : new Date();
    const newDueDate = new Date(currentDueDate);
    newDueDate.setDate(newDueDate.getDate() + requested_days);

    const { data: admins } = await client
      .from('users')
      .select('id')
      .eq('role', 'admin');

    const adminIds = (admins || []).map((a: any) => a.id);
    if (adminIds.length > 0) {
      const now = new Date().toISOString();
      await client.from('notifications').insert(
        adminIds.map((adminId: string) => ({
          user_id: adminId,
          type: 'fee_extension_request',
          title: 'Fee extension request',
          message: 'A worker requested an extension for a fee invoice.',
          action_url: `/admin/fees`,
          read: false,
          created_at: now,
          data: {
            fee_id: feeId,
            worker_id: session.user_id,
            requested_days,
            reason,
            current_due_date: fee.due_date,
            requested_due_date: newDueDate.toISOString().split('T')[0],
          },
        }))
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Extension request submitted for admin review',
      message_translations: {
        'ar-TN': 'تم إرسال طلب تمديد المهلة للمراجعة',
        'fr': 'Demande de prolongation soumise',
        'en': 'Extension request submitted'
      },
      extension_request: {
        fee_id: feeId,
        current_due_date: fee.due_date,
        requested_due_date: newDueDate.toISOString().split('T')[0],
        requested_days,
        reason,
        status: 'pending_review',
        requested_at: new Date().toISOString()
      },
      fee: {
        id: feeId,
        status: fee.status,
        extension_status: 'pending_review'
      }
    });

  } catch (error) {
    console.error('Request extension error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
