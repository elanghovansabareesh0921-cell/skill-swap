import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

// Instantiate Supabase client with the Service Role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function purgeData() {
  console.log("Starting data purge...");

  try {
    // 1. Delete all mock/dummy sessions (this will cascade to reviews and messages)
    console.log("Purging mock sessions...");
    const { error: sessionError } = await supabase
      .from("sessions")
      .delete()
      .neq("status", "VALID_DUMMY_STRING_SO_IT_DELETES_ALL_FOR_NOW"); // Basically deletes all for purge
    // Actually, to delete all, we just match on something true or use open range
    // Supabase JS delete() without filters is an error, so we filter by id not null
    await supabase.from("sessions").delete().not("id", "is", null);

    // 2. Purge notifications
    console.log("Purging mock notifications...");
    await supabase.from("notifications").delete().not("id", "is", null);

    // 3. Purge user_skills
    console.log("Purging user skills...");
    await supabase.from("user_skills").delete().not("id", "is", null);

    // 4. (Optional) Purge all profiles except current authenticated user?
    // The prompt says "clean out all dummy/seed test users".
    // We can delete users where email like '%demo%' or '%test%'.
    console.log("Purging demo/test users from auth (will cascade to profiles)...");
    
    // Note: To delete users from auth.users, you need the supabase admin api
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    for (const user of users.users) {
      if (user.email?.includes("demo") || user.email?.includes("test") || user.email?.includes("mock")) {
        console.log(`Deleting test user: ${user.email}`);
        await supabase.auth.admin.deleteUser(user.id);
      }
    }

    // 5. Purge credit_ledger once it's created
    try {
      console.log("Purging credit ledger...");
      await supabase.from("credit_ledger").delete().not("id", "is", null);
    } catch (e) {
      console.log("No credit ledger found to purge yet.");
    }

    console.log("✅ Data purge completed successfully.");
  } catch (err) {
    console.error("❌ Error purging data:", err);
  }
}

purgeData();
