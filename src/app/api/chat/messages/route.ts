import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const offerId = searchParams.get('offerId');
    const threadId = searchParams.get('threadId');

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ messages: [] });
    }

    let targetThreadId = threadId;

    if (!targetThreadId && offerId) {
      const { data: thread } = await admin
        .from('chat_threads')
        .select('id')
        .eq('offer_id', offerId)
        .single();

      if (thread) {
        targetThreadId = thread.id;
      }
    }

    if (!targetThreadId) {
      return NextResponse.json({ messages: [] });
    }

    const { data: messages, error } = await admin
      .from('chat_messages')
      .select('*, sender:profiles(id, full_name, avatar_url)')
      .eq('thread_id', targetThreadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chat messages:', error);
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({
      messages: (messages || []).map((m) => ({
        id: m.id,
        threadId: m.thread_id,
        senderId: m.sender_id,
        senderName: m.sender?.full_name || 'Member',
        senderAvatar: m.sender?.avatar_url,
        content: m.content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: m.message_type || 'TEXT',
        metadata: m.metadata || {},
      })),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to retrieve messages';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threadId, offerId, senderId, content, messageType, metadata } = body;

    if (!senderId || !content) {
      return NextResponse.json({ error: 'Missing required message parameters' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      const fallbackMsg = {
        id: `msg-${Date.now()}`,
        threadId: threadId || offerId || 'default-thread',
        senderId,
        content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: messageType || 'TEXT',
        metadata: metadata || {},
      };
      return NextResponse.json({ success: true, message: fallbackMsg });
    }

    let targetThreadId = threadId;

    if (!targetThreadId && offerId) {
      const { data: existingThread } = await admin
        .from('chat_threads')
        .select('id')
        .eq('offer_id', offerId)
        .single();

      if (existingThread) {
        targetThreadId = existingThread.id;
      } else {
        const { data: newThread } = await admin
          .from('chat_threads')
          .insert({ offer_id: offerId, status: 'OPEN' })
          .select('id')
          .single();

        if (newThread) {
          targetThreadId = newThread.id;
        }
      }
    }

    if (!targetThreadId) {
      return NextResponse.json({ error: 'Unable to resolve chat thread' }, { status: 400 });
    }

    const { data: newMsg, error: insertError } = await admin
      .from('chat_messages')
      .insert({
        thread_id: targetThreadId,
        sender_id: senderId,
        content,
        message_type: messageType || 'TEXT',
        metadata: metadata || {},
      })
      .select('*, sender:profiles(id, full_name, avatar_url)')
      .single();

    if (insertError || !newMsg) {
      console.error('Error sending message:', insertError);
      return NextResponse.json({ error: 'Failed to persist message' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: {
        id: newMsg.id,
        threadId: newMsg.thread_id,
        senderId: newMsg.sender_id,
        senderName: newMsg.sender?.full_name || 'Member',
        senderAvatar: newMsg.sender?.avatar_url,
        content: newMsg.content,
        timestamp: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: newMsg.message_type,
        metadata: newMsg.metadata,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send message';
    console.error('Send message error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
