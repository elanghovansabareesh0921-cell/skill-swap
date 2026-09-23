import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// POST /api/swaps: Create new swap request (PENDING state)
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const body = await req.json();
    const { receiverId, offeredSkill, requestedSkill } = body;

    const senderId = user?.id || body.senderId || "user-current";

    if (!receiverId || !offeredSkill || !requestedSkill) {
      return NextResponse.json({ error: "Missing required swap parameters" }, { status: 400 });
    }

    // Try Supabase insert
    let requestId = `swap-${Date.now()}`;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from("swap_requests")
        .insert({
          sender_id: senderId,
          receiver_id: receiverId,
          offered_skill: offeredSkill,
          requested_skill: requestedSkill,
          status: "pending",
        })
        .select()
        .single();

      if (!error && data) {
        requestId = data.id;
      }
    }

    return NextResponse.json({
      success: true,
      swapRequest: {
        id: requestId,
        senderId,
        receiverId,
        offeredSkill,
        requestedSkill,
        status: "pending",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/swaps: Accept, Decline, or Cancel a swap request
export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const body = await req.json();
    const { requestId, action } = body; // action: 'accept' | 'decline' | 'cancel'

    if (!requestId || !action) {
      return NextResponse.json({ error: "Missing requestId or action" }, { status: 400 });
    }

    const currentUserId = user?.id || body.userId || "user-current";

    if (action === "accept") {
      // 1. If Supabase configured, call atomic procedure or update
      let chatRoomId = `chat-swap-${Date.now()}`;
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc(
          "accept_swap_request_and_create_room",
          {
            p_request_id: requestId,
            p_user_id: currentUserId,
          }
        );

        if (!rpcErr && rpcData?.chat_room_id) {
          chatRoomId = rpcData.chat_room_id;
        } else {
          // Direct fallback table update
          await supabase
            .from("swap_requests")
            .update({ status: "accepted" })
            .eq("id", requestId);

          const { data: roomData } = await supabase
            .from("chat_rooms")
            .insert({
              participant_one: currentUserId,
              participant_two: body.partnerId || currentUserId,
              source_type: "swap_match",
            })
            .select()
            .single();

          if (roomData) chatRoomId = roomData.id;
        }
      } catch (e) {
        console.warn("DB accept swap:", e);
      }

      return NextResponse.json({
        success: true,
        status: "accepted",
        chatRoomId,
        message: "Mutual swap accepted! Private room created.",
      });
    } else {
      const nextStatus = action === "decline" ? "declined" : "cancelled";
      try {
        await supabase
          .from("swap_requests")
          .update({ status: nextStatus })
          .eq("id", requestId);
      } catch (e) {
        console.warn("DB decline swap:", e);
      }

      return NextResponse.json({
        success: true,
        status: nextStatus,
        message: `Swap request ${nextStatus}.`,
      });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
