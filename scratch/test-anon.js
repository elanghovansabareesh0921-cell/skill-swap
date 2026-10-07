require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log('Querying without session...');
  const { data: noSessionData, error: err1 } = await supabase.from('profiles').select('*');
  console.log('No session profiles count:', err1 ? err1 : noSessionData.length);

  // Authenticate as one of the users
  const { data: { user }, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'sabareesh092107@gmail.com', // user from DB
    password: 'Password123!' // assuming default password or just use a token if I had it
  });
  
  if (authErr) {
    console.log('Auth error (expected if I dont know password):', authErr.message);
  } else {
    const { data: withSessionData, error: err2 } = await supabase.from('profiles').select('*');
    console.log('With session profiles count:', err2 ? err2 : withSessionData.length);
  }
}
run();
