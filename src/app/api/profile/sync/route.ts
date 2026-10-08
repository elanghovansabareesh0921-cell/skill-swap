import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

export async function POST(req: NextRequest) {
  try {
    const { userId, email, profile } = await req.json();

    if (!userId || !email || !profile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Upsert Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: email,
        full_name: profile.name || email.split('@')[0],
        bio: profile.bio || profile.headline || 'SkillSwap Member',
        is_onboarded: true
      });

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    // Wallets table doesn't exist, skipping wallet initialization

    // 2. Fetch all skills from taxonomy to map names to IDs
    const { data: taxonomy, error: taxonomyError } = await supabaseAdmin.from('skill_taxonomy').select('*');
    if (taxonomyError || !taxonomy) {
      console.error('Taxonomy fetch error:', taxonomyError);
      return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
    }

    const nameToSkillMap = new Map(taxonomy.map(t => [t.name.toLowerCase().trim(), t]));

    // 3. Clear existing skills
    await supabaseAdmin.from('user_skills_teach').delete().eq('user_id', userId);
    await supabaseAdmin.from('user_skills_learn').delete().eq('user_id', userId);

    // 4. Insert Teach Skills
    if (profile.teach && profile.teach.length > 0 && !profile.noTeach) {
      const teachInserts = [];
      for (const skillName of profile.teach) {
        const cleanName = skillName.trim();
        let skill = nameToSkillMap.get(cleanName.toLowerCase());
        
        // If skill doesn't exist, create it dynamically
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
          teachInserts.push({
            user_id: userId,
            skill_id: skill.id,
            level: 'advanced',
            hourly_rate: 50,
            years_experience: 2
          });
        }
      }
      
      if (teachInserts.length > 0) {
        await supabaseAdmin.from('user_skills_teach').insert(teachInserts);
      }
    }

    // 5. Insert Learn Skills
    if (profile.learn && profile.learn.length > 0) {
      const learnInserts = [];
      for (const skillName of profile.learn) {
        const cleanName = skillName.trim();
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
          learnInserts.push({
            user_id: userId,
            skill_id: skill.id,
            target_level: 'beginner',
            goal: 'Looking to learn ' + skill.name
          });
        }
      }
      
      if (learnInserts.length > 0) {
        await supabaseAdmin.from('user_skills_learn').insert(learnInserts);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
