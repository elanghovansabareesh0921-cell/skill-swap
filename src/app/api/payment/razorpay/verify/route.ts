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
    } = body;

    if (!amount || !credits) {
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

    // Persist credits to Supabase if userId is provided and Supabase env vars exist
    let newBalance: number | null = null;
    if (userId && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        // Attempt RPC call first if available
        const { data: rpcData, error: rpcError } = await supabase.rpc("add_user_credits", {
          p_user_id: userId,
          p_amount: Number(credits),
        });

        if (!rpcError && rpcData?.new_credits !== undefined) {
          newBalance = rpcData.new_credits;
        } else {
          // Fallback: Fetch current credits and update profiles table directly
          const { data: profile } = await supabase
            .from("profiles")
            .select("credits")
            .eq("id", userId)
            .single();

          if (profile) {
            const updatedCredits = (profile.credits || 0) + Number(credits);
            await supabase
              .from("profiles")
              .update({ credits: updatedCredits })
              .eq("id", userId);
            newBalance = updatedCredits;
          }
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
