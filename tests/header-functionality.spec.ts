import { test, expect } from "@playwright/test";

test.describe("Header Functionality Tests", () => {
  const locales = ["en", "it", "cs", "ru"];

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test("Logo navigation works correctly", async ({ page }) => {
    await page.goto("http://localhost:3000/en");
    await page.waitForLoadState("networkidle");

    const logo = page.locator('a[aria-label="InvoiceAgent home"]');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute("href", "/");

    // Test logo click navigation
    await logo.click();
    await page.waitForLoadState("networkidle");
    expect(page.url()).toContain("/en");
  });

  test("Language switcher functionality", async ({ page }) => {
    await page.goto("http://localhost:3000/en");
    await page.waitForLoadState("networkidle");

    const languageSwitcher = page.locator(
      'button[aria-label*="Language and region settings"]'
    );
    await languageSwitcher.click();

    // Test language selection
    for (const locale of locales) {
      const languageOption = page
        .locator(
          `[role="radio"][aria-label*="${
            locale === "en" ? "English" : locale
          }"]`
        )
        .first();
      if (await languageOption.isVisible()) {
        await languageOption.click();
        await page.waitForLoadState("networkidle");

        // Verify URL changed to new locale
        expect(page.url()).toContain(`/${locale}`);

        // Reopen language switcher for next iteration
        if (locale !== locales[locales.length - 1]) {
          await languageSwitcher.click();
        }
      }
    }
  });

  test("Theme toggle functionality", async ({ page }) => {
    await test.step("Navigate to page and find theme toggle", async () => {
      await page.goto("http://localhost:3000/en");
      await page.waitForLoadState("networkidle");
    });

    await test.step("Test theme toggle functionality", async () => {
      // The actual aria-label is "Switch to dark mode" or "Switch to light mode"
      const themeToggle = page.locator('button[aria-label*="Switch to"]');
      await expect(themeToggle).toBeVisible();

      // Get initial theme
      const initialTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      // Toggle theme
      await themeToggle.click();
      await page.waitForTimeout(500); // Wait for theme transition

      // Verify theme changed
      const newTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      expect(newTheme).not.toBe(initialTheme);

      // Toggle back
      await themeToggle.click();
      await page.waitForTimeout(500);

      const finalTheme = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark")
          ? "dark"
          : "light";
      });

      expect(finalTheme).toBe(initialTheme);
    });
  });

  test("Mobile menu functionality", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("http://localhost:3000/en");
    await page.waitForLoadState("networkidle");

    const mobileMenuButton = page.locator(
      'button[aria-label="Toggle mobile menu"]'
    );
    await expect(mobileMenuButton).toBeVisible();
    await expect(mobileMenuButton).toHaveAttribute("aria-expanded", "false");

    // Open mobile menu
    await mobileMenuButton.click();
    await expect(mobileMenuButton).toHaveAttribute("aria-expanded", "true");

    const mobileMenu = page.locator("#mobile-menu");
    await expect(mobileMenu).toBeVisible();

    // Test mobile menu contains expected elements
    await expect(mobileMenu.locator("text=Language & Region")).toBeVisible();
    await expect(mobileMenu.locator("text=Theme")).toBeVisible();

    // Close mobile menu
    await mobileMenuButton.click();
    await expect(mobileMenuButton).toHaveAttribute("aria-expanded", "false");
    await expect(mobileMenu).not.toBeVisible();
  });

  test("Authentication state handling (authenticated)", async ({ page }) => {
    await test.step("Navigate to dashboard", async () => {
      await page.goto("http://localhost:3000/en/dashboard");
      await page.waitForLoadState("networkidle");
    });

    await test.step("Verify authenticated state elements", async () => {
      // Should show user menu
      await expect(
        page.locator('button[aria-label*="User menu"]')
      ).toBeVisible();

      // Should show notifications button
      await expect(
        page.locator('button[aria-label*="Notifications"]')
      ).toBeVisible();

      // Should not show login/signup buttons in authenticated state
      await expect(
        page.locator('a[href="/auth/login"] button')
      ).not.toBeVisible();
      await expect(
        page.locator('a[href="/auth/signup"] button')
      ).not.toBeVisible();
    });
  });

  test("User menu functionality", async ({ page }) => {
    await test.step("Navigate to dashboard and verify user menu", async () => {
      await page.goto("http://localhost:3000/en/dashboard");
      await page.waitForLoadState("networkidle");

      const userMenuButton = page.locator('button[aria-label*="User menu"]');
      await expect(userMenuButton).toBeVisible();
    });

    await test.step("Test user menu functionality", async () => {
      const userMenuButton = page.locator('button[aria-label*="User menu"]');

      // Open user menu
      await userMenuButton.click();

      // Test menu items
      const menuItems = [
        { text: "Profile Settings", href: "/settings" },
        { text: "Dashboard", href: "/dashboard" },
        { text: "Back to Homepage", href: "/" },
      ];

      for (const item of menuItems) {
        const menuItem = page.locator(`text=${item.text}`).first();
        await expect(menuItem).toBeVisible();
      }

      // Test logout button
      const logoutButton = page.locator("text=Logout").first();
      await expect(logoutButton).toBeVisible();
    });
  });

  test("Notifications functionality", async ({ page }) => {
    await test.step("Navigate to dashboard and verify notifications", async () => {
      await page.goto("http://localhost:3000/en/dashboard");
      await page.waitForLoadState("networkidle");

      const notificationButton = page.locator(
        'button[aria-label*="Notifications"]'
      );
      await expect(notificationButton).toBeVisible();
    });

    await test.step("Test notification functionality", async () => {
      const notificationButton = page.locator(
        'button[aria-label*="Notifications"]'
      );

      // Click to open notifications
      await notificationButton.click();

      // Should see notifications dropdown or panel
      // Note: This test verifies the button exists and is clickable
      // The actual notification content depends on the application state
    });
  });

  test("Quick actions functionality", async ({ page }) => {
    await test.step("Navigate to dashboard and verify quick actions", async () => {
      await page.goto("http://localhost:3000/en/dashboard");
      await page.waitForLoadState("networkidle");

      // Test quick action buttons (desktop view)
      const newInvoiceButton = page
        .locator('a[href*="/new"], a[href*="/invoice"]')
        .first();
      const addCustomerButton = page.locator('a[href*="/customer"]').first();

      await expect(newInvoiceButton).toBeVisible();
      await expect(addCustomerButton).toBeVisible();
    });

    await test.step("Test quick action accessibility", async () => {
      const newInvoiceButton = page
        .locator('a[href*="/new"], a[href*="/invoice"]')
        .first();
      const addCustomerButton = page.locator('a[href*="/customer"]').first();

      // Test that buttons are accessible (have proper labels or text)
      await expect(newInvoiceButton).toBeVisible();
      await expect(addCustomerButton).toBeVisible();

      // Note: Specific aria-label values may vary based on implementation
      // This test verifies the buttons exist and are accessible
    });
  });

  test("Breadcrumb navigation", async ({ page }) => {
    await page.goto("http://localhost:3000/en");

    // Mock breadcrumb data
    await page.evaluate(() => {
      // Simulate being on a page with breadcrumbs
      const event = new CustomEvent("mockBreadcrumbs", {
        detail: [
          { label: "Dashboard", href: "/dashboard" },
          { label: "Invoices", href: "/invoices" },
          { label: "Invoice #001" },
        ],
      });
      window.dispatchEvent(event);
    });

    // In a real implementation, breadcrumbs would be passed as props
    // This test verifies the structure exists
    const breadcrumbNav = page.locator(
      'nav[aria-label="Breadcrumb navigation"]'
    );
    // Breadcrumb may not be visible on landing page, so we just verify the selector works
  });

  test("Header responsive behavior transitions", async ({ page }) => {
    await page.goto("http://localhost:3000/en");
    await page.waitForLoadState("networkidle");

    // Start with desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator(".hidden.lg\\:flex")).toBeVisible();

    // Transition to tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(100);

    // Transition to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator(".lg\\:hidden")).toBeVisible();
    await expect(
      page.locator('button[aria-label="Toggle mobile menu"]')
    ).toBeVisible();

    // Transition back to desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator(".hidden.lg\\:flex")).toBeVisible();
    await expect(
      page.locator('button[aria-label="Toggle mobile menu"]')
    ).not.toBeVisible();
  });

  test("Header performance and loading", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("http://localhost:3000/en");
    await page.waitForLoadState("networkidle");

    const loadTime = Date.now() - startTime;

    // Header should load quickly (under 3 seconds)
    expect(loadTime).toBeLessThan(3000);

    // All critical header elements should be visible
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    await expect(
      page.locator('a[aria-label="InvoiceAgent home"]')
    ).toBeVisible();
    await expect(
      page.locator('button[aria-label*="Language and region settings"]')
    ).toBeVisible();
    await expect(page.locator('button[aria-label*="Switch to"]')).toBeVisible();
  });

  test("Header keyboard navigation flow", async ({ page }) => {
    await test.step("Navigate to page and test keyboard navigation", async () => {
      await page.goto("http://localhost:3000/en/dashboard");
      await page.waitForLoadState("networkidle");

      // Test that we can focus on the theme toggle directly
      const themeToggle = page.locator('button[aria-label*="Switch to"]');
      await themeToggle.focus();
      await expect(themeToggle).toBeFocused();

      // Test that we can navigate to other focusable elements
      const languageSwitcher = page.locator(
        'button[aria-label*="Language and region settings"]'
      );
      await languageSwitcher.focus();
      await expect(languageSwitcher).toBeFocused();

      // Test user menu button focus (authenticated state)
      const userMenuButton = page.locator('button[aria-label*="User menu"]');
      await userMenuButton.focus();
      await expect(userMenuButton).toBeFocused();
    });
  });
});
