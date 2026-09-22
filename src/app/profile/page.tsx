"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSkillSwap, CredentialItem, normalizeCredential } from "@/context/SkillSwapContext";
import CertificateModal from "@/components/CertificateModal";
import {
  Star,
  ShieldCheck,
  Award,
  Layers,
  GraduationCap,
  PlusCircle,
  Settings,
  Repeat,
  Calendar,
  CheckCircle2,
  MapPin,
  Mail,
  Briefcase,
  User,
  FileText,
  ExternalLink,
  Eye,
} from "lucide-react";

export default function CurrentUserProfilePage() {
  const {
    currentUser,
    credits,
    userTaughtSkillsList,
    userLearningSkillsList,
    sessions,
  } = useSkillSwap();

  const [activeTab, setActiveTab] = useState<"skills" | "sessions">("skills");
  const [selectedCredential, setSelectedCredential] = useState<CredentialItem | null>(null);
  const completedSessionsCount = sessions.filter((s) => s.status === "completed").length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Profile Card Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#7C3AED] shadow-sm"
                />
                <div
                  title="Verified Member"
                  className="absolute bottom-1 right-1 w-6 h-6 bg-[#7C3AED] rounded-full flex items-center justify-center text-white ring-2 ring-white dark:ring-[#161327]"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[#18181B] dark:text-white">
                    {currentUser.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold">
                    Member
                  </span>
                </div>

                {/* Headline / What they are doing right now */}
                {currentUser.currentActivity && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EDE9FE]/70 dark:bg-[#231C3D]/70 text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] mt-1.5 border border-[#DDD6FE] dark:border-[#3B2D66]">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{currentUser.currentActivity}</span>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
                  @{currentUser.name.toLowerCase().replace(/\s+/g, "")} • {currentUser.role}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#71717A] dark:text-zinc-400 mt-2">
                  {currentUser.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#7C3AED]" />
                      {currentUser.location}
                    </span>
                  )}
                  {currentUser.gender && currentUser.gender !== "Prefer not to say" && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#7C3AED]" />
                      {currentUser.gender}
                    </span>
                  )}
                  <span className="font-mono font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                    🪙 {credits} Credits
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Link
                href="/settings?tab=profile"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#18181B] dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>
              <Link
                href="/skills"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Manage Skills</span>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <div className="p-3 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B]">
              <span className="text-[11px] font-semibold text-[#71717A] block">Skills Teaching</span>
              <span className="text-xl font-extrabold text-[#7C3AED] dark:text-[#A78BFA] font-mono">
                {userTaughtSkillsList.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B]">
              <span className="text-[11px] font-semibold text-[#71717A] block">Skills Learning</span>
              <span className="text-xl font-extrabold text-[#7C3AED] dark:text-[#A78BFA] font-mono">
                {userLearningSkillsList.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B]">
              <span className="text-[11px] font-semibold text-[#71717A] block">Successful Swaps</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                {completedSessionsCount + 3}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B]">
              <span className="text-[11px] font-semibold text-[#71717A] block">Rating</span>
              <span className="text-xl font-extrabold text-amber-500 font-mono">
                5.0 ★
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: EDUCATION & STUDIES */}
        {(currentUser.school || currentUser.degree) && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
                <h2 className="text-base font-bold text-[#18181B] dark:text-white">Studies &amp; Education</h2>
              </div>
              <Link href="/settings?tab=profile" className="text-xs font-semibold text-[#7C3AED] hover:underline">
                Edit
              </Link>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E]">
              <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] dark:bg-[#231C3D] flex items-center justify-center text-[#7C3AED] dark:text-[#A78BFA] shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#18181B] dark:text-white">
                  {currentUser.school || "University"}
                </h4>
                <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-0.5">
                  {currentUser.degree || "Field of Study"}
                </p>
                {currentUser.graduationYear && (
                  <span className="inline-block text-[11px] font-semibold text-[#7C3AED] dark:text-[#A78BFA] mt-1.5 px-2 py-0.5 rounded-md bg-[#EDE9FE] dark:bg-[#231C3D]">
                    {currentUser.graduationYear}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION: CREDENTIALS & CERTIFICATIONS */}
        {currentUser.credentials && currentUser.credentials.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
                <h2 className="text-base font-bold text-[#18181B] dark:text-white">Credentials &amp; Certifications</h2>
              </div>
              <Link href="/settings?tab=profile" className="text-xs font-semibold text-[#7C3AED] hover:underline">
                + Add credential
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {currentUser.credentials.map((cred, idx) => {
                const item = normalizeCredential(cred, idx);
                const hasDoc = Boolean(item.documentUrl);
                const hasLink = Boolean(item.verificationUrl);

                return (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] flex flex-col justify-between gap-3 shadow-2xs hover:border-[#DDD6FE] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-[#18181B] dark:text-white line-clamp-2">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-[#71717A] dark:text-zinc-400 mt-0.5">
                          {item.issuer || "Verified Credential"} {item.issueDate ? `• ${item.issueDate}` : ""}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                          {hasDoc && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-[9px] font-semibold text-[#7C3AED] dark:text-[#A78BFA]">
                              <FileText className="w-2.5 h-2.5" />
                              Doc Attached
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedCredential(item)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] hover:underline"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Certificate</span>
                      </button>

                      {hasLink && (
                        <a
                          href={item.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-400 hover:text-[#7C3AED] transition-colors p-1"
                          title="External Verification Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Certificate Preview Modal */}
            <CertificateModal
              isOpen={Boolean(selectedCredential)}
              onClose={() => setSelectedCredential(null)}
              credential={selectedCredential}
              recipientName={currentUser.name}
            />
          </div>
        )}

        {/* SECTION: ABOUT ME */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
            About Me
          </h2>
          <p className="text-sm text-[#18181B] dark:text-zinc-200 leading-relaxed font-normal">
            {currentUser.bio}
          </p>
        </div>

        {/* SECTION: I CAN TEACH */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
              <h2 className="text-base font-bold text-[#18181B] dark:text-white">I Can Teach</h2>
            </div>
            <Link href="/skills" className="text-xs font-semibold text-[#7C3AED] hover:underline">
              + Add skill
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userTaughtSkillsList.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E]"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA]">
                    {skill.level}
                  </span>
                  <span className="text-[11px] font-mono text-[#71717A]">🪙 10 cr</span>
                </div>
                <h4 className="text-sm font-bold text-[#18181B] dark:text-white mt-2">
                  {skill.name}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION: I WANT TO LEARN */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-[#7C3AED] dark:text-[#A78BFA]" />
              <h2 className="text-base font-bold text-[#18181B] dark:text-white">I Want to Learn</h2>
            </div>
            <Link href="/skills" className="text-xs font-semibold text-[#7C3AED] hover:underline">
              + Add learning goal
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {userLearningSkillsList.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E]"
              >
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                  Target Goal
                </span>
                <h4 className="text-sm font-bold text-[#18181B] dark:text-white mt-2">
                  {skill.name}
                </h4>
                {skill.goal && (
                  <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-1 line-clamp-2">
                    {skill.goal}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
