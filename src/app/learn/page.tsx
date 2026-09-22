"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap, SkillListing } from "@/context/SkillSwapContext";
import {
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Play,
  Compass,
} from "lucide-react";

export default function LearnIndexPage() {
  const { sessions, skills } = useSkillSwap();
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [bookingSkill, setBookingSkill] = useState<SkillListing | null>(null);

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const completedSessions = sessions.filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E1F5] dark:border-[#2D264E]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Learning Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white mt-1">
              Active Learning & Sessions
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
              Join upcoming 1-on-1 calls, access notes, or schedule new topics.
            </p>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-all w-fit"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover More Skills</span>
          </Link>
        </div>

        {/* Section: Upcoming Sessions */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#71717A] dark:text-zinc-300 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#7C3AED] dark:text-[#A78BFA]" />
            <span>Upcoming Sessions ({upcomingSessions.length})</span>
          </h2>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-5 sm:p-6 bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#A78BFA] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={session.teacherAvatar}
                      alt={session.teacherName}
                      className="w-12 h-12 rounded-full object-cover border border-[#E4E1F5] shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {session.date}
                        </span>
                        <span className="text-xs text-[#71717A]">•</span>
                        <span className="text-xs text-[#71717A] font-mono">{session.time}</span>
                      </div>
                      <h3 className="text-base font-bold text-[#18181B] dark:text-white mt-1.5">
                        {session.skillTitle}
                      </h3>
                      <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-0.5">
                        Teacher: <span className="font-semibold text-[#18181B] dark:text-white">{session.teacherName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="text-right hidden sm:block mr-2">
                      <span className="text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA] font-mono block">
                        🪙 {session.credits} credits
                      </span>
                      <span className="text-[10px] text-[#71717A]">{session.duration}</span>
                    </div>

                    <Link
                      href={session.roomUrl || `/learn/${session.id}`}
                      className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Join Room</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] text-xs text-[#71717A]">
              <p>No upcoming sessions scheduled right now.</p>
              <Link href="/discover" className="text-[#7C3AED] font-semibold hover:underline mt-1 block">
                Find a mentor to schedule a swap →
              </Link>
            </div>
          )}
        </div>

        {/* Section: Completed Sessions */}
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#71717A] dark:text-zinc-300 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Completed Swaps ({completedSessions.length})</span>
          </h2>

          {completedSessions.length > 0 ? (
            <div className="space-y-3">
              {completedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-white dark:bg-[#161327] rounded-2xl border border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={session.teacherAvatar}
                      alt={session.teacherName}
                      className="w-10 h-10 rounded-full object-cover border border-[#E4E1F5]"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#18181B] dark:text-white">{session.skillTitle}</h4>
                      <p className="text-[11px] text-[#71717A]">{session.teacherName} • Completed</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                    Completed ✓
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-white dark:bg-[#161327] rounded-2xl border border-[#E4E1F5] dark:border-[#2D264E] text-xs text-[#71717A]">
              No completed sessions yet.
            </div>
          )}
        </div>
      </main>

      <BookingModal
        isOpen={!!bookingSkill}
        onClose={() => setBookingSkill(null)}
        skill={bookingSkill}
      />

      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </div>
  );
}
