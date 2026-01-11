import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    return NextResponse.json(
      { error: 'Deprecated endpoint. Use /api/jobs/[id]/report-issue instead.' },
      { status: 410 }
    );

  } catch (error) {
    console.error('Guarantee claim error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
