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

    const { error: rejectError } = await client
      .from('job_applications')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (rejectError) {
      console.error('Error rejecting application:', rejectError);
      return NextResponse.json({ error: 'Failed to reject application' }, { status: 500 });
    }

    await client.from('notifications').insert({
      user_id: application.worker_id,
      type: 'application',
      title: 'Application Rejected',
      message: 'Your application was rejected',
      data: { jobId: application.job_id, applicationId: application.id },
      read: false,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Application rejected successfully',
      status: 'rejected'
    });

  } catch (error) {
    console.error('Application reject error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
