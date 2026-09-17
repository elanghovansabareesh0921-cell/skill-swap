"use client";

import React, { useState } from "react";
import { useSkillSwap } from "@/context/SkillSwapContext";
import { X, Check, Sparkles, Shield, CreditCard } from "lucide-react";

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 50,
    price: "$19",
    tagline: "Great for trying out 4–5 swap sessions",
    popular: false,
    perks: ["50 swap credits", "Standard booking access", "Full community access"],
  },
  {
    id: "popular",
    name: "Popular",
    credits: 100,
    price: "$35",
    tagline: "Best value for active learners and switchers",
    popular: true,
    perks: [
      "100 swap credits (save 10%)",
      "Priority session matching",
      "Interactive code whiteboard tools",
      "Permanent session recordings",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    credits: 250,
    price: "$79",
    tagline: "For deep mastery across multiple domains",
    popular: false,
    perks: [
      "250 swap credits (save 20%)",
      "All Popular perks included",
      "Dedicated 1-on-1 mentor matching",
      "Skill certification badges",
    ],
  },
];

export default function BuyCreditsModal({ isOpen, onClose }: BuyCreditsModalProps) {
  const { buyCredits } = useSkillSwap();
  const [selectedPackage, setSelectedPackage] = useState<string>("popular");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handlePurchase = (pkg: (typeof CREDIT_PACKAGES)[0]) => {
    setIsProcessing(true);
    setTimeout(() => {
      buyCredits(pkg.credits, pkg.price);
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-gray-200/90 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-md mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Credit Wallet Refill
          </span>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            Need credits to learn?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            Buy credits and start learning from skilled members immediately, or earn them anytime by teaching.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {CREDIT_PACKAGES.map((pkg) => {
            const isSelected = selectedPackage === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`relative rounded-2xl border p-5 cursor-pointer transition-all flex flex-col justify-between ${
                  pkg.popular
                    ? "border-indigo-600 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-600"
                    : isSelected
                    ? "border-gray-900 bg-gray-50/50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                {pkg.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most Popular
                  </span>
                )}

                <div>
                  <h4 className="text-sm font-bold text-gray-900">{pkg.name}</h4>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-gray-900">{pkg.price}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 font-mono">
                    <span>🪙 {pkg.credits} Credits</span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-2 leading-normal">
                    {pkg.tagline}
                  </p>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-1.5">
                    {pkg.perks.map((perk, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(pkg);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      pkg.popular
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {isProcessing && selectedPackage === pkg.id
                      ? "Processing..."
                      : `Get ${pkg.credits} Credits`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Note */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>No monthly subscription. Credits never expire and transfer safely upon session completion.</span>
        </div>
      </div>
    </div>
  );
}
