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
      name: "Starter",
      credits: 50,
      price: "₹499",
      description: "Ideal for trying out 4–5 swap sessions",
      popular: false,
    },
    {
      id: "popular",
      name: "Popular",
      credits: 100,
      price: "₹899",
      description: "Best value for active learners and switchers",
      popular: true,
    },
    {
      id: "pro",
      name: "Pro",
      credits: 250,
      price: "₹1,999",
      description: "For deep mastery across multiple domains",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar onOpenBuyCredits={() => setIsBuyModalOpen(true)} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Wallet Balance Header Card */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Wallet & Credits
              </span>
              <p className="text-xs text-gray-500 mt-1">Available Credits</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-mono tracking-tight">
                  🪙 {credits}
                </span>
                <span className="text-sm font-semibold text-gray-400">Credits</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>10 credits = 1 standard 60-minute session</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/teach"
                className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Earn Credits</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Buy Credits</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Packages: Need credits to learn? */}
        <div className="mt-10">
          <div className="text-center max-w-md mx-auto mb-6">
            <h2 className="text-xl font-bold text-gray-900">Need credits to learn?</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Top up your balance in Indian Rupees (₹ INR) to book sessions instantly, or earn by teaching.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-2xl border p-6 flex flex-col justify-between transition-all ${
                  pkg.popular
                    ? "border-indigo-600 ring-1 ring-indigo-600 shadow-md"
                    : "border-gray-200/90 shadow-sm hover:border-gray-300"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold uppercase tracking-wider text-white">
                    Popular
                  </span>
                )}

                <div>
                  <h3 className="text-sm font-bold text-gray-900">{pkg.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">{pkg.price}</span>
                    <span className="text-xs font-semibold text-gray-400">INR</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 font-mono">
                    <span>🪙 {pkg.credits} Credits</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => buyCredits(pkg.credits, pkg.price)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                      pkg.popular
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    <span>Pay {pkg.price}</span>
                    <span className="opacity-80">({pkg.credits} Credits)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Trust Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Instant credit via UPI, Cards & Net Banking</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-indigo-600" />
              <span>All prices in Indian Rupees (₹ INR)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Credits never expire</span>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4 text-gray-500" />
                <span>Transaction History</span>
              </h2>
              <p className="text-xs text-gray-500">
                Transparent log of all credits earned, spent, and topped up.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-gray-200/90 text-xs">
              {(["ALL", "EARNED", "SPENT", "PURCHASED"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    filterType === type
                      ? "bg-gray-900 text-white font-semibold"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {type === "ALL" ? "All" : type === "EARNED" ? "Earned" : type === "SPENT" ? "Spent" : "Bought"}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden divide-y divide-gray-100">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => {
                const isEarned = tx.type === "EARNED" || tx.type === "PURCHASED";
                return (
                  <div
                    key={tx.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm ${
                          isEarned
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-600"
                        }`}
                      >
                        {isEarned ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900">
                          {tx.title}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{tx.detail}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-bold font-mono ${
                          isEarned ? "text-emerald-600" : "text-gray-900"
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} credits
                      </span>
                      <span className="text-[11px] text-gray-400 block mt-0.5">{tx.date}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-gray-400">
                No transactions in this category yet.
              </div>
            )}
          </div>
        </div>
      </main>

      <BuyCreditsModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
      />
    </div>
  );
}