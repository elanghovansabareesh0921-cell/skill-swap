import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { userId, email, profile } = await req.json();

    if (!userId || !email || !profile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (user && user.id !== userId) {
      return NextResponse.json({ error: 'Cannot update another user profile' }, { status: 403 });
    }
    if (!user && process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    if (!supabaseAdmin) {
      return NextResponse.json({ success: true, message: 'Supabase credentials not configured' });
    }

    // 1. Upsert Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        full_name: profile.name || email.split('@')[0],
        avatar_url: profile.avatar || '/avatars/avatar_2.jpg',
        bio: profile.bio || profile.headline || 'SkillSwap Member',
        languages: profile.languages && profile.languages.length > 0 ? profile.languages : ['English'],
        city: profile.city || 'Global',
        country: profile.country || 'IN',
        timezone: profile.timezone || 'Asia/Kolkata',
        is_onboarded: true,
        is_accepting_requests: profile.isAcceptingRequests !== false
      });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    // Initialize wallet if not exists
    try {
      await supabaseAdmin.from('wallets').upsert({
        user_id: userId,
        available_paise: 50000, // 500 SP welcome credits
        held_paise: 0,
        lifetime_earned_paise: 0,
        lifetime_spent_paise: 0
      }, { onConflict: 'user_id' });
    } catch (wErr) {
      console.warn('Wallet upsert skipped:', wErr);
    }

    // 2. Fetch taxonomy to map names to IDs
    const { data: taxonomy } = await supabaseAdmin.from('skill_taxonomy').select('*');
    const nameToSkillMap = new Map((taxonomy || []).map((t) => [t.name.toLowerCase().trim(), t]));

    // 3. Clear existing skills
    await supabaseAdmin.from('user_skills_teach').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_skills_learn').delete().eq('user_id', userId);

    // 4. Insert Teach Skills
    if (profile.teach && profile.teach.length > 0 && !profile.noTeach) {
      for (const skillName of profile.teach) {
        const cleanName = (skillName as string).trim();
        let skill = nameToSkillMap.get(cleanName.toLowerCase());
        
        if (!skill) {
          const { data: newSkill } = await supabaseAdmin
            .from('skill_taxonomy')
            .insert({ name: cleanName, category: 'Other', min_hourly_rate: 20, max_hourly_rate: 1000 })
            .select()
            .single();
            
          if (newSkill) {
            skill = newSkill;
            nameToSkillMap.set(cleanName.toLowerCase(), skill);
          }
        }

        if (skill) {
          await supabaseAdmin.from('user_skills_teach').insert({
            user_id: userId,
            skill_id: skill.id,
            level: 'advanced',
            hourly_rate: 50,
            years_experience: 2
          });
        }
      }
    }

    // 5. Insert Learn Skills
    if (profile.learn && profile.learn.length > 0) {
      for (const skillName of profile.learn) {
        const cleanName = (skillName as string).trim();
        let skill = nameToSkillMap.get(cleanName.toLowerCase());
        
        if (!skill) {
          const { data: newSkill } = await supabaseAdmin
            .from('skill_taxonomy')
            .insert({ name: cleanName, category: 'Other', min_hourly_rate: 20, max_hourly_rate: 1000 })
            .select()
            .single();
            
          if (newSkill) {
            skill = newSkill;
            nameToSkillMap.set(cleanName.toLowerCase(), skill);
          }
        }

        if (skill) {
          await supabaseAdmin.from('user_skills_learn').insert({
            user_id: userId,
            skill_id: skill.id,
            target_level: 'beginner',
            goal: 'Looking to learn ' + skill.name
          });
        }
      }
    }

    // 6. Also sync to unified public.skills and public.user_skills if present in DB
    try {
      await supabaseAdmin.from('user_skills').delete().eq('user_id', userId);
      const { data: legacySkills } = await supabaseAdmin.from('skills').select('id, name');
      const legacySkillMap = new Map((legacySkills || []).map((s) => [s.name.toLowerCase().trim(), s.id]));

      if (profile.teach && profile.teach.length > 0 && !profile.noTeach) {
        for (const skillName of profile.teach) {
          const cleanName = (skillName as string).trim();
          let skillId = legacySkillMap.get(cleanName.toLowerCase());
          if (!skillId) {
            const { data: newSk } = await supabaseAdmin
              .from('skills')
              .insert({ name: cleanName, category: 'Other' })
              .select('id')
              .single();
            if (newSk) {
              skillId = newSk.id;
              legacySkillMap.set(cleanName.toLowerCase(), skillId);
            }
          }
          if (skillId) {
            await supabaseAdmin.from('user_skills').insert({
              user_id: userId,
              skill_id: skillId,
              skill_type: 'TEACH',
              level: 'advanced',
            });
          }
        }
      }

      if (profile.learn && profile.learn.length > 0) {
        for (const skillName of profile.learn) {
          const cleanName = (skillName as string).trim();
          let skillId = legacySkillMap.get(cleanName.toLowerCase());
          if (!skillId) {
            const { data: newSk } = await supabaseAdmin
              .from('skills')
              .insert({ name: cleanName, category: 'Other' })
              .select('id')
              .single();
            if (newSk) {
              skillId = newSk.id;
              legacySkillMap.set(cleanName.toLowerCase(), skillId);
            }
          }
          if (skillId) {
            await supabaseAdmin.from('user_skills').insert({
              user_id: userId,
              skill_id: skillId,
              skill_type: 'LEARN',
              level: 'beginner',
              goal: 'Looking to learn ' + cleanName,
            });
          }
        }
      }
    } catch {
      // Ignore if user_skills table is not present
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown sync error';
    console.error('Sync error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
