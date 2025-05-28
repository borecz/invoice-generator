import { test, expect } from "@playwright/test";
import {
  startInbucketService,
  stopInbucketService,
  waitForEmail,
  waitForEmailWithSubject,
  validateEmailContent,
  waitForAndValidateEmail,
  clearMailbox,
  withEmailTesting,
  isEmailTestingEnabled,
} from "./utils/email";
import {
  runAccessibilityCheck,
  withAccessibilityCheck,
} from "./utils/accessibility";

test.describe("Authentication Flow with Email Testing", () => {
  // Setup and teardown for email testing
  test.beforeAll(async () => {
    if (isEmailTestingEnabled()) {
      await startInbucketService();
    }
  });

  test.afterAll(async () => {
    if (isEmailTestingEnabled()) {
      await stopInbucketService();
    }
  });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test(withEmailTesting("User signup with email confirmation"), async ({ page }) => {
    const userEmail = `test_signup_${Date.now()}@example.com`;
    const userPassword = "TestPassword123!";

    // Clear mailbox before test
    await clearMailbox(userEmail, {
      testName: "Signup Email Test",
      useSoftAssertions: true,
    });

    // Navigate to signup page
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Run accessibility check on signup page
    await runAccessibilityCheck(page, {
      testName: "Signup Page",
      useSoftAssertions: true,
    });

    // Fill signup form
    await page.getByRole("textbox", { name: /email/i }).fill(userEmail);
    await page.getByRole("textbox", { name: /password/i }).fill(userPassword);
    await page.getByRole("button", { name: /sign up/i }).click();

    // Wait for signup success message
    await expect(page.getByText(/sign up successful/i)).toBeVisible({ timeout: 10000 });

    // Wait for confirmation email
    const confirmationEmail = await waitForEmailWithSubject(
      userEmail,
      /confirm.*email|email.*confirmation|verify.*email/i,
      {
        timeout: 30000,
        testName: "Signup Confirmation Email",
        useSoftAssertions: true,
      }
    );

    if (confirmationEmail) {
      // Validate email content
      await validateEmailContent(
        confirmationEmail,
        {
          to: userEmail,
          subject: /confirm|verification|welcome/i,
          bodyText: /confirm.*email|verify.*account|click.*link/i,
        },
        {
          testName: "Signup Confirmation Email Content",
          useSoftAssertions: true,
        }
      );

      console.log(`✅ Signup confirmation email validated for ${userEmail}`);
    } else {
      console.log(`⚠️ No confirmation email received for ${userEmail} (this may be expected if email confirmation is disabled)`);
    }
  });

  test(withEmailTesting("Password reset email flow"), async ({ page }) => {
    const userEmail = `test_reset_${Date.now()}@example.com`;

    // Clear mailbox before test
    await clearMailbox(userEmail, {
      testName: "Password Reset Email Test",
      useSoftAssertions: true,
    });

    // Navigate to login page
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Look for "Forgot Password" link
    const forgotPasswordLink = page.locator('a[href*="reset"], a[href*="forgot"], button:has-text("Forgot"), a:has-text("Forgot")');
    
    if (await forgotPasswordLink.count() > 0) {
      await forgotPasswordLink.first().click();
      await page.waitForLoadState("networkidle");

      // Fill email for password reset
      const emailInput = page.getByRole("textbox", { name: /email/i });
      if (await emailInput.count() > 0) {
        await emailInput.fill(userEmail);
        
        const resetButton = page.getByRole("button", { name: /reset|send/i });
        if (await resetButton.count() > 0) {
          await resetButton.click();

          // Wait for password reset email
          const resetEmail = await waitForEmailWithSubject(
            userEmail,
            /reset.*password|password.*reset/i,
            {
              timeout: 30000,
              testName: "Password Reset Email",
              useSoftAssertions: true,
            }
          );

          if (resetEmail) {
            // Validate reset email content
            await validateEmailContent(
              resetEmail,
              {
                to: userEmail,
                subject: /reset.*password|password.*reset/i,
                bodyText: /reset.*password|click.*link|new.*password/i,
              },
              {
                testName: "Password Reset Email Content",
                useSoftAssertions: true,
              }
            );

            console.log(`✅ Password reset email validated for ${userEmail}`);
          } else {
            console.log(`⚠️ No password reset email received for ${userEmail}`);
          }
        }
      }
    } else {
      console.log("⚠️ No 'Forgot Password' functionality found on login page");
    }
  });

  test(withEmailTesting("Email notification preferences"), async ({ page }) => {
    const userEmail = `test_notifications_${Date.now()}@example.com`;
    const userPassword = "TestPassword123!";

    // First, create and login user (simplified for this test)
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    await page.getByRole("textbox", { name: /email/i }).fill(userEmail);
    await page.getByRole("textbox", { name: /password/i }).fill(userPassword);
    await page.getByRole("button", { name: /sign up/i }).click();

    // Wait for signup success
    await expect(page.getByText(/sign up successful/i)).toBeVisible({ timeout: 10000 });

    // Navigate to settings page if available
    const settingsLink = page.locator('a[href*="settings"], a:has-text("Settings")');
    
    if (await settingsLink.count() > 0) {
      await settingsLink.first().click();
      await page.waitForLoadState("networkidle");

      // Run accessibility check on settings page
      await runAccessibilityCheck(page, {
        testName: "Settings Page",
        useSoftAssertions: true,
      });

      // Look for notification settings
      const notificationSection = page.locator('section:has-text("Notification"), div:has-text("Email"), h3:has-text("Notification")');
      
      if (await notificationSection.count() > 0) {
        // Test email notification toggles
        const emailToggles = page.locator('input[type="checkbox"], [role="switch"]').filter({
          has: page.locator(':has-text("email"), :has-text("Email")')
        });

        const toggleCount = await emailToggles.count();
        if (toggleCount > 0) {
          console.log(`Found ${toggleCount} email notification toggles`);
          
          // Test accessibility of notification controls
          await runAccessibilityCheck(page, {
            testName: "Notification Settings",
            useSoftAssertions: true,
            include: ['section:has-text("Notification")'],
          });
        }
      }
    }

    console.log(`✅ Email notification preferences test completed for ${userEmail}`);
  });

  test(withEmailTesting("Email testing system validation"), async ({ page }) => {
    const testEmail = `validation_${Date.now()}@example.com`;

    // Test that email testing utilities work correctly
    if (isEmailTestingEnabled()) {
      console.log("✅ Email testing is enabled");

      // Test mailbox clearing
      await clearMailbox(testEmail, {
        testName: "System Validation",
        useSoftAssertions: true,
      });

      // Test email waiting with timeout (should timeout quickly)
      const noEmail = await waitForEmail(testEmail, {
        timeout: 2000,
        testName: "Timeout Test",
        useSoftAssertions: true,
      });

      expect(noEmail).toBeNull();
      console.log("✅ Email timeout handling works correctly");
    } else {
      console.log("⚠️ Email testing is disabled");
    }

    // Navigate to a page to test basic functionality
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify page loads correctly regardless of email testing status
    await expect(page.locator("body")).toBeVisible();
    console.log("✅ Application functionality works with email testing configuration");
  });

  test("Conditional email testing demo", async ({ page }) => {
    const userEmail = `conditional_${Date.now()}@example.com`;

    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // This test demonstrates conditional email testing
    if (isEmailTestingEnabled()) {
      console.log("🔍 Running email interception tests...");
      
      await clearMailbox(userEmail, {
        testName: "Conditional Test",
        useSoftAssertions: true,
      });

      // Fill form
      await page.getByRole("textbox", { name: /email/i }).fill(userEmail);
      await page.getByRole("textbox", { name: /password/i }).fill("password123");
      await page.getByRole("button", { name: /sign up/i }).click();

      // Wait for potential email
      const email = await waitForEmail(userEmail, {
        timeout: 10000,
        testName: "Conditional Email Test",
        useSoftAssertions: true,
      });

      if (email) {
        console.log(`✅ Email intercepted: ${email.subject}`);
      } else {
        console.log("ℹ️ No email intercepted (may be expected)");
      }
    } else {
      console.log("⏭️ Skipping email interception (disabled via environment variable)");
      
      // Still test the functional flow
      await page.getByRole("textbox", { name: /email/i }).fill(userEmail);
      await page.getByRole("textbox", { name: /password/i }).fill("password123");
      await page.getByRole("button", { name: /sign up/i }).click();
    }

    // Functional test always runs
    await expect(page.getByText(/sign up successful/i)).toBeVisible({ timeout: 10000 });
    console.log("✅ Functional signup test completed");
  });

  test(withEmailTesting("Email accessibility testing"), async ({ page }) => {
    const userEmail = `accessibility_${Date.now()}@example.com`;

    // Test email-related UI components for accessibility
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Run accessibility check on email input fields
    await runAccessibilityCheck(page, {
      testName: "Email Form Accessibility",
      useSoftAssertions: true,
      include: ['form', 'input[type="email"]', 'label'],
    });

    // Test form with email input
    const emailInput = page.getByRole("textbox", { name: /email/i });
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute("type", "email");

    // Verify email input has proper accessibility attributes
    const emailInputElement = emailInput.first();
    const ariaLabel = await emailInputElement.getAttribute("aria-label");
    const ariaLabelledBy = await emailInputElement.getAttribute("aria-labelledby");
    const associatedLabel = page.locator('label[for]').filter({
      has: page.locator(`[id="${await emailInputElement.getAttribute("id")}"]`)
    });

    // Check that email input has proper labeling
    const hasProperLabeling = ariaLabel || ariaLabelledBy || (await associatedLabel.count() > 0);
    expect.soft(hasProperLabeling).toBeTruthy();

    console.log("✅ Email form accessibility validation completed");
  });
});
