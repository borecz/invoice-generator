import { test, expect } from '@playwright/test';

test.describe('Header Visual Regression Tests', () => {
  const locales = ['en', 'it', 'cs', 'ru'];
  const viewports = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1280, height: 720, name: 'desktop' },
    { width: 1920, height: 1080, name: 'desktop-large' }
  ];

  test.beforeEach(async ({ page }) => {
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });

  // Test header appearance across different locales and viewports
  for (const locale of locales) {
    for (const viewport of viewports) {
      test(`Header appearance - ${locale} - ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(`http://localhost:3000/${locale}`);
        await page.waitForLoadState('networkidle');

        // Wait for fonts to load
        await page.waitForFunction(() => document.fonts.ready);

        // Take screenshot of header only
        const header = page.locator('header[role="banner"]');
        await expect(header).toHaveScreenshot(`header-${locale}-${viewport.name}.png`);
      });
    }
  }

  test('Header with mobile menu open', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    // Open mobile menu
    const mobileMenuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    await mobileMenuButton.click();

    // Wait for menu animation to complete
    await page.waitForTimeout(300);

    // Take screenshot of header with mobile menu
    const headerWithMenu = page.locator('header[role="banner"]');
    await expect(headerWithMenu).toHaveScreenshot('header-mobile-menu-open.png');
  });

  test('Language switcher dropdown appearance', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    // Open language switcher
    const languageSwitcher = page.locator('button[aria-label*="Language and region settings"]');
    await languageSwitcher.click();

    // Wait for dropdown animation
    await page.waitForTimeout(200);

    // Take screenshot of dropdown
    const dropdown = page.locator('[role="dialog"], .dropdown-content').last();
    await expect(dropdown).toHaveScreenshot('language-switcher-dropdown.png');
  });

  test('Header with user menu (authenticated state)', async ({ page }) => {
    // Mock authenticated state
    await page.goto('http://localhost:3000/en');
    
    // Add mock user data to localStorage or session
    await page.evaluate(() => {
      // Mock authentication state
      localStorage.setItem('mockUser', JSON.stringify({
        email: 'test@example.com',
        authenticated: true
      }));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Take screenshot with user menu visible
    const header = page.locator('header[role="banner"]');
    await expect(header).toHaveScreenshot('header-authenticated.png');
  });

  test('Header theme variations', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    // Test light theme
    const header = page.locator('header[role="banner"]');
    await expect(header).toHaveScreenshot('header-light-theme.png');

    // Switch to dark theme
    const themeToggle = page.locator('button[aria-label*="Toggle theme"]');
    await themeToggle.click();
    await page.waitForTimeout(500); // Wait for theme transition

    // Test dark theme
    await expect(header).toHaveScreenshot('header-dark-theme.png');
  });

  test('Header with notifications badge', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Mock authenticated state with notifications
    await page.goto('http://localhost:3000/en');
    await page.evaluate(() => {
      localStorage.setItem('mockUser', JSON.stringify({
        email: 'test@example.com',
        authenticated: true,
        notifications: 5
      }));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Take screenshot with notification badge
    const header = page.locator('header[role="banner"]');
    await expect(header).toHaveScreenshot('header-with-notifications.png');
  });

  test('Header with breadcrumbs', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Navigate to a page that would have breadcrumbs (mock dashboard)
    await page.goto('http://localhost:3000/en');
    
    // Mock breadcrumb data
    await page.evaluate(() => {
      // Add breadcrumb elements to test visual appearance
      const header = document.querySelector('header');
      if (header) {
        const breadcrumbNav = document.createElement('nav');
        breadcrumbNav.setAttribute('aria-label', 'Breadcrumb navigation');
        breadcrumbNav.className = 'hidden md:flex items-center space-x-2 text-sm text-muted-foreground min-w-0';
        breadcrumbNav.innerHTML = `
          <span aria-hidden="true">/</span>
          <a href="/dashboard" class="hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1 truncate">Dashboard</a>
          <span aria-hidden="true">/</span>
          <span class="truncate" aria-current="page">Invoices</span>
        `;
        
        const logoContainer = header.querySelector('.flex.items-center.space-x-3');
        if (logoContainer) {
          logoContainer.appendChild(breadcrumbNav);
        }
      }
    });

    await page.waitForTimeout(100);

    // Take screenshot with breadcrumbs
    const header = page.locator('header[role="banner"]');
    await expect(header).toHaveScreenshot('header-with-breadcrumbs.png');
  });

  test('Header quick actions visibility', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Mock authenticated state with quick actions
    await page.goto('http://localhost:3000/en');
    await page.evaluate(() => {
      localStorage.setItem('mockUser', JSON.stringify({
        email: 'test@example.com',
        authenticated: true,
        showQuickActions: true
      }));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Take screenshot with quick actions visible
    const header = page.locator('header[role="banner"]');
    await expect(header).toHaveScreenshot('header-with-quick-actions.png');
  });

  test('Header text overflow handling', async ({ page }) => {
    // Test with very long email address
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/en');
    
    await page.evaluate(() => {
      localStorage.setItem('mockUser', JSON.stringify({
        email: 'very.long.email.address.that.might.overflow@example-domain.com',
        authenticated: true
      }));
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // Open mobile menu to see user info
    const mobileMenuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    await mobileMenuButton.click();
    await page.waitForTimeout(300);

    // Take screenshot to verify text truncation
    const headerWithMenu = page.locator('header[role="banner"]');
    await expect(headerWithMenu).toHaveScreenshot('header-text-overflow-mobile.png');
  });

  test('Header spacing consistency', async ({ page }) => {
    const testViewports = [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 }
    ];

    for (const viewport of testViewports) {
      await page.setViewportSize(viewport);
      await page.goto('http://localhost:3000/en');
      await page.waitForLoadState('networkidle');

      // Measure spacing between elements
      const spacingData = await page.evaluate(() => {
        const header = document.querySelector('header[role="banner"]');
        if (!header) return null;

        const leftSection = header.querySelector('.flex.items-center.space-x-3');
        const rightSection = header.querySelector('.flex.items-center.space-x-3');
        
        if (!leftSection || !rightSection) return null;

        const leftRect = leftSection.getBoundingClientRect();
        const rightRect = rightSection.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();

        return {
          headerHeight: headerRect.height,
          leftMargin: leftRect.left - headerRect.left,
          rightMargin: headerRect.right - rightRect.right,
          spaceBetween: rightRect.left - leftRect.right
        };
      });

      // Verify consistent spacing
      if (spacingData) {
        expect(spacingData.headerHeight).toBeGreaterThanOrEqual(64); // Minimum header height
        expect(spacingData.leftMargin).toBeGreaterThanOrEqual(16); // Minimum left padding
        expect(spacingData.rightMargin).toBeGreaterThanOrEqual(16); // Minimum right padding
      }
    }
  });
});
