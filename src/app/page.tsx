"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import SkillCard from "@/components/SkillCard";
import BookingModal from "@/components/BookingModal";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap, SkillListing } from "@/context/SkillSwapContext";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  GraduationCap,
  PlusCircle,
  Clock,
  Star,
  Users,
  Search,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { skills, credits } = useSkillSwap();

  const [bookingSkill, setBookingSkill] = useState<SkillListing | null>(null);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);

  // Simulator state: hours user wants to teach
  const [simHours, setSimHours] = useState<number>(3);
  const simCreditsEarned = simHours * 10;
  const simSessionsLearned = Math.floor(simCreditsEarned / 10);

  const featuredSkills = skills.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Subtle Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200/90 shadow-sm text-xs font-semibold text-gray-700 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Fair Peer-to-Peer Knowledge Economy</span>
            <span className="text-gray-300">|</span>
            <span className="font-mono text-indigo-600">🪙 1 Hour = 10 Credits</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.08]">
            Learn something new. <br />
            <span className="text-gray-400 font-normal">Teach what you know.</span>
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto mt-6 text-base sm:text-lg text-gray-600 leading-relaxed font-normal">
            SkillSwap connects people who want to learn with people who can teach —
            powered by a simple credit-based exchange. No expensive hourly tuition,
            just mutual knowledge sharing.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/discover"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 group"
            >
              <span>Explore Skills</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/teach"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <span>Start Teaching</span>
            </Link>
          </div>

          {/* Visual Explanation: Learn -> Teach -> Earn Credits -> Learn More */}
          <div className="mt-16 max-w-4xl mx-auto p-4 sm:p-6 rounded-2xl bg-white border border-gray-200/80 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 text-center">
              The Reciprocal Knowledge Loop
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold font-mono mb-2">
                    01
                  </div>
                  <h4 className="text-xs font-bold text-gray-900">Learn</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Book 1-on-1 sessions from passionate practitioners.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold font-mono mb-2">
                    02
                  </div>
                  <h4 className="text-xs font-bold text-gray-900">Teach</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Offer your domain expertise to curious peers.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs font-bold font-mono mb-2">
                    03
                  </div>
                  <h4 className="text-xs font-bold text-gray-900">Earn Credits</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Receive verified credits directly into your wallet.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold font-mono mb-2">
                    04
                  </div>
                  <h4 className="text-xs font-bold text-gray-900">Learn More</h4>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Re-invest earned credits to master anything next.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How Skill Credits Work (4-Step Breakdown) */}
      <section className="py-16 bg-white border-y border-gray-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Transparent Credit Engine
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              How Skill Credits Work
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Every hour you invest teaching someone pays forward into your own learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl border border-gray-200/90 bg-[#F9FAFB] flex flex-col justify-between">
              <div>
                <span className="text-2xl font-mono font-bold text-indigo-600">01</span>
                <h3 className="text-base font-bold text-gray-900 mt-3">Teach</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Share a skill with another person. Host focused 1-on-1 calls with integrated code scratchpads and agenda tracking.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200/60 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Step 01
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200/90 bg-[#F9FAFB] flex flex-col justify-between">
              <div>
                <span className="text-2xl font-mono font-bold text-emerald-600">02</span>
                <h3 className="text-base font-bold text-gray-900 mt-3">Earn Credits</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Receive credits when you successfully teach. Escrow guarantees safe transfer the second a session completes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200/60 text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">
                +10 Credits / session
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200/90 bg-[#F9FAFB] flex flex-col justify-between">
              <div>
                <span className="text-2xl font-mono font-bold text-indigo-600">03</span>
                <h3 className="text-base font-bold text-gray-900 mt-3">Spend Credits</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Use your credits to learn from someone else. Book top experts in Python, Figma, Spanish, AI, or music production.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200/60 text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                Zero Cash Needed
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-gray-200/90 bg-[#F9FAFB] flex flex-col justify-between">
              <div>
                <span className="text-2xl font-mono font-bold text-gray-900">04</span>
                <h3 className="text-base font-bold text-gray-900 mt-3">Keep Growing</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Continue learning and teaching in an ongoing cycle. Grow your reputation score and build lasting peer relationships.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200/60 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                Continuous Growth
              </div>
            </div>
          </div>

          {/* Interactive Credit Simulator */}
          <div className="mt-12 max-w-2xl mx-auto p-6 rounded-2xl bg-white border border-gray-200 shadow-sm text-center">
            <h4 className="text-sm font-bold text-gray-900">Interactive Credit Simulator</h4>
            <p className="text-xs text-gray-500 mt-1">
              Adjust the slider to see how your teaching translates directly into learning credits:
            </p>

            <div className="mt-6 flex flex-col items-center">
              <input
                type="range"
                min="1"
                max="10"
                value={simHours}
                onChange={(e) => setSimHours(Number(e.target.value))}
                className="w-full max-w-md accent-indigo-600 cursor-pointer"
              />
              <div className="flex items-center justify-between w-full max-w-md text-xs text-gray-400 mt-1.5 font-mono">
                <span>1 hr/wk</span>
                <span>5 hrs/wk</span>
                <span>10 hrs/wk</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-xs text-gray-500">If you teach</span>
                <p className="text-lg font-bold text-gray-900 mt-0.5">
                  {simHours} hr{simHours > 1 ? "s" : ""} / week
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="text-xs text-indigo-700 font-medium">You unlock</span>
                <p className="text-lg font-bold text-indigo-900 mt-0.5">
                  🪙 {simCreditsEarned} Credits ({simSessionsLearned} sessions)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Skills Marketplace Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Popular Exchange Topics
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Skills ready for swapping today
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Verified community members offering direct 1-on-1 mentorship.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>View all skills</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredSkills.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onBookClick={(s) => setBookingSkill(s)}
            />
          ))}
        </div>
      </section>

      {/* Simple Clean Footer */}
      <footer className="mt-auto border-t border-gray-200/80 bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gray-900 flex items-center justify-center text-white font-bold text-xs">
              S
            </div>
            <span className="text-sm font-bold text-gray-900">SkillSwap</span>
            <span className="text-xs text-gray-400 ml-2">
              © 2026 SkillSwap Technologies. Peer-to-peer knowledge exchange.
            </span>
          </div>

          <div className="flex items-center space-x-6 text-xs text-gray-500">
            <Link href="/discover" className="hover:text-gray-900 transition-colors">
              Discover
            </Link>
            <Link href="/teach" className="hover:text-gray-900 transition-colors">
              Teach
            </Link>
            <Link href="/credits" className="hover:text-gray-900 transition-colors">
              Credits
            </Link>
            <Link href="/community" className="hover:text-gray-900 transition-colors">
              Community
            </Link>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      <BookingModal
        skill={bookingSkill}
        isOpen={!!bookingSkill}
        onClose={() => setBookingSkill(null)}
      />

      {/* Buy Credits Modal */}
      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </div>
  );
}