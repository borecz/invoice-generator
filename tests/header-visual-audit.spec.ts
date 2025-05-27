import { test, expect } from "@playwright/test";

test.describe("Header Visual Audit - Comprehensive UI/UX Analysis", () => {
  const locales = ["en", "it", "cs", "ru"];
  const viewports = [
    { name: "mobile", width: 320, height: 568 },
    { name: "mobile-large", width: 414, height: 896 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1024, height: 768 },
    { name: "desktop-large", width: 1440, height: 900 },
    { name: "desktop-xl", width: 1920, height: 1080 },
  ];

  const pages = [
    {
      path: "",
      name: "Landing Page",
      hasSharedHeader: false,
      description: "Custom navigation with theme toggle and language switcher",
    },
    {
      path: "/dashboard",
      name: "Dashboard",
      hasSharedHeader: true,
      requiresAuth: true,
      description: "Full header with quick actions, breadcrumbs, and user menu",
    },
    {
      path: "/new",
      name: "Invoice Creation",
      hasSharedHeader: false,
      requiresAuth: true,
      description: "Custom header with breadcrumb navigation",
    },
    {
      path: "/customers",
      name: "Customer Management",
      hasSharedHeader: false,
      requiresAuth: true,
      description: "Custom header with breadcrumb navigation",
    },
    {
      path: "/settings",
      name: "Settings",
      hasSharedHeader: false,
      requiresAuth: true,
      description: "Custom header with back navigation",
    },
    {
      path: "/auth/login",
      name: "Login Page",
      hasSharedHeader: false,
      description: "Minimal header with branding only",
    },
    {
      path: "/auth/signup",
      name: "Signup Page",
      hasSharedHeader: false,
      description: "Minimal header with branding only",
    },
  ];

  // Mock authentication for protected pages
  test.beforeEach(async ({ page }) => {
    // Mock user session for protected pages
    await page.addInitScript(() => {
      // Mock localStorage auth state
      localStorage.setItem(
        "mockUser",
        JSON.stringify({
          email: "test@example.com",
          authenticated: true,
        })
      );
    });
  });

  test("Visual audit - Header consistency across all pages and viewports", async ({
    page,
  }) => {
    const auditResults: any[] = [];

    for (const locale of locales) {
      for (const viewport of viewports) {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        for (const pageConfig of pages) {
          const url = `http://localhost:3001/${locale}${pageConfig.path}`;

          try {
            await page.goto(url, { waitUntil: "networkidle", timeout: 10000 });

            // Wait for header to be visible
            await page.waitForSelector("header, nav", { timeout: 5000 });

            // Take screenshot of header area only
            const headerElement = await page.locator("header, nav").first();

            if (await headerElement.isVisible()) {
              const screenshotPath = `test-results/header-audit/${locale}/${
                viewport.name
              }/${pageConfig.name
                .toLowerCase()
                .replace(/\s+/g, "-")}-header.png`;

              await headerElement.screenshot({
                path: screenshotPath,
                animations: "disabled",
              });

              // Analyze header elements
              const headerAnalysis = await page.evaluate(() => {
                const header = document.querySelector("header, nav");
                if (!header) return null;

                const rect = header.getBoundingClientRect();
                const elements = {
                  logo: !!header.querySelector(
                    'img[alt*="Logo"], img[alt*="InvoicePro"]'
                  ),
                  navigation: !!header.querySelector(
                    'nav, [role="navigation"]'
                  ),
                  userMenu: !!header.querySelector(
                    '[aria-label*="User menu"], [aria-label*="account"]'
                  ),
                  themeToggle: !!header.querySelector(
                    '[aria-label*="theme"], [aria-label*="Toggle"]'
                  ),
                  languageSwitcher: !!header.querySelector(
                    '[aria-label*="Language"], [aria-label*="region"]'
                  ),
                  mobileMenu: !!header.querySelector(
                    '[aria-label*="mobile menu"], [aria-label*="Toggle mobile"]'
                  ),
                  breadcrumbs: !!header.querySelector(
                    '[aria-label*="Breadcrumb"], nav[aria-label*="breadcrumb"]'
                  ),
                  quickActions: !!header.querySelector(
                    '[aria-label*="Create"], [aria-label*="new invoice"]'
                  ),
                };

                return {
                  height: rect.height,
                  width: rect.width,
                  elements,
                  hasOverflow: header.scrollWidth > header.clientWidth,
                  zIndex: window.getComputedStyle(header).zIndex,
                };
              });

              auditResults.push({
                locale,
                viewport: viewport.name,
                page: pageConfig.name,
                hasSharedHeader: pageConfig.hasSharedHeader,
                screenshotPath,
                analysis: headerAnalysis,
                url,
              });
            }
          } catch (error) {
            console.error(
              `Failed to audit ${pageConfig.name} at ${viewport.name} for ${locale}:`,
              error
            );
          }
        }
      }
    }

    // Generate audit report
    const report = generateAuditReport(auditResults);
    console.log("Header Visual Audit Report:", JSON.stringify(report, null, 2));

    // Basic assertions to ensure audit completed
    expect(auditResults.length).toBeGreaterThan(0);
  });

  test("Mobile responsiveness - Header element stacking and overflow", async ({
    page,
  }) => {
    const mobileViewports = [
      { width: 320, height: 568 },
      { width: 375, height: 667 },
      { width: 414, height: 896 },
    ];

    for (const viewport of mobileViewports) {
      await page.setViewportSize(viewport);

      // Test landing page mobile header
      await page.goto("http://localhost:3001/en");
      await page.waitForLoadState("networkidle");

      // Check for horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        const header = document.querySelector("header, nav");
        return header ? header.scrollWidth > header.clientWidth : false;
      });

      expect(hasOverflow).toBeFalsy();

      // Check mobile menu functionality
      const mobileMenuButton = page.locator(
        '[aria-label*="mobile menu"], [aria-label*="Toggle mobile"]'
      );
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(
          page.locator('[role="navigation"][aria-label*="mobile"]')
        ).toBeVisible();
        await mobileMenuButton.click(); // Close menu
      }
    }
  });

  test("Theme consistency - Light and dark mode header appearance", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });

    for (const theme of ["light", "dark"]) {
      // Set theme
      await page.goto("http://localhost:3001/en");
      await page.waitForLoadState("networkidle");

      if (theme === "dark") {
        const themeToggle = page.locator(
          '[aria-label*="theme"], [aria-label*="Toggle"]'
        );
        if (await themeToggle.isVisible()) {
          await themeToggle.click();
          await page.waitForTimeout(500); // Wait for theme transition
        }
      }

      // Take screenshot of header in current theme
      const header = page.locator("header, nav").first();
      await header.screenshot({
        path: `test-results/header-audit/theme-${theme}-header.png`,
        animations: "disabled",
      });

      // Verify theme classes are applied
      const hasThemeClass = await page.evaluate((currentTheme) => {
        return document.documentElement.classList.contains(currentTheme);
      }, theme);

      expect(hasThemeClass).toBeTruthy();
    }
  });

  function generateAuditReport(results: any[]) {
    const issues: any[] = [];
    const recommendations: any[] = [];

    // Analyze consistency across pages
    const sharedHeaderPages = results.filter((r) => r.hasSharedHeader);
    const customHeaderPages = results.filter((r) => !r.hasSharedHeader);

    // Check for inconsistent header heights
    const heights = results.map((r) => r.analysis?.height).filter(Boolean);
    const uniqueHeights = [...new Set(heights)];

    if (uniqueHeights.length > 3) {
      issues.push({
        type: "inconsistent-heights",
        description: "Header heights vary significantly across pages",
        heights: uniqueHeights,
      });
    }

    // Check for missing elements
    results.forEach((result) => {
      if (!result.analysis?.elements.logo) {
        issues.push({
          type: "missing-logo",
          page: result.page,
          viewport: result.viewport,
          locale: result.locale,
        });
      }
    });

    return {
      summary: {
        totalPages: pages.length,
        totalViewports: viewports.length,
        totalLocales: locales.length,
        issuesFound: issues.length,
      },
      issues,
      recommendations: [
        "Standardize header heights across all pages",
        "Implement consistent spacing and padding",
        "Ensure all pages use the shared Header component where appropriate",
        "Add proper mobile menu implementation for all custom headers",
        "Verify theme consistency across all header implementations",
      ],
    };
  }
});
