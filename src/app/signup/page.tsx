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
  CheckCircle2,
  AlertCircle,
  Loader2,
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0B0C10] text-white cyber-grid">
      {/* Top Navigation Control */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/"
          className="text-xs font-black uppercase px-3 py-1.5 border-2 border-black bg-[#181B22] text-white shadow-[2px_2px_0px_0px_#FFE600] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
        >
          Home
        </Link>
      </div>

      {/* DESKTOP LEFT BRANDING PANEL */}
      <div className="hidden md:flex md:w-1/2 bg-[#181B22] border-r-2 border-black text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 w-fit focus:outline-none z-10">
          <div className="w-10 h-10 border-2 border-black bg-[#FFE600] text-black flex items-center justify-center font-black text-xl shadow-[3px_3px_0px_0px_#000000]">
            S
          </div>
          <span className="text-2xl font-black uppercase tracking-tight text-white">SkillSwap</span>
        </Link>

        <div className="max-w-md my-auto space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-[#12141C] text-xs font-black uppercase text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get 50 Free Welcome Credits</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight leading-tight text-white">
            Start learning, teaching, <br />
            <span className="text-[#FFE600] bg-black px-2 py-0.5 border-2 border-[#FFE600] inline-block mt-1">
              and connecting.
            </span>
          </h2>
          <p className="text-sm lg:text-base text-zinc-300 leading-relaxed font-medium">
            Create an account to discover hundreds of skills, match with reciprocal learners, and book 1-on-1 collaborative sessions.
          </p>

          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-zinc-300 font-bold uppercase">
              <div className="w-6 h-6 border-2 border-black bg-[#A3E635] flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
              <span>50 free bonus credits upon registration</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300 font-bold uppercase">
              <div className="w-6 h-6 border-2 border-black bg-[#FFE600] flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Offer what you know or spend credits to learn</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300 font-bold uppercase">
              <div className="w-6 h-6 border-2 border-black bg-[#38BDF8] flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Smart matching powered by Gemini AI</span>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono font-bold uppercase text-zinc-500 z-10">
          © 2026 SkillSwap Platform. Dark Neo-Brutalist Edition.
        </div>
      </div>

      {/* RIGHT SIGNUP FORM PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md border-2 border-black bg-[#181B22] p-8 shadow-[8px_8px_0px_0px_#FFE600] space-y-6">
          <div className="md:hidden flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 border-2 border-black bg-[#FFE600] text-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#000000]">
              S
            </div>
            <span className="text-xl font-black uppercase tracking-tight text-white">
              SkillSwap
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Create your account
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
              Start learning, teaching, and connecting with peers.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 text-xs text-black font-black bg-[#FF5E7E] border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-black uppercase tracking-wider text-white block">
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
                className={`w-full px-3.5 py-2.5 bg-[#12141C] border-2 border-black text-white text-sm focus:outline-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] transition-all ${
                  fieldErrors.fullName ? "border-[#FF5E7E]" : ""
                }`}
                disabled={loading}
              />
              {fieldErrors.fullName && (
                <p className="text-[11px] font-black text-[#FF5E7E] font-mono">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-white block">
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
                className={`w-full px-3.5 py-2.5 bg-[#12141C] border-2 border-black text-white text-sm focus:outline-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] transition-all ${
                  fieldErrors.email ? "border-[#FF5E7E]" : ""
                }`}
                disabled={loading}
              />
              {fieldErrors.email && (
                <p className="text-[11px] font-black text-[#FF5E7E] font-mono">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-black uppercase tracking-wider text-white block">
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
                  className={`w-full pl-3.5 pr-10 py-2.5 bg-[#12141C] border-2 border-black text-white text-sm focus:outline-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] transition-all ${
                    fieldErrors.password ? "border-[#FF5E7E]" : ""
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] font-black text-[#FF5E7E] font-mono">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-wider text-white block">
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
                className={`w-full px-3.5 py-2.5 bg-[#12141C] border-2 border-black text-white text-sm focus:outline-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] transition-all ${
                  fieldErrors.confirmPassword ? "border-[#FF5E7E]" : ""
                }`}
                disabled={loading}
              />
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] font-black text-[#FF5E7E] font-mono">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full mt-2 py-3 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
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
              <div className="w-full border-t-2 border-black" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black">
              <span className="bg-[#181B22] px-3 text-zinc-400 tracking-wider">
                OR
              </span>
            </div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="w-full py-2.5 border-2 border-black bg-[#12141C] hover:bg-[#1F2430] text-white text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#38BDF8] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              className="text-[11px] font-mono text-[#FFE600] hover:underline font-bold"
            >
              Google login issue or custom setup? Click here
            </button>
          </div>

          <p className="text-center text-xs text-zinc-400 font-medium pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-[#FFE600] font-black uppercase hover:underline">
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