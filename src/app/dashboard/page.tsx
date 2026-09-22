"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SwapRequestModal from "@/components/SwapRequestModal";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap, SkillListing } from "@/context/SkillSwapContext";
import {
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  Play,
  CheckCircle2,
  BookOpen,
  PlusCircle,
  GraduationCap,
  Award,
  Search,
  Repeat,
  Star,
  ShieldCheck,
  User,
  Coins,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const {
    currentUser,
    credits,
    transactions,
    sessions,
    skills,
    userTaughtSkillsList,
    userLearningSkillsList,
    swapRequests,
    respondToSwapRequest,
  } = useSkillSwap();

  const [searchQuery, setSearchQuery] = useState("");
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
    skillToTeach: string;
  }>({
    id: "arun-kumar",
    name: "Arun Kumar",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    skillToTeach: "Python Programming & Data Structures",
  });

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const recommendedSkills = skills.slice(0, 4);

  // Calculate credits earned and spent
  const creditsEarned = transactions
    .filter((t) => t.type === "EARNED")
    .reduce((acc, t) => acc + t.amount, 0);
  const creditsSpent = transactions
    .filter((t) => t.type === "SPENT")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/discover?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/discover");
    }
  };

  const handleOpenSwap = (mentor: { id: string; name: string; avatar?: string; skill: string }) => {
    setSelectedTargetUser({
      id: mentor.id,
      name: mentor.name,
      avatar: mentor.avatar,
      skillToTeach: mentor.skill,
    });
    setSwapModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
              Good morning, {currentUser.name} 👋
            </h1>
            <p className="text-sm text-[#71717A] dark:text-zinc-400 mt-1 font-medium">
              What would you like to learn today?
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/discover"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-[#18181B] dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold shadow-sm transition-colors"
            >
              Explore Skills
            </Link>
            <Link
              href="/skills"
              className="px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Manage My Skills</span>
            </Link>
          </div>
        </div>

        {/* Large Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-5 h-5 text-[#71717A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a skill (e.g. Python, UI/UX Design, Machine Learning)..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-sm text-[#18181B] dark:text-white placeholder-[#71717A] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 transition-all"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-colors"
          >
            Search
          </button>
        </form>

        {/* CREDIT SUMMARY */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E4E1F5] dark:border-[#2D264E]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                Wallet & Credits
              </span>
              <h2 className="text-xl font-bold text-[#18181B] dark:text-white mt-0.5">Credit Summary</h2>
            </div>
            <Link
              href="/credits"
              className="px-4 py-2 rounded-xl bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] hover:bg-[#DDD6FE] text-xs font-semibold transition-colors flex items-center gap-1.5 w-fit"
            >
              <span>Manage Credits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-5 rounded-2xl bg-[#EDE9FE]/50 dark:bg-[#231C3D]/50 border border-[#DDD6FE] dark:border-[#3B2D66]">
              <span className="text-xs text-[#7C3AED] dark:text-[#A78BFA] font-semibold uppercase tracking-wider">
                Current Credits
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#7C3AED] dark:text-[#A78BFA] font-mono mt-1">
                🪙 {credits}
              </p>
              <p className="text-[11px] text-[#71717A] dark:text-zinc-400 mt-1">Available for swap escrow or bookings</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E]">
              <span className="text-xs text-[#71717A] dark:text-zinc-400 font-semibold uppercase tracking-wider">
                Credits Earned
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                +{creditsEarned}
              </p>
              <p className="text-[11px] text-[#71717A] dark:text-zinc-400 mt-1">Earned by sharing your skills</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E]">
              <span className="text-xs text-[#71717A] dark:text-zinc-400 font-semibold uppercase tracking-wider">
                Credits Spent
              </span>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#18181B] dark:text-zinc-200 font-mono mt-1">
                -{creditsSpent}
              </p>
              <p className="text-[11px] text-[#71717A] dark:text-zinc-400 mt-1">Invested in your learning journey</p>
            </div>
          </div>
        </div>

        {/* RECOMMENDED FOR YOU */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                Personalized
              </span>
              <h2 className="text-xl font-bold text-[#18181B] dark:text-white">Recommended for You</h2>
            </div>
            <Link
              href="/discover"
              className="text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedSkills.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] hover:border-[#A78BFA] shadow-sm flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={item.teacher.avatar}
                      alt={item.teacher.name}
                      className="w-11 h-11 rounded-full object-cover border border-[#E4E1F5] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/profile/${item.teacher.id}`}
                        className="text-sm font-bold text-[#18181B] dark:text-white truncate block hover:text-[#7C3AED]"
                      >
                        {item.teacher.name}
                      </Link>
                      <p className="text-[11px] text-[#71717A] dark:text-zinc-400 truncate">{item.teacher.role}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#18181B] dark:text-white line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs mb-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-[11px] font-semibold">
                      {item.level}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-semibold text-xs ml-auto">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                    🪙 {item.creditsPerSession} cr
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenSwap({
                        id: item.teacher.id,
                        name: item.teacher.name,
                        avatar: item.teacher.avatar,
                        skill: item.title,
                      })
                    }
                    className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Swap</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TWO-COLUMN GRID: YOUR LEARNING & YOUR TEACHING */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* YOUR LEARNING */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
                <h2 className="text-base font-bold text-[#18181B] dark:text-white">Your Learning</h2>
              </div>
              <Link href="/learn" className="text-xs font-semibold text-[#7C3AED] hover:underline">
                View all →
              </Link>
            </div>

            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={session.teacherAvatar}
                        alt={session.teacherName}
                        className="w-10 h-10 rounded-full object-cover border border-[#E4E1F5]"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#18181B] dark:text-white">{session.skillTitle}</h4>
                        <p className="text-[11px] text-[#71717A] mt-0.5">
                          {session.teacherName} • {session.date}, {session.time}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={session.roomUrl || "/learn"}
                      className="px-3 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shrink-0"
                    >
                      Join Room
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#71717A]">
                <p>No active learning connections yet.</p>
                <Link href="/discover" className="text-[#7C3AED] font-semibold hover:underline mt-1 block">
                  Find a skill to swap →
                </Link>
              </div>
            )}
          </div>

          {/* YOUR TEACHING */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
                <h2 className="text-base font-bold text-[#18181B] dark:text-white">Your Teaching</h2>
              </div>
              <Link href="/skills" className="text-xs font-semibold text-[#7C3AED] hover:underline">
                Edit skills →
              </Link>
            </div>

            {userTaughtSkillsList.length > 0 ? (
              <div className="space-y-2.5">
                {userTaughtSkillsList.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3.5 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#18181B] dark:text-white">{skill.name}</h4>
                      <span className="text-[11px] text-[#71717A]">{skill.level} • 10 Credits / session</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      Offering
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-[#71717A]">
                <p>You haven&apos;t added any teaching skills yet.</p>
                <Link href="/skills" className="text-[#7C3AED] font-semibold hover:underline mt-1 block">
                  Add what you can teach →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <SwapRequestModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        targetUser={selectedTargetUser}
      />

      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </div>
  );
}