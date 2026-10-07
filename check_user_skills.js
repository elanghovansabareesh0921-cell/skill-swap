require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUserSkills() {
  const { data, error } = await supabase.from('user_skills').insert({
    user_id: '00000000-0000-0000-0000-000000000000',
    skill_id: 1, // assuming int
    skill_type: 'TEACH',
    level: 'Advanced',
    goal: ''
  }).select();
  console.log('user_skills insert error:', error ? error.message : 'success');
}

checkUserSkills();
