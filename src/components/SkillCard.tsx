"use client";

import React from "react";
import Link from "next/link";
import { useSkillSwap, SkillListing } from "@/context/SkillSwapContext";
import { Star, Heart, Clock, ArrowRight, ShieldCheck, Repeat } from "lucide-react";

interface SkillCardProps {
  skill: SkillListing;
  onBookClick?: (skill: SkillListing) => void;
}

export default function SkillCard({ skill, onBookClick }: SkillCardProps) {
  const { savedSkillIds, toggleFavorite } = useSkillSwap();
  const isFavorite = savedSkillIds.includes(skill.id);

  return (
    <div className="group relative bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#A78BFA] transition-all duration-200 flex flex-col justify-between p-5 overflow-hidden">
      {/* Top Bar: Teacher Avatar, Teacher Name, Category Pill, Wishlist Button */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <Link
            href={`/profile/${skill.teacher.id}`}
            className="flex items-center gap-2.5 group/teacher hover:opacity-90 transition-opacity"
          >
            <div className="relative">
              <img
                src={skill.teacher.avatar}
                alt={skill.teacher.name}
                className="w-10 h-10 rounded-full object-cover border border-[#E4E1F5] dark:border-[#2D264E]"
              />
              {skill.teacher.verified && (
                <div
                  title="Verified Teacher"
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#7C3AED] rounded-full flex items-center justify-center text-white ring-2 ring-white dark:ring-[#161327]"
                >
                  <ShieldCheck className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[#18181B] dark:text-white group-hover/teacher:text-[#7C3AED] dark:group-hover/teacher:text-[#A78BFA] transition-colors">
                {skill.teacher.name}
              </h4>
              <p className="text-[11px] text-[#71717A] dark:text-zinc-400 truncate max-w-[140px]">
                {skill.teacher.role}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-[10px] font-semibold tracking-tight">
              {skill.category}
            </span>
            <button
              onClick={() => toggleFavorite(skill.id)}
              aria-label={isFavorite ? "Remove from wishlist" : "Save to wishlist"}
              className="p-1.5 rounded-full text-[#71717A] hover:text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-150 ${
                  isFavorite ? "text-red-500 fill-red-500 scale-110" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Skill Title & Short Description */}
        <div className="mt-3.5">
          <Link href={`/profile/${skill.teacher.id}`}>
            <h3 className="text-base font-bold text-[#18181B] dark:text-white leading-snug group-hover:text-[#7C3AED] dark:group-hover:text-[#A78BFA] transition-colors line-clamp-1">
              {skill.title}
            </h3>
          </Link>
          <p className="text-xs text-[#71717A] dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
            {skill.description}
          </p>
        </div>

        {/* Metadata Badges: Level, Rating, Availability */}
        <div className="mt-4 pt-3 border-t border-[#E4E1F5] dark:border-[#2D264E] flex flex-wrap items-center gap-2 text-xs">
          {/* Skill Level */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] text-[11px] font-medium text-[#71717A] dark:text-zinc-300">
            {skill.level}
          </span>

          {/* Rating */}
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#18181B] dark:text-zinc-200">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{skill.rating}</span>
            <span className="text-[#71717A] dark:text-zinc-500 font-normal">({skill.reviewCount})</span>
          </div>

          {/* Availability */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium ml-auto ${
              skill.availability === "Available today"
                ? "text-emerald-700 dark:text-emerald-400 font-semibold"
                : "text-[#71717A] dark:text-zinc-400"
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>{skill.availability}</span>
          </span>
        </div>
      </div>

      {/* Bottom Bar: Credits cost & Swap/Book action */}
      <div className="mt-4 pt-3 border-t border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between">
        <div>
          <span className="text-xs font-mono font-bold text-[#7C3AED] dark:text-[#A78BFA]">
            🪙 {skill.creditsPerSession} Credits
          </span>
          <span className="text-[10px] text-[#71717A] block">/ 60 mins</span>
        </div>

        <button
          onClick={() => onBookClick && onBookClick(skill)}
          className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
        >
          <span>Swap Skill</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
