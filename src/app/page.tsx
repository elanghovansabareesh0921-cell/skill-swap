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
  CheckCircle,
  Compass,
  Star,
  Users,
  Lock,
  Flame,
  Award,
  BookOpen,
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
      <div className="min-h-screen flex items-center justify-center bg-[#f5f2fc] dark:bg-[#130f26]">
        <div className="w-8 h-8 rounded-full border-2 border-[#7d6ce8] border-t-transparent animate-spin" />
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
    <div className="min-h-screen flex flex-col bg-[#f5f2fc] dark:bg-[#130f26] text-[#241b3d] dark:text-[#f4f0ff] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-16">
        {/* HERO SECTION */}
        <section className="text-center max-w-3xl mx-auto space-y-6 pt-6 sm:pt-10">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ede8fb] dark:bg-[#282147] border border-[#ddd4f5] dark:border-[#362c5e] text-xs font-semibold text-[#7d6ce8] dark:text-[#ac98f2] shadow-sm">
            <CoinIcon size={14} />
            <span>Global Skill Exchange · 1 Hour = 10 Credits</span>
          </div>

          {/* Big Bold Headline in Sentence Case */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#241b3d] dark:text-[#f4f0ff] leading-[1.12]">
            Learn anything. Teach what you love.
          </h1>

          {/* Subhead */}
          <p className="text-base sm:text-lg text-[#7a719c] dark:text-[#a99ed4] leading-relaxed max-w-2xl mx-auto">
            A platform where people exchange skills instead of money. Real-time matching, no fees, no gatekeeping — just people teaching people.
          </p>

          {/* Two CTAs (Pill-shaped buttons) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/discover"
              className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white font-bold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] text-center"
            >
              Get started
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white dark:bg-[#1e1938] hover:bg-[#ede8fb]/60 dark:hover:bg-[#282147] border border-[#ddd4f5] dark:border-[#362c5e] text-[#241b3d] dark:text-[#f4f0ff] font-semibold text-sm transition-colors text-center"
            >
              Explore features
            </a>
          </div>
        </section>

        {/* BELOW THE FOLD: COMPACT ACTIVITY CARD */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7d6ce8]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#7a719c] dark:text-[#a99ed4]">
                Your Skill Exchange Activity
              </h2>
            </div>
            <Link
              href="/credits"
              className="text-xs font-semibold text-[#7d6ce8] dark:text-[#ac98f2] hover:underline flex items-center gap-1"
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
            <span className="text-xs font-bold uppercase tracking-wider text-[#7d6ce8] dark:text-[#ac98f2]">
              Two Flexible Ways to Trade
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
              How skill exchange works
            </h2>
            <p className="text-xs sm:text-sm text-[#7a719c] dark:text-[#a99ed4]">
              Trade directly peer-to-peer or spend earned credits with full escrow protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model A: Direct Swap */}
            <div className="rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-7 space-y-4 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2] flex items-center justify-center">
                <Repeat className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#7d6ce8] dark:text-[#ac98f2]">
                  Mutual Exchange
                </span>
                <h3 className="text-xl font-extrabold text-[#241b3d] dark:text-[#f4f0ff] mt-1">
                  Direct swap
                </h3>
              </div>

              <p className="text-sm text-[#7a719c] dark:text-[#a99ed4] leading-relaxed">
                Two people teach each other. You teach what you know for an hour, and they teach you their craft in return. No credits move.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#7d6ce8] dark:text-[#ac98f2]">
                <span className="w-2 h-2 rounded-full bg-[#7d6ce8]" />
                <span>Zero credits required · Pure peer exchange</span>
              </div>
            </div>

            {/* Model B: Credit Escrow */}
            <div className="rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-7 space-y-4 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#ede8fb] dark:bg-[#282147] text-[#f5a524] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#f5a524]">
                  Escrow Protected
                </span>
                <h3 className="text-xl font-extrabold text-[#241b3d] dark:text-[#f4f0ff] mt-1">
                  Credit escrow
                </h3>
              </div>

              <p className="text-sm text-[#7a719c] dark:text-[#a99ed4] leading-relaxed">
                A learner spends 10 credits to book 1 hour. Credits are locked in escrow until the session is marked complete, then released to the teacher.
              </p>

              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#f5a524]">
                <span className="w-2 h-2 rounded-full bg-[#f5a524]" />
                <span>1 Hour = 10 Credits · Released upon completion</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: FEATURED MENTORS PREVIEW */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
                Featured skill traders
              </h2>
              <p className="text-xs sm:text-sm text-[#7a719c] dark:text-[#a99ed4] mt-0.5">
                Connect with community members ready for direct swaps or credit sessions.
              </p>
            </div>
            <Link
              href="/discover"
              className="text-xs font-bold text-[#7d6ce8] dark:text-[#ac98f2] hover:underline flex items-center gap-1 self-start sm:self-auto"
            >
              <span>Explore all peers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-6 space-y-4 hover:border-[#7d6ce8] transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#ddd4f5] dark:border-[#362c5e]"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-bold text-[#241b3d] dark:text-[#f4f0ff] truncate">
                          {mentor.name}
                        </span>
                        {mentor.verified && <VerifiedBadge size="sm" showLabel={false} />}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-[#7a719c] dark:text-[#a99ed4]">
                        <Star className="w-3.5 h-3.5 text-[#f5a524] fill-current" />
                        <span className="font-semibold text-[#241b3d] dark:text-[#f4f0ff]">{mentor.rating}</span>
                        <span>· {mentor.sessionsCompleted} sessions</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Rows */}
                  <div className="p-3 rounded-2xl bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] space-y-1.5 text-xs">
                    <div>
                      <span className="text-[#7a719c] dark:text-[#a99ed4]">Teaches: </span>
                      <strong className="text-[#241b3d] dark:text-[#f4f0ff]">{mentor.teaches}</strong>
                    </div>
                    <div>
                      <span className="text-[#7a719c] dark:text-[#a99ed4]">Wants: </span>
                      <strong className="text-[#7d6ce8] dark:text-[#ac98f2]">{mentor.wants}</strong>
                    </div>
                  </div>
                </div>

                {/* Two Distinct Actions */}
                <div className="space-y-2 pt-1">
                  <Link
                    href={`/messages?partnerId=${mentor.id}&partnerName=${encodeURIComponent(mentor.name)}`}
                    className="w-full py-2.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white text-xs font-bold text-center block transition-all"
                  >
                    Request swap
                  </Link>
                  <Link
                    href="/credits"
                    className="w-full py-2 rounded-full bg-white dark:bg-[#1e1938] hover:bg-[#ede8fb]/60 dark:hover:bg-[#282147] border border-[#ddd4f5] dark:border-[#362c5e] text-[#241b3d] dark:text-[#f4f0ff] text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors"
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