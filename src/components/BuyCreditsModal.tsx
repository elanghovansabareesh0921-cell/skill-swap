"use client";

import React, { useState } from "react";
import Image from "next/image";
import QRCode from "react-qr-code";
import { useSkillSwap } from "@/context/SkillSwapContext";
import { processRazorpayCheckout } from "@/lib/razorpayClient";
import {
  X,
  Check,
  Sparkles,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building2,
  Lock,
  Info,
  Loader2,
  Zap,
  QrCode,
  Copy,
  ArrowRight,
  CheckCircle2,
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
  const [paymentTab, setPaymentTab] = useState<"upi" | "razorpay">("razorpay");

  // Razorpay State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // UPI State
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [utrNumber, setUtrNumber] = useState<string>("");
  const [isVerifyingUpi, setIsVerifyingUpi] = useState<boolean>(false);
  const [upiSuccess, setUpiSuccess] = useState<boolean>(false);
  const [upiError, setUpiError] = useState<string>("");

  const upiId = process.env.NEXT_PUBLIC_ADMIN_UPI_ID || "9361775890@upi";
  const payeeName = process.env.NEXT_PUBLIC_ADMIN_UPI_NAME || "Bhimuser";

  if (!isOpen) return null;

  const activePkg = CREDIT_PACKAGES.find((p) => p.id === selectedPackage) || CREDIT_PACKAGES[1];
  const currentCredits = isCustom ? Number(customAmount) || 0 : activePkg.credits;
  const currentAmount = isCustom ? Number(customAmount) || 0 : activePkg.amount;

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${currentAmount}&cu=INR&tn=${encodeURIComponent(`SkillSwap ${currentCredits} Credits`)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleVerifyUpi = async () => {
    const clean = utrNumber.trim();
    if (!clean || clean.length < 4) {
      setUpiError("Please enter your 12-digit UPI Reference / UTR Number from your payment app.");
      return;
    }

    setIsVerifyingUpi(true);
    setUpiError("");

    try {
      const res = await fetch("/api/payment/upi/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utr: clean,
          amount: currentAmount,
          credits: currentCredits,
          userId: currentUser.id,
          upiId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Verification failed. Check your UTR number.");
      }

      buyCredits(currentCredits, `₹${currentAmount}`, `UPI (${clean})`);
      setUpiSuccess(true);
      setTimeout(() => {
        setUpiSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setUpiError(err.message || "Could not verify UPI payment.");
    } finally {
      setIsVerifyingUpi(false);
    }
  };

  const handlePayWithRazorpay = () => {
    if (currentAmount <= 0) return;

    processRazorpayCheckout({
      amount: currentAmount,
      credits: currentCredits,
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      onProcessing: (proc) => setIsProcessing(proc),
      onSuccess: (creditsAdded, amountPaid, method) => {
        buyCredits(creditsAdded, `₹${amountPaid}`, method);
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

        {/* Payment Channel Selector Tabs */}
        <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E]">
          <button
            type="button"
            onClick={() => setPaymentTab("upi")}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              paymentTab === "upi"
                ? "bg-white dark:bg-[#161327] text-[#18181B] dark:text-white shadow-xs"
                : "text-[#71717A] hover:text-[#18181B] dark:hover:text-white"
            }`}
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Scan UPI QR (Direct Transfer)</span>
          </button>

          <button
            type="button"
            onClick={() => setPaymentTab("razorpay")}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              paymentTab === "razorpay"
                ? "bg-white dark:bg-[#161327] text-[#18181B] dark:text-white shadow-xs"
                : "text-[#71717A] hover:text-[#18181B] dark:hover:text-white"
            }`}
          >
            <CreditCard className="w-4 h-4 text-[#7C3AED]" />
            <span>Razorpay (Cards / Netbanking)</span>
          </button>
        </div>

        {/* TAB 1: DIRECT UPI QR CODE SCAN */}
        {paymentTab === "upi" && (
          <div className="mt-4 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Authentic QR Image */}
              <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-zinc-200 shrink-0">
                <QRCode
                  value={upiDeepLink}
                  size={150}
                  style={{ height: "auto", maxWidth: "100%", width: "150px" }}
                />
              </div>

              <div className="space-y-2.5 text-center sm:text-left flex-1 min-w-0">
                <div>
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                    Pay ₹{currentAmount} to {payeeName}
                  </span>
                  <p className="text-[11px] text-[#71717A] dark:text-zinc-400">
                    Scan with any UPI app (Google Pay, PhonePe, Paytm, Navi, BHIM)
                  </p>
                </div>

                {/* Mobile Intent Button */}
                <a
                  href={upiDeepLink}
                  className="inline-flex sm:hidden py-2 px-4 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs items-center gap-2"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Open in UPI App (Pay ₹{currentAmount})</span>
                </a>

                {/* UPI ID Copy Pill */}
                <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#161327] border border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="truncate mr-2">
                    <span className="block text-[9px] text-[#71717A] uppercase font-bold">UPI ID</span>
                    <span className="font-mono font-bold text-[#18181B] dark:text-white">{upiId}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedUpi ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUpi ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* UTR Input Section */}
            <div className="pt-3 border-t border-emerald-200/60 dark:border-emerald-800/60 space-y-2">
              <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                Enter 12-digit UPI Reference / UTR Number to receive credits:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(e) => {
                    setUtrNumber(e.target.value);
                    setUpiError("");
                  }}
                  placeholder="e.g. 423589123456"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#161327] text-xs font-mono text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleVerifyUpi}
                  disabled={isVerifyingUpi || !utrNumber.trim()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {isVerifyingUpi ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : upiSuccess ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowRight className="w-3.5 h-3.5" />
                  )}
                  <span>{isVerifyingUpi ? "Checking..." : upiSuccess ? "Added!" : "Claim Credits"}</span>
                </button>
              </div>
              {upiError && <p className="text-[11px] text-red-500">{upiError}</p>}
            </div>
          </div>
        )}

        {/* TAB 2: RAZORPAY GATEWAY CHECKOUT */}
        {paymentTab === "razorpay" && (
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
        )}

        {/* Footer Info */}
        <div className="mt-5 pt-3 border-t border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between text-[11px] text-[#71717A]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Money settles directly into the bank account for {upiId}</span>
          </span>
          <span className="font-semibold text-[#18181B] dark:text-white">
            Total: ₹{currentAmount} (+{currentCredits} 🪙)
          </span>
        </div>
      </div>
    </div>
  );
}
