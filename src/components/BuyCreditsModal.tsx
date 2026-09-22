"use client";

import React, { useState } from "react";
import { useSkillSwap } from "@/context/SkillSwapContext";
import { X, Check, Sparkles, Shield, CreditCard, Smartphone, Building2, Lock, Info } from "lucide-react";

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter Pack",
    credits: 50,
    price: "$19",
    tagline: "Great for trying out 5 standard swap sessions",
    popular: false,
    perks: ["50 swap credits", "Standard session matching", "Access to community"],
  },
  {
    id: "popular",
    name: "Growth Pack",
    credits: 100,
    price: "$35",
    tagline: "Best value for active learners and switchers",
    popular: true,
    perks: [
      "100 swap credits",
      "Priority mentor matching",
      "Interactive code whiteboard tools",
      "Session notes & agenda summaries",
    ],
  },
  {
    id: "pro",
    name: "Mastery Pack",
    credits: 250,
    price: "$79",
    tagline: "For ongoing mastery across multiple domains",
    popular: false,
    perks: [
      "250 swap credits",
      "All Growth perks included",
      "Priority reciprocal pairing",
      "Certificates of completion",
    ],
  },
];

export default function BuyCreditsModal({ isOpen, onClose }: BuyCreditsModalProps) {
  const { buyCredits } = useSkillSwap();
  const [selectedPackage, setSelectedPackage] = useState<string>("popular");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const activePkg = CREDIT_PACKAGES.find((p) => p.id === selectedPackage) || CREDIT_PACKAGES[1];

  const handlePurchase = () => {
    setIsProcessing(true);
    setTimeout(() => {
      buyCredits(activePkg.credits, activePkg.price);
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#71717A] hover:text-[#18181B] dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Credit Wallet Top-up</span>
          </div>
          <h3 className="text-2xl font-bold text-[#18181B] dark:text-white">Add Swap Credits</h3>
          <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-1">
            Learn from mentors anytime without waiting to teach first.
          </p>
        </div>

        {/* Notice on sandbox simulation */}
        <div className="mt-4 p-3 rounded-xl bg-[#EDE9FE]/50 dark:bg-[#231C3D]/40 border border-[#DDD6FE] dark:border-[#3B2D66] text-xs text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0" />
          <span>Payment provider integration structured. Top-ups immediately fund your active wallet for testing.</span>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          {CREDIT_PACKAGES.map((pkg) => {
            const isSelected = selectedPackage === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-[#7C3AED] bg-[#EDE9FE]/30 dark:bg-[#231C3D]/50 shadow-sm ring-1 ring-[#7C3AED]"
                    : "border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#161327] hover:border-[#A78BFA]"
                }`}
              >
                <div>
                  {pkg.popular && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#7C3AED] text-white text-[9px] font-bold uppercase mb-2">
                      Popular
                    </span>
                  )}
                  <h4 className="text-xs font-bold text-[#18181B] dark:text-white">{pkg.name}</h4>
                  <div className="my-1.5">
                    <span className="text-2xl font-extrabold text-[#18181B] dark:text-white font-mono">{pkg.price}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] font-mono">
                    🪙 {pkg.credits} Credits
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-[#71717A] space-y-1">
                  {pkg.perks.slice(0, 2).map((perk, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#71717A] block">Total Amount:</span>
            <span className="text-base font-bold text-[#18181B] dark:text-white">{activePkg.price}</span>
          </div>

          <button
            type="button"
            onClick={handlePurchase}
            disabled={isProcessing || isSuccess}
            className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center gap-2"
          >
            {isProcessing ? (
              <span>Processing...</span>
            ) : isSuccess ? (
              <span>Credits Added! ✓</span>
            ) : (
              <span>Complete Top-up (Sandbox)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
