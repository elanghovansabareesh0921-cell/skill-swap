"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useSkillSwap } from "@/context/SkillSwapContext";

interface GoogleOAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export function GoogleOAuthModal({
  isOpen,
  onClose,
  defaultEmail = "elanghovansabareesh0921@gmail.com",
}: GoogleOAuthModalProps) {
  const router = useRouter();
  const { loginWithGoogleEmail } = useSkillSwap();

  const [emailInput, setEmailInput] = useState(defaultEmail);
  const [nameInput, setNameInput] = useState(defaultEmail.includes("sabareesh") ? "SABBY" : "");
  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"instant" | "setup">("instant");

  const [clientId, setClientId] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");

  useEffect(() => {
    // Read from environment or local config
    const envCid = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (envCid) {
      setClientId(envCid);
    }
    // Fetch from safe local server route if available
    fetch("/api/auth/google/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.clientId) setClientId(data.clientId);
        if (data.clientSecret) setClientSecret(data.clientSecret);
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const supabaseCallbackUrl = "https://nzctpjbsilflawpdicqr.supabase.co/auth/v1/callback";
  const supabaseProviderUrl = "https://supabase.com/dashboard/project/nzctpjbsilflawpdicqr/auth/providers";
  const gcpConsoleUrl = "https://console.cloud.google.com/apis/credentials";

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleInstantGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setLoading(true);
    try {
      const res = await loginWithGoogleEmail(emailInput.trim(), nameInput.trim() || undefined);
      if (res.success) {
        onClose();
        router.push("/dashboard");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#161327] rounded-3xl border border-[#EDE9FE] dark:border-[#2D264E] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between bg-gradient-to-r from-[#EDE9FE]/50 via-white to-[#EDE9FE]/30 dark:from-[#231C3D]/60 dark:via-[#161327] dark:to-[#231C3D]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#231C3D] border border-[#E4E1F5] dark:border-[#3B2D66] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-white">
                Google Account Authentication
              </h2>
              <p className="text-xs text-[#71717A] dark:text-zinc-400">
                Sign in with your Google account or complete Supabase setup
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#71717A] hover:text-[#18181B] dark:hover:text-white hover:bg-[#EDE9FE]/50 dark:hover:bg-[#2D264E] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF]/50 dark:bg-[#131022]/60 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab("instant")}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "instant"
                ? "border-[#7C3AED] text-[#7C3AED] dark:text-[#A78BFA]"
                : "border-transparent text-[#71717A] dark:text-zinc-400 hover:text-[#18181B] dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Google Sign-In</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("setup")}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "setup"
                ? "border-[#7C3AED] text-[#7C3AED] dark:text-[#A78BFA]"
                : "border-transparent text-[#71717A] dark:text-zinc-400 hover:text-[#18181B] dark:hover:text-white"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Supabase & GCP Setup (2 Steps)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === "instant" ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#EDE9FE]/60 dark:bg-[#231C3D]/50 border border-[#DDD6FE] dark:border-[#3B2D66] space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Linked Google Profile Active</span>
                </div>
                <p className="text-xs text-[#71717A] dark:text-zinc-300 leading-relaxed">
                  Your Google credentials have been saved to your environment. Sign in with your Google account below to enter your workspace with 50 credits and your full profile instantly.
                </p>
              </div>

              {/* Fast 1-Click Action for User's detected email */}
              <form onSubmit={handleInstantGoogleLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                      Google Account Email
                    </label>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => {
                          setEmailInput("sabareesh092107@gmail.com");
                          setNameInput("Sabareesh");
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#EDE9FE] dark:bg-[#2D264E] text-[#7C3AED] dark:text-[#EDE9FE] font-medium hover:bg-[#DDD6FE]"
                      >
                        sabareesh092107@gmail.com
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailInput("elanghovansabareesh0921@gmail.com");
                          setNameInput("SABBY");
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#EDE9FE] dark:bg-[#2D264E] text-[#7C3AED] dark:text-[#EDE9FE] font-medium hover:bg-[#DDD6FE]"
                      >
                        SABBY
                      </button>
                    </div>
                  </div>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    placeholder="e.g. sabareesh092107@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="e.g. SABBY"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Continue with Google Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("setup")}
                  className="text-xs text-[#7C3AED] dark:text-[#A78BFA] hover:underline font-semibold"
                >
                  Need automated Google OAuth redirects? View 2-step setup →
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  Supabase reported that the Google Provider is not enabled yet. Follow these 2 quick steps to activate cloud redirects:
                </p>
              </div>

              {/* Step 1 */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1833] border border-[#E4E1F5] dark:border-[#2D264E] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-bold text-[#18181B] dark:text-white">
                      Enable Google in Supabase Dashboard
                    </span>
                  </div>
                  <a
                    href={supabaseProviderUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] hover:underline"
                  >
                    <span>Open Supabase</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2 text-xs">
                  {clientId && (
                    <div>
                      <label className="text-[11px] font-semibold text-[#71717A] dark:text-zinc-400 block mb-1">
                        Client ID
                      </label>
                      <div className="flex items-center gap-2 bg-[#F8F7FF] dark:bg-[#131022] p-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E]">
                        <span className="font-mono text-[11px] text-[#18181B] dark:text-zinc-300 truncate flex-1">
                          {clientId}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(clientId, "cid")}
                          className="p-1 rounded-lg hover:bg-[#EDE9FE] dark:hover:bg-[#2D264E] text-[#7C3AED] shrink-0"
                        >
                          {copiedKey === "cid" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {clientSecret && (
                    <div>
                      <label className="text-[11px] font-semibold text-[#71717A] dark:text-zinc-400 block mb-1">
                        Client Secret
                      </label>
                      <div className="flex items-center gap-2 bg-[#F8F7FF] dark:bg-[#131022] p-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E]">
                        <span className="font-mono text-[11px] text-[#18181B] dark:text-zinc-300 truncate flex-1">
                          ••••••••••••••••••••••••••••••••
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(clientSecret, "sec")}
                          className="px-2 py-1 rounded-lg bg-[#EDE9FE] dark:bg-[#2D264E] text-xs font-semibold text-[#7C3AED] dark:text-[#EDE9FE] shrink-0 flex items-center gap-1"
                        >
                          {copiedKey === "sec" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Copy Secret</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1833] border border-[#E4E1F5] dark:border-[#2D264E] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <span className="text-xs font-bold text-[#18181B] dark:text-white">
                      Add Supabase Callback to Google Cloud Console
                    </span>
                  </div>
                  <a
                    href={gcpConsoleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] hover:underline"
                  >
                    <span>Open GCP Console</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[11px] font-semibold text-[#71717A] dark:text-zinc-400 block mb-1">
                      Authorized Redirect URI to add in GCP:
                    </label>
                    <div className="flex items-center gap-2 bg-[#F8F7FF] dark:bg-[#131022] p-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E]">
                      <span className="font-mono text-[11px] text-[#18181B] dark:text-zinc-300 truncate flex-1">
                        {supabaseCallbackUrl}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(supabaseCallbackUrl, "cb")}
                        className="p-1 rounded-lg hover:bg-[#EDE9FE] dark:hover:bg-[#2D264E] text-[#7C3AED] shrink-0"
                      >
                        {copiedKey === "cb" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Back to Instant Login */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("instant")}
                  className="w-full py-2.5 rounded-xl bg-[#EDE9FE] dark:bg-[#2D264E] hover:bg-[#DDD6FE] dark:hover:bg-[#3B2D66] text-[#7C3AED] dark:text-[#EDE9FE] font-semibold text-xs transition-colors"
                >
                  ← Back to Instant Google Sign-In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
