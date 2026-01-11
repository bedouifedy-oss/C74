import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;

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

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select(
        'id, status, customer_id, worker_id, negotiation_count, max_negotiations, negotiation_closed_at, negotiation_closed_reason, price_estimate, price_agreed'
      )
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

    const MAX_NEGOTIATIONS = 3;
    const negotiationCount = Number(job.negotiation_count || 0);
    const remainingNegotiations = MAX_NEGOTIATIONS - negotiationCount;

    const { data: negotiations, error: negError } = await client
      .from('price_negotiations')
      .select('id, amount, proposed_by, status, notes, created_at')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (negError) {
      console.error('Get negotiation status error:', negError);
      return NextResponse.json({ error: 'Failed to load negotiations' }, { status: 500 });
    }
    
    // Determine if negotiation is available
    const canNegotiate = negotiationCount < MAX_NEGOTIATIONS && 
                         ['requested', 'accepted', 'in_progress'].includes(job.status);
    
    // Check if waiting for response from other party
    const lastNegotiation = (negotiations || [])[negotiations.length - 1];
    const isWaitingForResponse =
      !!lastNegotiation && lastNegotiation.status === 'pending' && lastNegotiation.proposed_by === session.user_id;

    const hasPendingLast = !!lastNegotiation && lastNegotiation.status === 'pending';
    const nextTurn = hasPendingLast
      ? (lastNegotiation.proposed_by === job.customer_id ? 'worker' : 'customer')
      : null;

    return NextResponse.json({
      success: true,
      job: {
        id: jobId,
        status: job.status,
        negotiation_count: negotiationCount,
        max_negotiations: MAX_NEGOTIATIONS,
        remaining_negotiations: Math.max(0, remainingNegotiations),
        can_negotiate: canNegotiate && !isWaitingForResponse,
        is_waiting_for_response: isWaitingForResponse,
        last_proposal_by: lastNegotiation?.proposed_by || null,
        last_proposal_role: lastNegotiation
          ? (lastNegotiation.proposed_by === job.customer_id ? 'customer' : 'worker')
          : null,
        proposed_price: lastNegotiation?.amount || null,
        original_price: job.price_estimate || null,
        negotiation_closed: !!job.negotiation_closed_at,
        negotiation_closed_reason: job.negotiation_closed_reason || null,
        negotiation_closed_at: job.negotiation_closed_at || null
      },
      negotiations: (negotiations || []).map((neg: any) => ({
        id: neg.id,
        amount: neg.amount,
        proposed_by: neg.proposed_by,
        proposed_by_role: neg.proposed_by === job.customer_id ? 'customer' : 'worker',
        status: neg.status,
        notes: neg.notes,
        created_at: neg.created_at
      })),
      summary: {
        total_negotiations: negotiationCount,
        remaining_negotiations: Math.max(0, remainingNegotiations),
        is_limit_reached: negotiationCount >= MAX_NEGOTIATIONS,
        can_propose: canNegotiate && !isWaitingForResponse,
        next_turn: nextTurn
      }
    });

  } catch (error) {
    console.error('Get negotiation status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
