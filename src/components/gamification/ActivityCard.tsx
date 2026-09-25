"use client";

import React from "react";
import { Sparkles, Trophy, Flame, CheckCircle } from "lucide-react";
import CoinIcon from "@/components/common/CoinIcon";

export interface ActivityCardProps {
  currentLevel?: "Newcomer" | "Skill Seeker" | "Connector" | "Mentor" | "Guru";
  learningHours?: number;
  teachingHours?: number;
  badges?: {
    goodStart?: boolean;
    firstSwap?: boolean;
    streak7Days?: boolean;
  };
  compact?: boolean;
}

export default function ActivityCard({
  currentLevel = "Connector",
  learningHours = 14,
  teachingHours = 18,
  badges = {
    goodStart: true,
    firstSwap: true,
    streak7Days: false,
  },
  compact = false,
}: ActivityCardProps) {
  const totalHours = learningHours + teachingHours;

  // Level Progression: Newcomer -> Skill Seeker -> Connector -> Mentor -> Guru
  const levels = ["Newcomer", "Skill Seeker", "Connector", "Mentor", "Guru"];
  const currentIdx = levels.indexOf(currentLevel);
  const nextLevel = currentIdx < levels.length - 1 ? levels[currentIdx + 1] : "Max Level";
  const progressPercent = Math.min(100, Math.round((teachingHours / 25) * 100));

  // SVG Ring Chart Calculations
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const learnFraction = totalHours > 0 ? learningHours / totalHours : 0.5;
  const teachFraction = totalHours > 0 ? teachingHours / totalHours : 0.5;

  const learnStroke = learnFraction * circumference;
  const teachStroke = teachFraction * circumference;

  return (
    <div className="border-2 border-black bg-[#181B22] p-6 sm:p-7 shadow-[6px_6px_0px_0px_#FFE600] transition-colors duration-200">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Level Progression */}
        <div className="flex-1 space-y-3 min-w-[260px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-black tracking-wider text-zinc-400">
                Current Level
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 border-2 border-black bg-[#FFE600] text-black text-xs font-black uppercase shadow-[2px_2px_0px_0px_#000000]">
                <Sparkles className="w-3 h-3" />
                {currentLevel}
              </span>
            </div>
            <span className="text-xs text-zinc-400 font-bold font-mono">
              NEXT: <strong className="text-white uppercase font-black">{nextLevel}</strong>
            </span>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 border-2 border-black bg-[#12141C] overflow-hidden">
              <div
                className="h-full bg-[#FFE600] border-r-2 border-black transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono font-bold">
              <span>{teachingHours} hrs taught</span>
              <span>{25} hrs to {nextLevel} ({progressPercent}%)</span>
            </div>
          </div>

          {/* Economic Rule Tag */}
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-[#FFE600]">
            <CoinIcon size={14} />
            <span>1 Hour = 10 Credits · Peer Verified</span>
          </div>
        </div>

        {/* Center: Ring Chart (Learning vs Teaching Hours) */}
        <div className="flex items-center gap-5 border-t-2 lg:border-t-0 lg:border-l-2 border-black pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto justify-between lg:justify-start">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#12141C"
                strokeWidth="12"
              />
              {/* Teaching Ring segment (#FFE600) */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#FFE600"
                strokeWidth="12"
                strokeDasharray={`${teachStroke} ${circumference}`}
                strokeDashoffset="0"
              />
              {/* Learning Ring segment (#38BDF8) */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="12"
                strokeDasharray={`${learnStroke} ${circumference}`}
                strokeDashoffset={`-${teachStroke}`}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-black text-white font-mono leading-none">
                {totalHours}h
              </span>
              <span className="text-[10px] text-zinc-400 font-black uppercase leading-tight">
                Total
              </span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 border border-black bg-[#FFE600] shrink-0" />
              <span className="text-white font-black uppercase">{teachingHours}h Teaching</span>
              <span className="text-[#FFE600] font-mono font-bold">({teachingHours * 10}c)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 border border-black bg-[#38BDF8] shrink-0" />
              <span className="text-white font-black uppercase">{learningHours}h Learning</span>
              <span className="text-[#38BDF8] font-mono font-bold">({learningHours * 10}c)</span>
            </div>
          </div>
        </div>

        {/* Right: Three Achievement Badges */}
        <div className="border-t-2 lg:border-t-0 lg:border-l-2 border-black pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto">
          <span className="text-xs uppercase font-black tracking-wider text-zinc-400 block mb-2.5">
            Achievements
          </span>
          <div className="flex items-center gap-3">
            {/* Badge 1: Good Start */}
            <div
              className={`flex flex-col items-center text-center p-2.5 border-2 border-black transition-all ${
                badges.goodStart
                  ? "bg-[#A3E635] text-black shadow-[3px_3px_0px_0px_#000000]"
                  : "bg-[#12141C] border-dashed border-zinc-700 text-zinc-500 opacity-50"
              }`}
              title={badges.goodStart ? "Good Start: Profile complete & first skill listed" : "Locked"}
            >
              <div className="w-7 h-7 border border-black flex items-center justify-center bg-black text-[#A3E635] mb-1">
                <CheckCircle className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-[11px] font-black uppercase">Good Start</span>
              <span className="text-[9px] font-mono font-bold uppercase">Earned</span>
            </div>

            {/* Badge 2: First Swap */}
            <div
              className={`flex flex-col items-center text-center p-2.5 border-2 border-black transition-all ${
                badges.firstSwap
                  ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000]"
                  : "bg-[#12141C] border-dashed border-zinc-700 text-zinc-500 opacity-50"
              }`}
              title={badges.firstSwap ? "First Swap: Successfully conducted a skill exchange" : "Locked"}
            >
              <div className="w-7 h-7 border border-black flex items-center justify-center bg-black text-[#FFE600] mb-1">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black uppercase">First Swap</span>
              <span className="text-[9px] font-mono font-bold uppercase">Earned</span>
            </div>

            {/* Badge 3: 7-Day Streak */}
            <div
              className={`flex flex-col items-center text-center p-2.5 border-2 border-black transition-all ${
                badges.streak7Days
                  ? "bg-[#FF5E7E] text-black shadow-[3px_3px_0px_0px_#000000]"
                  : "bg-[#12141C] border-dashed border-zinc-700 text-zinc-500 opacity-50"
              }`}
              title={badges.streak7Days ? "7-Day Streak: Swapped skills 7 days in a row" : "In Progress: 4/7 days active"}
            >
              <div className="w-7 h-7 border border-black flex items-center justify-center bg-black text-zinc-400 mb-1">
                <Flame className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-black uppercase">7-Day Streak</span>
              <span className="text-[9px] font-mono font-bold uppercase">4/7 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
