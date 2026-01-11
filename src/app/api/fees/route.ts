import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function GET(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const workerIdParam = searchParams.get('worker_id');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const forAdmin = searchParams.get('admin') === 'true';

    if (forAdmin) {
      if (session.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
      }

      let query = client
        .from('fees')
        .select(
          `
          *,
          worker:workers!fees_worker_id_fkey(
            id,
            users!workers_id_fkey(name, phone)
          )
        `,
          { count: 'exact' }
        );

      if (workerIdParam) {
        query = query.eq('worker_id', workerIdParam);
      }

      if (status) {
        query = query.eq('status', status);
      }

      query = query
        .order('due_date', { ascending: true })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) {
        console.error('Get fees error:', error);
        return NextResponse.json({ success: true, fees: [], total: 0, limit, offset });
      }

      const now = new Date();
      const fees = (data || []).map((f: any) => {
        const due = f.due_date ? new Date(f.due_date) : null;
        const daysUntilDue = due ? Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

        return {
          id: f.id,
          worker_id: f.worker_id,
          worker_name: f.worker?.users?.[0]?.name || 'Unknown',
          worker_phone: f.worker?.users?.[0]?.phone || '',
          week_start: f.period_start,
          week_end: f.period_end,
          jobs_count: f.jobs_count || 0,
          total_earnings: 0,
          amount_due: Number(f.amount_due || 0),
          currency: 'TND',
          status: f.status,
          due_date: f.due_date,
          days_until_due: daysUntilDue,
          reminder_sent_at: f.reminder_sent_at,
          warning_sent_at: f.warning_sent_at,
          payment_method: f.payment_method,
          payment_reference: f.payment_reference,
          payment_proof_url: f.payment_proof_url,
          verified_at: f.verified_at,
          verified_by: f.verified_by,
          created_at: f.created_at,
        };
      });

      return NextResponse.json({ success: true, fees, total: count || 0, limit, offset });
    }

    // Worker: list own fees
    if (session.role !== 'worker') {
      return NextResponse.json({ error: 'Forbidden - Worker access required' }, { status: 403 });
    }

    let query = client
      .from('fees')
      .select('*', { count: 'exact' })
      .eq('worker_id', session.user_id)
      .order('period_start', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;
    if (error) {
      console.error('Get fees error:', error);
      return NextResponse.json({ success: true, fees: [], total: 0, limit, offset });
    }

    return NextResponse.json({ success: true, fees: data || [], total: count || 0, limit, offset });

  } catch (error) {
    console.error('Get fees error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { worker_id, amount_due, period_start, period_end, jobs_count, due_date } = body;

    // Validate required fields
    if (!worker_id || amount_due === undefined || !period_start || !period_end || !due_date) {
      return NextResponse.json(
        { error: 'Missing required fields: worker_id, amount_due, period_start, period_end, due_date' },
        { status: 400 }
      );
    }

    const { data, error } = await client
      .from('fees')
      .insert({
        worker_id,
        period_start,
        period_end,
        jobs_count: jobs_count || 0,
        amount_due: Number(amount_due),
        status: 'unpaid',
        due_date,
        grace_period_days: 30,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Create fee error:', error);
      return NextResponse.json({ error: 'Failed to create fee' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Fee created successfully', fee: data });

  } catch (error) {
    console.error('Create fee error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { fee_id, action, admin_notes } = body;

    if (!fee_id || !action) {
      return NextResponse.json({ error: 'Missing required fields: fee_id, action' }, { status: 400 });
    }

    if (!['verify', 'reject', 'mark_reminder_sent', 'mark_warning_sent'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (action === 'verify') {
      const { data, error } = await client
        .from('fees')
        .update({
          status: 'paid',
          verified_by: session.user_id,
          verified_at: new Date().toISOString(),
          admin_notes: admin_notes || null,
        })
        .eq('id', fee_id)
        .select('*')
        .single();

      if (error) {
        console.error('Verify fee error:', error);
        return NextResponse.json({ error: 'Failed to verify fee' }, { status: 500 });
      }

      return NextResponse.json({ success: true, fee: data });
    }

    if (action === 'mark_reminder_sent') {
      const { data, error } = await client
        .from('fees')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', fee_id)
        .select('*')
        .single();

      if (error) {
        console.error('Update fee error:', error);
        return NextResponse.json({ error: 'Failed to update fee' }, { status: 500 });
      }

      return NextResponse.json({ success: true, fee: data });
    }

    if (action === 'mark_warning_sent') {
      const { data, error } = await client
        .from('fees')
        .update({ warning_sent_at: new Date().toISOString() })
        .eq('id', fee_id)
        .select('*')
        .single();

      if (error) {
        console.error('Update fee error:', error);
        return NextResponse.json({ error: 'Failed to update fee' }, { status: 500 });
      }

      return NextResponse.json({ success: true, fee: data });
    }

    const { data, error } = await client
      .from('fees')
      .update({
        status: 'unpaid',
        payment_proof_url: null,
        payment_reference: null,
        payment_method: null,
        paid_at: null,
        admin_notes: admin_notes || null,
      })
      .eq('id', fee_id)
      .select('*')
      .single();

    if (error) {
      console.error('Reject fee error:', error);
      return NextResponse.json({ error: 'Failed to reject fee' }, { status: 500 });
    }

    return NextResponse.json({ success: true, fee: data });
  } catch (error) {
    console.error('Update fee error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
