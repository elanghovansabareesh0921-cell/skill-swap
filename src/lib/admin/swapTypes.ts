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