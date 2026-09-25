"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ActivityCard from "@/components/gamification/ActivityCard";
import CoinIcon from "@/components/common/CoinIcon";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  CheckCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
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
  const { credits, transactions: contextTransactions, showToast } = useSkillSwap();

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

  const [localCompletedTxs, setLocalCompletedTxs] = useState<Array<{
    id: string;
    title: string;
    description: string;
    amount: number;
    status: string;
    date: string;
  }>>([]);

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

  // Combined transactions
  const transactions = React.useMemo(() => {
    const fromContext = (contextTransactions || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.detail,
      amount: t.type === "SPENT" ? -Math.abs(t.amount) : Math.abs(t.amount),
      status: t.type === "PURCHASED" ? "Complete" : t.type === "EARNED" ? "Released" : "In Escrow",
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

    showToast("Session marked complete! 10 credits released to teacher.", "success");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-white cyber-grid transition-colors duration-200">
      <Navbar onOpenBuyCredits={() => setIsBuyModalOpen(true)} />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-[#181B22] text-xs font-black uppercase text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600] mb-2">
              <CoinIcon size={12} />
              <span>1 Hour = 10 Credits · Escrow Protected</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              Credits & wallet
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
              Track your hours taught and learned, active escrow, and credit transactions.
            </p>
          </div>

          <button
            onClick={() => setIsBuyModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs sm:text-sm font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
          >
            <CoinIcon size={16} />
            <span>Top up credits</span>
          </button>
        </div>

        {/* 1. TOP ACTIVITY CARD */}
        <section className="space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-zinc-400 block px-1">
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
          <div className="border-2 border-black bg-[#181B22] p-6 space-y-3 flex flex-col justify-between shadow-[6px_6px_0px_0px_#FFE600]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Available Balance
                </span>
                <CoinIcon size={22} />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-[#FFE600] font-mono">
                  {availableBalance}
                </span>
                <span className="text-sm font-black uppercase text-zinc-300">
                  Credits
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium">
                Enough for <strong className="text-white font-mono">{Math.floor(availableBalance / 10)} hours</strong> of peer learning.
              </p>
            </div>

            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="mt-2 w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 border-2 border-black bg-[#12141C] hover:bg-[#FFE600] hover:text-black text-xs font-black uppercase text-[#FFE600] shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            >
              <span>+ Buy credits (₹1 = 1 Credit)</span>
            </button>
          </div>

          {/* Card B: In Escrow */}
          <div className="border-2 border-black bg-[#181B22] p-6 space-y-3 shadow-[6px_6px_0px_0px_#38BDF8]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-zinc-400">
                Currently In Escrow
              </span>
              <div className="w-8 h-8 border-2 border-black bg-[#38BDF8] text-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-mono">
                {escrowBalance}
              </span>
              <span className="text-sm font-black uppercase text-zinc-300">
                Credits locked
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Held safely until active session is marked complete.
            </p>
          </div>

          {/* Card C: The Economic Rule */}
          <div className="border-2 border-black bg-[#181B22] p-6 space-y-3 shadow-[6px_6px_0px_0px_#A3E635]">
            <span className="text-xs font-black uppercase tracking-wider text-[#A3E635] block">
              Platform Rule
            </span>
            <div className="text-xl font-black uppercase text-white">
              1 Hour = 10 Credits
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed font-medium">
              Every 1 hour taught earns 10 credits. Every 1 hour learned costs 10 credits (or zero if direct swap).
            </p>
          </div>
        </section>

        {/* 3. ACTIVE SESSIONS LIST */}
        <section className="border-2 border-black bg-[#181B22] p-6 sm:p-7 space-y-5 shadow-[6px_6px_0px_0px_#000000]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <div>
              <h2 className="text-base font-black uppercase text-white">
                Active sessions
              </h2>
              <p className="text-xs text-zinc-400">
                States: requested → active → complete. Click &ldquo;Mark complete&rdquo; to release held credits.
              </p>
            </div>
            <span className="text-xs font-black uppercase text-black bg-[#FFE600] border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000000]">
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
                  className="border-2 border-black bg-[#12141C] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={sess.partnerAvatar}
                      alt={sess.partnerName}
                      className="w-11 h-11 object-cover border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black uppercase text-white">
                          {sess.partnerName}
                        </span>
                        {/* Session Type Pill */}
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                          isDirect
                            ? "bg-[#38BDF8] text-black"
                            : "bg-[#FFE600] text-black"
                        }`}>
                          {isDirect ? "Direct swap" : "Credit escrow (10c)"}
                        </span>
                        {/* State Badge */}
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 border border-black ${
                          sess.state === "active"
                            ? "bg-[#A3E635] text-black"
                            : sess.state === "requested"
                            ? "bg-[#FFE600] text-black"
                            : "bg-zinc-800 text-zinc-300"
                        }`}>
                          {sess.state}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 mt-1 font-mono">
                        <strong className="text-white font-sans">{sess.skillName}</strong> · {sess.timeSlot}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {isActive && !isDirect && (
                      <button
                        type="button"
                        onClick={() => handleMarkComplete(sess.id)}
                        className="px-4 py-2 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1.5 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Mark complete</span>
                      </button>
                    )}

                    {isComplete && (
                      <span className="text-xs font-black uppercase text-[#A3E635] flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 stroke-[3]" />
                        <span>Released</span>
                      </span>
                    )}

                    <Link
                      href="/messages"
                      className="px-3.5 py-2 border-2 border-black bg-[#181B22] hover:bg-[#1F2430] text-xs font-black uppercase text-zinc-300 hover:text-white"
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
        <section className="border-2 border-black bg-[#181B22] p-6 sm:p-7 space-y-4 shadow-[6px_6px_0px_0px_#000000]">
          <div className="flex items-center justify-between pb-3 border-b-2 border-black">
            <h2 className="text-base font-black uppercase text-white">
              Transaction history
            </h2>
            <span className="text-xs text-zinc-400 font-mono font-bold">
              {transactions.length} entries
            </span>
          </div>

          <div className="divide-y-2 divide-black">
            {transactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  className="py-3.5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 border-2 border-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_#000000] ${
                        isPositive
                          ? "bg-[#A3E635] text-black"
                          : "bg-[#FFE600] text-black"
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-black uppercase text-white">
                        {tx.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        {tx.description} · {tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-black font-mono ${
                        isPositive
                          ? "text-[#A3E635]"
                          : "text-white"
                      }`}
                    >
                      {isPositive ? `+${tx.amount}` : tx.amount} Credits
                    </span>
                    <span className="block text-[10px] text-zinc-400 font-black uppercase">
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