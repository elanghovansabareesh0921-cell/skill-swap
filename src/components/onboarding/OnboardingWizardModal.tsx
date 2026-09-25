"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  X,
  Radio,
  Cpu,
  Zap,
  ShieldCheck,
  User,
  MapPin,
  Clock,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Coins,
  Star,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  Send,
  Video,
} from "lucide-react";

export interface OnboardingProfileData {
  fullName: string;
  age: number;
  gender: string;
  city: string;
  bio: string;
  communicationStyle: string;
  isPureLearner: boolean;
  teachSkills: string[];
  learnSkills: string[];
  commitment: string;
  matchedPeers: MatchedPeer[];
  grantedCredits: number;
}

export interface MatchedPeer {
  id: string;
  name: string;
  age: number;
  gender: string;
  city: string;
  avatar: string;
  rating: number;
  reviewsCount: number;
  communicationStyle: string;
  rateCredits: number;
  isVerified: boolean;
  teaches: string[];
  learns: string[];
  bio: string;
  compatibilityScore: number;
  breakdown: {
    skillScore: number;
    commScore: number;
    ageScore: number;
    locScore: number;
  };
  highlightReason: string;
}

export interface OnboardingWizardModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onComplete?: (profileData: OnboardingProfileData) => void;
  isModal?: boolean;
}

// Preset peer database for matching
const CANDIDATE_PEERS = [
  {
    id: "peer-karthik",
    name: "Karthik Ramachandran",
    age: 24,
    gender: "Male",
    city: "Chennai",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    rating: 4.96,
    reviewsCount: 38,
    communicationStyle: "Tamil + English (Tanglish)",
    rateCredits: 10,
    isVerified: true,
    teaches: ["Python", "Machine Learning", "FastAPI", "Data Structures"],
    learns: ["React", "Next.js", "Tailwind CSS", "UI/UX"],
    bio: "Senior AI engineer at a Chennai tech lab. Passionate about mentoring students and breaking down complex ML algorithms into clear Tanglish concepts.",
    beginnerFriendly: true,
  },
  {
    id: "peer-priya",
    name: "Priya Sundaram",
    age: 26,
    gender: "Female",
    city: "Bengaluru",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    rating: 4.92,
    reviewsCount: 44,
    communicationStyle: "Casual & Friendly",
    rateCredits: 10,
    isVerified: true,
    teaches: ["UI/UX", "Figma", "Design Systems", "User Research"],
    learns: ["TypeScript", "Frontend Development", "Next.js"],
    bio: "Product designer specializing in atomic design systems and neo-brutalist layouts. Looking to exchange design reviews for modern full-stack guidance.",
    beginnerFriendly: true,
  },
  {
    id: "peer-david",
    name: "David Miller",
    age: 28,
    gender: "Male",
    city: "San Francisco (Remote)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    rating: 4.88,
    reviewsCount: 52,
    communicationStyle: "English Only",
    rateCredits: 15,
    isVerified: true,
    teaches: ["System Design", "AWS Cloud", "Kubernetes", "DevOps"],
    learns: ["Machine Learning", "Python", "Data Analysis"],
    bio: "Staff DevOps architect. Open to teaching architectural trade-offs and container orchestration to dedicated learners.",
    beginnerFriendly: false,
  },
  {
    id: "peer-ananya",
    name: "Ananya Sharma",
    age: 23,
    gender: "Female",
    city: "Chennai",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    rating: 4.98,
    reviewsCount: 61,
    communicationStyle: "Structured / Academic",
    rateCredits: 10,
    isVerified: true,
    teaches: ["React", "Next.js", "Web Development", "TypeScript"],
    learns: ["Python", "Machine Learning", "Data Structures"],
    bio: "Full-stack engineer building fast, accessible web apps. Offers structured step-by-step coding sprints and code reviews.",
    beginnerFriendly: true,
  },
  {
    id: "peer-vikram",
    name: "Vikramaditya Sengupta",
    age: 25,
    gender: "Male",
    city: "Hyderabad",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    rating: 4.85,
    reviewsCount: 29,
    communicationStyle: "Tamil + English (Tanglish)",
    rateCredits: 10,
    isVerified: true,
    teaches: ["JavaScript", "WebRTC", "Cybersecurity Basics"],
    learns: ["UI/UX", "Public Speaking", "Figma"],
    bio: "Real-time communication researcher and WebRTC developer. Enthusiastic about interactive peer programming sessions.",
    beginnerFriendly: true,
  },
];

const COMMUNICATION_STYLES = [
  "Tamil + English (Tanglish)",
  "Casual & Friendly",
  "Structured / Academic",
  "English Only",
];

const COMMITMENT_OPTIONS = [
  { id: "1-2", label: "1-2 hrs/week", desc: "Casual & self-paced" },
  { id: "3-5", label: "3-5 hrs/week", desc: "Consistent progression" },
  { id: "intensive", label: "Intensive (6+ hrs)", desc: "Fast-track masterclass" },
];

const POPULAR_TEACH_TAGS = [
  "Python",
  "UI/UX",
  "Machine Learning",
  "React",
  "Next.js",
  "TypeScript",
  "Data Structures",
  "Figma",
  "SQL",
  "Public Speaking",
];

const POPULAR_LEARN_TAGS = [
  "Machine Learning",
  "React",
  "UI/UX",
  "Python",
  "System Design",
  "Next.js",
  "WebRTC",
  "Docker",
  "Figma",
  "TypeScript",
];

export default function OnboardingWizardModal({
  isOpen = true,
  onClose,
  onComplete,
  isModal = false,
}: OnboardingWizardModalProps) {
  // Step tracker: 1 (Identity), 2 (Teach / Pure Learner), 3 (Learn & Commitment), 4 (AI Analyzer Telemetry), 5 (Match Deck)
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: User Identity & Profile
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState<number | "">(22);
  const [gender, setGender] = useState("Prefer not to say");
  const [city, setCity] = useState("Chennai");
  const [bio, setBio] = useState("");
  const [communicationStyle, setCommunicationStyle] = useState("Tamil + English (Tanglish)");
  const [step1Error, setStep1Error] = useState("");

  // Step 2: What Can You Teach?
  const [teachSkills, setTeachSkills] = useState<string[]>(["React", "TypeScript"]);
  const [teachInput, setTeachInput] = useState("");
  const [isPureLearner, setIsPureLearner] = useState(false);

  // Step 3: What Do You Want to Learn?
  const [learnSkills, setLearnSkills] = useState<string[]>(["Python", "Machine Learning"]);
  const [learnInput, setLearnInput] = useState("");
  const [commitment, setCommitment] = useState("3-5 hrs/week");

  // Step 4: AI Skill Match Analyzer Telemetry
  const [scanProgress, setScanProgress] = useState(0);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [matchedPeers, setMatchedPeers] = useState<MatchedPeer[]>([]);
  const [radarPhaseMessage, setRadarPhaseMessage] = useState("Initializing neural vector models...");

  // Action status toasts / popups
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showLocalToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Step 1 validation
  const handleProceedFromStep1 = () => {
    if (!fullName.trim()) {
      setStep1Error("Please enter your full name.");
      return;
    }
    if (!age || Number(age) < 13 || Number(age) > 100) {
      setStep1Error("Please enter a valid age between 13 and 100.");
      return;
    }
    if (!city.trim()) {
      setStep1Error("Please specify your city or location.");
      return;
    }
    setStep1Error("");
    setStep(2);
  };

  // Step 2 Handlers
  const handleAddTeachSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = teachInput.trim();
    if (trimmed && !teachSkills.includes(trimmed)) {
      setTeachSkills([...teachSkills, trimmed]);
      setTeachInput("");
    }
  };

  const handleRemoveTeachSkill = (tag: string) => {
    setTeachSkills(teachSkills.filter((t) => t !== tag));
  };

  const handleToggleTeachTag = (tag: string) => {
    if (teachSkills.includes(tag)) {
      handleRemoveTeachSkill(tag);
    } else {
      setTeachSkills([...teachSkills, tag]);
    }
  };

  // Step 3 Handlers
  const handleAddLearnSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = learnInput.trim();
    if (trimmed && !learnSkills.includes(trimmed)) {
      setLearnSkills([...learnSkills, trimmed]);
      setLearnInput("");
    }
  };

  const handleRemoveLearnSkill = (tag: string) => {
    setLearnSkills(learnSkills.filter((l) => l !== tag));
  };

  const handleToggleLearnTag = (tag: string) => {
    if (learnSkills.includes(tag)) {
      handleRemoveLearnSkill(tag);
    } else {
      setLearnSkills([...learnSkills, tag]);
    }
  };

  // Multi-factor Weighted Compatibility Algorithm
  const calculateCompatibility = (
    userWants: string[],
    userTeaches: string[],
    userPureLearner: boolean,
    userComm: string,
    userAge: number,
    userCity: string
  ): MatchedPeer[] => {
    const scored = CANDIDATE_PEERS.map((peer) => {
      // 1. Skill Complementarity (50%)
      let skillScore = 0;
      let skillHighlight = "";

      const normalizedWants = userWants.map((w) => w.toLowerCase());
      const normalizedTeaches = userTeaches.map((t) => t.toLowerCase());
      const peerTeaches = peer.teaches.map((pt) => pt.toLowerCase());
      const peerLearns = peer.learns.map((pl) => pl.toLowerCase());

      if (userPureLearner) {
        // Pure learner: Check if peer teaches what user wants, plus beginner friendliness
        const offersUserWant = peerTeaches.some((pt) =>
          normalizedWants.some((nw) => nw.includes(pt) || pt.includes(nw))
        );
        if (offersUserWant) {
          skillScore = peer.beginnerFriendly ? 50 : 44;
          skillHighlight = "Beginner-friendly mentor matching your desired skill";
        } else {
          skillScore = 32;
          skillHighlight = "Foundational mentor open to platform credit exchange";
        }
      } else {
        // Direct two-way reciprocal swap
        const peerOffersUserWant = peerTeaches.some((pt) =>
          normalizedWants.some((nw) => nw.includes(pt) || pt.includes(nw))
        );
        const userOffersPeerWant = normalizedTeaches.some((ut) =>
          peerLearns.some((pl) => pl.includes(ut) || ut.includes(pl))
        );

        if (peerOffersUserWant && userOffersPeerWant) {
          skillScore = 50;
          skillHighlight = "Perfect 2-way reciprocal skill synergy";
        } else if (peerOffersUserWant) {
          skillScore = 38;
          skillHighlight = "Direct instructor match for your target skill";
        } else if (userOffersPeerWant) {
          skillScore = 32;
          skillHighlight = "Peer actively seeking your domain skills";
        } else {
          skillScore = 20;
          skillHighlight = "Broad domain overlap";
        }
      }

      // 2. Communication Match (20%)
      let commScore = 0;
      if (userComm === peer.communicationStyle) {
        commScore = 20;
      } else if (
        (userComm.includes("Tanglish") && peer.communicationStyle.includes("Casual")) ||
        (userComm.includes("Casual") && peer.communicationStyle.includes("Tanglish"))
      ) {
        commScore = 16;
      } else if (
        userComm.includes("English") &&
        (peer.communicationStyle.includes("English") || peer.communicationStyle.includes("Tanglish"))
      ) {
        commScore = 14;
      } else {
        commScore = 10;
      }

      // 3. Age / Cohort Sync (15%)
      const ageDiff = Math.abs(userAge - peer.age);
      let ageScore = 0;
      if (ageDiff <= 2) {
        ageScore = 15;
      } else if (ageDiff <= 4) {
        ageScore = 13;
      } else if (ageDiff <= 7) {
        ageScore = 9;
      } else {
        ageScore = 6;
      }

      // 4. Location / Timezone Sync (15%)
      let locScore = 0;
      const cleanUserCity = userCity.toLowerCase().trim();
      const cleanPeerCity = peer.city.toLowerCase().trim();

      if (cleanUserCity && cleanPeerCity.includes(cleanUserCity)) {
        locScore = 15;
      } else if (cleanPeerCity.includes("remote") || cleanUserCity.includes("remote")) {
        locScore = 13;
      } else {
        locScore = 10;
      }

      const rawTotal = skillScore + commScore + ageScore + locScore;
      const compatibilityScore = Math.min(98, Math.max(68, rawTotal));

      return {
        id: peer.id,
        name: peer.name,
        age: peer.age,
        gender: peer.gender,
        city: peer.city,
        avatar: peer.avatar,
        rating: peer.rating,
        reviewsCount: peer.reviewsCount,
        communicationStyle: peer.communicationStyle,
        rateCredits: peer.rateCredits,
        isVerified: peer.isVerified,
        teaches: peer.teaches,
        learns: peer.learns,
        bio: peer.bio,
        compatibilityScore,
        breakdown: {
          skillScore,
          commScore,
          ageScore,
          locScore,
        },
        highlightReason: skillHighlight,
      };
    });

    // Sort by compatibility descending and take top 3
    scored.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return scored.slice(0, 3);
  };

  // Launch AI Scanner Telemetry (Step 4)
  const startAiScanner = () => {
    setStep(4);
    setScanProgress(0);
    setTelemetryLogs([
      "[*] INITIALIZING NEURAL EMBEDDING MODEL v2.4...",
      "[*] USER PROFILE TOKENIZED & VECTORIZED.",
    ]);

    const finalMatches = calculateCompatibility(
      learnSkills,
      teachSkills,
      isPureLearner,
      communicationStyle,
      Number(age) || 22,
      city
    );
    setMatchedPeers(finalMatches);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 6;
      if (progress > 100) progress = 100;
      setScanProgress(progress);

      if (progress >= 20 && progress < 45) {
        setRadarPhaseMessage("Parsing skill vectors and taxonomy graphs...");
      } else if (progress >= 45 && progress < 70) {
        setRadarPhaseMessage("Cross-checking communication preferences & styles...");
      } else if (progress >= 70 && progress < 90) {
        setRadarPhaseMessage("Calculating cohort distance (|Δage| ≤ 4) and geo proximity...");
      } else if (progress >= 90 && progress < 100) {
        setRadarPhaseMessage("Synthesizing 4-factor reciprocal synergy matrices...");
      } else if (progress === 100) {
        setRadarPhaseMessage("Analysis complete. 3 verified high-affinity peers resolved.");
        clearInterval(interval);
      }
    }, 180);

    // Stream telemetry logs
    setTimeout(() => {
      setTelemetryLogs((prev) => [
        ...prev,
        `[VECTOR-ENGINE] Extracted ${learnSkills.length} target vectors (Weights: 50%).`,
      ]);
    }, 600);

    setTimeout(() => {
      setTelemetryLogs((prev) => [
        ...prev,
        `[COMM-SYNC] Language filter active: "${communicationStyle}" (Weight: 20%).`,
      ]);
    }, 1200);

    setTimeout(() => {
      setTelemetryLogs((prev) => [
        ...prev,
        `[COHORT-GEO] Age delta scan: ${age}y | Anchor: ${city} (Weight: 30%).`,
      ]);
    }, 1900);

    setTimeout(() => {
      setTelemetryLogs((prev) => [
        ...prev,
        `[SUCCESS] 3 Top reciprocal matches synthesized with >85% compatibility scores.`,
      ]);
    }, 2800);
  };

  // Finalize & complete
  const handleFinalize = () => {
    const payload: OnboardingProfileData = {
      fullName,
      age: Number(age) || 22,
      gender,
      city,
      bio: bio || "Passionate peer learner and knowledge explorer on SkillSwap.",
      communicationStyle,
      isPureLearner,
      teachSkills: isPureLearner ? [] : teachSkills,
      learnSkills,
      commitment,
      matchedPeers,
      grantedCredits: 100,
    };

    if (onComplete) {
      onComplete(payload);
    }
  };

  if (!isOpen) return null;

  const content = (
    <div
      className="w-full max-w-4xl mx-auto bg-[#0A0A0C] border-2 border-black rounded-none shadow-[8px_8px_0px_#FFE600] text-zinc-100 overflow-hidden flex flex-col font-sans transition-all"
      style={{
        backgroundImage:
          "linear-gradient(to right, #1a1a1e 1px, transparent 1px), linear-gradient(to bottom, #1a1a1e 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Neo-Brutalist Top Header */}
      <header className="px-6 py-4 bg-[#121318] border-b-2 border-black flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#FFE600] text-black font-black flex items-center justify-center text-lg border-2 border-black shadow-[2px_2px_0px_#000000]">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-tight uppercase text-white">
                SkillSwap
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#FFE600] text-black border border-black">
                AI Match Matrix
              </span>
            </div>
            <div className="text-xs font-mono text-zinc-400">
              USER ONBOARDING & RECIPROCAL MATCH ENGINE
            </div>
          </div>
        </div>

        {/* Step indicator breadcrumbs */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {[
            { n: 1, label: "IDENTITY" },
            { n: 2, label: "TEACH" },
            { n: 3, label: "LEARN" },
            { n: 4, label: "AI SCAN" },
            { n: 5, label: "MATCHES" },
          ].map((item) => (
            <div
              key={item.n}
              className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-black uppercase border-2 transition-all ${
                step === item.n
                  ? "bg-[#FFE600] text-black border-black shadow-[2px_2px_0px_#000000]"
                  : step > item.n
                  ? "bg-[#A3E635] text-black border-black"
                  : "bg-[#16181F] text-zinc-500 border-[#262833]"
              }`}
            >
              <span>{step > item.n ? "✓" : item.n}</span>
              <span className="hidden md:inline">{item.label}</span>
            </div>
          ))}

          {isModal && onClose && (
            <button
              onClick={onClose}
              className="ml-2 p-1.5 bg-[#16181F] hover:bg-[#FFE600] hover:text-black border-2 border-[#262833] text-zinc-400 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Step Body */}
      <div className="p-6 sm:p-8 flex-1">
        {/* ================= STEP 1: USER IDENTITY & PROFILE ================= */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <div className="inline-block bg-[#38BDF8] text-black text-[11px] font-black uppercase px-2.5 py-0.5 border border-black mb-2 shadow-[2px_2px_0px_#000000]">
                Step 1 of 4 • Core Identification
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                Establish Your Swapper Identity
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono">
                Provide your demographic anchors for precise cohort & local proximity calculations.
              </p>
            </div>

            {step1Error && (
              <div className="p-3 bg-red-950/80 border-2 border-red-500 text-red-200 text-xs font-bold font-mono">
                [ERROR]: {step1Error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-zinc-300 flex items-center justify-between">
                  <span>Full Name *</span>
                  <span className="text-[10px] text-zinc-500">REQUIRED</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sabari Nathan"
                  className="w-full px-3.5 py-2.5 bg-[#121318] border-2 border-[#262833] focus:border-[#FFE600] text-white text-sm font-semibold outline-none transition-colors"
                />
              </div>

              {/* Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-zinc-300 flex items-center justify-between">
                  <span>Age (Years) *</span>
                  <span className="text-[10px] text-[#A3E635]">COHORT SYNC (|Δ| ≤ 4y)</span>
                </label>
                <input
                  type="number"
                  min={13}
                  max={100}
                  value={age}
                  onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="e.g. 23"
                  className="w-full px-3.5 py-2.5 bg-[#121318] border-2 border-[#262833] focus:border-[#FFE600] text-white text-sm font-semibold outline-none transition-colors"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-zinc-300">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#121318] border-2 border-[#262833] focus:border-[#FFE600] text-white text-sm font-semibold outline-none transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* City / Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase text-zinc-300 flex items-center justify-between">
                  <span>City / Address *</span>
                  <span className="text-[10px] text-[#38BDF8]">GEOSPATIAL ANCHOR</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chennai, Bengaluru, Remote"
                  className="w-full px-3.5 py-2.5 bg-[#121318] border-2 border-[#262833] focus:border-[#FFE600] text-white text-sm font-semibold outline-none transition-colors"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase text-zinc-300">
                Short Bio / Engineering Focus
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="What excites you? (e.g. Passionate about AI agents, distributed systems, and modern frontend)."
                className="w-full px-3.5 py-2.5 bg-[#121318] border-2 border-[#262833] focus:border-[#FFE600] text-white text-sm font-semibold outline-none transition-colors"
              />
            </div>

            {/* Communication Style Chips */}
            <div className="space-y-2 pt-2 border-t-2 border-[#262833]">
              <label className="text-xs font-black uppercase text-zinc-300 flex items-center justify-between">
                <span>Preferred Communication Style (Chips)</span>
                <span className="text-[10px] text-[#FFE600] font-black">20% ALGORITHM WEIGHT</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COMMUNICATION_STYLES.map((style) => {
                  const isSelected = communicationStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setCommunicationStyle(style)}
                      className={`p-3 text-left border-2 flex items-center justify-between font-bold text-xs uppercase transition-all ${
                        isSelected
                          ? "bg-[#FFE600] text-black border-black shadow-[3px_3px_0px_#FFE600]"
                          : "bg-[#121318] text-zinc-300 border-[#262833] hover:border-[#FFE600]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <span>{style}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleProceedFromStep1}
                className="px-6 py-3 bg-[#FFE600] text-black font-black uppercase text-sm border-2 border-black hover:bg-[#FFF04D] active:translate-x-0.5 active:translate-y-0.5 shadow-[4px_4px_0px_#000000] flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>Proceed to Teaching Profile</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: WHAT CAN YOU TEACH? ================= */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <div className="inline-block bg-[#A3E635] text-black text-[11px] font-black uppercase px-2.5 py-0.5 border border-black mb-2 shadow-[2px_2px_0px_#000000]">
                Step 2 of 4 • Knowledge Offering
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                What Can You Teach or Share?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono">
                Enter domain skills you can mentor peers in. Or activate Pure Learner mode if you are just starting out.
              </p>
            </div>

            {/* CRITICAL FEATURE: Pure Learner / Beginner Mode Checkbox */}
            <div className="p-4 bg-[#16181F] border-2 border-[#FFE600] shadow-[4px_4px_0px_#FFE600] space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPureLearner}
                  onChange={(e) => setIsPureLearner(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-[#FFE600] cursor-pointer"
                />
                <div>
                  <div className="text-sm font-black uppercase text-white flex items-center gap-2">
                    <span>I don't have teaching skills right now (Pure Learner / Beginner Mode)</span>
                    <span className="text-[10px] bg-[#A3E635] text-black font-black px-1.5 py-0.2 border border-black">
                      BEGINNER FRIENDLY
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 font-mono mt-0.5">
                    Pure learners are never blocked. You will be matched with verified mentors open to teaching beginners in exchange for platform credits (100 baseline credits will be granted).
                  </p>
                </div>
              </label>
            </div>

            {/* Tag Input for Teaching (Disabled/Hidden if Pure Learner) */}
            {!isPureLearner ? (
              <div className="space-y-4">
                <form onSubmit={handleAddTeachSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={teachInput}
                    onChange={(e) => setTeachInput(e.target.value)}
                    placeholder="Type skill & press Enter (e.g. Python, UI/UX, Docker)..."
                    className="flex-1 px-3.5 py-2.5 bg-[#121318] border-2 border-[#262833] focus:border-[#FFE600] text-white text-sm font-semibold outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!teachInput.trim()}
                    className="px-5 py-2.5 bg-[#FFE600] disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black uppercase text-xs border-2 border-black transition-all"
                  >
                    + Add Skill
                  </button>
                </form>

                {/* Selected Teaching Skill Tags */}
                <div className="space-y-1.5">
                  <div className="text-xs font-black uppercase text-zinc-400 font-mono">
                    Your Teaching Portfolio ({teachSkills.length} skills):
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 bg-[#121318] border-2 border-[#262833]">
                    {teachSkills.length === 0 ? (
                      <span className="text-xs text-zinc-500 font-mono italic">
                        No teaching tags added yet. Choose from suggestions below or type your own.
                      </span>
                    ) : (
                      teachSkills.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFE600] text-black font-black text-xs border-2 border-black uppercase"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTeachSkill(tag)}
                            className="hover:text-red-700 transition-colors"
                          >
                            <X className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Popular suggestions */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-black uppercase text-zinc-400 font-mono">
                    Suggested Teaching Topics:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_TEACH_TAGS.map((tag) => {
                      const isAdded = teachSkills.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTeachTag(tag)}
                          className={`text-xs px-2.5 py-1 font-bold border-2 transition-all ${
                            isAdded
                              ? "bg-[#FFE600] text-black border-black font-black"
                              : "bg-[#16181F] text-zinc-300 border-[#262833] hover:border-[#FFE600]"
                          }`}
                        >
                          {isAdded ? "✓ " : "+ "}
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-[#121318] border-2 border-[#262833] text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-[#A3E635] text-black flex items-center justify-center font-black border-2 border-black">
                  🎓
                </div>
                <div className="text-sm font-black uppercase text-white">
                  Pure Learner Mode Activated
                </div>
                <p className="text-xs text-zinc-400 font-mono max-w-md mx-auto">
                  Teaching requirement is waived. You will utilize your 100 baseline credits to book 1-on-1 mentor sessions with top verified practitioners.
                </p>
              </div>
            )}

            {/* Back & Next Navigation */}
            <div className="pt-4 flex items-center justify-between border-t-2 border-[#262833]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 bg-[#16181F] border-2 border-[#262833] text-zinc-300 hover:text-white hover:border-zinc-500 font-black uppercase text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-[#FFE600] text-black font-black uppercase text-sm border-2 border-black hover:bg-[#FFF04D] active:translate-x-0.5 active:translate-y-0.5 shadow-[4px_4px_0px_#000000] flex items-center gap-2 cursor-pointer"
              >
                <span>Proceed to Learning Goals</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: WHAT DO YOU WANT TO LEARN? ================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <div className="inline-block bg-[#38BDF8] text-black text-[11px] font-black uppercase px-2.5 py-0.5 border border-black mb-2 shadow-[2px_2px_0px_#000000]">
                Step 3 of 4 • Learning Objectives
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                What Do You Want to Acquire?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 font-mono">
                Define the skills you are hungry to master. Our AI uses this as the primary 50% compatibility anchor.
              </p>
            </div>

            {/* Dynamic Tag Input for Target Skills */}
            <div className="space-y-4">
              <form onSubmit={handleAddLearnSkill} className="flex gap-2">
                <input
                  type="text"
                  value={learnInput}
                  onChange={(e) => setLearnInput(e.target.value)}
                  placeholder="Target skill to learn (e.g. Python, UI/UX, WebRTC)..."
                  className="flex-1 px-3.5 py-2.5 bg-[#121318] border-2 border-[#262833] focus:border-[#38BDF8] text-white text-sm font-semibold outline-none"
                />
                <button
                  type="submit"
                  disabled={!learnInput.trim()}
                  className="px-5 py-2.5 bg-[#38BDF8] disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black uppercase text-xs border-2 border-black transition-all"
                >
                  + Add Target
                </button>
              </form>

              {/* Selected Learning Tags */}
              <div className="space-y-1.5">
                <div className="text-xs font-black uppercase text-zinc-400 font-mono">
                  Skills To Acquire ({learnSkills.length} selected):
                </div>
                <div className="flex flex-wrap gap-2 min-h-[42px] p-2.5 bg-[#121318] border-2 border-[#262833]">
                  {learnSkills.length === 0 ? (
                    <span className="text-xs text-zinc-500 font-mono italic">
                      Please select at least 1 skill you wish to learn.
                    </span>
                  ) : (
                    learnSkills.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#38BDF8] text-black font-black text-xs border-2 border-black uppercase"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveLearnSkill(tag)}
                          className="hover:text-red-700 transition-colors"
                        >
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Suggested Learn Topics */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-black uppercase text-zinc-400 font-mono">
                  High-Demand Learning Domains:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_LEARN_TAGS.map((tag) => {
                    const isAdded = learnSkills.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleLearnTag(tag)}
                        className={`text-xs px-2.5 py-1 font-bold border-2 transition-all ${
                          isAdded
                            ? "bg-[#38BDF8] text-black border-black font-black"
                            : "bg-[#16181F] text-zinc-300 border-[#262833] hover:border-[#38BDF8]"
                        }`}
                      >
                        {isAdded ? "✓ " : "+ "}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Learning Commitment Preference */}
            <div className="space-y-2 pt-2 border-t-2 border-[#262833]">
              <label className="text-xs font-black uppercase text-zinc-300 flex items-center justify-between">
                <span>Learning Commitment Preference</span>
                <span className="text-[10px] text-[#A3E635]">SCHEDULE PACING</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {COMMITMENT_OPTIONS.map((item) => {
                  const isSelected = commitment === item.label;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCommitment(item.label)}
                      className={`p-3 text-left border-2 flex flex-col justify-between transition-all ${
                        isSelected
                          ? "bg-[#FFE600] text-black border-black shadow-[3px_3px_0px_#FFE600]"
                          : "bg-[#121318] text-zinc-300 border-[#262833] hover:border-[#FFE600]"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black uppercase">{item.label}</span>
                        {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <span className="text-[10px] font-mono opacity-80 mt-1">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-4 flex items-center justify-between border-t-2 border-[#262833]">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 bg-[#16181F] border-2 border-[#262833] text-zinc-300 hover:text-white hover:border-zinc-500 font-black uppercase text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4 stroke-[3]" />
                <span>Back</span>
              </button>
              <button
                type="button"
                disabled={learnSkills.length === 0}
                onClick={startAiScanner}
                className="px-6 py-3 bg-[#FFE600] disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black uppercase text-sm border-2 border-black hover:bg-[#FFF04D] active:translate-x-0.5 active:translate-y-0.5 shadow-[4px_4px_0px_#000000] flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>Launch AI Skill Match Analyzer</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: AI SKILL MATCH ANALYZER (TELEMETRY & RADAR) ================= */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="inline-block bg-[#FFE600] text-black text-[11px] font-black uppercase px-2.5 py-0.5 border border-black mb-2 shadow-[2px_2px_0px_#000000]">
                  Step 4 • High-Tech Telemetry Scan
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                  Scanning Reciprocal Peer Mesh...
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-zinc-400 block">SYSTEM STATUS</span>
                <span className="text-sm font-black uppercase text-[#A3E635] flex items-center gap-1.5 justify-end">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#A3E635] animate-ping" />
                  ONLINE & SCANNING
                </span>
              </div>
            </div>

            {/* Scanning Radar and Telemetry Screen */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-[#0E0F14] border-2 border-[#262833]">
              {/* Visual Scanning Radar */}
              <div className="relative aspect-square max-h-[300px] mx-auto w-full border-2 border-[#262833] bg-[#0A0A0C] flex items-center justify-center overflow-hidden">
                {/* Concentric Radar Rings */}
                <div className="absolute w-[85%] h-[85%] rounded-full border border-[#262833]" />
                <div className="absolute w-[60%] h-[60%] rounded-full border border-[#262833]" />
                <div className="absolute w-[35%] h-[35%] rounded-full border border-[#262833]" />

                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-[#262833]" />
                <div className="absolute h-full w-[1px] bg-[#262833]" />

                {/* Rotating Sweeper Needle */}
                <div
                  className="absolute w-1/2 h-1/2 origin-bottom-right top-0 left-0"
                  style={{
                    background:
                      "conic-gradient(from 0deg at 100% 100%, rgba(255, 230, 0, 0.4) 0deg, rgba(255, 230, 0, 0) 60deg)",
                    animation: "spin 3s linear infinite",
                  }}
                />

                {/* Pulsing Candidate Blips */}
                <div
                  className={`absolute top-[28%] left-[68%] transition-opacity duration-300 ${
                    scanProgress >= 25 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="w-3 h-3 bg-[#FFE600] border border-black rounded-full animate-ping" />
                  <div className="w-3 h-3 bg-[#FFE600] border border-black rounded-full -mt-3 shadow-[0_0_8px_#FFE600]" />
                  <span className="absolute -top-4 left-3 text-[10px] font-black uppercase text-[#FFE600] whitespace-nowrap bg-black/80 px-1 border border-[#FFE600]">
                    NODE: KARTHIK (96%)
                  </span>
                </div>

                <div
                  className={`absolute bottom-[26%] left-[24%] transition-opacity duration-300 ${
                    scanProgress >= 50 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="w-3 h-3 bg-[#38BDF8] border border-black rounded-full animate-ping" />
                  <div className="w-3 h-3 bg-[#38BDF8] border border-black rounded-full -mt-3 shadow-[0_0_8px_#38BDF8]" />
                  <span className="absolute -top-4 left-3 text-[10px] font-black uppercase text-[#38BDF8] whitespace-nowrap bg-black/80 px-1 border border-[#38BDF8]">
                    NODE: ANANYA (94%)
                  </span>
                </div>

                <div
                  className={`absolute top-[40%] left-[28%] transition-opacity duration-300 ${
                    scanProgress >= 75 ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div className="w-3 h-3 bg-[#A3E635] border border-black rounded-full animate-ping" />
                  <div className="w-3 h-3 bg-[#A3E635] border border-black rounded-full -mt-3 shadow-[0_0_8px_#A3E635]" />
                  <span className="absolute -top-4 left-3 text-[10px] font-black uppercase text-[#A3E635] whitespace-nowrap bg-black/80 px-1 border border-[#A3E635]">
                    NODE: PRIYA (92%)
                  </span>
                </div>

                {/* Radar Center Anchor */}
                <div className="w-4 h-4 bg-white border-2 border-black z-10 font-mono text-[9px] flex items-center justify-center font-black text-black">
                  YOU
                </div>
              </div>

              {/* Terminal Telemetry Log */}
              <div className="flex flex-col justify-between bg-[#050507] border-2 border-[#262833] p-4 font-mono text-xs">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#262833] text-zinc-400 text-[11px]">
                    <span className="flex items-center gap-1.5 text-[#FFE600] font-black">
                      <Terminal className="w-3.5 h-3.5" />
                      TELEMETRY FEED
                    </span>
                    <span>PORT: 8080/UDP</span>
                  </div>

                  <div className="space-y-2 pt-3">
                    {telemetryLogs.map((log, idx) => (
                      <div key={idx} className="text-zinc-300 flex items-start gap-2">
                        <span className="text-zinc-600 select-none">[{idx + 1}]</span>
                        <span
                          className={
                            log.includes("SUCCESS")
                              ? "text-[#A3E635] font-bold"
                              : log.includes("WEIGHT")
                              ? "text-[#FFE600]"
                              : "text-zinc-300"
                          }
                        >
                          {log}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active scan phase text */}
                <div className="pt-4 border-t border-[#262833]">
                  <span className="text-[10px] text-zinc-500 uppercase block">CURRENT HEURISTIC:</span>
                  <div className="text-xs font-bold text-[#FFE600] truncate mt-0.5">
                    {radarPhaseMessage}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Bar (0% -> 100%) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white uppercase flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#FFE600]" />
                  SYNTHESIZING COMPATIBILITY MATRIX
                </span>
                <span className="font-black text-[#FFE600] text-sm">[ {scanProgress}% ]</span>
              </div>
              <div className="w-full h-4 bg-[#121318] border-2 border-black p-0.5">
                <div
                  className="h-full bg-[#FFE600] transition-all duration-200"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>

            {/* Advance button (unlocked when progress reaches 100%) */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={scanProgress < 100}
                onClick={() => setStep(5)}
                className={`px-6 py-3 font-black uppercase text-sm border-2 border-black flex items-center gap-2 transition-all ${
                  scanProgress >= 100
                    ? "bg-[#FFE600] text-black hover:bg-[#FFF04D] active:translate-x-0.5 active:translate-y-0.5 shadow-[4px_4px_0px_#000000] cursor-pointer"
                    : "bg-zinc-800 text-zinc-600 border-[#262833] cursor-not-allowed"
                }`}
              >
                <span>View Top Reciprocal Matches</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 5: MATCH RESULTS DECK ================= */}
        {step === 5 && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="inline-block bg-[#FFE600] text-black text-[11px] font-black uppercase px-2.5 py-0.5 border border-black mb-1 shadow-[2px_2px_0px_#000000]">
                  Step 5 • AI Skill Match Analyzer Results
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">
                  Your High-Synergy Peer Matches
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 font-mono">
                  Ranked by 4-factor compatibility: Skill (50%), Comm (20%), Cohort (15%), Location (15%).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-[#A3E635] text-black font-black text-xs border-2 border-black shadow-[2px_2px_0px_#000000] uppercase">
                  🪙 100 Baseline Credits Ready
                </div>
              </div>
            </div>

            {/* Peer Match Cards Deck */}
            <div className="space-y-4">
              {matchedPeers.map((peer, idx) => {
                const isTopMatch = idx === 0;
                return (
                  <div
                    key={peer.id}
                    className={`p-5 bg-[#121318] border-2 transition-all ${
                      isTopMatch
                        ? "border-[#FFE600] shadow-[4px_4px_0px_#FFE600]"
                        : "border-[#262833] hover:border-zinc-500 shadow-[3px_3px_0px_#000000]"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Avatar & Info */}
                      <div className="flex items-start gap-3.5">
                        <div className="relative">
                          <img
                            src={peer.avatar}
                            alt={peer.name}
                            className="w-14 h-14 object-cover border-2 border-black"
                          />
                          {isTopMatch && (
                            <span className="absolute -top-2 -left-2 bg-[#FFE600] text-black font-black text-[9px] px-1 border border-black uppercase">
                              #1 FIT
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-black uppercase text-white">
                              {peer.name}
                            </span>
                            <span className="text-[10px] bg-[#A3E635] text-black font-black px-1.5 py-0.5 border border-black uppercase flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 stroke-[3]" />
                              PEER VERIFIED
                            </span>
                          </div>

                          <div className="text-xs text-zinc-400 font-mono mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>📍 {peer.city}</span>
                            <span>•</span>
                            <span>{peer.age} yrs</span>
                            <span>•</span>
                            <span className="text-yellow-400 font-bold flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-400" />
                              {peer.rating} ({peer.reviewsCount} reviews)
                            </span>
                          </div>

                          <p className="text-xs text-zinc-300 mt-2 line-clamp-2">{peer.bio}</p>
                        </div>
                      </div>

                      {/* Right: Prominent Match Badge */}
                      <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0">
                        <div className="px-3.5 py-1.5 bg-[#FFE600] text-black font-black text-sm sm:text-base border-2 border-black uppercase shadow-[2px_2px_0px_#000000]">
                          {peer.compatibilityScore}% MATCH
                        </div>
                        <div className="text-[11px] font-mono font-bold text-zinc-400 bg-[#16181F] px-2 py-0.5 border border-[#262833]">
                          {peer.rateCredits} CREDITS / HR
                        </div>
                      </div>
                    </div>

                    {/* Compatibility Breakdown Chips */}
                    <div className="mt-4 pt-3 border-t-2 border-[#262833] flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase font-bold">
                        BREAKDOWN:
                      </span>
                      <span className="text-[11px] font-mono font-black px-2 py-0.5 bg-black border border-[#FFE600] text-[#FFE600] uppercase">
                        SKILL: {peer.breakdown.skillScore}/50 PTS
                      </span>
                      <span className="text-[11px] font-mono font-black px-2 py-0.5 bg-black border border-[#38BDF8] text-[#38BDF8] uppercase">
                        COMM: {peer.breakdown.commScore}/20 PTS ({peer.communicationStyle})
                      </span>
                      <span className="text-[11px] font-mono font-black px-2 py-0.5 bg-black border border-[#A3E635] text-[#A3E635] uppercase">
                        COHORT: {peer.breakdown.ageScore}/15 PTS
                      </span>
                      <span className="text-[11px] font-mono font-black px-2 py-0.5 bg-black border border-zinc-600 text-zinc-300 uppercase">
                        LOC: {peer.breakdown.locScore}/15 PTS
                      </span>
                    </div>

                    {/* Skill Tags */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-[#0E0F14] border border-[#262833]">
                        <span className="text-[10px] font-mono text-zinc-500 font-black uppercase block mb-1">
                          CAN TEACH YOU:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {peer.teaches.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-[#FFE600]/15 text-[#FFE600] border border-[#FFE600]/40 text-[11px] font-bold"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-2 bg-[#0E0F14] border border-[#262833]">
                        <span className="text-[10px] font-mono text-zinc-500 font-black uppercase block mb-1">
                          LOOKING TO LEARN:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {peer.learns.map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 bg-sky-950/60 text-[#38BDF8] border border-sky-800 text-[11px] font-bold"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Direct Actions: Propose Swap / Start WebRTC */}
                    <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5">
                      <div className="text-[11px] text-[#A3E635] font-mono font-bold flex items-center gap-1">
                        <span>✦</span>
                        <span>{peer.highlightReason}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            showLocalToast(
                              `⚡ Swap proposal initialized for ${peer.name}! 10 credits held in escrow.`
                            )
                          }
                          className="px-3.5 py-1.5 bg-[#FFE600] text-black font-black uppercase text-xs border-2 border-black hover:bg-[#FFF04D] active:translate-x-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_#000000] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Propose Swap (10c) ⚡</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            showLocalToast(
                              `🎥 WebRTC peer channel requested for ${peer.name}. Ready to launch interactive room.`
                            )
                          }
                          className="px-3 py-1.5 bg-[#16181F] text-zinc-200 hover:text-white font-black uppercase text-xs border-2 border-[#262833] hover:border-[#FFE600] flex items-center gap-1.5 cursor-pointer"
                        >
                          <Video className="w-3.5 h-3.5 text-[#38BDF8]" />
                          <span>Start WebRTC</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Finalize Button */}
            <div className="pt-4 p-5 bg-[#121318] border-2 border-[#FFE600] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="text-sm font-black uppercase text-white flex items-center gap-2">
                  <span>Profile Configured & 100 Baseline Credits Issued</span>
                  <span className="text-[10px] bg-[#A3E635] text-black font-black px-1.5 py-0.5 border border-black">
                    ESCROW READY
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">
                  Your customized reciprocal swapper vector is now indexed in the live peer directory.
                </p>
              </div>

              <button
                type="button"
                onClick={handleFinalize}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#FFE600] text-black font-black uppercase text-sm border-2 border-black hover:bg-[#FFF04D] active:translate-x-0.5 active:translate-y-0.5 shadow-[4px_4px_0px_#000000] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Complete Onboarding & Enter Dashboard</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Global Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#FFE600] text-black border-2 border-black shadow-[4px_4px_0px_#000000] font-mono text-xs font-black uppercase flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200">
          <Zap className="w-4 h-4 fill-black" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );

  // If used as an overlay modal
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
        {content}
      </div>
    );
  }

  // If used as full page flow
  return content;
}
