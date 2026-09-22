"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
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
  Loader2,
} from "lucide-react";

const SUGGESTED_LEARN_SKILLS = [
  "Python",
  "UI/UX Design",
  "Machine Learning",
  "C++",
  "Video Editing",
  "Photography",
  "Digital Marketing",
  "Public Speaking",
  "Web Development",
  "AutoCAD",
  "Conversational Spanish",
  "Product Management",
];

const SUGGESTED_TEACH_SKILLS = [
  "React & Next.js",
  "TypeScript",
  "Figma Design Systems",
  "Python",
  "SQL & Databases",
  "Docker & DevOps",
  "Content Writing",
  "Graphic Design",
  "Data Analysis",
  "Financial Modeling",
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
  const supabase = createClient();
  const { addTeachingSkill, addLearningSkill, updateUserProfile, showToast } = useSkillSwap();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Learning Skills
  const [learnSkills, setLearnSkills] = useState<string[]>(["Python", "UI/UX Design"]);
  const [learnSearch, setLearnSearch] = useState("");
  const [customLearn, setCustomLearn] = useState("");

  // Step 2: Teaching Skills
  const [teachSkills, setTeachSkills] = useState<string[]>(["Web Development"]);
  const [teachSearch, setTeachSearch] = useState("");
  const [customTeach, setCustomTeach] = useState("");
  const [teachLevel, setTeachLevel] = useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">("Intermediate");

  // Step 3: About Yourself
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [bio, setBio] = useState("Excited to learn, teach, and swap skills on the platform!");
  const [location, setLocation] = useState("Remote / Global");
  const [currentActivity, setCurrentActivity] = useState("");
  const [school, setSchool] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");

  const toggleLearnSkill = (skill: string) => {
    if (learnSkills.includes(skill)) {
      setLearnSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      setLearnSkills((prev) => [...prev, skill]);
    }
  };

  const addCustomLearnSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customLearn.trim() && !learnSkills.includes(customLearn.trim())) {
      setLearnSkills((prev) => [...prev, customLearn.trim()]);
      setCustomLearn("");
    }
  };

  const toggleTeachSkill = (skill: string) => {
    if (teachSkills.includes(skill)) {
      setTeachSkills((prev) => prev.filter((s) => s !== skill));
    } else {
      setTeachSkills((prev) => [...prev, skill]);
    }
  };

  const addCustomTeachSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customTeach.trim() && !teachSkills.includes(customTeach.trim())) {
      setTeachSkills((prev) => [...prev, customTeach.trim()]);
      setCustomTeach("");
    }
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      // Sync with context
      teachSkills.forEach((t) => {
        addTeachingSkill({ name: t, level: teachLevel });
      });

      learnSkills.forEach((l) => {
        addLearningSkill({ name: l, level: "Beginner" });
      });

      // Update rich profile fields
      await updateUserProfile({
        avatar,
        bio,
        location,
        currentActivity: currentActivity.trim() || undefined,
        school: school.trim() || undefined,
        role: currentActivity.trim() || "Skill Swap Member",
      });
    } catch (e) {
      console.warn("Onboarding sync:", e);
    }

    showToast("Profile Configured! 🚀", "Welcome to your Skill Swap Dashboard.", "success");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      {/* Top Bar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-[#E4E1F5] dark:border-[#2D264E] bg-white/80 dark:bg-[#0E0C1B]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center font-bold text-sm">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-[#18181B] dark:text-white">
            Skill Swap
          </span>
        </div>

        {/* Progress Indicator: 1 -> 2 -> 3 -> Complete */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            step === 1
              ? "bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] font-bold"
              : step > 1
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-[#71717A]"
          }`}>
            <span>{step > 1 ? "✓" : "1"}</span>
            <span className="hidden sm:inline">Learn</span>
          </div>
          <span className="text-[#E4E1F5] dark:text-[#2D264E]">→</span>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            step === 2
              ? "bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] font-bold"
              : step > 2
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-[#71717A]"
          }`}>
            <span>{step > 2 ? "✓" : "2"}</span>
            <span className="hidden sm:inline">Teach</span>
          </div>
          <span className="text-[#E4E1F5] dark:text-[#2D264E]">→</span>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            step === 3
              ? "bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] font-bold"
              : step > 3
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-[#71717A]"
          }`}>
            <span>{step > 3 ? "✓" : "3"}</span>
            <span className="hidden sm:inline">Profile</span>
          </div>
          <span className="text-[#E4E1F5] dark:text-[#2D264E]">→</span>

          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
            step === 4
              ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold"
              : "text-[#71717A]"
          }`}>
            <span>4</span>
            <span className="hidden sm:inline">Ready</span>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm p-6 sm:p-10">

          {/* STEP 1: What do you want to learn? */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                  Step 1 of 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white mt-1">
                  What do you want to learn?
                </h2>
                <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
                  Select the skills you want to explore or search to add your own.
                </p>
              </div>

              {/* Search / Add custom */}
              <form onSubmit={addCustomLearnSkill} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customLearn}
                    onChange={(e) => setCustomLearn(e.target.value)}
                    placeholder="Search or type a new skill..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!customLearn.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
              </form>

              {/* Selected Chips */}
              {learnSkills.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-[#71717A] uppercase tracking-wider block mb-2">
                    Your Selected Interests ({learnSkills.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {learnSkills.map((skill) => (
                      <span
                        key={skill}
                        onClick={() => toggleLearnSkill(skill)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold cursor-pointer hover:bg-[#DDD6FE] transition-colors"
                      >
                        <span>{skill}</span>
                        <X className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              <div>
                <label className="text-xs font-semibold text-[#71717A] uppercase tracking-wider block mb-2">
                  Popular Topics
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_LEARN_SKILLS.map((skill) => {
                    const isSelected = learnSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleLearnSkill(skill)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm"
                            : "bg-white dark:bg-[#161327] border-[#E4E1F5] dark:border-[#2D264E] text-[#18181B] dark:text-zinc-300 hover:border-[#A78BFA]"
                        }`}
                      >
                        {skill} {isSelected ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="pt-6 border-t border-[#E4E1F5] dark:border-[#2D264E] flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={learnSkills.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: What can you teach? */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                  Step 2 of 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white mt-1">
                  What can you teach?
                </h2>
                <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
                  Share skills you already know to earn credits and trade in swaps.
                </p>
              </div>

              {/* Custom skill form */}
              <form onSubmit={addCustomTeachSkill} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customTeach}
                    onChange={(e) => setCustomTeach(e.target.value)}
                    placeholder="Search or enter a skill you can share..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!customTeach.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  Add
                </button>
              </form>

              {/* Selected Teaching Chips */}
              {teachSkills.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-[#71717A] uppercase tracking-wider block mb-2">
                    Skills You Can Offer ({teachSkills.length})
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {teachSkills.map((skill) => (
                      <span
                        key={skill}
                        onClick={() => toggleTeachSkill(skill)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold cursor-pointer hover:bg-[#DDD6FE] transition-colors"
                      >
                        <span>{skill}</span>
                        <X className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Experience Level */}
              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1.5">
                  General Teaching Proficiency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["Beginner", "Intermediate", "Advanced", "Expert"] as const).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setTeachLevel(level)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        teachLevel === level
                          ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                          : "bg-[#F8F7FF] dark:bg-[#0E0C1B] border-[#E4E1F5] dark:border-[#2D264E] text-[#71717A] dark:text-zinc-300"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <label className="text-xs font-semibold text-[#71717A] uppercase tracking-wider block mb-2">
                  Suggested Offerings
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TEACH_SKILLS.map((skill) => {
                    const isSelected = teachSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleTeachSkill(skill)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-sm"
                            : "bg-white dark:bg-[#161327] border-[#E4E1F5] dark:border-[#2D264E] text-[#18181B] dark:text-zinc-300 hover:border-[#A78BFA]"
                        }`}
                      >
                        {skill} {isSelected ? "✓" : "+"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation */}
              <div className="pt-6 border-t border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-xs font-semibold text-[#71717A] hover:text-[#18181B] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={teachSkills.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Tell us about yourself */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                  Step 3 of 3
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white mt-1">
                  Tell us about yourself
                </h2>
                <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
                  Choose an avatar, share a brief bio, and introduce yourself to the community.
                </p>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-2">
                  Select Profile Avatar
                </label>
                <div className="flex items-center gap-3">
                  {AVATAR_PRESETS.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAvatar(src)}
                      className={`relative rounded-full p-0.5 transition-all ${
                        avatar === src ? "ring-3 ring-[#7C3AED] scale-105" : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={src}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover border border-[#E4E1F5]"
                      />
                      {avatar === src && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bio Field */}
              <div className="space-y-1.5">
                <label htmlFor="bio" className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                  Bio / Introduction
                </label>
                <textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Share what excites you about learning and mentoring..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>

              {/* Current Activity / Occupation */}
              <div className="space-y-1.5">
                <label htmlFor="currentActivity" className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                  What are you doing right now? (Occupation / Headline)
                </label>
                <input
                  id="currentActivity"
                  type="text"
                  value={currentActivity}
                  onChange={(e) => setCurrentActivity(e.target.value)}
                  placeholder="e.g. Software Engineer @ Stripe • Learning AI Agents"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>

              {/* School / Education */}
              <div className="space-y-1.5">
                <label htmlFor="school" className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                  School / College / University (Optional)
                </label>
                <input
                  id="school"
                  type="text"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="e.g. Stanford University, MIT, Self-Taught"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label htmlFor="location" className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block">
                  Location (Optional)
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA • Remote"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>

              {/* Bottom Navigation */}
              <div className="pt-6 border-t border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 text-xs font-semibold text-[#71717A] hover:text-[#18181B] flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs sm:text-sm transition-all shadow-sm flex items-center gap-2"
                >
                  <span>Review & Finish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Summary & Ready */}
          {step === 4 && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-3xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
                  You&apos;re ready to swap skills!
                </h2>
                <p className="text-sm text-[#71717A] dark:text-zinc-400 mt-2 max-w-md mx-auto">
                  Your profile has been created and pre-loaded with 50 bonus credits to start exploring.
                </p>
              </div>

              {/* Summary Card */}
              <div className="p-6 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] text-left space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-[#E4E1F5] dark:border-[#2D264E]">
                  <img src={avatar} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-bold text-[#18181B] dark:text-white">{location}</p>
                    <p className="text-xs text-[#71717A] dark:text-zinc-400 line-clamp-1">{bio}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-[#7C3AED] block mb-1">Want to Learn:</span>
                    <div className="flex flex-wrap gap-1">
                      {learnSkills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-white dark:bg-[#161327] border text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-semibold text-[#7C3AED] block mb-1">Can Teach:</span>
                    <div className="flex flex-wrap gap-1">
                      {teachSkills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-white dark:bg-[#161327] border text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                  <span>🪙 Welcome Balance Credited:</span>
                  <span>50 Credits</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Explore Skill Swap</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}