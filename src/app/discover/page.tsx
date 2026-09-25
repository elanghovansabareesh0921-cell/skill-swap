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
} from "lucide-react";

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
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
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
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
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
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
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
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
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
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
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
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: "5.0",
    category: "Career",
    teaches: "Product Management Case Prep",
    wants: "SQL & Data Analytics",
    verified: true,
    bio: "Group PM guiding aspiring tech leaders through product sense and metrics frameworks.",
  },
];

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
    <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* HEADER & SEARCH */}
      <div className="space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ede8fb] dark:bg-[#282147] border border-[#ddd4f5] dark:border-[#362c5e] text-xs font-semibold text-[#7d6ce8] dark:text-[#ac98f2] mb-2">
            <CoinIcon size={12} />
            <span>1 Hour = 10 Credits · Direct Swaps & Credit Escrow</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#241b3d] dark:text-[#f4f0ff]">
            Explore skills
          </h1>
          <p className="text-xs sm:text-sm text-[#7a719c] dark:text-[#a99ed4] mt-1">
            Discover verified peers ready to exchange skills directly or teach for credits.
          </p>
        </div>

        {/* Search Bar (Pill Shape) */}
        <div className="relative">
          <Search className="w-5 h-5 text-[#7a719c] dark:text-[#a99ed4] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill name, topic, or mentor..."
            className="w-full pl-12 pr-4 py-3.5 rounded-full bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] text-sm text-[#241b3d] dark:text-[#f4f0ff] placeholder-[#7a719c] dark:placeholder-[#a99ed4] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7d6ce8]/40"
          />
        </div>

        {/* Category Filter Chips (Pill Shaped) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-[#7d6ce8] text-white shadow-sm"
                  : "bg-white dark:bg-[#1e1938] text-[#7a719c] dark:text-[#a99ed4] border border-[#ddd4f5] dark:border-[#362c5e] hover:border-[#7d6ce8]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PEER SKILLS GRID */}
      {filteredPeers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPeers.map((peer) => (
            <div
              key={peer.id}
              className="rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] p-6 space-y-4 hover:border-[#7d6ce8] transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* User Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#ddd4f5] dark:border-[#362c5e]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-[#241b3d] dark:text-[#f4f0ff] truncate">
                        {peer.name}
                      </span>
                      {peer.verified && <VerifiedBadge size="sm" showLabel={false} />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#7a719c] dark:text-[#a99ed4]">
                      <Star className="w-3.5 h-3.5 text-[#f5a524] fill-current" />
                      <span className="font-semibold text-[#241b3d] dark:text-[#f4f0ff]">{peer.rating}</span>
                      <span>· {peer.category}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#7a719c] dark:text-[#a99ed4] line-clamp-2 leading-relaxed">
                  {peer.bio}
                </p>

                {/* Skills Rows */}
                <div className="p-3.5 rounded-2xl bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] space-y-2 text-xs">
                  <div>
                    <span className="text-[#7a719c] dark:text-[#a99ed4] block text-[11px] font-medium">Teaches</span>
                    <strong className="text-[#241b3d] dark:text-[#f4f0ff] text-sm block">{peer.teaches}</strong>
                  </div>
                  <div className="pt-1 border-t border-[#ddd4f5]/60 dark:border-[#362c5e]/60">
                    <span className="text-[#7a719c] dark:text-[#a99ed4] block text-[11px] font-medium">Wants to learn</span>
                    <strong className="text-[#7d6ce8] dark:text-[#ac98f2] text-sm block">{peer.wants}</strong>
                  </div>
                </div>
              </div>

              {/* Two Distinct Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* 1. Direct Swap */}
                <button
                  type="button"
                  onClick={() => handleOpenSwap(peer)}
                  className="w-full py-2.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Request swap</span>
                </button>

                {/* 2. Credit Escrow */}
                <button
                  type="button"
                  onClick={() => handleOpenBooking(peer)}
                  className="w-full py-2 rounded-full bg-white dark:bg-[#1e1938] hover:bg-[#ede8fb]/60 dark:hover:bg-[#282147] border border-[#ddd4f5] dark:border-[#362c5e] text-[#241b3d] dark:text-[#f4f0ff] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CoinIcon size={14} />
                  <span>Learn for 10 credits</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] space-y-3">
          <Users className="w-10 h-10 text-[#7a719c] mx-auto opacity-70" />
          <h3 className="text-base font-bold text-[#241b3d] dark:text-[#f4f0ff]">
            No skill traders found
          </h3>
          <p className="text-xs text-[#7a719c] dark:text-[#a99ed4] max-w-sm mx-auto">
            Try adjusting your search query or selecting a different category filter.
          </p>
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
    <div className="min-h-screen flex flex-col bg-[#f5f2fc] dark:bg-[#130f26] text-[#241b3d] dark:text-[#f4f0ff] transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center">Loading explore...</div>}>
        <DiscoverContent />
      </Suspense>
    </div>
  );
}
