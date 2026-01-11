import { NextRequest, NextResponse } from 'next/server';

// Fee type aligned with SQL migration (fixy-critical-fixes.sql)
type Fee = {
  id: string;
  worker_id: string;
  amount_due: number;
  created_at: string;
  status: 'unpaid' | 'overdue' | 'paid';
  grace_period_days: number;
  reminder_sent_at?: string;
  warning_sent_at?: string;
  suspension_scheduled_at?: string;
};

type User = {
  id: string;
  phone?: string;
  suspended_until?: string;
  suspension_reason?: string;
  can_reactivate?: boolean;
};

// Grace period timeline per Specs (30 days total)
const REMINDER_DAY = 7;
const WARNING_DAY = 21;
const SUSPENSION_DAY = 30;

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint has been deprecated (mock-only cron: check-overdue-fees).' },
    { status: 410 }
  );
}
