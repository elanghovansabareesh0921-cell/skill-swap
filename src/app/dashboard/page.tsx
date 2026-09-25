"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SwapRequestModal from "@/components/SwapRequestModal";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  PlusCircle,
  Search,
  Repeat,
  Star,
  BookOpen,
  GraduationCap,
  ArrowRight,
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
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-white cyber-grid transition-colors duration-200">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Header Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-black uppercase text-white tracking-tight">
              Good morning, {currentUser.name} 👋
            </h1>
            <p className="text-sm text-zinc-400 mt-1 font-medium">
              What would you like to learn today?
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/discover"
              className="px-4 py-2.5 border-2 border-black bg-[#181B22] hover:bg-[#1F2430] text-white text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              Explore Skills
            </Link>
            <Link
              href="/skills"
              className="px-4 py-2.5 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Manage My Skills</span>
            </Link>
          </div>
        </div>

        {/* Large Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a skill (e.g. Python, UI/UX Design, Machine Learning)..."
            className="w-full pl-12 pr-28 py-3.5 border-2 border-black bg-[#12141C] text-sm text-white placeholder-zinc-500 font-medium shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:border-[#FFE600] focus:shadow-[4px_4px_0px_0px_#FFE600] transition-all"
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* CREDIT SUMMARY */}
        <div className="p-6 sm:p-8 border-2 border-black bg-[#181B22] shadow-[6px_6px_0px_0px_#FFE600]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b-2 border-black">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#FFE600]">
                Wallet & Credits
              </span>
              <h2 className="text-xl font-black uppercase text-white mt-0.5">Credit Summary</h2>
            </div>
            <Link
              href="/credits"
              className="px-4 py-2 border-2 border-black bg-[#12141C] text-[#FFE600] hover:bg-[#FFE600] hover:text-black text-xs font-black uppercase transition-colors flex items-center gap-1.5 w-fit shadow-[2px_2px_0px_0px_#000000]"
            >
              <span>Manage Credits</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-5 border-2 border-black bg-[#12141C] shadow-[3px_3px_0px_0px_#FFE600]">
              <span className="text-xs text-[#FFE600] font-black uppercase tracking-wider">
                Current Credits
              </span>
              <p className="text-3xl sm:text-4xl font-black text-[#FFE600] font-mono mt-1">
                🪙 {credits}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">Available for swap escrow or bookings</p>
            </div>

            <div className="p-5 border-2 border-black bg-[#12141C] shadow-[3px_3px_0px_0px_#A3E635]">
              <span className="text-xs text-[#A3E635] font-black uppercase tracking-wider">
                Credits Earned
              </span>
              <p className="text-3xl sm:text-4xl font-black text-[#A3E635] font-mono mt-1">
                +{creditsEarned}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">Earned by sharing your skills</p>
            </div>

            <div className="p-5 border-2 border-black bg-[#12141C] shadow-[3px_3px_0px_0px_#FF5E7E]">
              <span className="text-xs text-[#FF5E7E] font-black uppercase tracking-wider">
                Credits Spent
              </span>
              <p className="text-3xl sm:text-4xl font-black text-[#FF5E7E] font-mono mt-1">
                -{creditsSpent}
              </p>
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">Invested in your learning journey</p>
            </div>
          </div>
        </div>

        {/* RECOMMENDED FOR YOU */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#38BDF8]">
                Personalized
              </span>
              <h2 className="text-xl font-black uppercase text-white">Recommended for You</h2>
            </div>
            <Link
              href="/discover"
              className="text-xs font-black uppercase text-[#FFE600] hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedSkills.map((item) => (
              <div
                key={item.id}
                className="p-5 border-2 border-black bg-[#181B22] shadow-[4px_4px_0px_0px_#000000] hover:shadow-[4px_4px_0px_0px_#FFE600] hover:-translate-x-0.5 hover:-translate-y-0.5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={item.teacher.avatar}
                      alt={item.teacher.name}
                      className="w-11 h-11 object-cover border-2 border-black shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/profile/${item.teacher.id}`}
                        className="text-sm font-black uppercase text-white truncate block hover:text-[#FFE600]"
                      >
                        {item.teacher.name}
                      </Link>
                      <p className="text-[11px] text-zinc-400 font-mono truncate">{item.teacher.role}</p>
                    </div>
                  </div>

                  <h3 className="text-sm font-black uppercase text-white line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed mb-3 font-medium">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs mb-4">
                    <span className="px-2 py-0.5 border border-black bg-[#12141C] text-[#FFE600] text-[10px] font-black uppercase">
                      {item.level}
                    </span>
                    <div className="flex items-center gap-1 font-mono font-black text-xs ml-auto text-[#FFE600]">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-black flex items-center justify-between">
                  <span className="font-mono text-xs font-black text-[#FFE600]">
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
                    className="px-3.5 py-1.5 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Repeat className="w-3.5 h-3.5 stroke-[2.5]" />
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
          <div className="p-6 border-2 border-black bg-[#181B22] shadow-[6px_6px_0px_0px_#38BDF8] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#38BDF8] stroke-[2.5]" />
                <h2 className="text-base font-black uppercase text-white">Your Learning</h2>
              </div>
              <Link href="/learn" className="text-xs font-black uppercase text-[#38BDF8] hover:underline">
                View all →
              </Link>
            </div>

            {upcomingSessions.length > 0 ? (
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 border-2 border-black bg-[#12141C] flex items-center justify-between gap-3 shadow-[2px_2px_0px_0px_#000000]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={session.teacherAvatar}
                        alt={session.teacherName}
                        className="w-10 h-10 object-cover border border-black"
                      />
                      <div>
                        <h4 className="text-xs font-black uppercase text-white">{session.skillTitle}</h4>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {session.teacherName} • {session.date}, {session.time}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={session.roomUrl || "/learn"}
                      className="px-3 py-1.5 border-2 border-black bg-[#38BDF8] text-black text-xs font-black uppercase shrink-0 shadow-[2px_2px_0px_0px_#000000]"
                    >
                      Join Room
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-zinc-400 font-mono">
                <p>No active learning connections yet.</p>
                <Link href="/discover" className="text-[#38BDF8] font-bold uppercase hover:underline mt-1 block">
                  Find a skill to swap →
                </Link>
              </div>
            )}
          </div>

          {/* YOUR TEACHING */}
          <div className="p-6 border-2 border-black bg-[#181B22] shadow-[6px_6px_0px_0px_#A3E635] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#A3E635] stroke-[2.5]" />
                <h2 className="text-base font-black uppercase text-white">Your Teaching</h2>
              </div>
              <Link href="/skills" className="text-xs font-black uppercase text-[#A3E635] hover:underline">
                Edit skills →
              </Link>
            </div>

            {userTaughtSkillsList.length > 0 ? (
              <div className="space-y-2.5">
                {userTaughtSkillsList.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3.5 border-2 border-black bg-[#12141C] flex items-center justify-between shadow-[2px_2px_0px_0px_#000000]"
                  >
                    <div>
                      <h4 className="text-xs font-black uppercase text-white">{skill.name}</h4>
                      <span className="text-[11px] text-zinc-400 font-mono">{skill.level} • 10 Credits / session</span>
                    </div>
                    <span className="px-2 py-0.5 border border-black bg-[#A3E635] text-black text-[10px] font-black uppercase">
                      Offering
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-zinc-400 font-mono">
                <p>You haven&apos;t added any teaching skills yet.</p>
                <Link href="/skills" className="text-[#A3E635] font-bold uppercase hover:underline mt-1 block">
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