"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSkillSwap, CredentialItem, normalizeCredential } from "@/context/SkillSwapContext";
import CertificateModal from "@/components/CertificateModal";
import CoinIcon from "@/components/common/CoinIcon";
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
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function CurrentUserProfilePage() {
  const {
    currentUser,
    credits,
    userTaughtSkillsList,
    userLearningSkillsList,
    sessions,
  } = useSkillSwap();

  const [selectedCredential, setSelectedCredential] = useState<CredentialItem | null>(null);
  const completedSessionsCount = sessions.filter((s) => s.status === "completed").length;

  return (
    <div className="min-h-screen flex flex-col ambient-bg text-white pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* ── PROFILE HERO CARD ── */}
        <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/15 ring-4 ring-violet-500/20 shadow-xl"
                />
                <div
                  title="Verified Member"
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white ring-2 ring-[#08090D] shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                  }}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {currentUser.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full glass text-cyan-300 border-cyan-500/20 text-xs font-semibold">
                    Pro Member
                  </span>
                </div>

                {/* Headline / What they are doing right now */}
                {currentUser.currentActivity && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white/80 mt-2">
                    <Briefcase className="w-3.5 h-3.5 text-violet-400" />
                    <span>{currentUser.currentActivity}</span>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-white/50 mt-1.5">
                  @{currentUser.name.toLowerCase().replace(/\s+/g, "")} • {currentUser.role}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-white/50 mt-2.5">
                  {currentUser.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-violet-400" />
                      {currentUser.location}
                    </span>
                  )}
                  {currentUser.gender && currentUser.gender !== "Prefer not to say" && (
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-violet-400" />
                      {currentUser.gender}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <CoinIcon size={13} />
                    <span>{credits} Credits</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto relative z-10">
              <Link
                href="/settings?tab=profile"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl glass hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all flex items-center justify-center gap-1.5 border-white/10"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>
              <Link
                href="/skills"
                className="flex-1 sm:flex-none px-4.5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5 hover:opacity-95"
                style={{
                  background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                  boxShadow: "0 4px 14px rgba(124,108,246,0.25)",
                }}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Manage Skills</span>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/8 text-center relative z-10">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8">
              <span className="text-[11px] font-medium text-white/40 block">
                Skills Teaching
              </span>
              <span className="text-xl font-extrabold text-violet-300 mt-1 block">
                {userTaughtSkillsList.length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8">
              <span className="text-[11px] font-medium text-white/40 block">
                Skills Learning
              </span>
              <span className="text-xl font-extrabold text-cyan-300 mt-1 block">
                {userLearningSkillsList.length}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8">
              <span className="text-[11px] font-medium text-white/40 block">
                Successful Swaps
              </span>
              <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                {completedSessionsCount + 3}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8">
              <span className="text-[11px] font-medium text-white/40 block">
                Trader Rating
              </span>
              <span className="text-xl font-extrabold text-amber-400 mt-1 block">
                5.0 ★
              </span>
            </div>
          </div>
        </div>

        {/* ── STUDIES & EDUCATION ── */}
        {(currentUser.school || currentUser.degree) && (
          <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-violet-400" />
                <h2 className="text-base font-bold text-white">Studies &amp; Education</h2>
              </div>
              <Link href="/settings?tab=profile" className="text-xs font-semibold text-violet-400 hover:text-violet-300">
                Edit
              </Link>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {currentUser.school || "University"}
                </h4>
                <p className="text-xs text-white/50 mt-0.5">
                  {currentUser.degree || "Field of Study"}
                </p>
                {currentUser.graduationYear && (
                  <span className="inline-block text-[11px] font-semibold text-violet-300 mt-1.5 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">
                    Class of {currentUser.graduationYear}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CREDENTIALS & CERTIFICATIONS ── */}
        {currentUser.credentials && currentUser.credentials.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/8">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Credentials &amp; Certifications</h2>
              </div>
              <Link href="/settings?tab=profile" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                + Add credential
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {currentUser.credentials.map((cred, idx) => {
                const item = normalizeCredential(cred, idx);
                const hasDoc = Boolean(item.documentUrl);
                const hasLink = Boolean(item.verificationUrl);

                return (
                  <div
                    key={item.id || idx}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 flex flex-col justify-between gap-3 hover:border-violet-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="text-xs font-bold text-white line-clamp-2">
                          {item.title}
                        </h5>
                        <p className="text-[11px] text-white/45 mt-0.5">
                          {item.issuer || "Verified Credential"} {item.issueDate ? `• ${item.issueDate}` : ""}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                          {hasDoc && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[9px] font-semibold text-violet-300">
                              <FileText className="w-2.5 h-2.5" />
                              Doc Attached
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/8 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setSelectedCredential(item)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Certificate</span>
                      </button>

                      {hasLink && (
                        <a
                          href={item.verificationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white/40 hover:text-white transition-colors p-1"
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

        {/* ── ABOUT ME ── */}
        <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-lg space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-violet-400">
            About Me
          </h2>
          <p className="text-sm text-white/70 leading-relaxed font-normal">
            {currentUser.bio}
          </p>
        </div>

        {/* ── I CAN TEACH ── */}
        <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white">I Can Teach</h2>
            </div>
            <Link href="/skills" className="text-xs font-semibold text-violet-400 hover:text-violet-300">
              + Add skill
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {userTaughtSkillsList.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-violet-500/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                    {skill.level}
                  </span>
                  <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-1">
                    <CoinIcon size={11} /> 10c
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mt-2">
                  {skill.name}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* ── I WANT TO LEARN ── */}
        <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/8">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">I Want to Learn</h2>
            </div>
            <Link href="/skills" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
              + Add learning goal
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {userLearningSkillsList.map((skill) => (
              <div
                key={skill.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-cyan-500/30 transition-colors"
              >
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  Target Goal
                </span>
                <h4 className="text-sm font-bold text-white mt-2">
                  {skill.name}
                </h4>
                {skill.goal && (
                  <p className="text-xs text-white/50 mt-1 line-clamp-2">
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
