require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  const { data: skills, error: err1 } = await supabaseAdmin.from('skills').select('*').limit(2);
  console.log(err1 ? err1 : 'skills: ', skills);

  const { data: user_skills, error: err2 } = await supabaseAdmin.from('user_skills').select('*').limit(2);
  console.log(err2 ? err2 : 'user_skills: ', user_skills);
}
run();
