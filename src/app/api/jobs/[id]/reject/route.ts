import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const body = await request.json();
    const { worker_id, reason, notes } = body;

    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'worker' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Validate required fields
    if (!worker_id || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: worker_id, reason' },
        { status: 400 }
      );
    }

    // Validate rejection reason
    const validReasons = ['too_far', 'not_available', 'out_of_scope', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Invalid rejection reason' },
        { status: 400 }
      );
    }

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, status, customer_id, worker_id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && job.worker_id !== session.user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!['accepted', 'scheduled', 'requested'].includes(job.status)) {
      return NextResponse.json({ error: 'Job cannot be rejected in current status' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const { error: updateError } = await client
      .from('jobs')
      .update({
        worker_id: null,
        status: 'requested',
        cancellation_reason: notes || reason,
        cancelled_by: session.role === 'admin' ? 'admin' : 'worker',
        cancelled_at: now,
        updated_at: now,
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Job reject error:', updateError);
      return NextResponse.json({ error: 'Failed to reject job' }, { status: 500 });
    }

    // In production, this would:
    // - Notify customer of rejection
    // - Keep job open for other workers
    // - Log rejection for worker analytics
    return NextResponse.json({
      status: 'requested',
      message: 'Job rejected.',
      job_id: jobId,
      worker_id: session.user_id,
      rejected_at: now,
    });

  } catch (error) {
    console.error('Job reject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
