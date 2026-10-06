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
        avatar_url: profile.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
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
    await supabaseAdmin.from('wallets').upsert({
      user_id: userId,
      available_paise: 50000, // Give new users 500 SP as signup bonus
      held_paise: 0,
      lifetime_earned_paise: 0,
      lifetime_spent_paise: 0
    }, { onConflict: 'user_id' }).select();

    // 2. Fetch all skills from taxonomy to map names to IDs
    const { data: taxonomy, error: taxonomyError } = await supabaseAdmin.from('skills').select('*');
    if (taxonomyError || !taxonomy) {
      console.error('Taxonomy fetch error:', taxonomyError);
      return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
    }

    const nameToSkillMap = new Map(taxonomy.map(t => [t.name.toLowerCase().trim(), t]));

    // 3. Clear existing skills
    await supabaseAdmin.from('user_skills').delete().eq('user_id', userId);

    // 4. Insert Teach Skills
    if (profile.teach && profile.teach.length > 0 && !profile.noTeach) {
      const teachInserts = [];
      for (const skillName of profile.teach) {
        const cleanName = skillName.trim();
        let skill = nameToSkillMap.get(cleanName.toLowerCase());
        
        // If skill doesn't exist, create it dynamically
        if (!skill) {
          const { data: newSkill, error: insertError } = await supabaseAdmin
            .from('skills')
            .insert({ name: cleanName, category: 'Other' })
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
            skill_type: 'TEACH',
            level: 'Advanced',
            goal: ''
          });
        }
      }
      
      if (teachInserts.length > 0) {
        await supabaseAdmin.from('user_skills').insert(teachInserts);
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
            .from('skills')
            .insert({ name: cleanName, category: 'Other' })
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
            skill_type: 'LEARN',
            level: 'Beginner',
            goal: 'Looking to learn ' + skill.name
          });
        }
      }
      
      if (learnInserts.length > 0) {
        await supabaseAdmin.from('user_skills').insert(learnInserts);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
