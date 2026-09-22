"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  X,
  QrCode,
  Check,
  Copy,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Building2,
  Lock,
  Loader2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  credits: number;
}

export default function UpiPaymentModal({
  isOpen,
  onClose,
  amount,
  credits,
}: UpiPaymentModalProps) {
  const { currentUser, buyCredits } = useSkillSwap();
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const upiId = process.env.NEXT_PUBLIC_ADMIN_UPI_ID || "9361775890@upi";
  const payeeName = process.env.NEXT_PUBLIC_ADMIN_UPI_NAME || "Bhimuser";

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount}&cu=INR&tn=${encodeURIComponent(`SkillSwap ${credits} Credits`)}`;

  useEffect(() => {
    if (!isOpen) {
      setUtrNumber("");
      setIsVerifying(false);
      setIsSuccess(false);
      setErrorMessage("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyUpiPayment = async () => {
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 4) {
      setErrorMessage("Please enter your 12-digit UPI Reference / UTR Number from your payment app.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/payment/upi/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utr: cleanUtr,
          amount,
          credits,
          userId: currentUser.id,
          upiId,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Payment verification failed. Please check your UTR number.");
      }

      buyCredits(credits, `₹${amount}`, `UPI Transfer (${cleanUtr})`);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not verify UPI payment. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-2xl p-6 sm:p-7 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#71717A] hover:text-[#18181B] dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center max-w-sm mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Direct UPI Bank Transfer (0% Fee)</span>
          </div>
          <h3 className="text-2xl font-bold text-[#18181B] dark:text-white">Scan &amp; Pay ₹{amount}</h3>
          <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-1">
            Top up <strong className="text-[#7C3AED] dark:text-[#A78BFA] font-bold">{credits} Swap Credits</strong> directly to the account.
          </p>
        </div>

        {/* QR Code Card */}
        <div className="mt-5 p-5 rounded-2xl border border-[#DDD6FE] dark:border-[#3B2D66] bg-[#F8F7FF] dark:bg-[#0E0C1B] flex flex-col items-center text-center space-y-3">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-zinc-200 relative">
            <Image
              src="/upi-qr.png"
              alt="UPI QR Code"
              width={220}
              height={220}
              className="rounded-lg object-contain"
              priority
            />
          </div>

          <p className="text-xs font-semibold text-[#18181B] dark:text-white flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#7C3AED]" />
            <span>Scan with Google Pay, PhonePe, Paytm, Navi, or BHIM</span>
          </p>

          {/* Direct Mobile UPI Intent Button */}
          <a
            href={upiDeepLink}
            className="w-full max-w-xs py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-95 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all sm:hidden"
          >
            <Smartphone className="w-4 h-4" />
            <span>Open in Any UPI App (Pay ₹{amount})</span>
          </a>

          {/* UPI ID Copy Pill */}
          <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-xs">
            <div className="text-left truncate mr-2">
              <span className="block text-[10px] text-[#71717A] uppercase font-bold tracking-wider">UPI ID / VPA</span>
              <span className="font-mono font-bold text-[#18181B] dark:text-white">{upiId}</span>
            </div>
            <button
              type="button"
              onClick={handleCopyUpiId}
              className="px-3 py-1.5 rounded-lg bg-[#EDE9FE] dark:bg-[#231C3D] hover:bg-[#DDD6FE] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy ID"}</span>
            </button>
          </div>
        </div>

        {/* Verification / UTR Input Section */}
        <div className="mt-5 space-y-3">
          <div>
            <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">
              Enter 12-Digit UPI Ref / UTR No. (after paying)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => {
                  setUtrNumber(e.target.value);
                  setErrorMessage("");
                }}
                placeholder="e.g. 423589123456 or last 6 digits"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-xs font-mono text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleVerifyUpiPayment}
                disabled={isVerifying || !utrNumber.trim()}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
              >
                {isVerifying ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5" />
                )}
                <span>{isVerifying ? "Verifying..." : isSuccess ? "Credited! ✓" : "Claim Credits"}</span>
              </button>
            </div>
            {errorMessage && (
              <p className="text-[11px] text-red-500 mt-1">{errorMessage}</p>
            )}
          </div>

          {/* Quick Demo Simulator for Testing */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs">
            <span className="text-amber-800 dark:text-amber-300 text-[11px]">
              Testing locally? You can auto-fill a test UTR:
            </span>
            <button
              type="button"
              onClick={() => {
                const sampleUtr = `423${Math.floor(100000000 + Math.random() * 900000000)}`;
                setUtrNumber(sampleUtr);
              }}
              className="text-[#7C3AED] dark:text-[#A78BFA] font-bold hover:underline shrink-0 text-[11px]"
            >
              Fill Sample UTR
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between text-[11px] text-[#71717A]">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-600" />
            <span>Account: {payeeName} ({upiId})</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="hover:underline text-zinc-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
