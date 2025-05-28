import { test, expect } from "@playwright/test";
import {
  runAccessibilityCheck,
  checkWCAG21AACompliance,
  validateKeyboardNavigation,
  runComprehensiveA11yCheck,
  withAccessibilityCheck,
  isAccessibilityTestingEnabled,
} from "./utils/accessibility";

test.describe("Authentication Flow with Accessibility Testing", () => {
  test.beforeEach(async ({ page }) => {
    // Set up viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test(withAccessibilityCheck("User can sign up and login with accessibility validation"), async ({ page }) => {
    const userEmail = `test_${Date.now()}@example.com`;
    const userPassword = "TestPassword123!";

    // Navigate to signup page
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");

    // Run accessibility check on signup page
    await runComprehensiveA11yCheck(page, {
      testName: "Signup Page",
      useSoftAssertions: true,
    });

    // Test keyboard navigation on signup form
    const signupSelectors = [
      'input[placeholder="you@example.com"]',
      'input[placeholder="••••••••"]',
      'button[type="submit"]',
    ];
    await validateKeyboardNavigation(page, signupSelectors, {
      useSoftAssertions: true,
    });

    // Fill signup form using accessible selectors
    await page.getByRole("textbox", { name: /email/i }).fill(userEmail);
    await page.getByRole("textbox", { name: /password/i }).fill(userPassword);
    await page.getByRole("button", { name: /sign up/i }).click();

    // Wait for success message and verify accessibility
    await expect(page.getByText(/sign up successful/i)).toBeVisible({ timeout: 10000 });
    
    // Run accessibility check after form submission
    await runAccessibilityCheck(page, {
      testName: "Signup Success State",
      useSoftAssertions: true,
    });

    // Navigate to login page
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Run accessibility check on login page
    await checkWCAG21AACompliance(page, {
      testName: "Login Page",
      useSoftAssertions: true,
    });

    // Test keyboard navigation on login form
    const loginSelectors = [
      'input[placeholder="you@example.com"]',
      'input[placeholder="••••••••"]',
      'button[type="submit"]',
    ];
    await validateKeyboardNavigation(page, loginSelectors, {
      useSoftAssertions: true,
    });

    // Fill login form using accessible selectors
    await page.getByRole("textbox", { name: /email/i }).fill(userEmail);
    await page.getByRole("textbox", { name: /password/i }).fill(userPassword);
    await page.getByRole("button", { name: /login/i }).click();

    // Verify login success
    await expect(page.getByText(/sign in successful/i)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL("/new", { timeout: 10000 });

    // Run accessibility check on authenticated state
    await runComprehensiveA11yCheck(page, {
      testName: "Post-Login Dashboard",
      useSoftAssertions: true,
    });

    // Navigate to landing page to test authenticated header
    await page.goto("/");
    await expect(page.getByRole("button", { name: /logout/i })).toBeVisible();
    await expect(page.getByText(userEmail, { exact: false })).toBeVisible();

    // Run accessibility check on authenticated landing page
    await runAccessibilityCheck(page, {
      testName: "Authenticated Landing Page",
      useSoftAssertions: true,
    });

    // Test logout functionality with accessibility
    await page.getByRole("button", { name: /logout/i }).click();
    await expect(page).toHaveURL("/", { timeout: 5000 });
    
    // Verify logout state accessibility
    await expect(page.getByRole("button", { name: /login/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign up/i })).toBeVisible();
    
    // Final accessibility check on logged out state
    await runAccessibilityCheck(page, {
      testName: "Logged Out Landing Page",
      useSoftAssertions: true,
    });
  });

  test(withAccessibilityCheck("Login form validation with accessibility"), async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Run initial accessibility check
    await checkWCAG21AACompliance(page, {
      testName: "Login Form Initial State",
      useSoftAssertions: true,
    });

    // Test form validation with empty fields
    await page.getByRole("button", { name: /login/i }).click();

    // Check for validation messages and their accessibility
    const errorMessages = page.locator('[role="alert"], .error-message, [aria-invalid="true"]');
    const errorCount = await errorMessages.count();
    
    if (errorCount > 0) {
      // Verify error messages are accessible
      for (let i = 0; i < errorCount; i++) {
        const errorElement = errorMessages.nth(i);
        await expect(errorElement).toBeVisible();
        
        // Check if error has proper ARIA attributes
        const ariaLive = await errorElement.getAttribute("aria-live");
        const role = await errorElement.getAttribute("role");
        
        expect.soft(ariaLive || role).toBeTruthy();
      }
    }

    // Run accessibility check on validation state
    await runAccessibilityCheck(page, {
      testName: "Login Form Validation State",
      useSoftAssertions: true,
    });

    // Test with invalid email format
    await page.getByRole("textbox", { name: /email/i }).fill("invalid-email");
    await page.getByRole("textbox", { name: /password/i }).fill("short");
    await page.getByRole("button", { name: /login/i }).click();

    // Run accessibility check on invalid input state
    await runAccessibilityCheck(page, {
      testName: "Login Form Invalid Input State",
      useSoftAssertions: true,
    });
  });

  test(withAccessibilityCheck("Mobile login accessibility"), async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // Run comprehensive mobile accessibility check
    await runComprehensiveA11yCheck(page, {
      testName: "Mobile Login Page",
      useSoftAssertions: true,
    });

    // Test mobile-specific interactions
    const mobileMenuButton = page.locator('button[aria-label*="menu"]');
    const mobileMenuExists = await mobileMenuButton.count() > 0;
    
    if (mobileMenuExists) {
      await mobileMenuButton.click();
      
      // Check mobile menu accessibility
      await runAccessibilityCheck(page, {
        testName: "Mobile Menu Open State",
        useSoftAssertions: true,
      });
    }

    // Test form interaction on mobile
    await page.getByRole("textbox", { name: /email/i }).tap();
    await page.getByRole("textbox", { name: /email/i }).fill("test@example.com");
    
    await page.getByRole("textbox", { name: /password/i }).tap();
    await page.getByRole("textbox", { name: /password/i }).fill("password123");

    // Final mobile accessibility check
    await runAccessibilityCheck(page, {
      testName: "Mobile Login Form Filled State",
      useSoftAssertions: true,
    });
  });

  test("Conditional accessibility testing demo", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");

    // This test demonstrates conditional accessibility testing
    if (isAccessibilityTestingEnabled()) {
      console.log("🔍 Running accessibility checks...");
      await runComprehensiveA11yCheck(page, {
        testName: "Conditional Test Example",
        useSoftAssertions: true,
      });
    } else {
      console.log("⏭️ Skipping accessibility checks (disabled via environment variable)");
    }

    // Regular functional test continues regardless
    await page.getByRole("textbox", { name: /email/i }).fill("test@example.com");
    await page.getByRole("textbox", { name: /password/i }).fill("password123");
    
    // This test will always run the functional assertions
    await expect(page.getByRole("textbox", { name: /email/i })).toHaveValue("test@example.com");
    await expect(page.getByRole("textbox", { name: /password/i })).toHaveValue("password123");
  });
});
