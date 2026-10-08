/**
 * Seed Script: Skill Swap Test Data
 *
 * Populates the `sessions` (swap) table and related tables with mock data
 * for testing the admin dashboard across all swap states.
 *
 * Usage:
 *   node seed-swaps.js
 *
 * Requires:
 *   - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables
 *   - `dotenv` package (already in devDependencies)
 *
 * NOTE: This uses the service role key (not the anon key) to bypass RLS.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    '❌ Missing environment variables: SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * Mock users for seeding. In a real scenario, these would reference
 * existing auth.users entries. Here we create profiles directly.
 */
const seedProfiles = [
  {
    email: 'asha.sharma@example.com',
    full_name: 'Asha Sharma',
    bio: 'Full-stack designer with 5 years in Figma & prototyping.',
    city: 'Mumbai',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    is_onboarded: true,
  },
  {
    email: 'ravi.kumar@example.com',
    full_name: 'Ravi Kumar',
    bio: 'Python developer, data science enthusiast.',
    city: 'Bengaluru',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    is_onboarded: true,
  },
  {
    email: 'priya.patel@example.com',
    full_name: 'Priya Patel',
    bio: 'Finance expert & Excel power user.',
    city: 'Delhi',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    is_onboarded: true,
  },
  {
    email: 'arjun.mehta@example.com',
    full_name: 'Arjun Mehta',
    bio: 'Systems programmer, Rust advocate.',
    city: 'Pune',
    country: 'IN',
    timezone: 'Asia/Kolkata',
    is_onboarded: true,
  },
];

/**
 * Mock swap/session records covering all 5 statuses.
 * References skill_taxonomy entries seeded in schema.sql.
 */
const seedSessions = [
  {
    leg_index: 1,
    duration_minutes: 60,
    list_price_tokens: 50,
    charged_tokens: 50,
    platform_fee_tokens: 5,
    teacher_payout_tokens: 45,
    status: 'SCHEDULED',      // ≈ Pending
    teacher_confirmed: false,
    learner_confirmed: false,
  },
  {
    leg_index: 1,
    duration_minutes: 45,
    list_price_tokens: 40,
    charged_tokens: 40,
    platform_fee_tokens: 4,
    teacher_payout_tokens: 36,
    scheduled_start: new Date(Date.now() + 3 * 86400000).toISOString(),
    scheduled_end: new Date(Date.now() + 3 * 86400000 + 2700000).toISOString(),
    status: 'PENDING_CONFIRMATION', // ≈ Accepted
    teacher_confirmed: true,
    learner_confirmed: false,
  },
  {
    leg_index: 1,
    duration_minutes: 60,
    list_price_tokens: 80,
    charged_tokens: 80,
    platform_fee_tokens: 8,
    teacher_payout_tokens: 72,
    scheduled_start: new Date(Date.now() - 7 * 86400000).toISOString(),
    scheduled_end: new Date(Date.now() - 7 * 86400000 + 3600000).toISOString(),
    status: 'SETTLED',        // ≈ Completed
    teacher_confirmed: true,
    learner_confirmed: true,
  },
  {
    leg_index: 1,
    duration_minutes: 30,
    list_price_tokens: 25,
    charged_tokens: 25,
    platform_fee_tokens: 2.5,
    teacher_payout_tokens: 22.5,
    status: 'CANCELLED',
    teacher_confirmed: false,
    learner_confirmed: false,
  },
  {
    leg_index: 1,
    duration_minutes: 60,
    list_price_tokens: 60,
    charged_tokens: 60,
    platform_fee_tokens: 6,
    teacher_payout_tokens: 54,
    scheduled_start: new Date(Date.now() - 5 * 86400000).toISOString(),
    scheduled_end: new Date(Date.now() - 5 * 86400000 + 3600000).toISOString(),
    status: 'DISPUTED',
    teacher_confirmed: true,
    learner_confirmed: false,
    dispute_reason: 'Provider was absent after 15 minutes into the session.',
  },
];

async function seed() {
  console.log('🌱 Starting swap seed...\n');

  // 1. Verify skill taxonomy exists
  const { data: skills, error: skillsError } = await supabase
    .from('skill_taxonomy')
    .select('id, name')
    .limit(5);

  if (skillsError || !skills?.length) {
    console.error('❌ No skills found in skill_taxonomy. Run schema.sql first.');
    process.exit(1);
  }

  console.log(`✅ Found ${skills.length} skills in taxonomy`);

  // 2. Check for existing profiles (don't create auth users, just verify)
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('email', seedProfiles.map(p => p.email));

  if (profilesError) {
    console.error('❌ Error checking profiles:', profilesError.message);
    console.log('\n⚠️  Profiles table may not exist or RLS prevents access.');
    console.log('   This seed script requires profiles to already exist in the DB.');
    console.log('   The admin dashboard works with in-memory mock data by default.\n');
    process.exit(0);
  }

  if (!profiles?.length) {
    console.log('⚠️  No matching profiles found. The admin dashboard uses in-memory mock data.');
    console.log('   To seed real DB data, create user accounts first via the signup flow.\n');
    process.exit(0);
  }

  console.log(`✅ Found ${profiles.length} matching profiles\n`);

  // 3. Create offers and sessions for existing profiles
  let created = 0;
  for (let i = 0; i < Math.min(seedSessions.length, profiles.length - 1); i++) {
    const teacher = profiles[i];
    const learner = profiles[(i + 1) % profiles.length];
    const skill = skills[i % skills.length];
    const session = seedSessions[i];

    // Create an offer first
    const { data: offer, error: offerError } = await supabase
      .from('offers')
      .insert({
        type: 'DIRECT',
        proposer_id: learner.id,
        recipient_id: teacher.id,
        status: session.status === 'SCHEDULED' ? 'PENDING' : 'ACCEPTED',
        quote_snapshot: {
          type: 'DIRECT',
          chargedTokens: session.charged_tokens,
          platformFee: session.platform_fee_tokens,
        },
        expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      })
      .select('id')
      .single();

    if (offerError) {
      console.warn(`  ⚠️  Failed to create offer ${i + 1}:`, offerError.message);
      continue;
    }

    // Create the session
    const { error: sessionError } = await supabase.from('sessions').insert({
      offer_id: offer.id,
      teacher_id: teacher.id,
      learner_id: learner.id,
      skill_id: skill.id,
      ...session,
    });

    if (sessionError) {
      console.warn(`  ⚠️  Failed to create session ${i + 1}:`, sessionError.message);
    } else {
      console.log(`  ✅ Created ${session.status} session: ${teacher.full_name} → ${learner.full_name} (${skill.name})`);
      created++;
    }
  }

  console.log(`\n🎉 Seed complete! Created ${created} swap sessions.`);
  console.log('   Visit /admin/swaps to view the dashboard.\n');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
