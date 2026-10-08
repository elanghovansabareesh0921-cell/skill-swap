import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof NextResponse) return user;
  return NextResponse.json({ authorized: true });
}