import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const body = await request.json();
    const { amount, notes } = body;

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

    // Validate required fields
    if (amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required field: amount' },
        { status: 400 }
      );
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, status, customer_id, worker_id, negotiation_count, max_negotiations')
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

    if (!['requested', 'accepted', 'in_progress'].includes(job.status)) {
      return NextResponse.json(
        { error: 'Price negotiation not available in current job status' },
        { status: 400 }
      );
    }

    const MAX_NEGOTIATIONS = Number(job.max_negotiations || 3);
    const currentCount = Number(job.negotiation_count || 0);

    if (currentCount >= MAX_NEGOTIATIONS) {
      return NextResponse.json(
        {
          error: 'NEGOTIATION_LIMIT_REACHED',
          message: `Negotiation limit reached (${MAX_NEGOTIATIONS} attempts)`,
          negotiation_count: currentCount,
          max_negotiations: MAX_NEGOTIATIONS,
          status: 'closed',
        },
        { status: 400 }
      );
    }

    const { data: last, error: lastError } = await client
      .from('price_negotiations')
      .select('id, proposed_by, status')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastError) {
      console.error('Price negotiation last fetch error:', lastError);
      return NextResponse.json({ error: 'Failed to propose price' }, { status: 500 });
    }

    if (last && last.status === 'pending' && last.proposed_by === session.user_id) {
      return NextResponse.json(
        {
          error: 'INVALID_NEGOTIATION_TURN',
          message: 'Waiting for response from other party',
          last_proposal_by: last.proposed_by,
          status: 'waiting_for_response',
        },
        { status: 400 }
      );
    }

    if (last && last.status === 'pending' && last.proposed_by !== session.user_id) {
      const { error: counterError } = await client
        .from('price_negotiations')
        .update({ status: 'countered' })
        .eq('id', last.id);
      if (counterError) {
        console.error('Counter previous negotiation error:', counterError);
      }
    }

    const now = new Date().toISOString();
    const { data: created, error: createError } = await client
      .from('price_negotiations')
      .insert({
        job_id: jobId,
        proposed_by: session.user_id,
        amount,
        notes: notes || null,
        status: 'pending',
        created_at: now,
      })
      .select('id, amount, proposed_by, status, created_at')
      .single();

    if (createError || !created) {
      console.error('Price negotiation create error:', createError);
      return NextResponse.json({ error: 'Failed to propose price' }, { status: 500 });
    }

    const newCount = currentCount + 1;
    const isFinalNegotiation = newCount >= MAX_NEGOTIATIONS;

    const { error: updateJobError } = await client
      .from('jobs')
      .update({
        negotiation_count: newCount,
        negotiation_closed_at: isFinalNegotiation ? now : null,
        negotiation_closed_reason: isFinalNegotiation ? 'limit_reached' : null,
        updated_at: now,
      })
      .eq('id', jobId);

    if (updateJobError) {
      console.error('Update job negotiation_count error:', updateJobError);
    }

    // In production, this would:
    // - Send notification to the other party
    // - Update UI to show remaining negotiations
    // - Handle final negotiation logic
    
    return NextResponse.json({
      success: true,
      message: 'Price proposal sent successfully',
      message_translations: {
        'ar-TN': 'تم إرسال اقتراح السعر بنجاح',
        'fr': 'Proposition de prix envoyée avec succès',
        'en': 'Price proposal sent successfully'
      },
      negotiation: {
        id: created.id,
        amount: created.amount,
        proposed_by: created.proposed_by,
        status: created.status,
        created_at: created.created_at
      },
      job: {
        id: jobId,
        negotiation_count: newCount,
        max_negotiations: MAX_NEGOTIATIONS,
        remaining_negotiations: MAX_NEGOTIATIONS - newCount,
        proposed_price: created.amount,
        status: job.status,
        is_final_negotiation: isFinalNegotiation
      }
    });

  } catch (error) {
    console.error('Price proposal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
