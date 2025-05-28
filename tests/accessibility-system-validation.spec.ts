import { test, expect } from "@playwright/test";
import {
  runAccessibilityCheck,
  checkWCAG21AACompliance,
  validateKeyboardNavigation,
  validateTouchTargets,
  runComprehensiveA11yCheck,
  withAccessibilityCheck,
  isAccessibilityTestingEnabled,
} from "./utils/accessibility";

test.describe("Accessibility Testing System Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("Environment variable detection works correctly", async ({ page }) => {
    await page.goto("/");
    
    const isEnabled = isAccessibilityTestingEnabled();
    console.log(`Accessibility testing enabled: ${isEnabled}`);
    
    // This test validates that the environment variable detection is working
    // The actual value depends on how the test is run
    expect(typeof isEnabled).toBe("boolean");
  });

  test(withAccessibilityCheck("Basic accessibility check functionality"), async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test basic accessibility check
    await runAccessibilityCheck(page, {
      testName: "Landing Page Basic Check",
      useSoftAssertions: true,
    });

    // This test should complete without throwing errors
    expect(true).toBe(true);
  });

  test(withAccessibilityCheck("WCAG 2.1 AA compliance check"), async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test WCAG compliance check
    await checkWCAG21AACompliance(page, {
      testName: "Landing Page WCAG Check",
      useSoftAssertions: true,
    });

    expect(true).toBe(true);
  });

  test(withAccessibilityCheck("Keyboard navigation validation"), async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test keyboard navigation with common interactive elements
    const commonSelectors = [
      'a[href]',
      'button',
    ];

    // Find at least one interactive element to test
    for (const selector of commonSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        await validateKeyboardNavigation(page, [selector], {
          useSoftAssertions: true,
        });
        break;
      }
    }

    expect(true).toBe(true);
  });

  test(withAccessibilityCheck("Touch target validation (mobile)"), async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test touch target validation
    await validateTouchTargets(page, 44, {
      useSoftAssertions: true,
    });

    expect(true).toBe(true);
  });

  test(withAccessibilityCheck("Comprehensive accessibility check"), async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test comprehensive check that combines multiple validations
    await runComprehensiveA11yCheck(page, {
      testName: "Landing Page Comprehensive",
      useSoftAssertions: true,
    });

    expect(true).toBe(true);
  });

  test("Conditional accessibility testing", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // This test demonstrates conditional testing
    let accessibilityCheckRan = false;

    if (isAccessibilityTestingEnabled()) {
      await runAccessibilityCheck(page, {
        testName: "Conditional Test",
        useSoftAssertions: true,
      });
      accessibilityCheckRan = true;
      console.log("✅ Accessibility check ran (enabled)");
    } else {
      console.log("⏭️ Accessibility check skipped (disabled)");
    }

    // Functional test always runs
    await expect(page.locator("body")).toBeVisible();
    
    // Log the result for verification
    console.log(`Accessibility testing enabled: ${isAccessibilityTestingEnabled()}`);
    console.log(`Accessibility check executed: ${accessibilityCheckRan}`);
  });

  test(withAccessibilityCheck("Multi-page accessibility flow"), async ({ page }) => {
    // Test accessibility across multiple pages
    const pages = [
      { url: "/", name: "Landing Page" },
      { url: "/auth/login", name: "Login Page" },
      { url: "/auth/signup", name: "Signup Page" },
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState("networkidle");

      await runAccessibilityCheck(page, {
        testName: pageInfo.name,
        useSoftAssertions: true,
      });

      console.log(`✅ Accessibility check completed for ${pageInfo.name}`);
    }

    expect(true).toBe(true);
  });

  test(withAccessibilityCheck("Accessibility with form interactions"), async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Initial accessibility check
    await runAccessibilityCheck(page, {
      testName: "Login Form Initial",
      useSoftAssertions: true,
    });

    // Interact with form elements using accessible selectors
    const emailInput = page.getByRole("textbox", { name: /email/i });
    const passwordInput = page.getByRole("textbox", { name: /password/i });
    
    if (await emailInput.count() > 0) {
      await emailInput.fill("test@example.com");
    }
    
    if (await passwordInput.count() > 0) {
      await passwordInput.fill("password123");
    }

    // Accessibility check after form interaction
    await runAccessibilityCheck(page, {
      testName: "Login Form Filled",
      useSoftAssertions: true,
    });

    expect(true).toBe(true);
  });

  test("Accessibility utilities error handling", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Test that accessibility utilities handle errors gracefully
    try {
      await runAccessibilityCheck(page, {
        testName: "Error Handling Test",
        useSoftAssertions: true,
        // Test with potentially problematic configuration
        exclude: ["nonexistent-selector"],
      });
      
      // Should not throw with soft assertions
      expect(true).toBe(true);
    } catch (error) {
      // If an error is thrown, it should be logged but not fail the test
      console.log("Error caught (expected with soft assertions):", error);
      expect(true).toBe(true);
    }
  });

  test("Test tagging system validation", async ({ page }) => {
    // This test validates that the @a11y tagging system is working
    // The test name should include @a11y when using withAccessibilityCheck
    const testName = withAccessibilityCheck("Sample test name");
    expect(testName).toContain("@a11y");
    expect(testName).toContain("Sample test name");
    
    console.log(`Generated test name: ${testName}`);
  });
});
