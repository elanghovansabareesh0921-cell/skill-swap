"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import RatingModal from "@/components/RatingModal";
import VideoRoom from "@/components/VideoRoom";
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
} from "lucide-react";

export default function SessionRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { sessions, completeSession, showToast, currentUser } = useSkillSwap();

  const sessionId = (params?.id as string) || "session-python-arun";
  const session = sessions.find((s) => s.id === sessionId) || sessions[0];

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
  const [activeTab, setActiveTab] = useState<"notes" | "agenda" | "chat">("notes");

  // Countdown simulation: starts at 12:34
  const [secondsRemaining, setSecondsRemaining] = useState(12 * 60 + 34);

  // Scratchpad & Chat
  const [scratchpadText, setScratchpadText] = useState(
    `# Session Scratchpad: Python Async & Generators\n\n- Key Concept: Yield produces a value and pauses execution state.\n- Coroutines are declared with 'async def' and scheduled on asyncio event loop.\n\n\`\`\`python\nasync def fetch_user_data(user_id):\n    print(f"Fetching {user_id}...")\n    await asyncio.sleep(1)\n    return {"id": user_id, "status": "active"}\n\`\`\`\n\nNext exercise:\nImplement a streaming async generator to process incoming telemetry items.`
  );

  const [chatMessages, setChatMessages] = useState([
    {
      sender: session?.teacherName || "Arun Kumar",
      text: "Hey! Welcome to the session. Whenever you're ready, click Join Session and we'll dive right in.",
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
    completeSession(sessionId, data);
    router.push("/credits");
  };

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F9FAFB] dark:bg-[#090D16] text-gray-900 dark:text-gray-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Session Not Found</h2>
            <Link
              href="/dashboard"
              className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB] dark:bg-[#090D16] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Top Session Header */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-[#0B0F19] border-b border-gray-200/90 dark:border-gray-800 py-3.5 px-4 sm:px-8 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-none">
                {session.skillTitle}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold">
                1-on-1 Swap
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Teacher: <span className="font-semibold text-gray-700 dark:text-gray-300">{session.teacherName}</span>
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
                showToast("Room Link Copied", "Open in a second tab or send to peer to test WebRTC P2P streaming!", "success");
                setTimeout(() => setCopiedLink(false), 2000);
              }
            }}
            className="px-3 py-1.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#161327] hover:bg-zinc-50 dark:hover:bg-[#231C3D] text-xs font-semibold text-[#7C3AED] dark:text-[#A78BFA] flex items-center gap-1.5 transition-colors"
            title="Copy room URL to test with peer in another tab"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? "Link Copied!" : "Share Room Link"}</span>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDE9FE] dark:bg-[#231C3D] border border-[#DDD6FE] dark:border-[#3B2D66] text-[#7C3AED] dark:text-[#A78BFA] text-xs font-mono font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#7C3AED]" />
            <span>
              {isJoined
                ? "Live WebRTC P2P Active"
                : `Session in ${formatCountdown(secondsRemaining)}`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleMarkComplete}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Complete</span>
          </button>
        </div>
      </header>

      {/* Main Focus Area: Video Stage & Interactive Workspace */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Center 8 Columns: Live Stage & Collaborative Workspace */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Video Stream Stage */}
          <div className="relative aspect-video sm:aspect-[16/9] w-full bg-[#161327] rounded-3xl overflow-hidden shadow-2xl border border-[#2D264E] flex items-center justify-center">
            {/* Pre-join or Active Preview State */}
            <div className="text-center p-6 max-w-md space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#231C3D] text-[#A78BFA] border border-[#3B2D66] flex items-center justify-center mx-auto shadow-md">
                <VideoIcon className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Encrypted Peer-to-Peer</span>
                </span>
                <h3 className="text-xl font-extrabold text-white mt-1">Ready for your swap session?</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Native WebRTC audio, video, screen-sharing, collaborative code notes, whiteboard, and real-time live captions.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsJoined(true)}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-[#7C3AED]/25 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Launch WebRTC Session</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Collaborative Scratchpad & Notes */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-900 dark:text-white">
                <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Collaborative Code & Notes Scratchpad</span>
              </div>
              <span className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">Auto-saving live</span>
            </div>
            <textarea
              value={scratchpadText}
              onChange={(e) => setScratchpadText(e.target.value)}
              rows={8}
              className="mt-3 w-full font-mono text-xs text-gray-800 dark:text-gray-200 bg-gray-50/70 dark:bg-gray-800/60 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Right 4 Columns: Session Details, Agenda, & Chat */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Session Overview Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-sm p-5 sm:p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-4">
              Session Overview
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Topic:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{session.skillTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Instructor:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{session.teacherName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{session.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-gray-400">Escrow Value:</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                  🪙 {session.credits} Credits
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Credits remain safely locked until you click &quot;Mark Complete&quot;.
              </span>
            </div>
          </div>

          {/* Tabbed Side Panel: Agenda & Live Chat */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/90 dark:border-gray-800 shadow-sm p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-4 pb-3 border-b border-gray-100 dark:border-gray-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`pb-1 transition-colors ${
                  activeTab === "notes"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Agenda Checklist
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`pb-1 transition-colors ${
                  activeTab === "chat"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                Session Chat ({chatMessages.length})
              </button>
            </div>

            {activeTab === "notes" ? (
              <div className="mt-4 space-y-2.5 flex-1">
                {(session.agenda || [
                  "Warm-up & objectives alignment",
                  "Core hands-on coding pattern",
                  "Real-world edge cases",
                  "Actionable resource checklist",
                ]).map((item, idx) => (
                  <label
                    key={idx}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer text-xs text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={idx === 0}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
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
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 ml-6"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mr-6"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400 dark:text-gray-500 mb-1">
                        <span className="font-semibold">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="leading-normal">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Send a message..."
                    className="flex-1 px-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Native WebRTC VideoRoom Component */}
      {isJoined && (
        <VideoRoom
          sessionId={sessionId}
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
