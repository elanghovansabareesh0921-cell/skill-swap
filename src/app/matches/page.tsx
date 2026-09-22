"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SwapRequestModal from "@/components/SwapRequestModal";
import { useSkillSwap } from "@/context/SkillSwapContext";
import { createClient } from "@/lib/supabase";
import {
  Users,
  Sparkles,
  ArrowRight,
  Repeat,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Star,
  BrainCircuit,
  MessageSquare,
} from "lucide-react";

export default function MatchesPage() {
  const { currentUser, swapRequests, respondToSwapRequest } = useSkillSwap();
  const supabase = createClient();

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
    skillToTeach: string;
  }>({
    id: "arun-kumar",
    name: "Arun Kumar",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    skillToTeach: "Python & Machine Learning",
  });

  useEffect(() => {
    async function loadMatches() {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        const res = await fetch("/api/matches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user?.id || currentUser.id }),
        });

        const data = await res.json();
        if (data.matches && data.matches.length > 0) {
          setMatches(data.matches);
        } else {
          // Curated reciprocal peer matches fallback
          setMatches([
            {
              userId: "arun-kumar",
              name: "Arun Kumar",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              teaches: "Python & Machine Learning",
              wants: "React & Next.js",
              compatibilityScore: 95,
              matchReason: "Direct reciprocal exchange: Arun teaches Python and wants to advance in Next.js which you offer.",
            },
            {
              userId: "elena-rostova",
              name: "Elena Rostova",
              avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
              teaches: "UI/UX Design Systems in Figma",
              wants: "TypeScript Fundamentals",
              compatibilityScore: 92,
              matchReason: "Elena is looking for TypeScript architectural mentorship while offering senior design systems guidance.",
            },
            {
              userId: "sophia-rivera",
              name: "Sophia Rivera",
              avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
              teaches: "Conversational Spanish",
              wants: "Web Development",
              compatibilityScore: 86,
              matchReason: "High mutual alignment for learning Spanish conversation in exchange for web development tutoring.",
            },
          ]);
        }
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to load matches.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, [currentUser.id, supabase]);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.teaches.toLowerCase().includes(q) ||
        m.wants.toLowerCase().includes(q)
      );
    });
  }, [matches, searchQuery]);

  const handleOpenSwap = (match: any) => {
    setSelectedTargetUser({
      id: match.userId,
      name: match.name,
      avatar: match.avatar,
      skillToTeach: match.teaches,
    });
    setSwapModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Reciprocal Matching Engine</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
              Skill Matches
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
              People whose learning interests match what you teach — and vice versa.
            </p>
          </div>

          <Link
            href="/skills"
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors w-fit"
          >
            Update Your Skills →
          </Link>
        </div>

        {/* INCOMING / OUTGOING SWAP REQUESTS SECTION */}
        {swapRequests.length > 0 && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
                <h2 className="text-base font-bold text-[#18181B] dark:text-white">Active Swap Requests</h2>
              </div>
              <span className="text-xs text-[#71717A]">{swapRequests.length} total</span>
            </div>

            <div className="space-y-3">
              {swapRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.fromUserAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                      alt={req.fromUserName}
                      className="w-10 h-10 rounded-full object-cover border border-[#E4E1F5]"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#18181B] dark:text-white">
                          {req.fromUserName}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === "Pending"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            : req.status === "Accepted"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-zinc-100 text-zinc-600"
                        }`}>
                          {req.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-0.5">
                        Wants to learn: <span className="font-semibold text-[#18181B] dark:text-white">{req.skillToLearn}</span> • Offered: <span className="font-semibold text-[#7C3AED] dark:text-[#A78BFA]">{req.skillOffered}</span>
                      </p>
                    </div>
                  </div>

                  {req.status === "Pending" && req.toUserId === "current-user" && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => respondToSwapRequest(req.id, "decline")}
                        className="px-3 py-1.5 rounded-lg border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#71717A] hover:bg-zinc-100"
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
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#71717A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter matches by name or skill..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-sm text-[#18181B] dark:text-white placeholder-[#71717A] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
          />
        </div>

        {/* MATCHES LIST */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] animate-pulse h-36" />
            ))}
          </div>
        ) : filteredMatches.length > 0 ? (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div
                key={match.userId}
                className="p-6 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] hover:border-[#A78BFA] shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={match.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                    alt={match.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#E4E1F5] shrink-0"
                  />
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <Link
                        href={`/profile/${match.userId}`}
                        className="text-base font-bold text-[#18181B] dark:text-white hover:text-[#7C3AED] transition-colors"
                      >
                        {match.name}
                      </Link>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-[11px] font-bold">
                        {match.compatibilityScore}% Alignment
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="text-[#71717A] font-medium">Teaches: </span>
                        <span className="font-semibold text-[#18181B] dark:text-white">{match.teaches}</span>
                      </div>
                      <div>
                        <span className="text-[#71717A] font-medium">Wants to Learn: </span>
                        <span className="font-semibold text-[#7C3AED] dark:text-[#A78BFA]">{match.wants}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#71717A] dark:text-zinc-400 pt-1 leading-relaxed">
                      {match.matchReason}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
                  <Link
                    href={`/profile/${match.userId}`}
                    className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#18181B] dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-center transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleOpenSwap(match)}
                    className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Request Swap</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] space-y-2">
            <Users className="w-10 h-10 text-[#7C3AED] mx-auto opacity-70" />
            <h3 className="text-base font-bold text-[#18181B] dark:text-white">
              We&apos;re still looking for your perfect skill connections.
            </h3>
            <p className="text-xs text-[#71717A] max-w-sm mx-auto">
              Add more skills you teach and want to learn to increase your matches.
            </p>
            <div className="pt-2">
              <Link
                href="/skills"
                className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold inline-block"
              >
                Manage My Skills
              </Link>
            </div>
          </div>
        )}
      </main>

      <SwapRequestModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        targetUser={selectedTargetUser}
      />
    </div>
  );
}