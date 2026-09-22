"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SwapRequestModal from "@/components/SwapRequestModal";
import { useSkillSwap, SkillListing } from "@/context/SkillSwapContext";
import {
  Star,
  MapPin,
  ShieldCheck,
  Calendar,
  Clock,
  MessageSquare,
  Repeat,
  ArrowLeft,
  CheckCircle2,
  Layers,
  GraduationCap,
  Award,
} from "lucide-react";

export default function UserPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { skills } = useSkillSwap();

  const [swapModalOpen, setSwapModalOpen] = useState(false);

  const teacherId = (params?.id as string) || "arun-kumar";

  // Find matching skills
  const teacherSkills = skills.filter((s) => s.teacher.id === teacherId);
  const teacher = teacherSkills[0]?.teacher || {
    id: teacherId,
    name: "Arun Kumar",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    role: "Full-Stack Developer & Mentor",
    location: "San Francisco, CA • Remote",
    currentActivity: "Senior Engineer @ OpenDev • Mentoring in Python & System Design",
    school: "Carnegie Mellon University",
    degree: "M.S. in Software Engineering",
    graduationYear: "Alumni",
    credentials: [
      "AWS Certified Solutions Architect",
      "Google Developer Expert",
      "Python Software Foundation Contributor",
    ],
    bio: "Full-stack developer helping beginners build real-world software projects. Specializing in Python, React micro-frontends, and pragmatic engineering workflows.",
    rating: 4.9,
    sessionsTaught: 127,
    creditsEarned: 340,
    verified: true,
  };

  const primarySkill = teacherSkills[0]?.title || "Python Programming & Data Structures";

  const handleMessage = () => {
    router.push(`/messages?partnerId=${encodeURIComponent(teacher.id)}&partnerName=${encodeURIComponent(teacher.name)}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Back navigation */}
        <div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#71717A] hover:text-[#18181B] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Explore</span>
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#7C3AED] shadow-sm"
                />
                {teacher.verified && (
                  <div
                    title="Verified Mentor"
                    className="absolute bottom-1 right-1 w-6 h-6 bg-[#7C3AED] rounded-full flex items-center justify-center text-white ring-2 ring-white dark:ring-[#161327]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white">
                    {teacher.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold">
                    Top Mentor
                  </span>
                </div>

                {/* Headline / What they are doing rn */}
                {(teacher as any).currentActivity && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE]/70 dark:bg-[#231C3D]/70 text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] mt-1.5 border border-[#DDD6FE] dark:border-[#3B2D66]">
                    <span>{(teacher as any).currentActivity}</span>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
                  @{teacher.name.toLowerCase().replace(/\s+/g, "")} • {teacher.role}
                </p>
                <div className="flex items-center gap-3 text-xs text-[#71717A] dark:text-zinc-400 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#7C3AED]" />
                    {teacher.location}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{teacher.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs: Request Skill Swap & Message */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleMessage}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-[#18181B] dark:text-zinc-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
              <button
                type="button"
                onClick={() => setSwapModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Request Skill Swap</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <div className="p-3 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B]">
              <span className="text-[11px] font-semibold text-[#71717A] block">Skills Teaching</span>
              <span className="text-xl font-extrabold text-[#7C3AED] dark:text-[#A78BFA] font-mono">
                {teacherSkills.length || 2}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B]">
              <span className="text-[11px] font-semibold text-[#71717A] block">Skills Learning</span>
              <span className="text-xl font-extrabold text-[#7C3AED] dark:text-[#A78BFA] font-mono">
                2
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B]">
              <span className="text-[11px] font-semibold text-[#71717A] block">Successful Swaps</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {teacher.sessionsTaught}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B]">
              <span className="text-[11px] font-semibold text-[#71717A] block">Rating</span>
              <span className="text-xl font-extrabold text-amber-500 font-mono">
                {teacher.rating} ★
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: ABOUT ME */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
            About Me
          </h2>
          <p className="text-sm text-[#18181B] dark:text-zinc-200 leading-relaxed font-normal">
            {teacher.bio}
          </p>
        </div>

        {/* SECTION: STUDIES & EDUCATION */}
        {((teacher as any).school || (teacher as any).degree) && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <GraduationCap className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
              <h2 className="text-base font-bold text-[#18181B] dark:text-white">Studies &amp; Education</h2>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E]">
              <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] dark:bg-[#231C3D] flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA] shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#18181B] dark:text-white">
                  {(teacher as any).school}
                </h4>
                <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-0.5">
                  {(teacher as any).degree}
                </p>
                {(teacher as any).graduationYear && (
                  <span className="inline-block text-[11px] font-semibold text-[#7C3AED] dark:text-[#A78BFA] mt-1.5 px-2 py-0.5 rounded-md bg-[#EDE9FE] dark:bg-[#231C3D]">
                    {(teacher as any).graduationYear}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: CREDENTIALS & CERTIFICATIONS */}
        {(teacher as any).credentials && (teacher as any).credentials.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <Award className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
              <h2 className="text-base font-bold text-[#18181B] dark:text-white">Credentials &amp; Certifications</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {(teacher as any).credentials.map((cred: string, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#18181B] dark:text-white">
                      {cred}
                    </h5>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION: I CAN TEACH */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <Layers className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
            <h2 className="text-base font-bold text-[#18181B] dark:text-white">I Can Teach</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teacherSkills.map((skill) => (
              <div
                key={skill.id}
                className="p-5 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA]">
                      {skill.level}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#7C3AED]">
                      🪙 {skill.creditsPerSession} cr
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#18181B] dark:text-white mb-1">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-zinc-400 line-clamp-2">
                    {skill.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSwapModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Swap This Skill</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: I WANT TO LEARN */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <GraduationCap className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
            <h2 className="text-base font-bold text-[#18181B] dark:text-white">I Want to Learn</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E]">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                Beginner Target
              </span>
              <h4 className="text-sm font-bold text-[#18181B] dark:text-white mt-2">
                UI/UX Design Systems in Figma
              </h4>
              <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-1">
                Looking to learn token systems, auto-layout 5.0, and developer handoff.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E]">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                Intermediate Target
              </span>
              <h4 className="text-sm font-bold text-[#18181B] dark:text-white mt-2">
                Conversational Spanish
              </h4>
              <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-1">
                Aiming for conversational fluency for international travel and remote teams.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SwapRequestModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        targetUser={{
          id: teacher.id,
          name: teacher.name,
          avatar: teacher.avatar,
          skillToTeach: primarySkill,
        }}
      />
    </div>
  );
}