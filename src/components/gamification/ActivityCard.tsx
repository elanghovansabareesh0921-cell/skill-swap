"use client";

import React from "react";
import { Sparkles, Trophy, Flame, CheckCircle, ArrowRight } from "lucide-react";
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
  // Total circumference = 2 * PI * r
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const learnFraction = totalHours > 0 ? learningHours / totalHours : 0.5;
  const teachFraction = totalHours > 0 ? teachingHours / totalHours : 0.5;

  const learnStroke = learnFraction * circumference;
  const teachStroke = teachFraction * circumference;

  return (
    <div className="rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-6 sm:p-7 transition-colors duration-200">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left: Level Progression */}
        <div className="flex-1 space-y-3 min-w-[260px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider text-[#7a719c] dark:text-[#a99ed4]">
                Current Level
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2] text-xs font-bold border border-[#ddd4f5] dark:border-[#362c5e]">
                <Sparkles className="w-3 h-3" />
                {currentLevel}
              </span>
            </div>
            <span className="text-xs text-[#7a719c] dark:text-[#a99ed4] font-medium">
              Next: <strong className="text-[#241b3d] dark:text-[#f4f0ff]">{nextLevel}</strong>
            </span>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-2 rounded-full bg-[#eae4f8] dark:bg-[#241c40] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#7d6ce8] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#7a719c] dark:text-[#a99ed4]">
              <span>{teachingHours} hrs taught</span>
              <span>{25} hrs to {nextLevel} ({progressPercent}%)</span>
            </div>
          </div>

          {/* Economic Rule Tag */}
          <div className="inline-flex items-center gap-1.5 text-xs text-[#7a719c] dark:text-[#a99ed4]">
            <CoinIcon size={14} />
            <span>1 Hour = 10 Credits · Peer Verified</span>
          </div>
        </div>

        {/* Center: Ring Chart (Learning vs Teaching Hours) */}
        <div className="flex items-center gap-5 border-t lg:border-t-0 lg:border-l border-[#ddd4f5] dark:border-[#362c5e] pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto justify-between lg:justify-start">
          <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background Ring */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-[#eae4f8] dark:text-[#241c40]"
              />
              {/* Teaching Ring segment (#7d6ce8) */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#7d6ce8"
                strokeWidth="10"
                strokeDasharray={`${teachStroke} ${circumference}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              {/* Learning Ring segment (#ac98f2) */}
              <circle
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke="#ac98f2"
                strokeWidth="10"
                strokeDasharray={`${learnStroke} ${circumference}`}
                strokeDashoffset={`-${teachStroke}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-extrabold text-[#241b3d] dark:text-[#f4f0ff] leading-none">
                {totalHours}h
              </span>
              <span className="text-[10px] text-[#7a719c] dark:text-[#a99ed4] font-medium leading-tight">
                Total
              </span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7d6ce8] shrink-0" />
              <span className="text-[#241b3d] dark:text-[#f4f0ff] font-semibold">{teachingHours}h Teaching</span>
              <span className="text-[#7a719c] dark:text-[#a99ed4]">({teachingHours * 10}c earned)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ac98f2] shrink-0" />
              <span className="text-[#241b3d] dark:text-[#f4f0ff] font-semibold">{learningHours}h Learning</span>
              <span className="text-[#7a719c] dark:text-[#a99ed4]">({learningHours * 10}c spent)</span>
            </div>
          </div>
        </div>

        {/* Right: Three Achievement Badges */}
        <div className="border-t lg:border-t-0 lg:border-l border-[#ddd4f5] dark:border-[#362c5e] pt-4 lg:pt-0 lg:pl-6 w-full lg:w-auto">
          <span className="text-xs uppercase font-bold tracking-wider text-[#7a719c] dark:text-[#a99ed4] block mb-2.5">
            Achievements
          </span>
          <div className="flex items-center gap-3">
            {/* Badge 1: Good Start */}
            <div
              className={`flex flex-col items-center text-center p-2.5 rounded-2xl border transition-all ${
                badges.goodStart
                  ? "bg-[#ede8fb] dark:bg-[#282147] border-[#ddd4f5] dark:border-[#362c5e] text-[#7d6ce8] dark:text-[#ac98f2]"
                  : "bg-transparent border-dashed border-[#ddd4f5] dark:border-[#362c5e] text-[#7a719c] opacity-50"
              }`}
              title={badges.goodStart ? "Good Start: Profile complete & first skill listed" : "Locked"}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1e1938] shadow-sm mb-1">
                <CheckCircle className="w-4 h-4 text-[#7d6ce8]" />
              </div>
              <span className="text-[11px] font-bold">Good Start</span>
              <span className="text-[9px] text-[#7a719c] dark:text-[#a99ed4]">Earned</span>
            </div>

            {/* Badge 2: First Swap */}
            <div
              className={`flex flex-col items-center text-center p-2.5 rounded-2xl border transition-all ${
                badges.firstSwap
                  ? "bg-[#ede8fb] dark:bg-[#282147] border-[#ddd4f5] dark:border-[#362c5e] text-[#7d6ce8] dark:text-[#ac98f2]"
                  : "bg-transparent border-dashed border-[#ddd4f5] dark:border-[#362c5e] text-[#7a719c] opacity-50"
              }`}
              title={badges.firstSwap ? "First Swap: Successfully conducted a skill exchange" : "Locked"}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1e1938] shadow-sm mb-1">
                <Trophy className="w-4 h-4 text-[#f5a524]" />
              </div>
              <span className="text-[11px] font-bold">First Swap</span>
              <span className="text-[9px] text-[#7a719c] dark:text-[#a99ed4]">Earned</span>
            </div>

            {/* Badge 3: 7-Day Streak */}
            <div
              className={`flex flex-col items-center text-center p-2.5 rounded-2xl border transition-all ${
                badges.streak7Days
                  ? "bg-[#ede8fb] dark:bg-[#282147] border-[#ddd4f5] dark:border-[#362c5e] text-[#7d6ce8] dark:text-[#ac98f2]"
                  : "bg-transparent border-dashed border-[#ddd4f5] dark:border-[#362c5e] text-[#7a719c] dark:text-[#a99ed4] opacity-50"
              }`}
              title={badges.streak7Days ? "7-Day Streak: Swapped skills 7 days in a row" : "In Progress: 4/7 days active"}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white dark:bg-[#1e1938] shadow-sm mb-1">
                <Flame className="w-4 h-4 text-[#7a719c] dark:text-[#a99ed4]" />
              </div>
              <span className="text-[11px] font-bold">7-Day Streak</span>
              <span className="text-[9px] text-[#7a719c] dark:text-[#a99ed4]">4/7 days</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
