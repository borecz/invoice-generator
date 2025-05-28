import { chromium, FullConfig } from "@playwright/test";
import path from "path";

/**
 * Global setup for Playwright tests
 * Creates a shared test user and saves authentication state to avoid
 * redundant login flows in individual tests
 */
async function globalSetup(config: FullConfig) {
  console.log("🚀 Starting global test setup...");

  // Launch browser for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("📝 Creating shared test user...");

    // Use a consistent test user to avoid rate limiting issues
    const sharedTestEmail = "shared_test_user@mailinator.com";
    const sharedTestPassword = "SharedTestPassword123!";

    // Navigate to signup page
    await page.goto("http://localhost:3000/auth/signup");
    await page.waitForLoadState("networkidle");

    // Fill signup form with exact selectors from UI inspection
    await page.getByPlaceholder("you@example.com").fill(sharedTestEmail);
    await page.getByPlaceholder("••••••••").fill(sharedTestPassword);
    await page.getByRole("button", { name: "Sign Up" }).click();

    // Wait for either successful signup or error
    try {
      // Wait for successful signup and redirect to dashboard
      // Based on UI inspection, signup redirects to /dashboard (not /en/dashboard)
      await page.waitForURL("**/dashboard", { timeout: 15000 });
    } catch (error) {
      // If signup fails due to rate limiting, try to login with existing user
      console.log(
        "⚠️ Signup failed, attempting login with existing credentials..."
      );

      await page.goto("http://localhost:3000/auth/login");
      await page.waitForLoadState("networkidle");

      await page.getByPlaceholder("you@example.com").fill(sharedTestEmail);
      await page.getByPlaceholder("••••••••").fill(sharedTestPassword);
      await page.getByRole("button", { name: "Sign in" }).click();

      // Wait for login redirect
      await page.waitForURL("**/dashboard", { timeout: 15000 });
    }

    console.log(`✅ Shared test user created: ${sharedTestEmail}`);
    console.log(`📍 Redirected to: ${page.url()}`);

    // Save authentication state for reuse in tests
    const authFile = path.join(__dirname, "../playwright/.auth/user.json");
    await page.context().storageState({ path: authFile });

    console.log("💾 Authentication state saved to:", authFile);

    // Store user credentials for tests that need them
    const userInfo = {
      email: sharedTestEmail,
      password: sharedTestPassword,
      createdAt: new Date().toISOString(),
    };

    // Save user info for tests
    const userInfoFile = path.join(
      __dirname,
      "../playwright/.auth/user-info.json"
    );
    const fs = await import("fs/promises");
    await fs.mkdir(path.dirname(userInfoFile), { recursive: true });
    await fs.writeFile(userInfoFile, JSON.stringify(userInfo, null, 2));

    console.log("📋 User info saved to:", userInfoFile);
  } catch (error) {
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log("🎉 Global test setup completed successfully!");
}

export default globalSetup;
