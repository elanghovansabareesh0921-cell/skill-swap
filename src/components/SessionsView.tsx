'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Video, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  ExternalLink, 
  ArrowRightLeft, 
  MessageSquare,
  Lock,
  Check,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SessionLeg, Offer, Profile } from '@/types';

interface SessionsViewProps {
  sessions: SessionLeg[];
  offers: Offer[];
  currentUser: Profile;
  onConfirmSession: (sessionId: string) => void;
  onOpenChat: (offerId: string) => void;
  onDisputeSession: (sessionId: string, reason: string) => void;
  onOpenReview?: (session: SessionLeg) => void;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  sessions,
  offers,
  currentUser,
  onConfirmSession,
  onOpenChat,
  onDisputeSession,
  onOpenReview,
}) => {
  const [selectedDisputeSessionId, setSelectedDisputeSessionId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [joinLogs, setJoinLogs] = useState<Record<string, string>>({});

  const handleJoinMeet = (session: SessionLeg) => {
    const timestamp = new Date().toLocaleTimeString();
    setJoinLogs(prev => ({
      ...prev,
      [session.id]: `Joined at ${timestamp} (Telemetry recorded to audit ledger)`,
    }));

    if (session.meetLink) {
      window.open(session.meetLink, '_blank');
    }
  };

  const handleConfirmCompletion = (sessionId: string) => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0e7c7b', '#f2a541', '#0f1b2d', '#ffffff'],
      });
    } catch {
      // ignore
    }
    onConfirmSession(sessionId);
  };

  const handleSubmitDispute = () => {
    if (!selectedDisputeSessionId || !disputeReason.trim()) return;
    onDisputeSession(selectedDisputeSessionId, disputeReason);
    setSelectedDisputeSessionId(null);
    setDisputeReason('');
  };

  const scheduledCount = sessions.filter(s => s.status === 'SCHEDULED').length;
  const totalEscrowTokens = sessions
    .filter(s => s.status === 'SCHEDULED')
    .reduce((sum, s) => sum + s.chargedTokens, 0);
  const settledCount = sessions.filter(s => s.status === 'SETTLED').length;

  return (
    <div className="space-y-8">
      {/* Metric Tiles Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel rounded-3xl p-6 spatial-card border border-ink/8">
          <div className="flex items-center gap-2 text-xs font-mono text-ink/60 uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-lagoon" />
            <span>SCHEDULED SESSIONS</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-ink font-display">
            {scheduledCount}
          </div>
          <div className="text-[11px] text-ink/50 mt-1">Live active slots in progress</div>
        </div>

        <div className="glass-panel rounded-3xl p-6 spatial-card border border-ink/8">
          <div className="flex items-center gap-2 text-xs font-mono text-ink/60 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>PROTECTED IN ESCROW</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-emerald-700 font-mono">
            {totalEscrowTokens} SP
          </div>
          <div className="text-[11px] text-ink/50 mt-1 font-mono">₹{totalEscrowTokens}.00 backed by double-entry ledger</div>
        </div>

        <div className="glass-panel rounded-3xl p-6 spatial-card border border-ink/8">
          <div className="flex items-center gap-2 text-xs font-mono text-ink/60 uppercase tracking-wider">
            <CheckCircle2 className="h-4 w-4 text-amber-600" />
            <span>SETTLED EXCHANGES</span>
          </div>
          <div className="mt-2 text-3xl font-extrabold text-ink font-display">
            {settledCount}
          </div>
          <div className="text-[11px] text-ink/50 mt-1">Successfully confirmed & released</div>
        </div>
      </div>

      {/* Pending Offers Alert Banner */}
      {offers.filter(o => o.status === 'PENDING').length > 0 && (
        <div className="rounded-3xl glass-panel border border-saffron/40 bg-saffron/[0.04] p-6 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-saffron text-ink font-bold shadow-xs">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink text-base">
                  You have pending proposals awaiting your approval
                </h3>
                <p className="text-xs text-ink/70">
                  Review exchange details and accept to lock mutual skill points into escrow.
                </p>
              </div>
            </div>

            <button
              onClick={() => onOpenChat(offers[0].id)}
              className="flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-xs font-semibold text-white hover:bg-lagoon transition-all shadow-xs cursor-pointer dark:bg-saffron dark:text-black dark:hover:bg-saffron-light"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Review in Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Sessions Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-ink flex items-center gap-2">
            <span>Your Active Sessions & Google Meets</span>
            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-mono font-medium text-ink/60">
              {sessions.length}
            </span>
          </h2>
          <span className="text-xs text-ink/50 font-mono">
            Two-party confirmation required for escrow release
          </span>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-3xl glass-panel p-12 text-center text-ink/60 space-y-3">
            <Calendar className="h-10 w-10 mx-auto text-ink/30" />
            <p className="text-sm font-medium">No sessions scheduled yet.</p>
            <p className="text-xs text-ink/50">Propose a swap from the AI Radar to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5">
            {sessions.map(session => {
              const isTeacher = session.teacherId === currentUser.id;
              const roleTitle = isTeacher ? 'Teaching' : 'Learning';

              return (
                <div
                  key={session.id}
                  className="rounded-3xl glass-panel p-6 sm:p-7 spatial-card border border-ink/8 shadow-sm flex flex-col justify-between"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Left: Session metadata */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-full bg-lagoon/10 border border-lagoon/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-lagoon uppercase tracking-wider">
                          LEG {session.legIndex} OF 2 • {roleTitle.toUpperCase()}
                        </span>
                        
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold ${
                          session.status === 'SETTLED'
                            ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-400'
                            : session.status === 'DISPUTED'
                            ? 'bg-rose-500/15 text-rose-800 dark:text-rose-400'
                            : 'bg-saffron/20 text-amber-900 dark:text-amber-300'
                        }`}>
                          {session.status}
                        </span>

                        <span className="text-xs text-ink/50 font-mono">
                          {session.durationMinutes} mins
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-bold text-ink">
                        {session.skillName}
                      </h3>

                      <p className="text-xs text-ink/65 flex items-center gap-2">
                        <span>Partner: <strong className="text-ink">{isTeacher ? 'Learner (Ravi)' : 'Teacher (Ravi)'}</strong></span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-ink/40" />
                          <span>{session.scheduledStart || 'Scheduled: Tomorrow 18:00 IST'}</span>
                        </span>
                      </p>
                    </div>

                    {/* Right: Escrow summary */}
                    <div className="text-left sm:text-right bg-mist-pure/70 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-ink/5 sm:border-0">
                      <div className="text-[10px] font-mono text-ink/50 uppercase">Escrow Locked</div>
                      <div className="text-2xl font-mono font-extrabold text-ink mt-0.5">
                        {session.chargedTokens} SP
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                        10% platform fee on settlement
                      </div>
                    </div>
                  </div>

                  {/* Google Meet Bar & Actions */}
                  <div className="mt-6 pt-5 border-t border-ink/8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {session.meetLink ? (
                        <button
                          onClick={() => handleJoinMeet(session)}
                          className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-semibold text-white hover:bg-lagoon transition-all shadow-xs cursor-pointer group dark:bg-saffron dark:text-black dark:hover:bg-saffron-light"
                        >
                          <Video className="h-4 w-4 text-emerald-400" />
                          <span>Join Google Meet</span>
                          <ExternalLink className="h-3.5 w-3.5 text-white/50 group-hover:text-white dark:text-black/60 dark:group-hover:text-black transition-colors" />
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-ink/60">
                          <Clock className="h-4 w-4 text-saffron" />
                          <span>Google Meet link will appear once time is confirmed in chat.</span>
                        </div>
                      )}

                      <button
                        onClick={() => onOpenChat(session.offerId)}
                        className="flex items-center gap-1.5 rounded-full border border-ink/15 bg-mist-pure px-4 py-2.5 text-xs font-semibold text-ink hover:bg-ink/5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-lagoon" />
                        <span>Open Chat</span>
                      </button>
                    </div>

                    {/* Completion or Dispute buttons */}
                    <div className="flex items-center gap-2">
                      {session.status === 'SCHEDULED' && (
                        <>
                          <button
                            onClick={() => handleConfirmCompletion(session.id)}
                            className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Confirm Completed</span>
                          </button>

                          <button
                            onClick={() => setSelectedDisputeSessionId(session.id)}
                            className="rounded-full px-3.5 py-2.5 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            Dispute
                          </button>
                        </>
                      )}

                      {session.status === 'SETTLED' && (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span>ESCROW SETTLED</span>
                          </span>
                          {onOpenReview && (
                            <button
                              onClick={() => onOpenReview(session)}
                              className="flex items-center gap-1.5 rounded-full border border-saffron/40 bg-saffron/10 px-3.5 py-1.5 text-xs font-semibold text-amber-900 hover:bg-saffron hover:text-ink transition-all cursor-pointer shadow-xs dark:text-saffron dark:hover:text-black"
                            >
                              <Star className="h-3.5 w-3.5 text-saffron fill-saffron" />
                              <span>Review Peer</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Telemetry notification note */}
                  {joinLogs[session.id] && (
                    <div className="mt-3 text-[11px] font-mono text-lagoon bg-lagoon/5 px-3 py-1.5 rounded-xl border border-lagoon/10">
                      {joinLogs[session.id]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {selectedDisputeSessionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-md p-4">
          <div className="w-full max-w-lg glass-panel-elevated rounded-3xl p-7 shadow-2xl border border-white/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 font-bold">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink text-base">File Session Dispute</h3>
                <p className="text-xs text-ink/60">Skill points remain frozen in escrow until review completes.</p>
              </div>
            </div>

            <textarea
              rows={4}
              value={disputeReason}
              onChange={e => setDisputeReason(e.target.value)}
              placeholder="Explain what happened (e.g. partner was a no-show, technical failure, incorrect skill topic covered)..."
              className="w-full rounded-2xl border border-ink/15 bg-mist-pure p-3 text-xs text-ink focus:border-rose-500 focus:outline-none placeholder:text-ink-muted/50 resize-none dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedDisputeSessionId(null)}
                className="rounded-full px-4 py-2 text-xs font-semibold text-ink/70 hover:bg-ink/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitDispute}
                className="rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                Submit Dispute to Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
