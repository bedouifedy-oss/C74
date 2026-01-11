import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

// Global store for demo (in production, use database)
declare global {
  var workerProfiles: Record<string, any> | undefined;
}

// Helper function to get worker availability (same as availability API)
async function getWorkerAvailability(workerId: string, client: any) {
  const { data, error } = await client
    .from('worker_weekly_availability')
    .select('day_of_week, time_slot')
    .eq('worker_id', workerId)
    .order('day_of_week', { ascending: true });

  if (error) {
    console.error('Get weekly availability error:', error);
    return { available: true, days: [], timeSlots: [] };
  }

  // Convert to expected format for UI (same as availability API)
  const availability = (data || []).map((row: any) => ({
    day: row.day_of_week,
    slot: row.time_slot,
    status: 'available',
  }));

  return availability;
}

export async function GET(request: NextRequest) {
  try {
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

    const workerId = session.user_id;

    const { data: worker, error: workerError } = await client
      .from('workers')
      .select('id, category, bio, city, rating_avg, completed_jobs_count, hourly_rate, years_of_experience, status, profile_photo_url')
      .eq('id', workerId)
      .single();

    if (workerError || !worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 });
    }

    const { data: user, error: userError } = await client
      .from('users')
      .select('id, name, phone, email')
      .eq('id', workerId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: workerId,
      fullName: user.name || '',
      phone: user.phone || '',
      email: user.email || '',
      location: worker.city || '',
      bio: worker.bio || '',
      hourlyRate: worker.hourly_rate || 0,
      yearsOfExperience: worker.years_of_experience || 0,
      category: worker.category || '',
      photoUrl: worker.profile_photo_url || '',
      skills: [],
      experience: [],
      // Get real availability from worker_weekly_availability table (same as availability API)
      availability: await getWorkerAvailability(workerId, client),
      rating: Number(worker.rating_avg || 0),
      completedJobs: worker.completed_jobs_count || 0,
      verificationStatus: worker.status || 'pending',
    });

  } catch (error) {
    console.error('Get worker profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.log('🔍 POST /api/workers/profile - Called!');
  
  try {
    console.log('POST /api/workers/profile - Starting request');
    
    const session = getAuthSessionFromRequest(request);
    console.log('Session result:', session ? 'Valid' : 'Null/Invalid');
    
    if (!session) {
      console.log('No session found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Session role:', session.role);
    if (session.role !== 'worker' && session.role !== 'admin') {
      console.log('Invalid role, returning 403');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const formData = await request.formData();
    console.log('Worker onboarding request received');
    console.log('FormData keys:', Array.from(formData.keys()));

    const workerId = session.user_id;
    console.log('Worker ID from session:', workerId);

    // Handle file uploads
    let profilePhotoUrl = null;
    let idFrontUrl = null;
    let idBackUrl = null;

    // Process profile photo
    const profilePhoto = formData.get('profile_photo') as File;
    if (profilePhoto && profilePhoto.size > 0) {
      // Convert to base64 for storage
      const bytes = await profilePhoto.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      profilePhotoUrl = `data:${profilePhoto.type};base64,${base64}`;
    }

    // Process ID documents (similar approach)
    const idFrontFile = formData.get('id_front') as File;
    if (idFrontFile && idFrontFile.size > 0) {
      const bytes = await idFrontFile.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      idFrontUrl = `data:${idFrontFile.type};base64,${base64}`;
    }

    const idBackFile = formData.get('id_back') as File;
    if (idBackFile && idBackFile.size > 0) {
      const bytes = await idBackFile.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      idBackUrl = `data:${idBackFile.type};base64,${base64}`;
    }

    // Extract form fields
    const category = formData.get('category') as string;
    const bio = formData.get('bio') as string;
    const yearsExperience = formData.get('years_experience') as string;
    const availabilityData = formData.get('availability') as string;
    const termsAccepted = formData.get('terms_accepted') === 'true';
    const onboardingCompleted = formData.get('onboarding_completed') === 'true';

    // Parse availability
    let availability: any = { available: true, days: [], timeSlots: [] };
    if (availabilityData) {
      try {
        availability = JSON.parse(availabilityData);
        console.log('🔍 ONBOARDING AVAILABILITY RAW DATA:', availabilityData);
        console.log('🔍 ONBOARDING AVAILABILITY PARSED:', availability);
        console.log('🔍 ONBOARDING AVAILABILITY TYPE:', typeof availability);
        console.log('🔍 ONBOARDING AVAILABILITY KEYS:', Object.keys(availability));
      } catch (e) {
        console.error('Failed to parse availability:', e);
      }
    }

    // Store availability in worker_weekly_availability table (same as availability API)
    if (availability.weekdays || availability.weekends) {
      console.log('🔍 CONVERTING ONBOARDING AVAILABILITY...');
      try {
        // Convert onboarding structure to weekly recurring format
        const weeklyAvailability = [];
        const dayMapping = { weekdays: [0, 1, 2, 3, 4], weekends: [5, 6] };

        Object.entries(availability).forEach(([period, slots]) => {
          const days = dayMapping[period as keyof typeof dayMapping];
          console.log(`🔍 Processing ${period}:`, slots, '→ days:', days);
          Object.entries(slots).forEach(([slot, enabled]) => {
            if (enabled) {
              console.log(`🔍 Adding ${slot} for days:`, days);
              days.forEach(day => {
                weeklyAvailability.push({
                  worker_id: workerId,
                  day_of_week: day,
                  time_slot: slot,
                  updated_at: new Date().toISOString(),
                });
              });
            }
          });
        });

        console.log('🔍 FINAL WEEKLY AVAILABILITY ARRAY:', weeklyAvailability);

        // Upsert to worker_weekly_availability table (same logic as availability API)
        const { error: weeklyError } = await client
          .from('worker_weekly_availability')
          .upsert(weeklyAvailability);

        if (weeklyError) {
          console.error('Failed to store weekly availability:', weeklyError);
        } else {
          console.log('✅ Weekly availability stored successfully:', weeklyAvailability.length, 'entries');
        }
      } catch (e) {
        console.error('Error storing weekly availability:', e);
      }
    } else {
      console.log('❌ NO WEEKDAYS OR WEEKENDS FOUND IN AVAILABILITY:', availability);
    }

    // Build update object with only existing columns
    const updateData: any = {
      category: category || null,
      bio: bio || '',
      years_of_experience: yearsExperience ? parseInt(yearsExperience) : 0,
      profile_photo_url: profilePhotoUrl,
      status: 'pending', // Will be reviewed by admin
    };

    // Try to add new columns if they exist (will be ignored if they don't)
    try {
      updateData.onboarding_completed = onboardingCompleted;
      updateData.terms_accepted = termsAccepted;
      updateData.id_front_url = idFrontUrl;
      updateData.id_back_url = idBackUrl;
      updateData.updated_at = new Date().toISOString();
    } catch (e) {
      console.log('Some columns may not exist yet, using existing columns only');
    }

    // Check if worker record exists, create if not
    const { data: existingWorker, error: checkError } = await client
      .from('workers')
      .select('id')
      .eq('id', workerId)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      // Worker record doesn't exist, create it first
      console.log('Worker record not found, creating new record...');
      const { error: createError } = await client
        .from('workers')
        .insert({
          id: workerId,
          category: category || null,
          bio: bio || '',
          years_of_experience: yearsExperience ? parseInt(yearsExperience) : 0,
          profile_photo_url: profilePhotoUrl,
          status: 'pending',
        });

      if (createError) {
        console.error('Failed to create worker record:', createError);
        return NextResponse.json({ error: 'Failed to create worker profile', details: createError }, { status: 500 });
      }
      console.log('Worker record created successfully');
    } else if (checkError) {
      console.error('Error checking worker record:', checkError);
      return NextResponse.json({ error: 'Database error', details: checkError }, { status: 500 });
    }

    // Update workers table
    const { error: workerUpdateError } = await client
      .from('workers')
      .update(updateData)
      .eq('id', workerId);

    if (workerUpdateError) {
      console.error('Worker onboarding error:', workerUpdateError);
      console.error('Update data attempted:', updateData);
      console.error('Worker ID:', workerId);
      return NextResponse.json({ error: 'Failed to update worker profile', details: workerUpdateError }, { status: 500 });
    }

    console.log('Worker profile updated successfully, attempting to retrieve...');

    // Get updated profile - only select existing columns
    const { data: worker, error: workerError } = await client
      .from('workers')
      .select('id, category, bio, city, rating_avg, completed_jobs_count, hourly_rate, years_of_experience, status, profile_photo_url')
      .eq('id', workerId)
      .single();

    console.log('Profile retrieval result:', { worker, workerError });

    if (workerError || !worker) {
      console.error('Failed to load updated profile:', workerError);
      return NextResponse.json({ error: 'Failed to load updated profile', details: workerError }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      profile: worker,
    });

  } catch (error) {
    console.error('Worker onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
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

    const body = await request.json();
    console.log('Worker profile update request:', body);
    console.log('Photo URL received:', body.photoUrl);
    console.log('Photo URL type:', typeof body.photoUrl);
    console.log('Photo URL starts with data:', body.photoUrl?.startsWith('data:'));
    const {
      fullName,
      phone,
      email,
      location,
      bio,
      hourlyRate,
      yearsOfExperience,
      skills,
      experience,
      availability,
      category
    } = body;

    // Validate input
    if (!fullName || !phone) {
      return NextResponse.json(
        { error: 'Full name and phone are required' },
        { status: 400 }
      );
    }

    // Validate email format (optional)
    if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone format (Tunisia)
    if (!phone.match(/^\+216\d{8}$/)) {
      return NextResponse.json(
        { error: 'Invalid phone number format. Use +216XXXXXXXX' },
        { status: 400 }
      );
    }

    const workerId = session.user_id;

    const { error: userUpdateError } = await client
      .from('users')
      .update({
        name: fullName,
        phone,
        ...(email && { email }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', workerId);

    if (userUpdateError) {
      console.error('Update user error:', userUpdateError);
      console.error('User update details:', { fullName, phone, email, workerId });
      return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
    }

    const photoUrl = body.photoUrl && body.photoUrl.startsWith('data:') ? body.photoUrl : null;
    console.log('Setting profile_photo_url to:', photoUrl ? 'base64 data present' : 'null');
    
    const { error: workerUpdateError } = await client
      .from('workers')
      .update({
        city: location,
        bio,
        hourly_rate: hourlyRate,
        years_of_experience: yearsOfExperience,
        category: body.category || null,
        profile_photo_url: photoUrl,
      })
      .eq('id', workerId);

    if (workerUpdateError) {
      console.error('Update worker error:', workerUpdateError);
      console.error('Worker update details:', { location, bio, hourlyRate, yearsOfExperience, category: body.category, workerId });
      return NextResponse.json({ error: 'Failed to update worker profile' }, { status: 500 });
    }

    const { data: worker, error: workerError } = await client
      .from('workers')
      .select('id, category, bio, city, rating_avg, completed_jobs_count, hourly_rate, years_of_experience, status, profile_photo_url')
      .eq('id', workerId)
      .single();

    const { data: user, error: userError } = await client
      .from('users')
      .select('id, name, phone, email')
      .eq('id', workerId)
      .single();

    if (workerError || userError || !worker || !user) {
      return NextResponse.json({ error: 'Failed to load updated profile' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: {
        id: workerId,
        fullName: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        location: worker.city || '',
        bio: worker.bio || '',
        hourlyRate: worker.hourly_rate || 0,
        yearsOfExperience: worker.years_of_experience || 0,
        category: worker.category || '',
        photoUrl: worker.profile_photo_url || '',
        skills: Array.isArray(skills) ? skills : [],
        experience: Array.isArray(experience) ? experience : [],
        availability: availability || { available: true, days: [], timeSlots: [] },
        rating: Number(worker.rating_avg || 0),
        completedJobs: worker.completed_jobs_count || 0,
        verificationStatus: worker.status || 'pending',
      },
    });

  } catch (error) {
    console.error('Update worker profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
