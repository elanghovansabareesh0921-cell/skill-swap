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
  ArrowRight,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg border-2 border-black bg-[#181B22] shadow-[8px_8px_0px_0px_#FFE600] p-6 sm:p-7 overflow-hidden text-white">
        {/* Close Button */}
        <button
          onClick={resetAndClose}
          className="absolute top-5 right-5 p-1.5 border border-black bg-[#12141C] text-zinc-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {step === "SELECT" ? (
          <div className="space-y-5">
            {/* Modal Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-[#12141C] text-[#FFE600] text-xs font-black uppercase shadow-[2px_2px_0px_0px_#FFE600] mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFE600]" />
                <span>Credit Escrow · 1 Hour = 10 Credits</span>
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-tight">
                Book 1-Hour Session
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">
                {skillTitle} with {teacherName}
              </p>
            </div>

            {/* Teacher Meta Pill */}
            <div className="p-3.5 border-2 border-black bg-[#12141C] flex items-center gap-3">
              <img
                src={teacherAvatar}
                alt={teacherName}
                className="w-10 h-10 object-cover border-2 border-black"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black uppercase text-white">
                    {teacherName}
                  </span>
                  <VerifiedBadge size="sm" showLabel={false} />
                </div>
                <span className="text-xs text-zinc-400 font-mono">
                  Verified Peer Instructor
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-[#FFE600] font-mono block">
                  10 Credits
                </span>
                <span className="text-[10px] text-zinc-400 uppercase font-mono font-bold">1 Hour</span>
              </div>
            </div>

            {/* Escrow Guarantee Highlight */}
            <div className="p-3 border-2 border-black bg-[#12141C] text-xs text-zinc-300 space-y-1 shadow-[2px_2px_0px_0px_#FFE600]">
              <div className="flex items-center gap-1.5 font-black uppercase text-white">
                <Lock className="w-3.5 h-3.5 text-[#FFE600]" />
                <span>Escrow Protection Active</span>
              </div>
              <p className="text-[11px] leading-relaxed font-mono">
                Your 10 credits are locked safely in escrow until the session is marked complete, then released to the teacher.
              </p>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
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
                      className={`p-2 text-center border-2 border-black transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000000] font-black"
                          : "bg-[#12141C] text-zinc-300 hover:border-[#FFE600]"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold">{item.day}</div>
                      <div className="text-xs font-black mt-0.5 font-mono">{item.date.split(" ")[1]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-2 flex items-center gap-1.5">
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
                      className={`p-2.5 border-2 border-black text-xs font-black uppercase text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#FFE600] text-black shadow-[2px_2px_0px_0px_#000000]"
                          : "bg-[#12141C] text-zinc-300 hover:border-[#FFE600]"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Booking Footer */}
            <div className="pt-2 border-t-2 border-black flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-400 block">
                  Credits in Escrow
                </span>
                <div className="flex items-center gap-1 text-sm font-black font-mono text-[#FFE600]">
                  <CoinIcon size={16} />
                  <span>10 Credits</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2.5 border-2 border-black bg-[#12141C] text-xs font-black uppercase text-zinc-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="px-6 py-2.5 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Lock 10 credits</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Step 2: Confirmed View */
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 border-2 border-black bg-[#A3E635] text-black flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#000000]">
              <CheckCircle2 className="w-8 h-8 stroke-[3]" />
            </div>

            <div>
              <h3 className="text-xl font-black uppercase text-white">
                10 credits held in escrow
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-sm mx-auto font-medium">
                Your 1-hour session with {teacherName} is confirmed for {selectedDate} ({selectedTime}).
              </p>
            </div>

            <div className="p-4 border-2 border-black bg-[#12141C] text-xs space-y-1 font-mono">
              <p className="font-black uppercase text-[#FFE600]">
                Escrow Status: Held
              </p>
              <p className="text-zinc-400">
                Credits will be released to {teacherName} only once the session is marked complete.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="w-full sm:w-auto px-5 py-2.5 border-2 border-black bg-[#12141C] text-xs font-black uppercase text-zinc-300"
              >
                Done
              </button>
              {roomToken && (
                <Link
                  href={`/learn/${roomToken}`}
                  className="w-full sm:w-auto px-6 py-2.5 border-2 border-black bg-[#FFE600] text-black text-xs font-black uppercase flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_#000000]"
                >
                  <span>Open classroom</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}