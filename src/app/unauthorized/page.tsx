import React from 'react';
import Link from 'next/link';
import { ShieldX, ArrowLeft, LogIn } from 'lucide-react';

export const metadata = {
  title: 'Unauthorized – SkillSwap',
  description: 'You do not have permission to access this page.',
};

/**
 * Unauthorized Page
 *
 * Shown when a non-admin user tries to access admin routes,
 * or when an unauthenticated user is redirected here.
 */
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <ShieldX className="h-10 w-10 text-rose-500" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-extrabold text-text tracking-tight">
            Access Denied
          </h1>
          <p className="text-sm text-text-muted leading-relaxed max-w-sm mx-auto">
            You don&apos;t have the required permissions to view this page.
            This area is restricted to administrators only.
          </p>
        </div>

        {/* Error Code */}
        <div className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 border border-rose-500/20 px-4 py-1.5 text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
          <span>HTTP 403</span>
          <span className="text-rose-400/50">•</span>
          <span>FORBIDDEN</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-surface border border-border px-5 py-2.5 text-xs font-semibold text-text hover:bg-surface-2 transition-all shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Go Home
          </Link>
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 rounded-full bg-accent text-white px-5 py-2.5 text-xs font-bold hover:opacity-90 transition-all shadow-lg shadow-accent/20"
          >
            <LogIn className="h-3.5 w-3.5" />
            Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
