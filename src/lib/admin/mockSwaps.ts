/**
 * Mock Skill Swap Data for Admin Dashboard
 *
 * Provides realistic seed data simulating all swap statuses for development
 * and testing of the admin monitoring dashboard.
 */

export type SwapStatus = 'Pending' | 'Accepted' | 'Completed' | 'Cancelled' | 'Disputed';

export interface SkillSwap {
  id: string;
  requester: {
    name: string;
    email: string;
    avatar: string;
  };
  skillOffered: string;
  provider: {
    name: string;
    email: string;
    avatar: string;
  };
  skillRequested: string;
  status: SwapStatus;
  createdAt: string;
  scheduledAt: string | null;
  notes?: string;
}

export const SWAP_STATUSES: SwapStatus[] = [
  'Pending',
  'Accepted',
  'Completed',
  'Cancelled',
  'Disputed',
];

export const mockSwaps: SkillSwap[] = [
  {
    id: 'swp-001',
    requester: {
      name: 'Asha Sharma',
      email: 'asha.sharma@example.com',
      avatar: '/avatars/avatar_2.jpg',
    },
    skillOffered: 'UI/UX Design (Figma)',
    provider: {
      name: 'Ravi Kumar',
      email: 'ravi.kumar@example.com',
      avatar: '/avatars/avatar_3.jpg',
    },
    skillRequested: 'Python Programming',
    status: 'Pending',
    createdAt: '2026-10-01T09:30:00Z',
    scheduledAt: null,
    notes: 'Waiting for Ravi to accept the proposal.',
  },
  {
    id: 'swp-002',
    requester: {
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      avatar: '/avatars/avatar_4.jpg',
    },
    skillOffered: 'Financial Modeling',
    provider: {
      name: 'Asha Sharma',
      email: 'asha.sharma@example.com',
      avatar: '/avatars/avatar_2.jpg',
    },
    skillRequested: 'UI/UX Design (Figma)',
    status: 'Accepted',
    createdAt: '2026-09-28T14:15:00Z',
    scheduledAt: '2026-10-10T10:00:00Z',
    notes: 'Session scheduled via Google Meet.',
  },
  {
    id: 'swp-003',
    requester: {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      avatar: '/avatars/avatar_1.jpg',
    },
    skillOffered: 'Rust & Systems Design',
    provider: {
      name: 'Sneha Iyer',
      email: 'sneha.iyer@example.com',
      avatar: '/avatars/avatar_5.jpg',
    },
    skillRequested: 'Conversational Spanish',
    status: 'Completed',
    createdAt: '2026-09-15T11:00:00Z',
    scheduledAt: '2026-09-20T16:00:00Z',
    notes: 'Both parties confirmed. Session settled.',
  },
  {
    id: 'swp-004',
    requester: {
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      avatar: '/avatars/avatar_6.jpg',
    },
    skillOffered: 'Acoustic Guitar',
    provider: {
      name: 'Neha Reddy',
      email: 'neha.reddy@example.com',
      avatar: '/avatars/avatar_7.jpg',
    },
    skillRequested: 'Advanced Excel & VBA',
    status: 'Cancelled',
    createdAt: '2026-09-22T08:45:00Z',
    scheduledAt: '2026-09-25T14:00:00Z',
    notes: 'Cancelled by requester due to scheduling conflict.',
  },
  {
    id: 'swp-005',
    requester: {
      name: 'Ravi Kumar',
      email: 'ravi.kumar@example.com',
      avatar: '/avatars/avatar_3.jpg',
    },
    skillOffered: 'Python Programming',
    provider: {
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      avatar: '/avatars/avatar_4.jpg',
    },
    skillRequested: 'Financial Modeling',
    status: 'Disputed',
    createdAt: '2026-09-18T17:30:00Z',
    scheduledAt: '2026-09-22T11:00:00Z',
    notes: 'Provider reported no-show. Learner disputes claim.',
  },
  {
    id: 'swp-006',
    requester: {
      name: 'Meera Joshi',
      email: 'meera.joshi@example.com',
      avatar: '/avatars/avatar_8.jpg',
    },
    skillOffered: 'Public Speaking & Pitching',
    provider: {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      avatar: '/avatars/avatar_1.jpg',
    },
    skillRequested: 'Rust & Systems Design',
    status: 'Pending',
    createdAt: '2026-10-05T13:00:00Z',
    scheduledAt: null,
  },
  {
    id: 'swp-007',
    requester: {
      name: 'Sneha Iyer',
      email: 'sneha.iyer@example.com',
      avatar: '/avatars/avatar_5.jpg',
    },
    skillOffered: 'Conversational Spanish',
    provider: {
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      avatar: '/avatars/avatar_6.jpg',
    },
    skillRequested: 'Acoustic Guitar',
    status: 'Accepted',
    createdAt: '2026-10-02T10:30:00Z',
    scheduledAt: '2026-10-12T15:00:00Z',
  },
  {
    id: 'swp-008',
    requester: {
      name: 'Neha Reddy',
      email: 'neha.reddy@example.com',
      avatar: '/avatars/avatar_7.jpg',
    },
    skillOffered: 'Advanced Excel & VBA',
    provider: {
      name: 'Meera Joshi',
      email: 'meera.joshi@example.com',
      avatar: '/avatars/avatar_8.jpg',
    },
    skillRequested: 'Public Speaking & Pitching',
    status: 'Completed',
    createdAt: '2026-09-10T09:00:00Z',
    scheduledAt: '2026-09-14T12:00:00Z',
    notes: 'Great session. Both parties left positive reviews.',
  },
  {
    id: 'swp-009',
    requester: {
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      avatar: '/avatars/avatar_1.jpg',
    },
    skillOffered: 'Rust & Systems Design',
    provider: {
      name: 'Asha Sharma',
      email: 'asha.sharma@example.com',
      avatar: '/avatars/avatar_2.jpg',
    },
    skillRequested: 'UI/UX Design (Figma)',
    status: 'Disputed',
    createdAt: '2026-09-25T16:00:00Z',
    scheduledAt: '2026-09-29T10:00:00Z',
    notes: 'Quality of session disputed. Learner claims material was not as described.',
  },
  {
    id: 'swp-010',
    requester: {
      name: 'Vikram Singh',
      email: 'vikram.singh@example.com',
      avatar: '/avatars/avatar_6.jpg',
    },
    skillOffered: 'Acoustic Guitar',
    provider: {
      name: 'Ravi Kumar',
      email: 'ravi.kumar@example.com',
      avatar: '/avatars/avatar_3.jpg',
    },
    skillRequested: 'Python Programming',
    status: 'Pending',
    createdAt: '2026-10-07T07:15:00Z',
    scheduledAt: null,
    notes: 'New request, awaiting provider response.',
  },
  {
    id: 'swp-011',
    requester: {
      name: 'Priya Patel',
      email: 'priya.patel@example.com',
      avatar: '/avatars/avatar_4.jpg',
    },
    skillOffered: 'Financial Modeling',
    provider: {
      name: 'Sneha Iyer',
      email: 'sneha.iyer@example.com',
      avatar: '/avatars/avatar_5.jpg',
    },
    skillRequested: 'Conversational Spanish',
    status: 'Cancelled',
    createdAt: '2026-09-12T11:30:00Z',
    scheduledAt: '2026-09-16T09:00:00Z',
    notes: 'Provider cancelled due to personal emergency.',
  },
  {
    id: 'swp-012',
    requester: {
      name: 'Meera Joshi',
      email: 'meera.joshi@example.com',
      avatar: '/avatars/avatar_8.jpg',
    },
    skillOffered: 'Public Speaking & Pitching',
    provider: {
      name: 'Neha Reddy',
      email: 'neha.reddy@example.com',
      avatar: '/avatars/avatar_7.jpg',
    },
    skillRequested: 'Advanced Excel & VBA',
    status: 'Completed',
    createdAt: '2026-09-08T14:00:00Z',
    scheduledAt: '2026-09-12T17:00:00Z',
  },
];

/**
 * Admin-only user roles for seed testing
 */
export const mockAdminUsers = [
  {
    id: 'admin-001',
    email: 'elanghovansabareesh0921@gmail.com',
    role: 'admin' as const,
    name: 'Sabareesh (Primary Admin)',
  },
  {
    id: 'admin-002',
    email: 'admin@skillswap.com',
    role: 'admin' as const,
    name: 'Platform Admin',
  },
  {
    id: 'user-001',
    email: 'asha.sharma@example.com',
    role: 'user' as const,
    name: 'Asha Sharma',
  },
  {
    id: 'user-002',
    email: 'ravi.kumar@example.com',
    role: 'user' as const,
    name: 'Ravi Kumar',
  },
];
