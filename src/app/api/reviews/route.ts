import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

// Global store for demo (in production, use database)
declare global {
  var reviews: Record<string, any> | undefined;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, workerId, rating, review, communication, punctuality, quality } = body;

    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'customer' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Validate input
    if (!jobId || !workerId || rating === undefined || !review) {
      return NextResponse.json(
        { error: 'Job ID, worker ID, rating, and review are required' },
        { status: 400 }
      );
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Validate sub-ratings
    const subRatings = { communication, punctuality, quality };
    for (const [key, value] of Object.entries(subRatings)) {
      if (value !== undefined && (value < 1 || value > 5)) {
        return NextResponse.json(
          { error: `${key} rating must be between 1 and 5` },
          { status: 400 }
        );
      }
    }

    // Fetch job and validate permissions
    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, status, customer_id, worker_id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (session.role !== 'admin') {
      if (job.customer_id !== session.user_id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (job.status !== 'completed') {
      return NextResponse.json({ error: 'Reviews can only be submitted for completed jobs' }, { status: 400 });
    }

    if (!job.worker_id || job.worker_id !== workerId) {
      return NextResponse.json({ error: 'Invalid worker for this job' }, { status: 400 });
    }

    // Prevent duplicate reviews by same reviewer on same job
    const { data: existing } = await client
      .from('reviews')
      .select('id')
      .eq('job_id', jobId)
      .eq('reviewer_id', session.user_id)
      .maybeSingle();

    if (existing?.id) {
      return NextResponse.json({ error: 'Review already submitted' }, { status: 409 });
    }

    const { data: created, error: createError } = await client
      .from('reviews')
      .insert({
        job_id: jobId,
        reviewer_id: session.user_id,
        reviewed_user_id: workerId,
        rating,
        comment: String(review),
        flagged: false,
        published: true,
        created_at: new Date().toISOString(),
        published_at: new Date().toISOString(),
      })
      .select(
        `
        id,
        rating,
        comment,
        created_at,
        reviewer:users!reviews_reviewer_id_fkey(name, avatar_url)
      `
      )
      .single();

    if (createError || !created) {
      console.error('Create review error:', createError);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Review submitted successfully',
      review: {
        id: created.id,
        rating: created.rating,
        review: created.comment || '',
        communication: communication ?? null,
        punctuality: punctuality ?? null,
        quality: quality ?? null,
        createdAt: created.created_at,
        helpful: 0,
        customerName: created.reviewer?.[0]?.name || 'Unknown',
        customerAvatar: created.reviewer?.[0]?.avatar_url || null,
      },
    });

  } catch (error) {
    console.error('Create review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');
    const jobId = searchParams.get('jobId');
    const customerId = searchParams.get('customerId');

    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    let query = client
      .from('reviews')
      .select(
        `
        id,
        job_id,
        reviewer_id,
        reviewed_user_id,
        rating,
        comment,
        created_at,
        reviewer:users!reviews_reviewer_id_fkey(name, avatar_url)
      `
      )
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (workerId) {
      query = query.eq('reviewed_user_id', workerId);
    }

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    if (customerId) {
      query = query.eq('reviewer_id', customerId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Get reviews error:', error);
      return NextResponse.json({ reviews: [], total: 0 });
    }

    const reviews = (data || []).map((r: any) => ({
      id: r.id,
      rating: r.rating,
      review: r.comment || '',
      communication: null,
      punctuality: null,
      quality: null,
      createdAt: r.created_at,
      helpful: 0,
      customerName: r.reviewer?.[0]?.name || 'Unknown',
      customerAvatar: r.reviewer?.[0]?.avatar_url || null,
    }));

    return NextResponse.json({
      reviews,
      total: reviews.length,
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
