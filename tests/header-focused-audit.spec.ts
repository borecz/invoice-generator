import { test, expect } from "@playwright/test";

test.describe("Header Focused UI/UX Audit", () => {
  const viewports = [
    { name: "mobile", width: 320, height: 568 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1280, height: 720 },
  ];

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

  test("Landing page header analysis across viewports", async ({ page }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("http://localhost:3001/en", {
        waitUntil: "domcontentloaded",
      });

      // Wait for navigation to be visible
      await page.waitForSelector("nav", { timeout: 10000 });

      // Take screenshot of header area
      const nav = page.locator("nav").first();
      await nav.screenshot({
        path: `test-results/header-audit/landing-${viewport.name}.png`,
        animations: "disabled",
      });

      // Check for horizontal overflow on mobile
      if (viewport.width <= 768) {
        const hasOverflow = await page.evaluate(() => {
          const nav = document.querySelector("nav");
          return nav ? nav.scrollWidth > nav.clientWidth : false;
        });

        console.log(`Landing page ${viewport.name} overflow:`, hasOverflow);

        // Check if mobile menu button exists
        const mobileMenuExists =
          (await page
            .locator('[aria-label*="mobile"], [aria-label*="Menu"]')
            .count()) > 0;
        console.log(
          `Landing page ${viewport.name} has mobile menu:`,
          mobileMenuExists
        );
      }

      // Analyze header elements
      const headerAnalysis = await page.evaluate(() => {
        const nav = document.querySelector("nav");
        if (!nav) return null;

        const rect = nav.getBoundingClientRect();
        return {
          height: rect.height,
          width: rect.width,
          hasLogo: !!nav.querySelector('img[alt*="Logo"]'),
          hasThemeToggle: !!nav.querySelector('[aria-label*="theme"]'),
          hasLanguageSwitcher: !!nav.querySelector('[aria-label*="Language"]'),
          hasAuthButtons: !!nav.querySelector('a[href*="/auth/"]'),
          elementCount: nav.querySelectorAll("*").length,
        };
      });

      console.log(`Landing page ${viewport.name} analysis:`, headerAnalysis);
    }
  });

  test("Dashboard header analysis (shared Header component)", async ({
    page,
  }) => {
    for (const viewport of viewports) {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });

      try {
        await page.goto("http://localhost:3001/en/dashboard", {
          waitUntil: "domcontentloaded",
        });

        // Wait for header to be visible
        await page.waitForSelector('header[role="banner"]', { timeout: 10000 });

        // Take screenshot of header area
        const header = page.locator('header[role="banner"]');
        await header.screenshot({
          path: `test-results/header-audit/dashboard-${viewport.name}.png`,
          animations: "disabled",
        });

        // Check for mobile menu functionality
        if (viewport.width <= 768) {
          const mobileMenuButton = page.locator('[aria-label*="mobile menu"]');
          const mobileMenuExists = (await mobileMenuButton.count()) > 0;

          if (mobileMenuExists) {
            await mobileMenuButton.click();
            await page.waitForTimeout(500);

            const mobileMenuVisible = await page
              .locator("#mobile-menu")
              .isVisible();
            console.log(
              `Dashboard ${viewport.name} mobile menu works:`,
              mobileMenuVisible
            );

            // Close menu
            await mobileMenuButton.click();
          }
        }

        // Analyze header elements
        const headerAnalysis = await page.evaluate(() => {
          const header = document.querySelector('header[role="banner"]');
          if (!header) return null;

          const rect = header.getBoundingClientRect();
          return {
            height: rect.height,
            width: rect.width,
            hasLogo: !!header.querySelector('img[alt*="Logo"]'),
            hasQuickActions: !!header.querySelector('[aria-label*="Create"]'),
            hasUserMenu: !!header.querySelector('[aria-label*="User menu"]'),
            hasNotifications: !!header.querySelector(
              '[aria-label*="Notifications"]'
            ),
            hasBreadcrumbs: !!header.querySelector(
              '[aria-label*="Breadcrumb"]'
            ),
            hasOverflow: header.scrollWidth > header.clientWidth,
          };
        });

        console.log(`Dashboard ${viewport.name} analysis:`, headerAnalysis);
      } catch (error) {
        console.error(
          `Dashboard ${viewport.name} failed:`,
          (error as Error).message
        );
      }
    }
  });

  test("Custom headers analysis (Invoice, Customer, Settings pages)", async ({
    page,
  }) => {
    const customHeaderPages = [
      { path: "/new", name: "Invoice Creation" },
      { path: "/customers", name: "Customer Management" },
      { path: "/settings", name: "Settings" },
    ];

    for (const pageConfig of customHeaderPages) {
      for (const viewport of viewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        try {
          await page.goto(`http://localhost:3001/en${pageConfig.path}`, {
            waitUntil: "domcontentloaded",
          });

          // Wait for header to be visible
          await page.waitForSelector("header", { timeout: 10000 });

          // Take screenshot of header area
          const header = page.locator("header").first();
          await header.screenshot({
            path: `test-results/header-audit/${pageConfig.name
              .toLowerCase()
              .replace(/\s+/g, "-")}-${viewport.name}.png`,
            animations: "disabled",
          });

          // Analyze header consistency
          const headerAnalysis = await page.evaluate(() => {
            const header = document.querySelector("header");
            if (!header) return null;

            const rect = header.getBoundingClientRect();
            return {
              height: rect.height,
              width: rect.width,
              hasLogo: !!header.querySelector('img[alt*="Logo"]'),
              hasBreadcrumbs: !!header.querySelector('a[href="/dashboard"]'),
              hasBackButton: !!header.querySelector('[aria-label*="Back"]'),
              hasOverflow: header.scrollWidth > header.clientWidth,
              backgroundColor: window.getComputedStyle(header).backgroundColor,
            };
          });

          console.log(
            `${pageConfig.name} ${viewport.name} analysis:`,
            headerAnalysis
          );
        } catch (error) {
          console.error(
            `${pageConfig.name} ${viewport.name} failed:`,
            (error as Error).message
          );
        }
      }
    }
  });

  test("Theme consistency check", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    // Test light theme
    await page.goto("http://localhost:3001/en", {
      waitUntil: "domcontentloaded",
    });
    await page.waitForSelector("nav", { timeout: 10000 });

    const nav = page.locator("nav").first();
    await nav.screenshot({
      path: "test-results/header-audit/theme-light.png",
      animations: "disabled",
    });

    // Test dark theme toggle
    const themeToggle = page.locator('[aria-label*="Switch to dark mode"]');
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(1000); // Wait for theme transition

      await nav.screenshot({
        path: "test-results/header-audit/theme-dark.png",
        animations: "disabled",
      });

      // Verify dark theme is applied
      const isDarkMode = await page.evaluate(() => {
        return document.documentElement.classList.contains("dark");
      });

      console.log("Dark theme applied:", isDarkMode);
    }
  });

  test("Language switcher functionality", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    const locales = ["en", "it", "cs", "ru"];

    for (const locale of locales) {
      await page.goto(`/${locale}`, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector("nav", { timeout: 10000 });

      // Take screenshot of header with different locale
      const nav = page.locator("nav").first();
      await nav.screenshot({
        path: `test-results/header-audit/locale-${locale}.png`,
        animations: "disabled",
      });

      // Check language switcher
      const languageSwitcher = page.locator(
        '[aria-label*="Language and region settings"]'
      );
      if (await languageSwitcher.isVisible()) {
        const switcherText = await languageSwitcher.textContent();
        console.log(`Locale ${locale} switcher text:`, switcherText?.trim());
      }
    }
  });
});
