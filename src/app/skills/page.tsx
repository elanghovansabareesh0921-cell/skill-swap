"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSkillSwap, UserSkillItem } from "@/context/SkillSwapContext";
import {
  Layers,
  GraduationCap,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  BookOpen,
  ArrowRight,
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

  // Add Teaching Form state
  const [newTeachName, setNewTeachName] = useState("");
  const [newTeachLevel, setNewTeachLevel] = useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">("Intermediate");
  const [newTeachCategory, setNewTeachCategory] = useState("Programming");
  const [showAddTeachModal, setShowAddTeachModal] = useState(false);

  // Add Learning Form state
  const [newLearnName, setNewLearnName] = useState("");
  const [newLearnLevel, setNewLearnLevel] = useState<"Beginner" | "Intermediate" | "Advanced" | "Expert">("Beginner");
  const [newLearnGoal, setNewLearnGoal] = useState("");
  const [showAddLearnModal, setShowAddLearnModal] = useState(false);

  const handleAddTeach = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeachName.trim()) return;

    addTeachingSkill({
      name: newTeachName.trim(),
      level: newTeachLevel,
      category: newTeachCategory,
    });
    setNewTeachName("");
    setShowAddTeachModal(false);
  };

  const handleAddLearn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLearnName.trim()) return;

    addLearningSkill({
      name: newLearnName.trim(),
      level: newLearnLevel,
      goal: newLearnGoal.trim(),
    });
    setNewLearnName("");
    setNewLearnGoal("");
    setShowAddLearnModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold mb-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Personal Knowledge Catalog</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
              My Skills
            </h1>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
              Manage the skills you offer in trades and the subjects you want to learn next.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddTeachModal(true)}
              className="px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Teaching Skill</span>
            </button>
            <button
              onClick={() => setShowAddLearnModal(true)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-[#18181B] dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Learning Goal</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: SKILLS I TEACH */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
                <h2 className="text-lg font-bold text-[#18181B] dark:text-white">Skills I Teach</h2>
              </div>
              <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-0.5">
                These skills appear on your public mentor card and in matching algorithms.
              </p>
            </div>
            <button
              onClick={() => setShowAddTeachModal(true)}
              className="text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New</span>
            </button>
          </div>

          {userTaughtSkillsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userTaughtSkillsList.map((skill) => (
                <div
                  key={skill.id}
                  className="p-5 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] flex flex-col justify-between group hover:border-[#A78BFA] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA]">
                        {skill.level}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#7C3AED]">
                        🪙 10 Credits
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#18181B] dark:text-white">
                      {skill.name}
                    </h3>
                    <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-1">
                      {skill.category || "General"}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => removeTeachingSkill(skill.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Remove skill"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-[#71717A] space-y-2">
              <p className="font-bold text-sm text-[#18181B] dark:text-white">No skills added yet.</p>
              <p>Add your first skill to start discovering people and receiving swap requests.</p>
            </div>
          )}
        </div>

        {/* SECTION 2: SKILLS I WANT TO LEARN */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
                <h2 className="text-lg font-bold text-[#18181B] dark:text-white">Skills I Want To Learn</h2>
              </div>
              <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-0.5">
                We use these to match you with compatible peer mentors offering swaps.
              </p>
            </div>
            <button
              onClick={() => setShowAddLearnModal(true)}
              className="text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Goal</span>
            </button>
          </div>

          {userLearningSkillsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userLearningSkillsList.map((skill) => (
                <div
                  key={skill.id}
                  className="p-5 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] flex flex-col justify-between group hover:border-[#A78BFA] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                        Target Proficiency: {skill.level}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#18181B] dark:text-white">
                      {skill.name}
                    </h3>
                    {skill.goal && (
                      <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-1 line-clamp-2">
                        {skill.goal}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2">
                    <button
                      onClick={() => removeLearningSkill(skill.id)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Remove goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-xs text-[#71717A] space-y-2">
              <p className="font-bold text-sm text-[#18181B] dark:text-white">No learning goals added yet.</p>
              <p>Add what you want to learn to unlock reciprocal matches.</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Teaching Modal */}
      {showAddTeachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddTeachModal(false)}
              className="absolute top-5 right-5 text-[#71717A] hover:text-[#18181B]"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#18181B] dark:text-white mb-1">Add Teaching Skill</h3>
            <p className="text-xs text-[#71717A] mb-4">What skill would you like to share with the community?</p>

            <form onSubmit={handleAddTeach} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">Skill Name</label>
                <input
                  type="text"
                  value={newTeachName}
                  onChange={(e) => setNewTeachName(e.target.value)}
                  placeholder="e.g. React & Next.js, Python, Figma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">Category</label>
                <select
                  value={newTeachCategory}
                  onChange={(e) => setNewTeachCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                >
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="AI & ML">AI & ML</option>
                  <option value="Business">Business</option>
                  <option value="Languages">Languages</option>
                  <option value="Media & Video">Media & Video</option>
                  <option value="Creative Arts">Creative Arts</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">Proficiency Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Beginner", "Intermediate", "Advanced", "Expert"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewTeachLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-semibold border ${
                        newTeachLevel === lvl
                          ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                          : "bg-[#F8F7FF] dark:bg-[#0E0C1B] border-[#E4E1F5] dark:border-[#2D264E] text-[#71717A]"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeachModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#71717A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm"
                >
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Learning Modal */}
      {showAddLearnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-2xl p-6 relative">
            <button
              onClick={() => setShowAddLearnModal(false)}
              className="absolute top-5 right-5 text-[#71717A] hover:text-[#18181B]"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-[#18181B] dark:text-white mb-1">Add Learning Goal</h3>
            <p className="text-xs text-[#71717A] mb-4">What skill would you like to master?</p>

            <form onSubmit={handleAddLearn} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">Skill Name</label>
                <input
                  type="text"
                  value={newLearnName}
                  onChange={(e) => setNewLearnName(e.target.value)}
                  placeholder="e.g. Machine Learning, Spanish, Video Editing"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">Target Proficiency</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["Beginner", "Intermediate", "Advanced", "Expert"] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setNewLearnLevel(lvl)}
                      className={`py-2 rounded-xl text-xs font-semibold border ${
                        newLearnLevel === lvl
                          ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                          : "bg-[#F8F7FF] dark:bg-[#0E0C1B] border-[#E4E1F5] dark:border-[#2D264E] text-[#71717A]"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#18181B] dark:text-zinc-200 block mb-1">Goal / Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={newLearnGoal}
                  onChange={(e) => setNewLearnGoal(e.target.value)}
                  placeholder="e.g. Build an AI agent pipeline, prepare for travel"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#0E0C1B] text-xs text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddLearnModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#71717A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
