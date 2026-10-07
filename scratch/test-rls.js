require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function run() {
  const { data, error } = await supabaseAdmin.rpc('get_policies');
  if (error) {
    // try direct query if RPC doesn't exist
    const { data: q2, error: err2 } = await supabaseAdmin.from('pg_policies').select('*').in('tablename', ['profiles', 'skills', 'user_skills']).limit(50);
    console.log(err2 ? err2 : q2);
  } else {
    console.log(data);
  }
}
run();
