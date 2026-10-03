'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SkillPicker from '@/components/SkillPicker';
import { getSession, saveProfile, type Profile } from '@/lib/auth';
import { ArrowLeft, ArrowRight, ArrowRightLeft, Sparkles, Upload, User, ShieldCheck } from 'lucide-react';

const fieldClass =
  'mt-1.5 w-full rounded-2xl border border-ink/15 bg-mist-pure px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-ink-muted/50 focus:border-lagoon focus:ring-4 focus:ring-lagoon/10 shadow-sm dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40';

const titles = ['Tell us about you', 'What can you teach?', 'What do you want to learn?'];
const subtitles = [
  'Basic profile details to verify your account identity on the escrow network.',
  'Members who offer a skill pay up to 70% fewer skill points on reciprocal swaps.',
  'Your learning vectors feed our two-sided AI Radar to rank compatible peers.',
];

const calculateAge = (dob: string) => {
  const d = new Date(dob);
  const n = new Date();
  let a = n.getFullYear() - d.getFullYear();
  if (n < new Date(n.getFullYear(), d.getMonth(), d.getDate())) a--;
  return a;
};

export default function Onboarding() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(1);
  const [err, setErr] = useState('');
  const [f, setF] = useState<Profile>({
    name: '',
    avatar: '',
    sex: '',
    dob: '',
    teach: [],
    noTeach: false,
    learn: [],
  });

  useEffect(() => {
    if (!getSession()) router.replace('/login');
    else setReady(true);
  }, [router]);

  const set = <K extends keyof Profile>(k: K, v: Profile[K]) =>
    setF(p => ({ ...p, [k]: v }));

  function pickAvatar(file?: File) {
    if (!file) return;
    if (file.size > 1_000_000) return setErr('Please choose a photo under 1 MB.');
    const r = new FileReader();
    r.onload = () => {
      setErr('');
      set('avatar', String(r.result));
    };
    r.readAsDataURL(file);
  }

  function validate() {
    if (step === 1) {
      if (!f.name.trim()) return 'Please enter your full name.';
      if (!f.sex) return 'Please select your sex.';
      if (!f.dob || !(calculateAge(f.dob) >= 18))
        return 'You must be 18 or older to trade on SkillSwap.';
    }
    if (step === 2 && !f.noTeach && f.teach.length === 0)
      return 'Pick at least one skill you can teach, or select "I don\'t have any skills to teach right now".';
    if (step === 3 && f.learn.length === 0)
      return 'Pick at least one skill you want to learn.';
    return '';
  }

  function next() {
    const e = validate();
    setErr(e);
    if (e) return;
    if (step < 3) return setStep(step + 1);
    saveProfile({ ...f, name: f.name.trim() });
    router.push('/dashboard');
  }

  if (!ready) return null;

  return (
    <div className="relative min-h-screen bg-mist selection:bg-lagoon selection:text-white py-12 px-4 sm:px-6 flex items-center justify-center">
      {/* Ambient Lighting Orbs */}
      <div className="pointer-events-none absolute top-10 left-1/3 h-96 w-96 ambient-glow-lagoon opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute bottom-10 right-1/3 h-96 w-96 ambient-glow-saffron opacity-40 blur-3xl" />

      <main className="relative z-10 w-full max-w-2xl glass-panel rounded-3xl p-8 sm:p-12 shadow-2xl border border-ink/8">
        {/* Step Indicator Header with SkillSwap Logo Link */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/8 pb-5">
          <Link href="/" className="inline-flex items-center gap-2 group cursor-pointer" title="Back to Home">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white dark:bg-saffron dark:text-black group-hover:bg-lagoon transition-colors shadow-sm">
              <ArrowRightLeft className="h-3.5 w-3.5" />
            </div>
            <span className="font-display text-base font-extrabold tracking-tight text-ink">
              SkillSwap
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-lagoon uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-saffron" />
              <span>Step {step} of 3</span>
            </div>
            <div className="text-xs text-ink/40 font-mono">
              {step === 1 ? '33%' : step === 2 ? '66%' : '100%'} Completed
            </div>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="mt-3 h-1.5 w-full bg-ink/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-lagoon transition-all duration-300 ease-out rounded-full"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="mt-8">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            {titles[step - 1]}
          </h1>
          <p className="mt-2 text-sm text-ink/70 leading-relaxed font-normal">
            {subtitles[step - 1]}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {step === 1 && (
            <>
              {/* Avatar Uploader */}
              <div className="flex items-center gap-5 p-4 rounded-2xl bg-mist-pure/60 border border-ink/8">
                {f.avatar ? (
                  <img
                    src={f.avatar}
                    alt="Your profile picture"
                    className="size-20 rounded-2xl object-cover border-2 border-lagoon shadow-sm"
                  />
                ) : (
                  <div className="grid size-20 place-items-center rounded-2xl bg-ink/5 border border-ink/10 font-display text-2xl font-bold text-ink">
                    {f.name.trim()[0]?.toUpperCase() ?? <User className="h-8 w-8 text-ink/40" />}
                  </div>
                )}
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-ink/20 bg-mist-pure px-4 py-2 text-xs font-semibold text-ink hover:bg-ink hover:text-white dark:hover:bg-saffron dark:hover:text-black dark:hover:border-saffron transition-colors shadow-sm">
                    <Upload className="h-3.5 w-3.5" />
                    <span>{f.avatar ? 'Change photo' : 'Upload photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={e => pickAvatar(e.target.files?.[0])}
                    />
                  </label>
                  <p className="mt-1.5 text-[11px] text-ink/50">PNG, JPG up to 1 MB.</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-ink block">
                  Full name
                  <input
                    value={f.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. Asha Sharma"
                    autoComplete="name"
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-ink block">
                    Sex
                    <select
                      value={f.sex}
                      onChange={e => set('sex', e.target.value)}
                      className={fieldClass}
                    >
                      <option value="">Select option</option>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Prefer not to say</option>
                    </select>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-semibold text-ink block">
                    Date of birth (18+ only)
                    <input
                      type="date"
                      value={f.dob}
                      onChange={e => set('dob', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      autoComplete="bday"
                      className={fieldClass}
                    />
                  </label>
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <SkillPicker
                value={f.teach}
                onChange={v => set('teach', v)}
                max={5}
                disabled={f.noTeach}
              />

              <label className="flex items-center gap-3 rounded-2xl bg-mist-pure/80 p-4 border border-ink/8 font-medium text-xs text-ink cursor-pointer hover:border-ink/20 transition-all select-none shadow-sm">
                <input
                  type="checkbox"
                  checked={f.noTeach}
                  className="size-4 rounded accent-lagoon cursor-pointer"
                  onChange={e =>
                    setF(p => ({
                      ...p,
                      noTeach: e.target.checked,
                      teach: e.target.checked ? [] : p.teach,
                    }))
                  }
                />
                <span>I don't have any skills to teach right now (Learn-only mode)</span>
              </label>

              {f.noTeach && (
                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-4 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
                  <strong>Notice:</strong> In learn-only mode, you pay the teacher's full list price in skill points. You can add a teachable skill anytime later to unlock up to 70% swap discounts.
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <SkillPicker value={f.learn} onChange={v => set('learn', v)} max={5} />
            </div>
          )}

          {err && (
            <div
              role="alert"
              className="rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 p-3.5 text-xs font-medium text-red-700 dark:text-red-300"
            >
              {err}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-ink/8">
            <button
              type="button"
              onClick={() => {
                setErr('');
                setStep(step - 1);
              }}
              disabled={step === 1}
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-semibold text-ink/70 hover:text-ink hover:bg-mist-pure disabled:invisible transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-2 rounded-full bg-lagoon px-8 py-3 text-xs font-semibold text-white hover:bg-lagoon-dark transition-all shadow-lg shadow-lagoon/20 hover:shadow-xl cursor-pointer"
            >
              <span>{step === 3 ? 'Complete & Enter Radar' : 'Next Step'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
