import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseReady } from '@/lib/supabase';
import { getWorkerProfile } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseReady) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const worker = await getWorkerProfile(id);
    if (!worker) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      );
    }

    const formattedWorker = {
      id: worker.id,
      name: worker.users?.name || 'Unknown',
      phone: worker.users?.phone || null,
      email: worker.users?.email || null,
      category: worker.category,
      bio: worker.bio,
      city: worker.city,
      rating_avg: worker.rating_avg || 0,
      review_count: worker.rating_count || 0,
      completed_jobs: worker.completed_jobs_count || 0,
      guarantee_enabled: worker.guarantee_enabled || false,
      profile_photo: worker.users?.avatar_url || null,
      verified: worker.documents_verified || false,
      status: worker.status,
      created_at: worker.created_at,
    };

    return NextResponse.json({ worker: formattedWorker });

  } catch (error) {
    console.error('Get worker error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
