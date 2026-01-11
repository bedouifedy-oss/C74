import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseReady, createServerSupabaseClient } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

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
    const type = searchParams.get('type');

    let query = client
      .from('notifications')
      .select('*')
      .eq('user_id', session.user_id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ notifications: [], unreadCount: 0 });
    }

    const notifications = (data || []).map((n: any) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      message: n.message,
      data: n.data || null,
      read: n.read,
      createdAt: n.created_at,
    }));

    return NextResponse.json({
      notifications,
      unreadCount: notifications.filter((n: any) => !n.read).length,
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'admin') {
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
    const { userId, type, title, message, data } = body;

    // Validate input
    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'User ID, type, title, and message are required' },
        { status: 400 }
      );
    }

    const { data: created, error: createError } = await client
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        message,
        data: data || null,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating notification:', createError);
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    return NextResponse.json({
      notification: created,
      message: 'Notification created successfully',
    });

  } catch (error) {
    console.error('Create notification error:', error);
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

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { notificationId, read } = body;

    // Validate input
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    const { data: notif, error: notifError } = await client
      .from('notifications')
      .select('id, user_id')
      .eq('id', notificationId)
      .single();

    if (notifError || !notif) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    if (notif.user_id !== session.user_id && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const shouldRead = read !== false;
    const { error: updateError } = await client
      .from('notifications')
      .update({
        read: shouldRead,
        read_at: shouldRead ? new Date().toISOString() : null,
      })
      .eq('id', notificationId);

    if (updateError) {
      console.error('Error updating notification:', updateError);
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Notification updated successfully'
    });

  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
