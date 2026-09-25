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
} from "lucide-react";

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
  const [teachLevel, setTeachLevel] = useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">("Advanced");
  const [teachVerified, setTeachVerified] = useState(true);

  // In-line tag input state for "I want to learn"
  const [learnInput, setLearnInput] = useState("");
  const [learnLevel, setLearnLevel] = useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">("Intermediate");

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
    <div className="min-h-screen flex flex-col bg-[#f5f2fc] dark:bg-[#130f26] text-[#241b3d] dark:text-[#f4f0ff] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8fb] dark:bg-[#282147] border border-[#ddd4f5] dark:border-[#362c5e] text-xs font-semibold text-[#7d6ce8] dark:text-[#ac98f2] mb-2">
              <CoinIcon size={12} />
              <span>1 Hour Taught = 10 Credits Earned</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#241b3d] dark:text-[#f4f0ff]">
              My skills
            </h1>
            <p className="text-xs sm:text-sm text-[#7a719c] dark:text-[#a99ed4] mt-1">
              Manage what you can teach to earn credits, and what you want to learn.
            </p>
          </div>

          <Link
            href="/matches"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
          >
            <span>View reciprocal matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* TWO EDITABLE TAG PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PANEL 1: "I can teach" */}
          <div className="rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-6 sm:p-7 space-y-5 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#ddd4f5]/60 dark:border-[#362c5e]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2] flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
                    I can teach
                  </h2>
                  <span className="text-[11px] text-[#7a719c] dark:text-[#a99ed4]">
                    Earn 10 credits per hour taught
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#7d6ce8] dark:text-[#ac98f2] bg-[#ede8fb] dark:bg-[#282147] px-2.5 py-0.5 rounded-full">
                {userTaughtSkillsList.length} skills
              </span>
            </div>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2.5 min-h-[100px] items-start content-start">
              {userTaughtSkillsList.length > 0 ? (
                userTaughtSkillsList.map((skill) => (
                  <div
                    key={skill.id}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] text-xs font-medium text-[#241b3d] dark:text-[#f4f0ff] group hover:border-[#7d6ce8] transition-colors"
                  >
                    <span>{skill.name}</span>
                    <VerifiedBadge size="sm" showLabel={false} />
                    <button
                      type="button"
                      onClick={() => removeTeachingSkill(skill.id)}
                      className="text-[#7a719c] hover:text-rose-500 transition-colors ml-0.5"
                      aria-label={`Remove ${skill.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-full py-8 text-center text-xs text-[#7a719c] dark:text-[#a99ed4] space-y-1">
                  <p className="font-semibold text-[#241b3d] dark:text-[#f4f0ff]">
                    No teaching skills added yet
                  </p>
                  <p>Add what you know to start earning 10 credits per hour.</p>
                </div>
              )}
            </div>

            {/* Quick Add Tag Input */}
            <form onSubmit={handleAddTeachTag} className="pt-2 border-t border-[#ddd4f5]/60 dark:border-[#362c5e]/60 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={teachInput}
                  onChange={(e) => setTeachInput(e.target.value)}
                  placeholder="Add skill (e.g. Next.js, Figma, SQL)..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] text-xs text-[#241b3d] dark:text-[#f4f0ff] placeholder-[#7a719c] focus:outline-none focus:ring-2 focus:ring-[#7d6ce8]/40"
                />
                <button
                  type="submit"
                  disabled={!teachInput.trim()}
                  className="px-4 py-2.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] disabled:opacity-40 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add tag</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-[#7a719c] dark:text-[#a99ed4] px-1">
                <span>Proficiency Level</span>
                <select
                  value={teachLevel}
                  onChange={(e) => setTeachLevel(e.target.value as any)}
                  className="bg-transparent font-bold text-[#7d6ce8] dark:text-[#ac98f2] focus:outline-none cursor-pointer"
                >
                  <option value="Beginner" className="bg-white dark:bg-[#1e1938]">Beginner</option>
                  <option value="Intermediate" className="bg-white dark:bg-[#1e1938]">Intermediate</option>
                  <option value="Advanced" className="bg-white dark:bg-[#1e1938]">Advanced</option>
                  <option value="Expert" className="bg-white dark:bg-[#1e1938]">Expert</option>
                </select>
              </div>
            </form>
          </div>

          {/* PANEL 2: "I want to learn" */}
          <div className="rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-6 sm:p-7 space-y-5 transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#ddd4f5]/60 dark:border-[#362c5e]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2] flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
                    I want to learn
                  </h2>
                  <span className="text-[11px] text-[#7a719c] dark:text-[#a99ed4]">
                    Trade via direct swap or spend 10 credits
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#7d6ce8] dark:text-[#ac98f2] bg-[#ede8fb] dark:bg-[#282147] px-2.5 py-0.5 rounded-full">
                {userLearningSkillsList.length} skills
              </span>
            </div>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2.5 min-h-[100px] items-start content-start">
              {userLearningSkillsList.length > 0 ? (
                userLearningSkillsList.map((skill) => (
                  <div
                    key={skill.id}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] text-xs font-medium text-[#241b3d] dark:text-[#f4f0ff] group hover:border-[#7d6ce8] transition-colors"
                  >
                    <span>{skill.name}</span>
                    <span className="text-[10px] text-[#7a719c] dark:text-[#a99ed4]">
                      ({skill.level})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLearningSkill(skill.id)}
                      className="text-[#7a719c] hover:text-rose-500 transition-colors ml-0.5"
                      aria-label={`Remove ${skill.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-full py-8 text-center text-xs text-[#7a719c] dark:text-[#a99ed4] space-y-1">
                  <p className="font-semibold text-[#241b3d] dark:text-[#f4f0ff]">
                    No learning targets added yet
                  </p>
                  <p>Add skills you wish to learn to discover reciprocal matches.</p>
                </div>
              )}
            </div>

            {/* Quick Add Tag Input */}
            <form onSubmit={handleAddLearnTag} className="pt-2 border-t border-[#ddd4f5]/60 dark:border-[#362c5e]/60 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={learnInput}
                  onChange={(e) => setLearnInput(e.target.value)}
                  placeholder="Add target skill (e.g. PyTorch, Spanish, Docker)..."
                  className="flex-1 px-4 py-2.5 rounded-full bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] text-xs text-[#241b3d] dark:text-[#f4f0ff] placeholder-[#7a719c] focus:outline-none focus:ring-2 focus:ring-[#7d6ce8]/40"
                />
                <button
                  type="submit"
                  disabled={!learnInput.trim()}
                  className="px-4 py-2.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] disabled:opacity-40 text-white text-xs font-bold transition-all shrink-0 flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add tag</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-[#7a719c] dark:text-[#a99ed4] px-1">
                <span>Goal Proficiency</span>
                <select
                  value={learnLevel}
                  onChange={(e) => setLearnLevel(e.target.value as any)}
                  className="bg-transparent font-bold text-[#7d6ce8] dark:text-[#ac98f2] focus:outline-none cursor-pointer"
                >
                  <option value="Beginner" className="bg-white dark:bg-[#1e1938]">Beginner</option>
                  <option value="Intermediate" className="bg-white dark:bg-[#1e1938]">Intermediate</option>
                  <option value="Advanced" className="bg-white dark:bg-[#1e1938]">Advanced</option>
                  <option value="Expert" className="bg-white dark:bg-[#1e1938]">Expert</option>
                </select>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
