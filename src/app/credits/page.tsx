"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ActivityCard from "@/components/gamification/ActivityCard";
import CoinIcon from "@/components/common/CoinIcon";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  ShieldCheck,
  Repeat,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Lock,
  Sparkles,
  ExternalLink,
  Check,
} from "lucide-react";

import BuyCreditsModal from "@/components/BuyCreditsModal";

interface ActiveSessionItem {
  id: string;
  partnerName: string;
  partnerAvatar: string;
  skillName: string;
  sessionType: "direct" | "escrow";
  state: "requested" | "active" | "complete";
  timeSlot: string;
  role: "Teacher" | "Learner";
  creditsAmount: number;
}

export default function CreditsWalletPage() {
  const { credits, showToast } = useSkillSwap();

  const availableBalance = credits;
  const [escrowBalance, setEscrowBalance] = useState(10);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const [sessions, setSessions] = useState<ActiveSessionItem[]>([
    {
      id: "sess-1",
      partnerName: "Elena Rostova",
      partnerAvatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      skillName: "UI/UX Design Systems in Figma",
      sessionType: "escrow",
      state: "active",
      timeSlot: "Tomorrow at 6:00 PM (1 Hour)",
      role: "Learner",
      creditsAmount: 10,
    },
    {
      id: "sess-2",
      partnerName: "Arun Kumar",
      partnerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      skillName: "Python & Machine Learning",
      sessionType: "direct",
      state: "active",
      timeSlot: "Saturday at 2:00 PM (1 Hour)",
      role: "Learner",
      creditsAmount: 0,
    },
    {
      id: "sess-3",
      partnerName: "Sophia Rivera",
      partnerAvatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      skillName: "Conversational Spanish",
      sessionType: "escrow",
      state: "requested",
      timeSlot: "Monday at 4:30 PM (1 Hour)",
      role: "Learner",
      creditsAmount: 10,
    },
    {
      id: "sess-4",
      partnerName: "Marcus Chen",
      partnerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      skillName: "Docker & Kubernetes Architecture",
      sessionType: "direct",
      state: "complete",
      timeSlot: "Completed Yesterday",
      role: "Teacher",
      creditsAmount: 0,
    },
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: "tx-1",
      title: "1-Hour Session with Elena Rostova",
      description: "Credit Escrow: UI/UX Design Systems in Figma",
      amount: -10,
      status: "In Escrow",
      date: "Sep 25, 2026",
    },
    {
      id: "tx-2",
      title: "Taught 1-Hour Session to Alex Miller",
      description: "React & Next.js Fundamentals",
      amount: +10,
      status: "Released",
      date: "Sep 24, 2026",
    },
    {
      id: "tx-3",
      title: "Taught 1-Hour Session to Priya Patel",
      description: "Tailwind CSS & Component Architecture",
      amount: +10,
      status: "Released",
      date: "Sep 22, 2026",
    },
    {
      id: "tx-4",
      title: "SkillSwap Welcome Credits",
      description: "Initial Registration Baseline",
      amount: +20,
      status: "Complete",
      date: "Sep 20, 2026",
    },
  ]);

  // Mark session complete -> releases escrow
  const handleMarkComplete = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === sessionId) {
          return { ...s, state: "complete" as const };
        }
        return s;
      })
    );

    // Update balances
    setEscrowBalance((prev) => Math.max(0, prev - 10));
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        title: "Session Completed & Escrow Released",
        description: "10 Credits unlocked and transferred to teacher",
        amount: -10,
        status: "Released",
        date: "Just now",
      },
      ...prev,
    ]);

    showToast("Session marked complete! 10 credits released to teacher.", "success");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f2fc] dark:bg-[#130f26] text-[#241b3d] dark:text-[#f4f0ff] transition-colors duration-200">
      <Navbar onOpenBuyCredits={() => setIsBuyModalOpen(true)} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8fb] dark:bg-[#282147] border border-[#ddd4f5] dark:border-[#362c5e] text-xs font-semibold text-[#7d6ce8] dark:text-[#ac98f2] mb-2">
              <CoinIcon size={12} />
              <span>1 Hour = 10 Credits · Escrow Protected</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#241b3d] dark:text-[#f4f0ff]">
              Credits & wallet
            </h1>
            <p className="text-xs sm:text-sm text-[#7a719c] dark:text-[#a99ed4] mt-1">
              Track your hours taught and learned, active escrow, and credit transactions.
            </p>
          </div>

          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer"
          >
            <CoinIcon size={16} />
            <span>Top up credits</span>
          </button>
        </div>

        {/* 1. TOP ACTIVITY CARD (Same as Home Screen) */}
        <section className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7a719c] dark:text-[#a99ed4] block px-1">
            Activity & Gamification
          </span>
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

        {/* 2. BALANCE SUMMARY CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: Available Balance */}
          <div className="rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-6 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#7a719c] dark:text-[#a99ed4]">
                  Available Balance
                </span>
                <CoinIcon size={22} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#f5a524] font-mono">
                  {availableBalance}
                </span>
                <span className="text-sm font-semibold text-[#7a719c] dark:text-[#a99ed4]">
                  Credits
                </span>
              </div>
              <p className="text-xs text-[#7a719c] dark:text-[#a99ed4]">
                Enough for <strong>{Math.floor(availableBalance / 10)} hours</strong> of peer learning.
              </p>
            </div>

            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-full bg-[#ede8fb] dark:bg-[#282147] hover:bg-[#7d6ce8] hover:text-white dark:hover:bg-[#7d6ce8] text-xs font-bold text-[#7d6ce8] dark:text-[#ac98f2] border border-[#ddd4f5] dark:border-[#362c5e] transition-colors"
            >
              <span>+ Buy credits (₹1 = 1 Credit)</span>
            </button>
          </div>

          {/* Card B: In Escrow */}
          <div className="rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7a719c] dark:text-[#a99ed4]">
                Currently In Escrow
              </span>
              <div className="w-8 h-8 rounded-full bg-[#ede8fb] dark:bg-[#282147] text-[#f5a524] flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#241b3d] dark:text-[#f4f0ff] font-mono">
                {escrowBalance}
              </span>
              <span className="text-sm font-semibold text-[#7a719c] dark:text-[#a99ed4]">
                Credits locked
              </span>
            </div>
            <p className="text-xs text-[#7a719c] dark:text-[#a99ed4]">
              Held safely until active session is marked complete.
            </p>
          </div>

          {/* Card C: The Economic Rule */}
          <div className="rounded-3xl bg-gradient-to-br from-[#ede8fb] to-white dark:from-[#282147] dark:to-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-6 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7d6ce8] dark:text-[#ac98f2] block">
              Platform Rule
            </span>
            <div className="text-lg font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
              1 Hour = 10 Credits
            </div>
            <p className="text-xs text-[#7a719c] dark:text-[#a99ed4] leading-relaxed">
              Every 1 hour taught earns 10 credits. Every 1 hour learned costs 10 credits (or zero if direct swap).
            </p>
          </div>
        </section>

        {/* 3. ACTIVE SESSIONS LIST */}
        <section className="rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#ddd4f5]/60 dark:border-[#362c5e]/60">
            <div>
              <h2 className="text-base font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
                Active sessions
              </h2>
              <p className="text-xs text-[#7a719c] dark:text-[#a99ed4]">
                States: requested → active → complete. Click &ldquo;Mark complete&rdquo; to release held credits.
              </p>
            </div>
            <span className="text-xs font-bold text-[#7d6ce8] dark:text-[#ac98f2] bg-[#ede8fb] dark:bg-[#282147] px-3 py-1 rounded-full">
              {sessions.filter((s) => s.state !== "complete").length} ongoing
            </span>
          </div>

          <div className="space-y-3">
            {sessions.map((sess) => {
              const isDirect = sess.sessionType === "direct";
              const isComplete = sess.state === "complete";
              const isActive = sess.state === "active";

              return (
                <div
                  key={sess.id}
                  className="rounded-2xl bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={sess.partnerAvatar}
                      alt={sess.partnerName}
                      className="w-11 h-11 rounded-full object-cover border border-[#ddd4f5] dark:border-[#362c5e]"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[#241b3d] dark:text-[#f4f0ff]">
                          {sess.partnerName}
                        </span>
                        {/* Session Type Pill */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isDirect
                            ? "bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2]"
                            : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                        }`}>
                          {isDirect ? "Direct swap" : "Credit escrow (10c)"}
                        </span>
                        {/* State Badge */}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          sess.state === "active"
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                            : sess.state === "requested"
                            ? "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}>
                          {sess.state}
                        </span>
                      </div>
                      <p className="text-xs text-[#7a719c] dark:text-[#a99ed4] mt-0.5">
                        <strong className="text-[#241b3d] dark:text-[#f4f0ff]">{sess.skillName}</strong> · {sess.timeSlot}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {isActive && !isDirect && (
                      <button
                        type="button"
                        onClick={() => handleMarkComplete(sess.id)}
                        className="px-4 py-2 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark complete</span>
                      </button>
                    )}

                    {isComplete && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Released</span>
                      </span>
                    )}

                    <Link
                      href="/messages"
                      className="px-3.5 py-2 rounded-full bg-white dark:bg-[#1e1938] hover:bg-[#ede8fb]/60 text-xs font-semibold text-[#7a719c] dark:text-[#a99ed4] border border-[#ddd4f5] dark:border-[#362c5e]"
                    >
                      Open chat
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. TRANSACTION HISTORY LOG */}
        <section className="rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-6 sm:p-7 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#ddd4f5]/60 dark:border-[#362c5e]/60">
            <h2 className="text-base font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
              Transaction history
            </h2>
            <span className="text-xs text-[#7a719c] dark:text-[#a99ed4]">
              {transactions.length} entries
            </span>
          </div>

          <div className="divide-y divide-[#ddd4f5]/60 dark:divide-[#362c5e]/60">
            {transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                        isPositive
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-50 dark:bg-amber-950/40 text-[#f5a524]"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#241b3d] dark:text-[#f4f0ff]">
                        {tx.title}
                      </p>
                      <p className="text-[11px] text-[#7a719c] dark:text-[#a99ed4]">
                        {tx.description} · {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-extrabold font-mono ${
                        isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-[#241b3d] dark:text-[#f4f0ff]"
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} Credits
                    </span>
                    <span className="block text-[10px] text-[#7a719c] dark:text-[#a99ed4] font-medium">
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <BuyCreditsModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />
    </div>
  );
}