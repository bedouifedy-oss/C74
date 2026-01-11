import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function GET(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'flagged';
    const limit = parseInt(searchParams.get('limit') || '20');

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
        flagged,
        published,
        flag_reason,
        created_at,
        reviewer:users!reviews_reviewer_id_fkey(name),
        reviewed:users!reviews_reviewed_user_id_fkey(name)
      `
      )
      .order('created_at', { ascending: status === 'flagged' });

    if (status !== 'all') {
      if (status === 'flagged') {
        query = query.eq('flagged', true).neq('flag_reason', 'deleted');
      } else if (status === 'published') {
        query = query.eq('published', true);
      } else if (status === 'hidden') {
        query = query.eq('published', false).eq('flagged', false);
      } else if (status === 'deleted') {
        query = query.eq('flag_reason', 'deleted');
      }
    }

    query = query.limit(limit);
    const { data, error } = await query;
    if (error) {
      console.error('Get reviews for moderation error:', error);
      return NextResponse.json({ success: true, reviews: [], total: 0, filters: { status, limit }, stats: { total_reviews: 0, published: 0, flagged: 0, hidden: 0, deleted: 0 } });
    }

    const reviews = (data || []).map((r: any) => {
      const computedStatus = r.flag_reason === 'deleted'
        ? 'deleted'
        : r.flagged
          ? 'flagged'
          : r.published
            ? 'published'
            : 'hidden';

      return {
        id: r.id,
        worker_id: r.reviewed_user_id,
        customer_id: r.reviewer_id,
        job_id: r.job_id,
        rating: r.rating,
        comment: r.comment,
        status: computedStatus,
        flag_reason: r.flag_reason,
        flagged_at: r.flagged ? r.created_at : null,
        created_at: r.created_at,
        customer_name: r.reviewer?.[0]?.name || 'Unknown',
        worker_name: r.reviewed?.[0]?.name || 'Unknown',
      };
    });

    const total = reviews.length;
    const stats = {
      total_reviews: total,
      published: reviews.filter((r: any) => r.status === 'published').length,
      flagged: reviews.filter((r: any) => r.status === 'flagged').length,
      hidden: reviews.filter((r: any) => r.status === 'hidden').length,
      deleted: reviews.filter((r: any) => r.status === 'deleted').length,
    };

    return NextResponse.json({
      success: true,
      reviews,
      total,
      filters: {
        status,
        limit
      },
      stats
    });

  } catch (error) {
    console.error('Get reviews for moderation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { review_id, action, edited_comment } = body;

    if (!review_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: review_id, action' },
        { status: 400 }
      );
    }

    const validActions = ['publish', 'edit', 'hide', 'delete'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be publish, edit, hide, or delete' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    if (action === 'publish') {
      const { data, error } = await client
        .from('reviews')
        .update({
          published: true,
          flagged: false,
          flag_reason: null,
          published_at: now,
        })
        .eq('id', review_id)
        .select('id, published, flagged, flag_reason, published_at')
        .single();

      if (error) {
        console.error('Moderate review error:', error);
        return NextResponse.json({ error: 'Failed to moderate review' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Review moderated successfully', review: data });
    }

    if (action === 'edit') {
      if (!edited_comment) {
        return NextResponse.json({ error: 'edited_comment is required for edit action' }, { status: 400 });
      }

      const { data, error } = await client
        .from('reviews')
        .update({
          comment: edited_comment,
          published: true,
          flagged: false,
          flag_reason: null,
          published_at: now,
        })
        .eq('id', review_id)
        .select('id, comment, published, flagged, flag_reason, published_at')
        .single();

      if (error) {
        console.error('Moderate review error:', error);
        return NextResponse.json({ error: 'Failed to moderate review' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Review moderated successfully', review: data });
    }

    if (action === 'hide') {
      const { data, error } = await client
        .from('reviews')
        .update({
          published: false,
          flagged: false,
          flag_reason: null,
        })
        .eq('id', review_id)
        .select('id, published, flagged, flag_reason')
        .single();

      if (error) {
        console.error('Moderate review error:', error);
        return NextResponse.json({ error: 'Failed to moderate review' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Review moderated successfully', review: data });
    }

    // delete
    const { data, error } = await client
      .from('reviews')
      .update({
        published: false,
        flagged: true,
        flag_reason: 'deleted',
      })
      .eq('id', review_id)
      .select('id, published, flagged, flag_reason')
      .single();

    if (error) {
      console.error('Moderate review error:', error);
      return NextResponse.json({ error: 'Failed to moderate review' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Review moderated successfully', review: data });
  } catch (error) {
    console.error('Moderate review error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
