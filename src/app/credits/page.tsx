"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap, Transaction } from "@/context/SkillSwapContext";
import {
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  ShieldCheck,
  Check,
  Clock,
  History,
  CreditCard,
  CheckCircle2,
  Coins,
  Repeat,
  Info,
} from "lucide-react";

export default function CreditsWalletPage() {
  const { credits, transactions, buyCredits } = useSkillSwap();

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "EARNED" | "SPENT" | "PURCHASED">("ALL");

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === "ALL") return true;
    return tx.type === filterType;
  });

  const packages = [
    {
      id: "starter",
      name: "Starter Pack",
      credits: 50,
      price: "$19",
      description: "Ideal for trying out 5 standard 1-hour swap sessions",
      popular: false,
    },
    {
      id: "popular",
      name: "Growth Pack",
      credits: 100,
      price: "$35",
      description: "Best value for active learners and career switchers",
      popular: true,
    },
    {
      id: "pro",
      name: "Mastery Pack",
      credits: 250,
      price: "$79",
      description: "For deep ongoing mentorship across multiple complex domains",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar onOpenBuyCredits={() => setIsBuyModalOpen(true)} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Wallet Balance Header Card */}
        <div className="bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                Wallet & Credits
              </span>
              <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-1">Available Balance</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-[#18181B] dark:text-white font-mono tracking-tight">
                  🪙 {credits}
                </span>
                <span className="text-sm font-semibold text-[#71717A] dark:text-zinc-400">Credits</span>
              </div>
              <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>10 credits = 1 standard 60-minute swap session (escrow secured)</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/skills"
                className="px-5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[#18181B] dark:text-zinc-200 text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Earn by Teaching</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buy Credits</span>
              </button>
            </div>
          </div>
        </div>

        {/* EXPLAINER SECTIONS: EARN CREDITS & SPEND CREDITS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EARN CREDITS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              +
            </div>
            <h3 className="text-lg font-bold text-[#18181B] dark:text-white">
              Earn Credits Through Teaching
            </h3>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-300 leading-relaxed">
              Every time you host a 1-on-1 swap or mentorship session, you earn 10 credits upon completion. You can teach programming, design, foreign languages, or any specialized craft you know.
            </p>
            <div className="pt-2">
              <Link href="/skills" className="text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA] hover:underline">
                Add skills you can teach →
              </Link>
            </div>
          </div>

          {/* SPEND CREDITS */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center font-bold">
              -
            </div>
            <h3 className="text-lg font-bold text-[#18181B] dark:text-white">
              Spend Credits to Learn
            </h3>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-300 leading-relaxed">
              Credits allow you to learn from any practitioner on Skill Swap, even if they don&apos;t need your specific skills in return. Credits are safely escrowed until the call concludes.
            </p>
            <div className="pt-2">
              <Link href="/discover" className="text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA] hover:underline">
                Explore skills to learn →
              </Link>
            </div>
          </div>
        </div>

        {/* BUY CREDITS SECTION */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-xl font-bold text-[#18181B] dark:text-white">Buy Credits</h2>
              <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-0.5">
                Top up your wallet when you want to learn without teaching first.
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] font-medium w-fit flex items-center gap-1">
              <Info className="w-3.5 h-3.5" />
              <span>Stripe checkout integration structured</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                  pkg.popular
                    ? "border-[#7C3AED] bg-[#EDE9FE]/20 dark:bg-[#231C3D]/30 shadow-md ring-1 ring-[#7C3AED]"
                    : "border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#161327]"
                }`}
              >
                <div>
                  {pkg.popular && (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold mb-3">
                      Most Popular
                    </span>
                  )}
                  <h4 className="text-base font-bold text-[#18181B] dark:text-white">{pkg.name}</h4>
                  <div className="flex items-baseline gap-1.5 my-2">
                    <span className="text-3xl font-extrabold text-[#18181B] dark:text-white font-mono">{pkg.price}</span>
                    <span className="text-xs text-[#71717A] font-normal">one-time</span>
                  </div>
                  <p className="text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] font-mono mb-2">
                    🪙 {pkg.credits} Credits
                  </p>
                  <p className="text-xs text-[#71717A] dark:text-zinc-400 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      buyCredits(pkg.credits, pkg.price);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      pkg.popular
                        ? "bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm"
                        : "border border-[#E4E1F5] dark:border-[#2D264E] text-[#18181B] dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    Select {pkg.credits} Credits
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TRANSACTION HISTORY */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
              <h2 className="text-lg font-bold text-[#18181B] dark:text-white">Transaction History</h2>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5">
              {(["ALL", "EARNED", "SPENT", "PURCHASED"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterType(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    filterType === filter
                      ? "bg-[#7C3AED] text-white"
                      : "bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#71717A] hover:text-[#18181B] dark:hover:text-white border border-[#E4E1F5] dark:border-[#2D264E]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {filteredTransactions.length > 0 ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        tx.type === "EARNED"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                          : tx.type === "SPENT"
                          ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400"
                          : "bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA]"
                      }`}
                    >
                      {tx.type === "EARNED" ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : tx.type === "SPENT" ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#18181B] dark:text-white">{tx.title}</h4>
                      <p className="text-[11px] text-[#71717A] dark:text-zinc-400">{tx.detail}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-sm font-bold font-mono block ${
                        tx.amount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} credits
                    </span>
                    <span className="text-[10px] text-[#71717A] dark:text-zinc-500">{tx.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#71717A]">
              No transactions match the selected filter.
            </div>
          )}
        </div>
      </main>

      <BuyCreditsModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />
    </div>
  );
}