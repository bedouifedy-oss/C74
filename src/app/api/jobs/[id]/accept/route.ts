import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'customer' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { id: jobId } = await params;
    const body = await request.json();
    const { worker_id, action } = body; // action can be 'accept' or 'reject'

    // Validate required fields
    if (!worker_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: worker_id, action' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be accept or reject' },
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

    if (session.role !== 'admin' && job.customer_id !== session.user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (job.status !== 'requested') {
      return NextResponse.json(
        { error: 'Job cannot be accepted/rejected in current status' },
        { status: 400 }
      );
    }

    if (action === 'accept') {
      const { data: worker, error: workerError } = await client
        .from('workers')
        .select('id')
        .eq('id', worker_id)
        .maybeSingle();

      if (workerError) {
        console.error('Worker lookup error:', workerError);
        return NextResponse.json({ error: 'Failed to verify worker' }, { status: 500 });
      }

      if (!worker) {
        return NextResponse.json({ error: 'Worker not found' }, { status: 400 });
      }

      const now = new Date().toISOString();
      const { data: updated, error: updateError } = await client
        .from('jobs')
        .update({
          worker_id,
          status: 'accepted',
          accepted_at: now,
          updated_at: now,
        })
        .eq('id', jobId)
        .select('id, status, worker_id, accepted_at')
        .single();

      if (updateError || !updated) {
        console.error('Job accept error:', updateError);
        return NextResponse.json({ error: 'Failed to assign worker' }, { status: 500 });
      }

      return NextResponse.json({
        status: updated.status,
        message: 'Worker assigned to job.',
        job_id: updated.id,
        worker_id: updated.worker_id,
        accepted_at: updated.accepted_at,
      });
    }

    if (action === 'reject') {
      const now = new Date().toISOString();
      const { data: updated, error: updateError } = await client
        .from('jobs')
        .update({
          worker_id: null,
          status: 'requested',
          updated_at: now,
        })
        .eq('id', jobId)
        .select('id, status')
        .single();

      if (updateError || !updated) {
        console.error('Job reject error:', updateError);
        return NextResponse.json({ error: 'Failed to unassign worker' }, { status: 500 });
      }

      return NextResponse.json({
        status: updated.status,
        message: 'Worker unassigned from job.',
        job_id: updated.id,
      });
    }

  } catch (error) {
    console.error('Job accept/reject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
