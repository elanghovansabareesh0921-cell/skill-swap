"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSkillSwap, SkillListing } from "@/context/SkillSwapContext";
import CoinIcon from "@/components/common/CoinIcon";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Download,
  Lock,
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
  { label: "Today", date: "Sep 25", day: "Thu" },
  { label: "Tomorrow", date: "Sep 26", day: "Fri" },
  { label: "Saturday", date: "Sep 27", day: "Sat" },
  { label: "Monday", date: "Sep 29", day: "Mon" },
  { label: "Tuesday", date: "Sep 30", day: "Tue" },
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
  const { credits, bookTeacherPackage } = useSkillSwap();

  // Normalize mentor prop
  const teacherName = initialSkill?.teacher?.name || mentor?.name || "Peer Mentor";
  const teacherAvatar = initialSkill?.teacher?.avatar || mentor?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
  const skillTitle = initialSkill?.title || mentor?.skillName || mentor?.skillToTeach || "1-Hour Skill Session";

  // In the 1 Hour = 10 Credits platform model, 1 session = 10 credits
  const perSessionCost = 10;

  const [selectedDate, setSelectedDate] = useState("Tomorrow, Sep 26");
  const [selectedTime, setSelectedTime] = useState("6:00 PM – 7:00 PM");
  const [step, setStep] = useState<"SELECT" | "CONFIRM">("SELECT");
  const [roomToken, setRoomToken] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirmBooking = () => {
    if (credits < perSessionCost) {
      alert(`Insufficient credits! Required: ${perSessionCost}, your balance: ${credits}.`);
      return;
    }

    const start = new Date(Date.now() + 86400000).toISOString();
    const end = new Date(Date.now() + 86400000 + 3600000).toISOString();

    const res = bookTeacherPackage({
      teacherId: mentor?.id || initialSkill?.teacher?.id || "arun-kumar",
      teacherName,
      teacherAvatar,
      skillName: skillTitle,
      bookingType: "per_session",
      creditsAmount: perSessionCost,
      scheduledStart: start,
      scheduledEnd: end,
    });

    if (res.success && res.roomToken) {
      setRoomToken(res.roomToken);
      setStep("CONFIRM");
      if (onSuccess) onSuccess();
    }
  };

  const resetAndClose = () => {
    setStep("SELECT");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#1e1938] rounded-3xl border border-[#ddd4f5] dark:border-[#362c5e] shadow-2xl p-6 sm:p-7 overflow-hidden text-[#241b3d] dark:text-[#f4f0ff]">
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-[#7a719c] hover:text-[#241b3d] dark:hover:text-white hover:bg-[#ede8fb] dark:hover:bg-[#282147] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "SELECT" ? (
          <div className="space-y-5">
            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8fb] dark:bg-[#282147] text-xs font-semibold text-[#7d6ce8] dark:text-[#ac98f2] border border-[#ddd4f5] dark:border-[#362c5e] mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#f5a524]" />
                <span>Credit Escrow · 1 Hour = 10 Credits</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
                Book 1-Hour Session
              </h3>
              <p className="text-xs text-[#7a719c] dark:text-[#a99ed4] mt-0.5">
                {skillTitle} with {teacherName}
              </p>
            </div>

            {/* Teacher Meta Pill */}
            <div className="p-3.5 rounded-2xl bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] flex items-center gap-3">
              <img
                src={teacherAvatar}
                alt={teacherName}
                className="w-10 h-10 rounded-full object-cover border border-[#ddd4f5] dark:border-[#362c5e]"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#241b3d] dark:text-[#f4f0ff]">
                    {teacherName}
                  </span>
                  <VerifiedBadge size="sm" showLabel={false} />
                </div>
                <span className="text-xs text-[#7a719c] dark:text-[#a99ed4]">
                  Verified Peer Instructor
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[#f5a524] font-mono block">
                  10 Credits
                </span>
                <span className="text-[10px] text-[#7a719c]">1 Hour</span>
              </div>
            </div>

            {/* Escrow Guarantee Highlight */}
            <div className="p-3 rounded-2xl bg-[#ede8fb]/60 dark:bg-[#282147]/60 border border-[#ddd4f5] dark:border-[#362c5e] text-xs text-[#7a719c] dark:text-[#a99ed4] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#241b3d] dark:text-[#f4f0ff]">
                <Lock className="w-3.5 h-3.5 text-[#f5a524]" />
                <span>Escrow Protection Active</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Your 10 credits are locked safely in escrow until the session is marked complete, then released to the teacher.
              </p>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7a719c] dark:text-[#a99ed4] mb-2 flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5" />
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
                      className={`p-2 rounded-2xl text-center border transition-all ${
                        isSelected
                          ? "border-[#7d6ce8] bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2] shadow-sm font-bold"
                          : "border-[#ddd4f5] dark:border-[#362c5e] bg-[#f5f2fc] dark:bg-[#130f26] text-[#7a719c] dark:text-[#a99ed4] hover:border-[#7d6ce8]"
                      }`}
                    >
                      <div className="text-[10px] uppercase">{item.day}</div>
                      <div className="text-xs font-bold mt-0.5">{item.date.split(" ")[1]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7a719c] dark:text-[#a99ed4] mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Select 1-Hour Time Slot</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {AVAILABLE_TIMES.slice(0, 4).map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`p-2.5 rounded-full text-xs font-semibold text-center border transition-all ${
                        isSelected
                          ? "border-[#7d6ce8] bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2] shadow-sm"
                          : "border-[#ddd4f5] dark:border-[#362c5e] bg-[#f5f2fc] dark:bg-[#130f26] text-[#7a719c] dark:text-[#a99ed4] hover:border-[#7d6ce8]"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Booking Footer */}
            <div className="pt-2 border-t border-[#ddd4f5] dark:border-[#362c5e] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#7a719c] dark:text-[#a99ed4] block">
                  Credits in Escrow
                </span>
                <div className="flex items-center gap-1 text-sm font-extrabold text-[#f5a524]">
                  <CoinIcon size={16} />
                  <span>10 Credits</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2.5 rounded-full border border-[#ddd4f5] dark:border-[#362c5e] text-xs font-semibold text-[#7a719c] hover:bg-[#ede8fb]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="px-6 py-2.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#f5a524]" />
                  <span>Lock 10 credits in escrow</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Confirmed View */
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
                10 credits held in escrow
              </h3>
              <p className="text-xs sm:text-sm text-[#7a719c] dark:text-[#a99ed4] mt-1 max-w-sm mx-auto">
                Your 1-hour session with {teacherName} is confirmed for {selectedDate} ({selectedTime}).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] text-xs space-y-1">
              <p className="font-semibold text-[#241b3d] dark:text-[#f4f0ff]">
                Escrow Status: Held
              </p>
              <p className="text-[#7a719c] dark:text-[#a99ed4]">
                Credits will be released to {teacherName} only once the session is marked complete.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-[#ddd4f5] dark:border-[#362c5e] text-xs font-semibold text-[#7a719c]"
              >
                Done
              </button>
              {roomToken && (
                <Link
                  href={`/learn/${roomToken}`}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Open classroom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}