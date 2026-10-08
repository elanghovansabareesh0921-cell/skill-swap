'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FcGoogle } from 'react-icons/fc';
import { ArrowRightLeft, Sparkles, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { signInWithEmail, signUpWithEmail, signInWithProvider } from '@/lib/auth';

const fieldClass =
  'mt-1.5 w-full rounded-2xl border border-ink/15 bg-mist-pure px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink-muted/50 focus:border-lagoon focus:ring-4 focus:ring-lagoon/10 shadow-sm dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40';

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter();
  const signup = mode === 'signup';
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');

  async function sendPasswordReset() {
    if (!email.trim()) {
      setErr('Enter your account email first.');
      return;
    }
    setBusy(true);
    setErr('');
    setNotice('');
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/reset-password')}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (error) throw error;
      setNotice('If an account exists for that email, a password reset link has been sent.');
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : 'Unable to request a password reset.');
    } finally {
      setBusy(false);
    }
  }

  async function run(fn: () => Promise<{ isOAuth: boolean; needsEmailConfirmation?: boolean } | void>) {
    setBusy(true);
    setErr('');
    try {
      const res = await fn();
      if (res && res.isOAuth) {
        // Do not redirect or unset busy state yet, let the browser OAuth redirect happen
        return;
      }
      if (res?.needsEmailConfirmation) {
        setNotice('Check your email to confirm your account, then sign in.');
        setBusy(false);
        return;
      }
      if (signup) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      setErr((e as Error).message || 'Something went wrong. Please try again.');
      setBusy(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get('password'));
    if (signup && password.length < 10) {
      return setErr('Please use at least 10 characters for your password.');
    }
    if (signup && !f.get('age')) {
      return setErr('Please confirm that you are 18 years or older.');
    }
    if (signup && typeof window !== 'undefined') {
      localStorage.removeItem('ss_profile');
    }
    if (signup) {
      run(() => signUpWithEmail(String(f.get('email')), password));
    } else {
      run(() => signInWithEmail(String(f.get('email')), password));
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-12 bg-mist selection:bg-lagoon selection:text-white">
      {/* Left Spatial Atmospheric Column */}
      <aside className="relative hidden lg:col-span-5 lg:flex flex-col justify-between bg-[#0f1b2d] dark:bg-[#050505] p-12 text-white overflow-hidden border-r border-ink/5">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 ambient-glow-lagoon opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 ambient-glow-saffron opacity-30 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0f1b2d] group-hover:bg-lagoon group-hover:text-white transition-colors shadow-md">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-white">
              SkillSwap
            </span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 my-auto max-w-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-mist-pure/10 border border-white/15 px-3 py-1 text-xs font-mono font-medium text-teal-300">
            <Sparkles className="h-3.5 w-3.5 text-saffron" />
            ESCROW-PROTECTED TRADING
          </div>
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-white leading-tight">
            Your first skill swap is moments away.
          </h2>
          <p className="text-sm text-white/70 leading-relaxed font-normal">
            Join thousands of professionals and hobbyists teaching what they know and learning what they want at 70% reduced in-kind rates.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <CheckCircle className="h-4 w-4 text-lagoon-light shrink-0" />
              <span>Double-entry ledger with automated dispute protection</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <CheckCircle className="h-4 w-4 text-lagoon-light shrink-0" />
              <span>Two-sided peer compatibility matching</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-white/80">
              <CheckCircle className="h-4 w-4 text-lagoon-light shrink-0" />
              <span>Instant Google Meet scheduling upon mutual approval</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-white/50 font-mono">
          1 Skill Point = ₹1 • Closed-loop escrow network
        </div>
      </aside>

      {/* Right Form Column: Clean Floating Spatial Surface */}
      <section className="lg:col-span-7 flex items-center justify-center p-6 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8 glass-panel rounded-3xl p-8 sm:p-10 shadow-xl border border-ink/8">
          <div>
            <div className="flex items-center justify-between mb-2 lg:hidden">
              <Link href="/" className="font-display text-xl font-bold text-ink">
                SkillSwap
              </Link>
            </div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
              {signup ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="mt-2 text-sm text-ink/70">
              {signup ? 'Already have an account? ' : 'New to SkillSwap? '}
              <Link
                href={signup ? '/login' : '/signup'}
                className="font-semibold text-lagoon hover:text-lagoon-dark underline underline-offset-4"
              >
                {signup ? 'Log in' : 'Sign up'}
              </Link>
            </p>
          </div>

          {/* Social OAuth Buttons */}
          <div className="grid gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => run(() => signInWithProvider('google', signup ? '/onboarding' : '/dashboard'))}
              className="flex items-center justify-center gap-3 rounded-2xl border border-ink/12 bg-mist-pure py-3 text-xs font-semibold text-ink hover:border-ink/30 hover:bg-mist transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <FcGoogle size={20} /> Continue with Google
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/10" />
            </div>
            <span className="relative bg-mist-pure dark:bg-[#0a0a0a] px-3 text-xs text-ink/40 uppercase tracking-wider font-mono">
              or with email
            </span>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink block">
                Email address
                <input
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={fieldClass}
                />
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink block">
                Password
                <input
                  name="password"
                  type="password"
                  required
                  placeholder={signup ? 'Minimum 10 characters' : 'Enter password'}
                  autoComplete={signup ? 'new-password' : 'current-password'}
                  className={fieldClass}
                />
              </label>
            </div>

            {!signup && (
              <button
                type="button"
                onClick={sendPasswordReset}
                disabled={busy}
                className="text-xs font-semibold text-lagoon hover:text-lagoon-dark underline underline-offset-4 disabled:opacity-50"
              >
                Forgot password?
              </button>
            )}

            {notice && (
              <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                {notice}
              </div>
            )}

            {signup && (
              <label className="flex items-start gap-3 text-xs text-ink/80 pt-1 cursor-pointer select-none">
                <input
                  name="age"
                  type="checkbox"
                  className="mt-0.5 size-4 rounded accent-lagoon cursor-pointer"
                />
                <span>
                  I confirm that I am 18 years or older and agree to SkillSwap community guidelines.
                </span>
              </label>
            )}

            {err && (
              <div
                role="alert"
                className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 p-3 text-xs font-medium text-red-700 dark:text-red-300"
              >
                {err}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-lagoon py-3.5 text-sm font-semibold text-white hover:bg-lagoon-dark active:scale-[0.99] transition-all shadow-lg shadow-lagoon/20 disabled:opacity-50 cursor-pointer mt-2"
            >
              {busy ? 'Verifying…' : signup ? 'Create Account & Begin Onboarding' : 'Sign In'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
