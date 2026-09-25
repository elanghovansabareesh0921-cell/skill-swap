"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ActivityCard from "@/components/gamification/ActivityCard";
import CoinIcon from "@/components/common/CoinIcon";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  ArrowRight,
  Sparkles,
  Repeat,
  ShieldCheck,
  Star,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoadingAuth } = useSkillSwap();

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0C10]">
        <div className="w-10 h-10 border-4 border-black border-t-[#FFE600] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const featuredMentors = [
    {
      id: "arun-kumar",
      name: "Arun Kumar",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      rating: "4.9",
      teaches: "Python & Machine Learning",
      wants: "React & Next.js",
      verified: true,
      sessionsCompleted: 18,
    },
    {
      id: "elena-rostova",
      name: "Elena Rostova",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
      rating: "5.0",
      teaches: "UI/UX Design Systems in Figma",
      wants: "TypeScript & Web Architecture",
      verified: true,
      sessionsCompleted: 24,
    },
    {
      id: "sophia-rivera",
      name: "Sophia Rivera",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      rating: "4.8",
      teaches: "Conversational Spanish",
      wants: "Web Development",
      verified: false,
      sessionsCompleted: 9,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-white cyber-grid transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-16">
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-6 sm:pt-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-black bg-[#181B22] text-xs font-black uppercase text-[#FFE600] shadow-[3px_3px_0px_0px_#FFE600]">
            <CoinIcon size={14} />
            <span>Global Skill Exchange · 1 Hour = 10 Credits</span>
          </div>

          {/* Big Bold Headline in Uppercase / Chunky weight */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-[1.08]">
            Learn anything. <br />
            <span className="text-[#FFE600] bg-black px-2 py-0.5 border-2 border-[#FFE600] inline-block mt-1">
              Teach what you love.
            </span>
          </h1>

          {/* Subhead */}
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl mx-auto font-medium">
            A platform where people exchange skills instead of money. Real-time matching, no fees, no gatekeeping — just people teaching people.
          </p>

          {/* Two CTAs (Tactile Neo-Brutalist Buttons) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              href="/discover"
              className="w-full sm:w-auto px-8 py-3.5 border-2 border-black bg-[#FFE600] text-black font-black uppercase text-sm shadow-[4px_4px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-center tracking-wider"
            >
              Get started
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-7 py-3.5 border-2 border-black bg-[#181B22] hover:bg-[#1F2430] text-white font-black uppercase text-sm shadow-[4px_4px_0px_0px_#38BDF8] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-center tracking-wider"
            >
              Explore features
            </a>
          </div>
        </section>

        {/* BELOW THE FOLD: COMPACT ACTIVITY CARD */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 border border-black bg-[#FFE600]" />
              <h2 className="text-xs font-black uppercase tracking-widest text-zinc-300">
                Your Skill Exchange Activity
              </h2>
            </div>
            <Link
              href="/credits"
              className="text-xs font-black uppercase text-[#FFE600] hover:underline flex items-center gap-1.5"
            >
              <span>View wallet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <ActivityCard
            currentLevel="Connector"
            learningHours={14}
            teachingHours={18}
            badges={{
              goodStart: true,
              firstSwap: true,
              streak7Days: false,
            }}
          />
        </section>

        {/* SECTION: TWO SESSION TYPES VISUALLY DISTINGUISHED */}
        <section id="features" className="space-y-6 pt-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-[#38BDF8]">
              Two Flexible Ways to Trade
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
              How skill exchange works
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Trade directly peer-to-peer or spend earned credits with full escrow protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model A: Direct Swap */}
            <div className="border-2 border-black bg-[#181B22] p-7 space-y-4 shadow-[6px_6px_0px_0px_#38BDF8] transition-all">
              <div className="w-12 h-12 border-2 border-black bg-[#38BDF8] text-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                <Repeat className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#38BDF8]">
                  Mutual Exchange
                </span>
                <h3 className="text-xl font-black uppercase text-white mt-1">
                  Direct swap
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Two people teach each other. You teach what you know for an hour, and they teach you their craft in return. No credits move.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-black uppercase text-[#38BDF8]">
                <span className="w-2 h-2 border border-black bg-[#38BDF8]" />
                <span>Zero credits required · Pure peer exchange</span>
              </div>
            </div>

            {/* Model B: Credit Escrow */}
            <div className="border-2 border-black bg-[#181B22] p-7 space-y-4 shadow-[6px_6px_0px_0px_#FFE600] transition-all">
              <div className="w-12 h-12 border-2 border-black bg-[#FFE600] text-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000]">
                <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#FFE600]">
                  Escrow Protected
                </span>
                <h3 className="text-xl font-black uppercase text-white mt-1">
                  Credit escrow
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                A learner spends 10 credits to book 1 hour. Credits are locked in escrow until the session is marked complete, then released to the teacher.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-black uppercase text-[#FFE600]">
                <span className="w-2 h-2 border border-black bg-[#FFE600]" />
                <span>1 Hour = 10 Credits · Released upon completion</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: FEATURED MENTORS PREVIEW */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                Featured skill traders
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                Connect with community members ready for direct swaps or credit sessions.
              </p>
            </div>
            <Link
              href="/discover"
              className="text-xs font-black uppercase text-[#FFE600] hover:underline flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Explore all peers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="border-2 border-black bg-[#181B22] p-6 space-y-4 shadow-[5px_5px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#FFE600] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="w-12 h-12 object-cover border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-black uppercase text-white truncate">
                          {mentor.name}
                        </span>
                        {mentor.verified && <VerifiedBadge size="sm" showLabel={false} />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Star className="w-3.5 h-3.5 text-[#FFE600] fill-current" />
                        <span className="font-mono font-black text-white">{mentor.rating}</span>
                        <span className="font-mono">· {mentor.sessionsCompleted} sessions</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Rows */}
                  <div className="p-3 border-2 border-black bg-[#12141C] space-y-1.5 text-xs font-mono">
                    <div>
                      <span className="text-zinc-400 uppercase font-sans font-bold">Teaches: </span>
                      <strong className="text-white font-black">{mentor.teaches}</strong>
                    </div>
                    <div>
                      <span className="text-zinc-400 uppercase font-sans font-bold">Wants: </span>
                      <strong className="text-[#38BDF8] font-black">{mentor.wants}</strong>
                    </div>
                  </div>
                </div>

                {/* Two Distinct Actions */}
                <div className="space-y-2 pt-1">
                  <Link
                    href={`/messages?partnerId=${mentor.id}&partnerName=${encodeURIComponent(mentor.name)}`}
                    className="w-full py-2.5 border-2 border-black bg-[#FFE600] text-black text-xs font-black uppercase tracking-wider text-center block shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                  >
                    Request swap
                  </Link>
                  <Link
                    href="/credits"
                    className="w-full py-2 border-2 border-black bg-[#12141C] hover:bg-[#1F2430] text-white text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_#38BDF8] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                  >
                    <CoinIcon size={14} />
                    <span>Learn for 10 credits</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}