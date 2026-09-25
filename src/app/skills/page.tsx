"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import CoinIcon from "@/components/common/CoinIcon";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  Plus,
  X,
  Sparkles,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Check,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export default function MySkillsPage() {
  const {
    userTaughtSkillsList,
    userLearningSkillsList,
    addTeachingSkill,
    removeTeachingSkill,
    addLearningSkill,
    removeLearningSkill,
  } = useSkillSwap();

  // In-line tag input state for "I can teach"
  const [teachInput, setTeachInput] = useState("");
  const [teachLevel, setTeachLevel] = useState<
    "Beginner" | "Intermediate" | "Advanced" | "Expert"
  >("Advanced");

  // In-line tag input state for "I want to learn"
  const [learnInput, setLearnInput] = useState("");
  const [learnLevel, setLearnLevel] = useState<
    "Beginner" | "Intermediate" | "Advanced" | "Expert"
  >("Intermediate");

  const handleAddTeachTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teachInput.trim()) return;
    addTeachingSkill({
      name: teachInput.trim(),
      level: teachLevel,
      category: "Tech",
    });
    setTeachInput("");
  };

  const handleAddLearnTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnInput.trim()) return;
    addLearningSkill({
      name: learnInput.trim(),
      level: learnLevel,
      goal: "Level up practical skills",
    });
    setLearnInput("");
  };

  return (
    <div className="min-h-screen flex flex-col ambient-bg text-white pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/8">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border-white/10 text-xs font-semibold text-white/80 mb-3">
              <CoinIcon size={13} />
              <span className="bg-linear-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
                1 Hour Taught = 10 Credits Earned
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              My <span className="text-gradient">skills matrix</span>
            </h1>
            <p className="text-sm text-white/50 mt-2 max-w-xl">
              Configure what you teach to earn credits, and what you want to learn to unlock reciprocal AI matching.
            </p>
          </div>

          <Link
            href="/matches"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white shadow-xl transition-all cursor-pointer hover:opacity-95 active:scale-[0.99] self-start sm:self-auto"
            style={{
              background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
              boxShadow: "0 4px 18px rgba(124,108,246,0.35)",
            }}
          >
            <span>View Reciprocal Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ── TWO EDITABLE SKILLS PANELS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PANEL 1: "I can teach" */}
          <div className="rounded-3xl glass border-white/10 p-6 sm:p-7 space-y-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">
                      I Can Teach
                    </h2>
                    <span className="text-[11px] text-white/45">
                      Earn 10 credits per hour taught
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-violet-300 glass px-2.5 py-1 rounded-full border-violet-500/20">
                  {userTaughtSkillsList.length} skills
                </span>
              </div>

              {/* Tag List */}
              <div className="flex flex-wrap gap-2.5 min-h-[120px] items-start content-start">
                {userTaughtSkillsList.length > 0 ? (
                  userTaughtSkillsList.map((skill) => (
                    <div
                      key={skill.id}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-white group hover:border-violet-500/40 transition-colors shadow-sm"
                    >
                      <span>{skill.name}</span>
                      <VerifiedBadge size="sm" showLabel={false} />
                      <button
                        type="button"
                        onClick={() => removeTeachingSkill(skill.id)}
                        className="text-white/40 hover:text-rose-400 transition-colors ml-0.5 cursor-pointer"
                        aria-label={`Remove ${skill.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-8 text-center text-xs text-white/40 space-y-1">
                    <p className="font-semibold text-white">
                      No teaching skills added yet
                    </p>
                    <p>Add what you know to start earning 10 credits per hour.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Add Tag Input */}
            <form
              onSubmit={handleAddTeachTag}
              className="pt-3 border-t border-white/8 space-y-3"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={teachInput}
                  onChange={(e) => setTeachInput(e.target.value)}
                  placeholder="Add skill (e.g. Next.js, Figma, SQL)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50"
                />
                <button
                  type="submit"
                  disabled={!teachInput.trim()}
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-md cursor-pointer disabled:opacity-40"
                  style={{
                    background:
                      "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 px-1">
                <span>Proficiency Level</span>
                <select
                  value={teachLevel}
                  onChange={(e) => setTeachLevel(e.target.value as any)}
                  className="bg-transparent font-bold text-violet-300 focus:outline-none cursor-pointer [&>option]:bg-[#0d0f17] [&>option]:text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </form>
          </div>

          {/* PANEL 2: "I want to learn" */}
          <div className="rounded-3xl glass border-white/10 p-6 sm:p-7 space-y-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-white">
                      I Want to Learn
                    </h2>
                    <span className="text-[11px] text-white/45">
                      Trade via direct swap or spend 10 credits
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold text-cyan-300 glass px-2.5 py-1 rounded-full border-cyan-500/20">
                  {userLearningSkillsList.length} skills
                </span>
              </div>

              {/* Tag List */}
              <div className="flex flex-wrap gap-2.5 min-h-[120px] items-start content-start">
                {userLearningSkillsList.length > 0 ? (
                  userLearningSkillsList.map((skill) => (
                    <div
                      key={skill.id}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-medium text-white group hover:border-cyan-500/40 transition-colors shadow-sm"
                    >
                      <span>{skill.name}</span>
                      <span className="text-[10px] text-cyan-300 font-medium">
                        ({skill.level})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLearningSkill(skill.id)}
                        className="text-white/40 hover:text-rose-400 transition-colors ml-0.5 cursor-pointer"
                        aria-label={`Remove ${skill.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-8 text-center text-xs text-white/40 space-y-1">
                    <p className="font-semibold text-white">
                      No learning targets added yet
                    </p>
                    <p>Add skills you wish to learn to discover reciprocal matches.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Add Tag Input */}
            <form
              onSubmit={handleAddLearnTag}
              className="pt-3 border-t border-white/8 space-y-3"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={learnInput}
                  onChange={(e) => setLearnInput(e.target.value)}
                  placeholder="Add target skill (e.g. PyTorch, Spanish)..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="submit"
                  disabled={!learnInput.trim()}
                  className="px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-md cursor-pointer disabled:opacity-40"
                  style={{
                    background:
                      "linear-gradient(135deg, #06B6D4 0%, #7C6CF6 100%)",
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Goal</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 px-1">
                <span>Target Proficiency</span>
                <select
                  value={learnLevel}
                  onChange={(e) => setLearnLevel(e.target.value as any)}
                  className="bg-transparent font-bold text-cyan-300 focus:outline-none cursor-pointer [&>option]:bg-[#0d0f17] [&>option]:text-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
