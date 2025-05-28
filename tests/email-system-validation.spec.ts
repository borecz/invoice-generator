import { test, expect } from "@playwright/test";
import {
  startInbucketService,
  stopInbucketService,
  waitForInbucketReady,
  clearMailbox,
  getEmailsFromMailbox,
  waitForEmail,
  validateEmailContent,
  isEmailTestingEnabled,
  INBUCKET_CONFIG,
} from "./utils/email";
import {
  validateEmailTestingConfig,
  logEmailConfigStatus,
  checkSupabaseEmailConfig,
} from "./utils/supabase-email-config";

test.describe("Email Testing System Validation", () => {
  test.beforeAll(async () => {
    // Log configuration status
    logEmailConfigStatus();
    
    if (isEmailTestingEnabled()) {
      await startInbucketService();
    }
  });

  test.afterAll(async () => {
    if (isEmailTestingEnabled()) {
      await stopInbucketService();
    }
  });

  test("Email testing configuration validation", async () => {
    const validation = validateEmailTestingConfig();
    
    console.log("📧 Email Testing Configuration:");
    console.log(`   Enabled: ${isEmailTestingEnabled()}`);
    console.log(`   Valid: ${validation.isValid}`);
    
    if (validation.errors.length > 0) {
      console.log("   Errors:", validation.errors);
    }
    
    if (validation.warnings.length > 0) {
      console.log("   Warnings:", validation.warnings);
    }

    // Configuration should be valid for tests to work properly
    expect(validation.isValid).toBe(true);
  });

  test("Inbucket service connectivity", async () => {
    if (!isEmailTestingEnabled()) {
      test.skip("Email testing is disabled");
    }

    // Test Inbucket web interface
    try {
      const response = await fetch(`${INBUCKET_CONFIG.webUrl}/`);
      expect(response.ok).toBe(true);
      console.log("✅ Inbucket web interface is accessible");
    } catch (error) {
      throw new Error(`Inbucket web interface not accessible: ${error}`);
    }

    // Test Inbucket API
    try {
      const response = await fetch(`${INBUCKET_CONFIG.apiUrl}/monitor/messages`);
      expect(response.ok).toBe(true);
      console.log("✅ Inbucket API is accessible");
    } catch (error) {
      throw new Error(`Inbucket API not accessible: ${error}`);
    }
  });

  test("Email utilities functionality", async () => {
    if (!isEmailTestingEnabled()) {
      test.skip("Email testing is disabled");
    }

    const testEmail = `test_utilities_${Date.now()}@example.com`;

    // Test mailbox clearing
    await clearMailbox(testEmail, {
      testName: "Utilities Test",
      useSoftAssertions: false,
    });

    // Test getting emails from empty mailbox
    const initialEmails = await getEmailsFromMailbox(testEmail, {
      useSoftAssertions: false,
    });
    expect(initialEmails).toEqual([]);

    // Test waiting for email with timeout (should timeout)
    const noEmail = await waitForEmail(testEmail, {
      timeout: 2000,
      useSoftAssertions: true,
    });
    expect(noEmail).toBeNull();

    console.log("✅ Email utilities are working correctly");
  });

  test("Supabase email configuration check", async () => {
    const configCheck = await checkSupabaseEmailConfig();
    
    console.log("🔧 Supabase Email Configuration:");
    console.log(`   Configured: ${configCheck.isConfigured}`);
    console.log(`   Message: ${configCheck.message}`);

    if (isEmailTestingEnabled()) {
      // In test mode, Supabase should be configured to use Inbucket
      expect.soft(configCheck.isConfigured).toBe(true);
    }
  });

  test("Environment variables validation", async () => {
    const requiredEnvVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ];

    const emailTestingEnvVars = [
      "INBUCKET_WEB_URL",
      "INBUCKET_SMTP_HOST",
      "INBUCKET_SMTP_PORT",
      "INBUCKET_API_URL",
    ];

    // Check required environment variables
    for (const envVar of requiredEnvVars) {
      expect(process.env[envVar]).toBeDefined();
    }

    // Check email testing environment variables if email testing is enabled
    if (isEmailTestingEnabled()) {
      for (const envVar of emailTestingEnvVars) {
        expect(process.env[envVar] || INBUCKET_CONFIG[envVar.toLowerCase().replace('inbucket_', '').replace('_', '')]).toBeDefined();
      }
    }

    console.log("✅ Environment variables are properly configured");
  });

  test("Email testing conditional behavior", async () => {
    const testEmail = `conditional_${Date.now()}@example.com`;

    if (isEmailTestingEnabled()) {
      console.log("🔍 Email testing is enabled - testing email interception");
      
      // Test that email utilities work
      await clearMailbox(testEmail, { useSoftAssertions: true });
      const emails = await getEmailsFromMailbox(testEmail, { useSoftAssertions: true });
      expect(emails).toEqual([]);
      
      console.log("✅ Email interception is working");
    } else {
      console.log("⏭️ Email testing is disabled - testing graceful degradation");
      
      // Test that email utilities gracefully handle disabled state
      await clearMailbox(testEmail, { useSoftAssertions: true });
      const emails = await getEmailsFromMailbox(testEmail, { useSoftAssertions: true });
      expect(emails).toEqual([]);
      
      const noEmail = await waitForEmail(testEmail, {
        timeout: 1000,
        useSoftAssertions: true,
      });
      expect(noEmail).toBeNull();
      
      console.log("✅ Graceful degradation is working");
    }
  });

  test("Email content validation functionality", async () => {
    if (!isEmailTestingEnabled()) {
      test.skip("Email testing is disabled");
    }

    // Create a mock email object for testing validation
    const mockEmail = {
      id: "test-email-id",
      mailbox: "test",
      from: "sender@example.com",
      to: ["recipient@example.com"],
      subject: "Test Email Subject",
      date: new Date().toISOString(),
      size: 1024,
      body: {
        text: "This is a test email body with some content.",
        html: "<p>This is a <strong>test</strong> email body with some content.</p>",
      },
      attachments: [],
    };

    // Test email content validation
    await validateEmailContent(
      mockEmail,
      {
        subject: /test.*email/i,
        from: /sender@example\.com/,
        to: /recipient@example\.com/,
        bodyText: /test email body/i,
        bodyHtml: /<p>.*test.*<\/p>/i,
        hasAttachments: false,
        attachmentCount: 0,
      },
      {
        testName: "Mock Email Validation",
        useSoftAssertions: false,
      }
    );

    console.log("✅ Email content validation is working correctly");
  });

  test("Docker service management", async () => {
    if (!isEmailTestingEnabled()) {
      test.skip("Email testing is disabled");
    }

    // Test that Inbucket service is running
    try {
      await waitForInbucketReady(5000);
      console.log("✅ Inbucket service is ready");
    } catch (error) {
      throw new Error(`Inbucket service is not ready: ${error}`);
    }

    // Test service health
    const healthResponse = await fetch(`${INBUCKET_CONFIG.webUrl}/`);
    expect(healthResponse.ok).toBe(true);

    console.log("✅ Docker service management is working");
  });

  test("Integration with accessibility testing", async ({ page }) => {
    // Test that email testing works alongside accessibility testing
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Import accessibility utilities
    const { runAccessibilityCheck } = await import("./utils/accessibility");

    // Run accessibility check
    await runAccessibilityCheck(page, {
      testName: "Email Integration Test",
      useSoftAssertions: true,
    });

    // Test email functionality
    const testEmail = `integration_${Date.now()}@example.com`;
    
    if (isEmailTestingEnabled()) {
      await clearMailbox(testEmail, { useSoftAssertions: true });
      console.log("✅ Email testing works alongside accessibility testing");
    }

    // Verify page functionality
    await expect(page.locator("body")).toBeVisible();
    console.log("✅ Integration with accessibility testing is working");
  });

  test("Performance and timeout handling", async () => {
    if (!isEmailTestingEnabled()) {
      test.skip("Email testing is disabled");
    }

    const testEmail = `performance_${Date.now()}@example.com`;
    const startTime = Date.now();

    // Test that timeout handling works efficiently
    const result = await waitForEmail(testEmail, {
      timeout: 3000,
      useSoftAssertions: true,
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(result).toBeNull();
    expect(duration).toBeGreaterThanOrEqual(2900); // Should wait close to full timeout
    expect(duration).toBeLessThan(5000); // Should not exceed timeout significantly

    console.log(`✅ Timeout handling is efficient (${duration}ms for 3000ms timeout)`);
  });
});
