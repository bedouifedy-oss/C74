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

    const { data, error } = await client
      .from('workers')
      .select(
        `
        *,
        users!workers_id_fkey(name, phone, email, created_at),
        worker_documents(*)
      `
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get pending workers error:', error);
      return NextResponse.json({ success: true, applications: [], total: 0 });
    }

    const formattedApplications = (data || []).map((w: any) => ({
      id: w.id,
      name: w.users?.name || 'Unknown',
      email: w.users?.email || null,
      phone: w.users?.phone || null,
      category: w.category,
      bio: w.bio,
      city: w.city,
      status: w.status,
      submitted_at: w.created_at,
      documents: w.worker_documents || [],
    }));

    return NextResponse.json({
      success: true,
      applications: formattedApplications,
      total: formattedApplications.length,
    });

  } catch (error) {
    console.error('Get pending workers error:', error);
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
    const { application_id, worker_id, action } = body;
    const targetWorkerId = application_id || worker_id;

    if (!targetWorkerId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Missing required fields: application_id (or worker_id), action (approve/reject)' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      const { data, error } = await client
        .from('workers')
        .update({
          status: 'active',
          documents_verified: true,
          verified_at: new Date().toISOString(),
          verified_by: session.user_id,
        })
        .eq('id', targetWorkerId)
        .select('*')
        .single();

      if (error) {
        console.error('Approve worker error:', error);
        return NextResponse.json({ error: 'Failed to approve worker' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Application approved successfully',
        worker: data,
      });
    }

    const { data, error } = await client
      .from('workers')
      .update({
        status: 'rejected',
        verified_at: new Date().toISOString(),
        verified_by: session.user_id,
      })
      .eq('id', targetWorkerId)
      .select('*')
      .single();

    if (error) {
      console.error('Reject worker error:', error);
      return NextResponse.json({ error: 'Failed to reject worker' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Application rejected',
      worker: data,
    });

  } catch (error) {
    console.error('Review worker application error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
