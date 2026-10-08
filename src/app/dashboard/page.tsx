'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
import { isUserAdmin } from '@/lib/roles';
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

interface SupabaseSkillJoin {
  skill_id: string;
  skill_type: 'TEACH' | 'LEARN';
  level?: 'beginner' | 'intermediate' | 'expert' | 'advanced';
  goal?: string;
  skills?: {
    name?: string;
    category?: string;
  };
}

interface SupabaseProfileJoin {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  country?: string;
  timezone?: string;
  languages?: string[];
  phone_verified?: boolean;
  is_onboarded?: boolean;
  is_accepting_requests?: boolean;
  strikes_count?: number;
  reputation_score?: number;
  user_skills?: SupabaseSkillJoin[];
}

export default function Dashboard() {
  const router = useRouter();
  const [authProfile, setAuthProfile] = useState<AuthProfile | null>(null);
  const [userId, setUserId] = useState<string>('usr-current');
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
  const [activeTab, setActiveTab] = useState<'matches' | 'sessions' | 'chat' | 'admin'>('matches');
  const [selectedMatchForModal, setSelectedMatchForModal] = useState<PeerMatch | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isEditSkillsOpen, setIsEditSkillsOpen] = useState(false);
  const [sessionForReview, setSessionForReview] = useState<SessionLeg | null>(null);

  // Synchronize live wallet balance and transactions from Supabase
  useEffect(() => {
    if (!userId || userId === 'usr-current') return;

    fetch(`/api/wallet/balance?userId=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.wallet) {
          setWallet(data.wallet);
        }
        if (data.transactions && data.transactions.length > 0) {
          setTransactions(data.transactions);
        }
      })
      .catch((err) => console.error('Error fetching live wallet:', err));

    fetch(`/api/offers?userId=${encodeURIComponent(userId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.offers && data.offers.length > 0) {
          setOffers((prev) => {
            const incoming = data.offers.filter((o: Offer) => !prev.some((p) => p.id === o.id));
            return [...incoming, ...prev];
          });
        }
        if (data.sessions && data.sessions.length > 0) {
          setSessions((prev) => {
            const incoming = data.sessions.filter((s: SessionLeg) => !prev.some((p) => p.id === s.id));
            return [...incoming, ...prev];
          });
        }
      })
      .catch((err) => console.error('Error fetching live offers:', err));
  }, [userId]);

  // Fetch Real Users from Supabase
  useEffect(() => {
    const fetchTeachers = async () => {
      const supabase = createClient();
      
      let rows: SupabaseProfileJoin[] = [];
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_skills (*, skills (*))
        `);

      if (!error && data) {
        rows = data as unknown as SupabaseProfileJoin[];
      } else {
        const { data: rawProfiles } = await supabase.from('profiles').select('*');
        if (rawProfiles) {
          rows = rawProfiles as unknown as SupabaseProfileJoin[];
        }
      }

      if (rows.length === 0) return;

      // Also query user_skills_teach and user_skills_learn in case dual schema is used
      const teachByUserId: Record<string, Array<{ skillId: string; skillName: string; category: string; level: string }>> = {};
      const learnByUserId: Record<string, Array<{ skillId: string; skillName: string; category: string; targetLevel: string; goal: string }>> = {};

      try {
        const [teachRes, learnRes] = await Promise.all([
          supabase.from('user_skills_teach').select('*, skill_taxonomy(*)'),
          supabase.from('user_skills_learn').select('*, skill_taxonomy(*)'),
        ]);

        if (teachRes.data) {
          teachRes.data.forEach((t: { user_id: string; skill_id: string; level?: string; skill_taxonomy?: { name?: string; category?: string } }) => {
            if (!teachByUserId[t.user_id]) teachByUserId[t.user_id] = [];
            teachByUserId[t.user_id].push({
              skillId: t.skill_id,
              skillName: t.skill_taxonomy?.name || 'Skill',
              category: t.skill_taxonomy?.category || 'Software & Tech',
              level: t.level || 'expert',
            });
          });
        }

        if (learnRes.data) {
          learnRes.data.forEach((l: { user_id: string; skill_id: string; target_level?: string; goal?: string; skill_taxonomy?: { name?: string; category?: string } }) => {
            if (!learnByUserId[l.user_id]) learnByUserId[l.user_id] = [];
            learnByUserId[l.user_id].push({
              skillId: l.skill_id,
              skillName: l.skill_taxonomy?.name || 'Skill',
              category: l.skill_taxonomy?.category || 'Software & Tech',
              targetLevel: l.target_level || 'intermediate',
              goal: l.goal || '',
            });
          });
        }
      } catch {
        // ignore
      }

      const realTeachers: Profile[] = rows.map((p) => {
        const legacyTeach = (p.user_skills || []).filter((s) => s.skill_type === 'TEACH');
        const legacyLearn = (p.user_skills || []).filter((s) => s.skill_type === 'LEARN');

        const teachSkills = legacyTeach.length > 0
          ? legacyTeach.map((t) => ({
              skillId: t.skill_id,
              skillName: t.skills?.name || 'Unknown Skill',
              category: t.skills?.category || 'Software & Tech',
              level: t.level || 'expert',
              yearsExperience: 2,
              hourlyRate: 50,
              allowedDurations: [30, 60],
              isVerified: true,
            }))
          : (teachByUserId[p.id] || []).map((t) => ({
              skillId: t.skillId,
              skillName: t.skillName,
              category: t.category,
              level: (t.level as 'beginner' | 'intermediate' | 'advanced' | 'expert') || 'expert',
              yearsExperience: 2,
              hourlyRate: 50,
              allowedDurations: [30, 60],
              isVerified: true,
            }));

        const learnSkills = legacyLearn.length > 0
          ? legacyLearn.map((l) => ({
              skillId: l.skill_id,
              skillName: l.skills?.name || 'Unknown Skill',
              category: l.skills?.category || 'Software & Tech',
              targetLevel: ((l.level === 'advanced' ? 'expert' : l.level) || 'intermediate') as 'beginner' | 'intermediate' | 'expert',
              goal: l.goal || '',
            }))
          : (learnByUserId[p.id] || []).map((l) => ({
              skillId: l.skillId,
              skillName: l.skillName,
              category: l.category,
              targetLevel: ((l.targetLevel === 'advanced' ? 'expert' : l.targetLevel) || 'intermediate') as 'beginner' | 'intermediate' | 'expert',
              goal: l.goal,
            }));

        return {
          id: p.id,
          email: p.email || 'user@example.com',
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
          teachSkills,
          learnSkills,
        };
      });

      const validRealTeachers = realTeachers.filter(t => t.teachSkills.length > 0 || t.learnSkills.length > 0);
      setTeachers([...INITIAL_TEACHERS, ...validRealTeachers]);
    };

    fetchTeachers();
  }, []);

  // Supabase Realtime Broadcast for E2E Testing
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel('skillswap-events');

    channel
      .on('broadcast', { event: 'new_offer' }, (payload) => {
        setOffers((prev) => {
          if (prev.some(o => o.id === payload.payload.offer.id)) return prev;
          return [payload.payload.offer, ...prev];
        });
        setSessions((prev) => {
          const incomingSessions = payload.payload.sessions;
          const newSessions = incomingSessions.filter((s: SessionLeg) => !prev.some(ps => ps.id === s.id));
          return [...newSessions, ...prev];
        });
      })
      .on('broadcast', { event: 'new_message' }, (payload) => {
        setChatMessages((prev) => {
          if (prev.some(m => m.id === payload.payload.message.id)) return prev;
          return [...prev, payload.payload.message];
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Authenticate and fetch onboarding profile
  useEffect(() => {
    const initAuth = async () => {
      let session = getSession();
      const supabase = createClient();

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          if (!session) {
            session = { email: user.email || '', provider: 'google' };
            if (typeof window !== 'undefined') {
              localStorage.setItem('ss_session', JSON.stringify(session));
            }
          }
        }
      } catch {
        // ignore
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
            const { data: dbProfileData } = await supabase
              .from('profiles')
              .select('*, user_skills (*, skills (*))')
              .eq('id', user.id)
              .single();

            const dbProfile = dbProfileData as unknown as SupabaseProfileJoin;

            if (dbProfile && dbProfile.is_onboarded) {
              let teachSkills = (dbProfile.user_skills || [])
                .filter((s) => s.skill_type === 'TEACH')
                .map((s) => s.skills?.name || 'Skill');
              let learnSkills = (dbProfile.user_skills || [])
                .filter((s) => s.skill_type === 'LEARN')
                .map((s) => s.skills?.name || 'Skill');

              if (teachSkills.length === 0 && learnSkills.length === 0) {
                try {
                  const [teachRes, learnRes] = await Promise.all([
                    supabase.from('user_skills_teach').select('*, skill_taxonomy(*)').eq('user_id', user.id),
                    supabase.from('user_skills_learn').select('*, skill_taxonomy(*)').eq('user_id', user.id),
                  ]);
                  if (teachRes.data && teachRes.data.length > 0) {
                    teachSkills = teachRes.data.map(
                      (t: { skill_taxonomy?: { name?: string } }) => t.skill_taxonomy?.name || 'Skill'
                    );
                  }
                  if (learnRes.data && learnRes.data.length > 0) {
                    learnSkills = learnRes.data.map(
                      (l: { skill_taxonomy?: { name?: string } }) => l.skill_taxonomy?.name || 'Skill'
                    );
                  }
                } catch {
                  // ignore
                }
              }

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
        } catch {
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
      id: userId,
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
  }, [authProfile, userId]);

  // Compute live peer matches dynamically based on the onboarded skills
  const peerMatches = useMemo(() => {
    return computePeerMatches(currentUser, teachers);
  }, [currentUser, teachers]);

  const handleSignOut = async () => {
    signOut();
    router.replace('/');
  };

  // Action: Create and submit new offer
  const handleSubmitOffer = async (data: {
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

    // 1. Attempt server-side atomic offer creation & escrow hold via API
    try {
      const res = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposerId: currentUser.id,
          proposerName: currentUser.fullName,
          recipientId: data.match.teacher.id,
          recipientName: data.match.teacher.fullName,
          type: data.type,
          quote,
          message: data.message,
          durationMinutes: data.durationMinutes,
          chargedTokens: data.chargedTokens,
          skillName: data.match.teacherOfferingSkill.skillName,
          proposerSkillName: data.proposerTeachSkill?.skillName,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success && resData.offer && resData.sessions) {
        setOffers(prev => [resData.offer, ...prev]);
        setSessions(prev => [...resData.sessions, ...prev]);

        const holdPaise = data.chargedTokens * 100;
        setWallet(prev => ({
          ...prev,
          availablePaise: Math.max(0, prev.availablePaise - holdPaise),
          heldPaise: prev.heldPaise + holdPaise,
        }));

        const newTx: LedgerTransaction = {
          id: `tx-${Date.now().toString().slice(-4)}`,
          referenceId: resData.offer.id,
          type: 'HOLD',
          amountPaise: holdPaise,
          timestamp: 'Just now',
          description: `Escrow hold for ${data.type} proposal with ${data.match.teacher.fullName}`,
          idempotencyKey: `idemp-hold-${resData.offer.id}`,
        };
        setTransactions(prev => [newTx, ...prev]);

        const supabase = createClient();
        supabase.channel('skillswap-events').send({
          type: 'broadcast',
          event: 'new_offer',
          payload: { offer: resData.offer, sessions: resData.sessions },
        });

        setSelectedMatchForModal(null);
        setActiveTab('sessions');
        return;
      }
    } catch (err) {
      console.warn('API offer endpoint fallback to optimistic state:', err);
    }

    // Fallback: local optimistic state
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
    
    // Broadcast the new offer to other users
    const supabase = createClient();
    supabase.channel('skillswap-events').send({
      type: 'broadcast',
      event: 'new_offer',
      payload: { offer: newOffer, sessions: newSessions },
    });

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

  // Action: Confirm session completion & release escrow (Dual Sign-off)
  const handleConfirmSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const isTeacher = session.teacherId === currentUser.id;
    const isLearner = session.learnerId === currentUser.id;

    // Call server-side dual sign-off API
    try {
      const res = await fetch('/api/sessions/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: currentUser.id,
        }),
      });

      const resData = await res.json();
      if (res.ok && resData.success) {
        if (resData.settled) {
          const chargedPaise = session.chargedTokens * 100;
          const payoutPaise = Math.round(session.teacherPayoutTokens * 100);
          setWallet(prev => ({
            ...prev,
            heldPaise: Math.max(0, prev.heldPaise - chargedPaise),
            availablePaise: isTeacher ? prev.availablePaise + payoutPaise : prev.availablePaise,
          }));
          const settledSession: SessionLeg = {
            ...session,
            status: 'SETTLED',
            teacherConfirmed: true,
            learnerConfirmed: true,
          };
          setSessions(prev =>
            prev.map(s =>
              s.id === sessionId
                ? settledSession
                : s
            )
          );
          setSessionForReview(settledSession);
        } else {
          setSessions(prev =>
            prev.map(s =>
              s.id === sessionId
                ? {
                    ...s,
                    teacherConfirmed: isTeacher ? true : s.teacherConfirmed,
                    learnerConfirmed: isLearner ? true : s.learnerConfirmed,
                  }
                : s
            )
          );
        }
        return;
      }
    } catch (err) {
      console.warn('API session confirm failed, falling back to local state:', err);
    }

    const updatedTeacherConfirmed = isTeacher ? true : (session.teacherConfirmed || false);
    const updatedLearnerConfirmed = isLearner ? true : (session.learnerConfirmed || false);

    // If both parties haven't confirmed yet, only mark the current user's confirmation
    if (!updatedTeacherConfirmed || !updatedLearnerConfirmed) {
      setSessions(prev =>
        prev.map(s =>
          s.id === sessionId
            ? {
                ...s,
                teacherConfirmed: updatedTeacherConfirmed,
                learnerConfirmed: updatedLearnerConfirmed,
              }
            : s
        )
      );
      return;
    }

    // Both parties have confirmed: complete the session and release escrow
    const chargedPaise = session.chargedTokens * 100;
    const feePaise = session.platformFeeTokens * 100;
    const payoutPaise = session.teacherPayoutTokens * 100;

    // 1. Release held escrow: subtract from held
    // 2. If current user is the teacher, credit their available balance with the payout
    setWallet(prev => ({
      ...prev,
      heldPaise: Math.max(0, prev.heldPaise - chargedPaise),
      availablePaise: isTeacher ? prev.availablePaise + payoutPaise : prev.availablePaise,
    }));

    // 3. Mark session as SETTLED
    const settledSession: SessionLeg = {
      ...session,
      status: 'SETTLED',
      teacherConfirmed: true,
      learnerConfirmed: true,
    };

    setSessions(prev =>
      prev.map(s =>
        s.id === sessionId
          ? settledSession
          : s
      )
    );

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
    setSessionForReview(settledSession);
  };

  // Action: Dispute a session
  const handleDisputeSession = async (sessionId: string, reason: string) => {
    try {
      await fetch('/api/sessions/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId: currentUser.id,
          reason,
        }),
      });
    } catch (err) {
      console.warn('API dispute failed, updating local state:', err);
    }

    setSessions(prev =>
      prev.map(s => (s.id === sessionId ? { ...s, status: 'DISPUTED', disputeReason: reason } : s))
    );
  };

  // Action: Admin resolves dispute
  const handleResolveDispute = async (sessionId: string, resolution: 'REFUND' | 'RELEASE' | 'SPLIT') => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      await fetch('/api/admin/dispute/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          resolution,
          adminEmail: currentUser.email,
        }),
      });
    } catch (err) {
      console.warn('Admin dispute API fallback:', err);
    }

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
  const handleSendMessage = async (content: string, type: 'TEXT' | 'PROPOSE_TIME' = 'TEXT', metadata?: Record<string, unknown>) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      threadId: offers[0]?.id || 'off-101',
      senderId: currentUser.id,
      senderName: currentUser.fullName,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type,
      metadata,
    };
    setChatMessages(prev => [...prev, newMsg]);

    try {
      await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: offers[0]?.id,
          senderId: currentUser.id,
          content,
          messageType: type,
          metadata,
        }),
      });
    } catch (err) {
      console.warn('Chat persistence API error, relying on local/broadcast:', err);
    }

    const supabase = createClient();
    supabase.channel('skillswap-events').send({
      type: 'broadcast',
      event: 'new_message',
      payload: { message: newMsg },
    });
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

    const supabase = createClient();
    supabase.channel('skillswap-events').send({
      type: 'broadcast',
      event: 'new_message',
      payload: { message: confirmMsg },
    });
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

        {activeTab === 'admin' && isUserAdmin(currentUser) && (
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
          onSubmitReview={async (sessionId, rating, feedback, tags) => {
            try {
              await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  sessionId,
                  reviewerId: currentUser.id,
                  rating,
                  feedback,
                  tags,
                }),
              });
            } catch (err) {
              console.warn('Failed to save review to backend:', err);
            }
            setSessionForReview(null);
          }}
        />
      )}
      </div>
    </Navbar>
  );
}
