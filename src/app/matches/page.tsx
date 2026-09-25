"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SwapRequestModal from "@/components/SwapRequestModal";
import BookingModal from "@/components/BookingModal";
import RadarScanner from "@/components/matching/RadarScanner";
import CoinIcon from "@/components/common/CoinIcon";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import { useSkillSwap } from "@/context/SkillSwapContext";
import { createClient } from "@/lib/supabase";
import { MatchResult } from "@/lib/ai/compatibility";
import {
  Users,
  Sparkles,
  Repeat,
  Search,
  ShieldCheck,
  Calendar,
  Compass,
  ArrowRight,
  Zap,
  CheckCircle2,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

export default function MatchesPage() {
  const { currentUser, swapRequests, respondToSwapRequest } = useSkillSwap();
  const supabase = createClient();

  const [matches, setMatches] = useState<MatchResult[]>([
    {
      matchUserId: "arun-kumar",
      fullName: "Arun Kumar",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      overallScore: 98,
      synergyHighlights: [
        "Direct Swap: Python for React & Next.js",
        "Aligned Pace: ADVANCED Mentor",
        "Overlapping Time Slots: Weekday Evenings",
      ],
      offeredSkill: "Python & Machine Learning",
      requestedSkill: "React & Next.js",
      sessionRateCredits: 10,
      aiExplanation:
        "High mutual synergy! Arun is an expert in Python looking to learn Next.js, which matches your exact profile for a direct 1-hour swap or 10-credit session.",
    },
    {
      matchUserId: "elena-rostova",
      fullName: "Elena Rostova",
      avatarUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      overallScore: 94,
      synergyHighlights: [
        "Direct Swap: Figma for TypeScript",
        "Aligned Pace: ADVANCED Mentor",
        "Complementary Time Slots",
      ],
      offeredSkill: "UI/UX Design Systems in Figma",
      requestedSkill: "TypeScript & Web Architecture",
      sessionRateCredits: 10,
      aiExplanation:
        "Elena offers design systems and auto-layout expertise in exchange for TypeScript architecture mentorship.",
    },
    {
      matchUserId: "sophia-rivera",
      fullName: "Sophia Rivera",
      avatarUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      overallScore: 89,
      synergyHighlights: [
        "Direct Swap: Spanish for Web Development",
        "Immersive Conversational Practice",
      ],
      offeredSkill: "Conversational Spanish & Idioms",
      requestedSkill: "Web Development & Frontend",
      sessionRateCredits: 10,
      aiExplanation:
        "Practice conversational Spanish in exchange for web frontend guidance with zero fees or gatekeeping.",
    },
    {
      matchUserId: "marcus-chen",
      fullName: "Marcus Chen",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      overallScore: 88,
      synergyHighlights: [
        "Direct Swap: Docker for Figma UX",
        "Infrastructure Mentorship",
      ],
      offeredSkill: "Docker & Kubernetes Architecture",
      requestedSkill: "UI/UX Design in Figma",
      sessionRateCredits: 10,
      aiExplanation:
        "Marcus teaches containerization and backend scalability in exchange for UX review and wireframes.",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  // Modals state
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState<any>({
    id: "arun-kumar",
    name: "Arun Kumar",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    skillToTeach: "Python & Machine Learning",
  });

  // Load live matches if API is ready
  useEffect(() => {
    async function loadMatches() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const activeUserId = user?.id || currentUser.id;

        const res = await fetch("/api/ai-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: activeUserId }),
        });

        const data = await res.json();
        if (data.matches && data.matches.length > 0) {
          setMatches(data.matches);
        }
      } catch (err) {
        // Fallback to initial state
      }
    }

    loadMatches();
  }, [currentUser.id, supabase]);

  const handleRadarScanComplete = (discoveredMatches: MatchResult[]) => {
    if (discoveredMatches && discoveredMatches.length > 0) {
      setMatches(discoveredMatches);
      setScanNotification(
        `AI Radar scan complete: Discovered ${discoveredMatches.length} high-synergy reciprocal matches!`
      );
      setTimeout(() => setScanNotification(null), 5000);
    }
    setIsScanning(false);
  };

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(q) ||
        m.offeredSkill.toLowerCase().includes(q) ||
        m.requestedSkill.toLowerCase().includes(q)
      );
    });
  }, [matches, searchQuery]);

  const handleStartDirectSwap = (match: MatchResult) => {
    setSelectedTargetUser({
      id: match.matchUserId,
      name: match.fullName,
      avatar: match.avatarUrl,
      skillToTeach: match.offeredSkill,
    });
    setSwapModalOpen(true);
  };

  const handlePayCredits = (match: MatchResult) => {
    setSelectedTargetUser({
      id: match.matchUserId,
      name: match.fullName,
      avatar: match.avatarUrl,
      skillToTeach: match.offeredSkill,
    });
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col ambient-bg text-white pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* ── HEADER & RADAR CTA ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border-white/10 text-xs font-semibold text-white/80 mb-3">
              <Repeat className="w-3.5 h-3.5 text-cyan-400" />
              <span className="bg-linear-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
                Reciprocal Matching · 1 Hour = 10 Credits
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Reciprocal <span className="text-gradient">matches</span>
            </h1>
            <p className="text-sm text-white/50 mt-2 max-w-xl">
              AI-scored peers who teach what you want to learn, and are actively seeking what you can teach.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setIsScanning(true)}
              className="relative group inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-white transition-all cursor-pointer overflow-hidden shadow-lg active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                boxShadow: "0 4px 18px rgba(124,108,246,0.35)",
              }}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <Compass className="w-4 h-4 text-white relative z-10 animate-spin-slow" />
              <span className="relative z-10">AI Radar Scanner</span>
              <span className="relative z-10 px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                Live
              </span>
            </button>
          </div>
        </div>

        {/* ── NOTIFICATION TOAST ── */}
        <AnimatePresence>
          {scanNotification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 rounded-2xl glass border-cyan-500/30 text-cyan-200 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(6,182,212,0.12) 0%, rgba(124,108,246,0.12) 100%)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                </div>
                <span>{scanNotification}</span>
              </div>
              <button
                type="button"
                onClick={() => setScanNotification(null)}
                className="text-xs text-white/60 hover:text-white underline ml-4 cursor-pointer"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SEARCH BAR ── */}
        <div className="relative group max-w-2xl">
          <Search className="w-5 h-5 text-white/40 absolute left-4.5 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within:text-violet-400 transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter matches by peer name or offered/requested skill..."
            className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/30 backdrop-blur-xl focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20 transition-all shadow-lg"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── MATCHES LIST ── */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-5">
            {filteredMatches.map((match, i) => (
              <motion.div
                key={match.matchUserId}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="glass-interactive rounded-2xl p-6 sm:p-7 space-y-5 relative overflow-hidden"
              >
                {/* Header: User Info & Compatibility Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={match.avatarUrl}
                        alt={match.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border border-white/10 ring-2 ring-violet-500/20"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#08090D]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/profile/${match.matchUserId}`}
                          className="text-base sm:text-lg font-bold text-white hover:text-violet-400 transition-colors"
                        >
                          {match.fullName}
                        </Link>
                        <VerifiedBadge size="sm" showLabel />
                      </div>
                      <p className="text-xs text-white/45 mt-0.5">
                        Active Skill Trader · Reciprocal Match
                      </p>
                    </div>
                  </div>

                  {/* Compatibility Score */}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold self-start sm:self-auto shadow-md"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(124,108,246,0.25) 0%, rgba(6,182,212,0.2) 100%)",
                      border: "1px solid rgba(124,108,246,0.4)",
                      boxShadow: "0 0 16px rgba(124,108,246,0.15)",
                    }}
                  >
                    <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
                    <span className="text-white">
                      <strong className="text-cyan-300 font-extrabold">{match.overallScore}%</strong> Synergy Score
                    </span>
                  </div>
                </div>

                {/* Reciprocal Skills Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/8 text-xs">
                  <div className="space-y-1">
                    <span className="text-white/40 block text-[11px] font-medium uppercase tracking-wider">
                      Teaches (What you want to learn)
                    </span>
                    <strong className="text-white text-sm block font-semibold">
                      {match.offeredSkill}
                    </strong>
                  </div>
                  <div className="pt-3 md:pt-0 md:pl-4 border-t md:border-t-0 md:border-l border-white/8 space-y-1">
                    <span className="text-cyan-400/80 block text-[11px] font-medium uppercase tracking-wider">
                      Wants (What you can teach)
                    </span>
                    <strong className="text-cyan-300 text-sm block font-semibold">
                      {match.requestedSkill}
                    </strong>
                  </div>
                </div>

                {/* AI Explanation & Synergy Badges */}
                <div className="p-4 rounded-xl bg-violet-500/[0.04] border border-violet-500/15 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-white/70 italic leading-relaxed">
                      &ldquo;{match.aiExplanation}&rdquo;
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1 border-t border-white/6">
                    {match.synergyHighlights.map((hl, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[11px] font-medium text-white/70"
                      >
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleStartDirectSwap(match)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.99]"
                    style={{
                      background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                      boxShadow: "0 4px 14px rgba(124,108,246,0.3)",
                    }}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Start Direct Swap (0 Credits)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePayCredits(match)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl glass hover:bg-white/[0.08] border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CoinIcon size={14} />
                    <span>Pay 10 Credits Instead</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center rounded-3xl glass border-white/10 space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-white/40">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white">No matches found</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
              Add more skills you can teach and want to learn to unlock reciprocal peer matches with maximum synergy.
            </p>
            <div className="pt-2">
              <Link
                href="/skills"
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all inline-block shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                }}
              >
                Update My Skills
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* SWAP REQUEST MODAL */}
      <SwapRequestModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        targetUser={selectedTargetUser}
      />

      {/* 10-CREDIT ESCROW BOOKING MODAL */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        mentor={{
          id: selectedTargetUser?.id,
          name: selectedTargetUser?.name,
          avatar: selectedTargetUser?.avatar,
          skillName: selectedTargetUser?.skillToTeach,
          pricePerSession: 10,
        }}
      />

      {/* RADAR SCANNER */}
      <RadarScanner
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScanComplete={handleRadarScanComplete}
        userId={currentUser.id}
        initialMatches={matches}
      />
    </div>
  );
}