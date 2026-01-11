import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint has been deprecated (mock-only analytics).' },
    { status: 410 }
  );
}
