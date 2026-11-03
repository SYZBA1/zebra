// Run locally only: npx tsx scripts/create-admin.ts <email> <password>
// NEVER expose this as an HTTP endpoint.
// This script creates or promotes a user to admin in Zebra BP.

import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const email    = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Usage: npx tsx scripts/create-admin.ts <email> <password>");
  process.exit(1);
}

if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const SUPABASE_URL              = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log(`Creating/updating admin user: ${email}`);

  // Check if user already exists
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error("Failed to list users:", listErr.message);
    process.exit(1);
  }

  const existing = users.find((u) => u.email === email);
  let userId: string;

  if (existing) {
    console.log("User already exists — updating password and confirming email...");
    const { error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
    });
    if (updateErr) {
      console.error("Failed to update user:", updateErr.message);
      process.exit(1);
    }
    userId = existing.id;
    console.log("Password updated.");
  } else {
    console.log("Creating new user...");
    const { data, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: "Admin" },
    });
    if (createErr || !data.user) {
      console.error("Failed to create user:", createErr?.message ?? "Unknown error");
      process.exit(1);
    }
    userId = data.user.id;
    console.log("User created.");
  }

  // Assign admin role
  const { error: roleErr } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

  if (roleErr) {
    console.error("Failed to assign admin role:", roleErr.message);
    process.exit(1);
  }

  console.log(`\n✅ Admin user ready: ${email}`);
  console.log("You can now log in at /admin/login");
  // Credentials are intentionally NOT printed here for security
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
