'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getProfile, getSession, saveProfile, signOut, Profile as AuthProfile } from '@/lib/auth';
import { createClient } from '@/lib/supabase/client';
import { Navbar } from '@/components/Navbar';
import { EditSkillsModal } from '@/components/EditSkillsModal';
import { MatchesView } from '@/components/MatchesView';
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
import { computePeerMatches } from '@/lib/matches';
import { generateQuoteBreakdown } from '@/lib/pricing';
import {
  Profile,
  Wallet,
  Offer,
  SessionLeg,
  ChatMessage,
  PeerMatch,
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
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);

  // Fetch Real Users from Supabase
  useEffect(() => {
    const fetchTeachers = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_skills (*, skills (*))
        `);

      if (error || !data) {
        console.error('Error fetching real users:', error);
        setIsLoadingTeachers(false);
        return;
      }

      const realTeachers: Profile[] = data.map((p: any) => {
        const teachSkills = (p.user_skills || []).filter((s: any) => s.skill_type === 'TEACH');
        const learnSkills = (p.user_skills || []).filter((s: any) => s.skill_type === 'LEARN');

        return {
          id: p.id,
          email: p.email,
          fullName: p.full_name || 'Anonymous User',
          avatarUrl: p.avatar_url || '/avatars/avatar_3.jpg',
          bio: p.bio || 'SkillSwap member',
          city: p.city || '',
          country: p.country || 'IN',
          timezone: p.timezone || 'Asia/Kolkata',
          languages: p.languages || ['English'],
          phoneVerified: p.phone_verified || false,
          isOnboarded: p.is_onboarded || false,
          isAcceptingRequests: p.is_accepting_requests !== false,
          strikesCount: p.strikes_count || 0,
          reputationScore: Number(p.reputation_score) || 5.0,
          completedSessionsCount: 0,
          availability: {
            Mon: ['18:00-21:00'], Tue: ['19:00-21:00'], Thu: ['18:00-21:00'], Sat: ['10:00-14:00']
          },
          teachSkills: teachSkills.map((t: any) => ({
            skillId: t.skill_id,
            skillName: t.skills?.name || 'Unknown Skill',
            category: t.skills?.category || 'Software & Tech',
            level: t.level || 'expert',
            yearsExperience: 2,
            hourlyRate: 50,
            allowedDurations: [30, 60],
            isVerified: true
          })),
          learnSkills: learnSkills.map((l: any) => ({
            skillId: l.skill_id,
            skillName: l.skills?.name || 'Unknown Skill',
            category: l.skills?.category || 'Software & Tech',
            targetLevel: l.level || 'intermediate',
            goal: l.goal || ''
          }))
        };
      });

      // Merge with INITIAL_TEACHERS (which is now empty) just in case
      setTeachers([...INITIAL_TEACHERS, ...realTeachers]);
      setIsLoadingTeachers(false);
    };

    fetchTeachers();
  }, []);
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
  const [activeTab, setActiveTab] = useState<'matches' | 'sessions' | 'chat' | 'admin'>('matches');
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<PeerMatch | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isEditSkillsOpen, setIsEditSkillsOpen] = useState(false);
  const [sessionForReview, setSessionForReview] = useState<SessionLeg | null>(null);

  // Authenticate and fetch onboarding profile
  useEffect(() => {
    const initAuth = async () => {
      let session = getSession();
      const supabase = createClient();

      if (!session) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            session = { email: user.email || '', provider: 'google' };
            if (typeof window !== 'undefined') {
              localStorage.setItem('ss_session', JSON.stringify(session));
            }
          }
        } catch (e) {
          // ignore
        }
      }

      if (!session) {
        router.replace('/login');
        return;
      }

      let profile = getProfile();
      if (!profile) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: dbProfile } = await supabase
              .from('profiles')
              .select('*, user_skills (*, skills (*))')
              .eq('id', user.id)
              .single();

            if (dbProfile && dbProfile.is_onboarded) {
              const teachSkills = (dbProfile.user_skills || [])
                .filter((s: any) => s.skill_type === 'TEACH')
                .map((s: any) => s.skills?.name || 'Skill');
              const learnSkills = (dbProfile.user_skills || [])
                .filter((s: any) => s.skill_type === 'LEARN')
                .map((s: any) => s.skills?.name || 'Skill');

              profile = {
                name: dbProfile.full_name || 'Member',
                avatar: dbProfile.avatar_url || '',
                sex: 'other',
                dob: '1998-01-01',
                teach: teachSkills,
                noTeach: teachSkills.length === 0,
                learn: learnSkills,
                bio: dbProfile.bio || '',
                city: dbProfile.city || '',
                country: dbProfile.country || '',
                timezone: dbProfile.timezone || 'Asia/Kolkata',
                languages: dbProfile.languages || ['English'],
              };
              saveProfile(profile);
            }
          }
        } catch (e) {
          // ignore
        }
      }

      if (!profile) {
        router.replace('/onboarding');
        return;
      }
      setAuthProfile(profile);
      setIsReady(true);
    };

    initAuth();
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
        avatarUrl: '/avatars/avatar_4.jpg',
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
        '/avatars/avatar_5.jpg',
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

  // Compute live peer matches dynamically based on the onboarded skills
  const peerMatches = useMemo(() => {
    return computePeerMatches(currentUser, teachers);
  }, [currentUser, teachers]);

  const handleSignOut = () => {
    signOut();
    router.push('/');
  };

  // Action: Create and submit new offer
  const handleSubmitOffer = (data: {
    type: OfferType;
    match: PeerMatch;
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
    >
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">

      {/* Main Tab Views */}
        {activeTab === 'matches' && (
          <MatchesView
            matches={peerMatches}
            onSelectMatch={match => setSelectedMatchForModal(match)}
            onOpenEditSkills={() => setIsEditSkillsOpen(true)}
            currentUser={currentUser}
            sessions={sessions}
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
    </Navbar>
  );
}
