import { Profile, Wallet, Offer, SessionLeg, ChatMessage } from '@/types';

export const INITIAL_TEACHERS: Profile[] = [];

export const INITIAL_WALLET: Wallet = {
  userId: '',
  availablePaise: 0,
  heldPaise: 0,
  lifetimeEarnedPaise: 0,
  lifetimeSpentPaise: 0,
};

export const INITIAL_OFFERS: Offer[] = [];

export const INITIAL_SESSIONS: SessionLeg[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
