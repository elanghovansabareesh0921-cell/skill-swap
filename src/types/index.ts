export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillItem {
  id: string;
  name: string;
  category: string;
  minHourlyRate: number;
  maxHourlyRate: number;
}

export interface UserTeachSkill {
  skillId: string;
  skillName: string;
  category: string;
  level: SkillLevel;
  yearsExperience: number;
  hourlyRate: number; // in Skill Points (1 SP = SP1)
  allowedDurations: number[]; // e.g. [30, 45, 60, 90]
  isVerified?: boolean;
}

export interface UserLearnSkill {
  skillId: string;
  skillName: string;
  category: string;
  targetLevel: SkillLevel;
  goal?: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  bio: string;
  city: string;
  country: string;
  timezone: string;
  languages: string[];
  phoneNumber?: string;
  phoneVerified: boolean;
  isOnboarded: boolean;
  isAcceptingRequests: boolean;
  strikesCount: number;
  reputationScore: number; // e.g. 4.95
  completedSessionsCount: number;
  teachSkills: UserTeachSkill[];
  learnSkills: UserLearnSkill[];
  availability: Record<string, string[]>; // e.g. { "Mon": ["18:00-21:00"], "Wed": ["18:00-21:00"] }
  role?: 'admin' | 'user';
  isAdmin?: boolean;
  app_metadata?: Record<string, unknown> | null;
}

export interface Wallet {
  userId: string;
  availablePaise: number; // 1 skill point = 100 paise
  heldPaise: number;
  lifetimeEarnedPaise: number;
  lifetimeSpentPaise: number;
}

export type LedgerTransactionType = 'PURCHASE' | 'HOLD' | 'RELEASE' | 'REFUND' | 'FEE' | 'ADJUSTMENT';

export interface LedgerTransaction {
  id: string;
  referenceId: string;
  type: LedgerTransactionType;
  amountPaise: number;
  timestamp: string;
  description: string;
  idempotencyKey: string;
}

export type OfferType = 'DIRECT' | 'SWAP';
export type OfferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED';

export interface QuoteBreakdown {
  type: OfferType;
  swapFactor: number;
  proposerLeg: {
    skillId: string;
    skillName: string;
    teacherId: string;
    learnerId: string;
    durationMinutes: number;
    hourlyRate: number;
    listPriceTokens: number;
    chargedTokens: number;
    platformFeeTokens: number;
    teacherPayoutTokens: number;
  };
  recipientLeg?: {
    skillId: string;
    skillName: string;
    teacherId: string;
    learnerId: string;
    durationMinutes: number;
    hourlyRate: number;
    listPriceTokens: number;
    chargedTokens: number;
    platformFeeTokens: number;
    teacherPayoutTokens: number;
  };
  inKindExchangedValue: number;
  proposerSavingsPct: number;
  expiresAt: string;
}

export interface Offer {
  id: string;
  type: OfferType;
  proposerId: string;
  proposerName: string;
  recipientId: string;
  recipientName: string;
  status: OfferStatus;
  message?: string;
  quote: QuoteBreakdown;
  createdAt: string;
  expiresAt: string;
}

export type SessionStatus = 'SCHEDULED' | 'PENDING_CONFIRMATION' | 'SETTLED' | 'DISPUTED' | 'CANCELLED';

export interface SessionLeg {
  id: string;
  offerId: string;
  legIndex: number; // 1 or 2
  teacherId: string;
  teacherName: string;
  learnerId: string;
  learnerName: string;
  skillName: string;
  durationMinutes: number;
  chargedTokens: number;
  platformFeeTokens: number;
  teacherPayoutTokens: number;
  scheduledStart?: string;
  scheduledEnd?: string;
  meetLink?: string;
  status: SessionStatus;
  teacherConfirmed: boolean;
  learnerConfirmed: boolean;
  disputeReason?: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: 'TEXT' | 'PROPOSE_TIME' | 'TIME_CONFIRMED' | 'SYSTEM_ALERT';
  metadata?: {
    proposedDate?: string;
    proposedTime?: string;
    durationMinutes?: number;
    legIndex?: number;
    meetLink?: string;
    accepted?: boolean;
  };
}

export interface PeerMatch {
  teacher: Profile;
  matchScore: number; // 0 - 100
  isSwapMatch: boolean;
  reasons: string[];
  directPriceTokens: number;
  swapPriceTokens?: number;
  swapSavingsPct?: number;
  teacherOfferingSkill: UserTeachSkill;
  matchingLearnSkill?: UserLearnSkill;
  teacherDesiresSkill?: UserTeachSkill;
  overlappingSlots: import('@/lib/availability').OverlappingSlot[];
}
