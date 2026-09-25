"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SwapRequestModal from "@/components/SwapRequestModal";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap } from "@/context/SkillSwapContext";
import CoinIcon from "@/components/common/CoinIcon";
import { motion } from "framer-motion";
import {
  Sparkles,
  Calendar,
  ArrowRight,
  BookOpen,
  PlusCircle,
  GraduationCap,
  Search,
  Repeat2,
  Star,
  TrendingUp,
  Zap,
  ChevronRight,
  Play,
  Clock,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

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
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    skillToTeach: "Python Programming & Data Structures",
  });

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const recommendedSkills = skills.slice(0, 4);

  const creditsEarned = transactions
    .filter((t) => t.type === "EARNED")
    .reduce((acc, t) => acc + t.amount, 0);
  const creditsSpent = transactions
    .filter((t) => t.type === "SPENT")
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      searchQuery.trim()
        ? `/discover?search=${encodeURIComponent(searchQuery.trim())}`
        : "/discover"
    );
  };

  const handleOpenSwap = (mentor: {
    id: string;
    name: string;
    avatar?: string;
    skill: string;
  }) => {
    setSelectedTargetUser({
      id: mentor.id,
      name: mentor.name,
      avatar: mentor.avatar,
      skillToTeach: mentor.skill,
    });
    setSwapModalOpen(true);
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col min-h-dvh ambient-bg pb-20 lg:pb-0">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── GREETING HEADER ── */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"
        >
          <div>
            <p className="text-sm font-medium text-white/40 mb-1">
              {greeting},
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-none">
              {currentUser?.name?.split(" ")[0] ?? "Friend"}{" "}
              <span className="text-gradient">👋</span>
            </h1>
            <p className="text-sm text-white/45 mt-2">
              Your learning network is active. Let's keep the momentum going.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/discover"
              className="glass px-4 py-2 rounded-xl text-sm font-medium text-white/70 hover:text-white transition-all duration-150 hover:bg-white/8 flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              Explore
            </Link>
            <Link
              href="/skills"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                boxShadow: "0 4px 14px rgba(124,108,246,0.3)",
              }}
            >
              <PlusCircle className="w-4 h-4" />
              Manage Skills
            </Link>
          </div>
        </motion.div>

        {/* ── SEARCH BAR ── */}
        <motion.form
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          onSubmit={handleSearch}
          className="relative group"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-brand-accent transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a skill, topic or person..."
            className="w-full pl-12 pr-32 py-4 rounded-2xl text-sm text-white placeholder:text-white/30 bg-white/4 border border-white/8 focus:outline-none focus:border-brand-accent/50 focus:bg-white/6 focus:ring-1 focus:ring-brand-accent/30 transition-all duration-200"
            style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
            }}
          >
            Search
          </button>
        </motion.form>

        {/* ── STAT CARDS ── */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {[
            {
              label: "Available Credits",
              value: credits,
              sub: "1 Hour = 10 Credits",
              icon: <CoinIcon size={20} />,
              accent: "#f5a524",
              href: "/credits",
              onClick: () => setIsBuyCreditsOpen(true),
            },
            {
              label: "Credits Earned",
              value: `+${creditsEarned}`,
              sub: "From teaching sessions",
              icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
              accent: "#10B981",
              href: null,
            },
            {
              label: "Sessions",
              value: upcomingSessions.length,
              sub: "Upcoming sessions",
              icon: <Calendar className="w-5 h-5 text-brand-accent" />,
              accent: "#7C6CF6",
              href: "/learn",
            },
            {
              label: "Swap Requests",
              value: swapRequests?.length ?? 0,
              sub: "Pending review",
              icon: <Repeat2 className="w-5 h-5 text-brand-accent-light" />,
              accent: "#06B6D4",
              href: "/matches",
            },
          ].map((stat, i) => (
            <button
              key={stat.label}
              onClick={
                stat.onClick
                  ? stat.onClick
                  : stat.href
                  ? () => router.push(stat.href as string)
                  : undefined
              }
              className="glass rounded-2xl p-5 text-left transition-all duration-200 hover:bg-white/[0.07] hover:border-white/[0.14] group focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/5">{stat.icon}</div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
              </div>
              <p
                className="text-2xl font-extrabold font-mono leading-none"
                style={{ color: stat.accent }}
              >
                {stat.value}
              </p>
              <p className="text-xs font-semibold text-white/70 mt-1">
                {stat.label}
              </p>
              <p className="text-[11px] text-white/35 mt-0.5">{stat.sub}</p>
            </button>
          ))}
        </motion.div>

        {/* ── UPCOMING SESSIONS + QUICK ACTIONS ROW ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Sessions */}
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="lg:col-span-2 glass rounded-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-brand-accent" />
                <h2 className="text-base font-bold text-white">Upcoming Sessions</h2>
                {upcomingSessions.length > 0 && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{
                      background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                    }}
                  >
                    {upcomingSessions.length}
                  </span>
                )}
              </div>
              <Link
                href="/learn"
                className="text-xs font-semibold text-brand-accent hover:text-[#9b8ef8] transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-white/5">
              {upcomingSessions.length > 0 ? (
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-white/3 transition-colors group"
                  >
                    <div className="relative shrink-0">
                      <img
                        src={session.teacherAvatar}
                        alt={session.teacherName}
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-white/10"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#08090D]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white/90 truncate">
                        {session.skillTitle}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/45">{session.teacherName}</span>
                        <span className="text-white/20">·</span>
                        <Clock className="w-3 h-3 text-white/30" />
                        <span className="text-xs text-white/45">
                          {session.date}, {session.time}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={session.roomUrl || "/learn"}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white shrink-0 transition-all hover:opacity-90"
                      style={{
                        background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                      }}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Join
                    </Link>
                  </div>
                ))
              ) : (
                <div className="px-6 py-12 text-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ background: "rgba(124,108,246,0.1)" }}
                  >
                    <Calendar className="w-6 h-6 text-brand-accent" />
                  </div>
                  <p className="text-sm font-semibold text-white/60">
                    No sessions scheduled
                  </p>
                  <p className="text-xs text-white/35 mt-1 max-w-xs mx-auto">
                    Find a skill to swap and schedule your first session
                  </p>
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-brand-accent hover:text-[#9b8ef8] transition-colors"
                  >
                    Browse skills <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="glass rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-brand-gold" />
                <h2 className="text-base font-bold text-white">Quick Actions</h2>
              </div>
            </div>
            <div className="p-4 space-y-2">
              {[
                {
                  icon: <Search className="w-4 h-4" />,
                  label: "Find someone to learn from",
                  sub: "Browse 100+ skills",
                  href: "/discover",
                  color: "#7C6CF6",
                },
                {
                  icon: <Sparkles className="w-4 h-4" />,
                  label: "View AI match suggestions",
                  sub: "Personalized for you",
                  href: "/matches",
                  color: "#06B6D4",
                },
                {
                  icon: <BookOpen className="w-4 h-4" />,
                  label: "Add a skill you can teach",
                  sub: "Share your expertise",
                  href: "/skills",
                  color: "#10B981",
                },
                {
                  icon: <CoinIcon size={16} />,
                  label: "Top up credits",
                  sub: `You have ${credits} credits`,
                  href: "/credits",
                  color: "#f5a524",
                  onClick: () => setIsBuyCreditsOpen(true),
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={
                    action.onClick
                      ? action.onClick
                      : () => router.push(action.href)
                  }
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all duration-150 group text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent/50"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: `${action.color}18`, color: action.color }}
                  >
                    {action.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white/80 group-hover:text-white transition-colors leading-none truncate">
                      {action.label}
                    </p>
                    <p className="text-xs text-white/35 mt-0.5">{action.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 shrink-0 transition-colors" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── RECOMMENDED SKILLS ── */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-brand-accent uppercase tracking-widest mb-1">
                AI Personalized
              </p>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Recommended for You
              </h2>
            </div>
            <Link
              href="/discover"
              className="text-sm font-semibold text-brand-accent hover:text-[#9b8ef8] transition-colors flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedSkills.map((item, i) => (
              <motion.div
                key={item.id}
                custom={5 + i * 0.5}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="glass rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200 hover:bg-white/7 hover:border-white/14 hover:-translate-y-0.5 group"
              >
                {/* Teacher */}
                <div className="flex items-center gap-3">
                  <img
                    src={item.teacher.avatar}
                    alt={item.teacher.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-white/10 shrink-0"
                  />
                  <div className="min-w-0">
                    <Link
                      href={`/profile/${item.teacher.id}`}
                      className="text-sm font-semibold text-white/90 hover:text-brand-accent transition-colors truncate block"
                    >
                      {item.teacher.name}
                    </Link>
                    <p className="text-xs text-white/40 truncate">{item.teacher.role}</p>
                  </div>
                </div>

                {/* Skill info */}
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/45 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="px-2 py-0.5 rounded-lg text-[11px] font-semibold"
                    style={{
                      background: "rgba(124,108,246,0.12)",
                      color: "#9b8ef8",
                    }}
                  >
                    {item.level}
                  </span>
                  <div className="flex items-center gap-1 text-amber-400 font-semibold ml-auto">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {item.rating}
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="flex items-center justify-between pt-3 border-t"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-1">
                    <CoinIcon size={14} />
                    <span className="text-xs font-bold text-brand-gold font-mono">
                      {item.creditsPerSession} cr
                    </span>
                  </div>
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
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                    style={{
                      background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                    }}
                  >
                    <Repeat2 className="w-3.5 h-3.5" />
                    Swap
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── YOUR SKILLS GRID ── */}
        <motion.div
          custom={6}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Learning */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-brand-accent" />
                <h2 className="text-base font-bold text-white">Your Learning</h2>
              </div>
              <Link
                href="/learn"
                className="text-xs font-semibold text-brand-accent hover:text-[#9b8ef8] transition-colors flex items-center gap-1"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {userLearningSkillsList.length > 0 ? (
                userLearningSkillsList.slice(0, 4).map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-white/3 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, rgba(124,108,246,0.25), rgba(6,182,212,0.15))",
                      }}
                    >
                      {skill.name?.charAt(0) ?? "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/85 truncate">
                        {skill.name}
                      </p>
                      <p className="text-xs text-white/40">{skill.level}</p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: "rgba(124,108,246,0.12)",
                        color: "#9b8ef8",
                      }}
                    >
                      Learning
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-white/45">No learning goals added yet.</p>
                  <Link
                    href="/discover"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-brand-accent hover:text-[#9b8ef8] transition-colors"
                  >
                    Browse skills <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Teaching */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-brand-accent-light" />
                <h2 className="text-base font-bold text-white">Your Teaching</h2>
              </div>
              <Link
                href="/skills"
                className="text-xs font-semibold text-brand-accent hover:text-[#9b8ef8] transition-colors flex items-center gap-1"
              >
                Edit skills <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-white/5">
              {userTaughtSkillsList.length > 0 ? (
                userTaughtSkillsList.slice(0, 4).map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-3 px-6 py-3.5 hover:bg-white/3 transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, rgba(6,182,212,0.25), rgba(16,185,129,0.15))",
                      }}
                    >
                      {skill.name?.charAt(0) ?? "S"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/85 truncate">
                        {skill.name}
                      </p>
                      <p className="text-xs text-white/40">
                        {skill.level} · 10 Credits / session
                      </p>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: "rgba(16,185,129,0.12)",
                        color: "#34d399",
                      }}
                    >
                      Offering
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-white/45">No teaching skills added yet.</p>
                  <Link
                    href="/skills"
                    className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-brand-accent hover:text-[#9b8ef8] transition-colors"
                  >
                    Add skills <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals — preserved exactly */}
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