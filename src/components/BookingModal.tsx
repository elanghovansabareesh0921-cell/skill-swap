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
  { label: "Today", date: "Sep 17", day: "Thu" },
  { label: "Tomorrow", date: "Sep 18", day: "Fri" },
  { label: "Saturday", date: "Sep 19", day: "Sat" },
  { label: "Monday", date: "Sep 21", day: "Mon" },
  { label: "Tuesday", date: "Sep 22", day: "Tue" },
];

const AVAILABLE_TIMES = [
  "10:00 AM – 11:00 AM",
  "2:00 PM – 3:00 PM",
  "4:30 PM – 5:30 PM",
  "6:00 PM – 7:00 PM",
  "8:00 PM – 9:00 PM",
];

export default function BookingModal({
  skill: initialSkill,
  mentor,
  isOpen = true,
  onClose,
  onSuccess,
}: BookingModalProps) {
  const router = useRouter();
  const { credits, bookSession } = useSkillSwap();

  // Normalize mentor prop to a skill if needed
  const skill: SkillListing | null = initialSkill
    ? initialSkill
    : mentor
    ? {
        id: `mentor-${mentor.id || "unknown"}`,
        title: mentor.teachSkills?.[0]?.name || mentor.name + " Mentorship",
        category: mentor.teachSkills?.[0]?.category || "General",
        description: mentor.bio || "1-on-1 mentorship session",
        level: "Intermediate",
        creditsPerSession: 10,
        durationMinutes: 60,
        rating: mentor.rating || 5.0,
        reviewCount: mentor.reviewsCount || 10,
        availability: "Available today",
        mode: "Online",
        teacher: {
          id: mentor.id || "mentor-user",
          name: mentor.name || "Mentor",
          avatar:
            mentor.avatar_url ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          role: "Expert Mentor",
          location: "Remote",
          bio: mentor.bio || "",
          rating: mentor.rating || 5.0,
          sessionsTaught: 50,
          creditsEarned: 200,
          verified: true,
        },
      }
    : null;

  const [selectedDate, setSelectedDate] = useState<string>("Today, Sep 17");
  const [selectedTime, setSelectedTime] = useState<string>("6:00 PM – 7:00 PM");
  const [step, setStep] = useState<"SELECT" | "CONFIRMED">("SELECT");
  const [bookedSessionId, setBookedSessionId] = useState<string | null>(null);

  if (!isOpen || !skill) return null;

  const handleConfirmBooking = () => {
    const res = bookSession({
      skill,
      date: selectedDate,
      time: selectedTime,
    });

    if (res.success && res.session) {
      setBookedSessionId(res.session.id);
      setStep("CONFIRMED");
      if (onSuccess) onSuccess();
    }
  };

  const handleDownloadCalendar = () => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SkillSwap//Session Booking//EN
BEGIN:VEVENT
SUMMARY:${skill.title} with ${skill.teacher.name}
DESCRIPTION:SkillSwap 1-on-1 Session for ${skill.title}. Escrow: ${skill.creditsPerSession} credits.
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `skillswap-${skill.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAndClose = () => {
    setStep("SELECT");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-200/90 shadow-2xl p-6 sm:p-7 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "SELECT" ? (
          <div>
            {/* Modal Header */}
            <div className="pr-8">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                Book a 1-on-1 Session
              </span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">
                {skill.title}
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <img
                  src={skill.teacher.avatar}
                  alt={skill.teacher.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-xs font-medium text-gray-700">
                  with {skill.teacher.name}
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500 font-mono">
                  {skill.durationMinutes} mins
                </span>
              </div>
            </div>

            {/* Step 1: Date Selection */}
            <div className="mt-6">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                Select Date
              </label>
              <div className="grid grid-cols-5 gap-2">
                {AVAILABLE_DATES.map((item) => {
                  const val = `${item.label}, ${item.date}`;
                  const isSelected = selectedDate === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSelectedDate(val)}
                      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/60 text-indigo-900 ring-1 ring-indigo-600"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                      }`}
                    >
                      <span className="text-[11px] text-gray-500 font-medium">{item.day}</span>
                      <span className="text-sm font-bold mt-0.5">{item.date.split(" ")[1]}</span>
                      <span className="text-[10px] text-gray-400 mt-0.5">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Time Slot Selection */}
            <div className="mt-5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Select Time Slot
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {AVAILABLE_TIMES.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/60 text-indigo-900 ring-1 ring-indigo-600 font-semibold"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Escrow Credit Summary Card */}
            <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200/80">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Credits required:</span>
                <span className="font-bold text-gray-900 font-mono">
                  🪙 {skill.creditsPerSession} Credits
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1.5">
                <span className="text-gray-600">Your current balance:</span>
                <span className="font-bold text-indigo-600 font-mono">
                  🪙 {credits} Credits
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200/60 flex items-start gap-2 text-xs text-gray-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Escrow Guarantee:</strong> Credits are safely locked in escrow and only released to the teacher after you mark the session complete.
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={credits < skill.creditsPerSession}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
              >
                <span>Confirm & Escrow {skill.creditsPerSession} Credits</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Screen */
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in-75 duration-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900">Session Booked 🎉</h3>
            <p className="text-sm text-gray-500 mt-1">
              Your 1-on-1 swap session is confirmed.
            </p>

            <div className="mt-6 p-5 rounded-2xl bg-gray-50 border border-gray-200/80 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Skill</span>
                <span className="text-sm font-semibold text-gray-900">{skill.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Teacher</span>
                <span className="text-sm font-semibold text-gray-900">{skill.teacher.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Scheduled Date</span>
                <span className="text-sm font-semibold text-gray-900">{selectedDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Time Slot</span>
                <span className="text-sm font-semibold text-gray-900">{selectedTime}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200/80">
                <span className="text-xs text-gray-500">Credits Escrowed</span>
                <span className="text-sm font-bold text-indigo-600 font-mono">
                  🪙 {skill.creditsPerSession} Credits
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleDownloadCalendar}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Add to Calendar (.ics)
              </button>
              <button
                type="button"
                onClick={() => {
                  resetAndClose();
                  router.push(`/learn/${bookedSessionId || "session-python-arun"}`);
                }}
                className="w-full sm:w-1/2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <span>Go to Session Room</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}