"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SwapRequestModal from "@/components/SwapRequestModal";
import BookingModal from "@/components/BookingModal";
import CoinIcon from "@/components/common/CoinIcon";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  Search,
  Sparkles,
  Star,
  Repeat,
  Compass,
  Users,
  ShieldCheck,
  CheckCircle,
  X,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  "All",
  "Tech",
  "Design",
  "Career",
  "Creative",
  "Language",
  "Music",
  "Business",
];

const EXPLORE_PEERS = [
  {
    id: "arun-kumar",
    name: "Arun Kumar",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    rating: "4.9",
    category: "Tech",
    teaches: "Python & Machine Learning",
    wants: "React & Next.js",
    verified: true,
    bio: "Senior engineer building AI pipelines. Eager to master modern Next.js frontend state.",
  },
  {
    id: "elena-rostova",
    name: "Elena Rostova",
    avatar:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    rating: "5.0",
    category: "Design",
    teaches: "UI/UX Design Systems in Figma",
    wants: "TypeScript & Web Architecture",
    verified: true,
    bio: "Design systems architect specializing in auto-layout, tokens, and micro-interactions.",
  },
  {
    id: "marcus-chen",
    name: "Marcus Chen",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: "4.9",
    category: "Tech",
    teaches: "Docker & Kubernetes Architecture",
    wants: "UI/UX Design in Figma",
    verified: true,
    bio: "DevOps lead with 6 years containerizing large services. Looking for product design critiques.",
  },
  {
    id: "sophia-rivera",
    name: "Sophia Rivera",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    rating: "4.8",
    category: "Language",
    teaches: "Conversational Spanish & Idioms",
    wants: "Web Development",
    verified: false,
    bio: "Native Spanish educator with immersive conversation practice for travelers and pros.",
  },
  {
    id: "david-kim",
    name: "David Kim",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: "4.9",
    category: "Creative",
    teaches: "Video Editing in Premiere & DaVinci",
    wants: "Audio Mixing in Ableton",
    verified: true,
    bio: "Documentary editor crafting cinematic cuts and dynamic color-grading workflows.",
  },
  {
    id: "priya-patel",
    name: "Priya Patel",
    avatar:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: "5.0",
    category: "Career",
    teaches: "Product Management Case Prep",
    wants: "SQL & Data Analytics",
    verified: true,
    bio: "Group PM guiding aspiring tech leaders through product sense and metrics frameworks.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedPeer, setSelectedPeer] = useState<any>(EXPLORE_PEERS[0]);

  const filteredPeers = useMemo(() => {
    return EXPLORE_PEERS.filter((peer) => {
      const matchesCategory =
        selectedCategory === "All" || peer.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        peer.name.toLowerCase().includes(q) ||
        peer.teaches.toLowerCase().includes(q) ||
        peer.wants.toLowerCase().includes(q) ||
        peer.bio.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleOpenSwap = (peer: any) => {
    setSelectedPeer(peer);
    setSwapModalOpen(true);
  };

  const handleOpenBooking = (peer: any) => {
    setSelectedPeer(peer);
    setBookingModalOpen(true);
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      {/* ── HEADER & SEARCH ── */}
      <div className="space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border-white/10 text-xs font-semibold text-white/80 mb-3 shadow-inner">
            <CoinIcon size={13} />
            <span className="bg-gradient-to-r from-violet-300 via-white to-cyan-300 bg-clip-text text-transparent">
              1 Hour = 10 Credits · Direct Swaps & Credit Escrow
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Explore <span className="text-gradient">peer skills</span>
          </h1>
          <p className="text-sm text-white/50 mt-2 max-w-2xl">
            Discover verified creators and developers ready to exchange skills directly or teach for credits with zero platform tax.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative group max-w-3xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-600/20 to-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-white/40 absolute left-4.5 pointer-events-none group-focus-within:text-violet-400 transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by skill name, topic, or mentor name..."
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-white placeholder-white/30 backdrop-blur-xl focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20 transition-all shadow-lg"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-white shadow-md"
                    : "text-white/60 hover:text-white glass-subtle hover:bg-white/[0.08]"
                }`}
                style={
                  isActive
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(124,108,246,0.3) 0%, rgba(6,182,212,0.2) 100%)",
                        border: "1px solid rgba(124,108,246,0.5)",
                        boxShadow: "0 0 16px rgba(124,108,246,0.25)",
                      }
                    : {
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                }
              >
                {cat}
                {isActive && (
                  <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── PEER SKILLS GRID ── */}
      {filteredPeers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeers.map((peer, i) => (
            <motion.div
              key={peer.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="glass-interactive rounded-2xl p-6 flex flex-col justify-between space-y-5 relative group overflow-hidden"
            >
              {/* Subtle hover gradient sheen */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

              <div className="space-y-4 relative z-10">
                {/* User Header */}
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={peer.avatar}
                      alt={peer.name}
                      className="w-13 h-13 rounded-2xl object-cover border border-white/10 ring-2 ring-violet-500/20"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#08090D]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">
                        {peer.name}
                      </span>
                      {peer.verified && <VerifiedBadge size="sm" showLabel={false} />}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                      <div className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{peer.rating}</span>
                      </div>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[11px] font-medium text-white/70">
                        {peer.category}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                  {peer.bio}
                </p>

                {/* Reciprocal Skills Exchange Module */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/8 space-y-2.5 text-xs">
                  <div>
                    <span className="text-white/40 block text-[11px] font-medium uppercase tracking-wider">
                      Can Teach You
                    </span>
                    <strong className="text-white text-xs font-semibold block mt-0.5">
                      {peer.teaches}
                    </strong>
                  </div>
                  <div className="pt-2 border-t border-white/6 flex items-center justify-between">
                    <div>
                      <span className="text-cyan-400/70 block text-[11px] font-medium uppercase tracking-wider">
                        Looking To Learn
                      </span>
                      <strong className="text-cyan-300 text-xs font-semibold block mt-0.5">
                        {peer.wants}
                      </strong>
                    </div>
                    <span className="px-2 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-[10px] font-bold border border-cyan-500/20">
                      Match Ready
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 relative z-10">
                {/* 1. Direct Swap */}
                <button
                  type="button"
                  onClick={() => handleOpenSwap(peer)}
                  className="w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:opacity-95 active:scale-[0.99]"
                  style={{
                    background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                    boxShadow: "0 4px 14px rgba(124,108,246,0.25)",
                  }}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Request Skill Swap</span>
                </button>

                {/* 2. Credit Escrow */}
                <button
                  type="button"
                  onClick={() => handleOpenBooking(peer)}
                  className="w-full py-2.5 rounded-xl glass hover:bg-white/[0.08] text-white/80 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-white/10"
                >
                  <CoinIcon size={14} />
                  <span>Book for 10 credits</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl glass border-white/10 space-y-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto text-white/40">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">
            No skill traders found
          </h3>
          <p className="text-xs text-white/50 max-w-sm mx-auto leading-relaxed">
            No matches found for &quot;{searchQuery}&quot; in {selectedCategory}. Try another keyword or browse all categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white glass hover:bg-white/10 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* SWAP REQUEST MODAL */}
      <SwapRequestModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        targetUser={{
          id: selectedPeer?.id,
          name: selectedPeer?.name,
          avatar: selectedPeer?.avatar,
          skillToTeach: selectedPeer?.teaches,
        }}
      />

      {/* 10-CREDIT ESCROW BOOKING MODAL */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        mentor={{
          id: selectedPeer?.id,
          name: selectedPeer?.name,
          avatar: selectedPeer?.avatar,
          skillName: selectedPeer?.teaches,
          pricePerSession: 10,
        }}
      />
    </main>
  );
}

export default function DiscoverPage() {
  return (
    <div className="min-h-screen flex flex-col ambient-bg text-white pb-20 lg:pb-0">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center text-white/40">Loading explore...</div>}>
        <DiscoverContent />
      </Suspense>
    </div>
  );
}
