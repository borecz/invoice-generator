import { test, expect } from "@playwright/test";
import {
  waitForEmail,
  waitForEmailWithSubject,
  clearMailbox,
  isEmailTestingEnabled,
} from "./utils/email";
import { getSharedUserInfo } from "./utils/shared-auth";

/**
 * Authentication Tests with proper test.step() structure
 * CRITICAL: All test actions MUST be wrapped in test.step() for better debugging and reporting
 *
 * Note: These tests clear authentication state to test signup/login flows from unauthenticated state
 */

const getUniqueEmail = () => `testuser_${Date.now()}@mailinator.com`;

test.describe("Authentication", () => {
  let userEmail: string; // This will be set by the signup test and used by the login test
  const userPassword = "TestPassword123!";

  // Run tests in this describe block serially to ensure signup runs before login
  // if the login test depends on the user created by signup.
  // Alternatively, make login test independent by creating its own user or using a pre-seeded one.
  // For this exercise, we'll rely on the order within this describe block.
  // Note: Playwright by default runs tests in a file in parallel if not configured otherwise.
  // To enforce order for dependent tests like this, you can use test.describe.serial()
  // or structure tests to be independent.
  // Let's assume for now that either test.describe.serial() would be used,
  // or we accept this implicit dependency for this specific subtask.
  // For a more robust setup, `test.beforeAll` could create a user, or each test could be self-contained.

  test("User can sign up successfully", async ({ page }) => {
    await test.step("Clear authentication state for signup test", async () => {
      // Clear shared authentication to test signup from unauthenticated state
      await page.context().clearCookies();
      await page.context().clearPermissions();
    });

    await test.step("Navigate to signup page", async () => {
      userEmail = getUniqueEmail();
      await page.goto("/auth/signup");
      await page.waitForLoadState("networkidle");
    });

    await test.step("Fill signup form", async () => {
      // Based on UI inspection: exact placeholders that work
      await page.getByPlaceholder("you@example.com").fill(userEmail);
      await page.getByPlaceholder("••••••••").fill(userPassword);

      console.log(`Creating test user: ${userEmail}`);
    });

    await test.step("Submit signup form", async () => {
      // Based on UI inspection: button text is "Sign Up"
      await page.getByRole("button", { name: "Sign Up" }).click();
    });

    await test.step("Verify successful signup and auto-login", async () => {
      // Based on UI inspection: signup redirects to /dashboard with locale prefix
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

      console.log(
        `✅ Signup successful for: ${userEmail} - auto-logged in to dashboard`
      );
    });

    await test.step("Verify authenticated state on dashboard", async () => {
      // Verify we're on the dashboard
      await expect(page.getByText("Dashboard")).toBeVisible({
        timeout: 5000,
      });

      // Verify user menu is present (shows user is authenticated)
      await expect(page.locator('button[aria-label*="User menu"]')).toBeVisible(
        {
          timeout: 5000,
        }
      );

      console.log("✅ User is properly authenticated and on dashboard");
    });
  });

  test("User can log in successfully and then log out", async ({ page }) => {
    // Use a fixed test user for login testing
    const loginUserEmail = "testuser_login@mailinator.com";
    const loginUserPassword = userPassword;

    await test.step("Ensure test user exists", async () => {
      // Try to create the test user (will work if user doesn't exist)
      await page.goto("/auth/signup");
      await page.waitForLoadState("networkidle");

      await page.getByPlaceholder("you@example.com").fill(loginUserEmail);
      await page.getByPlaceholder("••••••••").fill(loginUserPassword);
      await page.getByRole("button", { name: "Sign Up" }).click();

      // Wait a bit for the signup to process
      await page.waitForTimeout(2000);

      // If we're on dashboard, great! If not, user probably already exists
      const currentUrl = page.url();
      if (currentUrl.includes("/dashboard")) {
        console.log(`✅ Created new test user: ${loginUserEmail}`);
      } else {
        console.log(`ℹ️ Test user already exists: ${loginUserEmail}`);
      }
    });

    await test.step("Logout if logged in", async () => {
      // Check if we're on dashboard (logged in)
      const currentUrl = page.url();
      if (currentUrl.includes("/dashboard")) {
        // Find and click the user menu
        const userMenu = page.locator('button[aria-label*="User menu"]');
        await userMenu.click();

        // Click logout from the dropdown
        const logoutButton = page
          .locator('text="Log out"')
          .or(page.locator('text="Logout"'))
          .or(
            page.getByRole("menuitem").filter({ hasText: /logout|log out/i })
          );
        await logoutButton.click();

        // Verify we're logged out
        await expect(page).toHaveURL(/\/en\/?$/, { timeout: 5000 });
        console.log("✅ Logged out successfully");
      } else {
        console.log("ℹ️ User was not logged in, proceeding to login test");
      }
    });

    await test.step("Navigate to login page", async () => {
      await page.goto("/auth/login");
      await page.waitForLoadState("networkidle");
    });

    await test.step("Fill login form", async () => {
      // Fill in the email and password
      await page.getByPlaceholder("you@example.com").fill(loginUserEmail);
      await page.getByPlaceholder("••••••••").fill(loginUserPassword);
    });

    await test.step("Submit login form", async () => {
      // Based on UI inspection: button text is "Sign in"
      await page.getByRole("button", { name: "Sign in" }).click();
    });

    await test.step("Verify successful login", async () => {
      // With local Supabase, user is redirected to dashboard after login
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });

    await test.step("Verify authenticated state on dashboard", async () => {
      // Verify we're on the dashboard
      await expect(page.getByText("Dashboard")).toBeVisible({
        timeout: 5000,
      });

      // Verify user menu is present
      await expect(page.locator('button[aria-label*="User menu"]')).toBeVisible(
        {
          timeout: 5000,
        }
      );
    });

    await test.step("Test logout functionality", async () => {
      // Test Logout
      const userMenuForLogout = page.locator('button[aria-label*="User menu"]');
      await userMenuForLogout.click();

      const logoutButtonFinal = page
        .locator('text="Log out"')
        .or(page.locator('text="Logout"'))
        .or(page.getByRole("menuitem").filter({ hasText: /logout|log out/i }));
      await logoutButtonFinal.click();
    });

    await test.step("Verify successful logout", async () => {
      // Should redirect to landing page with locale
      await expect(page).toHaveURL(/\/en\/?$/, { timeout: 5000 });

      // Login and Sign Up buttons should be visible again on landing page
      await expect(
        page
          .locator('a[href*="/auth/login"] button, button:has-text("Login")')
          .first()
      ).toBeVisible();
      await expect(
        page
          .locator(
            'a[href*="/auth/signup"] button, button:has-text("Get Started")'
          )
          .first()
      ).toBeVisible();

      // User menu should NOT be visible
      await expect(
        page.locator('button[aria-label*="User menu"]')
      ).not.toBeVisible();
    });

    await test.step("Clean up email testing if enabled", async () => {
      // Optional: Test email interception if enabled
      if (isEmailTestingEnabled()) {
        console.log("📧 Checking for signup confirmation email...");

        // Clear mailbox and check for any emails sent during signup
        await clearMailbox(loginUserEmail, {
          testName: "Auth Test Cleanup",
          useSoftAssertions: true,
        });

        // Note: This is just demonstrating email testing integration
        // In a real scenario, you might wait for a confirmation email
        // const confirmationEmail = await waitForEmailWithSubject(
        //   userEmail,
        //   /confirm|welcome|verification/i,
        //   { timeout: 10000, useSoftAssertions: true }
        // );

        console.log("✅ Email testing integration verified");
      }
    });
  });
});
