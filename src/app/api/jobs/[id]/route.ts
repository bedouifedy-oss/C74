import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseReady, createServerSupabaseClient } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';
import { updateJobStatus } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;

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

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const { data: job, error } = await client
      .from('jobs')
      .select(
        `
        *,
        customer:users!jobs_customer_id_fkey(id, name, phone),
        worker:workers!jobs_worker_id_fkey(
          id,
          category,
          rating_avg,
          completed_jobs_count,
          users!workers_id_fkey(id, name, phone)
        ),
        job_photos(*),
        applications:job_applications!job_applications_job_id_fkey(
          id,
          job_id,
          worker_id,
          proposed_price,
          message,
          status,
          created_at,
          worker:workers!job_applications_worker_id_fkey(
            id,
            rating_avg,
            completed_jobs_count,
            users!workers_id_fkey(name)
          )
        )
      `
      )
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const canView =
      session.role === 'admin' ||
      job.customer_id === session.user_id ||
      job.worker_id === session.user_id ||
      (session.role === 'worker' && job.status === 'requested' && !job.worker_id);

    if (!canView) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const formatted = {
      id: job.id,
      category: job.category,
      description: job.description,
      address: job.address,
      address_details: job.address_details,
      photos: (job.job_photos || []).map((p: any) => p.file_url),
      inspection_required: job.inspection_required,
      price_after_inspection: job.price_after_inspection,
      preferred_date: job.scheduled_date,
      preferred_time_slot: job.scheduled_time_slot,
      status: job.status,
      customer_id: job.customer_id,
      customer_name: job.customer?.name || 'Unknown',
      customer_phone: job.customer?.phone || null,
      worker_id: job.worker_id,
      worker_name: job.worker?.users?.name || null,
      worker_phone: job.worker?.users?.phone || null,
      worker_rating: job.worker?.rating_avg || null,
      price_agreed: job.price_agreed || null,
      created_at: job.created_at,
      updated_at: job.updated_at,
      applicant_count: (job.applications || []).length,
      applications: (job.applications || []).map((a: any) => ({
        id: a.id,
        worker_id: a.worker_id,
        worker_name: a.worker?.users?.name || null,
        worker_rating: a.worker?.rating_avg || null,
        worker_completed_jobs: a.worker?.completed_jobs_count || 0,
        proposed_price: a.proposed_price,
        message: a.message,
        status: a.status,
        created_at: a.created_at,
      })),
    };

    return NextResponse.json({ job: formatted });
  } catch (error) {
    console.error('Get job error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const { status } = await request.json();

    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'customer' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Validate job ID
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const statusMap: Record<string, string> = {
      open: 'requested',
      in_progress: 'in_progress',
      completed: 'completed',
      cancelled: 'cancelled',
    };

    const mappedStatus = statusMap[status] || status;
    const validStatuses = ['requested', 'accepted', 'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show', 'disputed'];
    if (!validStatuses.includes(mappedStatus)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, customer_id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && job.customer_id !== session.user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await updateJobStatus(jobId, mappedStatus);

    return NextResponse.json({
      message: 'Job status updated successfully',
      job: updated,
    });

  } catch (error) {
    console.error('Job status update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
