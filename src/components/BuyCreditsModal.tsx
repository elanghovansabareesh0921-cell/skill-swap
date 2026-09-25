"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useSkillSwap } from "@/context/SkillSwapContext";
import { processRazorpayCheckout } from "@/lib/razorpayClient";
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Building2,
  Lock,
  Info,
  Loader2,
  Zap,
} from "lucide-react";

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CREDIT_PACKAGES = [
  {
    id: "pack_50",
    name: "Starter Pack",
    credits: 50,
    amount: 50,
    price: "₹50",
    rate: "1 Credit = ₹1",
    tagline: "Ideal for trying out 5 standard swap sessions",
    popular: false,
    perks: ["50 swap credits", "Standard session matching", "Access to community"],
  },
  {
    id: "pack_100",
    name: "Growth Pack",
    credits: 100,
    amount: 100,
    price: "₹100",
    rate: "1 Credit = ₹1",
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
    id: "pack_250",
    name: "Mastery Pack",
    credits: 250,
    amount: 250,
    price: "₹250",
    rate: "1 Credit = ₹1",
    tagline: "For deep ongoing mentorship across multiple domains",
    popular: false,
    perks: [
      "250 swap credits",
      "All Growth perks included",
      "Priority reciprocal pairing",
      "Certificates of completion",
    ],
  },
  {
    id: "pack_500",
    name: "Pro Pack",
    credits: 500,
    amount: 500,
    price: "₹500",
    rate: "1 Credit = ₹1",
    tagline: "Maximum value for intensive skill acceleration",
    popular: false,
    perks: [
      "500 swap credits",
      "Fast-track mentor intros",
      "Verified mastery badges",
      "Permanent community access",
    ],
  },
];

export default function BuyCreditsModal({ isOpen, onClose }: BuyCreditsModalProps) {
  const { currentUser, buyCredits } = useSkillSwap();
  const [selectedPackage, setSelectedPackage] = useState<string>("pack_100");
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState<boolean>(false);

  // Razorpay State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  if (!isOpen) return null;

  const activePkg = CREDIT_PACKAGES.find((p) => p.id === selectedPackage) || CREDIT_PACKAGES[1];
  const currentCredits = isCustom ? Number(customAmount) || 0 : activePkg.credits;
  const currentAmount = isCustom ? Number(customAmount) || 0 : activePkg.amount;

  const handlePayWithRazorpay = () => {
    if (currentAmount <= 0) return;

    processRazorpayCheckout({
      amount: currentAmount,
      credits: currentCredits,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      onProcessing: (proc) => setIsProcessing(proc),
      onSuccess: (creditsAdded, amountPaid, method, newBalance) => {
        buyCredits(creditsAdded, `₹${amountPaid}`, method, newBalance);
        setStatusMessage(`Successfully added ${creditsAdded} Credits!`);
        setTimeout(() => {
          setStatusMessage("");
          onClose();
        }, 1200);
      },
      onError: (errMsg) => {
        alert(errMsg || "Payment failed. Please try again.");
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-2xl p-6 sm:p-8 relative max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#71717A] hover:text-[#18181B] dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Wallet Top-up</span>
          </div>
          <h3 className="text-2xl font-bold text-[#18181B] dark:text-white">Buy Swap Credits</h3>
          <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-1">
            Flat pricing: <strong className="text-[#18181B] dark:text-white font-semibold">1 Credit = ₹1 INR</strong>. Learn from any mentor instantly.
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
          {CREDIT_PACKAGES.map((pkg) => {
            const isSelected = !isCustom && selectedPackage === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => {
                  setIsCustom(false);
                  setSelectedPackage(pkg.id);
                }}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "border-[#7C3AED] bg-[#EDE9FE]/30 dark:bg-[#231C3D]/50 shadow-sm ring-2 ring-[#7C3AED]"
                    : "border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#161327] hover:border-[#A78BFA]"
                }`}
              >
                <div>
                  {pkg.popular && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[#7C3AED] text-white text-[8px] font-bold uppercase mb-1">
                      Popular
                    </span>
                  )}
                  <h4 className="text-xs font-bold text-[#18181B] dark:text-white line-clamp-1">{pkg.name}</h4>
                  <div className="my-1">
                    <span className="text-xl font-extrabold text-[#18181B] dark:text-white font-mono">
                      {pkg.price}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] font-mono">
                    🪙 {pkg.credits} Credits
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Amount */}
        <div className="mt-3 p-3 rounded-2xl border border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#0E0C1B] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#7C3AED]" />
            <span className="text-xs font-semibold text-[#18181B] dark:text-white">
              Or enter custom credits (₹1 = 1 Credit):
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-[#71717A] font-bold">₹</span>
              <input
                type="number"
                min="10"
                max="50000"
                value={customAmount}
                placeholder="e.g. 75, 200"
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setIsCustom(true);
                }}
                onFocus={() => setIsCustom(true)}
                className="w-28 pl-7 pr-2.5 py-1.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#161327] text-xs font-mono font-bold text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <span className="text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] font-mono">
              = {customAmount ? Number(customAmount) : 0} 🪙
            </span>
          </div>
        </div>

        {/* RAZORPAY GATEWAY CHECKOUT */}
        <div className="mt-4 p-5 rounded-2xl border border-[#DDD6FE] dark:border-[#3B2D66] bg-[#EDE9FE]/20 dark:bg-[#231C3D]/30 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#18181B] dark:text-white">Razorpay API Gateway</h4>
              <p className="text-xs text-[#71717A] dark:text-zinc-400">
                Pay using Credit/Debit Cards, Netbanking, or Razorpay UPI
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-300">
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#161327] border border-zinc-200 dark:border-zinc-800">
              UPI
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#161327] border border-zinc-200 dark:border-zinc-800">
              RuPay / Visa / Mastercard
            </span>
            <span className="px-2 py-0.5 rounded bg-white dark:bg-[#161327] border border-zinc-200 dark:border-zinc-800">
              50+ Netbanking Banks
            </span>
          </div>

          <button
            type="button"
            onClick={handlePayWithRazorpay}
            disabled={isProcessing || currentAmount <= 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:opacity-95 text-white text-xs sm:text-sm font-semibold shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching Razorpay...</span>
              </>
            ) : statusMessage ? (
              <span>{statusMessage} ✓</span>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay ₹{currentAmount} with Razorpay</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-5 pt-3 border-t border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between text-[11px] text-[#71717A]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Securely processed by Razorpay</span>
          </span>
          <span className="font-semibold text-[#18181B] dark:text-white">
            Total: ₹{currentAmount} (+{currentCredits} 🪙)
          </span>
        </div>
      </div>
    </div>
  );
}
