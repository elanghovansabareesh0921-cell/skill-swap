"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Search,
  Code2,
  Palette,
  BrainCircuit,
  Terminal,
  Video,
  Camera,
  TrendingUp,
  Mic,
  Globe,
  Compass,
  CheckCircle2,
  Coins,
  Repeat,
  Users,
} from "lucide-react";

export default function HomePage() {
  const { credits } = useSkillSwap();
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);

  const popularSkills = [
    {
      name: "Python",
      category: "Programming",
      teachersCount: 24,
      icon: Code2,
      color: "from-violet-500 to-purple-600",
    },
    {
      name: "UI/UX Design",
      category: "Design",
      teachersCount: 19,
      icon: Palette,
      color: "from-purple-500 to-indigo-600",
    },
    {
      name: "Machine Learning",
      category: "AI & ML",
      teachersCount: 15,
      icon: BrainCircuit,
      color: "from-indigo-500 to-purple-600",
    },
    {
      name: "C++",
      category: "Programming",
      teachersCount: 12,
      icon: Terminal,
      color: "from-violet-600 to-purple-700",
    },
    {
      name: "Video Editing",
      category: "Media & Video",
      teachersCount: 18,
      icon: Video,
      color: "from-purple-600 to-violet-500",
    },
    {
      name: "Photography",
      category: "Creative Arts",
      teachersCount: 14,
      icon: Camera,
      color: "from-violet-500 to-indigo-500",
    },
    {
      name: "Digital Marketing",
      category: "Business",
      teachersCount: 16,
      icon: TrendingUp,
      color: "from-purple-500 to-violet-600",
    },
    {
      name: "Public Speaking",
      category: "Communication",
      teachersCount: 20,
      icon: Mic,
      color: "from-violet-600 to-purple-600",
    },
    {
      name: "Web Development",
      category: "Programming",
      teachersCount: 32,
      icon: Globe,
      color: "from-purple-600 to-indigo-600",
    },
    {
      name: "AutoCAD",
      category: "Engineering & CAD",
      teachersCount: 11,
      icon: Compass,
      color: "from-indigo-600 to-violet-600",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#EDE9FE] dark:bg-[#231C3D]/60 rounded-full blur-3xl opacity-70 pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#7C3AED] animate-pulse" />
            <span>Fair Peer-to-Peer Knowledge Economy</span>
            <span className="text-[#E4E1F5] dark:text-[#2D264E]">|</span>
            <span className="font-mono text-[#71717A] dark:text-zinc-400">🪙 1 Hour = 10 Credits</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#18181B] dark:text-white tracking-tight leading-[1.08]">
            Learn. Teach. <br />
            <span className="text-[#7C3AED] dark:text-[#A78BFA]">Swap Skills.</span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto mt-6 text-base sm:text-lg text-[#71717A] dark:text-zinc-300 leading-relaxed font-normal">
            Connect with people who can teach what you want to learn — while sharing what you already know.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/discover"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white dark:bg-[#161327] hover:bg-[#EDE9FE]/50 dark:hover:bg-[#231C3D] border border-[#E4E1F5] dark:border-[#2D264E] text-[#18181B] dark:text-zinc-200 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Explore Skills</span>
            </Link>
          </div>

          {/* Tasteful Visual of Reciprocal Skill Swap */}
          <div className="mt-14 max-w-3xl mx-auto p-6 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* User A */}
              <div className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#231C3D]/50 border border-[#EDE9FE] dark:border-[#2D264E] flex items-center gap-3.5 text-left">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="Alex"
                  className="w-12 h-12 rounded-full object-cover border border-[#E4E1F5]"
                />
                <div>
                  <p className="text-sm font-bold text-[#18181B] dark:text-white">Alex</p>
                  <p className="text-xs text-[#7C3AED] dark:text-[#A78BFA] font-medium">Teaches Python</p>
                  <p className="text-[11px] text-[#71717A] dark:text-zinc-400">Wants UI/UX Design</p>
                </div>
              </div>

              {/* Swap Bridge */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="w-10 h-10 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA] shadow-inner mb-1">
                  <Repeat className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-[#7C3AED] dark:text-[#A78BFA] uppercase tracking-wider">
                  Direct Swap
                </span>
                <span className="text-[10px] text-[#71717A]">or 10 Credits Escrow</span>
              </div>

              {/* User B */}
              <div className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#231C3D]/50 border border-[#EDE9FE] dark:border-[#2D264E] flex items-center gap-3.5 text-left">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80"
                  alt="Elena"
                  className="w-12 h-12 rounded-full object-cover border border-[#E4E1F5]"
                />
                <div>
                  <p className="text-sm font-bold text-[#18181B] dark:text-white">Elena</p>
                  <p className="text-xs text-[#7C3AED] dark:text-[#A78BFA] font-medium">Teaches UI/UX Design</p>
                  <p className="text-[11px] text-[#71717A] dark:text-zinc-400">Wants Python</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 bg-white dark:bg-[#120F24] border-y border-[#E4E1F5] dark:border-[#2D264E]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white mt-1">
              Three steps to unlock unlimited learning
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 01 */}
            <div className="p-6 rounded-2xl bg-[#F8F7FF] dark:bg-[#161327] border border-[#EDE9FE] dark:border-[#2D264E] flex flex-col justify-between hover:border-[#A78BFA] transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-[#7C3AED] dark:text-[#A78BFA] bg-[#EDE9FE] dark:bg-[#231C3D] px-2.5 py-1 rounded-md">
                  01 — Discover
                </span>
                <h3 className="text-lg font-bold text-[#18181B] dark:text-white mt-4">
                  Discover Skills
                </h3>
                <p className="text-sm text-[#71717A] dark:text-zinc-300 mt-2 leading-relaxed">
                  Find people who teach the skills you want to learn across programming, design, languages, and more.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div className="p-6 rounded-2xl bg-[#F8F7FF] dark:bg-[#161327] border border-[#EDE9FE] dark:border-[#2D264E] flex flex-col justify-between hover:border-[#A78BFA] transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-[#7C3AED] dark:text-[#A78BFA] bg-[#EDE9FE] dark:bg-[#231C3D] px-2.5 py-1 rounded-md">
                  02 — Connect
                </span>
                <h3 className="text-lg font-bold text-[#18181B] dark:text-white mt-4">
                  Connect & Propose
                </h3>
                <p className="text-sm text-[#71717A] dark:text-zinc-300 mt-2 leading-relaxed">
                  Send a skill-swap request and connect with your learning partner. Propose what you can teach in return or use credits.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div className="p-6 rounded-2xl bg-[#F8F7FF] dark:bg-[#161327] border border-[#EDE9FE] dark:border-[#2D264E] flex flex-col justify-between hover:border-[#A78BFA] transition-all">
              <div>
                <span className="text-xs font-mono font-bold text-[#7C3AED] dark:text-[#A78BFA] bg-[#EDE9FE] dark:bg-[#231C3D] px-2.5 py-1 rounded-md">
                  03 — Grow
                </span>
                <h3 className="text-lg font-bold text-[#18181B] dark:text-white mt-4">
                  Grow Together
                </h3>
                <p className="text-sm text-[#71717A] dark:text-zinc-300 mt-2 leading-relaxed">
                  Learn something new while sharing your own knowledge in live 1-on-1 sessions. Gain mastery and build real relationships.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SKILLS */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                Marketplace
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white mt-1">
                Popular Skills to Swap
              </h2>
              <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
                Explore popular topics taught by verified practitioners across the network.
              </p>
            </div>
            <Link
              href="/discover"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] hover:underline"
            >
              <span>View all skills</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularSkills.map((skill) => {
              const IconComp = skill.icon;
              return (
                <Link
                  key={skill.name}
                  href={`/discover?search=${encodeURIComponent(skill.name)}`}
                  className="p-4 rounded-2xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] hover:border-[#A78BFA] dark:hover:border-[#8B5CF6] hover:shadow-md transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] dark:bg-[#231C3D] flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA] mb-3 group-hover:scale-105 transition-transform">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-[#18181B] dark:text-white group-hover:text-[#7C3AED] dark:group-hover:text-[#A78BFA] transition-colors">
                      {skill.name}
                    </h4>
                    <p className="text-[11px] text-[#71717A] dark:text-zinc-400 mt-0.5">
                      {skill.category}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-[#71717A] dark:text-zinc-400">
                    <span>{skill.teachersCount} teaching</span>
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-[#7C3AED]" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CREDIT SYSTEM SECTION */}
      <section className="py-16 bg-white dark:bg-[#120F24] border-y border-[#E4E1F5] dark:border-[#2D264E]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#EDE9FE]/70 via-white to-[#EDE9FE]/40 dark:from-[#231C3D]/80 dark:via-[#161327] dark:to-[#231C3D]/50 border border-[#DDD6FE] dark:border-[#3B2D66] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-[#161327] text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] border border-[#DDD6FE] dark:border-[#3B2D66] mb-4">
                <Coins className="w-3.5 h-3.5" />
                <span>Fair Credit Economy</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
                Learn even when you have nothing to swap.
              </h2>
              <p className="text-sm sm:text-base text-[#71717A] dark:text-zinc-300 mt-3 leading-relaxed">
                Use credits to learn from other members. You can earn credits through teaching or purchase credits when you need more.
              </p>
              <div className="mt-6">
                <Link
                  href="/credits"
                  className="px-6 py-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs sm:text-sm transition-all shadow-md inline-flex items-center gap-2"
                >
                  <span>Explore Credits</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Credit Economy Explainer Card */}
            <div className="w-full md:w-72 p-5 rounded-2xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-semibold text-[#71717A]">Base Rate</span>
                <span className="text-xs font-bold font-mono text-[#7C3AED] dark:text-[#A78BFA]">10 Credits / Hr</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#71717A] dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Earn 10 credits every time you teach</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#71717A] dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Spend credits to book any mentor</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-[#71717A] dark:text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Escrow protected until session completes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#18181B] dark:text-white tracking-tight leading-tight">
            Your next skill could come from someone you haven&apos;t met yet.
          </h2>
          <p className="text-sm sm:text-base text-[#71717A] dark:text-zinc-300 mt-4 max-w-xl mx-auto">
            Join thousands of curious learners and passionate teachers trading skills on Skill Swap.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
              className="px-9 py-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm sm:text-base transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2 group"
            >
              <span>Join Skill Swap</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto py-8 bg-white dark:bg-[#120F24] border-t border-[#E4E1F5] dark:border-[#2D264E] text-center text-xs text-[#71717A]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="font-bold text-[#18181B] dark:text-white">Skill Swap</span>
            <span>— Peer-to-Peer Knowledge Exchange</span>
          </div>
          <p>© 2026 Skill Swap. Built with Next.js, Supabase, and Gemini AI.</p>
        </div>
      </footer>

      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </div>
  );
}