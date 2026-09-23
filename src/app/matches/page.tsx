"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SwapRequestModal from "@/components/SwapRequestModal";
import BookingModal from "@/components/BookingModal";
import RadarScanner from "@/components/matching/RadarScanner";
import { useSkillSwap } from "@/context/SkillSwapContext";
import { createClient } from "@/lib/supabase";
import { MatchResult } from "@/lib/ai/compatibility";
import {
  Users,
  Sparkles,
  Repeat,
  Search,
  BrainCircuit,
  MessageSquare,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  Compass,
  ArrowRight,
  TrendingUp,
  Zap,
} from "lucide-react";

export default function MatchesPage() {
  const { currentUser, swapRequests, respondToSwapRequest } = useSkillSwap();
  const supabase = createClient();

  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  // Modals state
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
    skillToTeach: string;
    sessionRateCredits?: number;
  }>({
    id: "arun-kumar",
    name: "Arun Kumar",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    skillToTeach: "Python & Machine Learning",
    sessionRateCredits: 35,
  });

  // Load matches on mount
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
      } catch (err: any) {
        console.warn("Failed to load initial AI matches:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [currentUser.id, supabase]);

  // Handle completion from Radar Scanner
  const handleRadarScanComplete = (discoveredMatches: MatchResult[]) => {
    if (discoveredMatches && discoveredMatches.length > 0) {
      setMatches(discoveredMatches);
      setScanNotification(`AI Radar scan complete: Discovered ${discoveredMatches.length} high-synergy peer matches!`);
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
        m.requestedSkill.toLowerCase().includes(q) ||
        m.aiExplanation.toLowerCase().includes(q)
      );
    });
  }, [matches, searchQuery]);

  const handleOpenSwap = (match: MatchResult) => {
    setSelectedTargetUser({
      id: match.matchUserId,
      name: match.fullName,
      avatar: match.avatarUrl,
      skillToTeach: match.offeredSkill,
      sessionRateCredits: match.sessionRateCredits,
    });
    setSwapModalOpen(true);
  };

  const handleOpenBooking = (match: MatchResult) => {
    setSelectedTargetUser({
      id: match.matchUserId,
      name: match.fullName,
      avatar: match.avatarUrl,
      skillToTeach: match.offeredSkill,
      sessionRateCredits: match.sessionRateCredits,
    });
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#090814] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* HERO / SCANNER TRIGGER BANNER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#120E2E] border border-emerald-500/20 shadow-2xl p-6 sm:p-8 text-white">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>AI SMART MATCHMAKER • 4-FACTOR RECIPROCAL DISCOVERY</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Synergy Discovery Engine
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                Discover peer partners who teach what you want to learn, and learn what you teach — calibrated by proficiency gap, availability, and collaborative vibe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsScanning(true)}
                className="group relative inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Compass className="w-4 h-4 animate-spin text-slate-950 group-hover:rotate-180 transition-transform duration-700" />
                <span>Launch AI Radar Scanner</span>
              </button>

              <Link
                href="/skills"
                className="px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-600 text-center transition-colors"
              >
                Refine Skills
              </Link>
            </div>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {scanNotification && (
          <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{scanNotification}</span>
            </div>
            <button
              onClick={() => setScanNotification(null)}
              className="text-emerald-400 hover:text-white text-xs underline font-semibold ml-4"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* INCOMING / OUTGOING SWAP REQUESTS SECTION */}
        {swapRequests.length > 0 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#151226] border border-[#E4E1F5] dark:border-[#2B234B] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
                <h2 className="text-base font-bold text-[#18181B] dark:text-white">Active Swap Requests</h2>
              </div>
              <span className="text-xs text-[#71717A] dark:text-zinc-400">{swapRequests.length} total</span>
            </div>

            <div className="space-y-3">
              {swapRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0D0B1A] border border-[#E4E1F5] dark:border-[#2B234B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.fromUserAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                      alt={req.fromUserName}
                      className="w-10 h-10 rounded-full object-cover border border-[#E4E1F5] dark:border-zinc-700"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#18181B] dark:text-white">
                          {req.fromUserName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            req.status === "Pending"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : req.status === "Accepted"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-0.5">
                        Wants to learn: <span className="font-semibold text-[#18181B] dark:text-white">{req.skillToLearn}</span> • Offered: <span className="font-semibold text-[#7C3AED] dark:text-[#A78BFA]">{req.skillOffered}</span>
                      </p>
                    </div>
                  </div>

                  {req.status === "Pending" && req.fromUserId !== currentUser.id && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => respondToSwapRequest(req.id, "decline")}
                        className="px-3 py-1.5 rounded-lg border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#71717A] dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => respondToSwapRequest(req.id, "accept")}
                        className="px-4 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm"
                      >
                        Accept Swap
                      </button>
                    </div>
                  )}

                  {req.status === "Accepted" && (
                    <Link
                      href={`/messages?partnerId=${req.fromUserId}&partnerName=${encodeURIComponent(req.fromUserName)}`}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open Chat & Schedule</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH AND FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-[#71717A] dark:text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill name, topic, or mentor name..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-[#151226] border border-[#E4E1F5] dark:border-[#2B234B] text-sm text-[#18181B] dark:text-white placeholder-[#71717A] dark:placeholder-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-xs text-[#71717A] dark:text-zinc-400">
              Showing <span className="font-bold text-[#18181B] dark:text-white">{filteredMatches.length}</span> matches
            </span>
          </div>
        </div>

        {/* SCORED COMPATIBILITY CARDS */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white dark:bg-[#151226] border border-[#E4E1F5] dark:border-[#2B234B] animate-pulse h-48"
              />
            ))}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="space-y-6">
            {filteredMatches.map((match) => {
              const isHighSynergy = match.overallScore >= 90;

              return (
                <div
                  key={match.matchUserId}
                  className="relative p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#151226] border border-[#E4E1F5] dark:border-[#2B234B] hover:border-emerald-500/50 shadow-md hover:shadow-xl transition-all duration-300 space-y-5 group"
                >
                  {/* Top Row: User Meta + Scored Compatibility Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={match.avatarUrl}
                          alt={match.fullName}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E4E1F5] dark:border-zinc-700 shadow-sm"
                        />
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#151226]" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/profile/${match.matchUserId}`}
                            className="text-lg font-extrabold text-[#18181B] dark:text-white hover:text-emerald-500 transition-colors"
                          >
                            {match.fullName}
                          </Link>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                            Verified Peer
                          </span>
                        </div>
                        <p className="text-xs text-[#71717A] dark:text-zinc-400">
                          Active Skill Trader • Ready for Exchange
                        </p>
                      </div>
                    </div>

                    {/* Overall Score Badge */}
                    <div className="flex items-center gap-3">
                      {match.sessionRateCredits && (
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{match.sessionRateCredits} Credits/Session</span>
                        </div>
                      )}

                      <div
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-bold text-sm tracking-tight shadow-sm ${
                          isHighSynergy
                            ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            : "bg-violet-50 dark:bg-violet-950/40 border-violet-500/30 text-violet-700 dark:text-violet-300"
                        }`}
                      >
                        <Zap className="w-4 h-4 fill-current" />
                        <span>{match.overallScore}% Synergy</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Exchange Matrix */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0D0B1A] border border-[#E4E1F5] dark:border-[#2B234B]">
                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="text-[11px] font-semibold text-[#71717A] dark:text-zinc-400 uppercase tracking-wider block">
                          They Teach You
                        </span>
                        <span className="text-sm font-bold text-[#18181B] dark:text-white">
                          {match.offeredSkill}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5 shrink-0" />
                      <div>
                        <span className="text-[11px] font-semibold text-[#71717A] dark:text-zinc-400 uppercase tracking-wider block">
                          You Teach Them
                        </span>
                        <span className="text-sm font-bold text-cyan-700 dark:text-cyan-400">
                          {match.requestedSkill}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Explanation Quote Box */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-950 to-slate-900/90 border border-emerald-500/30 text-slate-200 text-xs sm:text-sm leading-relaxed shadow-inner space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wide">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI Synergy Analysis</span>
                    </div>
                    <p className="italic text-slate-300">
                      &ldquo;{match.aiExplanation}&rdquo;
                    </p>
                  </div>

                  {/* Synergy Highlights Tags & Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                      {match.synergyHighlights.map((highlight, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] border border-[#DDD6FE] dark:border-[#382D60]"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenBooking(match)}
                        className="px-4 py-2.5 rounded-xl border border-emerald-500/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Book Session</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenSwap(match)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
                      >
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Request Swap</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#151226] rounded-3xl border border-[#E4E1F5] dark:border-[#2B234B] space-y-4">
            <Users className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
            <h3 className="text-lg font-bold text-[#18181B] dark:text-white">
              No matching profiles found with current filter
            </h3>
            <p className="text-xs text-[#71717A] dark:text-zinc-400 max-w-sm mx-auto">
              Launch the AI Radar Scanner to perform a fresh discovery pass across global learners.
            </p>
            <div>
              <button
                type="button"
                onClick={() => setIsScanning(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-md"
              >
                Scan Network
              </button>
            </div>
          </div>
        )}
      </main>

      {/* AESTHETIC RADAR SCANNER MODAL */}
      <RadarScanner
        isOpen={isScanning}
        onClose={() => setIsScanning(false)}
        onScanComplete={handleRadarScanComplete}
        userId={currentUser.id}
        initialMatches={matches}
      />

      {/* SWAP REQUEST MODAL */}
      <SwapRequestModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        targetUser={selectedTargetUser}
      />

      {/* ESCROW BOOKING MODAL */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        mentor={{
          id: selectedTargetUser.id,
          name: selectedTargetUser.name,
          avatar: selectedTargetUser.avatar,
          skillName: selectedTargetUser.skillToTeach,
          pricePerSession: selectedTargetUser.sessionRateCredits || 30,
        }}
      />
    </div>
  );
}