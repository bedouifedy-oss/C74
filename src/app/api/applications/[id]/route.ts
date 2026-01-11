import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return NextResponse.json(
    { error: 'This endpoint has been deprecated. Use /api/applications/[id]/accept or /reject.' },
    { status: 410 }
  );
}
