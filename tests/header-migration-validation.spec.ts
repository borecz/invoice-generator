import { test, expect } from "@playwright/test";

test.describe("Header Migration Validation", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for protected pages
    await page.addInitScript(() => {
      localStorage.setItem(
        "mockUser",
        JSON.stringify({
          email: "test@example.com",
          authenticated: true,
        })
      );
    });
  });

  test("Landing page - Enhanced Header with mobile menu", async ({ page }) => {
    await page.goto("/en");

    // Verify header is present
    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();

    // Verify logo and branding
    await expect(page.locator('img[alt="InvoiceAgent Logo"]')).toBeVisible();
    await expect(page.getByText("InvoiceAgent")).toBeVisible();

    // Test mobile menu functionality
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileMenuButton = page.getByRole("button", {
      name: "Toggle mobile menu",
    });
    await expect(mobileMenuButton).toBeVisible();

    // Open mobile menu
    await mobileMenuButton.click();

    // Verify mobile menu content
    await expect(page.getByText("Navigation")).toBeVisible();
    await expect(page.getByText("Language & Region")).toBeVisible();
    await expect(page.getByText("Theme")).toBeVisible();

    // Verify navigation links in mobile menu
    await expect(
      page.getByRole("link", { name: "Everything you need to get paid faster" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Simple, transparent pricing" })
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Testimonials" })
    ).toBeVisible();

    // Close mobile menu
    await mobileMenuButton.click();
    await expect(page.getByText("Navigation")).not.toBeVisible();
  });

  test("Invoice creation page - Minimal header with breadcrumbs", async ({
    page,
  }) => {
    await page.goto("/en/new");

    // Verify header is present
    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();

    // Verify logo links to dashboard
    const logoLink = page.getByRole("link", { name: "InvoiceAgent home" });
    await expect(logoLink).toHaveAttribute("href", "/dashboard");

    // Verify breadcrumb navigation
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" })
    ).toBeVisible();

    // Test mobile responsiveness
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileMenuButton = page.getByRole("button", {
      name: "Toggle mobile menu",
    });
    await expect(mobileMenuButton).toBeVisible();

    // Open mobile menu and verify quick actions
    await mobileMenuButton.click();
    await expect(page.getByText("Quick Actions")).toBeVisible();
  });

  test("Customer management page - Minimal header with custom actions", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/en/customers");

    // Verify header is present
    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();

    // Verify breadcrumb navigation
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" })
    ).toBeVisible();

    // Test desktop view - verify custom actions
    await page.setViewportSize({ width: 1280, height: 720 });

    // Should show custom action button on desktop
    await expect(
      page.getByRole("button", { name: /New Invoice/i })
    ).toBeVisible();
  });

  test("Settings page - Minimal header with simple breadcrumbs", async ({
    page,
  }) => {
    await page.goto("http://localhost:3000/en/settings");

    // Verify header is present
    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();

    // Verify breadcrumb navigation
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" })
    ).toBeVisible();

    // Verify user menu functionality
    const userMenuButton = page.getByRole("button", { name: /User menu/i });
    await expect(userMenuButton).toBeVisible();
  });

  test("Theme consistency across all pages", async ({ page }) => {
    const pages = [
      { url: "http://localhost:3000/en", name: "Landing" },
      { url: "http://localhost:3000/en/new", name: "Invoice Creation" },
      {
        url: "http://localhost:3000/en/customers",
        name: "Customer Management",
      },
      { url: "http://localhost:3000/en/settings", name: "Settings" },
    ];

    for (const pageConfig of pages) {
      await page.goto(pageConfig.url);

      // Verify header background and styling consistency
      const header = page.locator('header[role="banner"]');
      await expect(header).toBeVisible();

      // Verify theme toggle is present (except on minimal pages where it might be in mobile menu)
      await page.setViewportSize({ width: 375, height: 667 });

      const mobileMenuButton = page.getByRole("button", {
        name: "Toggle mobile menu",
      });
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(page.getByText("Theme")).toBeVisible();
        await mobileMenuButton.click(); // Close menu
      }

      console.log(`✅ ${pageConfig.name} page header verified`);
    }
  });

  test("Accessibility compliance across all headers", async ({ page }) => {
    const pages = [
      "http://localhost:3000/en",
      "http://localhost:3000/en/new",
      "http://localhost:3000/en/customers",
      "http://localhost:3000/en/settings",
    ];

    for (const url of pages) {
      await page.goto(url);

      // Verify semantic HTML structure
      const header = page.locator('header[role="banner"]');
      await expect(header).toBeVisible();

      // Verify skip navigation link
      const skipLink = page.getByRole("link", { name: "Skip to main content" });
      await expect(skipLink).toBeVisible();

      // Verify keyboard navigation
      await page.keyboard.press("Tab");
      const focusedElement = page.locator(":focus");
      await expect(focusedElement).toBeVisible();

      // Test mobile menu accessibility
      await page.setViewportSize({ width: 375, height: 667 });

      const mobileMenuButton = page.getByRole("button", {
        name: "Toggle mobile menu",
      });
      if (await mobileMenuButton.isVisible()) {
        // Test keyboard activation
        await mobileMenuButton.focus();
        await page.keyboard.press("Enter");

        // Verify menu is expanded
        await expect(mobileMenuButton).toHaveAttribute("aria-expanded", "true");

        // Test escape key closes menu
        await page.keyboard.press("Escape");
        await expect(page.getByText("Navigation")).not.toBeVisible();
      }
    }
  });

  test("Performance - Lazy loading components", async ({ page }) => {
    // Monitor network requests
    const requests: string[] = [];
    page.on("request", (request) => {
      if (request.url().includes(".js") || request.url().includes(".css")) {
        requests.push(request.url());
      }
    });

    await page.goto("/en");

    // Wait for initial load
    await page.waitForLoadState("networkidle");

    // Verify that lazy-loaded components don't block initial render
    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();

    // Test mobile menu to trigger lazy loading
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileMenuButton = page.getByRole("button", {
      name: "Toggle mobile menu",
    });
    await mobileMenuButton.click();

    // Verify lazy-loaded components render properly
    await expect(page.getByText("Language & Region")).toBeVisible();
    await expect(page.getByText("Theme")).toBeVisible();

    console.log(`📊 Total requests: ${requests.length}`);
  });
});
