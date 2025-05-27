#!/usr/bin/env node

/**
 * Test script to generate sample notifications for testing the dropdown functionality
 * Run with: node scripts/test-notifications-dropdown.js
 */

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample notifications for testing the dropdown
const sampleNotifications = [
  {
    type: "invoice_created",
    title: "Invoice Created",
    message: "Invoice #INV-2024-001 has been created successfully",
    category: "invoice_management",
    priority: "medium",
    status: "unread",
    context_data: {
      invoiceNumber: "INV-2024-001",
      customerName: "Acme Corporation",
      amount: "$1,250.00",
    },
    quick_actions: ["view_invoice", "send_invoice", "dismiss"],
    related_entity_type: "invoice",
    related_entity_id: null,
  },
  {
    type: "invoice_paid",
    title: "Payment Received",
    message: "Payment of {amount} received for invoice #{invoiceNumber}",
    category: "payment_financial",
    priority: "high",
    status: "unread",
    context_data: {
      invoiceNumber: "INV-2024-002",
      customerName: "Tech Solutions Ltd",
      amount: "$2,500.00",
    },
    quick_actions: ["view_invoice", "send_receipt", "dismiss"],
    related_entity_type: "invoice",
    related_entity_id: null,
  },
  {
    type: "invoice_overdue",
    title: "Invoice Overdue",
    message: "Invoice #{invoiceNumber} is now {daysOverdue} days overdue",
    category: "invoice_management",
    priority: "high",
    status: "unread",
    context_data: {
      invoiceNumber: "INV-2024-003",
      customerName: "Design Studio Pro",
      daysOverdue: 5,
      amount: "$850.00",
    },
    quick_actions: [
      "view_invoice",
      "send_reminder",
      "contact_customer",
      "dismiss",
    ],
    related_entity_type: "invoice",
    related_entity_id: null,
  },
  {
    type: "customer_added",
    title: "New Customer Added",
    message: "Customer {customerName} has been added to your database",
    category: "system_account",
    priority: "low",
    status: "unread",
    context_data: {
      customerName: "Global Marketing Inc",
      customerEmail: "contact@globalmarketing.com",
    },
    quick_actions: ["view_customer", "create_invoice", "dismiss"],
    related_entity_type: "customer",
    related_entity_id: null,
  },
  {
    type: "monthly_revenue_summary",
    title: "Monthly Revenue Summary",
    message: "Your revenue summary for {month} is ready",
    category: "business_intelligence",
    priority: "medium",
    status: "unread",
    context_data: {
      month: "December 2024",
      totalRevenue: "$15,750.00",
      invoiceCount: 12,
    },
    quick_actions: ["view_report", "export_data", "dismiss"],
    related_entity_type: "report",
    related_entity_id: null,
  },
  {
    type: "integration_connected",
    title: "Integration Connected",
    message: "{serviceName} has been successfully connected",
    category: "integration_automation",
    priority: "low",
    status: "unread",
    context_data: {
      serviceName: "Stripe Payment Gateway",
      connectionDate: new Date().toISOString(),
    },
    quick_actions: ["view_integration", "test_connection", "dismiss"],
    related_entity_type: "integration",
    related_entity_id: null,
  },
];

async function generateTestNotifications() {
  try {
    console.log("🔔 Generating test notifications for dropdown testing...");

    // Get the first user (for testing purposes)
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return;
    }

    if (!users.users || users.users.length === 0) {
      console.log("No users found. Please create a user account first.");
      return;
    }

    const testUser = users.users[0];
    console.log(`📧 Using test user: ${testUser.email}`);

    // Clear existing notifications for clean testing
    const { error: deleteError } = await supabase
      .from("notifications")
      .delete()
      .eq("user_id", testUser.id);

    if (deleteError) {
      console.error("Error clearing existing notifications:", deleteError);
      return;
    }

    // Insert sample notifications
    const notificationsToInsert = sampleNotifications.map((notification) => ({
      ...notification,
      user_id: testUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("notifications")
      .insert(notificationsToInsert)
      .select();

    if (error) {
      console.error("Error inserting notifications:", error);
      return;
    }

    console.log(`✅ Successfully created ${data.length} test notifications!`);
    console.log("\n📋 Created notifications:");
    data.forEach((notification, index) => {
      console.log(
        `  ${index + 1}. ${notification.title} (${
          notification.priority
        } priority)`
      );
    });

    console.log("\n🎯 Test the dropdown by:");
    console.log("  1. Logging in to the application");
    console.log("  2. Clicking the bell icon in the header");
    console.log("  3. Verifying the dropdown shows the notifications");
    console.log('  4. Testing quick actions and "View All Notifications" link');
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

// Run the script
generateTestNotifications();
