require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function describeProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }
  
  if (data && data.length > 0) {
      console.log('Columns in profiles:');
      console.log(Object.keys(data[0]).join('\n'));
  } else {
      console.log('Table exists but is empty. Cannot determine columns via REST easily.');
      // Insert a dummy row to get columns back
      const { data: insertData, error: insertError } = await supabase
        .from('profiles')
        .insert({ id: '00000000-0000-0000-0000-000000000000' })
        .select();
      if (insertError) {
          console.error('Insert error (might show columns):', insertError);
      } else if (insertData) {
          console.log(Object.keys(insertData[0]).join('\n'));
      }
  }
}

describeProfiles();
