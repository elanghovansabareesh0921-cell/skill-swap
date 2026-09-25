import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      credits,
      userId,
      userEmail,
    } = body;

    if (!amount || !credits || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing required payment details." },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If keySecret is set and this is a real Razorpay order (not simulator)
    if (keySecret && razorpay_order_id && !razorpay_order_id.startsWith("order_sim_")) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { error: "Invalid payment signature verification failed." },
          { status: 400 }
        );
      }
    }

    // Persist credits to Supabase if Supabase env vars exist
    let newBalance: number | null = null;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // Helper to check for standard UUID v4 format
        const isUuid = (id?: string | null) =>
          typeof id === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let resolvedUserId = isUuid(userId) ? userId : null;

        // If userId is not a valid UUID (e.g. "user-current"), lookup by email
        if (!resolvedUserId && userEmail) {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("id, credits")
            .eq("email", userEmail)
            .maybeSingle();

          if (userProfile?.id) {
            resolvedUserId = userProfile.id;
          }
        }

        if (resolvedUserId) {
          // Attempt RPC call first if available
          const { data: rpcData, error: rpcError } = await supabase.rpc("add_user_credits", {
            p_user_id: resolvedUserId,
            p_amount: Number(credits),
          });

          // PostgreSQL function returns json_build_object('success', true, 'newBalance', v_new_balance)
          if (!rpcError && rpcData && (rpcData.newBalance !== undefined || rpcData.new_credits !== undefined)) {
            newBalance = rpcData.newBalance ?? rpcData.new_credits;
          } else {
            // Fallback: Fetch current credits and update profiles table directly
            const { data: profile } = await supabase
              .from("profiles")
              .select("credits")
              .eq("id", resolvedUserId)
              .single();

            if (profile) {
              const updatedCredits = (profile.credits || 0) + Number(credits);
              await supabase
                .from("profiles")
                .update({ credits: updatedCredits })
                .eq("id", resolvedUserId);
              newBalance = updatedCredits;
            }
          }

          // Insert notification
          await supabase.from("notifications").insert({
            user_id: resolvedUserId,
            title: "Credits Added 🪙",
            message: `+${credits} Credits added to your account via Razorpay.`,
            link: "/credits",
          });
        }
      } catch (dbErr) {
        console.warn("Could not sync credits to Supabase DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified.",
      paymentId: razorpay_payment_id || `pay_sim_${Date.now()}`,
      orderId: razorpay_order_id,
      creditsAdded: Number(credits),
      amountPaid: Number(amount),
      newBalance,
    });
  } catch (error: any) {
    console.error("Razorpay verify error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify Razorpay payment." },
      { status: 500 }
    );
  }
}
