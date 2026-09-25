"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useSkillSwap } from "@/context/SkillSwapContext";
import ThemeToggle from "@/components/ThemeToggle";
import { GoogleOAuthModal } from "@/components/GoogleOAuthModal";
import {
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const router = useRouter();
  const supabase = createClient();
  const { loginWithGoogle, showToast } = useSkillSwap();

  const validateForm = () => {
    const errors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      errors.fullName = "Please enter your full name";
    }

    if (!email.trim()) {
      errors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email format";
    }

    if (!password) {
      errors.password = "Please enter a password";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: username.trim() || fullName.trim().toLowerCase().replace(/\s+/g, ""),
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered") || error.message.includes("User already exists")) {
          setErrorMsg("An account with this email already exists. Please log in.");
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        document.cookie = "skillswap_session=true; path=/; max-age=2592000; SameSite=Lax";
      }
      showToast("Account Created! 🎉", "Welcome to Skill Swap. Let's customize your profile.", "success");
      router.push("/onboarding");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setErrorMsg("");
    const res = await loginWithGoogle();
    if (!res.success) {
      setGoogleLoading(false);
      if (res.requiresConfig) {
        setIsGoogleModalOpen(true);
      } else {
        setErrorMsg(res.error || "Google authentication initialization failed.");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA]">
      {/* Top Navigation Control */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#E4E1F5] dark:border-[#2D264E] bg-white/80 dark:bg-[#161327]/80 backdrop-blur-sm text-[#71717A] dark:text-zinc-300 hover:text-[#7C3AED]"
        >
          Home
        </Link>
      </div>

      {/* DESKTOP LEFT BRANDING PANEL */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#7C3AED] via-[#8B5CF6] to-[#6D28D9] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute top-12 right-12 w-64 h-64 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <Link href="/" className="flex items-center gap-3 w-fit focus:outline-none z-10">
          <div className="w-10 h-10 rounded-xl bg-white text-[#7C3AED] flex items-center justify-center font-bold text-xl shadow-sm">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Skill Swap</span>
        </Link>

        <div className="max-w-md my-auto space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#EDE9FE]" />
            <span>Get 50 Free Welcome Credits</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Start learning, teaching, and connecting with people.
          </h2>
          <p className="text-sm lg:text-base text-purple-100 leading-relaxed font-normal">
            Create an account to discover hundreds of skills, match with reciprocal learners, and book 1-on-1 collaborative sessions.
          </p>

          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-purple-100">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>50 free bonus credits upon registration</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-purple-100">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Offer what you know or spend credits to learn</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-purple-100">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Smart matching powered by Gemini AI</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-purple-200 z-10">
          © 2026 Skill Swap Platform.
        </div>
      </div>

      {/* RIGHT SIGNUP FORM PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          <div className="md:hidden flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center font-bold text-sm">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-[#18181B] dark:text-white">
              Skill Swap
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white tracking-tight">
              Create your Skill Swap account
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
              Start learning, teaching, and connecting with people.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                placeholder="Alex Rivera"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161327] border text-sm text-[#18181B] dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${
                  fieldErrors.fullName
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#E4E1F5] dark:border-[#2D264E] focus:border-[#7C3AED]"
                }`}
                disabled={loading}
              />
              {fieldErrors.fullName && (
                <p className="text-[11px] text-red-600 dark:text-red-400">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="name@email.com"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161327] border text-sm text-[#18181B] dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${
                  fieldErrors.email
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#E4E1F5] dark:border-[#2D264E] focus:border-[#7C3AED]"
                }`}
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 dark:text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="At least 6 characters"
                  className={`w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#161327] border text-sm text-[#18181B] dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${
                    fieldErrors.password
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#E4E1F5] dark:border-[#2D264E] focus:border-[#7C3AED]"
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#18181B] dark:hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-red-600 dark:text-red-400">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                placeholder="Repeat password"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161327] border text-sm text-[#18181B] dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${
                  fieldErrors.confirmPassword
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#E4E1F5] dark:border-[#2D264E] focus:border-[#7C3AED]"
                }`}
                disabled={loading}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-red-600 dark:text-red-400">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E4E1F5] dark:border-[#2D264E]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F8F7FF] dark:bg-[#0E0C1B] px-3 font-semibold text-[#71717A] tracking-wider">
                OR
              </span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="w-full py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#161327] hover:bg-[#EDE9FE]/40 dark:hover:bg-[#231C3D] text-[#18181B] dark:text-zinc-200 text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2.5"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            )}
            <span>Continue with Google</span>
          </button>

          {/* Setup / Fast Access helper link */}
          <div className="flex items-center justify-center pt-0.5">
            <button
              type="button"
              onClick={() => setIsGoogleModalOpen(true)}
              className="text-[11px] text-[#7C3AED] dark:text-[#A78BFA] hover:underline font-medium"
            >
              Google login issue or custom setup? Click here
            </button>
          </div>

          <p className="text-center text-xs text-[#71717A] dark:text-zinc-400 pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-[#7C3AED] dark:text-[#A78BFA] font-semibold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Google OAuth & Fast Sign-In Modal */}
      <GoogleOAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />
    </div>
  );
}