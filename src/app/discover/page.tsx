"use client";

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SwapRequestModal from "@/components/SwapRequestModal";
import BookingModal from "@/components/BookingModal";
import CoinIcon from "@/components/common/CoinIcon";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import {
  Search,
  Star,
  Repeat,
  Users,
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 border-2 border-black bg-[#181B22] text-xs font-black uppercase text-[#FFE600] shadow-[2px_2px_0px_0px_#FFE600] mb-2">
            <CoinIcon size={12} />
            <span>1 Hour = 10 Credits · Direct Swaps & Credit Escrow</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white">
            Explore skills
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-medium mt-1">
            Discover verified peers ready to exchange skills directly or teach for credits.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill name, topic, or mentor..."
            className="w-full pl-12 pr-4 py-3.5 border-2 border-black bg-[#12141C] text-sm text-white placeholder-zinc-500 font-medium shadow-[4px_4px_0px_0px_#000000] focus:outline-none focus:border-[#FFE600] focus:shadow-[4px_4px_0px_0px_#FFE600] transition-all"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 text-xs font-black uppercase whitespace-nowrap transition-all border-2 border-black cursor-pointer ${
                selectedCategory === cat
                  ? "bg-[#FFE600] text-black shadow-[3px_3px_0px_0px_#000000]"
                  : "bg-[#181B22] text-zinc-300 hover:text-white hover:bg-[#1F2430] hover:shadow-[2px_2px_0px_0px_#FFE600]"
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
              className="border-2 border-black bg-[#181B22] p-6 space-y-4 shadow-[5px_5px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#FFE600] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                {/* User Header */}
                <div className="flex items-center gap-3">
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    className="w-12 h-12 object-cover border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-black uppercase text-white truncate">
                        {peer.name}
                      </span>
                      {peer.verified && <VerifiedBadge size="sm" showLabel={false} />}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <Star className="w-3.5 h-3.5 text-[#FFE600] fill-current" />
                      <span className="font-mono font-black text-white">{peer.rating}</span>
                      <span className="font-mono uppercase font-bold">· {peer.category}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-medium">
                  {peer.bio}
                </p>

                {/* Skills Rows */}
                <div className="p-3.5 border-2 border-black bg-[#12141C] space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-400 block text-[10px] font-black uppercase tracking-wider">Teaches</span>
                    <strong className="text-white text-xs sm:text-sm font-black block font-mono">{peer.teaches}</strong>
                  </div>
                  <div className="pt-1.5 border-t-2 border-black">
                    <span className="text-zinc-400 block text-[10px] font-black uppercase tracking-wider">Wants to learn</span>
                    <strong className="text-[#38BDF8] text-xs sm:text-sm font-black block font-mono">{peer.wants}</strong>
                  </div>
                </div>
              </div>

              {/* Two Distinct Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* 1. Direct Swap */}
                <button
                  type="button"
                  onClick={() => handleOpenSwap(peer)}
                  className="w-full py-2.5 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] text-black text-xs font-black uppercase tracking-wider transition-all shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Repeat className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Request swap</span>
                </button>

                {/* 2. Credit Escrow */}
                <button
                  type="button"
                  onClick={() => handleOpenBooking(peer)}
                  className="w-full py-2 border-2 border-black bg-[#12141C] hover:bg-[#1F2430] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_0px_#38BDF8] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
                >
                  <CoinIcon size={14} />
                  <span>Learn for 10 credits</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border-2 border-black bg-[#181B22] shadow-[6px_6px_0px_0px_#FFE600] space-y-3">
          <Users className="w-10 h-10 text-zinc-500 mx-auto" />
          <h3 className="text-base font-black uppercase text-white">
            No skill traders found
          </h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto font-medium">
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
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-white cyber-grid transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center font-mono text-zinc-400 font-bold uppercase">Loading explore...</div>}>
        <DiscoverContent />
      </Suspense>
    </div>
  );
}
