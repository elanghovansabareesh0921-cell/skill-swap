"use client";

import React, { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import SkillCard from "@/components/SkillCard";
import BookingModal from "@/components/BookingModal";
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
} from "lucide-react";

const CATEGORIES = [
  "All",
  "Programming",
  "AI & ML",
  "Design",
  "Business",
  "Languages",
  "Music",
  "Fitness",
  "Photography",
  "Academics",
  "Other",
];

export default function DiscoverPage() {
  const { skills } = useSkillSwap();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [levelFilter, setLevelFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [creditsFilter, setCreditsFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");
  const [onlineOnly, setOnlineOnly] = useState(false);

  const [bookingSkill, setBookingSkill] = useState<SkillListing | null>(null);
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
        if (levelFilter === "Intermediate" && item.level !== "Intermediate" && item.level !== "All Levels") return false;
        if (levelFilter === "Advanced" && item.level !== "Advanced" && item.level !== "All Levels") return false;
      }

      // Rating filter
      if (ratingFilter === "4.5+" && item.rating < 4.5) return false;
      if (ratingFilter === "4.8+" && item.rating < 4.8) return false;

      // Credits filter
      if (creditsFilter === "Under 10" && item.creditsPerSession >= 10) return false;
      if (creditsFilter === "10–12" && (item.creditsPerSession < 10 || item.creditsPerSession > 12)) return false;
      if (creditsFilter === "15+" && item.creditsPerSession < 15) return false;

      // Availability filter
      if (availabilityFilter === "Available today" && item.availability !== "Available today") return false;
      if (availabilityFilter === "Available this week" && item.availability === "Flexible") return false;

      // Online toggle
      if (onlineOnly && item.mode !== "Online" && item.mode !== "Both") return false;

      return true;
    });
  }, [
    skills,
    searchQuery,
    selectedCategory,
    levelFilter,
    ratingFilter,
    creditsFilter,
    availabilityFilter,
    onlineOnly,
  ]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setLevelFilter("All");
    setRatingFilter("All");
    setCreditsFilter("All");
    setAvailabilityFilter("All");
    setOnlineOnly(false);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "All" ||
    levelFilter !== "All" ||
    ratingFilter !== "All" ||
    creditsFilter !== "All" ||
    availabilityFilter !== "All" ||
    onlineOnly;

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Top Header & Search Area */}
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            What do you want to learn?
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-2">
            Discover peer mentors, explore topics, and exchange skills through credits.
          </p>

          {/* Large Search Bar */}
          <div className="relative mt-6 shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search skills, topics, or people..."
              className="w-full pl-12 pr-10 py-3.5 bg-white rounded-2xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Chips Carousel / Row */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? "bg-gray-900 text-white shadow-sm font-semibold"
                    : "bg-white text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filters Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-gray-200/90 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Level Select */}
            <div className="relative">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200/90 rounded-xl px-3 py-1.5 pr-7 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:outline-none cursor-pointer"
              >
                <option value="All">Level: All</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Rating Select */}
            <div className="relative">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200/90 rounded-xl px-3 py-1.5 pr-7 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:outline-none cursor-pointer"
              >
                <option value="All">Rating: All</option>
                <option value="4.5+">★ 4.5 & up</option>
                <option value="4.8+">★ 4.8 & up</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Credits Select */}
            <div className="relative">
              <select
                value={creditsFilter}
                onChange={(e) => setCreditsFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200/90 rounded-xl px-3 py-1.5 pr-7 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:outline-none cursor-pointer"
              >
                <option value="All">Credits: All</option>
                <option value="Under 10">Under 10 credits</option>
                <option value="10–12">10–12 credits</option>
                <option value="15+">15+ credits</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Availability Select */}
            <div className="relative">
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200/90 rounded-xl px-3 py-1.5 pr-7 text-xs font-medium text-gray-700 hover:bg-gray-100 focus:outline-none cursor-pointer"
              >
                <option value="All">Availability: All</option>
                <option value="Available today">Available today</option>
                <option value="Available this week">This week</option>
              </select>
              <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Online / Offline Toggle */}
            <button
              type="button"
              onClick={() => setOnlineOnly(!onlineOnly)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                onlineOnly
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold"
                  : "bg-gray-50 border-gray-200/90 text-gray-700 hover:bg-gray-100"
              }`}
            >
              Online Only
            </button>
          </div>

          {/* Reset Filters & Results Count */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>
              Showing <strong>{filteredSkills.length}</strong> skill
              {filteredSkills.length === 1 ? "" : "s"}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Skill Cards Grid */}
        <div className="mt-8">
          {filteredSkills.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onBookClick={(s) => setBookingSkill(s)}
                />
              ))}
            </div>
          ) : (
            /* Friendly Empty State */
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-gray-200/80 shadow-sm max-w-lg mx-auto">
              <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">No matching skills found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                We couldn&apos;t find any sessions matching your active search and filter criteria.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 px-4 py-2 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      <BookingModal
        skill={bookingSkill}
        isOpen={!!bookingSkill}
        onClose={() => setBookingSkill(null)}
      />

      {/* Buy Credits Modal */}
      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </div>
  );
}
