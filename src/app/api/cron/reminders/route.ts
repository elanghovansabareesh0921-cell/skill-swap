import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTransactionalEmail } from "@/lib/email";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    // Verify optional cron secret for secured Vercel Cron invocation
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    // Query confirmed sessions scheduled between now and next 24h
    const { data: upcomingSessions, error } = await supabase
      .from("sessions")
      .select(`
        id,
        skill_name,
        scheduled_at,
        requester:profiles!requester_id(full_name, email),
        receiver:profiles!receiver_id(full_name, email)
      `)
      .eq("status", "CONFIRMED")
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", in24h);

    if (error) throw error;

    let dispatched = 0;

    for (const s of upcomingSessions || []) {
      const scheduledTime = new Date(s.scheduled_at).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const requesterEmail = (s.requester as any)?.email;
      const receiverEmail = (s.receiver as any)?.email;

      if (requesterEmail) {
        await sendTransactionalEmail({
          to: requesterEmail,
          subject: `Reminder: Upcoming SkillSwap for ${s.skill_name}`,
          headline: `Session Reminder: ${s.skill_name}`,
          body: `Your peer exchange with ${(s.receiver as any)?.full_name || "your partner"} is scheduled for ${scheduledTime}. Make sure your microphone and camera are ready!`,
          actionText: "Join Dashboard & Call",
        });
        dispatched++;
      }

      if (receiverEmail) {
        await sendTransactionalEmail({
          to: receiverEmail,
          subject: `Reminder: Upcoming SkillSwap for ${s.skill_name}`,
          headline: `Session Reminder: ${s.skill_name}`,
          body: `Your mentoring swap with ${(s.requester as any)?.full_name || "your peer"} is scheduled for ${scheduledTime}.`,
          actionText: "Join Dashboard & Call",
        });
        dispatched++;
      }
    }

    return NextResponse.json({ success: true, processed: upcomingSessions?.length || 0, dispatched });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}