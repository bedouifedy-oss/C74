import { NextRequest, NextResponse } from 'next/server';
import { config, ValidationError, AuthenticationError } from '@/lib/config';

// Production-ready job API with database integration
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Deprecated API route. Use /api/jobs instead.' },
      { status: 410 }
    );

  } catch (error) {
    console.error('Get jobs error:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(config.responses.error(error.message, 400), { status: 400 });
    }
    
    return NextResponse.json(config.responses.serverError(), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Deprecated API route. Use /api/jobs instead.' },
      { status: 410 }
    );

  } catch (error) {
    console.error('Create job error:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(config.responses.validationError({
        [error.field || 'general']: error.message
      }), { status: 400 });
    }
    
    return NextResponse.json(config.responses.serverError(), { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Deprecated API route. Use /api/jobs instead.' },
      { status: 410 }
    );

  } catch (error) {
    console.error('Update job error:', error);
    
    if (error instanceof ValidationError) {
      return NextResponse.json(config.responses.error(error.message, 400), { status: 400 });
    }
    
    return NextResponse.json(config.responses.serverError(), { status: 500 });
  }
}
