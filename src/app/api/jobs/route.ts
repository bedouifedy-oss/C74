import { NextRequest, NextResponse } from 'next/server';
import { createJob, getAvailableJobs, getJobs, getWorkerProfile } from '@/lib/db';
import { isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

// Global store for fallback when no database
declare global {
  var jobs: Record<string, any> | undefined;
  var applications: Record<string, any> | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'customer') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { 
      category, 
      description, 
      address, 
      address_details, 
      photos, 
      inspection_required, 
      price_after_inspection, 
      preferred_date, 
      preferred_time_slot 
    } = body;

    // Validate required fields according to Fixy spec
    if (!category || !description || !address || !preferred_date) {
      return NextResponse.json(
        { error: 'Missing required fields: category, description, address, preferred_date' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['plumbing', 'electrical', 'ac', 'cleaning'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    const created = await createJob({
      customer_id: session.user_id,
      category,
      description,
      address,
      address_details: address_details || '',
      scheduled_date: preferred_date,
      scheduled_time_slot: preferred_time_slot || 'morning',
      inspection_required: inspection_required || false,
      price_after_inspection: price_after_inspection || false,
    });

    return NextResponse.json({
      success: true,
      message: 'Job posted successfully. Workers will be notified.',
      job: {
        id: created.id,
        category: created.category,
        description: created.description,
        address: created.address,
        address_details: created.address_details,
        photos: photos || [],
        inspection_required: created.inspection_required,
        price_after_inspection: created.price_after_inspection,
        preferred_date: created.scheduled_date,
        preferred_time_slot: created.scheduled_time_slot,
        status: created.status,
        customer_id: created.customer_id,
        customer_name: '',
        customer_phone: session.phone || '',
        created_at: created.created_at,
        updated_at: created.updated_at || created.created_at,
        applicant_count: 0,
      },
    });

  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let jobs: any[] = [];
    let total = 0;

    if (session.role === 'worker') {
      const worker = await getWorkerProfile(session.user_id);
      if (!worker) {
        return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
      }
      jobs = await getAvailableJobs(session.user_id, worker.category);
      if (category) {
        jobs = jobs.filter((j: any) => j.category === category);
      }
      total = jobs.length;
      jobs = jobs.slice(offset, offset + limit);
    } else {
      const result = await getJobs({
        customer_id: session.role === 'customer' ? session.user_id : undefined,
        category,
        status,
        limit,
        offset,
      });
      jobs = result.jobs;
      total = result.total;
    }

    const formattedJobs = jobs.map((j: any) => ({
      id: j.id,
      category: j.category,
      description: j.description,
      address: j.address,
      address_details: j.address_details,
      status: j.status,
      customer_id: j.customer_id,
      customer_name: j.customer?.name || 'Unknown',
      worker_name: j.worker?.users?.name || null,
      preferred_date: j.scheduled_date,
      preferred_time_slot: j.scheduled_time_slot,
      price_agreed: j.price_agreed,
      created_at: j.created_at,
      updated_at: j.updated_at,
      applicant_count: j.applicant_count || 0,
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      total,
      limit,
      offset,
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
