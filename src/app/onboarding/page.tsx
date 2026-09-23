"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSkillSwap } from "@/context/SkillSwapContext";
import ThemeToggle from "@/components/ThemeToggle";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  BookOpen,
  GraduationCap,
  User,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Plus,
  X,
  Share2,
  Globe,
  Award,
  ExternalLink,
  Laptop,
  Users,
  Compass,
  Briefcase,
  Flame,
} from "lucide-react";

const REFERRAL_SOURCES = [
  { id: "social", label: "Social Media", icon: Share2, desc: "Twitter/X, LinkedIn, YouTube, TikTok" },
  { id: "referral", label: "Friend or Colleague", icon: Users, desc: "Invited by a peer or mentor" },
  { id: "search", label: "Search Engine", icon: Globe, desc: "Google, DuckDuckGo, Bing search" },
  { id: "campus", label: "Campus or University", icon: GraduationCap, desc: "College club, hackathon, or campus event" },
  { id: "community", label: "Tech Community / Discord", icon: Laptop, desc: "Developer server, Reddit, or meetup" },
  { id: "other", label: "Other / Direct", icon: Compass, desc: "Articles, blogs, or newsletters" },
];

const SUGGESTED_LEARN_SKILLS = [
  "Python & Machine Learning",
  "UI/UX Design in Figma",
  "React & Next.js",
  "TypeScript",
  "Conversational Spanish",
  "Public Speaking",
  "Data Analysis",
  "System Architecture",
  "DevOps & Docker",
  "Financial Modeling",
];

const SUGGESTED_TEACH_SKILLS = [
  "React & Next.js",
  "Python & Machine Learning",
  "TypeScript",
  "UI/UX Design in Figma",
  "SQL & Databases",
  "Node.js Backend",
  "Graphic Design",
  "Product Management",
  "Creative Writing",
  "Video Editing",
];

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { saveOnboardingProfile, showToast } = useSkillSwap();

  // Wizard state: 1 (Source) -> 2 (Role) -> 3 (Profiling & Credentials) -> 4 (100 Credit Grant)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Source Tracking
  const [referralSource, setReferralSource] = useState("Friend or Colleague");

  // Step 2: Role Selection
  const [rolePreference, setRolePreference] = useState<"learner" | "teacher" | "both">("both");

  // Step 3: Skill Profiling
  // Learning Profile
  const [learnSkills, setLearnSkills] = useState<string[]>(["Python & Machine Learning", "UI/UX Design in Figma"]);
  const [customLearn, setCustomLearn] = useState("");
  const [learnLevel, setLearnLevel] = useState<"Beginner" | "Intermediate" | "Expert">("Beginner");
  const [learningGoal, setLearningGoal] = useState("Build production-ready projects and master modern design principles");

  // Teaching Profile
  const [teachSkills, setTeachSkills] = useState<string[]>(["React & Next.js"]);
  const [customTeach, setCustomTeach] = useState("");
  const [teachLevel, setTeachLevel] = useState<"Beginner" | "Intermediate" | "Expert">("Expert");
  const [yearsExperience, setYearsExperience] = useState<number>(3);
  const [credentialsUrl, setCredentialsUrl] = useState("https://linkedin.com/in/verified-dev");
  const [githubUrl, setGithubUrl] = useState("https://github.com/developer");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [bio, setBio] = useState("Excited to share practical real-world experience and learn from peers on SkillSwap.");
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);

  // Skill toggles
  const toggleLearnSkill = (skill: string) => {
    setLearnSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomLearnSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLearn.trim() && !learnSkills.includes(customLearn.trim())) {
      setLearnSkills((prev) => [...prev, customLearn.trim()]);
      setCustomLearn("");
    }
  };

  const toggleTeachSkill = (skill: string) => {
    setTeachSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomTeachSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTeach.trim() && !teachSkills.includes(customTeach.trim())) {
      setTeachSkills((prev) => [...prev, customTeach.trim()]);
      setCustomTeach("");
    }
  };

  // Submit and grant 100 baseline credits
  const handleFinalizeOnboarding = async () => {
    setSubmitting(true);
    try {
      const primaryCredential = credentialsUrl.trim() || githubUrl.trim() || portfolioUrl.trim() || undefined;

      const formattedLearnSkills = learnSkills.map((name) => ({
        name,
        level: learnLevel,
        goal: learningGoal,
      }));

      const formattedTeachSkills = teachSkills.map((name) => ({
        name,
        level: teachLevel,
        years: yearsExperience,
      }));

      await saveOnboardingProfile({
        referralSource,
        rolePreference,
        learnSkills: formattedLearnSkills,
        teachSkills: formattedTeachSkills,
        credentialsUrl: primaryCredential,
        bio,
        avatar,
      });

      setStep(4);
    } catch (err: any) {
      showToast("Error", err.message || "Failed to finalize profile", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      {/* Top Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#E4E1F5] dark:border-[#2D264E] bg-white/80 dark:bg-[#0E0C1B]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C3AED] to-[#A78BFA] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-[#7C3AED]/20">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-[#18181B] dark:text-white">
            SkillSwap
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] font-semibold hidden sm:inline">
            Intelligent Onboarding
          </span>
        </div>

        {/* 4-Step Progress Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-3 text-xs font-semibold">
          {[
            { s: 1, label: "Source" },
            { s: 2, label: "Role" },
            { s: 3, label: "Profiling" },
            { s: 4, label: "Credits" },
          ].map((item, idx) => (
            <React.Fragment key={item.s}>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                  step === item.s
                    ? "bg-[#7C3AED] text-white font-bold shadow-sm"
                    : step > item.s
                    ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-medium"
                    : "text-[#71717A] dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60"
                }`}
              >
                <span>{step > item.s ? "✓" : item.s}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </div>
              {idx < 3 && <span className="text-[#E4E1F5] dark:text-[#2D264E]">→</span>}
            </React.Fragment>
          ))}
        </div>

        <ThemeToggle />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-xl p-6 sm:p-10 transition-all">

          {/* STEP 1: Source Tracking */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                  Step 1 of 4 • Source Tracking
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18181B] dark:text-white mt-1">
                  How did you hear about SkillSwap?
                </h2>
                <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
                  Help us personalize your peer exchange and community network.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {REFERRAL_SOURCES.map((source) => {
                  const Icon = source.icon;
                  const isSelected = referralSource === source.label;
                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => setReferralSource(source.label)}
                      className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all ${
                        isSelected
                          ? "border-[#7C3AED] bg-[#EDE9FE]/50 dark:bg-[#7C3AED]/15 shadow-sm ring-2 ring-[#7C3AED]/30"
                          : "border-[#E4E1F5] dark:border-[#2D264E] hover:border-[#7C3AED]/50 bg-[#F8F7FF] dark:bg-[#1A1630]"
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${
                        isSelected ? "bg-[#7C3AED] text-white" : "bg-white dark:bg-[#231C3D] text-[#7C3AED]"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-[#18181B] dark:text-white">
                          {source.label}
                        </div>
                        <div className="text-xs text-[#71717A] dark:text-zinc-400 mt-0.5 line-clamp-1">
                          {source.desc}
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-[#7C3AED] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#7C3AED]/25 transition-all"
                >
                  <span>Continue to Role Selection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Role Selection */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                  Step 2 of 4 • Role Selection
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18181B] dark:text-white mt-1">
                  What is your primary intent?
                </h2>
                <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
                  Choose your journey. You can learn from experts, offer teaching packages, or do both.
                </p>
              </div>

              <div className="space-y-3.5 pt-2">
                {[
                  {
                    id: "learner",
                    title: "I want to Learn",
                    role: "learner" as const,
                    badge: "Learner",
                    desc: "Explore masterclasses, book 1-on-1 mentor sessions using your credits, and gain high-demand skills.",
                    icon: BookOpen,
                    highlight: "Bypass swaps with credit bookings",
                  },
                  {
                    id: "teacher",
                    title: "I want to Teach",
                    role: "teacher" as const,
                    badge: "Instructor",
                    desc: "Publish your skill packages (per-session & full course bundles), verify your credentials, and earn credits.",
                    icon: Award,
                    highlight: "Earn credits held securely in escrow",
                  },
                  {
                    id: "both",
                    title: "Both (Mutual Skill Swap)",
                    role: "both" as const,
                    badge: "Recommended",
                    desc: "The full reciprocal experience: Teach what you know, learn what you need, and engage in 1:1 direct swaps.",
                    icon: Sparkles,
                    highlight: "Optimal reciprocal matching compatibility",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = rolePreference === item.role;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRolePreference(item.role)}
                      className={`w-full p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                        isSelected
                          ? "border-[#7C3AED] bg-[#EDE9FE]/50 dark:bg-[#7C3AED]/15 shadow-md ring-2 ring-[#7C3AED]/30"
                          : "border-[#E4E1F5] dark:border-[#2D264E] hover:border-[#7C3AED]/50 bg-[#F8F7FF] dark:bg-[#1A1630]"
                      }`}
                    >
                      <div className={`p-3 rounded-2xl ${
                        isSelected ? "bg-[#7C3AED] text-white" : "bg-white dark:bg-[#231C3D] text-[#7C3AED]"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-[#18181B] dark:text-white">
                            {item.title}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA]">
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
                          {item.desc}
                        </p>
                        <div className="mt-2 text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1.5">
                          <span>✦</span>
                          <span>{item.highlight}</span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-6 h-6 text-[#7C3AED] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-[#71717A] dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#7C3AED]/25 transition-all"
                >
                  <span>Continue to Skill Profiling</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Skill Profiling & Credential Verification */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                  Step 3 of 4 • Skill Profiling & Trust
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#18181B] dark:text-white mt-1">
                  Configure Your Skill Portfolio
                </h2>
                <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
                  Tailored to your selected role ({rolePreference}). Verify credentials to earn trust badges.
                </p>
              </div>

              {/* SECTION A: Learning Goals (if learner or both) */}
              {(rolePreference === "learner" || rolePreference === "both") && (
                <div className="p-5 rounded-2xl border border-sky-200 dark:border-sky-950/60 bg-sky-50/50 dark:bg-sky-950/20 space-y-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    <h3 className="text-sm font-bold text-sky-900 dark:text-sky-200">
                      Skills You Want to Learn
                    </h3>
                  </div>

                  {/* Search / Add custom */}
                  <form onSubmit={addCustomLearnSkill} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customLearn}
                        onChange={(e) => setCustomLearn(e.target.value)}
                        placeholder="Add learning skill (e.g. Next.js, Rust)..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-[#161327] text-xs text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!customLearn.trim()}
                      className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      Add
                    </button>
                  </form>

                  {/* Selected Chips */}
                  <div className="flex flex-wrap gap-2">
                    {learnSkills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-200 border border-sky-300 dark:border-sky-800"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => toggleLearnSkill(s)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Suggested Chips */}
                  <div className="pt-1">
                    <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider block mb-1.5">
                      Suggested for you:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_LEARN_SKILLS.slice(0, 5).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleLearnSkill(s)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                            learnSkills.includes(s)
                              ? "bg-sky-600 text-white border-sky-600"
                              : "bg-white dark:bg-[#1A1630] border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-sky-400"
                          }`}
                        >
                          {learnSkills.includes(s) ? "✓ " : "+ "}
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Proficiency & Learning Goal */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Current Proficiency Level
                      </label>
                      <select
                        value={learnLevel}
                        onChange={(e) => setLearnLevel(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-[#161327] text-xs text-[#18181B] dark:text-white"
                      >
                        <option value="Beginner">Beginner (Starting from scratch)</option>
                        <option value="Intermediate">Intermediate (Have basics, need depth)</option>
                        <option value="Expert">Expert (Advanced polish & review)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Your Learning Goal
                      </label>
                      <input
                        type="text"
                        value={learningGoal}
                        onChange={(e) => setLearningGoal(e.target.value)}
                        placeholder="What do you want to accomplish?"
                        className="w-full px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-900 bg-white dark:bg-[#161327] text-xs text-[#18181B] dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION B: Teaching Profile & Credentials Proof (if teacher or both) */}
              {(rolePreference === "teacher" || rolePreference === "both") && (
                <div className="p-5 rounded-2xl border border-purple-200 dark:border-purple-950/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200">
                        Skills You Offer & Proof of Experience
                      </h3>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Legibility & Trust</span>
                    </span>
                  </div>

                  {/* Search / Add custom teach */}
                  <form onSubmit={addCustomTeachSkill} className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={customTeach}
                        onChange={(e) => setCustomTeach(e.target.value)}
                        placeholder="Add skill you can teach (e.g. React, PyTorch)..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-purple-200 dark:border-purple-900 bg-white dark:bg-[#161327] text-xs text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!customTeach.trim()}
                      className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold disabled:opacity-50"
                    >
                      Add
                    </button>
                  </form>

                  {/* Selected Teach Chips */}
                  <div className="flex flex-wrap gap-2">
                    {teachSkills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 border border-purple-300 dark:border-purple-800"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => toggleTeachSkill(s)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Years & Proficiency */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Years of Experience
                      </label>
                      <select
                        value={yearsExperience}
                        onChange={(e) => setYearsExperience(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-900 bg-white dark:bg-[#161327] text-xs text-[#18181B] dark:text-white"
                      >
                        <option value={1}>1 Year (Junior Mentor)</option>
                        <option value={3}>3-4 Years (Mid-level Practitioner)</option>
                        <option value={5}>5-7 Years (Senior Practitioner)</option>
                        <option value={8}>8+ Years (Staff / Principal)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Teaching Level
                      </label>
                      <select
                        value={teachLevel}
                        onChange={(e) => setTeachLevel(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-900 bg-white dark:bg-[#161327] text-xs text-[#18181B] dark:text-white"
                      >
                        <option value="Beginner">Foundational Concepts</option>
                        <option value="Intermediate">Intermediate & Architectural</option>
                        <option value="Expert">Mastery / Advanced Production</option>
                      </select>
                    </div>
                  </div>

                  {/* Credentials & Proof URLs */}
                  <div className="space-y-2.5 pt-2 border-t border-purple-200/60 dark:border-purple-900/60">
                    <label className="text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center justify-between">
                      <span>Credentials & Proof (LinkedIn, GitHub, Portfolio)</span>
                      <span className="text-[11px] font-normal text-purple-600 dark:text-purple-400">
                        Required for verification badge
                      </span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <input
                          type="url"
                          value={credentialsUrl}
                          onChange={(e) => setCredentialsUrl(e.target.value)}
                          placeholder="LinkedIn Profile or Credential Link"
                          className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-900 bg-white dark:bg-[#161327] text-xs text-[#18181B] dark:text-white"
                        />
                      </div>
                      <div>
                        <input
                          type="url"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          placeholder="GitHub Profile URL (optional)"
                          className="w-full px-3 py-2 rounded-xl border border-purple-200 dark:border-purple-900 bg-white dark:bg-[#161327] text-xs text-[#18181B] dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bio & Avatar */}
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Bio & Intro
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#161327] text-xs text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                    Select Avatar Preset
                  </label>
                  <div className="flex gap-2.5">
                    {AVATAR_PRESETS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(av)}
                        className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-all ${
                          avatar === av
                            ? "border-[#7C3AED] ring-2 ring-[#7C3AED]/40 scale-105"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-[#71717A] dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  disabled={submitting}
                  onClick={handleFinalizeOnboarding}
                  className="px-6 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-semibold flex items-center gap-2 shadow-lg shadow-[#7C3AED]/25 disabled:opacity-50 transition-all"
                >
                  {submitting ? (
                    <span>Verifying & Setting Up...</span>
                  ) : (
                    <>
                      <span>Complete & Claim 100 Credits</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Credit Initialization & Confirmation */}
          {step === 4 && (
            <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#7C3AED] via-[#8B5CF6] to-[#10B981] text-white flex items-center justify-center mx-auto shadow-2xl shadow-[#7C3AED]/30">
                <Coins className="w-10 h-10 animate-bounce" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Profile Verification & Initialization Complete
                </span>
                <h2 className="text-3xl font-extrabold text-[#18181B] dark:text-white mt-1">
                  100 Baseline Credits Granted! 🪙
                </h2>
                <p className="text-sm text-[#71717A] dark:text-zinc-400 mt-2 max-w-md mx-auto">
                  Your baseline credit wallet has been funded according to the SkillSwap Master Specification. You can now engage in mutual skill swaps or book direct teacher packages.
                </p>
              </div>

              {/* Profile Summary Card */}
              <div className="max-w-md mx-auto p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20 text-left space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-emerald-300" />
                    <div>
                      <div className="text-sm font-bold text-[#18181B] dark:text-white">
                        {rolePreference === "both" ? "Peer Swapper & Mentor" : rolePreference === "teacher" ? "Verified Teacher" : "Skill Learner"}
                      </div>
                      <div className="text-xs text-[#71717A] dark:text-zinc-400">
                        Source: {referralSource}
                      </div>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-900/50 flex justify-between text-xs">
                  <span className="text-zinc-500">Starting Wallet Balance:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">100 Credits (Escrow Ready)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => router.push("/matches")}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#7C3AED]/25 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Find Reciprocal Matches</span>
                </button>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-[#18181B] dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <span>Go to Dashboard</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}