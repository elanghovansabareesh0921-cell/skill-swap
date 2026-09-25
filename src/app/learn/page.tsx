"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import CoinIcon from "@/components/common/CoinIcon";
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
  Video,
} from "lucide-react";
import { motion } from "framer-motion";

export default function LearnIndexPage() {
  const { sessions, skills } = useSkillSwap();
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [bookingSkill, setBookingSkill] = useState<SkillListing | null>(null);

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const completedSessions = sessions.filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen flex flex-col ambient-bg text-white pb-20 lg:pb-0">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border-white/10 text-xs font-semibold text-white/80 mb-3">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
                Virtual Classroom &amp; Sessions Hub
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Learning &amp; <span className="text-gradient">sessions</span>
            </h1>
            <p className="text-sm text-white/50 mt-2 max-w-xl">
              Join upcoming 1-on-1 calls, access notes, or schedule new topics.
            </p>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-xl transition-all cursor-pointer hover:opacity-95 active:scale-[0.99] w-fit"
            style={{
              background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
              boxShadow: "0 4px 18px rgba(124,108,246,0.35)",
            }}
          >
            <Compass className="w-4 h-4" />
            <span>Discover More Skills</span>
          </Link>
        </div>

        {/* ── SECTION: UPCOMING SESSIONS ── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-400" />
              <span>Upcoming Sessions ({upcomingSessions.length})</span>
            </h2>
            <span className="text-xs text-cyan-300 font-medium">1 Hour = 10 Credits</span>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-5 sm:p-6 glass-interactive rounded-3xl border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative overflow-hidden"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={session.teacherAvatar}
                      alt={session.teacherName}
                      className="w-13 h-13 rounded-2xl object-cover border border-white/10 ring-2 ring-violet-500/20 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {session.date}
                        </span>
                        <span className="text-xs text-white/30">•</span>
                        <span className="text-xs text-white/60 font-mono">
                          {session.time}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-1.5">
                        {session.skillTitle}
                      </h3>
                      <p className="text-xs text-white/50 mt-0.5">
                        Teacher: <span className="font-semibold text-white">{session.teacherName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                    <div className="text-right hidden sm:block mr-2">
                      <span className="text-xs font-bold text-amber-300 flex items-center justify-end gap-1">
                        <CoinIcon size={12} /> {session.credits} credits
                      </span>
                      <span className="text-[10px] text-white/40">{session.duration}</span>
                    </div>

                    <Link
                      href={session.roomUrl || `/learn/${session.id}`}
                      className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                        boxShadow: "0 4px 14px rgba(124,108,246,0.3)",
                      }}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Join Classroom</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center glass rounded-3xl border-white/10 text-xs text-white/50 space-y-2">
              <p>No upcoming sessions scheduled right now.</p>
              <Link href="/discover" className="text-violet-400 font-semibold hover:underline block">
                Find a mentor to schedule a swap →
              </Link>
            </div>
          )}
        </div>

        {/* ── SECTION: COMPLETED SESSIONS ── */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/40 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed Swaps ({completedSessions.length})</span>
          </h2>

          {completedSessions.length > 0 ? (
            <div className="space-y-3">
              {completedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 glass rounded-2xl border-white/8 flex items-center justify-between hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={session.teacherAvatar}
                      alt={session.teacherName}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">
                        {session.skillTitle}
                      </h4>
                      <p className="text-[11px] text-white/40">
                        {session.teacherName} • Completed
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
                    Completed ✓
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center glass rounded-2xl border-white/8 text-xs text-white/40">
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
