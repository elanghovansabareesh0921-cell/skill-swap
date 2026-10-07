import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || '';
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[match[1]] = val;
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'] || env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("Fetching profiles...");
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  if (pErr) console.error("Profiles error:", pErr);
  else console.log("PROFILES:", JSON.stringify(profiles, null, 2));

  console.log("\nFetching user_skills_teach...");
  const { data: teach, error: tErr } = await supabase.from('user_skills_teach').select('*, skill_taxonomy(*)');
  if (tErr) console.error("Teach error:", tErr);
  else console.log("TEACH SKILLS:", JSON.stringify(teach, null, 2));

  console.log("\nFetching user_skills_learn...");
  const { data: learn, error: lErr } = await supabase.from('user_skills_learn').select('*, skill_taxonomy(*)');
  if (lErr) console.error("Learn error:", lErr);
  else console.log("LEARN SKILLS:", JSON.stringify(learn, null, 2));
}

check();
