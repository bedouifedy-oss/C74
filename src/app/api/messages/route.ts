import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseReady, createServerSupabaseClient } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

// Global store for demo (in production, use database)
declare global {
  var messages: Record<string, any> | undefined;
  var conversations: Record<string, any> | undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const listConversations = searchParams.get('listConversations');

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

    // List all conversations for a user
    if (listConversations === 'true') {
      const { data: jobs, error: jobsError } = await client
        .from('jobs')
        .select(
          `
          id,
          category,
          description,
          created_at,
          updated_at,
          customer_id,
          worker_id,
          customer:users!jobs_customer_id_fkey(id, name),
          worker:workers!jobs_worker_id_fkey(
            id,
            users!workers_id_fkey(id, name)
          ),
          messages(
            id,
            message_text,
            sender_id,
            created_at,
            read
          )
        `
        )
        .or(`customer_id.eq.${session.user_id},worker_id.eq.${session.user_id}`)
        .not('worker_id', 'is', null)
        .order('updated_at', { ascending: false });

      if (jobsError) {
        console.error('Error fetching conversations:', jobsError);
        return NextResponse.json({ conversations: [] });
      }

      const conversations = (jobs || []).map((job: any) => {
        const isCustomer = job.customer_id === session.user_id;
        const workerUser = job.worker?.users;
        const otherUser = isCustomer
          ? { id: job.worker?.id, name: workerUser?.name, role: 'worker' }
          : { id: job.customer?.id, name: job.customer?.name, role: 'customer' };

        const messages = (job.messages || []).slice().sort((a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter((m: any) => !m.read && m.sender_id !== session.user_id).length;

        const lastMessageCreatedAt = lastMessage?.created_at || job.updated_at || job.created_at;

        return {
          id: job.id,
          participants: [job.customer_id, job.worker_id].filter(Boolean),
          otherUser,
          jobId: job.id,
          jobCategory: job.category,
          jobTitle: job.description,
          lastMessage: {
            content: lastMessage?.message_text || '',
            senderId: lastMessage?.sender_id || otherUser.id,
            createdAt: lastMessageCreatedAt,
          },
          unreadCount,
          createdAt: job.created_at,
          updatedAt: lastMessageCreatedAt,
        };
      });

      return NextResponse.json({ conversations });
    }

    // Get messages for a specific conversation (conversationId === jobId)
    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, customer_id, worker_id')
      .eq('id', conversationId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const isParticipant = job.customer_id === session.user_id || job.worker_id === session.user_id;
    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: msgs, error: msgsError } = await client
      .from('messages')
      .select('id, job_id, sender_id, message_text, message_type, read, created_at')
      .eq('job_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgsError) {
      console.error('Error fetching messages:', msgsError);
      return NextResponse.json({ messages: [] });
    }

    const customerId = job.customer_id;
    const workerId = job.worker_id;

    const messages = (msgs || []).map((m: any) => ({
      id: m.id,
      conversationId: m.job_id,
      senderId: m.sender_id,
      receiverId: m.sender_id === customerId ? workerId : customerId,
      content: m.message_text,
      type: m.message_type || 'text',
      read: m.read,
      createdAt: m.created_at,
    }));

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, content, type = 'text' } = body;

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

    // Validate input
    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      );
    }

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, customer_id, worker_id')
      .eq('id', conversationId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const isParticipant = job.customer_id === session.user_id || job.worker_id === session.user_id;
    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: created, error: createError } = await client
      .from('messages')
      .insert({
        job_id: conversationId,
        sender_id: session.user_id,
        message_text: String(content),
        message_type: type,
        read: false,
        created_at: new Date().toISOString(),
      })
      .select('id, job_id, sender_id, message_text, message_type, read, created_at')
      .single();

    if (createError || !created) {
      console.error('Error sending message:', createError);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    const receiverIdDerived = created.sender_id === job.customer_id ? job.worker_id : job.customer_id;

    return NextResponse.json({
      message: {
        id: created.id,
        conversationId: created.job_id,
        senderId: created.sender_id,
        receiverId: receiverIdDerived,
        content: created.message_text,
        type: created.message_type || 'text',
        read: created.read,
        createdAt: created.created_at,
      },
      success: 'Message sent successfully',
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, read } = body;

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

    // Validate input
    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    const shouldRead = read !== false;

    const { data: msg, error: msgError } = await client
      .from('messages')
      .select('id, job_id')
      .eq('id', messageId)
      .single();

    if (msgError || !msg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, customer_id, worker_id')
      .eq('id', msg.job_id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const isParticipant = job.customer_id === session.user_id || job.worker_id === session.user_id;
    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: updateError } = await client
      .from('messages')
      .update({ read: shouldRead })
      .eq('id', messageId);

    if (updateError) {
      console.error('Error updating message:', updateError);
      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Message updated successfully'
    });

  } catch (error) {
    console.error('Update message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
