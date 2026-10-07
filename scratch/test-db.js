require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  console.log('--- PROFILES ---');
  const { data: profiles, error: err1 } = await supabaseAdmin.from('profiles').select('*');
  console.log(err1 ? err1 : profiles.length + ' profiles found.');
  if (profiles) console.dir(profiles.map(p => ({ id: p.id, email: p.email })), { depth: null });

  console.log('\n--- SKILL TAXONOMY ---');
  const { data: tax, error: errTax } = await supabaseAdmin.from('skill_taxonomy').select('*');
  console.log(errTax ? errTax : tax.length + ' taxonomy items.');
  if (tax) console.dir(tax, { depth: null });

  console.log('\n--- TEACH SKILLS ---');
  const { data: teach, error: err2 } = await supabaseAdmin.from('user_skills_teach').select('*');
  console.log(err2 ? err2 : teach.length + ' teach skills found.');
  if (teach) console.dir(teach, { depth: null });

  console.log('\n--- LEARN SKILLS ---');
  const { data: learn, error: err3 } = await supabaseAdmin.from('user_skills_learn').select('*');
  console.log(err3 ? err3 : learn.length + ' learn skills found.');
  if (learn) console.dir(learn, { depth: null });
}
run();
