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
  Zap,
} from "lucide-react";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { motion } from "framer-motion";

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
  const { credits, transactions: contextTransactions, showToast } = useSkillSwap();

  const availableBalance = credits;
  const [escrowBalance, setEscrowBalance] = useState(10);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const [sessions, setSessions] = useState<ActiveSessionItem[]>([
    {
      id: "sess-1",
      partnerName: "Elena Rostova",
      partnerAvatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
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
      partnerAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
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
      partnerAvatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
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
      partnerAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      skillName: "Docker & Kubernetes Architecture",
      sessionType: "direct",
      state: "complete",
      timeSlot: "Completed Yesterday",
      role: "Teacher",
      creditsAmount: 0,
    },
  ]);

  const [localCompletedTxs, setLocalCompletedTxs] = useState<
    Array<{
      id: string;
      title: string;
      description: string;
      amount: number;
      status: string;
      date: string;
    }>
  >([]);

  const baseTransactions = [
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
  ];

  // Combined transactions: Real purchase/top-up context transactions first + local complete + baseline
  const transactions = React.useMemo(() => {
    const fromContext = (contextTransactions || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.detail,
      amount: t.type === "SPENT" ? -Math.abs(t.amount) : Math.abs(t.amount),
      status:
        t.type === "PURCHASED"
          ? "Complete"
          : t.type === "EARNED"
          ? "Released"
          : "In Escrow",
      date: t.date || "Just now",
    }));

    const combined = [...localCompletedTxs, ...fromContext];
    const seen = new Set(combined.map((c) => c.id));
    return [...combined, ...baseTransactions.filter((b) => !seen.has(b.id))];
  }, [contextTransactions, localCompletedTxs]);

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
    setLocalCompletedTxs((prev) => [
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

    showToast(
      "Session marked complete! 10 credits released to teacher.",
      "success"
    );
  };

  return (
    <div className="min-h-screen flex flex-col ambient-bg text-white pb-20 lg:pb-0">
      <Navbar onOpenBuyCredits={() => setIsBuyModalOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border-white/10 text-xs font-semibold text-white/80 mb-3 shadow-inner">
              <CoinIcon size={13} />
              <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
                1 Hour = 10 Credits · Escrow Protected
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Credits &amp; <span className="text-gradient">wallet</span>
            </h1>
            <p className="text-sm text-white/50 mt-2 max-w-xl">
              Track hours taught and learned, active escrow commitments, and transparent credit flows.
            </p>
          </div>

          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-xl transition-all cursor-pointer hover:opacity-95 active:scale-[0.99]"
            style={{
              background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
              boxShadow: "0 4px 18px rgba(124,108,246,0.35)",
            }}
          >
            <CoinIcon size={16} />
            <span>Top Up Credits</span>
          </button>
        </div>

        {/* ── 1. GAMIFICATION & ACTIVITY CARD ── */}
        <section className="space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-white/40 block px-1">
            Exchange Progression &amp; Streak
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

        {/* ── 2. BALANCE SUMMARY CARDS ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card A: Available Balance */}
          <div className="rounded-3xl glass border-white/10 p-6 space-y-4 flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Available Balance
                </span>
                <CoinIcon size={24} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-amber-400 font-mono tracking-tight">
                  {availableBalance}
                </span>
                <span className="text-sm font-semibold text-white/50">
                  Credits
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Enough for <strong className="text-white font-semibold">{Math.floor(availableBalance / 10)} hours</strong> of peer mentorship sessions.
              </p>
            </div>

            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl glass hover:bg-white/10 text-xs font-bold text-white transition-all border-white/10 cursor-pointer"
            >
              <span>+ Buy credits (₹1 = 1 Credit)</span>
            </button>
          </div>

          {/* Card B: In Escrow */}
          <div className="rounded-3xl glass border-white/10 p-6 space-y-4 flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                  Currently in Escrow
                </span>
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
                  {escrowBalance}
                </span>
                <span className="text-sm font-semibold text-white/50">
                  Credits locked
                </span>
              </div>
              <p className="text-xs text-white/50 leading-relaxed">
                Locked securely in escrow until scheduled 1-hour session is marked complete.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-cyan-300 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full learner protection guarantee</span>
            </div>
          </div>

          {/* Card C: The Economic Rule */}
          <div className="rounded-3xl glass border-white/10 p-6 space-y-4 flex flex-col justify-between relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="space-y-3 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-400 block">
                Platform Economic Rule
              </span>
              <div className="text-2xl font-extrabold text-white">
                1 Hour = <span className="text-gradient">10 Credits</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed">
                Every 1 hour taught earns 10 credits. Every 1 hour learned costs 10 credits. Direct swaps require zero credits exchanged.
              </p>
            </div>
            <div className="pt-2 text-[11px] text-violet-300 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>Zero transaction or platform fees</span>
            </div>
          </div>
        </section>

        {/* ── 3. ACTIVE SESSIONS LIST ── */}
        <section className="rounded-3xl glass border-white/10 p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <div>
              <h2 className="text-base font-extrabold text-white">
                Active sessions &amp; commitments
              </h2>
              <p className="text-xs text-white/45 mt-0.5">
                States: requested → active → complete. Click &ldquo;Mark complete&rdquo; to release held credits.
              </p>
            </div>
            <span className="text-xs font-bold text-violet-300 glass px-3 py-1 rounded-full border-violet-500/20">
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
                  className="rounded-2xl bg-white/[0.02] border border-white/8 p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/15 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={sess.partnerAvatar}
                      alt={sess.partnerName}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          {sess.partnerName}
                        </span>
                        {/* Session Type Pill */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isDirect
                              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          }`}
                        >
                          {isDirect ? "Direct Swap" : "Credit Escrow (10c)"}
                        </span>
                        {/* State Badge */}
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                            sess.state === "active"
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              : sess.state === "requested"
                              ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                              : "bg-white/5 text-white/50 border border-white/10"
                          }`}
                        >
                          {sess.state}
                        </span>
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        <strong className="text-white font-semibold">
                          {sess.skillName}
                        </strong>{" "}
                        · {sess.timeSlot}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    {isActive && !isDirect && (
                      <button
                        type="button"
                        onClick={() => handleMarkComplete(sess.id)}
                        className="px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:opacity-95"
                        style={{
                          background:
                            "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)",
                        }}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Complete</span>
                      </button>
                    )}

                    {isComplete && (
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Released</span>
                      </span>
                    )}

                    <Link
                      href="/messages"
                      className="px-3.5 py-2 rounded-xl glass hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white border-white/10 transition-colors"
                    >
                      Open Chat
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. TRANSACTION HISTORY LOG ── */}
        <section className="rounded-3xl glass border-white/10 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <h2 className="text-base font-extrabold text-white">
              Transaction history
            </h2>
            <span className="text-xs text-white/40">
              {transactions.length} entries
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="py-4 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isPositive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        {tx.title}
                      </p>
                      <p className="text-[11px] text-white/45 mt-0.5">
                        {tx.description} · {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-extrabold font-mono ${
                        isPositive
                          ? "text-emerald-400"
                          : "text-white"
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} Credits
                    </span>
                    <span className="block text-[10px] text-white/40 font-medium mt-0.5">
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