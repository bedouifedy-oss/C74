import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

function mapDisputeStatus(status: string): 'open' | 'under_review' | 'resolved' {
  if (status === 'open') return 'open';
  if (status === 'investigating') return 'under_review';
  return 'resolved';
}

function mapDisputeType(type: string): 'quality' | 'payment' | 'no_show' | 'damage' | 'other' {
  if (type === 'quality') return 'quality';
  if (type === 'payment') return 'payment';
  if (type === 'no_show') return 'no_show';
  if (type === 'damage') return 'damage';
  return 'other';
}

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = client
      .from('disputes')
      .select(
        `
        id,
        job_id,
        opened_by,
        issue_type,
        description,
        status,
        resolution,
        opened_at,
        resolved_at,
        job:jobs(
          id,
          category,
          description,
          customer_id,
          worker_id,
          customer:users!jobs_customer_id_fkey(id, name),
          worker:workers!jobs_worker_id_fkey(
            id,
            users!workers_id_fkey(id, name)
          )
        ),
        reporter:users!disputes_opened_by_fkey(id, name)
      `
      )
      .order('opened_at', { ascending: false });

    if (status && status !== 'all') {
      if (status === 'under_review') {
        query = query.eq('status', 'investigating');
      } else if (status === 'resolved') {
        query = query.in('status', ['resolved', 'closed']);
      } else {
        query = query.eq('status', status);
      }
    }

    query = query.limit(limit);
    const { data, error } = await query;

    if (error) {
      console.error('Get admin disputes error:', error);
      return NextResponse.json({ success: true, disputes: [], total: 0 });
    }

    const disputes = (data || []).map((d: any) => {
      const job = d.job;
      const customerId = job?.customer_id;
      const workerUserId = job?.worker?.users?.[0]?.id;

      const reporterRole: 'customer' | 'worker' =
        d.opened_by && d.opened_by === customerId ? 'customer' : 'worker';

      const accusedName =
        reporterRole === 'customer'
          ? job?.worker?.users?.[0]?.name || 'Unknown'
          : job?.customer?.name || 'Unknown';

      const category = job?.category || 'job';
      const jobTitle = `${category} - ${String(job?.description || '').slice(0, 40)}`;

      return {
        id: d.id,
        jobId: d.job_id,
        jobTitle,
        reporterName: d.reporter?.name || 'Unknown',
        reporterRole,
        accusedName,
        type: mapDisputeType(String(d.issue_type || 'other')),
        description: d.description,
        evidenceUrls: [],
        status: mapDisputeStatus(String(d.status || 'open')),
        resolution: d.resolution || undefined,
        createdAt: d.opened_at,
        resolvedAt: d.resolved_at || undefined,
        _internal: {
          customer_id: customerId,
          worker_user_id: workerUserId,
        },
      };
    });

    return NextResponse.json({
      success: true,
      disputes,
      total: disputes.length,
    });
  } catch (error) {
    console.error('Get admin disputes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
    const { dispute_id, action, resolution } = body;

    if (!dispute_id || !action) {
      return NextResponse.json({ error: 'Missing required fields: dispute_id, action' }, { status: 400 });
    }

    const now = new Date().toISOString();

    if (action === 'start_review') {
      const { data, error } = await client
        .from('disputes')
        .update({ status: 'investigating' })
        .eq('id', dispute_id)
        .select('id, status')
        .single();

      if (error) {
        console.error('Update dispute error:', error);
        return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 });
      }

      return NextResponse.json({ success: true, dispute: data });
    }

    if (action === 'resolve') {
      if (!resolution) {
        return NextResponse.json({ error: 'Missing required field: resolution' }, { status: 400 });
      }

      const { data, error } = await client
        .from('disputes')
        .update({ status: 'resolved', resolution, resolved_at: now })
        .eq('id', dispute_id)
        .select('id, status, resolution, resolved_at')
        .single();

      if (error) {
        console.error('Resolve dispute error:', error);
        return NextResponse.json({ error: 'Failed to resolve dispute' }, { status: 500 });
      }

      return NextResponse.json({ success: true, dispute: data });
    }

    if (action === 'close') {
      const { data, error } = await client
        .from('disputes')
        .update({ status: 'closed', resolved_at: now })
        .eq('id', dispute_id)
        .select('id, status, resolved_at')
        .single();

      if (error) {
        console.error('Close dispute error:', error);
        return NextResponse.json({ error: 'Failed to close dispute' }, { status: 500 });
      }

      return NextResponse.json({ success: true, dispute: data });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Update dispute error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
