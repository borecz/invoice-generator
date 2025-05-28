import { test as setup, expect } from "@playwright/test";

/**
 * Authentication Setup for Playwright Tests
 *
 * This setup creates a consistent test user and saves the authentication state
 * to be shared across all tests using the 'no-setup' project.
 *
 * Usage:
 * 1. Run setup once: npm run test:e2e:setup
 * 2. Run fast tests: npm run test:e2e:fast
 *
 * The setup handles both new user creation and existing user login automatically.
 */

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Use a timestamped email to avoid email confirmation issues
  const userEmail = `testuser_${Date.now()}@mailinator.com`;
  const userPassword = "TestPassword123!";

  await setup.step("Navigate to signup page", async () => {
    await page.goto("/en/auth/signup");
    await page.waitForLoadState("networkidle");
  });

  await setup.step("Fill signup form", async () => {
    await page.getByPlaceholder("you@example.com").fill(userEmail);
    await page.getByPlaceholder("••••••••").fill(userPassword);
    console.log(`Creating setup user: ${userEmail}`);
  });

  await setup.step("Submit signup form", async () => {
    await page.getByRole("button", { name: "Sign Up" }).click();
  });

  await setup.step("Verify successful signup and authentication", async () => {
    // Should redirect to dashboard after signup
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Should see user-specific content
    await expect(page.getByText("Dashboard")).toBeVisible();

    console.log(`✅ Setup user authenticated: ${userEmail}`);
  });

  await setup.step("Save authentication state", async () => {
    // Save the authentication state for other tests to use
    await page.context().storageState({ path: authFile });
    console.log("✅ Authentication state saved for shared use");
  });
});
