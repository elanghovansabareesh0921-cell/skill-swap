import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server';

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (user instanceof NextResponse) return user;

    const { searchParams } = new URL(req.url);
    const offerId = searchParams.get('offerId');
    const threadId = searchParams.get('threadId');

    const admin = getSupabaseAdmin();
    let targetThreadId = threadId;
    let targetOfferId = offerId;

    if (targetThreadId) {
      const { data: thread } = await admin
        .from('chat_threads')
        .select('id, offer_id')
        .eq('id', targetThreadId)
        .maybeSingle();
      if (!thread) return NextResponse.json({ error: 'Chat thread not found' }, { status: 404 });
      targetOfferId = thread.offer_id;
    }

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

    if (!targetThreadId || !targetOfferId) {
      return NextResponse.json({ messages: [] });
    }

    const { data: offer } = await admin
      .from('offers')
      .select('proposer_id, recipient_id')
      .eq('id', targetOfferId)
      .maybeSingle();
    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    if (offer.proposer_id !== user.id && offer.recipient_id !== user.id) {
      return NextResponse.json({ error: 'You are not a participant in this chat' }, { status: 403 });
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
    const user = await requireUser(req);
    if (user instanceof NextResponse) return user;

    const body = await req.json();
    const { threadId, offerId, content, messageType, metadata } = body;

    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Missing required message parameters' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    let targetThreadId = threadId;
    let targetOfferId = offerId;

    if (targetThreadId) {
      const { data: thread } = await admin
        .from('chat_threads')
        .select('id, offer_id')
        .eq('id', targetThreadId)
        .maybeSingle();
      if (!thread) return NextResponse.json({ error: 'Chat thread not found' }, { status: 404 });
      if (targetOfferId && targetOfferId !== thread.offer_id) {
        return NextResponse.json({ error: 'Thread does not match offer' }, { status: 400 });
      }
      targetOfferId = thread.offer_id;
    }

    if (!targetOfferId) {
      return NextResponse.json({ error: 'An offer or thread is required' }, { status: 400 });
    }

    const { data: offer } = await admin
      .from('offers')
      .select('proposer_id, recipient_id')
      .eq('id', targetOfferId)
      .maybeSingle();
    if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    if (offer.proposer_id !== user.id && offer.recipient_id !== user.id) {
      return NextResponse.json({ error: 'You are not a participant in this chat' }, { status: 403 });
    }

    if (!targetThreadId && targetOfferId) {
      const { data: existingThread } = await admin
        .from('chat_threads')
        .select('id')
        .eq('offer_id', targetOfferId)
        .single();

      if (existingThread) {
        targetThreadId = existingThread.id;
      } else {
        const { data: newThread } = await admin
          .from('chat_threads')
          .insert({ offer_id: targetOfferId, status: 'OPEN' })
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
        sender_id: user.id,
        content: content.trim(),
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
