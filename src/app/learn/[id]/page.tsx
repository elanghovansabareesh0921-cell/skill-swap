"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RatingModal from "@/components/RatingModal";
import VideoRoom from "@/components/VideoRoom";
import CoinIcon from "@/components/common/CoinIcon";
import { useSkillSwap } from "@/context/SkillSwapContext";
import {
  Mic,
  Video as VideoIcon,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Send,
  Edit3,
  Play,
  MonitorUp,
  Share2,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SessionRoomPage() {
  const params = useParams();
  const router = useRouter();
  const {
    sessions,
    completeSession,
    creditBookings,
    sessionRooms,
    releaseEscrowPayout,
    showToast,
    currentUser,
  } = useSkillSwap();

  const rawId = (params?.id as string) || "session-python-arun";

  // Find matching booking or room
  const matchingRoom = sessionRooms.find(
    (r) => r.roomToken === rawId || r.id === rawId
  );
  const matchingBooking = creditBookings.find(
    (b) => b.roomToken === rawId || b.id === rawId
  );
  const foundSession = sessions.find(
    (s) => s.id === rawId || s.roomUrl?.includes(rawId)
  );

  const session = foundSession || {
    id: rawId,
    skillTitle:
      matchingRoom?.skillName ||
      matchingBooking?.skillName ||
      "1-on-1 Skill Swap Session",
    teacherName:
      matchingRoom?.peerName || matchingBooking?.teacherName || "Arun Kumar",
    teacherAvatar:
      matchingBooking?.teacherAvatar ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    teacherId: matchingBooking?.teacherId || "arun-kumar",
    date: "Today",
    time: "Live Classroom",
    duration: "45 mins",
    credits: matchingBooking?.creditsAmount || 50,
    status: (matchingRoom?.status === "completed"
      ? "completed"
      : "upcoming") as any,
    roomUrl: `/learn/${rawId}`,
    agenda: [
      `1-on-1 Session for ${
        matchingRoom?.skillName || matchingBooking?.skillName || "Skill Swap"
      }`,
      "Real-time audio/video exchange & shared code scratchpad",
      "Milestone review and session completion trigger",
    ],
  };

  // Unique peer identifier per browser window to allow seamless cross-tab & remote testing
  const [peerId, setPeerId] = useState<string>("");
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    const base = currentUser?.id || "peer";
    const unique = Math.random().toString(36).substring(2, 8);
    setPeerId(`${base}_${unique}`);
  }, [currentUser]);

  // In-session control states
  const [isJoined, setIsJoined] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "agenda" | "chat">(
    "notes"
  );

  // Countdown simulation: starts at 12:34
  const [secondsRemaining, setSecondsRemaining] = useState(12 * 60 + 34);

  // Scratchpad & Chat
  const [scratchpadText, setScratchpadText] = useState(
    `# Session Scratchpad: ${session.skillTitle}\n\n- Key Concept: Yield produces a value and pauses execution state.\n- Coroutines are declared with 'async def' and scheduled on asyncio event loop.\n\n\`\`\`python\nasync def fetch_user_data(user_id):\n    print(f"Fetching {user_id}...")\n    await asyncio.sleep(1)\n    return {"id": user_id, "status": "active"}\n\`\`\`\n\nNext exercise:\nImplement a streaming async generator to process incoming telemetry items.`
  );

  const [chatMessages, setChatMessages] = useState([
    {
      sender: session?.teacherName || "Arun Kumar",
      text: "Hey! Welcome to the virtual classroom. Click Join Session to enable audio/video and collaborative whiteboard.",
      time: "6:00 PM",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  // Live timer countdown
  useEffect(() => {
    if (secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        sender: "You",
        text: newMessage.trim(),
        time: "Just now",
      },
    ]);
    setNewMessage("");

    // Simulated reply from mentor
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: session?.teacherName || "Arun Kumar",
          text: "Got it! Let's examine line 4 of the generator block.",
          time: "Just now",
        },
      ]);
    }, 1200);
  };

  const handleMarkComplete = () => {
    setIsRatingModalOpen(true);
  };

  const handleRatingSubmit = (data: { rating: number; comment: string }) => {
    // Release escrow if booked via credits
    if (matchingBooking && matchingBooking.escrowStatus === "held") {
      releaseEscrowPayout(matchingBooking.id);
    }
    completeSession(session.id, data);
    showToast(
      "Session Completed & Escrow Released! 💰",
      "Held credits have been safely released to the teacher's wallet.",
      "success"
    );
    router.push("/dashboard");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col ambient-bg text-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div className="glass p-8 rounded-3xl border-white/10 space-y-4">
            <h2 className="text-xl font-bold text-white">Session Not Found</h2>
            <Link
              href="/dashboard"
              className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg"
              style={{
                background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
              }}
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col ambient-bg text-white pb-16">
      {/* ── TOP SESSION HEADER ── */}
      <header className="sticky top-0 z-40 w-full glass border-b border-white/10 py-3.5 px-4 sm:px-8 flex items-center justify-between backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl text-white/50 hover:text-white glass hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white leading-none">
                {session.skillTitle}
              </h1>
              <span className="px-2 py-0.5 rounded-md glass border-cyan-500/20 text-cyan-300 text-[10px] font-semibold">
                1-on-1 Swap
              </span>
            </div>
            <p className="text-xs text-white/45 mt-1">
              Teacher:{" "}
              <span className="font-semibold text-white/80">
                {session.teacherName}
              </span>
            </p>
          </div>
        </div>

        {/* Live Countdown, Copy Link & Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard.writeText(window.location.href);
                setCopiedLink(true);
                showToast(
                  "Room Link Copied",
                  "Open in a second tab or send to peer to test WebRTC P2P streaming!",
                  "success"
                );
                setTimeout(() => setCopiedLink(false), 2000);
              }
            }}
            className="px-3 py-1.5 rounded-xl glass hover:bg-white/10 text-xs font-semibold text-cyan-300 border-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy room URL to test with peer in another tab"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {copiedLink ? "Link Copied!" : "Share Link"}
            </span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border-white/10 text-xs font-mono font-semibold">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-white/80">
              {isJoined
                ? "Live WebRTC P2P Active"
                : `Session in ${formatCountdown(secondsRemaining)}`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleMarkComplete}
            className="px-4 py-1.5 rounded-xl text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-95"
            style={{
              background: "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)",
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Complete</span>
          </button>
        </div>
      </header>

      {/* ── MAIN FOCUS AREA: VIDEO STAGE & INTERACTIVE WORKSPACE ── */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-4">
        {matchingBooking && (
          <div className="p-3.5 rounded-2xl glass border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Escrow Active:</strong> 🪙 {matchingBooking.creditsAmount} Credits locked in escrow. Released to {session.teacherName} upon completing the session.
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider text-[10px] border border-emerald-500/30">
              Escrow: {matchingBooking.escrowStatus}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center 8 Columns: Live Stage & Collaborative Workspace */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Video Stream Stage */}
            <div className="relative aspect-video sm:aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-2xl glass-elevated border-white/10 flex items-center justify-center">
              <div className="text-center p-6 max-w-md space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center justify-center mx-auto shadow-xl ring-4 ring-violet-500/10">
                  <VideoIcon className="w-8 h-8" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Encrypted Peer-to-Peer</span>
                  </span>
                  <h3 className="text-xl font-extrabold text-white mt-1">
                    Ready for your swap session?
                  </h3>
                  <p className="text-xs text-white/50 mt-1 leading-relaxed">
                    Native WebRTC audio, video, screen-sharing, collaborative code notes, whiteboard, and real-time live captions.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsJoined(true)}
                    className="w-full sm:w-auto px-8 py-3 rounded-2xl text-white font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-95 active:scale-[0.99]"
                    style={{
                      background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                      boxShadow: "0 4px 18px rgba(124,108,246,0.35)",
                    }}
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Launch WebRTC Session</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Collaborative Scratchpad & Notes */}
            <div className="glass rounded-3xl border-white/10 shadow-xl p-5 flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-white/8">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Edit3 className="w-4 h-4 text-violet-400" />
                  <span>Collaborative Code &amp; Notes Scratchpad</span>
                </div>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Auto-saving live
                </span>
              </div>
              <textarea
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                rows={8}
                className="mt-3 w-full font-mono text-xs text-white/90 bg-white/[0.03] p-4 rounded-xl border border-white/10 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Right 4 Columns: Session Details, Agenda, & Chat */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            {/* Session Overview Card */}
            <div className="glass rounded-3xl border-white/10 shadow-xl p-5 sm:p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/40">
                Session Overview
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Topic:</span>
                  <span className="font-semibold text-white truncate max-w-[180px]">
                    {session.skillTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Instructor:</span>
                  <span className="font-semibold text-white">
                    {session.teacherName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Duration:</span>
                  <span className="font-semibold text-white">
                    {session.duration}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/50">Escrow Value:</span>
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <CoinIcon size={12} /> {session.credits} Credits
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/8 flex items-start gap-2 text-[11px] text-white/50 leading-normal">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Credits remain safely locked until you click &quot;Mark Complete&quot;.
                </span>
              </div>
            </div>

            {/* Tabbed Side Panel: Agenda & Live Chat */}
            <div className="glass rounded-3xl border-white/10 shadow-xl p-5 flex-1 flex flex-col">
              <div className="flex items-center gap-4 pb-3 border-b border-white/8 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={`pb-1 transition-all cursor-pointer ${
                    activeTab === "notes"
                      ? "text-cyan-300 border-b-2 border-cyan-400"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Agenda Checklist
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("chat")}
                  className={`pb-1 transition-all cursor-pointer ${
                    activeTab === "chat"
                      ? "text-cyan-300 border-b-2 border-cyan-400"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Session Chat ({chatMessages.length})
                </button>
              </div>

              {activeTab === "notes" ? (
                <div className="mt-4 space-y-2.5 flex-1">
                  {(
                    session.agenda || [
                      "Warm-up & objectives alignment",
                      "Core hands-on coding pattern",
                      "Real-world edge cases",
                      "Actionable resource checklist",
                    ]
                  ).map((item, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-white/[0.04] cursor-pointer text-xs text-white/80 transition-colors"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={idx === 0}
                        className="rounded border-white/20 text-violet-500 focus:ring-violet-400 mt-0.5 accent-violet-500"
                      />
                      <span className="leading-snug">{item}</span>
                    </label>
                  ))}
                </div>
              ) : (
                /* Live Chat Panel */
                <div className="mt-3 flex-1 flex flex-col justify-between h-72">
                  <div className="space-y-2.5 overflow-y-auto pr-1">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`p-2.5 rounded-xl text-xs ${
                          msg.sender === "You"
                            ? "bg-violet-600/30 border border-violet-500/30 text-white ml-6"
                            : "bg-white/[0.04] border border-white/8 text-white/90 mr-6"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                          <span className="font-semibold">{msg.sender}</span>
                          <span>{msg.time}</span>
                        </div>
                        <p className="leading-normal">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  <form
                    onSubmit={handleSendMessage}
                    className="mt-3 pt-3 border-t border-white/8 flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Send a message..."
                      className="flex-1 px-3 py-2 text-xs bg-white/[0.04] rounded-xl border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50"
                    />
                    <button
                      type="submit"
                      className="p-2 rounded-xl text-white shadow-md cursor-pointer"
                      style={{
                        background:
                          "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                      }}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Native WebRTC VideoRoom Component */}
      {isJoined && (
        <VideoRoom
          sessionId={session.id}
          currentUserId={peerId || currentUser?.id || "guest-peer"}
          peerName={session.teacherName || "Arun Kumar"}
          onClose={() => setIsJoined(false)}
          onComplete={() => {
            setIsJoined(false);
            handleMarkComplete();
          }}
        />
      )}

      {/* Post-Session Rating & Escrow Release Modal */}
      <RatingModal
        isOpen={isRatingModalOpen}
        teacherName={session.teacherName}
        skillTitle={session.skillTitle}
        onClose={() => setIsRatingModalOpen(false)}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
}
