import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseReady, createServerSupabaseClient } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';
import { updateJobStatus } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const body = await request.json();
    const { status, completion_photos, completion_notes, cancelled_by, reason } = body;

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

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: 'Missing required field: status' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, customer_id, worker_id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const isParticipant =
      session.role === 'admin' ||
      job.customer_id === session.user_id ||
      job.worker_id === session.user_id;

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Role-based restrictions
    if (session.role !== 'admin') {
      if (status === 'cancelled' && session.role !== 'customer') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if ((status === 'in_progress' || status === 'completed') && session.role !== 'worker') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const additionalData: Record<string, unknown> = {};
    if (status === 'completed') {
      if (completion_notes) additionalData.completion_notes = completion_notes;
      // Photos are stored in job_photos table; keep placeholder support for now.
      if (completion_photos) additionalData.completion_photos = completion_photos;
    }
    if (status === 'cancelled') {
      if (cancelled_by) additionalData.cancelled_by = cancelled_by;
      if (reason) additionalData.cancellation_reason = reason;
    }

    const updated = await updateJobStatus(jobId, status, additionalData);

    // In production, this would:
    // - Send notifications to both parties
    // - Handle payment processing for completed jobs
    // - Trigger review system for completed jobs
    // - Handle dispute resolution for cancellations

    return NextResponse.json({
      job_id: jobId,
      status: updated.status,
      updated_at: updated.updated_at,
      message: `Job status updated to ${status}`,
    });

  } catch (error) {
    console.error('Update job status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
