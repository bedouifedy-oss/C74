import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint has been deprecated (mock-only cron: weekly-reports).' },
    { status: 410 }
  );
}
