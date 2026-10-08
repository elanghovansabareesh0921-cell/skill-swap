'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Info,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isUserAdmin, PRIMARY_ADMIN_EMAIL } from '@/lib/admin/roles';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [checkingExistingSession, setCheckingExistingSession] = useState(true);
  const [showDevHint, setShowDevHint] = useState(false);

  const returnTo = searchParams.get('returnTo') || '/admin/swaps';
  const urlError = searchParams.get('error');

  // Handle URL errors & check if already authenticated as admin
  useEffect(() => {
    if (urlError === 'unauthorized') {
      setErrorMsg(
        'Access Denied: Your account does not have administrator privileges. Please sign in with an authorized administrator account.'
      );
    }

    async function checkCurrentSession() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && isUserAdmin(user)) {
          // Already authenticated as admin -> forward immediately
          router.replace(returnTo);
          return;
        }
      } catch {
        // Ignore session inspection error
      } finally {
        setCheckingExistingSession(false);
      }
    }

    checkCurrentSession();
  }, [urlError, returnTo, router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const supabase = createClient();

      // 1. Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(
          error.message === 'Invalid login credentials'
            ? 'Invalid email or password. Please verify your administrator credentials.'
            : error.message
        );
        setLoading(false);
        return;
      }

      const user = data.user;

      // 2. Strict Admin Role Verification Gate
      if (!user || !isUserAdmin(user)) {
        // Immediately revoke session so an unauthorized user cannot retain auth
        await supabase.auth.signOut();

        setErrorMsg(
          `Access Denied: Account "${user?.email || email}" is not an authorized administrator. Only designated platform admins are allowed.`
        );
        setLoading(false);
        return;
      }

      // 3. User is authorized administrator!
      setSuccessMsg('Administrator credentials verified. Access granted.');
      setTimeout(() => {
        router.push(returnTo);
        router.refresh();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during admin authentication.');
      setLoading(false);
    }
  };

  const quickFillAdmin = () => {
    setEmail(PRIMARY_ADMIN_EMAIL);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full bg-[#070a12] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-rose-500 selection:text-white">
      {/* Ambient Radial Backdrops */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-rose-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full px-6 py-6 flex items-center justify-between border-b border-white/5">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to SkillSwap</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[11px] font-mono font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            SECURE SYSTEM
          </span>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="relative rounded-3xl border border-white/10 bg-[#0d121f]/90 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl shadow-black/80">
            {/* Top Security Emblem */}
            <div className="flex flex-col items-center text-center mb-8">
              <div className="relative mb-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-indigo-500/20 border border-rose-500/30 flex items-center justify-center shadow-lg shadow-rose-500/10">
                  <Shield className="h-8 w-8 text-rose-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-slate-900 border border-white/20 flex items-center justify-center">
                  <Lock className="h-3 w-3 text-rose-300" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                Restricted Gateway
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-display">
                Admin Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs">
                Authentication required. Only registered platform administrators may proceed.
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-6 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-4 text-xs text-rose-300 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-xs text-emerald-300 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-medium">{successMsg}</div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@skillswap.com"
                    autoComplete="email"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-rose-500/60 focus:ring-4 focus:ring-rose-500/10"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Account Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 pl-10 pr-11 py-3 text-sm text-white placeholder-slate-600 outline-none transition-all focus:border-rose-500/60 focus:ring-4 focus:ring-rose-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || checkingExistingSession}
                className="w-full mt-2 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 disabled:opacity-50 text-white font-semibold text-sm py-3.5 px-4 shadow-lg shadow-rose-600/25 hover:shadow-rose-600/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Authorization...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Fill / Dev Helper */}
            <div className="mt-6 pt-5 border-t border-white/5">
              <button
                type="button"
                onClick={() => setShowDevHint(!showDevHint)}
                className="text-[11px] text-slate-500 hover:text-slate-400 flex items-center gap-1.5 transition-colors cursor-pointer w-full justify-center"
              >
                <Info className="h-3.5 w-3.5" />
                <span>{showDevHint ? 'Hide' : 'Show'} Authorized Admin Information</span>
              </button>

              {showDevHint && (
                <div className="mt-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-slate-400 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-medium">Primary Admin Email:</span>
                    <button
                      type="button"
                      onClick={quickFillAdmin}
                      className="text-[10px] text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer"
                    >
                      Fill this email
                    </button>
                  </div>
                  <div className="font-mono text-[10px] text-slate-300 bg-black/40 p-1.5 rounded-lg break-all">
                    {PRIMARY_ADMIN_EMAIL}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Users with <code className="text-slate-400">role: &quot;admin&quot;</code> in Supabase user metadata are also granted full access.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Security Notice Footer */}
          <div className="text-center mt-6 text-[11px] text-slate-600 flex items-center justify-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-500" />
            <span>End-to-end encrypted session • Monitored portal</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full px-6 py-4 text-center text-[11px] text-slate-600 border-t border-white/5">
        SkillSwap Administrative Operations © {new Date().getFullYear()} • Restricted Access
      </footer>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#070a12] flex items-center justify-center text-slate-400">
          <span className="h-6 w-6 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
