import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseReady, createServerSupabaseClient } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function POST(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'worker') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { job_id, message, proposed_budget, proposed_price } = body;

    // Validate input
    if (!job_id) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const proposed = Number(proposed_budget ?? proposed_price);
    if (!Number.isFinite(proposed) || proposed <= 0) {
      return NextResponse.json(
        { error: 'Invalid proposed budget' },
        { status: 400 }
      );
    }

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, status, customer_id, category')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status !== 'requested') {
      return NextResponse.json({ error: 'Job is not open for applications' }, { status: 400 });
    }

    const { data: created, error: createError } = await client
      .from('job_applications')
      .insert({
        job_id,
        worker_id: session.user_id,
        proposed_price: proposed,
        message: message || null,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      const msg = (createError as any)?.message || 'Failed to submit application';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    await client.from('notifications').insert({
      user_id: job.customer_id,
      type: 'application',
      title: 'New Application',
      message: `A worker applied for your ${job.category} job`,
      data: { jobId: job_id, applicationId: created.id },
      read: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      application_id: created.id,
      status: created.status,
      message: 'Application submitted successfully',
    });

  } catch (error) {
    console.error('Job application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let jobIds: string[] | null = null;
    if (session.role === 'customer') {
      const { data: jobs, error: jobsError } = await client
        .from('jobs')
        .select('id')
        .eq('customer_id', session.user_id);

      if (jobsError) {
        console.error('Error fetching customer jobs:', jobsError);
        return NextResponse.json({ error: 'Failed to load customer jobs' }, { status: 500 });
      }

      jobIds = (jobs || []).map((j: any) => j.id);
      if (jobIds.length === 0) {
        return NextResponse.json({ applications: [], total: 0, limit, offset });
      }
    }

    let query = client
      .from('jobs')
      .select(
        `
        *,
        customer:users!jobs_customer_id_fkey(name, phone, email),
        worker:workers!jobs_worker_id_fkey(
          id,
          rating_avg,
          completed_jobs_count,
          users!workers_id_fkey(name, phone, email)
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (session.role === 'worker') {
      query = query.eq('worker_id', session.user_id);
    } else if (session.role === 'customer' && jobIds) {
      query = query.in('id', jobIds);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: 'Failed to load applications' }, { status: 500 });
    }

    const applications = (data || []).map((app: any) => ({
      id: app.id,
      job_id: app.id,
      job_title: app.description || '',
      job_category: app.category || null,
      job_location: app.address || null,
      job_budget: app.price_estimate || 0,
      worker_id: app.worker_id,
      worker_name: app.worker?.users?.name || null,
      worker_phone: app.worker?.users?.phone || null,
      worker_email: app.worker?.users?.email || null,
      worker_rating: app.worker?.rating_avg || null,
      worker_completed_jobs: app.worker?.completed_jobs_count || 0,
      message: app.description || null,
      proposed_budget: app.price_agreed || 0,
      status: app.status,
      created_at: app.created_at,
    }));

    return NextResponse.json({
      applications,
      total: count || 0,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
