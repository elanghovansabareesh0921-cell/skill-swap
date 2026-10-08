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
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mockSwaps, type SkillSwap, type SwapStatus, SWAP_STATUSES } from '@/lib/admin/mockSwaps';

/**
 * In-memory swap store (resets on server restart).
 * In production this would be a database query.
 */
const swapStore: SkillSwap[] = [...mockSwaps];

interface DbSessionRow {
  id: string;
  status: string;
  skill_name?: string;
  duration_minutes?: number;
  scheduled_start?: string | null;
  created_at?: string;
  dispute_reason?: string | null;
  teacher?: { full_name?: string; email?: string; avatar_url?: string } | null;
  learner?: { full_name?: string; email?: string; avatar_url?: string } | null;
}

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

  let dbSwaps: SkillSwap[] = [];
  const admin = getSupabaseAdmin();
  if (admin) {
    try {
      const { data: dbSessions } = await admin
        .from('sessions')
        .select(`
          id,
          status,
          skill_name,
          duration_minutes,
          scheduled_start,
          created_at,
          dispute_reason,
          teacher:profiles!sessions_teacher_id_fkey(full_name, email, avatar_url),
          learner:profiles!sessions_learner_id_fkey(full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (dbSessions) {
        dbSwaps = (dbSessions as unknown as DbSessionRow[]).map((s) => {
          let status: SwapStatus = 'Pending';
          if (s.status === 'SETTLED') status = 'Completed';
          else if (s.status === 'DISPUTED') status = 'Disputed';
          else if (s.status === 'CANCELLED') status = 'Cancelled';
          else if (s.status === 'SCHEDULED' || s.status === 'PENDING_CONFIRMATION') status = 'Accepted';

          return {
            id: s.id,
            requester: {
              name: s.learner?.full_name || 'Learner',
              email: s.learner?.email || 'learner@example.com',
              avatar: s.learner?.avatar_url || '/avatars/avatar_1.jpg',
            },
            skillOffered: 'Skill Points (Escrow)',
            provider: {
              name: s.teacher?.full_name || 'Teacher',
              email: s.teacher?.email || 'teacher@example.com',
              avatar: s.teacher?.avatar_url || '/avatars/avatar_2.jpg',
            },
            skillRequested: s.skill_name || 'Skill Session',
            status,
            createdAt: s.created_at || new Date().toISOString(),
            scheduledAt: s.scheduled_start || null,
            notes: s.dispute_reason || undefined,
          };
        });
      }
    } catch (err) {
      console.warn('Error querying DB sessions for admin:', err);
    }
  }

  let filtered = [...dbSwaps, ...swapStore];

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
    allTotal: dbSwaps.length + swapStore.length,
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

    const admin = getSupabaseAdmin();
    if (admin) {
      const statusMap: Record<SwapStatus, string> = {
        Pending: 'SCHEDULED',
        Accepted: 'SCHEDULED',
        Completed: 'SETTLED',
        Cancelled: 'CANCELLED',
        Disputed: 'DISPUTED',
      };
      await admin.from('sessions').update({ status: statusMap[status] }).eq('id', id);
    }

    const swapIndex = swapStore.findIndex((s) => s.id === id);
    if (swapIndex !== -1) {
      swapStore[swapIndex] = { ...swapStore[swapIndex], status };
    }

    return NextResponse.json({
      message: `Swap ${id} updated to ${status}`,
      status,
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
