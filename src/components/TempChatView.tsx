'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { 
  Send, 
  Calendar, 
  Clock, 
  Video, 
  AlertTriangle, 
  Check, 
  ExternalLink,
  X
} from 'lucide-react';
import { ChatMessage, Profile } from '@/types';

interface TempChatViewProps {
  currentUser: Profile;
  messages: ChatMessage[];
  onSendMessage: (content: string, type?: 'TEXT' | 'PROPOSE_TIME', metadata?: Record<string, unknown>) => void;
  onAcceptProposedTime: (messageId: string, meetLink: string) => void;
}

export const TempChatView: React.FC<TempChatViewProps> = ({
  currentUser,
  messages,
  onSendMessage,
  onAcceptProposedTime,
}) => {
  const [inputText, setInputText] = useState('');
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposedDate, setProposedDate] = useState('Tomorrow');
  const [proposedTime, setProposedTime] = useState('18:00 - 19:00 IST');
  const [proposedLegIndex, setProposedLegIndex] = useState(1);
  const [offPlatformWarning, setOffPlatformWarning] = useState<string | null>(null);

  const checkForOffPlatformLeaks = (text: string): string | null => {
    const phoneRegex = /(?:\+91|0)?[6-9]\d{9}/g;
    const emailRegex = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
    const paymentRegex = /\b(gpay|phonepe|paytm|upi|google pay|bank transfer|cash)\b/i;

    if (phoneRegex.test(text)) {
      return 'Notice: Phone number detected. For your escrow safety, keep scheduling inside SkillSwap.';
    }
    if (emailRegex.test(text)) {
      return 'Notice: Email detected. Please coordinate your session times within platform chat.';
    }
    if (paymentRegex.test(text)) {
      return 'Notice: External payment mention detected. Direct cash/UPI payments void escrow protection.';
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    const warning = checkForOffPlatformLeaks(text);
    setOffPlatformWarning(warning);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText, 'TEXT');
    setInputText('');
    setOffPlatformWarning(null);
  };

  const [isProposing, setIsProposing] = useState(false);

  const handleProposeTimeSubmit = async () => {
    setIsProposing(true);
    let meetLink = 'https://meet.google.com/new'; // fallback

    try {
      // Attempt to create a real Google Calendar event via /api/calendar
      // This requires a valid Google OAuth access token from the current user's session
      const now = new Date();
      const [startHour] = (proposedTime.match(/(\d{1,2}):(\d{2})/) || ['', '18', '00']).slice(1);
      const startDate = new Date(now);
      startDate.setHours(parseInt(startHour || '18', 10), 0, 0, 0);
      if (startDate <= now) {
        startDate.setDate(startDate.getDate() + 1); // schedule for tomorrow if time has passed
      }
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour session

      const calendarPayload = {
        summary: `SkillSwap Session — Leg ${proposedLegIndex}`,
        description: `Peer-to-peer skill exchange session coordinated via SkillSwap platform.`,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        attendees: [currentUser.email],
        timeZone: currentUser.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        accessToken: '', // Will be populated from session if available
      };

      // Try to get Google access token from Supabase session
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.provider_token) {
          calendarPayload.accessToken = session.provider_token;
        }
      } catch {
        // No Google session available — will use fallback link
      }

      if (calendarPayload.accessToken) {
        const res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(calendarPayload),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.meetLink) {
            meetLink = data.meetLink;
          }
        }
      }
    } catch (err) {
      console.warn('Calendar API call failed, using fallback Meet link:', err);
    }

    onSendMessage(`Proposed time for Leg ${proposedLegIndex}: ${proposedDate} (${proposedTime})`, 'PROPOSE_TIME', {
      proposedDate,
      proposedTime,
      legIndex: proposedLegIndex,
      meetLink,
    });
    setShowProposeModal(false);
    setIsProposing(false);
  };

  return (
    <div className="flex h-185 flex-col rounded-3xl glass-panel border border-ink/10 overflow-hidden shadow-2xl relative">
      {/* Specular Edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

      {/* Chat Top Header */}
      <div className="flex items-center justify-between border-b border-ink/8 bg-mist-pure/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <Image
              src="/avatars/avatar_8.jpg"
              alt="Ravi Kumar"
              width={40}
              height={40}
              unoptimized
              className="h-10 w-10 rounded-2xl object-cover border border-ink/10 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-ink text-sm">Ravi Kumar</h3>
              <span className="rounded-full bg-saffron/20 px-2 py-0.2 text-[10px] font-mono font-bold text-amber-900 dark:text-saffron dark:bg-saffron/15 dark:border-saffron/30 border border-saffron/30">
                SWAP PARTNER
              </span>
            </div>
            <p className="text-xs text-ink/60">
              Shared Escrow Thread • Covers Leg 1 (Python) & Leg 2 (Figma)
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProposeModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-lagoon transition-all shadow-xs cursor-pointer dark:bg-saffron dark:text-black dark:hover:bg-saffron-light"
          >
            <Calendar className="h-3.5 w-3.5 text-saffron" />
            <span>Propose Meeting Time</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Ephemeral Notice Banner */}
        <div className="rounded-2xl bg-mist border border-ink/6 p-3 text-center text-xs text-ink/60 font-mono">
          🔒 Temporary escrow coordination thread • Automated Meet links generate upon mutual agreement
        </div>

        {messages.map(msg => {
          const isMe = msg.senderId === currentUser.id;

          if (msg.type === 'PROPOSE_TIME') {
            return (
              <div key={msg.id} className="mx-auto my-3 max-w-md w-full">
                <div className="rounded-2xl glass-panel-elevated p-5 border border-saffron/30 shadow-md">
                  <div className="flex items-center justify-between pb-3 border-b border-ink/8">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-saffron flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Time Slot Proposal
                    </span>
                    <span className="text-[10px] font-mono text-ink/40">Leg {msg.metadata?.legIndex || 1}</span>
                  </div>

                  <div className="mt-3">
                    <div className="text-sm font-bold text-ink flex items-center gap-2">
                      <Clock className="h-4 w-4 text-lagoon" />
                      <span>{msg.metadata?.proposedDate} • {msg.metadata?.proposedTime}</span>
                    </div>
                    <p className="text-xs text-ink/60 mt-1">
                      Proposed by {isMe ? 'you' : 'partner'}. Confirming will automatically attach a Google Meet link.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-ink/8 flex items-center justify-between">
                    {msg.metadata?.accepted ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                          <Check className="h-3.5 w-3.5" />
                          Accepted & Scheduled
                        </span>
                        {msg.metadata?.meetLink && (
                          <a
                            href={msg.metadata.meetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-white hover:bg-lagoon transition-all shadow-xs dark:bg-saffron dark:text-black dark:hover:bg-saffron-light"
                          >
                            <Video className="h-3 w-3 text-emerald-400" />
                            <span>Join Meet</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-end w-full gap-2">
                        {!isMe && (
                          <button
                            onClick={() => onAcceptProposedTime(msg.id, msg.metadata?.meetLink || 'https://meet.google.com/ssw-auto')}
                            className="flex items-center gap-1.5 rounded-full bg-lagoon px-5 py-2 text-xs font-semibold text-white hover:bg-lagoon-dark transition-all shadow-xs cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Accept & Generate Meet</span>
                          </button>
                        )}
                        {isMe && (
                          <span className="text-xs text-ink/50 font-mono">
                            Awaiting partner&apos;s acceptance
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-md rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                  isMe
                    ? 'bg-ink text-white dark:bg-saffron dark:text-black rounded-br-none'
                    : 'glass-panel text-ink border border-ink/8 rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
              <span className="mt-1 text-[10px] text-ink/40 font-mono px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}
      </div>

      {/* Safety Warning Pill */}
      {offPlatformWarning && (
        <div className="bg-amber-500/10 border-t border-amber-500/20 px-6 py-2 flex items-center justify-between text-xs text-amber-900 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0" />
            <span>{offPlatformWarning}</span>
          </div>
          <button
            onClick={() => setOffPlatformWarning(null)}
            className="text-amber-800 dark:text-amber-300 hover:text-black dark:hover:text-white cursor-pointer font-bold"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <form onSubmit={handleSend} className="border-t border-ink/8 bg-mist-pure/90 p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Type your message to coordinate swap goals or availability..."
            className="flex-1 rounded-full border border-ink/15 bg-mist-pure px-5 py-3 text-xs text-ink placeholder:text-ink-muted/50 focus:border-lagoon focus:outline-none shadow-xs transition-all dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-all cursor-pointer ${
              inputText.trim()
                ? 'bg-lagoon text-white hover:bg-lagoon-dark shadow-md shadow-lagoon/20'
                : 'bg-ink/10 text-ink/30 cursor-not-allowed'
            }`}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Propose Time Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-panel-elevated rounded-3xl p-7 shadow-2xl border border-white/40 space-y-4">
            <div className="flex items-center justify-between border-b border-ink/8 pb-3">
              <h3 className="font-display font-bold text-ink text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-lagoon" />
                <span>Propose Meet Time Slot</span>
              </h3>
              <button
                onClick={() => setShowProposeModal(false)}
                className="rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-ink block mb-1">Exchange Leg</label>
                <select
                  value={proposedLegIndex}
                  onChange={e => setProposedLegIndex(parseInt(e.target.value, 10))}
                  className="w-full rounded-xl border border-ink/15 bg-mist-pure p-2.5 text-xs text-ink focus:border-lagoon focus:outline-none dark:bg-mist-subtle dark:border-white/15 dark:text-ink"
                >
                  <option value={1}>Leg 1: Python Async (You Learn)</option>
                  <option value={2}>Leg 2: Figma UI (You Teach)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Proposed Date</label>
                <input
                  type="text"
                  value={proposedDate}
                  onChange={e => setProposedDate(e.target.value)}
                  placeholder="e.g. Tomorrow (Wed, 30 Sep)"
                  className="w-full rounded-xl border border-ink/15 bg-mist-pure p-2.5 text-xs text-ink placeholder:text-ink-muted/50 focus:border-lagoon focus:outline-none dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40 dark:text-ink"
                />
              </div>

              <div>
                <label className="font-semibold text-ink block mb-1">Proposed Time (IST)</label>
                <input
                  type="text"
                  value={proposedTime}
                  onChange={e => setProposedTime(e.target.value)}
                  placeholder="e.g. 18:00 - 19:00 IST"
                  className="w-full rounded-xl border border-ink/15 bg-mist-pure p-2.5 text-xs text-ink placeholder:text-ink-muted/50 focus:border-lagoon focus:outline-none dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40 dark:text-ink"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-ink/8">
              <button
                type="button"
                onClick={() => setShowProposeModal(false)}
                className="rounded-full px-4 py-2 text-xs font-semibold text-ink/70 hover:bg-ink/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProposeTimeSubmit}
                disabled={isProposing}
                className={`rounded-full px-5 py-2 text-xs font-semibold text-white shadow-xs cursor-pointer ${
                  isProposing ? 'bg-lagoon/60 cursor-wait' : 'bg-lagoon hover:bg-lagoon-dark'
                }`}
              >
                {isProposing ? 'Generating Meet Link...' : 'Send Time Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
