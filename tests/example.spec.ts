import { test, expect } from "@playwright/test";

/**
 * Basic functionality test with proper test.step() structure
 * CRITICAL: All test actions MUST be wrapped in test.step() for better debugging and reporting
 */

test("should navigate to the home page and see title", async ({ page }) => {
  await test.step("Navigate to landing page", async () => {
    await page.goto("/");
    // Wait for the page to load and redirect to the default locale
    await page.waitForLoadState("networkidle");
  });

  await test.step("Verify main heading is visible", async () => {
    // Check for the actual hero title from the translations
    await expect(page.locator("h1")).toContainText(
      "Professional Invoicing Made Simple"
    );
  });

  await test.step("Verify key content is present", async () => {
    // Also check for other key elements to ensure the page loaded correctly
    await expect(
      page.getByText("Create, send, and track invoices with ease")
    ).toBeVisible();
  });

  await test.step("Verify call-to-action buttons are present", async () => {
    // For unauthenticated users, should see signup CTA and watch demo
    // Use .first() to avoid strict mode violation (multiple "Start Free Trial" buttons exist)
    await expect(
      page.getByRole("button", { name: "Get Started" }).first()
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Watch Demo" })
    ).toBeVisible();

    // Should also see login/signup buttons in header
    await expect(
      page.getByRole("button", { name: "Get Started" })
    ).toBeVisible();
  });

  await test.step("Verify URL includes locale prefix", async () => {
    // Based on UI inspection: URL includes /en prefix
    expect(page.url()).toMatch(/\/en$/);
  });
});
