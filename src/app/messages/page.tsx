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
  ShieldCheck,
  CalendarPlus,
  Calendar,
  X,
  Repeat,
  Check,
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
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

    sendMessage(activeConvId, inputText.trim());
    setInputText("");
  };

  const handleConfirmSchedule = () => {
    setSchedulingLoading(true);
    setTimeout(() => {
      const confirmationMsg: MessageItem = {
        id: `msg-sched-${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        text: `📅 Scheduled 1-Hour Session: "${sessionTopic}" on ${scheduledDate} at ${scheduledTime}. (1 Hour = 10 Credits or Direct Swap).`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        read: true,
      };

      setChatMessages((prev) => ({
        ...prev,
        [activeConvId]: [...(prev[activeConvId] || activeMessages), confirmationMsg],
      }));

      scheduleSessionRoom({
        chatRoomId: activeConvId,
        skillName: sessionTopic,
        peerName: activeConversation.participantName,
        scheduledStart: `${scheduledDate} at ${scheduledTime}`,
        scheduledEnd: `${scheduledDate} at ${scheduledTime}`,
      });

      setSchedulingLoading(false);
      setShowSchedulerModal(false);
      showToast("Session Scheduled! 📅", `Confirmed 1-hour session on ${scheduledDate}.`, "success");
    }, 700);
  };

  const handleMarkComplete = () => {
    showToast("Session marked complete! 🎉", "Escrow credits released to the teacher.", "success");
  };

  const filteredConversations = enhancedConversations.filter(
    (c) =>
      c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.participantRole.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col h-[calc(100vh-4rem)]">
      {/* Container Box */}
      <div className="flex-1 border-2 border-black bg-[#181B22] shadow-[6px_6px_0px_0px_#FFE600] flex overflow-hidden">
        {/* LEFT: CONVERSATION LIST */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r-2 border-black flex flex-col bg-[#181B22] ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b-2 border-black space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black uppercase text-white tracking-wider">
                Messages
              </h2>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 border border-black bg-[#12141C] text-[10px] font-black uppercase text-[#FFE600]">
                <CoinIcon size={10} />
                <span>1h = 10c</span>
              </div>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 border-2 border-black bg-[#12141C] text-xs text-white placeholder-zinc-500 font-medium focus:outline-none focus:border-[#FFE600] focus:shadow-[2px_2px_0px_0px_#FFE600]"
              />
            </div>
          </div>

          {/* Conversation Items */}
          <div className="flex-1 overflow-y-auto divide-y-2 divide-black">
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
                        ? "bg-[#FFE600] text-black border-l-4 border-l-black"
                        : "hover:bg-[#1F2430] text-white"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.participantAvatar}
                        alt={conv.participantName}
                        className="w-11 h-11 object-cover border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                      />
                      {conv.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#A3E635] border border-black" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black uppercase truncate ${isActive ? "text-black" : "text-white"}`}>
                          {conv.participantName}
                        </span>
                        <span className={`text-[10px] font-mono shrink-0 ${isActive ? "text-black font-bold" : "text-zinc-400"}`}>
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      {/* Session Type & State Pills */}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 border border-black ${
                          conv.sessionType === "direct"
                            ? isActive ? "bg-black text-[#38BDF8]" : "bg-[#38BDF8] text-black"
                            : isActive ? "bg-black text-[#FFE600]" : "bg-[#FFE600] text-black"
                        }`}>
                          {conv.sessionType === "direct" ? "Direct swap" : "Credit escrow (10c)"}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 border border-black ${
                          conv.sessionState === "active"
                            ? "bg-[#A3E635] text-black"
                            : conv.sessionState === "requested"
                            ? "bg-[#FFE600] text-black"
                            : "bg-zinc-800 text-zinc-300"
                        }`}>
                          {conv.sessionState}
                        </span>
                      </div>

                      <p className={`text-xs truncate mt-1 ${isActive ? "text-black font-medium" : "text-zinc-300 font-normal"}`}>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-zinc-400 font-mono uppercase">
                No conversations found.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: CHAT LOG & COMPOSER */}
        <div
          className={`flex-1 flex flex-col bg-[#12141C] ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Active Chat Header */}
          <div className="p-4 border-b-2 border-black flex items-center justify-between bg-[#181B22]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileView("list")}
                className="md:hidden p-1.5 border border-black bg-[#12141C] text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={activeConversation.participantAvatar}
                  alt={activeConversation.participantName}
                  className="w-10 h-10 object-cover border-2 border-black shadow-[2px_2px_0px_0px_#000000]"
                />
                {activeConversation.online && (
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#A3E635] border border-black" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black uppercase text-white">
                    {activeConversation.participantName}
                  </h3>
                  <VerifiedBadge size="sm" showLabel={false} />
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {activeConversation.participantRole} · {activeConversation.sessionType === "direct" ? "Direct swap" : "10 Credits Escrow"}
                </p>
              </div>
            </div>

            {/* In-Chat Actions: Schedule & Mark Complete */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSchedulerModal(true)}
                className="px-3 py-1.5 border-2 border-black bg-[#12141C] hover:bg-[#1F2430] text-[#FFE600] text-xs font-black uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#FFE600] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Schedule 1 Hour</span>
              </button>

              {activeConversation.sessionState === "active" && (
                <button
                  type="button"
                  onClick={handleMarkComplete}
                  className="px-3 py-1.5 border-2 border-black bg-[#FFE600] text-black text-xs font-black uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Mark complete</span>
                </button>
              )}
            </div>
          </div>

          {/* Session Type Reminder Banner */}
          <div className="px-4 py-2 bg-[#181B22] border-b-2 border-black text-xs flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-300 font-mono">
              {activeConversation.sessionType === "direct" ? (
                <>
                  <Repeat className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span><strong className="text-white font-sans uppercase">Direct swap:</strong> two people teach each other; no credits move.</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FFE600]" />
                  <span><strong className="text-white font-sans uppercase">Credit escrow:</strong> 10 credits locked until session complete.</span>
                </>
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#FFE600] border border-black bg-[#12141C] px-2 py-0.5">
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
                    className={`max-w-[80%] p-3 text-xs sm:text-sm leading-relaxed border-2 border-black shadow-[3px_3px_0px_0px_#000000] ${
                      isMe
                        ? "bg-[#FFE600] text-black font-black"
                        : "bg-[#181B22] text-white font-medium"
                    }`}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono mt-1 px-1">
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
            className="p-3 sm:p-4 border-t-2 border-black flex items-center gap-2 bg-[#181B22]"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${activeConversation.participantName}...`}
              className="flex-1 px-4 py-3 border-2 border-black bg-[#12141C] text-xs sm:text-sm text-white placeholder-zinc-500 font-medium focus:outline-none focus:border-[#FFE600] focus:shadow-[3px_3px_0px_0px_#FFE600]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-3 border-2 border-black bg-[#FFE600] hover:bg-[#FACC15] disabled:opacity-40 text-black shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all shrink-0 cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      </div>

      {/* SCHEDULE SESSION MODAL */}
      {showSchedulerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md border-2 border-black bg-[#181B22] shadow-[8px_8px_0px_0px_#FFE600] p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-black">
              <div className="flex items-center gap-2">
                <CalendarPlus className="w-5 h-5 text-[#FFE600]" />
                <h3 className="text-base font-black uppercase text-white">
                  Schedule 1-Hour Session
                </h3>
              </div>
              <button
                onClick={() => setShowSchedulerModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 border-2 border-black bg-[#12141C] text-[#FFE600] flex items-center gap-2 font-black uppercase shadow-[2px_2px_0px_0px_#FFE600]">
                <CoinIcon size={14} />
                <span>Standard 1-Hour Session · 10 Credits or Direct Swap</span>
              </div>

              <div>
                <label className="block text-zinc-300 font-black uppercase tracking-wider mb-1">
                  Topic / Goal
                </label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-black bg-[#12141C] text-xs text-white focus:outline-none focus:border-[#FFE600]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-black uppercase tracking-wider mb-1">
                    Day
                  </label>
                  <select
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-[#12141C] text-xs text-white focus:outline-none focus:border-[#FFE600]"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 font-black uppercase tracking-wider mb-1">
                    Time Slot (1 Hour)
                  </label>
                  <select
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black bg-[#12141C] text-xs text-white focus:outline-none focus:border-[#FFE600]"
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
                className="px-4 py-2 border-2 border-black bg-[#12141C] text-xs font-black uppercase text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                disabled={schedulingLoading}
                className="px-5 py-2.5 border-2 border-black bg-[#FFE600] text-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000000] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
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
    <div className="min-h-screen flex flex-col bg-[#0B0C10] text-white cyber-grid transition-colors duration-200">
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center text-zinc-400 font-mono uppercase font-bold">Loading messages...</div>}>
        <MessagesContent />
      </Suspense>
    </div>
  );
}
