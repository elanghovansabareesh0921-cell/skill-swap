import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { requireUser } from '@/lib/auth/server';

interface ProfileSyncFields extends Record<string, unknown> {
  teach?: unknown;
  learn?: unknown;
  availability?: unknown;
}

interface TaxonomyRow {
  id: string;
  name: string;
  category: string;
  min_hourly_rate: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];
}

function availabilityValue(value: unknown): Record<string, string[]> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(([day, slots]) => {
      if (!Array.isArray(slots) || !slots.every((slot) => typeof slot === 'string')) return [];
      return [[day, slots as string[]]];
    })
  );
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    if (user instanceof NextResponse) return user;

    const body: unknown = await req.json();
    const profile = isRecord(body) && isRecord(body.profile)
      ? body.profile as ProfileSyncFields
      : null;

    if (!profile || !user.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const teachNames = stringArray(profile.teach);
    const learnNames = stringArray(profile.learn);
    const availability = availabilityValue(profile.availability);
    const hourlyRate = typeof profile.hourlyRate === 'number' && Number.isFinite(profile.hourlyRate) && profile.hourlyRate > 0
      ? Math.round(profile.hourlyRate)
      : null;
    const experienceYears = typeof profile.experienceYears === 'number' && Number.isFinite(profile.experienceYears) && profile.experienceYears >= 0
      ? profile.experienceYears
      : null;
    const allowedDurations = Array.isArray(profile.allowedDurations)
      ? profile.allowedDurations.filter((duration): duration is number => Number.isInteger(duration) && duration > 0)
      : null;
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
    const teachLevel = validLevels.find((level) => level === profile.teachLevel) || 'intermediate';
    const learnLevel = validLevels.find((level) => level === profile.learnLevel) || 'beginner';
    const profileName = stringValue(profile.name);
    const profileAvatar = stringValue(profile.avatar);
    const profileBio = stringValue(profile.bio) || stringValue(profile.headline);

    const supabaseAdmin = getSupabaseAdmin();

    const emailPrefix = user.email ? user.email.split('@')[0] : '';
    const cleanedPrefix = emailPrefix.replace(/[._-]+/g, ' ').trim();
    const derivedNameFromEmail = cleanedPrefix
      .split(' ')
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
    const userMeta = (user.user_metadata || {}) as Record<string, unknown>;
    const metaFullName = typeof userMeta.full_name === 'string' ? userMeta.full_name : '';
    const metaName = typeof userMeta.name === 'string' ? userMeta.name : '';
    const metaAvatar = typeof userMeta.avatar_url === 'string'
      ? userMeta.avatar_url
      : typeof userMeta.picture === 'string'
        ? userMeta.picture
        : '';
    const fallbackName = (metaFullName || metaName || derivedNameFromEmail || 'Member').trim();

    // 1. Upsert Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        full_name: profileName || fallbackName,
        avatar_url: profileAvatar || metaAvatar || '/avatars/avatar_2.jpg',
        bio: profileBio || 'SkillSwap Member',
        languages: stringArray(profile.languages).length > 0 ? stringArray(profile.languages) : ['English'],
        city: stringValue(profile.city) || 'Global',
        country: stringValue(profile.country) || 'IN',
        timezone: stringValue(profile.timezone) || 'Asia/Kolkata',
        availability,
        is_onboarded: true,
        is_accepting_requests: profile.isAcceptingRequests !== false,
      });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    // Initialize wallet if not exists
    try {
      await supabaseAdmin.from('wallets').upsert({
        user_id: user.id,
        available_paise: 50000, // 500 SP welcome credits
        held_paise: 0,
        lifetime_earned_paise: 0,
        lifetime_spent_paise: 0
      }, { onConflict: 'user_id' });
    } catch (wErr) {
      console.warn('Wallet upsert skipped:', wErr);
    }

    // 2. Fetch taxonomy to map names to IDs
    const { data: taxonomy } = await supabaseAdmin
      .from('skill_taxonomy')
      .select('id, name, category, min_hourly_rate');
    const nameToSkillMap = new Map(((taxonomy || []) as TaxonomyRow[]).map((item) => [item.name.toLowerCase().trim(), item]));

    // 3. Clear existing skills
    await supabaseAdmin.from('user_skills_teach').delete().eq('user_id', user.id);
    await supabaseAdmin.from('user_skills_learn').delete().eq('user_id', user.id);

    // 4. Insert Teach Skills
    if (teachNames.length > 0 && profile.noTeach !== true) {
      for (const skillName of teachNames) {
        const cleanName = skillName.trim();
        let skill = nameToSkillMap.get(cleanName.toLowerCase());
        
        if (!skill) {
          const { data: newSkill } = await supabaseAdmin
            .from('skill_taxonomy')
            .insert({ name: cleanName, category: 'Other', min_hourly_rate: 20, max_hourly_rate: 1000 })
            .select('id, name, category, min_hourly_rate')
            .single();
            
          if (newSkill) {
            skill = newSkill;
            nameToSkillMap.set(cleanName.toLowerCase(), skill);
          }
        }

        if (skill) {
          const { error: teachInsertError } = await supabaseAdmin.from('user_skills_teach').insert({
            user_id: user.id,
            skill_id: skill.id,
            level: teachLevel,
            hourly_rate: hourlyRate ?? skill.min_hourly_rate,
            ...(experienceYears !== null ? { years_experience: experienceYears } : {}),
            ...(allowedDurations && allowedDurations.length > 0 ? { allowed_durations: allowedDurations } : {}),
          });
          if (teachInsertError) throw teachInsertError;
        }
      }
    }

    // 5. Insert Learn Skills
    if (learnNames.length > 0) {
      for (const skillName of learnNames) {
        const cleanName = skillName.trim();
        let skill = nameToSkillMap.get(cleanName.toLowerCase());
        
        if (!skill) {
          const { data: newSkill } = await supabaseAdmin
            .from('skill_taxonomy')
            .insert({ name: cleanName, category: 'Other', min_hourly_rate: 20, max_hourly_rate: 1000 })
            .select('id, name, category, min_hourly_rate')
            .single();
            
          if (newSkill) {
            skill = newSkill;
            nameToSkillMap.set(cleanName.toLowerCase(), skill);
          }
        }

        if (skill) {
          const { error: learnInsertError } = await supabaseAdmin.from('user_skills_learn').insert({
            user_id: user.id,
            skill_id: skill.id,
            target_level: learnLevel,
            goal: 'Looking to learn ' + skill.name
          });
          if (learnInsertError) throw learnInsertError;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown sync error';
    console.error('Sync error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
