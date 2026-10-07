require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTables() {
  const t1 = await supabase.from('wallets').select('*').limit(1);
  console.log('wallets:', t1.error ? t1.error.message : 'exists');
  
  const t2 = await supabase.from('skills').select('*').limit(1);
  console.log('skills:', t2.error ? t2.error.message : 'exists');
  
  const t3 = await supabase.from('user_skills').select('*').limit(1);
  console.log('user_skills:', t3.error ? t3.error.message : 'exists');
}

checkTables();
