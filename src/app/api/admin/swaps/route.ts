/**
 * Admin Swaps API Route
 *
 * GET  /api/admin/swaps         – List all swaps (with optional query params: status, search)
 * PATCH /api/admin/swaps        – Update a swap's status (body: { id, status })
 *
 * All endpoints enforce admin-only access via checkAdminAccess().
 * Returns 403 Forbidden for unauthorized users.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/admin/auth';
import { mockSwaps, type SkillSwap, type SwapStatus, SWAP_STATUSES } from '@/lib/admin/mockSwaps';

/**
 * In-memory swap store (resets on server restart).
 * In production this would be a database query.
 */
let swapStore: SkillSwap[] = [...mockSwaps];

export async function GET(request: NextRequest) {
  const { isAdmin } = await checkAdminAccess();
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get('status') as SwapStatus | null;
  const searchQuery = searchParams.get('search')?.toLowerCase() ?? '';

  let filtered = [...swapStore];

  // Filter by status
  if (statusFilter && SWAP_STATUSES.includes(statusFilter)) {
    filtered = filtered.filter((s) => s.status === statusFilter);
  }

  // Filter by search (name, email, or skill keyword)
  if (searchQuery) {
    filtered = filtered.filter(
      (s) =>
        s.requester.name.toLowerCase().includes(searchQuery) ||
        s.requester.email.toLowerCase().includes(searchQuery) ||
        s.provider.name.toLowerCase().includes(searchQuery) ||
        s.provider.email.toLowerCase().includes(searchQuery) ||
        s.skillOffered.toLowerCase().includes(searchQuery) ||
        s.skillRequested.toLowerCase().includes(searchQuery)
    );
  }

  return NextResponse.json({
    swaps: filtered,
    total: filtered.length,
    allTotal: swapStore.length,
  });
}

export async function PATCH(request: NextRequest) {
  const { isAdmin } = await checkAdminAccess();
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Forbidden: Admin access required' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id, status } = body as { id: string; status: SwapStatus };

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id and status' },
        { status: 400 }
      );
    }

    if (!SWAP_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${SWAP_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    const swapIndex = swapStore.findIndex((s) => s.id === id);
    if (swapIndex === -1) {
      return NextResponse.json({ error: 'Swap not found' }, { status: 404 });
    }

    swapStore[swapIndex] = { ...swapStore[swapIndex], status };

    return NextResponse.json({
      message: `Swap ${id} updated to ${status}`,
      swap: swapStore[swapIndex],
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
