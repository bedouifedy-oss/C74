import { NextRequest, NextResponse } from 'next/server';
import { getWorkers } from '@/lib/db';
import { isSupabaseReady } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category, bio, city, profile_photo, id_document } = body;

    // Validate input
    if (!category || !bio || !city) {
      return NextResponse.json(
        { error: 'Category, bio, and city are required' },
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

    // TODO: Implement actual database logic for worker creation
    const workerId = `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return NextResponse.json({
      worker_id: workerId,
      status: 'pending_verification',
      message: 'Worker profile submitted for verification'
    });

  } catch (error) {
    console.error('Worker profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const city = searchParams.get('city') || undefined;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Use real database if configured
    if (isSupabaseReady) {
      const { workers, total } = await getWorkers({
        category,
        city,
        status: 'active',
        limit,
        offset,
      });

      // Transform data for frontend
      const formattedWorkers = workers.map((w: any) => ({
        id: w.id,
        name: w.users?.name || 'Unknown',
        category: w.category,
        bio: w.bio,
        city: w.city,
        rating_avg: w.rating_avg || 0,
        review_count: w.rating_count || 0,
        completed_jobs: w.completed_jobs_count || 0,
        guarantee_enabled: w.guarantee_enabled || false,
        profile_photo: w.profile_photo_url || w.users?.avatar_url || null,
        hourly_rate: w.hourly_rate,
        next_available: 'Available now', // Placeholder - could come from availability table
        response_time: '1 hour', // Placeholder - could be calculated
        verified: w.documents_verified || false,
        status: w.status,
      }));

      return NextResponse.json({
        workers: formattedWorkers,
        total,
        limit,
        offset,
      });
    }

    // Fallback: Return empty array when no database
    return NextResponse.json({
      workers: [],
      total: 0,
      limit,
      offset,
      message: 'Database not configured - no workers available',
    });

  } catch (error) {
    console.error('Get workers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
