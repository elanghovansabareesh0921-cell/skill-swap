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
      participantAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
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

  const filteredConversations = enhancedConversations.filter((c) =>
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
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      read: true,
    };

    setChatMessages((prev) => ({
      ...prev,
      [activeConvId]: [...(prev[activeConvId] || activeMessages), compMsg],
    }));

    showToast("Session complete: 10 credits released!", "success");
  };

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col h-[calc(100vh-80px)]">
      <div className="flex-1 rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] shadow-sm overflow-hidden flex flex-col md:flex-row">
        {/* LEFT: THREAD LIST */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-[#ddd4f5] dark:border-[#362c5e] flex flex-col bg-[#f5f2fc]/50 dark:bg-[#130f26]/50 ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#ddd4f5] dark:border-[#362c5e] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
                Messages
              </h2>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7d6ce8] dark:text-[#ac98f2] bg-[#ede8fb] dark:bg-[#282147] px-2.5 py-0.5 rounded-full">
                <CoinIcon size={12} />
                <span>1h = 10c</span>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#7a719c] dark:text-[#a99ed4] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 rounded-full bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] text-xs text-[#241b3d] dark:text-[#f4f0ff] placeholder-[#7a719c] focus:outline-none focus:ring-2 focus:ring-[#7d6ce8]/40"
              />
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#ddd4f5]/60 dark:divide-[#362c5e]/60">
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
                    className={`p-4 cursor-pointer transition-colors flex items-start gap-3 ${
                      isActive
                        ? "bg-[#ede8fb] dark:bg-[#282147] border-l-4 border-l-[#7d6ce8]"
                        : "hover:bg-white dark:hover:bg-[#1e1938]"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.participantAvatar}
                        alt={conv.participantName}
                        className="w-11 h-11 rounded-full object-cover border border-[#ddd4f5] dark:border-[#362c5e]"
                      />
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#1e1938]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#241b3d] dark:text-[#f4f0ff] truncate">
                          {conv.participantName}
                        </span>
                        <span className="text-[10px] text-[#7a719c] dark:text-[#a99ed4] shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      {/* Session Type & State Pills */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                          conv.sessionType === "direct"
                            ? "bg-[#ede8fb] dark:bg-[#282147] text-[#7d6ce8] dark:text-[#ac98f2]"
                            : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                        }`}>
                          {conv.sessionType === "direct" ? "Direct swap" : "Credit escrow (10c)"}
                        </span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                          conv.sessionState === "active"
                            ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                            : conv.sessionState === "requested"
                            ? "bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        }`}>
                          {conv.sessionState}
                        </span>
                      </div>

                      <p className="text-xs text-[#7a719c] dark:text-[#a99ed4] truncate mt-1">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#7a719c] dark:text-[#a99ed4]">
                No conversations found.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: CHAT LOG & COMPOSER */}
        <div
          className={`flex-1 flex flex-col bg-white dark:bg-[#1e1938] ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Active Chat Header */}
          <div className="p-4 border-b border-[#ddd4f5] dark:border-[#362c5e] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden p-1.5 rounded-full text-[#7a719c] hover:bg-[#ede8fb]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={activeConversation.participantAvatar}
                  alt={activeConversation.participantName}
                  className="w-10 h-10 rounded-full object-cover border border-[#ddd4f5] dark:border-[#362c5e]"
                />
                {activeConversation.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-[#241b3d] dark:text-[#f4f0ff]">
                    {activeConversation.participantName}
                  </h3>
                  <VerifiedBadge size="sm" showLabel={false} />
                </div>
                <p className="text-[11px] text-[#7a719c] dark:text-[#a99ed4]">
                  {activeConversation.participantRole} · {activeConversation.sessionType === "direct" ? "Direct swap" : "10 Credits Escrow"}
                </p>
              </div>
            </div>

            {/* In-Chat Actions: Schedule & Mark Complete */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSchedulerModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-[#ede8fb] dark:bg-[#282147] hover:bg-[#ddd4f5] text-[#7d6ce8] dark:text-[#ac98f2] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Schedule 1 Hour</span>
              </button>

              {activeConversation.sessionState === "active" && (
                <button
                  type="button"
                  onClick={handleMarkComplete}
                  className="px-3.5 py-1.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark complete</span>
                </button>
              )}
            </div>
          </div>

          {/* Session Type Reminder Banner */}
          <div className="px-4 py-2 bg-[#f5f2fc] dark:bg-[#130f26] border-b border-[#ddd4f5] dark:border-[#362c5e] text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#7a719c] dark:text-[#a99ed4]">
              {activeConversation.sessionType === "direct" ? (
                <>
                  <Repeat className="w-3.5 h-3.5 text-[#7d6ce8]" />
                  <span><strong>Direct swap:</strong> two people teach each other; no credits move.</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#f5a524]" />
                  <span><strong>Credit escrow:</strong> 10 credits locked until session is marked complete.</span>
                </>
              )}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7d6ce8] dark:text-[#ac98f2]">
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
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-[#7d6ce8] text-white rounded-br-none"
                        : "bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] text-[#241b3d] dark:text-[#f4f0ff] rounded-bl-none"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-[#7a719c] dark:text-[#a99ed4] mt-1 px-1">
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
            className="p-3 sm:p-4 border-t border-[#ddd4f5] dark:border-[#362c5e] flex items-center gap-2 bg-white dark:bg-[#1e1938]"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeConversation.participantName}...`}
              className="flex-1 px-4 py-3 rounded-full bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] text-xs sm:text-sm text-[#241b3d] dark:text-[#f4f0ff] placeholder-[#7a719c] focus:outline-none focus:ring-2 focus:ring-[#7d6ce8]/40"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] disabled:opacity-40 text-white transition-all shadow-sm shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* SCHEDULE SESSION MODAL */}
      {showSchedulerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1e1938] border border-[#ddd4f5] dark:border-[#362c5e] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#ddd4f5] dark:border-[#362c5e]">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-[#7d6ce8]" />
                <h3 className="text-base font-extrabold text-[#241b3d] dark:text-[#f4f0ff]">
                  Schedule 1-Hour Session
                </h3>
              </div>
              <button
                onClick={() => setShowSchedulerModal(false)}
                className="text-[#7a719c] hover:text-[#241b3d] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-[#ede8fb] dark:bg-[#282147] border border-[#ddd4f5] dark:border-[#362c5e] text-[#7d6ce8] dark:text-[#ac98f2] flex items-center gap-2 font-semibold">
                <CoinIcon size={14} />
                <span>Standard 1-Hour Session · 10 Credits or Direct Swap</span>
              </div>

              <div>
                <label className="block text-[#7a719c] dark:text-[#a99ed4] font-medium mb-1">
                  Topic / Goal
                </label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-full bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] text-xs text-[#241b3d] dark:text-[#f4f0ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#7a719c] dark:text-[#a99ed4] font-medium mb-1">
                    Day
                  </label>
                  <select
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-full bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] text-xs text-[#241b3d] dark:text-[#f4f0ff]"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#7a719c] dark:text-[#a99ed4] font-medium mb-1">
                    Time Slot (1 Hour)
                  </label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-full bg-[#f5f2fc] dark:bg-[#130f26] border border-[#ddd4f5] dark:border-[#362c5e] text-xs text-[#241b3d] dark:text-[#f4f0ff]"
                  >
                    <option value="10:00 AM – 11:00 AM">10:00 AM – 11:00 AM</option>
                    <option value="2:00 PM – 3:00 PM">2:00 PM – 3:00 PM</option>
                    <option value="6:00 PM – 7:00 PM">6:00 PM – 7:00 PM</option>
                    <option value="8:00 PM – 9:00 PM">8:00 PM – 9:00 PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSchedulerModal(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-[#7a719c] hover:bg-[#ede8fb]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                disabled={schedulingLoading}
                className="px-5 py-2.5 rounded-full bg-[#7d6ce8] hover:bg-[#6c5bd6] text-white text-xs font-bold transition-all shadow-sm"
              >
                {schedulingLoading ? "Scheduling..." : "Confirm 1-Hour Session"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function MessagesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f5f2fc] dark:bg-[#130f26] text-[#241b3d] dark:text-[#f4f0ff] transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center">Loading messages...</div>}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}
