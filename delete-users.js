const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function deleteAllUsers() {
  console.log("Fetching all users from Supabase Auth...");
  
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log("No users found. Database is already clean.");
    return;
  }
  
  console.log(`Found ${users.length} users. Deleting them...`);
  
  let deletedCount = 0;
  for (const user of users) {
    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
    if (deleteError) {
      console.error(`Failed to delete user ${user.id} (${user.email}):`, deleteError.message);
    } else {
      console.log(`Deleted user: ${user.email} (ID: ${user.id})`);
      deletedCount++;
    }
  }
  
  console.log(`\nSuccessfully deleted ${deletedCount} out of ${users.length} users.`);
}

deleteAllUsers();
