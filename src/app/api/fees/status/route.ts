import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

type Fee = {
  id: string;
  worker_id: string;
  amount: number;
  status: string;
  due_date: string;
  created_at: string;
  period?: string;
};

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

    const { data: fees, error: feesError } = await client
      .from('fees')
      .select('id, worker_id, amount_due, status, due_date, created_at, period_start, period_end')
      .eq('worker_id', workerId);

    if (feesError) {
      console.error('Get fee status error:', feesError);
      return NextResponse.json({ error: 'Failed to load fees' }, { status: 500 });
    }

    const workerFees = (fees || []).map((f: any) => ({
      id: f.id,
      worker_id: f.worker_id,
      amount: Number(f.amount_due || 0),
      status: f.status,
      due_date: f.due_date,
      created_at: f.created_at,
      period: `${f.period_start}..${f.period_end}`,
    })) as Fee[];
    
    // Calculate current balance and outstanding invoices
    const outstandingFees = workerFees.filter((fee) => fee.status !== 'paid');
    const totalOutstanding = outstandingFees.reduce((sum, fee) => sum + fee.amount, 0);
    
    // Find next action date
    const now = new Date();
    let nextAction = 'none';
    let daysUntilAction = null;
    let timeline: Record<string, string> = {};
    
    if (outstandingFees.length > 0) {
      // Find the earliest due date
      const earliestDue = outstandingFees.reduce((earliest, fee) => {
        const dueDate = new Date(fee.due_date);
        const earliestDate = new Date(earliest.due_date);
        return dueDate < earliestDate ? fee : earliest;
      });
      
      const dueDate = new Date(earliestDue.due_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Create timeline
      const invoiceCreated = new Date(earliestDue.created_at);
      const reminderDate = new Date(invoiceCreated);
      reminderDate.setDate(reminderDate.getDate() + 7);
      
      const warningDate = new Date(earliestDue.due_date);
      warningDate.setDate(warningDate.getDate() - 7);
      
      const suspensionDate = new Date(earliestDue.due_date);
      suspensionDate.setDate(suspensionDate.getDate() + 7);
      
      timeline = {
        invoice_created: invoiceCreated.toISOString().split('T')[0],
        reminder_date: reminderDate.toISOString().split('T')[0],
        warning_date: warningDate.toISOString().split('T')[0],
        suspension_date: suspensionDate.toISOString().split('T')[0],
      };
      
      // Determine next action
      if (daysUntilDue < 0) {
        const daysOverdue = Math.abs(daysUntilDue);
        if (daysOverdue <= 7) {
          nextAction = 'suspension_imminent';
          daysUntilAction = 7 - daysOverdue;
        } else {
          nextAction = 'suspended';
          daysUntilAction = 0;
        }
      } else if (daysUntilDue <= 7) {
        nextAction = 'warning';
        daysUntilAction = daysUntilDue;
      } else if (daysUntilDue <= 21) {
        nextAction = 'reminder';
        daysUntilAction = daysUntilDue - 7;
      } else {
        nextAction = 'reminder';
        daysUntilAction = daysUntilDue - 7;
      }
    }
    
    // Determine account status
    let accountStatus = 'active';
    const { data: user } = await client
      .from('users')
      .select('suspended_until')
      .eq('id', workerId)
      .maybeSingle();

    if (user?.suspended_until) {
      const suspensionEnd = new Date(user.suspended_until);
      if (suspensionEnd > now) {
        accountStatus = 'suspended';
      }
    }
    
    // Payment methods (Tunisia-specific)
    const paymentMethods = [
      {
        name: 'D17',
        instructions: 'Transfer to: 12345678',
        icon: '📱'
      },
      {
        name: 'Flouci',
        instructions: 'Transfer to: +216XXXXXXXX',
        icon: '💳'
      },
      {
        name: 'Bank Wire',
        instructions: 'Bank transfer details available on request',
        icon: '🏦'
      },
      {
        name: 'Mandat Postal',
        instructions: 'Send to platform address',
        icon: '📬'
      }
    ];

    return NextResponse.json({
      success: true,
      current_balance: -totalOutstanding, // Negative means owed
      outstanding_invoices: outstandingFees.length,
      account_status: accountStatus,
      days_until_action: daysUntilAction,
      next_action: nextAction,
      timeline,
      payment_methods: paymentMethods,
      summary: {
        total_fees: workerFees.length,
        paid_fees: workerFees.filter((fee: any) => fee.status === 'paid').length,
        pending_fees: workerFees.filter((fee: any) => fee.status === 'pending').length,
        pending_verification_fees: workerFees.filter((fee: any) => fee.status === 'pending_verification').length,
        total_paid: workerFees
          .filter((fee: any) => fee.status === 'paid')
          .reduce((sum: number, fee: any) => sum + fee.amount, 0),
        total_owed: totalOutstanding,
        currency: 'TND'
      },
      recent_fees: workerFees
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map((fee) => ({
          id: fee.id,
          period: fee.period,
          amount: fee.amount,
          status: fee.status,
          due_date: fee.due_date,
          days_until_due: Math.ceil((new Date(fee.due_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        }))
    });

  } catch (error) {
    console.error('Get fee status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
