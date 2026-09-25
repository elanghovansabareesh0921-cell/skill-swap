"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import CoinIcon from "@/components/common/CoinIcon";
import VerifiedBadge from "@/components/common/VerifiedBadge";
import { useSkillSwap, ChatConversation, ChatMessage } from "@/context/SkillSwapContext";
import {
  Search,
  Send,
  ArrowLeft,
  Check,
  CheckCheck,
  Video,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CalendarPlus,
  Clock,
  Calendar,
  X,
  Repeat,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PeerConversation extends ChatConversation {
  sessionType?: "direct" | "escrow";
  sessionState?: "requested" | "active" | "complete";
  lockedCredits?: number;
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const partnerIdParam = searchParams.get("partnerId");
  const partnerNameParam = searchParams.get("partnerName");
  const roomIdParam = searchParams.get("roomId");

  const {
    currentUser,
    conversations,
    messages,
    sendMessage,
    scheduleSessionRoom,
    sessionRooms,
    showToast,
  } = useSkillSwap();

  // Extend mock conversations with session types and states
  const enhancedConversations: PeerConversation[] = conversations.map((c, i) => ({
    ...c,
    sessionType: i % 2 === 0 ? "direct" : "escrow",
    sessionState: i === 0 ? "active" : i === 1 ? "requested" : "complete",
    lockedCredits: i % 2 === 0 ? 0 : 10,
  }));

  const [activeConvId, setActiveConvId] = useState<string>(
    partnerIdParam ? `conv-${partnerIdParam}` : enhancedConversations[0]?.id || "conv-1"
  );
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // In-Chat Session Scheduler State
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("Tomorrow");
  const [scheduledTime, setScheduledTime] = useState("6:00 PM – 7:00 PM");
  const [sessionLength, setSessionLength] = useState<60>(60);
  const [sessionTopic, setSessionTopic] = useState("1-Hour Skill Swap Session");
  const [schedulingLoading, setSchedulingLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeConvId]);

  const activeConversation: PeerConversation =
    enhancedConversations.find((c) => c.id === activeConvId) ||
    enhancedConversations[0] || {
      id: "conv-fallback",
      participantId: "arun-kumar",
      participantName: partnerNameParam || "Arun Kumar",
      participantAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      participantRole: "Python & Machine Learning",
      lastMessage: "Looking forward to our skill swap session!",
      lastMessageTime: "Just now",
      unreadCount: 0,
      online: true,
      sessionType: "direct",
      sessionState: "active",
      lockedCredits: 0,
    };

  interface MessageItem {
    id: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: string;
    read: boolean;
  }

  const [chatMessages, setChatMessages] = useState<Record<string, MessageItem[]>>({
    "conv-1": [
      {
        id: "m-1",
        senderId: "arun-kumar",
        senderName: "Arun Kumar",
        text: "Hi! I saw your profile and would love to trade skills. I can teach Python & ML in exchange for React & Next.js mentorship.",
        timestamp: "10:30 AM",
        read: true,
      },
      {
        id: "m-2",
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: "That sounds perfect! Let's schedule a 1-hour session. Does tomorrow evening work for you?",
        timestamp: "10:32 AM",
        read: true,
      },
    ],
  });

  const activeMessages = chatMessages[activeConvId] || [
    {
      id: "m-1",
      senderId: activeConversation.participantId,
      senderName: activeConversation.participantName,
      text: "Hi! I saw your profile and would love to trade skills. I can teach Python & ML in exchange for React & Next.js mentorship.",
      timestamp: "10:30 AM",
      read: true,
    },
    {
      id: "m-2",
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: "That sounds perfect! Let's schedule a 1-hour session. Does tomorrow evening work for you?",
      timestamp: "10:32 AM",
      read: true,
    },
  ];

  const filteredConversations = enhancedConversations.filter(
    (c) =>
      c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participantRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: MessageItem = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: true,
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || activeMessages), newMsg],
    }));

    sendMessage(activeConversation.participantId, inputText.trim());
    setInputText("");
  };

  const handleConfirmSchedule = () => {
    setSchedulingLoading(true);
    setTimeout(() => {
      const roomToken = `room-${Date.now()}`;
      const start = new Date(Date.now() + 86400000).toISOString();
      const end = new Date(Date.now() + 86400000 + 3600000).toISOString();

      scheduleSessionRoom({
        chatRoomId: activeConvId,
        scheduledStart: start,
        scheduledEnd: end,
        skillName: sessionTopic,
        peerName: activeConversation.participantName,
      });

      const schedMsg: MessageItem = {
        id: `m-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: `📅 Scheduled a 1-Hour Session for ${scheduledDate} (${scheduledTime}). Join classroom: /learn/${roomToken}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        read: true,
      };

      setChatMessages((prev) => ({
        ...prev,
        [activeConvId]: [...(prev[activeConvId] || activeMessages), schedMsg],
      }));

      setSchedulingLoading(false);
      setShowSchedulerModal(false);
      showToast("1-Hour session scheduled! Link shared in chat.", "success");
    }, 600);
  };

  const handleMarkComplete = () => {
    const compMsg: MessageItem = {
      id: `m-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      text: "✅ Session marked complete! Escrow credits released to the teacher.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: true,
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || activeMessages), compMsg],
    }));

    showToast("Session complete: 10 credits released!", "success");
  };

  return (
    <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex flex-col h-[calc(100vh-84px)]">
      <div className="flex-1 rounded-3xl glass border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row relative">
        {/* ── LEFT: THREAD LIST ── */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-white/8 flex flex-col bg-white/[0.01] ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-white/8 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-white">Messages</h2>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cyan-300 glass px-2.5 py-1 rounded-full border-cyan-500/20">
                <CoinIcon size={12} />
                <span>1h = 10c</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isActive = conv.id === activeConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setMobileView("chat");
                    }}
                    className={`p-4 cursor-pointer transition-all flex items-start gap-3 relative ${
                      isActive
                        ? "bg-white/[0.07] border-l-2 border-l-violet-400"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.participantAvatar}
                        alt={conv.participantName}
                        className="w-11 h-11 rounded-xl object-cover border border-white/10 ring-1 ring-white/10"
                      />
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#08090D]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">
                          {conv.participantName}
                        </span>
                        <span className="text-[10px] text-white/40 shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      {/* Session Type & State Pills */}
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                            conv.sessionType === "direct"
                              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          }`}
                        >
                          {conv.sessionType === "direct"
                            ? "Direct Swap"
                            : "Escrow (10c)"}
                        </span>
                        <span
                          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${
                            conv.sessionState === "active"
                              ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                              : conv.sessionState === "requested"
                              ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                              : "bg-white/5 text-white/50 border border-white/10"
                          }`}
                        >
                          {conv.sessionState}
                        </span>
                      </div>

                      <p className="text-xs text-white/50 truncate mt-1.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-white/40">
                No conversations found.
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: CHAT LOG & COMPOSER ── */}
        <div
          className={`flex-1 flex flex-col bg-transparent ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Active Chat Header */}
          <div className="p-4 border-b border-white/8 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileView("list")}
                className="md:hidden p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={activeConversation.participantAvatar}
                  alt={activeConversation.participantName}
                  className="w-10 h-10 rounded-xl object-cover border border-white/10"
                />
                {activeConversation.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#08090D]" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">
                    {activeConversation.participantName}
                  </h3>
                  <VerifiedBadge size="sm" showLabel={false} />
                </div>
                <p className="text-[11px] text-white/45">
                  {activeConversation.participantRole} ·{" "}
                  {activeConversation.sessionType === "direct"
                    ? "Direct Swap"
                    : "10 Credits Escrow"}
                </p>
              </div>
            </div>

            {/* In-Chat Actions: Schedule & Mark Complete */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSchedulerModal(true)}
                className="px-3.5 py-1.5 rounded-xl glass hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border-white/10"
              >
                <Calendar className="w-3.5 h-3.5 text-violet-400" />
                <span className="hidden sm:inline">Schedule 1 Hour</span>
              </button>

              {activeConversation.sessionState === "active" && (
                <button
                  type="button"
                  onClick={handleMarkComplete}
                  className="px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #10B981 0%, #06B6D4 100%)",
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Complete</span>
                </button>
              )}
            </div>
          </div>

          {/* Session Type Reminder Banner */}
          <div className="px-4 py-2.5 bg-white/[0.015] border-b border-white/6 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/60">
              {activeConversation.sessionType === "direct" ? (
                <>
                  <Repeat className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    <strong className="text-white">Direct Swap:</strong> Two peers teach each other; no credits move.
                  </span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    <strong className="text-white">Credit Escrow:</strong> 10 credits held safely until session completion.
                  </span>
                </>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/[0.04] text-white/60 border border-white/8">
              State: {activeConversation.sessionState}
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {activeMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4.5 py-3 text-xs sm:text-sm leading-relaxed shadow-lg ${
                      isMe
                        ? "text-white rounded-br-sm"
                        : "glass-subtle text-white/90 rounded-bl-sm border-white/10"
                    }`}
                    style={
                      isMe
                        ? {
                            background:
                              "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                          }
                        : undefined
                    }
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-white/35 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer */}
          <form
            onSubmit={handleSend}
            className="p-3 sm:p-4 border-t border-white/8 flex items-center gap-2 bg-white/[0.02]"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeConversation.participantName}...`}
              className="flex-1 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 rounded-2xl text-white transition-all shadow-lg shrink-0 cursor-pointer disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
              }}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* SCHEDULE SESSION MODAL */}
      <AnimatePresence>
        {showSchedulerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl glass-elevated border-white/15 shadow-2xl p-6 space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <CalendarPlus className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">
                    Schedule 1-Hour Session
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSchedulerModal(false)}
                  className="text-white/40 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl glass border-cyan-500/20 text-cyan-200 flex items-center gap-2 font-semibold">
                  <CoinIcon size={14} />
                  <span>Standard 1-Hour Session · 10 Credits or Direct Swap</span>
                </div>

                <div>
                  <label className="block text-white/60 font-medium mb-1.5">
                    Topic / Exchange Goal
                  </label>
                  <input
                    type="text"
                    value={sessionTopic}
                    onChange={(e) => setSessionTopic(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/60 font-medium mb-1.5">
                      Day
                    </label>
                    <select
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500/50 [&>option]:bg-[#0d0f17] [&>option]:text-white"
                    >
                      <option value="Today">Today</option>
                      <option value="Tomorrow">Tomorrow</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/60 font-medium mb-1.5">
                      Time Slot (1 Hour)
                    </label>
                    <select
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white focus:outline-none focus:border-violet-500/50 [&>option]:bg-[#0d0f17] [&>option]:text-white"
                    >
                      <option value="10:00 AM – 11:00 AM">10:00 AM – 11:00 AM</option>
                      <option value="2:00 PM – 3:00 PM">2:00 PM – 3:00 PM</option>
                      <option value="6:00 PM – 7:00 PM">6:00 PM – 7:00 PM</option>
                      <option value="8:00 PM – 9:00 PM">8:00 PM – 9:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSchedulerModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/50 hover:text-white glass hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSchedule}
                  disabled={schedulingLoading}
                  className="px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-lg cursor-pointer hover:opacity-95"
                  style={{
                    background: "linear-gradient(135deg, #7C6CF6 0%, #06B6D4 100%)",
                  }}
                >
                  {schedulingLoading ? "Scheduling..." : "Confirm 1-Hour Session"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen flex flex-col ambient-bg text-white pb-20 lg:pb-0">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center text-white/40">Loading messages...</div>}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}
