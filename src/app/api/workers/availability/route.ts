import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

declare global {
  var workerAvailability: Record<string, any[]> | undefined;
}

type TimeSlot = 'morning' | 'afternoon' | 'evening';

function getDefaultAvailability() {
  const slots: Array<{ day: number; slot: TimeSlot }> = [];
  for (let day = 1; day <= 5; day++) {
    for (const slot of ['morning', 'afternoon', 'evening'] as const) {
      slots.push({ day, slot });
    }
  }
  return slots;
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

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const requestedWorkerId = searchParams.get('workerId');

    const workerId = (() => {
      if (session.role === 'worker') return session.user_id;
      if (session.role === 'admin') return requestedWorkerId;
      if (session.role === 'customer') return requestedWorkerId;
      return null;
    })();

    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    // Query worker_weekly_availability table (existing infrastructure)
    const { data, error } = await client
      .from('worker_weekly_availability')
      .select('day_of_week, time_slot')
      .eq('worker_id', workerId)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('Get weekly availability error:', error);
      return NextResponse.json({ availability: [] });
    }

    // Convert to expected format for UI
    const availability = (data || []).map((row: any) => ({
      day: row.day_of_week,
      slot: row.time_slot,
      status: 'available',
    }));

    console.log('GET weekly availability returning:', availability);
    return NextResponse.json({ availability: availability });
  } catch (error) {
    console.error('Get availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { availability, workerId: bodyWorkerId } = body;
    
    console.log('Weekly availability save request:', {
      workerId: bodyWorkerId,
      availabilityCount: availability?.length,
      availability: availability
    });

    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'worker' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const workerId = session.role === 'admin' ? bodyWorkerId : session.user_id;
    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    if (!Array.isArray(availability)) {
      return NextResponse.json({ error: 'Availability must be an array' }, { status: 400 });
    }

    // Validate availability entries
    for (const entry of availability) {
      const day = entry?.day;
      const slot = entry?.slot;
      
      if (day === null || typeof day !== 'number' || day < 0 || day > 6) {
        console.log('Skipping invalid availability entry:', entry);
        continue;
      }
      
      if (!['morning', 'afternoon', 'evening'].includes(String(slot))) {
        console.error('Invalid time slot:', slot);
        return NextResponse.json({ error: 'Invalid time slot in availability' }, { status: 400 });
      }
    }

    // Filter out invalid entries
    const validAvailability = availability.filter(entry => 
      entry.day !== null && typeof entry.day === 'number' && entry.day >= 0 && entry.day <= 6
    );

    console.log('Valid weekly availability entries:', validAvailability);

    if (validAvailability.length > 0) {
      // Use upsert to worker_weekly_availability table (existing infrastructure)
      const { error: upsertError } = await client
        .from('worker_weekly_availability')
        .upsert(
          validAvailability.map((a: any) => ({
            worker_id: workerId,
            day_of_week: a.day,
            time_slot: a.slot,
            updated_at: new Date().toISOString(),
          })),
          {
            onConflict: 'worker_id, day_of_week, time_slot' // Unique constraint columns
          }
        );

      if (upsertError) {
        console.error('Save weekly availability error:', upsertError);
        return NextResponse.json({ error: 'Failed to save availability' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Weekly availability saved successfully' });
  } catch (error) {
    console.error('Save availability error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
