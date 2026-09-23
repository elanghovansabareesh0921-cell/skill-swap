"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

const SUGGESTED_SKILLS = [
  "React & Next.js Architecture",
  "Python for Data Analysis",
  "Figma Design Systems",
  "Conversational Japanese",
  "Music Mixing in Logic Pro",
  "Product Analytics & SQL",
  "Calisthenics & Strength",
];

const EXPERIENCE_LEVELS = [
  { id: "Beginner", label: "Beginner Friendly", desc: "Patient guidance for absolute newcomers" },
  { id: "Intermediate", label: "Intermediate", desc: "Deepening practical core skills" },
  { id: "Advanced", label: "Advanced", desc: "Complex architectures & advanced mastery" },
  { id: "Expert", label: "Expert / Specialist", desc: "Production-grade edge cases & architecture" },
];

const TEACHING_FORMATS = [
  { id: "One-on-one", label: "One-on-one", desc: "Focused 1:1 pair learning (recommended)" },
  { id: "Group", label: "Group Cohort", desc: "Teach 3–5 peers simultaneously" },
  { id: "Both", label: "Both Formats", desc: "Flexible for 1:1 or small groups" },
];

const CREDIT_OPTIONS = [5, 10, 12, 15, 20];

const AVAILABILITY_DAYS = [
  "Weekdays Evenings",
  "Weekends",
  "Flexible / Anytime",
  "Mornings (EST)",
];

export default function TeachPage() {
  const router = useRouter();
  const { publishSkill, createTeacherPackage, teacherPackages } = useSkillSwap();

  const [step, setStep] = useState<number>(1);
  const [skillTitle, setSkillTitle] = useState("");
  const [category, setCategory] = useState("Programming");
  const [experienceLevel, setExperienceLevel] = useState<"Beginner" | "Intermediate" | "Advanced" | "All Levels">("Beginner");
  const [format, setFormat] = useState("One-on-one");
  const [credits, setCredits] = useState(50); // Per session rate
  const [fullCourseCredits, setFullCourseCredits] = useState(250); // Full course rate
  const [packageDescription, setPackageDescription] = useState("");
  const [availability, setAvailability] = useState("Flexible / Anytime");
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);

  const handlePublish = () => {
    if (!skillTitle.trim()) return;

    publishSkill({
      title: skillTitle.trim(),
      category,
      level: experienceLevel,
      credits,
      format,
      availability,
    });

    createTeacherPackage({
      skillName: skillTitle.trim(),
      sessionRateCredits: credits,
      fullCourseRateCredits: fullCourseCredits,
      description: packageDescription.trim() || `Comprehensive curriculum and personalized mentorship in ${skillTitle.trim()}.`,
    });

    setStep(6); // Success confirmation step
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] dark:bg-[#090D16] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-12 w-full">
        {/* Wizard Stepper Header */}
        {step < 6 && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">
              <span>Step {step} of 5</span>
              <span>{Math.round((step / 5) * 100)}% Completed</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 dark:bg-indigo-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-sm p-6 sm:p-9">
          {/* Step 1: What can you teach? */}
          {step === 1 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Setup Wizard
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">
                Share what you know.
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                What skill, topic, or craft can you teach another member?
              </p>

              <div className="mt-6">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Skill or Subject Title
                </label>
                <input
                  type="text"
                  value={skillTitle}
                  onChange={(e) => setSkillTitle(e.target.value)}
                  placeholder="e.g. Python Programming, UI/UX Design, Conversational French..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              {/* Suggestions */}
              <div className="mt-4">
                <span className="text-[11px] text-gray-400 dark:text-gray-500 font-medium block mb-2">
                  Popular topics right now:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SKILLS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setSkillTitle(sug)}
                      className="px-2.5 py-1 rounded-full bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-gray-200/80 dark:border-gray-700 text-[11px] text-gray-600 dark:text-gray-300 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Primary Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
                >
                  <option value="Programming">Programming</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Languages">Languages</option>
                  <option value="Music">Music</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Photography">Photography</option>
                  <option value="Academics">Academics</option>
                </select>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  disabled={!skillTitle.trim()}
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: What's your experience level? */}
          {step === 2 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Step 2
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                What&apos;s your target level?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Who will benefit the most from your mentorship?
              </p>

              <div className="mt-6 space-y-2.5">
                {EXPERIENCE_LEVELS.map((lvl) => {
                  const isSelected = experienceLevel === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => setExperienceLevel(lvl.id as any)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 ring-1 ring-indigo-600"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/40"
                      }`}
                    >
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{lvl.label}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lvl.desc}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: How do you want to teach? */}
          {step === 3 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Step 3
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                How do you want to teach?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Choose your preferred format for session delivery.
              </p>

              <div className="mt-6 space-y-2.5">
                {TEACHING_FORMATS.map((fmt) => {
                  const isSelected = format === fmt.id;
                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setFormat(fmt.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 ring-1 ring-indigo-600"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {fmt.id === "One-on-one" ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <Users className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{fmt.label}</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{fmt.desc}</p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Configure Teacher Pricing Model */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Step 4 • Teacher Pricing Model
                </span>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  Configure Your Pricing Packages
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Set your single session rate and complete curriculum package rate for learners booking directly via credits.
                </p>
              </div>

              {/* Per-Session Rate */}
              <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-900 dark:text-white block">
                      Per-Session Rate (45-Minute Session)
                    </label>
                    <span className="text-[11px] text-gray-500">Credits charged per individual teaching session</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">
                    <span>🪙</span>
                    <input
                      type="number"
                      min={10}
                      max={200}
                      value={credits}
                      onChange={(e) => setCredits(Math.max(5, Number(e.target.value)))}
                      className="w-16 px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-center text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  {[25, 40, 50, 75].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setCredits(val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        credits === val
                          ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                          : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {val} cr
                    </button>
                  ))}
                </div>
              </div>

              {/* Full Course / Curriculum Rate */}
              <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-900 dark:text-white block">
                      Full Course / Curriculum Rate (6-Session Bundle)
                    </label>
                    <span className="text-[11px] text-gray-500">Comprehensive end-to-end learning package</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-base font-bold text-emerald-600 dark:text-emerald-400">
                    <span>🪙</span>
                    <input
                      type="number"
                      min={50}
                      max={1000}
                      value={fullCourseCredits}
                      onChange={(e) => setFullCourseCredits(Math.max(25, Number(e.target.value)))}
                      className="w-20 px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-white dark:bg-gray-900 text-center text-sm font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  {[150, 200, 250, 350].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFullCourseCredits(val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        fullCourseCredits === val
                          ? "border-emerald-600 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200"
                          : "border-emerald-200 dark:border-emerald-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {val} cr
                    </button>
                  ))}
                </div>
              </div>

              {/* Package Description */}
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  Curriculum or Package Description
                </label>
                <textarea
                  rows={2}
                  value={packageDescription}
                  onChange={(e) => setPackageDescription(e.target.value)}
                  placeholder="Outline what learners will build and master across the sessions..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white"
                />
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300 leading-normal">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Escrow Guarantee:</strong> When a learner books, credits are held in escrow and automatically transferred to your wallet when you or the learner completes the session.
                </span>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-gray-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: When are you available? */}
          {step === 5 && (
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Step 5
              </span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                When are you available?
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                Set your baseline schedule for learners to book times.
              </p>

              <div className="mt-6 space-y-2.5">
                {AVAILABILITY_DAYS.map((timeOption) => {
                  const isSelected = availability === timeOption;
                  return (
                    <div
                      key={timeOption}
                      onClick={() => setAvailability(timeOption)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/40 ring-1 ring-indigo-600"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{timeOption}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Review summary box */}
              <div className="mt-6 p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs space-y-1.5">
                <p className="font-semibold text-indigo-950 dark:text-indigo-200">Publishing Summary:</p>
                <p className="text-indigo-800 dark:text-indigo-300">
                  • <strong>{skillTitle}</strong> ({experienceLevel})
                </p>
                <p className="text-indigo-800 dark:text-indigo-300">
                  • <strong>🪙 {credits} Credits / 60 min session</strong> ({format})
                </p>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handlePublish}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish My Skill</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Confirmation Screen */}
          {step === 6 && (
            <div className="text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Skill Published! 🚀</h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                &quot;{skillTitle}&quot; is now live on the Discover marketplace. Peers can request sessions directly.
              </p>

              <div className="mt-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/80 dark:border-gray-700/80 max-w-sm mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Skill:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{skillTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Rate:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">🪙 {credits} credits / session</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Target Level:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{experienceLevel}</span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3">
                <Link
                  href="/discover"
                  className="px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                >
                  View on Marketplace
                </Link>
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </div>
  );
}
