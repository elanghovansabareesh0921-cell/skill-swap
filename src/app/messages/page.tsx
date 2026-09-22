"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useSkillSwap, ChatConversation, ChatMessage } from "@/context/SkillSwapContext";
import {
  Search,
  Send,
  ArrowLeft,
  MoreVertical,
  Check,
  CheckCheck,
  Phone,
  Video,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CalendarPlus,
} from "lucide-react";

function MessagesContent() {
  const searchParams = useSearchParams();
  const partnerIdParam = searchParams.get("partnerId");
  const partnerNameParam = searchParams.get("partnerName");

  const {
    currentUser,
    conversations,
    messages,
    sendMessage,
  } = useSkillSwap();

  const [activeConvId, setActiveConvId] = useState<string>(
    partnerIdParam ? `conv-${partnerIdParam}` : conversations[0]?.id || "conv-1"
  );
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [showProposeModal, setShowProposeModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If partnerId passed in URL, select or create conversation
  useEffect(() => {
    if (partnerIdParam) {
      setActiveConvId(`conv-${partnerIdParam}`);
      setMobileView("chat");
    }
  }, [partnerIdParam]);

  // Find active conversation
  const activeConversation = conversations.find(
    (c) => c.id === activeConvId || c.participantId === partnerIdParam
  ) || {
    id: activeConvId,
    participantId: partnerIdParam || "arun-kumar",
    participantName: partnerNameParam || "Arun Kumar",
    participantAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    participantRole: "Senior Mentor",
    lastMessage: "Looking forward to swapping skills!",
    lastMessageTime: "Just now",
    unreadCount: 0,
    online: true,
  };

  // Filter messages for active conversation
  const activeMessages = messages.filter(
    (m) =>
      (m.senderId === activeConversation.participantId && m.receiverId === currentUser.id) ||
      (m.senderId === currentUser.id && m.receiverId === activeConversation.participantId) ||
      (m.receiverId === activeConversation.participantId || m.senderId === activeConversation.participantId)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(activeConversation.participantId, inputText);
    setInputText("");
  };

  const handleProposeSession = async () => {
    try {
      const res = await fetch("/api/sessions/propose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: activeConversation.participantId,
          skillName: "Skill Swap",
          scheduledAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          durationMinutes: 45
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Session proposed successfully! 10 credits held in escrow.");
      } else {
        alert("Failed to propose: " + data.error);
      }
    } catch (e) {
      alert("Error proposing session");
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7FF] dark:bg-[#0E0C1B] text-[#18181B] dark:text-[#F4F3FA] transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full h-[calc(100vh-5rem)] flex flex-col">
        <div className="flex-1 bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-sm flex overflow-hidden">

          {/* LEFT: CONVERSATION LIST */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-[#E4E1F5] dark:border-[#2D264E] flex flex-col ${
            mobileView === "chat" ? "hidden md:flex" : "flex"
          }`}>
            {/* Header & Search */}
            <div className="p-4 border-b border-[#E4E1F5] dark:border-[#2D264E] space-y-3">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-[#18181B] dark:text-white">Messages</h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA]">
                  {conversations.length} chats
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] text-xs text-[#18181B] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#7C3AED]"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-50 dark:divide-zinc-800/60">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => {
                  const isActive = conv.id === activeConversation.id || conv.participantId === activeConversation.participantId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setMobileView("chat");
                      }}
                      className={`p-4 flex items-start gap-3 cursor-pointer transition-colors ${
                        isActive
                          ? "bg-[#EDE9FE]/50 dark:bg-[#231C3D]/60 border-l-4 border-l-[#7C3AED]"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conv.participantAvatar}
                          alt={conv.participantName}
                          className="w-11 h-11 rounded-full object-cover border border-[#E4E1F5]"
                        />
                        {conv.online && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#161327]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#18181B] dark:text-white truncate">
                            {conv.participantName}
                          </h4>
                          <span className="text-[10px] text-[#71717A] shrink-0">
                            {conv.lastMessageTime}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#71717A] truncate mt-0.5">
                          {conv.participantRole}
                        </p>
                        <p className="text-xs text-[#71717A] dark:text-zinc-300 truncate mt-1">
                          {conv.lastMessage}
                        </p>
                      </div>

                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#7C3AED] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-xs text-[#71717A]">
                  No conversations found.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: CHAT WINDOW */}
          <div className={`flex-1 flex flex-col ${
            mobileView === "list" ? "hidden md:flex" : "flex"
          }`}>
            {/* Conversation Header */}
            <div className="p-4 border-b border-[#E4E1F5] dark:border-[#2D264E] flex items-center justify-between bg-white dark:bg-[#161327]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileView("list")}
                  className="md:hidden p-1.5 rounded-lg text-[#71717A] hover:bg-zinc-100"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>

                <div className="relative">
                  <img
                    src={activeConversation.participantAvatar}
                    alt={activeConversation.participantName}
                    className="w-10 h-10 rounded-full object-cover border border-[#E4E1F5]"
                  />
                  {activeConversation.online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#18181B] dark:text-white">
                    {activeConversation.participantName}
                  </h3>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online • {activeConversation.participantRole}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href={`/profile/${activeConversation.participantId}`}
                  className="px-3 py-1.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#71717A] hover:text-[#18181B] dark:hover:text-white"
                >
                  View Profile
                </Link>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F8F7FF]/50 dark:bg-[#0E0C1B]/50">
              {activeMessages.length > 0 ? (
                activeMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id || msg.senderId === "current-user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-end gap-2 max-w-sm sm:max-w-md">
                        {!isMe && (
                          <img
                            src={activeConversation.participantAvatar}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover mb-1 shrink-0"
                          />
                        )}
                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                            isMe
                              ? "bg-[#7C3AED] text-white rounded-br-xs"
                              : "bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-[#18181B] dark:text-white rounded-bl-xs"
                          }`}
                        >
                          <p>{msg.content}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-[#71717A] mt-1 px-1">
                        <span>{msg.timestamp}</span>
                        {isMe && <CheckCheck className="w-3 h-3 text-[#7C3AED]" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-xs text-[#71717A]">
                  <MessageSquare className="w-10 h-10 text-[#7C3AED] opacity-50 mb-2" />
                  <p className="font-bold text-sm text-[#18181B] dark:text-white">
                    Your conversations will appear here.
                  </p>
                  <p className="mt-1">
                    Send a message to arrange your skill swap session timing and topics!
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-[#E4E1F5] dark:border-[#2D264E] bg-white dark:bg-[#161327] flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] text-xs sm:text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
              />
              <button
                type="button"
                onClick={handleProposeSession}
                className="p-2.5 rounded-xl bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] hover:bg-[#DDD6FE] dark:hover:bg-[#2D264E] transition-colors shadow-sm flex items-center gap-2"
                title="Propose Session Time"
              >
                <CalendarPlus className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">Propose Time</span>
              </button>
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white transition-colors disabled:opacity-50 shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Messages...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
