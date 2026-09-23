"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Sparkles, X, Compass, CheckCircle2 } from "lucide-react";
import { MatchResult } from "@/lib/ai/compatibility";

interface RadarScannerProps {
  isOpen: boolean;
  onClose?: () => void;
  onScanComplete?: (matches: MatchResult[]) => void;
  userId?: string;
  initialMatches?: MatchResult[];
}

const TICKER_MESSAGES = [
  "Analyzing your learning goals and teaching skills...",
  "Scanning global network for peer synergy...",
  "Calculating proficiency alignment and time zone overlap...",
  "AI verifying credential trustworthiness...",
  "Compatibility found! Generating synergy profile...",
];

// Peer blips appearing along radar radius
const RADAR_BLIPS = [
  { id: "blip-1", name: "Arun K.", skill: "Python / ML", angle: 45, radius: 125, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
  { id: "blip-2", name: "Elena R.", skill: "Figma UI", angle: 135, radius: 165, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80" },
  { id: "blip-3", name: "Marcus C.", skill: "Docker & K8s", angle: 220, radius: 140, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
  { id: "blip-4", name: "Sophia R.", skill: "Spanish", angle: 310, radius: 110, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" },
];

export default function RadarScanner({
  isOpen,
  onClose,
  onScanComplete,
  userId,
  initialMatches,
}: RadarScannerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [fetchedResults, setFetchedResults] = useState<MatchResult[] | null>(null);
  const startTimeRef = useRef<number>(0);

  // Reset and start scan when opened
  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsCompleted(false);
      setFetchedResults(null);
      return;
    }

    startTimeRef.current = Date.now();

    // 1. Fetch AI compatibility matches in background
    let isSubscribed = true;
    async function fetchMatches() {
      try {
        const res = await fetch("/api/ai-match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (isSubscribed && data.matches) {
          setFetchedResults(data.matches);
        }
      } catch (err) {
        console.warn("Radar scanner fetch fallback:", err);
      }
    }

    fetchMatches();

    // 2. Cycle ticker every 1.5 seconds through the 5 steps
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < TICKER_MESSAGES.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isOpen, userId]);

  // Handle minimum dwell time of 2.5s and completing scan
  useEffect(() => {
    if (!isOpen || isCompleted) return;

    // Check if we reached step 4 (5th message) or have results after >= 2500ms
    const timer = setTimeout(() => {
      if (currentStepIndex >= 4) {
        setIsCompleted(true);
        const resolved = fetchedResults || initialMatches || [];
        // Slight buffer so user sees "Compatibility found!" before reveal
        const finishTimeout = setTimeout(() => {
          if (onScanComplete) {
            onScanComplete(resolved);
          }
        }, 1200);
        return () => clearTimeout(finishTimeout);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentStepIndex, isOpen, isCompleted, fetchedResults, initialMatches, onScanComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-2xl text-slate-100 overflow-hidden select-none"
      >
        {/* Subtle background radial ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-600/10 via-cyan-500/10 to-violet-600/10 rounded-full blur-3xl opacity-60" />
        </div>

        {/* Top Header Controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI NEURAL RADAR • SCANNING ACTIVE</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              aria-label="Close radar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Radar Core Container */}
        <div className="relative w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] flex items-center justify-center">
          {/* Concentric Pulsating Radar Ripple Circles */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={`ripple-${ring}`}
              className="absolute rounded-full border border-emerald-500/25 pointer-events-none"
              style={{
                width: `${ring * 110}px`,
                height: `${ring * 110}px`,
              }}
              animate={{
                scale: [1, 2.3],
                opacity: [0.8, 0],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                delay: ring * 0.9,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Fixed Radar Grid Circles */}
          <div className="absolute w-28 h-28 rounded-full border border-emerald-500/20" />
          <div className="absolute w-56 h-56 rounded-full border border-cyan-500/20" />
          <div className="absolute w-80 h-80 rounded-full border border-emerald-500/20 border-dashed" />
          <div className="absolute w-full h-full rounded-full border border-slate-800" />

          {/* Crosshair Axes */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent pointer-events-none" />

          {/* 360-Degree Rotating Gradient Scanner Beam */}
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{
              background: `conic-gradient(from 0deg at 50% 50%, rgba(16, 185, 129, 0.45) 0deg, rgba(6, 182, 212, 0.18) 55deg, transparent 80deg, transparent 360deg)`,
            }}
          >
            {/* Leading Sweep Needle Highlight */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-1/2 bg-gradient-to-t from-transparent via-emerald-400 to-emerald-300 shadow-[0_0_12px_#10B981]" />
          </motion.div>

          {/* Floating Peer Blip Avatars Appearing Around Radius */}
          {RADAR_BLIPS.map((blip, index) => {
            const rad = (blip.angle * Math.PI) / 180;
            const x = Math.cos(rad) * blip.radius;
            const y = Math.sin(rad) * blip.radius;

            return (
              <motion.div
                key={blip.id}
                className="absolute flex flex-col items-center pointer-events-none z-10"
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: [0.2, 0.95, 0.3],
                  scale: [0.85, 1.05, 0.9],
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  delay: index * 0.7,
                  ease: "easeInOut",
                }}
              >
                <div className="relative group">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-emerald-400/80 shadow-[0_0_14px_rgba(16,185,129,0.5)] overflow-hidden bg-slate-900">
                    <img
                      src={blip.avatar}
                      alt={blip.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-700/80 text-[10px] font-semibold text-emerald-300 whitespace-nowrap shadow-lg">
                  {blip.name} • {blip.skill}
                </div>
              </motion.div>
            );
          })}

          {/* Central Pulsing AI Brain / Glowing Orb */}
          <div className="relative z-20 flex items-center justify-center">
            {/* Radial glow around center */}
            <motion.div
              className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-60 blur-xl"
              animate={{
                scale: [1, 1.35, 1],
                opacity: [0.5, 0.85, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Solid Center Orb */}
            <motion.div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-emerald-400 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.6)]"
              animate={{
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </motion.div>
          </div>
        </div>

        {/* Dynamic Status Ticker Container */}
        <div className="mt-8 max-w-md w-full px-6 flex flex-col items-center text-center z-20 space-y-4">
          <div className="min-h-[48px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStepIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex items-center gap-2.5 text-sm sm:text-base font-medium text-slate-200"
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
                ) : (
                  <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 animate-pulse" />
                )}
                <span className="tracking-wide">
                  {TICKER_MESSAGES[currentStepIndex]}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full max-w-xs space-y-1.5">
            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-cyan-400 to-emerald-400 rounded-full shadow-[0_0_10px_#10B981]"
                initial={{ width: "10%" }}
                animate={{
                  width: `${Math.min(100, ((currentStepIndex + 1) / TICKER_MESSAGES.length) * 100)}%`,
                }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Vector Alignment</span>
              <span>
                {Math.round(((currentStepIndex + 1) / TICKER_MESSAGES.length) * 100)}%
              </span>
            </div>
          </div>

          {/* Fast-forward / Skip button */}
          <button
            onClick={() => {
              const resolved = fetchedResults || initialMatches || [];
              if (onScanComplete) onScanComplete(resolved);
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 underline underline-offset-4 transition-colors pt-2"
          >
            Skip Animation & View Matches
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
