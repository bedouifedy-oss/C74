import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
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

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, customer_id, worker_id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const isParticipant =
      session.role === 'admin' ||
      job.customer_id === session.user_id ||
      job.worker_id === session.user_id;

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [{ data: disputes }, { data: guaranteeCases }] = await Promise.all([
      client
        .from('disputes')
        .select('id, issue_type, description, status, opened_at, resolved_at, resolution, admin_notes')
        .eq('job_id', jobId)
        .order('opened_at', { ascending: false }),
      client
        .from('guarantee_cases')
        .select('id, issue_category, is_dispute, description, status, opened_at, resolved_at, resolution, admin_notes')
        .eq('job_id', jobId)
        .order('opened_at', { ascending: false }),
    ]);

    const issues = [
      ...(guaranteeCases || []).map((c: any) => ({
        id: c.id,
        issue_type: c.is_dispute ? 'DISPUTE' : 'GUARANTEE',
        issue_category: c.issue_category,
        description: c.description,
        status: c.status,
        opened_at: c.opened_at,
        evidence_urls: [],
        worker_response: null,
        admin_notes: c.admin_notes,
        resolved_at: c.resolved_at,
        resolved_by: null,
        resolution: c.resolution,
      })),
      ...(disputes || []).map((d: any) => ({
        id: d.id,
        issue_type: 'DISPUTE',
        issue_category: d.issue_type,
        description: d.description,
        status: d.status,
        opened_at: d.opened_at,
        evidence_urls: [],
        worker_response: null,
        admin_notes: d.admin_notes,
        resolved_at: d.resolved_at,
        resolved_by: null,
        resolution: d.resolution,
      })),
    ].sort((a: any, b: any) => new Date(b.opened_at).getTime() - new Date(a.opened_at).getTime());

    return NextResponse.json({ success: true, issues, total: issues.length, job_id: jobId });

  } catch (error) {
    console.error('Get job issues error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
