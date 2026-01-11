import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function GET(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = client
      .from('workers')
      .select(`
        *,
        users!workers_id_fkey(name, phone, avatar_url),
        worker_documents(id, document_type, file_url, status, uploaded_at)
      `, { count: 'exact' });

    // Add status filter only if not 'all'
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    // Get workers with optional status filter
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Get pending workers error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      workers: data || [],
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Get pending workers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { workerId, action, reason } = body;

    if (!workerId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const client = createServerSupabaseClient();
    
    // Update worker status
    const newStatus = action === 'approve' ? 'active' : 'rejected';
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (action === 'approve') {
      updateData.verified_at = new Date().toISOString();
      updateData.verified_by = session.user_id;
    }

    const { error: updateError } = await client
      .from('workers')
      .update(updateData)
      .eq('id', workerId);

    if (updateError) {
      console.error('Update worker status error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If rejecting, also update documents status
    if (action === 'reject') {
      await client
        .from('worker_documents')
        .update({ status: 'rejected', admin_notes: reason })
        .eq('worker_id', workerId);
    } else if (action === 'approve') {
      // Approve documents too
      await client
        .from('worker_documents')
        .update({ status: 'approved', verified_at: new Date().toISOString() })
        .eq('worker_id', workerId);
    }

    return NextResponse.json({
      success: true,
      message: `Worker ${action}d successfully`,
      status: newStatus,
    });

  } catch (error) {
    console.error('Worker approval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
