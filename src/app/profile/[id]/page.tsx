"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BookingModal from "@/components/BookingModal";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap, SkillListing } from "@/context/SkillSwapContext";
import {
  Star,
  MapPin,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  MessageSquare,
  Award,
  ArrowRight,
  ArrowLeft,
  Share2,
} from "lucide-react";

export default function TeacherProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { skills, showToast } = useSkillSwap();

  const [bookingSkill, setBookingSkill] = useState<SkillListing | null>(null);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"skills" | "reviews">("skills");

  const teacherId = (params?.id as string) || "arun-kumar";

  // Find all skills by this teacher
  const teacherSkills = skills.filter((s) => s.teacher.id === teacherId);

  // Fallback teacher metadata if not matched directly
  const teacher = teacherSkills[0]?.teacher || {
    id: "arun-kumar",
    name: "Arun Kumar",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    role: "Full-Stack Developer & Mentor",
    location: "San Francisco, CA • Remote",
    bio: "Full-stack developer helping beginners build real-world projects. Specializing in Pythonic architectures, React micro-frontends, and pragmatic engineering workflows.",
    rating: 4.9,
    sessionsTaught: 127,
    creditsEarned: 340,
    verified: true,
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      showToast("Link Copied!", "Teacher profile URL copied to clipboard.", "info");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Back navigation */}
        <div className="mb-6">
          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Discover
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="relative">
                <img
                  src={teacher.avatar}
                  alt={teacher.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-gray-100 shadow-sm"
                />
                {teacher.verified && (
                  <div
                    title="Verified Teacher"
                    className="absolute bottom-1 right-1 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white ring-2 ring-white"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{teacher.name}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                    Top Mentor
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
                  {teacher.role}
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-2.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {teacher.location}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-gray-800">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    {teacher.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Right Action */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                title="Share profile"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {teacherSkills.length > 0 && (
                <button
                  type="button"
                  onClick={() => setBookingSkill(teacherSkills[0])}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Request a Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Bio statement */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-3xl">
              &quot;{teacher.bio}&quot;
            </p>
          </div>

          {/* Stats Counters */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 max-w-lg">
            <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center">
              <span className="text-base sm:text-lg font-bold text-gray-900 font-mono">
                {teacher.sessionsTaught}
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">sessions completed</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center">
              <span className="text-base sm:text-lg font-bold text-indigo-600 font-mono">
                🪙 {teacher.creditsEarned}
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">credits earned</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50/80 border border-gray-100 text-center">
              <span className="text-base sm:text-lg font-bold text-gray-900 font-mono">
                {teacher.rating} ★
              </span>
              <p className="text-[11px] text-gray-500 mt-0.5">satisfaction score</p>
            </div>
          </div>
        </div>

        {/* Tabs: Skills I Teach vs Reviews */}
        <div className="mt-10">
          <div className="flex items-center gap-2 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("skills")}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === "skills"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Skills I Teach ({teacherSkills.length || 3})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 text-sm font-semibold transition-colors border-b-2 ml-4 ${
                activeTab === "reviews"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              Student Reviews (48)
            </button>
          </div>

          {activeTab === "skills" ? (
            <div className="mt-6 space-y-4">
              {teacherSkills.length > 0 ? (
                teacherSkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                          {skill.category}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{skill.level}</span>
                      </div>
                      <h3 className="text-base font-bold text-gray-900 mt-1.5">
                        {skill.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-2xl">
                        {skill.description}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-mono">
                        <span className="flex items-center gap-1 font-bold text-indigo-600">
                          🪙 {skill.creditsPerSession} credits
                        </span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center gap-1 font-sans">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {skill.durationMinutes} minutes
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setBookingSkill(skill)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <span>Request a Session</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                /* Static fallback for Arun Kumar */
                <>
                  <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        Programming
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1.5">
                        Python Programming & Data Structures
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Hands-on coding, algorithms, OOP patterns, and clean Pythonic architecture.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-mono">
                        <span className="font-bold text-indigo-600">🪙 10 credits</span>
                        <span className="text-gray-300">|</span>
                        <span>60 minutes</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setBookingSkill({
                          id: "skill-1",
                          title: "Python Programming",
                          category: "Programming",
                          description: "Hands-on Python",
                          level: "Beginner",
                          creditsPerSession: 10,
                          durationMinutes: 60,
                          rating: 4.9,
                          reviewCount: 48,
                          availability: "Available today",
                          mode: "Online",
                          teacher,
                        })
                      }
                      className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold"
                    >
                      Request a Session
                    </button>
                  </div>

                  <div className="p-5 sm:p-6 bg-white rounded-2xl border border-gray-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                        AI & ML
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-1.5">
                        Machine Learning Foundations & Fast API
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Practical generative AI: fine-tuning small open-source models, RAG pipelines, and deploying with FastAPI.
                      </p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-mono">
                        <span className="font-bold text-indigo-600">🪙 15 credits</span>
                        <span className="text-gray-300">|</span>
                        <span>60 minutes</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setBookingSkill({
                          id: "skill-3",
                          title: "Machine Learning Foundations",
                          category: "AI & ML",
                          description: "Practical ML & RAG",
                          level: "Advanced",
                          creditsPerSession: 15,
                          durationMinutes: 60,
                          rating: 4.8,
                          reviewCount: 27,
                          availability: "Available this week",
                          mode: "Online",
                          teacher,
                        })
                      }
                      className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold"
                    >
                      Request a Session
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Reviews List */
            <div className="mt-6 space-y-4">
              <div className="p-5 bg-white rounded-2xl border border-gray-200/90 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                      M
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Maya Patel</h4>
                      <p className="text-[10px] text-gray-400">Sep 15, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold text-gray-800">5.0</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2.5 leading-relaxed">
                  &quot;Arun walked me through Python async generators and explained the exact difference between threading and event loops. Worth every single credit!&quot;
                </p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-gray-200/90 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                      L
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Liam Chang</h4>
                      <p className="text-[10px] text-gray-400">Sep 11, 2026</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span className="font-bold text-gray-800">5.0</span>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-2.5 leading-relaxed">
                  &quot;Fantastic session. We paired on an actual repository and debugged an issue that I had been stuck on for two days.&quot;
                </p>
              </div>
            </div>
          )}
        </div>
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