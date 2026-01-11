import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

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

    const workerId = session.role === 'admin' 
      ? new URL(request.url).searchParams.get('workerId')
      : session.user_id;

    if (!workerId) {
      return NextResponse.json({ error: 'Worker ID is required' }, { status: 400 });
    }

    // Fetch all jobs where this worker is assigned or has applied
    const { data: jobs, error: jobsError } = await client
      .from('jobs')
      .select(`
        *,
        customer:users!jobs_customer_id_fkey(name, phone, email)
      `)
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false });

    if (jobsError) {
      console.error('Error fetching worker jobs:', jobsError);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    // Categorize jobs
    const applications = [];
    const offers = [];
    const contracts = [];

    (jobs || []).forEach((job: any) => {
      const jobData = {
        id: job.id,
        description: job.description,
        category: job.category,
        address: job.address,
        address_details: job.address_details,
        price_estimate: job.price_estimate,
        price_agreed: job.price_agreed,
        scheduled_date: job.scheduled_date,
        scheduled_time_slot: job.scheduled_time_slot,
        status: job.status,
        created_at: job.created_at,
        updated_at: job.updated_at,
        customer: {
          name: job.customer?.name,
          phone: job.customer?.phone,
          email: job.customer?.email
        }
      };

      // Categorize based on status
      if (job.status === 'requested') {
        // Worker has been assigned but not yet accepted
        offers.push(jobData);
      } else if (job.status === 'accepted' || job.status === 'in_progress') {
        // Active contract
        contracts.push(jobData);
      } else if (job.status === 'completed') {
        // Completed contract
        contracts.push(jobData);
      }
    });

    return NextResponse.json({
      applications: applications,
      offers: offers,
      contracts: contracts,
      stats: {
        totalApplications: applications.length,
        pendingOffers: offers.length,
        activeContracts: contracts.filter(c => c.status === 'in_progress').length,
        completedContracts: contracts.filter(c => c.status === 'completed').length
      }
    });

  } catch (error) {
    console.error('Error fetching worker applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
