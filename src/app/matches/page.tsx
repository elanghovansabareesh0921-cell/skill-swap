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
  Repeat,
  Search,
  Compass,
  Zap,
  CheckCircle2,
} from "lucide-react";

export default function MatchesPage() {
  const { currentUser, swapRequests, respondToSwapRequest } = useSkillSwap();
  const supabase = createClient();

  const [matches, setMatches] = useState<MatchResult[]>([
    {
      matchUserId: "arun-kumar",
      fullName: "Arun Kumar",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      overallScore: 98,
      synergyHighlights: [
        "Direct Swap: Python for React & Next.js",
        "Aligned Pace: ADVANCED Mentor",
        "Overlapping Time Slots: Weekday Evenings",
      ],
      offeredSkill: "Python & Machine Learning",
      requestedSkill: "React & Next.js",
      sessionRateCredits: 10,
      aiExplanation: "High mutual synergy! Arun is an expert in Python looking to learn Next.js, which matches your exact profile for a direct 1-hour swap or 10-credit session.",
    },
    {
      matchUserId: "elena-rostova",
      fullName: "Elena Rostova",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      overallScore: 94,
      synergyHighlights: [
        "Direct Swap: Figma for TypeScript",
        "Aligned Pace: ADVANCED Mentor",
        "Complementary Time Slots",
      ],
      offeredSkill: "UI/UX Design Systems in Figma",
      requestedSkill: "TypeScript & Web Architecture",
      sessionRateCredits: 10,
      aiExplanation: "Elena offers design systems and auto-layout expertise in exchange for TypeScript architecture mentorship.",
    },
    {
      matchUserId: "sophia-rivera",
      fullName: "Sophia Rivera",
      avatarUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      overallScore: 89,
      synergyHighlights: [
        "Direct Swap: Spanish for Web Development",
        "Immersive Conversational Practice",
      ],
      offeredSkill: "Conversational Spanish & Idioms",
      requestedSkill: "Web Development & Frontend",
      sessionRateCredits: 10,
      aiExplanation: "Practice conversational Spanish in exchange for web frontend guidance with zero fees or gatekeeping.",
    },
    {
      matchUserId: "marcus-chen",
      fullName: "Marcus Chen",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      overallScore: 88,
      synergyHighlights: [
        "Direct Swap: Docker for Figma UX",
        "Infrastructure Mentorship",
      ],
      offeredSkill: "Docker & Kubernetes Architecture",
      requestedSkill: "UI/UX Design in Figma",
      sessionRateCredits: 10,
      aiExplanation: "Marcus teaches containerization and backend scalability in exchange for UX review and wireframes.",
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
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    skillToTeach: "Python & Machine Learning",
  });

  // Load live matches if API is ready
  useEffect(() => {
    async function loadMatches() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
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
      setScanNotification(`AI Radar scan complete: Discovered ${discoveredMatches.length} high-synergy reciprocal matches!`);
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
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-white cyber-grid transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header & Subhead */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-[#181B22] text-xs font-black uppercase text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600] mb-2">
              <Repeat className="w-3.5 h-3.5" />
              <span>Reciprocal Matching · 1 Hour = 10 Credits</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Matches
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
              People who teach what you want to learn, and want what you can teach.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsScanning(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all self-start sm:self-auto cursor-pointer"
          >
            <Compass className="w-4 h-4 text-black stroke-[2.5]" />
            <span>AI Radar Search</span>
          </button>
        </div>

        {/* NOTIFICATION TOAST */}
        {scanNotification && (
          <div className="p-4 border-2 border-black bg-[#A3E635] text-black text-xs sm:text-sm font-black uppercase flex items-center justify-between shadow-[4px_4px_0px_0px_#000000] animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[3]" />
              <span>{scanNotification}</span>
            </div>
            <button
              onClick={() => setScanNotification(null)}
              className="text-xs underline font-black uppercase ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter matches by name or skill..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-black bg-[#12141C] text-sm text-white placeholder-zinc-500 font-medium shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:border-[#FFE600] focus:shadow-[4px_4px_0px_0px_#FFE600] transition-all"
          />
        </div>

        {/* MATCHES LIST */}
        {filteredMatches.length > 0 ? (
          <div className="space-y-6">
            {filteredMatches.map((match) => (
              <div
                key={match.matchUserId}
                className="border-2 border-black bg-[#181B22] p-6 sm:p-7 space-y-5 shadow-[6px_6px_0px_0px_#38BDF8] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
              >
                {/* Header: User Info & Compatibility Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={match.avatarUrl}
                      alt={match.fullName}
                      className="w-14 h-14 object-cover border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/profile/${match.matchUserId}`}
                          className="text-base font-black uppercase text-white hover:text-[#FFE600] transition-colors"
                        >
                          {match.fullName}
                        </Link>
                        <VerifiedBadge size="sm" showLabel />
                      </div>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5">
                        Active Skill Trader · Reciprocal Match
                      </p>
                    </div>
                  </div>

                  {/* Compatibility Score */}
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border-2 border-black bg-[#FFE600] text-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000] self-start sm:self-auto font-mono">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{match.overallScore}% Synergy</span>
                  </div>
                </div>

                {/* Reciprocal Skills Matrix */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 border-2 border-black bg-[#12141C] text-xs font-mono">
                  <div>
                    <span className="text-zinc-400 block text-[10px] font-black uppercase tracking-wider">Teaches (you want to learn)</span>
                    <strong className="text-white text-xs sm:text-sm font-black block mt-0.5">{match.offeredSkill}</strong>
                  </div>
                  <div className="pt-2 md:pt-0 md:pl-3 border-t-2 md:border-t-0 md:border-l-2 border-black">
                    <span className="text-zinc-400 block text-[10px] font-black uppercase tracking-wider">Wants (you can teach)</span>
                    <strong className="text-[#38BDF8] text-xs sm:text-sm font-black block mt-0.5">{match.requestedSkill}</strong>
                  </div>
                </div>

                {/* AI Explanation / Highlights */}
                <div className="p-3.5 border-2 border-black bg-[#12141C] text-xs text-zinc-300 font-mono leading-relaxed shadow-[2px_2px_0px_0px_#000000]">
                  <p className="italic text-white">
                    &ldquo;{match.aiExplanation}&rdquo;
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {match.synergyHighlights.map((hl, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 border border-black bg-[#181B22] text-[10px] font-black uppercase text-[#FFE600]"
                      >
                        {hl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions: "Start direct swap" or "Pay 10 credits instead" */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => handleStartDirectSwap(match)}
                    className="w-full sm:w-auto px-6 py-2.5 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Repeat className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Start direct swap</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePayCredits(match)}
                    className="w-full sm:w-auto px-5 py-2.5 border-2 border-black bg-[#12141C] hover:bg-[#1F2430] text-white text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#38BDF8] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CoinIcon size={14} />
                    <span>Pay 10 credits instead</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center border-2 border-black bg-[#181B22] shadow-[6px_6px_0px_0px_#FFE600] space-y-3">
            <Users className="w-10 h-10 text-zinc-500 mx-auto" />
            <h3 className="text-base font-black uppercase text-white">
              No matches found
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto font-medium">
              Add more skills you can teach and want to learn to unlock reciprocal peer matches.
            </p>
            <div className="pt-2">
              <Link
                href="/skills"
                className="px-5 py-2 border-2 border-black bg-[#FFE600] text-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000] inline-block"
              >
                Update my skills
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