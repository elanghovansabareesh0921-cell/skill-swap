"use client";

import React from "react";
import Link from "next/link";
import { useSkillSwap, SkillListing } from "@/context/SkillSwapContext";
import { Star, Heart, Clock, ArrowRight, ShieldCheck } from "lucide-react";

interface SkillCardProps {
  skill: SkillListing;
  onBookClick?: (skill: SkillListing) => void;
}

export default function SkillCard({ skill, onBookClick }: SkillCardProps) {
  const { savedSkillIds, toggleFavorite } = useSkillSwap();
  const isFavorite = savedSkillIds.includes(skill.id);

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:-translate-y-1 hover:border-gray-300/80 transition-all duration-200 flex flex-col justify-between p-5 overflow-hidden">
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
                className="w-10 h-10 rounded-full object-cover border border-gray-100 ring-1 ring-gray-100"
              />
              {skill.teacher.verified && (
                <div
                  title="Verified Teacher"
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-indigo-600 rounded-full flex items-center justify-center text-white ring-2 ring-white"
                >
                  <ShieldCheck className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <div>
              <h4 className="text-xs font-semibold text-gray-900 group-hover/teacher:text-indigo-600 transition-colors">
                {skill.teacher.name}
              </h4>
              <p className="text-[11px] text-gray-500 truncate max-w-[140px]">
                {skill.teacher.role}
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-gray-100/90 text-gray-600 text-[10px] font-medium tracking-tight">
              {skill.category}
            </span>
            <button
              onClick={() => toggleFavorite(skill.id)}
              aria-label={isFavorite ? "Remove from wishlist" : "Save to wishlist"}
              className="p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-gray-50 transition-colors"
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
            <h3 className="text-base font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-1">
              {skill.title}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
            {skill.description}
          </p>
        </div>

        {/* Metadata Badges: Level, Rating, Availability */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2 text-xs">
          {/* Skill Level */}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200/60 text-[11px] font-medium text-gray-600">
            {skill.level}
          </span>

          {/* Rating */}
          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-800">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{skill.rating}</span>
            <span className="text-gray-400 font-normal">({skill.reviewCount})</span>
          </div>

          {/* Availability */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-medium ml-auto ${
              skill.availability === "Available today"
                ? "text-emerald-700 font-semibold"
                : "text-gray-500"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                skill.availability === "Available today" ? "bg-emerald-500" : "bg-gray-400"
              }`}
            />
            {skill.availability}
          </span>
        </div>
      </div>

      {/* Footer: Credits & CTAs */}
      <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-sm font-bold text-gray-900 font-mono">
            <span>🪙 {skill.creditsPerSession}</span>
            <span className="text-xs text-gray-500 font-sans font-normal">credits</span>
          </div>
          <span className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {skill.durationMinutes} min session
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            href={`/profile/${skill.teacher.id}`}
            className="px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors"
          >
            View Profile
          </Link>
          <button
            type="button"
            onClick={() => onBookClick && onBookClick(skill)}
            className="px-3.5 py-1.5 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors shadow-sm flex items-center gap-1"
          >
            <span>Book</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
