"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/";

  const { loginWithGoogle, showToast } = useSkillSwap();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
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

      // 8-second timeout protection so login never spins indefinitely
      const authPromise = supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      const timeoutPromise = new Promise<{ data: any; error: any }>((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "Authentication timed out. Please check your internet connection and try again."
              )
            ),
          8000
        )
      );

      const { data, error } = await Promise.race([authPromise, timeoutPromise]);

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMsg("Invalid email or password. Please check your credentials or create a new account.");
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (typeof window !== "undefined") {
        document.cookie = "skillswap_session=true; path=/; max-age=2592000; SameSite=Lax";
      }
      showToast("Welcome back!", "Successfully signed in.", "success");
      router.push(redirectTarget);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg("");
    const res = await loginWithGoogle();
    if (!res.success) {
      setGoogleLoading(false);
      if (res.requiresConfig) {
        setIsGoogleModalOpen(true);
      } else {
        setErrorMsg(res.error || "Google login initialization failed.");
      }
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0B0C10] text-white cyber-grid">
      {/* Top right Theme Toggle & Home */}
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

        {/* Feature Highlights */}
        <div className="max-w-md my-auto space-y-6 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-[#12141C] text-xs font-black uppercase text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Peer-to-Peer Knowledge Economy</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tight leading-tight text-white">
            Exchange skills. <br />
            <span className="text-[#FFE600] bg-black px-2 py-0.5 border-2 border-[#FFE600] inline-block mt-1">
              Master anything.
            </span>
          </h2>
          <p className="text-sm lg:text-base text-zinc-300 leading-relaxed font-medium">
            Join thousands of professionals, developers, and creators sharing knowledge in 1-on-1 swaps and credit-backed sessions.
          </p>

          <div className="pt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-zinc-300 font-bold uppercase">
              <div className="w-6 h-6 border-2 border-black bg-[#A3E635] flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
              <span>No mandatory subscriptions or expensive hourly fees</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300 font-bold uppercase">
              <div className="w-6 h-6 border-2 border-black bg-[#FFE600] flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Earn 10 credits every hour you teach</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300 font-bold uppercase">
              <div className="w-6 h-6 border-2 border-black bg-[#38BDF8] flex items-center justify-center text-black shrink-0 shadow-[2px_2px_0px_0px_#000000]">
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Integrated WebRTC video rooms & collaboration</span>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono font-bold uppercase text-zinc-500 z-10">
          © 2026 SkillSwap Platform. Dark Neo-Brutalist Edition.
        </div>
      </div>

      {/* RIGHT LOGIN FORM PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className="w-full max-w-md border-2 border-black bg-[#181B22] p-8 shadow-[8px_8px_0px_0px_#FFE600] space-y-6">
          {/* Mobile Logo Branding */}
          <div className="md:hidden flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 border-2 border-black bg-[#FFE600] text-black flex items-center justify-center font-black text-sm shadow-[2px_2px_0px_0px_#000000]">
              S
            </div>
            <span className="text-xl font-black uppercase tracking-tight text-white">
              SkillSwap
            </span>
          </div>

          {/* Headings */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
              Continue your peer learning journey.
            </p>
          </div>

          {/* General Error Message */}
          {errorMsg && (
            <div className="p-3.5 text-xs text-black font-black bg-[#FF5E7E] border-2 border-black shadow-[3px_3px_0px_0px_#000000] flex items-start gap-2 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 stroke-[2.5]" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-black uppercase tracking-wider text-white block">
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
                  placeholder="name@email.com"
                  className={`w-full px-3.5 py-2.5 bg-[#12141C] border-2 border-black text-white text-sm focus:outline-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600] transition-all ${
                    fieldErrors.email ? "border-[#FF5E7E]" : ""
                  }`}
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] font-black text-[#FF5E7E] font-mono">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-black uppercase tracking-wider text-white block">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-xs text-[#FFE600] hover:underline font-bold uppercase tracking-wider"
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-none border-2 border-black accent-[#FFE600]"
              />
              <label htmlFor="remember-me" className="text-xs font-bold uppercase text-zinc-300 select-none cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
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
              <div className="w-full border-t-2 border-black" />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-black">
              <span className="bg-[#181B22] px-3 text-zinc-400 tracking-wider">
                OR
              </span>
            </div>
          </div>

          {/* Google Authentication Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
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

          {/* Bottom Link to Signup */}
          <p className="text-center text-xs text-zinc-400 font-medium pt-2">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[#FFE600] font-black uppercase hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm border-2 border-black bg-[#181B22] shadow-[8px_8px_0px_0px_#FFE600] p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black uppercase text-white">Reset Password</h3>
            <p className="text-xs text-zinc-400 mt-1 font-medium">
              Enter your email and we&apos;ll send instructions to reset your password.
            </p>

            {forgotSuccess ? (
              <div className="mt-4 p-3 border-2 border-black bg-[#A3E635] text-black font-black text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 stroke-[3]" />
                <span>Reset link sent! Please check your email inbox.</span>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-black uppercase text-white block mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="w-full px-3.5 py-2 border-2 border-black bg-[#12141C] text-sm text-white focus:outline-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600]"
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
                    className="flex-1 py-2 border-2 border-black bg-[#12141C] text-xs font-black uppercase text-zinc-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2 border-2 border-black bg-[#FFE600] text-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center gap-1.5"
                  >
                    {forgotLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : <span>Send Link</span>}
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
                  className="w-full py-2 border-2 border-black bg-[#FFE600] text-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Google OAuth & Fast Sign-In Modal */}
      <GoogleOAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0B0C10]"><Loader2 className="w-8 h-8 animate-spin text-[#FFE600]" /></div>}>
      <LoginForm />
    </Suspense>
  );
}