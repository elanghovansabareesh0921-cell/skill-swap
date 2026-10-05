'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProfile, getSession, saveProfile, signOut, Profile as AuthProfile } from '@/lib/auth';
import { Navbar } from '@/components/Navbar';
import { EditSkillsModal } from '@/components/EditSkillsModal';
import { AiRadarView } from '@/components/AiRadarView';
import { SwapProposalModal } from '@/components/SwapProposalModal';
import { SessionsView } from '@/components/SessionsView';
import { TempChatView } from '@/components/TempChatView';
import { WalletModal } from '@/components/WalletModal';
import { AdminPanel } from '@/components/AdminPanel';
import { ReviewModal } from '@/components/ReviewModal';
import {
  INITIAL_TEACHERS,
  INITIAL_WALLET,
  INITIAL_OFFERS,
  INITIAL_SESSIONS,
  INITIAL_CHAT_MESSAGES,
} from '@/lib/mockData';
import { computeRadarMatches } from '@/lib/radar';
import { generateQuoteBreakdown } from '@/lib/pricing';
import {
  Profile,
  Wallet,
  Offer,
  SessionLeg,
  ChatMessage,
  RadarMatch,
  LedgerTransaction,
  OfferType,
  UserTeachSkill,
  UserLearnSkill,
} from '@/types';
import { Sparkles, ArrowRightLeft, BookOpen, User } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [authProfile, setAuthProfile] = useState<AuthProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Global Platform State
  const [teachers, setTeachers] = useState<Profile[]>(INITIAL_TEACHERS);
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);
  const [offers, setOffers] = useState<Offer[]>(INITIAL_OFFERS);
  const [sessions, setSessions] = useState<SessionLeg[]>(INITIAL_SESSIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([
    {
      id: 'tx-001',
      referenceId: 'off-101',
      type: 'HOLD',
      amountPaise: 1800,
      timestamp: 'Today, 14:15',
      description: 'Escrow hold for Swap Leg 1 with Ravi',
      idempotencyKey: 'idemp-hold-101',
    },
    {
      id: 'tx-002',
      referenceId: 'pay-rzp-001',
      type: 'PURCHASE',
      amountPaise: 20000,
      timestamp: 'Yesterday, 19:30',
      description: 'Razorpay UPI Skill Points Pack purchase (200 SP)',
      idempotencyKey: 'idemp-rzp-200',
    },
  ]);

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<'radar' | 'sessions' | 'chat' | 'admin'>('radar');
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<RadarMatch | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isEditSkillsOpen, setIsEditSkillsOpen] = useState(false);
  const [sessionForReview, setSessionForReview] = useState<SessionLeg | null>(null);

  // Authenticate and fetch onboarding profile
  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    const profile = getProfile();
    if (!profile) {
      router.replace('/onboarding');
      return;
    }
    setAuthProfile(profile);
    setIsReady(true);
  }, [router]);

  // Bridge AuthProfile into the platform Profile type
  const currentUser: Profile = useMemo(() => {
    const defaultAvailability: Record<string, string[]> = {
      Mon: ['18:00-21:00'],
      Tue: ['19:00-21:00'],
      Thu: ['18:00-21:00'],
      Sat: ['10:00-14:00'],
    };

    if (!authProfile) {
      return {
        id: 'usr-guest',
        email: 'guest@example.com',
        fullName: 'Guest User',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'SkillSwap member',
        city: 'Bengaluru',
        country: 'IN',
        timezone: 'Asia/Kolkata',
        languages: ['English'],
        phoneVerified: true,
        isOnboarded: true,
        isAcceptingRequests: true,
        strikesCount: 0,
        reputationScore: 5.0,
        completedSessionsCount: 0,
        teachSkills: [],
        learnSkills: [],
        availability: defaultAvailability,
      };
    }

    const session = getSession();

    // Map teaching skills from onboarding/profile
    const hourlyRate = authProfile.hourlyRate || 50;
    const experienceYears = authProfile.experienceYears || 3;
    const allowedDurations = authProfile.allowedDurations || [30, 45, 60];

    const teachSkills: UserTeachSkill[] = authProfile.noTeach
      ? []
      : authProfile.teach.map((skillName, index) => ({
          skillId: `sk-teach-${index}`,
          skillName,
          category: 'Skill Exchange',
          level: 'advanced',
          yearsExperience: experienceYears,
          hourlyRate: hourlyRate,
          allowedDurations: allowedDurations,
          isVerified: true,
        }));

    // Map learning skills from onboarding/profile
    const learnSkills: UserLearnSkill[] = authProfile.learn.map((skillName, index) => ({
      skillId: `sk-learn-${index}`,
      skillName,
      category: 'Skill Exchange',
      targetLevel: 'intermediate',
      goal: `Learn ${skillName} from vetted peers`,
    }));

    return {
      id: 'usr-current',
      email: session?.email || 'user@example.com',
      fullName: authProfile.name,
      avatarUrl:
        authProfile.avatar ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: authProfile.bio || (authProfile.headline ? `${authProfile.headline}. Trading: ${authProfile.teach.join(', ') || 'Learner'}` : `SkillSwap member trading skills: ${authProfile.teach.join(', ') || 'Learner'}`),
      city: authProfile.city || 'Bengaluru',
      country: authProfile.country || 'IN',
      timezone: authProfile.timezone || 'Asia/Kolkata',
      languages: authProfile.languages || ['English', 'Hindi'],
      phoneVerified: true,
      isOnboarded: true,
      isAcceptingRequests: authProfile.isAcceptingRequests !== undefined ? authProfile.isAcceptingRequests : true,
      strikesCount: 0,
      reputationScore: 5.0,
      completedSessionsCount: 0,
      teachSkills,
      learnSkills,
      availability: authProfile.availability || defaultAvailability,
    };
  }, [authProfile]);

  // Compute live AI Radar matches dynamically based on the onboarded skills
  const radarMatches = useMemo(() => {
    return computeRadarMatches(currentUser, teachers);
  }, [currentUser, teachers]);

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  // Action: Create and submit new offer
  const handleSubmitOffer = (data: {
    type: OfferType;
    match: RadarMatch;
    proposerTeachSkill?: UserTeachSkill;
    durationMinutes: number;
    message: string;
    chargedTokens: number;
  }) => {
    const quote = generateQuoteBreakdown({
      type: data.type,
      proposerLeg: {
        skillId: data.match.teacherOfferingSkill.skillId,
        skillName: data.match.teacherOfferingSkill.skillName,
        teacherId: data.match.teacher.id,
        learnerId: currentUser.id,
        hourlyRate: data.match.teacherOfferingSkill.hourlyRate,
        durationMinutes: data.durationMinutes,
      },
      recipientLeg:
        data.type === 'SWAP' && data.proposerTeachSkill
          ? {
              skillId: data.proposerTeachSkill.skillId,
              skillName: data.proposerTeachSkill.skillName,
              teacherId: currentUser.id,
              learnerId: data.match.teacher.id,
              hourlyRate: data.proposerTeachSkill.hourlyRate,
              durationMinutes: data.durationMinutes,
            }
          : undefined,
    });

    const newOfferId = `off-${Date.now().toString().slice(-4)}`;

    const newOffer: Offer = {
      id: newOfferId,
      type: data.type,
      proposerId: currentUser.id,
      proposerName: currentUser.fullName,
      recipientId: data.match.teacher.id,
      recipientName: data.match.teacher.fullName,
      status: 'ACCEPTED', // Simulated acceptance
      message: data.message,
      quote,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 48 * 3600000).toISOString(),
    };

    // 1. Lock skill points into Escrow (Available -> Held)
    const holdPaise = data.chargedTokens * 100;
    setWallet(prev => ({
      ...prev,
      availablePaise: Math.max(0, prev.availablePaise - holdPaise),
      heldPaise: prev.heldPaise + holdPaise,
    }));

    // 2. Ledger transaction
    const newTx: LedgerTransaction = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      referenceId: newOfferId,
      type: 'HOLD',
      amountPaise: holdPaise,
      timestamp: 'Just now',
      description: `Escrow hold for ${data.type} proposal with ${data.match.teacher.fullName}`,
      idempotencyKey: `idemp-hold-${newOfferId}`,
    };
    setTransactions(prev => [newTx, ...prev]);

    // 3. Create Session Legs
    const newSessions: SessionLeg[] = [
      {
        id: `ses-${Date.now().toString().slice(-4)}-1`,
        offerId: newOfferId,
        legIndex: 1,
        teacherId: data.match.teacher.id,
        teacherName: data.match.teacher.fullName,
        learnerId: currentUser.id,
        learnerName: currentUser.fullName,
        skillName: data.match.teacherOfferingSkill.skillName,
        durationMinutes: data.durationMinutes,
        chargedTokens: quote.proposerLeg.chargedTokens,
        platformFeeTokens: quote.proposerLeg.platformFeeTokens,
        teacherPayoutTokens: quote.proposerLeg.teacherPayoutTokens,
        scheduledStart: new Date(Date.now() + 2 * 3600000).toISOString(),
        scheduledEnd: new Date(Date.now() + 3 * 3600000).toISOString(),
        meetLink: 'https://meet.google.com/new',
        status: 'SCHEDULED',
        teacherConfirmed: false,
        learnerConfirmed: false,
      },
    ];

    if (data.type === 'SWAP' && data.proposerTeachSkill && quote.recipientLeg) {
      newSessions.push({
        id: `ses-${Date.now().toString().slice(-4)}-2`,
        offerId: newOfferId,
        legIndex: 2,
        teacherId: currentUser.id,
        teacherName: currentUser.fullName,
        learnerId: data.match.teacher.id,
        learnerName: data.match.teacher.fullName,
        skillName: data.proposerTeachSkill.skillName,
        durationMinutes: data.durationMinutes,
        chargedTokens: quote.recipientLeg.chargedTokens,
        platformFeeTokens: quote.recipientLeg.platformFeeTokens,
        teacherPayoutTokens: quote.recipientLeg.teacherPayoutTokens,
        scheduledStart: new Date(Date.now() + 26 * 3600000).toISOString(),
        scheduledEnd: new Date(Date.now() + 27 * 3600000).toISOString(),
        meetLink: 'https://meet.google.com/new',
        status: 'SCHEDULED',
        teacherConfirmed: false,
        learnerConfirmed: false,
      });
    }

    setOffers(prev => [newOffer, ...prev]);
    setSessions(prev => [...newSessions, ...prev]);
    setSelectedMatchForModal(null);
    setActiveTab('sessions');
  };

  // Action: Buy Skill Points
  const handleBuyTokens = (tokens: number) => {
    const paise = tokens * 100;
    setWallet(prev => ({
      ...prev,
      availablePaise: prev.availablePaise + paise,
    }));

    const newTx: LedgerTransaction = {
      id: `tx-${Date.now().toString().slice(-4)}`,
      referenceId: `pay-rzp-${Date.now().toString().slice(-4)}`,
      type: 'PURCHASE',
      amountPaise: paise,
      timestamp: 'Just now',
      description: `Razorpay UPI purchase (${tokens} SP)`,
      idempotencyKey: `idemp-buy-${Date.now()}`,
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Action: Confirm session completion & release escrow
  const handleConfirmSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const chargedPaise = session.chargedTokens * 100;
    const feePaise = session.platformFeeTokens * 100;
    const payoutPaise = session.teacherPayoutTokens * 100;

    setWallet(prev => {
      const isLearner = session.learnerId === currentUser.id;
      const isTeacher = session.teacherId === currentUser.id;

      return {
        ...prev,
        heldPaise: isLearner ? Math.max(0, prev.heldPaise - chargedPaise) : prev.heldPaise,
        availablePaise: isTeacher ? prev.availablePaise + payoutPaise : prev.availablePaise,
        lifetimeEarnedPaise: isTeacher ? prev.lifetimeEarnedPaise + payoutPaise : prev.lifetimeEarnedPaise,
        lifetimeSpentPaise: isLearner ? prev.lifetimeSpentPaise + chargedPaise : prev.lifetimeSpentPaise,
      };
    });

    const settledSession: SessionLeg = { ...session, status: 'SETTLED', teacherConfirmed: true, learnerConfirmed: true };
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? settledSession : s))
    );
    setTimeout(() => {
      setSessionForReview(settledSession);
    }, 1200);

    const releaseTx: LedgerTransaction = {
      id: `tx-${Date.now().toString().slice(-4)}-rel`,
      referenceId: session.id,
      type: 'RELEASE',
      amountPaise: payoutPaise,
      timestamp: 'Just now',
      description: `Escrow payout released to ${session.teacherName} for ${session.skillName}`,
      idempotencyKey: `idemp-rel-${session.id}`,
    };

    const feeTx: LedgerTransaction = {
      id: `tx-${Date.now().toString().slice(-4)}-fee`,
      referenceId: session.id,
      type: 'FEE',
      amountPaise: feePaise,
      timestamp: 'Just now',
      description: `SkillSwap 10% platform fee retained on session ${session.id.substring(0, 8)}`,
      idempotencyKey: `idemp-fee-${session.id}`,
    };

    setTransactions(prev => [releaseTx, feeTx, ...prev]);
  };

  // Action: Dispute a session
  const handleDisputeSession = (sessionId: string, reason: string) => {
    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, status: 'DISPUTED', disputeReason: reason } : s))
    );
  };

  // Action: Admin resolves dispute
  const handleResolveDispute = (sessionId: string, resolution: 'REFUND' | 'RELEASE' | 'SPLIT') => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const chargedPaise = session.chargedTokens * 100;

    if (resolution === 'REFUND') {
      setWallet(prev => ({
        ...prev,
        heldPaise: Math.max(0, prev.heldPaise - chargedPaise),
        availablePaise: prev.availablePaise + chargedPaise,
      }));
    } else if (resolution === 'RELEASE') {
      handleConfirmSession(sessionId);
      return;
    } else {
      const halfPaise = Math.round(chargedPaise / 2);
      setWallet(prev => ({
        ...prev,
        heldPaise: Math.max(0, prev.heldPaise - chargedPaise),
        availablePaise: prev.availablePaise + halfPaise,
      }));
    }

    setSessions(prev => prev.map(s => (s.id === sessionId ? { ...s, status: 'SETTLED' } : s)));
  };

  // Action: Chat Messages
  const handleSendMessage = (content: string, type: 'TEXT' | 'PROPOSE_TIME' = 'TEXT', metadata?: any) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId: 'off-101',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      metadata,
    };
    setChatMessages(prev => [...prev, newMsg]);
  };

  const handleAcceptProposedTime = (messageId: string, meetLink: string) => {
    const confirmMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId: 'off-101',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      content: 'Time accepted! Google Meet link has been generated and calendar invites dispatched.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'TIME_CONFIRMED',
      metadata: { meetLink },
    };
    setChatMessages(prev => [...prev, confirmMsg]);
  };

  if (!isReady || !authProfile) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400 font-mono text-sm">
        Authenticating session & loading peer matches...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-mist text-ink flex flex-col font-sans selection:bg-lagoon selection:text-white overflow-x-hidden">
      {/* Ambient Spatial Lighting Orbs */}
      <div className="pointer-events-none absolute -top-32 left-1/4 h-[500px] w-[700px] ambient-glow-lagoon opacity-50 blur-3xl" />
      <div className="pointer-events-none absolute top-[380px] -right-32 h-[550px] w-[550px] ambient-glow-saffron opacity-40 blur-3xl" />

      {/* Top Floating Spatial Dock Navbar */}
      <Navbar
        currentUser={currentUser}
        wallet={wallet}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenWallet={() => setIsWalletOpen(true)}
        onOpenOnboarding={() => router.push('/profile')}
        onOpenProfile={() => router.push('/profile')}
        onOpenEditSkills={() => setIsEditSkillsOpen(true)}
        onSignOut={handleSignOut}
        pendingOffersCount={offers.filter(o => o.status === 'PENDING').length}
      />

      {/* Onboarding Spatial Context Pill */}
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 pt-3 pb-1 relative z-10">
        <div className="glass-panel rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs border border-ink/[0.06]">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-ink/65">
              Trading as <strong className="text-ink font-semibold">{currentUser.fullName}</strong>
            </span>
            <span className="hidden sm:inline text-ink/20">•</span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-lagoon font-bold font-mono text-[10px] uppercase tracking-wider">You Teach</span>
              <span className="text-ink font-medium bg-mist px-2 py-0.5 rounded-full border border-ink/8">
                {authProfile.noTeach ? 'None (Learn-only mode)' : authProfile.teach.join(', ')}
              </span>
            </div>
            <span className="hidden sm:inline text-ink/20">•</span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-amber-700 dark:text-saffron font-bold font-mono text-[10px] uppercase tracking-wider">You Learn</span>
              <span className="text-ink font-medium bg-mist px-2 py-0.5 rounded-full border border-ink/8">
                {authProfile.learn.join(', ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditSkillsOpen(true)}
              className="text-xs font-semibold text-ink/60 hover:text-ink transition-colors cursor-pointer"
            >
              Quick Skills
            </button>
            <Link
              href="/profile"
              className="text-xs font-semibold text-lagoon hover:text-lagoon-dark transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Edit Profile</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Tab Views */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6">
        {activeTab === 'radar' && (
          <AiRadarView
            matches={radarMatches}
            onSelectMatch={match => setSelectedMatchForModal(match)}
            onOpenEditSkills={() => setIsEditSkillsOpen(true)}
          />
        )}

        {activeTab === 'sessions' && (
          <SessionsView
            sessions={sessions}
            offers={offers}
            currentUser={currentUser}
            onConfirmSession={handleConfirmSession}
            onOpenChat={() => setActiveTab('chat')}
            onDisputeSession={handleDisputeSession}
            onOpenReview={session => setSessionForReview(session)}
          />
        )}

        {activeTab === 'chat' && (
          <TempChatView
            currentUser={currentUser}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onAcceptProposedTime={handleAcceptProposedTime}
          />
        )}

        {activeTab === 'admin' && currentUser.email === 'elanghovansabareesh0921@gmail.com' && (
          <AdminPanel sessions={sessions} onResolveDispute={handleResolveDispute} />
        )}
      </main>

      {/* Interactive Swap Proposal Modal */}
      {selectedMatchForModal && (
        <SwapProposalModal
          match={selectedMatchForModal}
          currentUser={currentUser}
          wallet={wallet}
          isOpen={!!selectedMatchForModal}
          onClose={() => setSelectedMatchForModal(null)}
          onSubmitOffer={handleSubmitOffer}
          onOpenWallet={() => {
            setSelectedMatchForModal(null);
            setIsWalletOpen(true);
          }}
        />
      )}

      {/* Edit Skills Modal */}
      <EditSkillsModal
        isOpen={isEditSkillsOpen}
        onClose={() => setIsEditSkillsOpen(false)}
        profile={authProfile}
        onSave={(updatedProfile) => {
          saveProfile(updatedProfile);
          setAuthProfile(updatedProfile);
        }}
      />

      {/* Wallet Checkout Modal */}
      <WalletModal
        wallet={wallet}
        transactions={transactions}
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onBuyTokens={handleBuyTokens}
      />

      {/* Double-Blind Review Modal (PRD §7.10) */}
      {sessionForReview && (
        <ReviewModal
          session={sessionForReview}
          isOpen={!!sessionForReview}
          onClose={() => setSessionForReview(null)}
          onSubmitReview={(sessionId, rating, feedback, tags) => {
            setSessionForReview(null);
          }}
        />
      )}
    </div>
  );
}
