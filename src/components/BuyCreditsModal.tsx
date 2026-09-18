"use client";

import React, { useState } from "react";
import { useSkillSwap } from "@/context/SkillSwapContext";
import { X, Check, Sparkles, Shield, CreditCard, Smartphone, Building2, Lock } from "lucide-react";

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CREDIT_PACKAGES = [
  {
    id: "starter",
    name: "Starter",
    credits: 50,
    price: "₹499",
    tagline: "Great for trying out 4–5 swap sessions",
    popular: false,
    perks: ["50 swap credits", "Standard booking access", "Full community access"],
  },
  {
    id: "popular",
    name: "Popular",
    credits: 100,
    price: "₹899",
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
    price: "₹1,999",
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

const PAYMENT_METHODS = [
  { id: "upi", name: "UPI / QR", desc: "GPay, PhonePe, Paytm, BHIM", icon: Smartphone },
  { id: "card", name: "Cards / RuPay", desc: "Visa, Mastercard & RuPay", icon: CreditCard },
  { id: "netbanking", name: "Net Banking", desc: "SBI, HDFC, ICICI, Axis & more", icon: Building2 },
];

export default function BuyCreditsModal({ isOpen, onClose }: BuyCreditsModalProps) {
  const { buyCredits } = useSkillSwap();
  const [selectedPackage, setSelectedPackage] = useState<string>("popular");
  const [selectedMethod, setSelectedMethod] = useState<string>("upi");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  if (!isOpen) return null;

  const activePkg = CREDIT_PACKAGES.find((p) => p.id === selectedPackage) || CREDIT_PACKAGES[1];

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
            Credit Wallet Refill (INR)
          </span>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">
            Need credits to learn?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            Buy credits in Indian Rupees (₹) to book sessions instantly, or earn them by teaching peers.
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
                    ? "border-gray-900 bg-gray-50/50 shadow-sm"
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
                    <span className="text-[11px] text-gray-500 font-medium">INR</span>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPackage(pkg.id);
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                    }`}
                  >
                    {isSelected ? "Selected" : "Choose"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indian Payment Options Selector */}
        <div className="mt-6 p-4 rounded-xl bg-gray-50/80 border border-gray-200/80">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-gray-700">Select Payment Method (INR)</span>
            <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <Lock className="w-3 h-3" /> 256-Bit Encrypted
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-indigo-600 bg-white ring-1 ring-indigo-600 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-indigo-600" : "text-gray-500"}`} />
                    <span className="text-xs font-bold text-gray-900">{method.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 line-clamp-1">{method.desc}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => handlePurchase(activePkg)}
            className="w-full mt-3.5 py-2.5 px-4 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span>Processing payment of {activePkg.price}...</span>
            ) : (
              <span>Pay {activePkg.price} via {PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name} (+{activePkg.credits} Credits)</span>
            )}
          </button>
        </div>

        {/* Trust Note */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No monthly subscription. Credits never expire.</span>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">Instant delivery to wallet</span>
        </div>
      </div>
    </div>
  );
}
