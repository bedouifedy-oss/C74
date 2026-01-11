import { NextRequest, NextResponse } from 'next/server';

type Worker = {
  id: string;
  status: string;
};

type Fee = {
  id: string;
  worker_id: string;
  period: string;
};

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint has been deprecated (mock-only cron: weekly-invoices).' },
    { status: 410 }
  );
}
