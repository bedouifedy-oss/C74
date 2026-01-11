import { NextRequest, NextResponse } from 'next/server';

type AdminIssueJob = {
  id: string;
  customer_id?: string;
  worker_id?: string;
  category?: string;
  description?: string;
  status?: string;
};

type AdminIssueUser = {
  id: string;
  name?: string;
  phone?: string;
};

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint has been deprecated (mock-only issues list).' },
    { status: 410 }
  );
}
