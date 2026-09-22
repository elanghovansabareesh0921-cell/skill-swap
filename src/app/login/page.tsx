"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useSkillSwap } from "@/context/SkillSwapContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  const { loginWithDemo, loginWithGoogle, showToast } = useSkillSwap();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot Password Modal state
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Check saved email from remember me
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("skillswap_saved_email");
      if (savedEmail) {
        setEmail(savedEmail);
      }
    } catch {
      // Ignore
    }
  }, []);

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errors.email = "Please enter your email address";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Please enter a valid email format";
    }

    if (!password) {
      errors.password = "Please enter your password";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (rememberMe) {
        localStorage.setItem("skillswap_saved_email", email);
      } else {
        localStorage.removeItem("skillswap_saved_email");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Invalid email or password. If testing, you can use the One-Click Demo Login below.");
        } else {
          setErrorMsg(error.message);
        }
        setLoading(false);
        return;
      }

      showToast("Welcome back!", "Successfully signed in.", "success");
      router.push(redirectTarget);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setErrorMsg("");
    try {
      const res = await loginWithDemo();
      if (res.success) {
        router.push(redirectTarget);
      }
    } catch (e: any) {
      setErrorMsg("Failed to start demo session.");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg("");
    const res = await loginWithGoogle();
    if (!res.success) {
      setGoogleLoading(false);
      setErrorMsg(res.error || "Google login initialization failed.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !/\S+@\S+\.\S+/.test(forgotEmail)) {
      showToast("Invalid Email", "Please enter a valid email address.", "warning");
      return;
    }

    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/settings`,
      });

      if (error) {
        showToast("Error", error.message, "error");
      } else {
        setForgotSuccess(true);
        showToast("Instructions Sent", "Check your inbox for password reset instructions.", "success");
      }
    } catch (e: any) {
      showToast("Error", e.message, "error");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA]">
      {/* Top right Theme Toggle & Home */}
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
        {/* Subtle decorative circles */}
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute top-12 right-12 w-64 h-64 rounded-full bg-white/10 blur-xl pointer-events-none" />

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 w-fit focus:outline-none z-10">
          <div className="w-10 h-10 rounded-xl bg-white text-[#7C3AED] flex items-center justify-center font-bold text-xl shadow-sm">
            S
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Skill Swap</span>
        </Link>

        {/* Feature Highlights */}
        <div className="max-w-md my-auto space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold text-white">
            <Sparkles className="w-3.5 h-3.5 text-[#EDE9FE]" />
            <span>Peer-to-Peer Knowledge Economy</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
            Exchange skills. Build connections. Master anything.
          </h2>
          <p className="text-sm lg:text-base text-purple-100 leading-relaxed font-normal">
            Join thousands of professionals, developers, and creators sharing knowledge in 1-on-1 swaps and credit-backed sessions.
          </p>

          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-purple-100">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>No mandatory subscriptions or expensive hourly fees</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-purple-100">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Earn 10 credits every hour you teach</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-purple-100">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Integrated WebRTC video rooms & collaboration</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-purple-200 z-10">
          © 2026 Skill Swap Platform. Presentation-ready edition.
        </div>
      </div>

      {/* RIGHT LOGIN FORM PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo Branding */}
          <div className="md:hidden flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center font-bold text-sm">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-[#18181B] dark:text-white">
              Skill Swap
            </span>
          </div>

          {/* Headings */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
              Continue your learning journey.
            </p>
          </div>

          {/* Quick 1-Click Demo Login Banner (Presentation Highlight) */}
          <div className="p-4 rounded-2xl bg-[#EDE9FE]/70 dark:bg-[#231C3D]/60 border border-[#DDD6FE] dark:border-[#3B2D66] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Evaluation Access</span>
              </div>
              <p className="text-[11px] text-[#71717A] dark:text-zinc-400 mt-0.5">
                Sign in instantly as Alex Demo with 50 credits
              </p>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
              className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
            >
              {demoLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>One-Click Demo</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {/* General Error Message */}
          {errorMsg && (
            <div className="p-3.5 text-xs text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                Email
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="you@example.com"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161327] border text-sm text-[#18181B] dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 ${
                    fieldErrors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-[#E4E1F5] dark:border-[#2D264E] focus:border-[#7C3AED]"
                  }`}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 dark:text-red-400">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-[#7C3AED] dark:text-[#A78BFA] hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••••"
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#7C3AED] border-[#E4E1F5] dark:border-[#2D264E]"
              />
              <label htmlFor="remember-me" className="text-xs text-[#71717A] dark:text-zinc-400 select-none cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || demoLoading}
              className="w-full py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log In</span>
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

          {/* Google Authentication Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
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

          {/* Bottom Link to Signup */}
          <p className="text-center text-xs text-[#71717A] dark:text-zinc-400 pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#7C3AED] dark:text-[#A78BFA] font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-[#18181B] dark:text-white">Reset Password</h3>
            <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-1">
              Enter your email and we&apos;ll send instructions to reset your password.
            </p>

            {forgotSuccess ? (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Reset link sent! Please check your email inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotModalOpen(false);
                      setForgotSuccess(false);
                    }}
                    className="flex-1 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#71717A] hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5"
                  >
                    {forgotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Send Link</span>}
                  </button>
                </div>
              </form>
            )}

            {forgotSuccess && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setForgotModalOpen(false);
                    setForgotSuccess(false);
                  }}
                  className="w-full py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" /></div>}>
      <LoginForm />
    </Suspense>
  );
}