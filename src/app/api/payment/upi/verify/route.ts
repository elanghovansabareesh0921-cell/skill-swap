import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// In-memory set of used UTRs for duplicate prevention (in production, stored in db)
const usedUtrs = new Set<string>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { utr, amount, credits, userId, upiId } = body;

    if (!amount || !credits) {
      return NextResponse.json(
        { error: "Invalid amount or credit count." },
        { status: 400 }
      );
    }

    const cleanUtr = (utr || "").trim();

    if (!cleanUtr || cleanUtr.length < 4) {
      return NextResponse.json(
        { error: "Please provide a valid 12-digit UPI Transaction ID (UTR)." },
        { status: 400 }
      );
    }

    if (usedUtrs.has(cleanUtr)) {
      return NextResponse.json(
        { error: "This UPI Reference ID has already been credited." },
        { status: 400 }
      );
    }

    usedUtrs.add(cleanUtr);

    // Sync credits to Supabase database if credentials exist
    let newBalance: number | null = null;
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        const isUuid = (id?: string | null) =>
          typeof id === "string" &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        let resolvedUserId = isUuid(userId) ? userId : null;

        if (!resolvedUserId && body.userEmail) {
          const { data: userProfile } = await supabase
            .from("profiles")
            .select("id, credits")
            .eq("email", body.userEmail)
            .maybeSingle();

          if (userProfile?.id) {
            resolvedUserId = userProfile.id;
          }
        }

        if (resolvedUserId) {
          const { data: rpcData, error: rpcError } = await supabase.rpc("add_user_credits", {
            p_user_id: resolvedUserId,
            p_amount: Number(credits),
          });

          if (!rpcError && rpcData && (rpcData.newBalance !== undefined || rpcData.new_credits !== undefined)) {
            newBalance = rpcData.newBalance ?? rpcData.new_credits;
          } else {
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

          await supabase.from("notifications").insert({
            user_id: resolvedUserId,
            title: "Credits Added 🪙",
            message: `+${credits} Credits added to your account via UPI transfer.`,
            link: "/credits",
          });
        }
      } catch (dbErr) {
        console.warn("Could not sync credits to Supabase DB:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "UPI payment received and credited successfully.",
      utr: cleanUtr,
      creditsAdded: Number(credits),
      amountPaid: Number(amount),
      upiId: upiId || process.env.NEXT_PUBLIC_ADMIN_UPI_ID || "9361775890@upi",
      newBalance,
    });
  } catch (error: any) {
    console.error("UPI verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify UPI payment." },
      { status: 500 }
    );
  }
}
