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
} from "lucide-react";

export default function SessionRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { sessions, completeSession, showToast } = useSkillSwap();

  const sessionId = (params?.id as string) || "session-python-arun";
  const session = sessions.find((s) => s.id === sessionId) || sessions[0];

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

  const formatCountdown = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      { sender: "You", text: newMessage.trim(), time: "Now" },
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
      <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center p-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Session Not Found</h2>
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
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      {/* Top Session Header */}
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200/90 py-3.5 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-none">
                {session.skillTitle}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
                1-on-1 Swap
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Teacher: <span className="font-semibold text-gray-700">{session.teacherName}</span>
            </p>
          </div>
        </div>

        {/* Live Countdown / Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-mono font-semibold">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>
              {isJoined
                ? "Live WebRTC P2P Active"
                : `Session starting in ${formatCountdown(secondsRemaining)}`}
            </span>
          </div>

          <button
            type="button"
            onClick={handleMarkComplete}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
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
          <div className="relative aspect-video sm:aspect-[16/9] w-full bg-gray-950 rounded-3xl overflow-hidden shadow-lg border border-gray-800 flex items-center justify-center">
            {/* Pre-join or Active Preview State */}
            <div className="text-center p-6 max-w-md">
              <div className="w-16 h-16 rounded-full bg-gray-900 text-indigo-400 border border-gray-800 flex items-center justify-center mx-auto mb-4">
                <VideoIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Ready for your swap session?</h3>
              <p className="text-xs text-gray-400 mt-1">
                Direct WebRTC audio, video, screen-sharing, collaborative whiteboard, and real-time live captions.
              </p>
              <button
                type="button"
                onClick={() => setIsJoined(true)}
                className="mt-6 px-7 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Launch WebRTC Session</span>
              </button>
            </div>
          </div>

          {/* Interactive Collaborative Scratchpad & Notes */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-900">
                <Edit3 className="w-4 h-4 text-indigo-600" />
                <span>Collaborative Code & Notes Scratchpad</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">Auto-saving live</span>
            </div>
            <textarea
              value={scratchpadText}
              onChange={(e) => setScratchpadText(e.target.value)}
              rows={8}
              className="mt-3 w-full font-mono text-xs text-gray-800 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-y leading-relaxed"
            />
          </div>
        </div>

        {/* Right 4 Columns: Session Details, Agenda, & Chat */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Session Overview Card */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-5 sm:p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              Session Overview
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Topic:</span>
                <span className="font-semibold text-gray-900">{session.skillTitle}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Instructor:</span>
                <span className="font-semibold text-gray-900">{session.teacherName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-semibold text-gray-900">{session.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Escrow Value:</span>
                <span className="font-bold text-indigo-600 font-mono">
                  🪙 {session.credits} Credits
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-start gap-2 text-[11px] text-gray-500 leading-normal">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Credits remain safely locked until you click &quot;Mark Complete&quot;.
              </span>
            </div>
          </div>

          {/* Tabbed Side Panel: Agenda & Live Chat */}
          <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-5 flex-1 flex flex-col">
            <div className="flex items-center gap-4 pb-3 border-b border-gray-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("notes")}
                className={`pb-1 transition-colors ${
                  activeTab === "notes"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                Agenda Checklist
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={`pb-1 transition-colors ${
                  activeTab === "chat"
                    ? "text-indigo-600 border-b-2 border-indigo-600"
                    : "text-gray-400 hover:text-gray-700"
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
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-50 cursor-pointer text-xs text-gray-700 transition-colors"
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
                          ? "bg-indigo-50 text-indigo-950 ml-6"
                          : "bg-gray-100 text-gray-800 mr-6"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                        <span className="font-semibold">{msg.sender}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p className="leading-normal">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSendMessage}
                  className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Send a message..."
                    className="flex-1 px-3 py-2 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-600"
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
          currentUserId="user-sabareesh"
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
