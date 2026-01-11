import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function GET(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'worker' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Worker access required' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const workerId = session.user_id;
    const { data, error } = await client
      .from('fees')
      .select('*')
      .eq('worker_id', workerId)
      .order('period_start', { ascending: false });

    if (error) {
      console.error('Get my invoices error:', error);
      return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 });
    }

    const now = new Date();
    const fees = data || [];
    const invoices = fees.map((f: any) => {
      const due = f.due_date ? new Date(f.due_date) : null;
      const daysUntilDue = due ? Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

      return {
        id: f.id,
        weekStart: f.period_start,
        weekEnd: f.period_end,
        jobs: [],
        totalEarnings: 0,
        totalFees: Number(f.amount_due || 0),
        status: f.status,
        dueDate: f.due_date,
        daysUntilDue,
        reminderSentAt: f.reminder_sent_at || undefined,
        warningSentAt: f.warning_sent_at || undefined,
        paidAt: f.paid_at || undefined,
        paymentProofUrl: f.payment_proof_url || undefined,
        paymentReference: f.payment_reference || undefined,
      };
    });

    const totalFees = fees.length;
    const paidFees = fees.filter((fee: any) => fee.status === 'paid').length;
    const pendingFees = fees.filter((fee: any) => fee.status === 'unpaid' || fee.status === 'overdue').length;
    const pendingVerificationFees = fees.filter((fee: any) => fee.status === 'pending_verification').length;

    const totalPaid = fees
      .filter((fee: any) => fee.status === 'paid')
      .reduce((sum: number, fee: any) => sum + Number(fee.amount_due || 0), 0);

    const totalOwed = fees
      .filter((fee: any) => fee.status !== 'paid')
      .reduce((sum: number, fee: any) => sum + Number(fee.amount_due || 0), 0);

    return NextResponse.json({
      success: true,
      fees,
      invoices,
      summary: {
        total_fees: totalFees,
        paid_fees: paidFees,
        pending_fees: pendingFees,
        pending_verification_fees: pendingVerificationFees,
        total_paid: totalPaid,
        total_owed: totalOwed,
        currency: 'TND'
      }
    });

  } catch (error) {
    console.error('Get my invoices error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
