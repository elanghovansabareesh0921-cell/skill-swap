'use client';

import React, { useEffect, useState } from 'react';
import { X, Sparkles, Check, ArrowRight, ArrowLeft, ArrowRightLeft, BookOpen, Clock, Globe } from 'lucide-react';
import { Profile, SkillItem, SkillLevel, UserTeachSkill, UserLearnSkill } from '@/types';

interface OnboardingModalProps {
  currentUser: Profile;
  isOpen: boolean;
  onClose: () => void;
  onSavePreferences: (updatedProfile: Profile) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSavePreferences,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [skillTaxonomy, setSkillTaxonomy] = useState<SkillItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/skills')
      .then(async (response) => {
        if (!response.ok) throw new Error('Skill taxonomy lookup failed');
        return response.json() as Promise<{ skills: SkillItem[] }>;
      })
      .then(({ skills }) => {
        if (!cancelled) setSkillTaxonomy(skills);
      })
      .catch((error: unknown) => console.error('Error fetching skills:', error));
    return () => {
      cancelled = true;
    };
  }, []);

  // Form State
  const [selectedLearnSkillId, setSelectedLearnSkillId] = useState<string>(
    currentUser.learnSkills[0]?.skillId || ''
  );
  const [learnGoal, setLearnGoal] = useState<string>(currentUser.learnSkills[0]?.goal || '');
  const [learnLevel, setLearnLevel] = useState<SkillLevel>(currentUser.learnSkills[0]?.targetLevel || 'intermediate');

  const [hasTeachSkill, setHasTeachSkill] = useState<boolean>(currentUser.teachSkills.length > 0);
  const [selectedTeachSkillId, setSelectedTeachSkillId] = useState<string>(
    currentUser.teachSkills[0]?.skillId || ''
  );
  const [teachRate, setTeachRate] = useState<number>(currentUser.teachSkills[0]?.hourlyRate || 60);
  const [teachExperience, setTeachExperience] = useState<number>(currentUser.teachSkills[0]?.yearsExperience || 4);

  const [selectedDays, setSelectedDays] = useState<string[]>(Object.keys(currentUser.availability));
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(currentUser.languages);

  if (!isOpen) return null;

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const languageOptions = ['English', 'Hindi', 'Spanish', 'Marathi', 'Tamil', 'Malayalam'];

  const toggleDay = (day: string) => {
    setSelectedDays(prev => (prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]));
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages(prev =>
      prev.includes(lang) ? (prev.length > 1 ? prev.filter(l => l !== lang) : prev) : [...prev, lang]
    );
  };

  const handleFinish = () => {
    const learnTaxonomy = skillTaxonomy.find(s => s.id === selectedLearnSkillId);
    const teachTaxonomy = skillTaxonomy.find(s => s.id === selectedTeachSkillId);
    if (!learnTaxonomy || (hasTeachSkill && !teachTaxonomy)) return;

    const updatedLearnSkills: UserLearnSkill[] = [
      {
        skillId: selectedLearnSkillId,
        skillName: learnTaxonomy.name,
        category: learnTaxonomy.category,
        targetLevel: learnLevel,
        goal: learnGoal,
      },
    ];

    const updatedTeachSkills: UserTeachSkill[] = hasTeachSkill && teachTaxonomy
      ? [
          {
            skillId: selectedTeachSkillId,
            skillName: teachTaxonomy.name,
            category: teachTaxonomy.category,
            level: 'advanced',
            yearsExperience: teachExperience,
            hourlyRate: teachRate,
            allowedDurations: [30, 45, 60],
            isVerified: true,
          },
        ]
      : [];

    const updatedAvailability: Record<string, string[]> = {};
    selectedDays.forEach(d => {
      updatedAvailability[d] = ['18:00-21:00'];
    });

    const updated: Profile = {
      ...currentUser,
      learnSkills: updatedLearnSkills,
      teachSkills: updatedTeachSkills,
      languages: selectedLanguages,
      availability: updatedAvailability,
      isOnboarded: true,
    };

    onSavePreferences(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-3xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
        {/* Progress Bar Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-400 text-black font-black text-xs">
              {step}
            </span>
            <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
              Onboarding Wizard • Step {step} of {totalSteps}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress Fill */}
        <div className="mt-3 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step 1: Learning Vector */}
        {step === 1 && (
          <div className="mt-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-yellow-400" />
                What skill do you want to learn?
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Our matching system will connect you with verified teachers and mutual swap partners.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Select Skill</label>
              <select
                value={selectedLearnSkillId}
                onChange={e => setSelectedLearnSkillId(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-2.5 text-xs text-white focus:border-yellow-400 focus:outline-none"
              >
                {skillTaxonomy.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Target Proficiency Level</label>
              <div className="grid grid-cols-3 gap-2">
                {(['beginner', 'intermediate', 'advanced'] as SkillLevel[]).map(lvl => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLearnLevel(lvl)}
                    className={`rounded-xl py-2 text-xs capitalize font-medium border transition-all ${
                      learnLevel === lvl
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">Your Specific Learning Goal</label>
              <textarea
                value={learnGoal}
                onChange={e => setLearnGoal(e.target.value)}
                placeholder="e.g. Build an automated data pipeline, learn conversational fluency for travel..."
                rows={2}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-700 p-2.5 text-xs text-white placeholder-zinc-500 focus:border-yellow-400 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Teaching Vector & Swap Unlock */}
        {step === 2 && (
          <div className="mt-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="h-4 w-4 text-yellow-400" />
                What can you teach to unlock Swap Pricing?
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Members who offer a skill pay up to 70% fewer skill points through mutual skill exchange.
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-xl border border-zinc-800 bg-zinc-950">
              <input
                type="checkbox"
                id="teachToggle"
                checked={hasTeachSkill}
                onChange={e => setHasTeachSkill(e.target.checked)}
                className="h-4 w-4 accent-yellow-400 rounded"
              />
              <label htmlFor="teachToggle" className="text-xs text-zinc-300 cursor-pointer">
                I have a skill I can teach others (Enables Swap Match status)
              </label>
            </div>

            {hasTeachSkill ? (
              <div className="space-y-3 p-4 rounded-xl border border-yellow-400/20 bg-zinc-950/60">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1">Skill You Offer</label>
                  <select
                    value={selectedTeachSkillId}
                    onChange={e => setSelectedTeachSkillId(e.target.value)}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2 text-xs text-white focus:border-yellow-400 focus:outline-none"
                  >
                    {skillTaxonomy.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={teachExperience}
                      onChange={e => setTeachExperience(Number(e.target.value))}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300 block mb-1">
                      Hourly Rate (SP/hr)
                    </label>
                    <input
                      type="number"
                      value={teachRate}
                      onChange={e => setTeachRate(Number(e.target.value))}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-700 p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-300">
                <strong>Notice:</strong> Without a skill to offer, you will learn via Direct mode (paying the full teacher rate). You can always add a teachable skill later in your profile.
              </div>
            )}
          </div>
        )}

        {/* Step 3: Weekly Availability Grid */}
        {step === 3 && (
          <div className="mt-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-400" />
                When are you free for sessions?
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Our matching system uses availability intersection to connect you with peers who are free when you are.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-2">Available Days</label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {daysOfWeek.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`rounded-xl py-3 text-xs font-bold transition-all border ${
                      selectedDays.includes(day)
                        ? 'border-yellow-400 bg-yellow-400 text-black shadow-md'
                        : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-zinc-800 bg-zinc-950 text-xs text-zinc-400">
              Default slots: <strong>18:00 - 21:00 IST</strong> on selected days. Exact session hours are scheduled inside the shared temporary chat.
            </div>
          </div>
        )}

        {/* Step 4: Spoken Languages */}
        {step === 4 && (
          <div className="mt-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-yellow-400" />
                Session Spoken Languages
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Select the languages you can comfortably communicate in during 1:1 video sessions.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {languageOptions.map(lang => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => toggleLanguage(lang)}
                  className={`rounded-xl p-3 text-xs font-bold transition-all border text-left flex items-center justify-between ${
                    selectedLanguages.includes(lang)
                      ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                      : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span>{lang}</span>
                  {selectedLanguages.includes(lang) && <Check className="h-4 w-4 text-yellow-400" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev + 1)}
              className="flex items-center gap-1.5 rounded-xl bg-yellow-400 px-5 py-2 text-xs font-bold text-black hover:bg-yellow-300 shadow-lg shadow-yellow-400/20"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 rounded-xl bg-yellow-400 px-5 py-2 text-xs font-bold text-black hover:bg-yellow-300 shadow-lg shadow-yellow-400/20"
            >
              <Sparkles className="h-4 w-4" />
              Update Matching Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
