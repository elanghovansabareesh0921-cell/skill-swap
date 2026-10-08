'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const fieldClass = 'mt-1.5 w-full rounded-xl border border-ink/15 bg-mist-pure px-4 py-3 text-sm text-ink outline-none focus:border-lagoon focus:ring-4 focus:ring-lagoon/10';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (password.length < 10) {
      setError('Use at least 10 characters for the new password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !user) throw new Error('This reset link is invalid or expired. Request a new one.');
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setComplete(true);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Unable to update the password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-mist px-5 py-12 text-ink">
      <section className="w-full max-w-md rounded-2xl border border-ink/10 bg-mist-pure p-7 shadow-lg sm:p-9">
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        {complete ? (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-ink/70">Your password has been updated.</p>
            <Link href="/login" className="inline-flex rounded-xl bg-lagoon px-4 py-2.5 text-sm font-semibold text-white">Return to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-xs font-semibold">
              New password
              <input autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required className={fieldClass} />
            </label>
            <label className="block text-xs font-semibold">
              Confirm new password
              <input autoComplete="new-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required className={fieldClass} />
            </label>
            {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-lagoon px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">
              {busy ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
