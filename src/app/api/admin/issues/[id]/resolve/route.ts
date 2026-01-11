import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json(
    { error: 'This endpoint has been deprecated (mock-only admin issue resolution).' },
    { status: 410 }
  );
}
