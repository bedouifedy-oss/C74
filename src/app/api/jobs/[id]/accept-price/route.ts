import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'customer' && session.role !== 'worker' && session.role !== 'admin') {
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
    const { negotiation_id } = body;

    // Validate required fields
    if (!negotiation_id) {
      return NextResponse.json(
        { error: 'Missing required field: negotiation_id' },
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

    const isParticipant =
      session.role === 'admin' ||
      job.customer_id === session.user_id ||
      job.worker_id === session.user_id;

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: negotiation, error: negotiationError } = await client
      .from('price_negotiations')
      .select('id, job_id, proposed_by, amount, status')
      .eq('id', negotiation_id)
      .eq('job_id', jobId)
      .single();

    if (negotiationError || !negotiation) {
      return NextResponse.json({ error: 'Price proposal not found' }, { status: 404 });
    }

    if (negotiation.status !== 'pending') {
      return NextResponse.json({ error: 'Price proposal is not pending' }, { status: 400 });
    }

    if (session.role !== 'admin' && negotiation.proposed_by === session.user_id) {
      return NextResponse.json({ error: 'Cannot accept your own proposal' }, { status: 400 });
    }

    const now = new Date().toISOString();

    const { error: acceptError } = await client
      .from('price_negotiations')
      .update({ status: 'accepted' })
      .eq('id', negotiation_id);

    if (acceptError) {
      console.error('Accept price error:', acceptError);
      return NextResponse.json({ error: 'Failed to accept price' }, { status: 500 });
    }

    const { error: rejectOthersError } = await client
      .from('price_negotiations')
      .update({ status: 'rejected' })
      .eq('job_id', jobId)
      .neq('id', negotiation_id)
      .eq('status', 'pending');

    if (rejectOthersError) {
      console.error('Reject other price negotiations error:', rejectOthersError);
    }

    const { error: updateJobError } = await client
      .from('jobs')
      .update({
        price_agreed: negotiation.amount,
        price_agreed_at: now,
        status: 'scheduled',
        negotiation_closed_at: now,
        negotiation_closed_reason: 'accepted',
        updated_at: now,
      })
      .eq('id', jobId);

    if (updateJobError) {
      console.error('Update job price agreed error:', updateJobError);
      return NextResponse.json({ error: 'Failed to update job price' }, { status: 500 });
    }

    // In production, this would:
    // - Notify both parties of price agreement
    // - Update job status to scheduled
    // - Send calendar invitations
    // - Prepare for job execution
    
    return NextResponse.json({
      job_status: 'scheduled',
      price_agreed: negotiation.amount,
      price_agreed_at: now,
      message: 'Price agreement confirmed. Job is now scheduled.',
    });

  } catch (error) {
    console.error('Accept price error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
