"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SwapRequestModal from "@/components/SwapRequestModal";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap, SkillListing } from "@/context/SkillSwapContext";
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  Filter,
  Check,
  ChevronDown,
  Star,
  Repeat,
  Compass,
  Users,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Programming",
  "Design",
  "AI & ML",
  "Business",
  "Languages",
  "Media & Video",
  "Photography",
  "Communication",
  "Engineering & CAD",
  "Music",
];

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const { skills } = useSkillSwap();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [modeFilter, setModeFilter] = useState<"ALL" | "TEACHING" | "LEARNING">("ALL");

  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedTargetUser, setSelectedTargetUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
    skillToTeach: string;
  }>({
    id: "arun-kumar",
    name: "Arun Kumar",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    skillToTeach: "Python Programming",
  });
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);

  // Filtering Logic
  const filteredSkills = useMemo(() => {
    return skills.filter((item) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesTeacher = item.teacher.name.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTeacher && !matchesCategory && !matchesDesc) {
          return false;
        }
      }

      // Category chip
      if (selectedCategory !== "All" && item.category !== selectedCategory) {
        return false;
      }

      // Level filter
      if (levelFilter !== "All") {
        if (levelFilter === "Beginner" && item.level !== "Beginner" && item.level !== "All Levels") return false;
        if (levelFilter === "Intermediate" && item.level !== "Intermediate") return false;
        if (levelFilter === "Advanced" && item.level !== "Advanced") return false;
      }

      // Availability filter
      if (availabilityFilter !== "All" && item.availability !== availabilityFilter) {
        return false;
      }

      return true;
    });
  }, [skills, searchQuery, selectedCategory, levelFilter, availabilityFilter]);

  const handleOpenSwap = (skill: SkillListing) => {
    setSelectedTargetUser({
      id: skill.teacher.id,
      name: skill.teacher.name,
      avatar: skill.teacher.avatar,
      skillToTeach: skill.title,
    });
    setSwapModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Discover Knowledge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#18181B] dark:text-white tracking-tight">
            Explore Skills
          </h1>
          <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 mt-1">
            Browse skills offered by peer practitioners, filter by category or level, and propose a swap.
          </p>
        </div>

        {/* Large Search Field */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#71717A] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skills, topics, or mentors (e.g. Python, Figma, Spanish)..."
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-sm text-[#18181B] dark:text-white placeholder-[#71717A] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#18181B]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-[#7C3AED] text-white shadow-sm"
                    : "bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-[#71717A] dark:text-zinc-300 hover:border-[#A78BFA]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Additional Filters: Level, Availability, Mode */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[#71717A] font-medium">Level:</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#71717A] font-medium">Availability:</span>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
              >
                <option value="All">Anytime</option>
                <option value="Available today">Available today</option>
                <option value="Available this week">Available this week</option>
              </select>
            </div>
          </div>

          <div className="text-xs font-semibold text-[#71717A] dark:text-zinc-400">
            Showing <span className="text-[#7C3AED] dark:text-[#A78BFA] font-bold">{filteredSkills.length}</span> available skills
          </div>
        </div>

        {/* Skill Cards Grid */}
        {filteredSkills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((item) => (
              <div
                key={item.id}
                className="p-6 rounded-3xl bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] hover:border-[#A78BFA] hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Category & Teacher */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-semibold">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                      <span className="text-[#71717A] font-normal">({item.reviewCount})</span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#18181B] dark:text-white group-hover:text-[#7C3AED] dark:group-hover:text-[#A78BFA] transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {/* Level & Teachers Count */}
                  <div className="flex items-center gap-3 text-xs text-[#71717A] dark:text-zinc-400 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <span className="font-semibold text-[#18181B] dark:text-zinc-200">
                      {item.level}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#7C3AED]" />
                      <span>{item.teacher.sessionsTaught}+ people taught</span>
                    </span>
                  </div>

                  {/* Teacher Info */}
                  <Link
                    href={`/profile/${item.teacher.id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={item.teacher.avatar}
                      alt={item.teacher.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E4E1F5]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#18181B] dark:text-white truncate">
                        {item.teacher.name}
                      </p>
                      <p className="text-[11px] text-[#71717A] dark:text-zinc-400 truncate">
                        {item.teacher.role}
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#7C3AED] dark:text-[#A78BFA]">
                    🪙 {item.creditsPerSession} Credits / session
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/${item.teacher.id}`}
                      className="px-3 py-1.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-[#71717A] dark:text-zinc-300 transition-colors"
                    >
                      View Skill
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenSwap(item)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Swap</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#18181B] dark:text-white">
              No skills match your search
            </h3>
            <p className="text-xs sm:text-sm text-[#71717A] dark:text-zinc-400 max-w-sm mx-auto">
              Try adjusting your search query, removing category filters, or exploring all levels.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setLevelFilter("All");
              }}
              className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white text-xs font-semibold hover:bg-[#6D28D9] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      <SwapRequestModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        targetUser={selectedTargetUser}
      />

      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </div>
  );
}

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DiscoverContent />
    </Suspense>
  );
}
