"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SwapRequestModal from "@/components/SwapRequestModal";
import { useSkillSwap, SkillListing, CredentialItem, normalizeCredential } from "@/context/SkillSwapContext";
import CertificateModal from "@/components/CertificateModal";
import CoinIcon from "@/components/common/CoinIcon";
import VerifiedBadge from "@/components/common/VerifiedBadge";
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
  FileText,
  ExternalLink,
  Eye,
  Briefcase,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

export default function UserPublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { skills } = useSkillSwap();

  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<CredentialItem | null>(null);

  const teacherId = (params?.id as string) || "arun-kumar";

  // Find matching skills
  const teacherSkills = skills.filter((s) => s.teacher.id === teacherId);
  const teacher = teacherSkills[0]?.teacher || {
    id: teacherId,
    name: "Arun Kumar",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    role: "Full-Stack Developer & Mentor",
    location: "San Francisco, CA • Remote",
    currentActivity:
      "Senior Engineer @ OpenDev • Mentoring in Python & System Design",
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

  const primarySkill =
    teacherSkills[0]?.title || "Python Programming & Data Structures";

  const handleMessage = () => {
    router.push(
      `/messages?partnerId=${encodeURIComponent(
        teacher.id
      )}&partnerName=${encodeURIComponent(teacher.name)}`
    );
  };

  return (
    <div className="min-h-screen flex flex-col ambient-bg text-white pb-20 lg:pb-0">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Back navigation */}
        <div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/50 hover:text-white transition-colors glass px-3 py-1.5 rounded-xl border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Explore</span>
          </Link>
        </div>

        {/* ── PROFILE HERO CARD ── */}
        <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-white/15 ring-4 ring-cyan-500/20 shadow-xl"
                />
                {teacher.verified && (
                  <div
                    title="Verified Mentor"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white ring-2 ring-[#08090D] shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                    }}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {teacher.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full glass text-cyan-300 border-cyan-500/20 text-xs font-semibold">
                    Top Mentor
                  </span>
                  {teacher.verified && <VerifiedBadge size="sm" showLabel={false} />}
                </div>

                {/* Headline / What they are doing rn */}
                {(teacher as any).currentActivity && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-semibold text-white/80 mt-2">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{(teacher as any).currentActivity}</span>
                  </div>
                )}

                <p className="text-xs sm:text-sm text-white/50 mt-1.5">
                  @{teacher.name.toLowerCase().replace(/\s+/g, "")} • {teacher.role}
                </p>
                <div className="flex items-center gap-3 text-xs text-white/50 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-violet-400" />
                    {teacher.location}
                  </span>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{teacher.rating}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CTAs: Request Skill Swap & Message */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto relative z-10">
              <button
                type="button"
                onClick={handleMessage}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl glass hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white transition-all flex items-center justify-center gap-1.5 border-white/10 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                <span>Message</span>
              </button>
              <button
                type="button"
                onClick={() => setSwapModalOpen(true)}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-lg transition-all flex items-center justify-center gap-1.5 hover:opacity-95 cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                  boxShadow: "0 4px 14px rgba(124,108,246,0.3)",
                }}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Request Skill Swap</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/8 text-center relative z-10">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8">
              <span className="text-[11px] font-medium text-white/40 block">
                Skills Teaching
              </span>
              <span className="text-xl font-extrabold text-violet-300 mt-1 block">
                {teacherSkills.length || 2}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8">
              <span className="text-[11px] font-medium text-white/40 block">
                Skills Learning
              </span>
              <span className="text-xl font-extrabold text-cyan-300 mt-1 block">
                2
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8">
              <span className="text-[11px] font-medium text-white/40 block">
                Successful Swaps
              </span>
              <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                {teacher.sessionsTaught}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/8">
              <span className="text-[11px] font-medium text-white/40 block">
                Rating
              </span>
              <span className="text-xl font-extrabold text-amber-400 mt-1 block">
                {teacher.rating} ★
              </span>
            </div>
          </div>
        </div>

        {/* ── ABOUT ME ── */}
        <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-lg space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-violet-400">
            About Me
          </h2>
          <p className="text-sm text-white/70 leading-relaxed font-normal">
            {teacher.bio}
          </p>
        </div>

        {/* ── STUDIES & EDUCATION ── */}
        {((teacher as any).school || (teacher as any).degree) && (
          <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/8">
              <GraduationCap className="w-5 h-5 text-violet-400" />
              <h2 className="text-base font-bold text-white">Studies &amp; Education</h2>
            </div>
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  {(teacher as any).school}
                </h4>
                <p className="text-xs text-white/50 mt-0.5">
                  {(teacher as any).degree}
                </p>
                {(teacher as any).graduationYear && (
                  <span className="inline-block text-[11px] font-semibold text-violet-300 mt-1.5 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20">
                    {(teacher as any).graduationYear}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── CREDENTIALS & CERTIFICATIONS ── */}
        {(teacher as any).credentials && (teacher as any).credentials.length > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-lg space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-white/8">
              <Award className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white">Credentials &amp; Certifications</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {(teacher as any).credentials.map((cred: any, idx: number) => {
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
              recipientName={teacher.name}
            />
          </div>
        )}

        {/* ── I CAN TEACH ── */}
        <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/8">
            <Layers className="w-5 h-5 text-violet-400" />
            <h2 className="text-base font-bold text-white">I Can Teach</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teacherSkills.map((skill) => (
              <div
                key={skill.id}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {skill.level}
                    </span>
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <CoinIcon size={12} /> {skill.creditsPerSession} credits
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {skill.title}
                  </h3>
                  <p className="text-xs text-white/50 line-clamp-2">
                    {skill.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/8 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSwapModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-white text-xs font-bold shadow-md flex items-center gap-1.5 cursor-pointer hover:opacity-95"
                    style={{
                      background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                    }}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Swap This Skill</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── I WANT TO LEARN ── */}
        <div className="p-6 sm:p-8 rounded-3xl glass border-white/10 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/8">
            <GraduationCap className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">I Want to Learn</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Beginner Target
              </span>
              <h4 className="text-sm font-bold text-white mt-2">
                UI/UX Design Systems in Figma
              </h4>
              <p className="text-xs text-white/50 mt-1">
                Looking to learn token systems, auto-layout 5.0, and developer handoff.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/8">
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                Intermediate Target
              </span>
              <h4 className="text-sm font-bold text-white mt-2">
                Conversational Spanish
              </h4>
              <p className="text-xs text-white/50 mt-1">
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