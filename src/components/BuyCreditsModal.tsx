"use client";

import React, { useState } from "react";
import { useSkillSwap } from "@/context/SkillSwapContext";
import { processRazorpayCheckout } from "@/lib/razorpayClient";
import {
  X,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Lock,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl border-2 border-black bg-[#181B22] shadow-[8px_8px_0px_0px_#FFE600] p-6 sm:p-8 relative max-h-[95vh] overflow-y-auto text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 border border-black bg-[#12141C] text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-[#12141C] text-[#FFE600] text-xs font-black uppercase shadow-[2px_2px_0px_0px_#FFE600] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Wallet Top-up</span>
          </div>
          <h3 className="text-2xl font-black uppercase text-white tracking-tight">Buy Swap Credits</h3>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Flat pricing: <strong className="text-white font-bold">1 Credit = ₹1 INR</strong>. Learn from any mentor instantly.
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
                className={`p-3.5 border-2 border-black cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000]"
                    : "bg-[#12141C] text-white hover:border-[#FFE600]"
                }`}
              >
                <div>
                  {pkg.popular && (
                    <span className="inline-block px-1.5 py-0.5 border border-black bg-black text-[#FFE600] text-[8px] font-black uppercase mb-1">
                      Popular
                    </span>
                  )}
                  <h4 className={`text-xs font-black uppercase line-clamp-1 ${isSelected ? "text-black" : "text-white"}`}>{pkg.name}</h4>
                  <div className="my-1">
                    <span className={`text-xl font-black font-mono ${isSelected ? "text-black" : "text-white"}`}>
                      {pkg.price}
                    </span>
                  </div>
                  <p className={`text-xs font-black font-mono ${isSelected ? "text-black" : "text-[#FFE600]"}`}>
                    🪙 {pkg.credits} Credits
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Amount */}
        <div className="mt-3 p-3 border-2 border-black bg-[#12141C] flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000000]">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FFE600]" />
            <span className="text-xs font-black uppercase text-white">
              Custom credits (₹1 = 1c):
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs text-zinc-400 font-bold font-mono">₹</span>
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
                className="w-28 pl-7 pr-2.5 py-1.5 border-2 border-black bg-[#181B22] text-xs font-mono font-bold text-white focus:outline-none focus:border-[#FFE600]"
              />
            </div>
            <span className="text-xs font-black text-[#FFE600] font-mono">
              = {customAmount ? Number(customAmount) : 0} 🪙
            </span>
          </div>
        </div>

        {/* RAZORPAY GATEWAY CHECKOUT */}
        <div className="mt-4 p-5 border-2 border-black bg-[#12141C] shadow-[4px_4px_0px_0px_#38BDF8] space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black uppercase text-white">Razorpay API Gateway</h4>
              <p className="text-xs text-zinc-400 font-mono">
                Cards, Netbanking, or UPI
              </p>
            </div>
            <ShieldCheck className="w-5 h-5 text-[#A3E635]" />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase text-zinc-300">
            <span className="px-2 py-0.5 bg-[#181B22] border border-black">
              UPI
            </span>
            <span className="px-2 py-0.5 bg-[#181B22] border border-black">
              RuPay / Visa / Mastercard
            </span>
            <span className="px-2 py-0.5 bg-[#181B22] border border-black">
              50+ Netbanking Banks
            </span>
          </div>

          <button
            type="button"
            onClick={handlePayWithRazorpay}
            disabled={isProcessing || currentAmount <= 0}
            className="w-full py-3 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs sm:text-sm font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Launching Razorpay...</span>
              </>
            ) : statusMessage ? (
              <span>{statusMessage} ✓</span>
            ) : (
              <>
                <CreditCard className="w-4 h-4 stroke-[2.5]" />
                <span>Pay ₹{currentAmount} with Razorpay</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-5 pt-3 border-t-2 border-black flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#A3E635]" />
            <span>Securely processed by Razorpay</span>
          </span>
          <span className="font-bold text-white uppercase">
            Total: ₹{currentAmount} (+{currentCredits} 🪙)
          </span>
        </div>
      </div>
    </div>
  );
}
