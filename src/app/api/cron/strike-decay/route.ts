import { NextRequest, NextResponse } from 'next/server';

type StrikeDecayUser = {
  id: string;
  strikes_count: number;
  last_strike_date?: string;
  recent_strikes?: unknown[];
  strike_decay_history?: Array<Record<string, unknown>>;
  updated_at?: string;
};

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint has been deprecated (mock-only cron: strike-decay).' },
    { status: 410 }
  );
}
