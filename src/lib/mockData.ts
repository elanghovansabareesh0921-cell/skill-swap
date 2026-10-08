import { Profile, Wallet, Offer, SessionLeg, ChatMessage } from '@/types';

export const CURRENT_USER: Profile = {
  id: 'usr-asha',
  email: 'asha.sharma@example.com',
  fullName: 'Asha Sharma',
  avatarUrl: '/avatars/avatar_1.jpg',
  bio: 'Product Designer with 4 years of experience. Passionate about turning complex systems into clean interfaces. Eager to master backend scripting in Python!',
  city: 'Bengaluru',
  country: 'IN',
  timezone: 'Asia/Kolkata',
  languages: ['English', 'Hindi'],
  phoneNumber: '+91 98765 43210',
  phoneVerified: true,
  isOnboarded: true,
  isAcceptingRequests: true,
  strikesCount: 0,
  reputationScore: 4.96,
  completedSessionsCount: 14,
  teachSkills: [
    {
      skillId: 'sk-ui',
      skillName: 'UI/UX Design (Figma)',
      category: 'Design & Creative',
      level: 'expert',
      yearsExperience: 4,
      hourlyRate: 60,
      allowedDurations: [30, 45, 60],
      isVerified: true,
    },
    {
      skillId: 'sk-excel',
      skillName: 'Advanced Excel & VBA',
      category: 'Business & Finance',
      level: 'advanced',
      yearsExperience: 3,
      hourlyRate: 40,
      allowedDurations: [30, 60],
      isVerified: false,
    },
  ],
  learnSkills: [
    {
      skillId: 'sk-py',
      skillName: 'Python Programming',
      category: 'Software & Tech',
      targetLevel: 'intermediate',
      goal: 'Build automated data scraping pipelines and basic FastAPI backends',
    },
    {
      skillId: 'sk-spanish',
      skillName: 'Conversational Spanish',
      category: 'Languages',
      targetLevel: 'beginner',
      goal: 'Travel fluency for upcoming South America trip',
    },
  ],
  availability: {
    Mon: ['18:00-21:00'],
    Tue: ['19:00-21:00'],
    Thu: ['18:00-21:00'],
    Sat: ['10:00-14:00'],
  },
};

export const INITIAL_TEACHERS: Profile[] = [];

export const INITIAL_WALLET: Wallet = {
  userId: 'usr-asha',
  availablePaise: 18000, // 180 Tokens
  heldPaise: 1800,       // 18 Tokens held for active offer
  lifetimeEarnedPaise: 54000, // 540 Tokens earned
  lifetimeSpentPaise: 36000,  // 360 Tokens spent
};

export const INITIAL_OFFERS: Offer[] = [];

export const INITIAL_SESSIONS: SessionLeg[] = [];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [];
