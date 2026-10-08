import React from 'react';
import SwapsDashboard from '@/components/SwapsDashboard';

export const metadata = {
  title: 'Swap Operations – Admin | SkillSwap',
  description: 'Monitor and manage all skill swaps across the SkillSwap platform.',
};

/**
 * Admin Swaps Page
 *
 * Server Component that renders the SwapsDashboard client component.
 * Admin access is enforced by the middleware at src/middleware.ts
 * and the API route at /api/admin/swaps.
 */
export default function AdminSwapsPage() {
  return <SwapsDashboard />;
}
