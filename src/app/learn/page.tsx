"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap, SkillListing } from "@/context/SkillSwapContext";
import {
  GraduationCap,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Play,
  Compass,
} from "lucide-react";

export default function LearnIndexPage() {
  const { sessions, skills } = useSkillSwap();
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [bookingSkill, setBookingSkill] = useState<SkillListing | null>(null);

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const completedSessions = sessions.filter((s) => s.status === "completed");

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-gray-200/80">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              My Learning Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Active Learning & Sessions
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Join upcoming 1-on-1 calls, access notes, or schedule new topics.
            </p>
          </div>

          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover More Skills</span>
          </Link>
        </div>

        {/* Section: Upcoming Sessions */}
        <div className="mt-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Upcoming Sessions ({upcomingSessions.length})</span>
          </h2>

          {upcomingSessions.length > 0 ? (
            <div className="space-y-4">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={session.teacherAvatar}
                      alt={session.teacherName}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          {session.date}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 font-mono">{session.time}</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mt-1.5">
                        {session.skillTitle}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Teacher: <span className="font-semibold text-gray-700">{session.teacherName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="text-right hidden sm:block mr-2">
                      <span className="text-xs font-bold text-indigo-600 font-mono block">
                        🪙 {session.credits} credits
                      </span>
                      <span className="text-[10px] text-gray-400">{session.duration}</span>
                    </div>

                    <Link
                      href={`/learn/${session.id}`}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Join Session</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-3xl border border-gray-200/80 shadow-sm">
              <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-gray-900">Nothing scheduled yet</h3>
              <p className="text-xs text-gray-500 mt-1">
                Find a skill you want to master and book a session with a mentor.
              </p>
              <Link
                href="/discover"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors"
              >
                <span>Explore Skills</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>

        {/* Section: Completed Sessions */}
        {completedSessions.length > 0 && (
          <div className="mt-12">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Completed Sessions ({completedSessions.length})</span>
            </h2>

            <div className="space-y-3">
              {completedSessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-white rounded-xl border border-gray-200/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900">{session.skillTitle}</h4>
                    <p className="text-gray-500 mt-0.5">with {session.teacherName}</p>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BookingModal
        skill={bookingSkill}
        isOpen={!!bookingSkill}
        onClose={() => setBookingSkill(null)}
      />

      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </div>
  );
}
