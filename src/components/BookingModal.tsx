"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSkillSwap, SkillListing } from "@/context/SkillSwapContext";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Download,
  Package,
  Layers,
  Coins,
} from "lucide-react";

export interface BookingModalProps {
  skill?: SkillListing | null;
  mentor?: any;
  currentUserCredits?: number;
  currentUserId?: string;
  isOpen?: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AVAILABLE_DATES = [
  { label: "Today", date: "Sep 24", day: "Thu" },
  { label: "Tomorrow", date: "Sep 25", day: "Fri" },
  { label: "Saturday", date: "Sep 26", day: "Sat" },
  { label: "Monday", date: "Sep 28", day: "Mon" },
  { label: "Tuesday", date: "Sep 29", day: "Tue" },
];

const AVAILABLE_TIMES = [
  "10:00 AM – 10:45 AM",
  "2:00 PM – 2:45 PM",
  "4:30 PM – 5:15 PM",
  "6:00 PM – 6:45 PM",
  "8:00 PM – 8:45 PM",
];

export default function BookingModal({
  skill: initialSkill,
  mentor,
  isOpen = true,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const router = useRouter();
  const { credits, bookTeacherPackage, teacherPackages } = useSkillSwap();

  // Normalize mentor prop to a skill if needed
  const skill: SkillListing | null = initialSkill
    ? initialSkill
    : mentor
    ? {
        id: `mentor-${mentor.id || "unknown"}`,
        title: mentor.teachSkills?.[0]?.name || mentor.name + " Mentorship",
        category: mentor.teachSkills?.[0]?.category || "General",
        description: mentor.bio || "1-on-1 mentorship session tailored to your goals.",
        creditsPerSession: mentor.hourlyRateCredits || 50,
        durationMinutes: 45,
        level: "All Levels",
        rating: mentor.rating || 5.0,
        reviewCount: mentor.totalSessions || 12,
        availability: "Available today",
        mode: "Online",
        teacher: {
          id: mentor.id || "arun-kumar",
          name: mentor.name || "Mentor",
          avatar: mentor.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
          role: mentor.headline || "Expert Mentor",
          location: "Remote",
          bio: mentor.bio || "",
          rating: mentor.rating || 5.0,
          sessionsTaught: mentor.totalSessions || 12,
          creditsEarned: 120,
          verified: true,
        },
      }
    : null;

  // Find matching teacher package if available
  const matchedPackage = teacherPackages.find(
    (p) => p.teacherId === skill?.teacher?.id || p.skillName.toLowerCase().includes(skill?.title.toLowerCase() || "")
  );

  const perSessionCost = matchedPackage?.sessionRateCredits || skill?.creditsPerSession || 50;
  const fullCourseCost = matchedPackage?.fullCourseRateCredits || perSessionCost * 5; // e.g. 250 credits

  const [bookingType, setBookingType] = useState<"per_session" | "full_course">("per_session");
  const [selectedDate, setSelectedDate] = useState("Tomorrow, Sep 25");
  const [selectedTime, setSelectedTime] = useState("6:00 PM – 6:45 PM");
  const [step, setStep] = useState<"SELECT" | "CONFIRM">("SELECT");
  const [roomToken, setRoomToken] = useState<string | null>(null);

  if (!isOpen || !skill) return null;

  const currentCost = bookingType === "full_course" ? fullCourseCost : perSessionCost;

  const handleConfirmBooking = () => {
    if (credits < currentCost) {
      alert(`Insufficient credits! Required: ${currentCost}, your balance: ${credits}.`);
      return;
    }

    const start = new Date(Date.now() + 86400000).toISOString();
    const end = new Date(Date.now() + 86400000 + 2700000).toISOString();

    const res = bookTeacherPackage({
      teacherId: skill.teacher.id,
      teacherName: skill.teacher.name,
      teacherAvatar: skill.teacher.avatar,
      packageId: matchedPackage?.id,
      skillName: skill.title,
      bookingType,
      creditsAmount: currentCost,
      scheduledStart: start,
      scheduledEnd: end,
    });

    if (res.success && res.roomToken) {
      setRoomToken(res.roomToken);
      setStep("CONFIRM");
      if (onSuccess) onSuccess();
    }
  };

  const handleDownloadCalendar = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SkillSwap//Credit Escrow Booking//EN
BEGIN:VEVENT
SUMMARY:SkillSwap Classroom: ${skill.title} with ${skill.teacher.name}
DESCRIPTION:1-on-1 session on SkillSwap. Credits escrowed: ${currentCost}
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:SkillSwap session starts in 15 minutes!
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `skillswap-classroom-${roomToken || "session"}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAndClose = () => {
    setStep("SELECT");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "SELECT" ? (
          <div className="space-y-5">
            {/* Modal Header */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#7C3AED] dark:text-[#A78BFA]">
                Direct Credit Marketplace Booking
              </span>
              <h3 className="text-xl font-bold text-[#18181B] dark:text-white mt-1">
                {skill.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={skill.teacher.avatar}
                  alt={skill.teacher.name}
                  className="w-5 h-5 rounded-full object-cover border border-[#E4E1F5]"
                />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Teacher: {skill.teacher.name}
                </span>
                <span className="text-xs text-zinc-400">•</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Mentor</span>
                </span>
              </div>
            </div>

            {/* Teacher Pricing Model Selector (Per Session vs Full Course Bundle) */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Select Pricing Package
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setBookingType("per_session")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    bookingType === "per_session"
                      ? "border-[#7C3AED] bg-[#EDE9FE]/50 dark:bg-[#7C3AED]/15 ring-2 ring-[#7C3AED]/30"
                      : "border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#1A1630]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18181B] dark:text-white">Single Session</span>
                    <Package className="w-4 h-4 text-[#7C3AED]" />
                  </div>
                  <div className="text-base font-extrabold text-[#7C3AED] dark:text-[#A78BFA] mt-1 font-mono">
                    🪙 {perSessionCost} Credits
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">45-min hands-on mentoring</div>
                </button>

                <button
                  type="button"
                  onClick={() => setBookingType("full_course")}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    bookingType === "full_course"
                      ? "border-[#7C3AED] bg-[#EDE9FE]/50 dark:bg-[#7C3AED]/15 ring-2 ring-[#7C3AED]/30"
                      : "border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#1A1630]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#18181B] dark:text-white">Full Course Bundle</span>
                    <Layers className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                    🪙 {fullCourseCost} Credits
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">6-session complete curriculum</div>
                </button>
              </div>
            </div>

            {/* Step 1: Date Selection */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
                <span>Select Session Date</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {AVAILABLE_DATES.map((item) => {
                  const val = `${item.label}, ${item.date}`;
                  const isSelected = selectedDate === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSelectedDate(val)}
                      className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? "border-[#7C3AED] bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] font-bold"
                          : "border-[#E4E1F5] dark:border-[#2D264E] text-zinc-700 dark:text-zinc-300 bg-[#F8F7FF] dark:bg-[#1A1630]"
                      }`}
                    >
                      <span className="text-[10px] text-zinc-400">{item.day}</span>
                      <span className="text-xs font-bold mt-0.5">{item.date.split(" ")[1]}</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Time Slot */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>Select Time Slot</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_TIMES.slice(0, 4).map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2 rounded-xl border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? "border-[#7C3AED] bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] font-bold"
                          : "border-[#E4E1F5] dark:border-[#2D264E] text-zinc-700 dark:text-zinc-300 bg-[#F8F7FF] dark:bg-[#1A1630]"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Escrow Guarantee Callout */}
            <div className="p-4 rounded-2xl bg-[#EDE9FE]/40 dark:bg-[#231C3D]/40 border border-[#E4E1F5] dark:border-[#2D264E] space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-zinc-600 dark:text-zinc-400">Total Escrow Amount:</span>
                <span className="font-bold text-[#7C3AED] dark:text-[#A78BFA] font-mono text-sm">
                  🪙 {currentCost} Credits
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Your Wallet Balance:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  🪙 {credits} Credits
                </span>
              </div>
              <div className="pt-2 border-t border-[#E4E1F5]/60 dark:border-[#2D264E]/60 flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Escrow Security Invariant:</strong> Credits are held safely upon booking and only released to the teacher when the session is marked completed in the classroom.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={credits < currentCost}
                className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#7C3AED]/20 flex items-center gap-2"
              >
                <span>Lock {currentCost} Credits & Book</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Direct Booking Confirmed • Escrow Held
              </span>
              <h3 className="text-2xl font-bold text-[#18181B] dark:text-white mt-1">
                Virtual Classroom Generated! 🎯
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {currentCost} credits locked securely in escrow.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F7FF] dark:bg-[#1A1630] border border-[#E4E1F5] dark:border-[#2D264E] text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Skill / Course:</span>
                <span className="font-bold text-[#18181B] dark:text-white">{skill.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Teacher:</span>
                <span className="font-bold text-[#18181B] dark:text-white">{skill.teacher.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Booking Mode:</span>
                <span className="font-semibold text-[#7C3AED] dark:text-[#A78BFA]">
                  {bookingType === "full_course" ? "Full Course Bundle (6 Sessions)" : "Single 45-min Session"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Scheduled Time:</span>
                <span className="font-bold text-[#18181B] dark:text-white">{selectedDate} @ {selectedTime}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-500">Credits Held in Escrow:</span>
                <span className="font-mono font-bold text-emerald-600">🪙 {currentCost} Credits</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleDownloadCalendar}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Calendar (.ics)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAndClose();
                  router.push(`/learn/${roomToken || "session-demo"}`);
                }}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Enter Session Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}