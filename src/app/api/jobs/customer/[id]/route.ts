import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseReady, createServerSupabaseClient } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;

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

    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 });
    }

    // Authorization check - customers can only see their own jobs
    if (session.role === 'customer' && session.user_id !== customerId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch jobs for the customer
    const { data: jobs, error } = await client
      .from('jobs')
      .select(`
        *,
        customer:users!jobs_customer_id_fkey (
          id,
          name,
          phone,
          role
        ),
        worker:workers!jobs_worker_id_fkey (
          id,
          name,
          phone,
          category,
          years_of_experience
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch customer jobs:', error);
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }

    console.log(`Found ${jobs?.length || 0} jobs for customer ${customerId}`);
    return NextResponse.json({ jobs: jobs || [] });

  } catch (error) {
    console.error('Customer jobs API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
