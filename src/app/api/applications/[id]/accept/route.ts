import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseReady, createServerSupabaseClient } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: applicationId } = await params;

    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'customer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Validate application ID
    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    const { data: application, error: appError } = await client
      .from('job_applications')
      .select('id, job_id, worker_id, status')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, customer_id, status')
      .eq('id', application.job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.customer_id !== session.user_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (job.status !== 'requested') {
      return NextResponse.json({ error: 'Job is not open for applications' }, { status: 400 });
    }

    // Mark accepted application
    const { error: acceptError } = await client
      .from('job_applications')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (acceptError) {
      console.error('Error accepting application:', acceptError);
      return NextResponse.json({ error: 'Failed to accept application' }, { status: 500 });
    }

    // Reject other applications for this job
    await client
      .from('job_applications')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('job_id', application.job_id)
      .neq('id', applicationId)
      .eq('status', 'pending');

    // Assign worker to job
    const { error: jobUpdateError } = await client
      .from('jobs')
      .update({
        worker_id: application.worker_id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', application.job_id);

    if (jobUpdateError) {
      console.error('Error assigning worker to job:', jobUpdateError);
      return NextResponse.json({ error: 'Failed to assign worker' }, { status: 500 });
    }

    await client.from('notifications').insert({
      user_id: application.worker_id,
      type: 'application',
      title: 'Application Accepted',
      message: 'Your application was accepted',
      data: { jobId: application.job_id, applicationId: application.id },
      read: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Application accepted successfully',
      status: 'accepted'
    });

  } catch (error) {
    console.error('Application accept error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
