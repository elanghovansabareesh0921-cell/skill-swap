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
  ArrowRight,
  BookOpen,
  GraduationCap,
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
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-white cyber-grid transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-[#181B22] text-xs font-black uppercase text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600] mb-2">
              <CoinIcon size={12} />
              <span>1 Hour Taught = 10 Credits Earned</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
              My skills
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
              Manage what you can teach to earn credits, and what you want to learn.
            </p>
          </div>

          <Link
            href="/matches"
            className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none self-start sm:self-auto cursor-pointer"
          >
            <span>View reciprocal matches</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </Link>
        </div>

        {/* TWO EDITABLE TAG PANELS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* PANEL 1: "I can teach" */}
          <div className="border-2 border-black bg-[#181B22] p-6 sm:p-7 space-y-5 shadow-[6px_6px_0px_0px_#FFE600] transition-all">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 border-2 border-black bg-[#FFE600] text-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                  <GraduationCap className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase text-white">
                    I can teach
                  </h2>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Earn 10 credits per hour taught
                  </span>
                </div>
              </div>
              <span className="text-xs font-black uppercase text-black bg-[#FFE600] border-2 border-black px-2.5 py-0.5 shadow-[2px_2px_0px_0px_#000000]">
                {userTaughtSkillsList.length} skills
              </span>
            </div>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2.5 min-h-[100px] items-start content-start">
              {userTaughtSkillsList.length > 0 ? (
                userTaughtSkillsList.map((skill) => (
                  <div
                    key={skill.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-[#12141C] text-xs font-mono font-bold text-white shadow-[2px_2px_0px_0px_#000000] hover:border-[#FFE600] transition-colors"
                  >
                    <span>{skill.name}</span>
                    <VerifiedBadge size="sm" showLabel={false} />
                    <button
                      type="button"
                      onClick={() => removeTeachingSkill(skill.id)}
                      className="text-zinc-400 hover:text-[#FF5E7E] transition-colors ml-0.5 cursor-pointer"
                      aria-label={`Remove ${skill.name}`}
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-full py-8 text-center text-xs text-zinc-400 space-y-1">
                  <p className="font-black uppercase text-white">
                    No teaching skills added yet
                  </p>
                  <p>Add what you know to start earning 10 credits per hour.</p>
                </div>
              )}
            </div>

            {/* Quick Add Tag Input */}
            <form onSubmit={handleAddTeachTag} className="pt-2 border-t-2 border-black space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={teachInput}
                  onChange={(e) => setTeachInput(e.target.value)}
                  placeholder="Add skill (e.g. Next.js, Figma, SQL)..."
                  className="flex-1 px-4 py-2.5 border-2 border-black bg-[#12141C] text-xs text-white placeholder-zinc-500 font-medium focus:outline-none focus:border-[#FFE600] focus:shadow-[2px_2px_0px_0px_#FFE600]"
                />
                <button
                  type="submit"
                  disabled={!teachInput.trim()}
                  className="px-4 py-2.5 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] disabled:opacity-40 text-black text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add tag</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-mono">
                <span className="font-bold uppercase">Proficiency Level</span>
                <select
                  value={teachLevel}
                  onChange={(e) => setTeachLevel(e.target.value as any)}
                  className="bg-[#12141C] border border-black font-black uppercase text-[#FFE600] px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="Beginner" className="bg-[#181B22] text-white">Beginner</option>
                  <option value="Intermediate" className="bg-[#181B22] text-white">Intermediate</option>
                  <option value="Advanced" className="bg-[#181B22] text-white">Advanced</option>
                  <option value="Expert" className="bg-[#181B22] text-white">Expert</option>
                </select>
              </div>
            </form>
          </div>

          {/* PANEL 2: "I want to learn" */}
          <div className="border-2 border-black bg-[#181B22] p-6 sm:p-7 space-y-5 shadow-[6px_6px_0px_0px_#38BDF8] transition-all">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 border-2 border-black bg-[#38BDF8] text-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                  <BookOpen className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase text-white">
                    I want to learn
                  </h2>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    Trade via direct swap or spend 10 credits
                  </span>
                </div>
              </div>
              <span className="text-xs font-black uppercase text-black bg-[#38BDF8] border-2 border-black px-2.5 py-0.5 shadow-[2px_2px_0px_0px_#000000]">
                {userLearningSkillsList.length} skills
              </span>
            </div>

            {/* Tag List */}
            <div className="flex flex-wrap gap-2.5 min-h-[100px] items-start content-start">
              {userLearningSkillsList.length > 0 ? (
                userLearningSkillsList.map((skill) => (
                  <div
                    key={skill.id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-[#12141C] text-xs font-mono font-bold text-white shadow-[2px_2px_0px_0px_#000000] hover:border-[#38BDF8] transition-colors"
                  >
                    <span>{skill.name}</span>
                    <span className="text-[10px] text-[#38BDF8] font-bold">
                      ({skill.level})
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLearningSkill(skill.id)}
                      className="text-zinc-400 hover:text-[#FF5E7E] transition-colors ml-0.5 cursor-pointer"
                      aria-label={`Remove ${skill.name}`}
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-full py-8 text-center text-xs text-zinc-400 space-y-1">
                  <p className="font-black uppercase text-white">
                    No learning targets added yet
                  </p>
                  <p>Add skills you wish to learn to discover reciprocal matches.</p>
                </div>
              )}
            </div>

            {/* Quick Add Tag Input */}
            <form onSubmit={handleAddLearnTag} className="pt-2 border-t-2 border-black space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={learnInput}
                  onChange={(e) => setLearnInput(e.target.value)}
                  placeholder="Add target skill (e.g. PyTorch, Spanish, Docker)..."
                  className="flex-1 px-4 py-2.5 border-2 border-black bg-[#12141C] text-xs text-white placeholder-zinc-500 font-medium focus:outline-none focus:border-[#38BDF8] focus:shadow-[2px_2px_0px_0px_#38BDF8]"
                />
                <button
                  type="submit"
                  disabled={!learnInput.trim()}
                  className="px-4 py-2.5 border-2 border-black bg-[#38BDF8] hover:bg-[#0284c7] disabled:opacity-40 text-black text-xs font-black uppercase tracking-wider transition-all shrink-0 flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Add tag</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400 px-1 font-mono">
                <span className="font-bold uppercase">Goal Proficiency</span>
                <select
                  value={learnLevel}
                  onChange={(e) => setLearnLevel(e.target.value as any)}
                  className="bg-[#12141C] border border-black font-black uppercase text-[#38BDF8] px-2 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="Beginner" className="bg-[#181B22] text-white">Beginner</option>
                  <option value="Intermediate" className="bg-[#181B22] text-white">Intermediate</option>
                  <option value="Advanced" className="bg-[#181B22] text-white">Advanced</option>
                  <option value="Expert" className="bg-[#181B22] text-white">Expert</option>
                </select>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
