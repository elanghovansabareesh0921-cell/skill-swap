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
  Clock,
  Calendar,
  X,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

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

  const [activeConvId, setActiveConvId] = useState<string>(
    partnerIdParam ? `conv-${partnerIdParam}` : conversations[0]?.id || "conv-1"
  );
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // In-Chat Session Scheduler State
  const [showSchedulerModal, setShowSchedulerModal] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("Tomorrow");
  const [scheduledTime, setScheduledTime] = useState("6:00 PM – 6:45 PM");
  const [sessionLength, setSessionLength] = useState<30 | 45 | 60>(45);
  const [sessionTopic, setSessionTopic] = useState("Skill Swap Hands-on Session");
  const [schedulingLoading, setSchedulingLoading] = useState(false);

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

  // Schedule Session & Generate Dedicated Room
  const handleConfirmSchedule = () => {
    setSchedulingLoading(true);

    const start = new Date(Date.now() + 86400000).toISOString();
    const end = new Date(Date.now() + 86400000 + sessionLength * 60000).toISOString();

    const res = scheduleSessionRoom({
      chatRoomId: activeConversation.id,
      scheduledStart: start,
      scheduledEnd: end,
      skillName: sessionTopic,
      peerName: activeConversation.participantName,
    });

    setSchedulingLoading(false);
    setShowSchedulerModal(false);

    if (res.success && res.room) {
      // Send a rich message inside the chat thread with classroom link
      const inviteMsg = `📅 Session Scheduled!\nTopic: ${sessionTopic}\nDate & Time: ${scheduledDate} at ${scheduledTime} (${sessionLength} mins)\nClassroom Room Link: /learn/${res.room.roomToken}`;
      sendMessage(activeConversation.participantId, inviteMsg);

      showToast(
        "Session Room Generated! 🚀",
        `Unique classroom room link created: /learn/${res.room.roomToken}`,
        "success"
      );
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Active scheduled room for this partner if any
  const existingRoom = sessionRooms.find(
    (r) => r.chatRoomId === activeConversation.id || r.peerName === activeConversation.participantName
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

              {/* Action Buttons: Scheduler & Room CTA */}
              <div className="flex items-center gap-2">
                {existingRoom && (
                  <Link
                    href={`/learn/${existingRoom.roomToken}`}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all animate-pulse"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Enter Classroom</span>
                  </Link>
                )}

                <button
                  onClick={() => setShowSchedulerModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA] hover:bg-[#DDD6FE] dark:hover:bg-[#2D264E] text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Schedule Session</span>
                </button>

                <Link
                  href={`/profile/${activeConversation.participantId}`}
                  className="px-3 py-1.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#71717A] hover:text-[#18181B] dark:hover:text-white"
                >
                  Profile
                </Link>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#F8F7FF]/50 dark:bg-[#0E0C1B]/50">
              {activeMessages.length > 0 ? (
                activeMessages.map((msg) => {
                  const isMe = msg.senderId === currentUser.id || msg.senderId === "current-user";
                  const isRoomLink = msg.content.includes("/learn/");

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
                          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm ${
                            isMe
                              ? "bg-[#7C3AED] text-white rounded-br-xs"
                              : "bg-white dark:bg-[#161327] border border-[#E4E1F5] dark:border-[#2D264E] text-[#18181B] dark:text-white rounded-bl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-line">{msg.content}</p>

                          {/* Interactive Card if message contains a room token */}
                          {isRoomLink && (
                            <div className="mt-3 pt-3 border-t border-white/20 dark:border-zinc-700/60">
                              <Link
                                href={msg.content.match(/\/learn\/[a-zA-Z0-9_-]+/)?.[0] || "/learn"}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                                  isMe
                                    ? "bg-white text-[#7C3AED] hover:bg-zinc-100"
                                    : "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
                                }`}
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join Live Virtual Classroom</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          )}
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
                    Mutual Collaboration Space
                  </p>
                  <p className="mt-1 max-w-xs mx-auto">
                    Coordinate your skill swap and click &ldquo;Schedule Session&rdquo; to generate your dedicated virtual classroom!
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
                placeholder="Type a message or agree on a session time..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8F7FF] dark:bg-[#0E0C1B] border border-[#E4E1F5] dark:border-[#2D264E] text-xs sm:text-sm text-[#18181B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40"
              />
              <button
                type="button"
                onClick={() => setShowSchedulerModal(true)}
                className="p-2.5 rounded-xl bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] hover:bg-[#DDD6FE] dark:hover:bg-[#2D264E] transition-colors shadow-sm flex items-center gap-1.5"
                title="Open Session Scheduler"
              >
                <CalendarPlus className="w-4 h-4" />
                <span className="hidden sm:inline text-xs font-semibold">Scheduler</span>
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

      {/* IN-CHAT SESSION SCHEDULER MODAL */}
      {showSchedulerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-[#161327] rounded-3xl border border-[#E4E1F5] dark:border-[#2D264E] shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setShowSchedulerModal(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-[#71717A] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] flex items-center justify-center">
                  <CalendarPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#18181B] dark:text-white">
                    Schedule Collaboration Session
                  </h3>
                  <p className="text-xs text-[#71717A] dark:text-zinc-400">
                    With {activeConversation.participantName} • Generates dedicated virtual room
                  </p>
                </div>
              </div>

              {/* Topic / Skill */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Session Topic or Focus
                </label>
                <input
                  type="text"
                  value={sessionTopic}
                  onChange={(e) => setSessionTopic(e.target.value)}
                  placeholder="e.g. Next.js Architecture Review, Python ML Setup..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#0E0C1B] text-xs text-[#18181B] dark:text-white"
                />
              </div>

              {/* Date Selection */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Agreed Date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["Today", "Tomorrow", "This Weekend"].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setScheduledDate(d)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        scheduledDate === d
                          ? "border-[#7C3AED] bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA]"
                          : "border-[#E4E1F5] dark:border-[#2D264E] text-[#71717A] hover:border-zinc-400"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Preferred Time Slot
                </label>
                <select
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] bg-[#F8F7FF] dark:bg-[#0E0C1B] text-xs text-[#18181B] dark:text-white"
                >
                  <option value="10:00 AM – 10:45 AM">Morning (10:00 AM – 10:45 AM)</option>
                  <option value="2:00 PM – 2:45 PM">Afternoon (2:00 PM – 2:45 PM)</option>
                  <option value="6:00 PM – 6:45 PM">Evening (6:00 PM – 6:45 PM)</option>
                  <option value="8:00 PM – 8:45 PM">Night (8:00 PM – 8:45 PM)</option>
                </select>
              </div>

              {/* Session Duration */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Session Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 45, 60].map((len) => (
                    <button
                      key={len}
                      type="button"
                      onClick={() => setSessionLength(len as any)}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                        sessionLength === len
                          ? "border-[#7C3AED] bg-[#EDE9FE] dark:bg-[#231C3D] text-[#7C3AED] dark:text-[#A78BFA]"
                          : "border-[#E4E1F5] dark:border-[#2D264E] text-[#71717A] hover:border-zinc-400"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{len} Mins</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSchedulerModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E4E1F5] dark:border-[#2D264E] text-xs font-semibold text-[#71717A] hover:bg-zinc-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={schedulingLoading}
                  onClick={handleConfirmSchedule}
                  className="px-5 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-[#7C3AED]/25 flex items-center gap-2"
                >
                  <span>Confirm & Generate Room</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
