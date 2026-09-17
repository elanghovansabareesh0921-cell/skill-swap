"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SkillCard from "@/components/SkillCard";
import BookingModal from "@/components/BookingModal";
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
} from "lucide-react";

export default function DashboardPage() {
  const { currentUser, credits, sessions, skills, userTaughtSkills } = useSkillSwap();

  const [bookingSkill, setBookingSkill] = useState<SkillListing | null>(null);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);

  const upcomingSessions = sessions.filter((s) => s.status === "upcoming");
  const recommendedSkills = skills.slice(1, 4);

  const continueLearningItems = [
    {
      title: "Python Data Structures & Concurrency",
      teacher: "Arun Kumar",
      progress: 75,
      nextStep: "Async I/O and Generator patterns",
    },
    {
      title: "UI/UX Design Systems in Figma",
      teacher: "Elena Rostova",
      progress: 40,
      nextStep: "Color token taxonomy and responsive variants",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-10">
        {/* Personalized Greeting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Good morning, {currentUser.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Here is what is happening across your learning and teaching sessions today.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/discover"
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold shadow-sm transition-colors"
            >
              Explore Skills
            </Link>
            <Link
              href="/teach"
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Teach a Skill</span>
            </Link>
          </div>
        </div>

        {/* Main Card: Your Learning Journey */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between pb-5 border-b border-gray-100">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Performance & Growth
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-0.5">Your Learning Journey</h2>
            </div>
            <Link
              href="/credits"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Manage Wallet →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100/80">
              <span className="text-xs text-indigo-800 font-medium">Credit Balance</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-indigo-950 font-mono mt-1">
                🪙 {credits}
              </p>
              <span className="text-[10px] text-indigo-600 font-medium mt-1 block">
                Available to spend
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Learning sessions</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono mt-1">
                {currentUser.learningCount}
              </p>
              <span className="text-[10px] text-gray-400 mt-1 block">Completed as student</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Teaching sessions</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono mt-1">
                {currentUser.teachingCount}
              </p>
              <span className="text-[10px] text-gray-400 mt-1 block">Delivered as mentor</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-xs text-gray-500 font-medium">Skills In Progress</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-mono mt-1">
                {currentUser.skillsCount}
              </p>
              <span className="text-[10px] text-gray-400 mt-1 block">Topics active</span>
            </div>
          </div>
        </div>

        {/* Upcoming Sessions Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Upcoming Sessions</span>
            </h2>
            <Link
              href="/learn"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View all ({upcomingSessions.length})
            </Link>
          </div>

          {upcomingSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSessions.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm flex flex-col justify-between hover:border-gray-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        {item.date}
                      </span>
                      <span className="text-xs font-mono text-gray-500">{item.time}</span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mt-2.5">
                      {item.skillTitle}
                    </h3>

                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={item.teacherAvatar}
                        alt={item.teacherName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="text-xs text-gray-600 font-medium">
                        with {item.teacherName}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-indigo-600 font-mono font-semibold">
                        🪙 {item.credits} credits
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">Duration: {item.duration}</span>
                    <Link
                      href={`/learn/${item.id}`}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Join Session</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200/80">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700">Nothing scheduled yet.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Find a skill and start learning.</p>
              <Link
                href="/discover"
                className="mt-3 inline-block px-3.5 py-1.5 rounded-xl bg-gray-900 text-white text-xs font-semibold"
              >
                Explore Skills
              </Link>
            </div>
          )}
        </section>

        {/* Continue Learning Section with Progress Bars */}
        <section>
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Continue Learning</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {continueLearningItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-2xl border border-gray-200/90 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">{item.title}</h3>
                  <span className="text-xs font-mono font-bold text-indigo-600">
                    {item.progress}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Instructor: {item.teacher}</p>

                <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                <div className="mt-3 text-[11px] text-gray-500 flex items-center justify-between">
                  <span>Next step: {item.nextStep}</span>
                  <Link
                    href="/learn"
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Resume →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recommended For You */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Recommended For You</span>
              </h2>
              <p className="text-xs text-gray-500">Based on your learning history and goals</p>
            </div>
            <Link
              href="/discover"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Browse all →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onBookClick={(s) => setBookingSkill(s)}
              />
            ))}
          </div>
        </section>
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