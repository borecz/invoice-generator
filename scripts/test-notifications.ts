#!/usr/bin/env tsx

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testNotificationSystem() {
  console.log("🔍 Testing Notification System...\n");

  // Test 1: Check if tables exist
  console.log("1. Checking database tables...");
  try {
    // Check each table individually
    const tableChecks = await Promise.all([
      supabase.from("notifications").select("id").limit(1),
      supabase.from("notification_types").select("type").limit(1),
      supabase.from("notification_preferences").select("id").limit(1),
    ]);

    const tableNames = [];
    if (!tableChecks[0].error) tableNames.push("notifications");
    if (!tableChecks[1].error) tableNames.push("notification_types");
    if (!tableChecks[2].error) tableNames.push("notification_preferences");

    console.log("✅ Found tables:", tableNames);

    if (!tableNames.includes("notifications")) {
      console.error("❌ notifications table not found");
      return;
    }
    if (!tableNames.includes("notification_types")) {
      console.error("❌ notification_types table not found");
      return;
    }
    if (!tableNames.includes("notification_preferences")) {
      console.error("❌ notification_preferences table not found");
      return;
    }
  } catch (error) {
    console.error("❌ Error checking tables:", error);
    return;
  }

  // Test 2: Check notification types
  console.log("\n2. Checking notification types...");
  try {
    const { data: types, error } = await supabase
      .from("notification_types")
      .select("type, category, default_priority")
      .order("category", { ascending: true });

    if (error) {
      console.error("❌ Error fetching notification types:", error);
      return;
    }

    console.log(`✅ Found ${types.length} notification types:`);

    const categoryCounts: Record<string, number> = {};
    types.forEach((type) => {
      categoryCounts[type.category] = (categoryCounts[type.category] || 0) + 1;
    });

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} types`);
    });
  } catch (error) {
    console.error("❌ Error checking notification types:", error);
    return;
  }

  // Test 3: Check users
  console.log("\n3. Checking available users...");
  try {
    const { data: users, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error("❌ Error fetching users:", error);
      return;
    }

    console.log(`✅ Found ${users.users.length} users:`);
    users.users.forEach((user) => {
      console.log(`   - ${user.email} (${user.id})`);
    });

    if (users.users.length === 0) {
      console.log("⚠️  No users found. Please create a user account first.");
      return;
    }

    // Test 4: Create a test notification
    console.log("\n4. Creating test notification...");
    const testUser = users.users[0];

    const testNotification = {
      user_id: testUser.id,
      type: "invoice_created",
      category: "invoice_management",
      title: "Test Invoice Created",
      message: "Invoice #TEST-001 has been created successfully",
      priority: "medium",
      context_data: {
        invoiceNumber: "TEST-001",
        customerName: "Test Customer",
        amount: "$1,234.56",
      },
      quick_actions: ["view_invoice", "send_invoice", "dismiss"],
    };

    const { data: notification, error: createError } = await supabase
      .from("notifications")
      .insert([testNotification])
      .select()
      .single();

    if (createError) {
      console.error("❌ Error creating test notification:", createError);
      return;
    }

    console.log("✅ Test notification created:", notification.id);

    // Test 5: Fetch notifications for user
    console.log("\n5. Fetching notifications for user...");
    const { data: notifications, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", testUser.id)
      .order("created_at", { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error("❌ Error fetching notifications:", fetchError);
      return;
    }

    console.log(
      `✅ Found ${notifications.length} notifications for ${testUser.email}:`
    );
    notifications.forEach((notif) => {
      console.log(
        `   - ${notif.title} (${notif.status}) - ${notif.priority} priority`
      );
    });

    // Test 6: Test notification actions
    console.log("\n6. Testing notification actions...");

    // Mark as read
    const { error: readError } = await supabase
      .from("notifications")
      .update({ status: "read", read_at: new Date().toISOString() })
      .eq("id", notification.id);

    if (readError) {
      console.error("❌ Error marking as read:", readError);
      return;
    }

    console.log("✅ Marked notification as read");

    // Clean up test notification
    const { error: deleteError } = await supabase
      .from("notifications")
      .delete()
      .eq("id", notification.id);

    if (deleteError) {
      console.error("❌ Error deleting test notification:", deleteError);
      return;
    }

    console.log("✅ Cleaned up test notification");
  } catch (error) {
    console.error("❌ Error in user tests:", error);
    return;
  }

  console.log(
    "\n🎉 All tests passed! Notification system is working correctly."
  );
  console.log("\n📝 Next steps:");
  console.log(
    "   1. Run the generation script: tsx scripts/generate-notifications.ts <user-email>"
  );
  console.log("   2. Visit /notifications in your app to see the UI");
  console.log("   3. Test the quick actions and filters");
}

// Main execution
async function main() {
  await testNotificationSystem();
}

if (require.main === module) {
  main().catch(console.error);
}
