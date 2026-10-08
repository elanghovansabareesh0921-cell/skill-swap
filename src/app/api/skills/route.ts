import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import type { SkillItem } from '@/types';

interface SkillTaxonomyRow {
  id: string;
  name: string;
  category: string;
  min_hourly_rate: number;
  max_hourly_rate: number;
}

export async function GET(request: NextRequest) {
  const user = await requireUser(request);
  if (user instanceof NextResponse) return user;

  const { data, error } = await getSupabaseAdmin()
    .from('skill_taxonomy')
    .select('id, name, category, min_hourly_rate, max_hourly_rate')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Skill taxonomy lookup failed:', error);
    return NextResponse.json({ error: 'Unable to load skills' }, { status: 503 });
  }

  const skills: SkillItem[] = ((data || []) as SkillTaxonomyRow[]).map((skill) => ({
    id: skill.id,
    name: skill.name,
    category: skill.category,
    minHourlyRate: skill.min_hourly_rate,
    maxHourlyRate: skill.max_hourly_rate,
  }));
  return NextResponse.json({ skills });
}