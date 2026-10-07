require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  const { data: q1, error: err1 } = await supabaseAdmin
    .from('profiles')
    .select('*, user_skills(*, skills(*))')
    .limit(2);
  console.log(err1 ? err1 : JSON.stringify(q1, null, 2));
}
run();
