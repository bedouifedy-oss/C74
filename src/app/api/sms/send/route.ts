import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint has been deprecated (mock-only SMS send).' },
    { status: 410 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'This endpoint has been deprecated (mock-only SMS send).' },
    { status: 410 }
  );
}
