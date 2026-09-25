"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ActivityCard from "@/components/gamification/ActivityCard";
import CoinIcon from "@/components/common/CoinIcon";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import GradientGlow from "@/components/GradientGlow";
import {
  ArrowRight,
  Sparkles,
  Repeat,
  ShieldCheck,
  CheckCircle,
  Compass,
  Star,
  Users,
  Lock,
  Flame,
  Award,
  BookOpen,
  Zap,
  Globe2,
  Video,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const featuredMentors = [
    {
      id: "arun-kumar",
      name: "Arun Kumar",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: "4.9",
      teaches: "Python & Machine Learning",
      wants: "React & Next.js",
      verified: true,
      sessionsCompleted: 18,
    },
    {
      id: "elena-rostova",
      name: "Elena Rostova",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      rating: "5.0",
      teaches: "UI/UX Design Systems in Figma",
      wants: "TypeScript & Web Architecture",
      verified: true,
      sessionsCompleted: 24,
    },
    {
      id: "sophia-rivera",
      name: "Sophia Rivera",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      rating: "4.8",
      teaches: "Conversational Spanish",
      wants: "Web Development",
      verified: false,
      sessionsCompleted: 9,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col ambient-bg text-white pb-20 lg:pb-0 relative overflow-hidden">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-24 relative z-10">
        {/* ── HERO SECTION ── */}
        <section className="text-center max-w-3xl mx-auto space-y-8 pt-8 sm:pt-14 relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/10 text-xs font-semibold text-white/80 shadow-inner">
            <CoinIcon size={14} />
            <span className="bg-linear-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
              Global Skill Exchange · 1 Hour = 10 Credits
            </span>
          </div>

          {/* Big Bold Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Learn anything. <br />
            <span className="text-gradient">Teach what you love.</span>
          </h1>

          {/* Subhead */}
          <p className="text-base sm:text-lg text-white/60 leading-relaxed max-w-2xl mx-auto">
            A peer-to-peer network where people exchange skills instead of money. Real-time reciprocal matching, zero platform tax, encrypted classrooms — just people teaching people.
          </p>

          {/* Two CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href="/discover"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] text-center cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                boxShadow: "0 4px 20px rgba(124,108,246,0.35)",
              }}
            >
              Get Started Free
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl glass hover:bg-white/10 border-white/10 text-white/80 hover:text-white font-semibold text-sm transition-all text-center"
            >
              Explore How It Works
            </a>
          </div>

          {/* ── LIVE EXCHANGE VISUALIZER CARD ── */}
          <div className="mt-12 p-6 sm:p-8 rounded-3xl glass-elevated border-white/15 text-left shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Peer 1 */}
              <div className="flex items-center gap-3.5 flex-1">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="Arun"
                  className="w-13 h-13 rounded-2xl object-cover border border-white/10 ring-2 ring-violet-500/20"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">Arun Kumar</span>
                    <VerifiedBadge size="sm" showLabel={false} />
                  </div>
                  <span className="text-[11px] text-white/40 block mt-0.5">Teaches:</span>
                  <strong className="text-xs font-semibold text-violet-300 block">
                    Python &amp; Machine Learning
                  </strong>
                </div>
              </div>

              {/* Exchange Indicator */}
              <div className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl glass border-cyan-500/20 text-cyan-300 shrink-0">
                <Repeat className="w-5 h-5 text-cyan-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Direct Swap
                </span>
                <span className="text-[9px] text-white/40">0 Credits Needed</span>
              </div>

              {/* Peer 2 */}
              <div className="flex items-center gap-3.5 flex-1 justify-start sm:justify-end text-left sm:text-right">
                <div className="order-2 sm:order-1">
                  <div className="flex items-center sm:justify-end gap-1.5">
                    <span className="text-sm font-bold text-white">Elena Rostova</span>
                    <VerifiedBadge size="sm" showLabel={false} />
                  </div>
                  <span className="text-[11px] text-white/40 block mt-0.5">Teaches:</span>
                  <strong className="text-xs font-semibold text-cyan-300 block">
                    UI/UX Design Systems
                  </strong>
                </div>
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"
                  alt="Elena"
                  className="w-13 h-13 rounded-2xl object-cover border border-white/10 ring-2 ring-cyan-500/20 order-1 sm:order-2"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── BELOW THE FOLD: COMPACT ACTIVITY CARD ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/40">
                Your Skill Exchange Activity
              </h2>
            </div>
            <Link
              href="/credits"
              className="text-xs font-semibold text-violet-300 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>View wallet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ActivityCard
            currentLevel="Connector"
            learningHours={14}
            teachingHours={18}
            badges={{
              goodStart: true,
              firstSwap: true,
              streak7Days: false,
            }}
          />
        </section>

        {/* ── SECTION: TWO SESSION TYPES VISUALLY DISTINGUISHED ── */}
        <section id="features" className="space-y-8 pt-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-400">
              Two Flexible Ways to Trade
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              How skill exchange works
            </h2>
            <p className="text-xs sm:text-sm text-white/50">
              Trade directly peer-to-peer or spend earned credits with full escrow protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model A: Direct Swap */}
            <div className="rounded-3xl glass-interactive p-8 space-y-4 border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Repeat className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Mutual Exchange
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  Direct Swap
                </h3>
              </div>

              <p className="text-sm text-white/60 leading-relaxed">
                Two people teach each other. You teach what you know for an hour, and they teach you their craft in return. No credits move. Pure reciprocity.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Zero credits required · Pure peer exchange</span>
              </div>
            </div>

            {/* Model B: Credit Escrow */}
            <div className="rounded-3xl glass-interactive p-8 space-y-4 border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Escrow Protected
                </span>
                <h3 className="text-2xl font-extrabold text-white mt-1">
                  Credit Escrow
                </h3>
              </div>

              <p className="text-sm text-white/60 leading-relaxed">
                A learner spends 10 credits to book 1 hour. Credits are locked safely in escrow until the session is marked complete, then released instantly to the teacher.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-amber-300">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>1 Hour = 10 Credits · Escrow release on completion</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION: FEATURED MENTORS PREVIEW ── */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Featured skill traders
              </h2>
              <p className="text-xs sm:text-sm text-white/50 mt-1">
                Connect with community members ready for direct swaps or credit sessions.
              </p>
            </div>
            <Link
              href="/discover"
              className="text-xs font-bold text-violet-300 hover:text-white flex items-center gap-1 self-start sm:self-auto transition-colors"
            >
              <span>Explore all peers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="rounded-3xl glass-interactive p-6 space-y-4 border-white/10 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-white truncate">
                          {mentor.name}
                        </span>
                        {mentor.verified && (
                          <VerifiedBadge size="sm" showLabel={false} />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-white/45">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        <span className="font-semibold text-white">
                          {mentor.rating}
                        </span>
                        <span>· {mentor.sessionsCompleted} sessions</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Rows */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8 space-y-2 text-xs">
                    <div>
                      <span className="text-white/40 block text-[11px] font-medium">Teaches</span>
                      <strong className="text-white text-xs block mt-0.5">
                        {mentor.teaches}
                      </strong>
                    </div>
                    <div className="pt-2 border-t border-white/6">
                      <span className="text-cyan-400/80 block text-[11px] font-medium">Wants</span>
                      <strong className="text-cyan-300 text-xs block mt-0.5">
                        {mentor.wants}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Two Distinct Actions */}
                <div className="space-y-2 pt-1">
                  <Link
                    href={`/messages?partnerId=${mentor.id}&partnerName=${encodeURIComponent(
                      mentor.name
                    )}`}
                    className="w-full py-2.5 rounded-xl text-white text-xs font-bold text-center block transition-all shadow-md cursor-pointer hover:opacity-95"
                    style={{
                      background:
                        "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                    }}
                  >
                    Request Swap
                  </Link>
                  <Link
                    href="/credits"
                    className="w-full py-2 rounded-xl glass hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors border-white/10"
                  >
                    <CoinIcon size={14} />
                    <span>Learn for 10 Credits</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}