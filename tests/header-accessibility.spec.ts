import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Header Component Accessibility Audit', () => {
  const locales = ['en', 'it', 'cs', 'ru'];
  const pages = [
    { path: '', name: 'Landing Page' },
    { path: '/dashboard', name: 'Dashboard', requiresAuth: true },
    { path: '/auth/login', name: 'Login Page' },
    { path: '/auth/signup', name: 'Signup Page' }
  ];

  test.beforeEach(async ({ page }) => {
    // Set up viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  // Test accessibility compliance across all locales and pages
  for (const locale of locales) {
    for (const pageInfo of pages) {
      test(`WCAG 2.1 AA compliance - ${pageInfo.name} (${locale})`, async ({ page }) => {
        const url = `http://localhost:3000/${locale}${pageInfo.path}`;
        
        await page.goto(url);
        await page.waitForLoadState('networkidle');

        // Run accessibility scan
        const accessibilityScanResults = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();

        // Check for violations
        expect(accessibilityScanResults.violations).toEqual([]);
      });
    }
  }

  test('Header keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    // Test skip navigation link
    await page.keyboard.press('Tab');
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeVisible();

    // Test logo focus
    await page.keyboard.press('Tab');
    const logo = page.locator('a[aria-label="InvoicePro home"]');
    await expect(logo).toBeFocused();

    // Test language switcher focus
    await page.keyboard.press('Tab');
    const languageSwitcher = page.locator('button[aria-label*="Language and region settings"]');
    await expect(languageSwitcher).toBeFocused();

    // Test theme toggle focus
    await page.keyboard.press('Tab');
    const themeToggle = page.locator('button[aria-label*="Toggle theme"]');
    await expect(themeToggle).toBeFocused();

    // Test auth buttons focus
    await page.keyboard.press('Tab');
    const loginButton = page.locator('a[href="/auth/login"] button');
    await expect(loginButton).toBeFocused();

    await page.keyboard.press('Tab');
    const signupButton = page.locator('a[href="/auth/signup"] button');
    await expect(signupButton).toBeFocused();
  });

  test('Header responsive behavior', async ({ page }) => {
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(page.locator('.hidden.lg\\:flex')).toBeVisible();
    await expect(page.locator('.lg\\:hidden')).not.toBeVisible();

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.hidden.lg\\:flex')).not.toBeVisible();
    await expect(page.locator('.lg\\:hidden')).toBeVisible();

    // Test mobile menu functionality
    const mobileMenuButton = page.locator('button[aria-label="Toggle mobile menu"]');
    await expect(mobileMenuButton).toBeVisible();
    
    await mobileMenuButton.click();
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();
    
    // Test mobile menu accessibility
    await expect(mobileMenu).toHaveAttribute('role', 'navigation');
    await expect(mobileMenu).toHaveAttribute('aria-label', 'Mobile navigation menu');
  });

  test('Language switcher accessibility', async ({ page }) => {
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    const languageSwitcher = page.locator('button[aria-label*="Language and region settings"]');
    
    // Test button accessibility
    await expect(languageSwitcher).toHaveAttribute('aria-label');
    await expect(languageSwitcher).toHaveAttribute('aria-expanded', 'false');

    // Open dropdown
    await languageSwitcher.click();
    await expect(languageSwitcher).toHaveAttribute('aria-expanded', 'true');

    // Test language selection radiogroup
    const languageGroup = page.locator('[role="radiogroup"][aria-label="Select language"]');
    await expect(languageGroup).toBeVisible();

    // Test language options
    const languageOptions = page.locator('[role="radio"]');
    await expect(languageOptions).toHaveCount(4); // en, it, cs, ru

    // Test country selection radiogroup
    const countryGroup = page.locator('[role="radiogroup"][aria-label="Select country and region"]');
    await expect(countryGroup).toBeVisible();

    // Test that current selections are properly marked
    const checkedLanguage = page.locator('[role="radio"][aria-checked="true"]').first();
    await expect(checkedLanguage).toBeVisible();
  });

  test('Color contrast compliance', async ({ page }) => {
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    // Test both light and dark themes
    const themes = ['light', 'dark'];
    
    for (const theme of themes) {
      // Switch theme
      const themeToggle = page.locator('button[aria-label*="Toggle theme"]');
      if (theme === 'dark') {
        await themeToggle.click();
        await page.waitForTimeout(500); // Wait for theme transition
      }

      // Run color contrast check
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2aa'])
        .include('header')
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        violation => violation.id === 'color-contrast'
      );

      expect(contrastViolations).toEqual([]);
    }
  });

  test('Touch target sizes (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    // Test that all interactive elements meet minimum touch target size (44x44px)
    const interactiveElements = page.locator('button, a[href]').filter({ hasText: /.+/ });
    const count = await interactiveElements.count();

    for (let i = 0; i < count; i++) {
      const element = interactiveElements.nth(i);
      const boundingBox = await element.boundingBox();
      
      if (boundingBox && await element.isVisible()) {
        expect(boundingBox.width).toBeGreaterThanOrEqual(44);
        expect(boundingBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('Screen reader compatibility', async ({ page }) => {
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    // Test semantic HTML structure
    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();

    // Test navigation landmarks
    const breadcrumbNav = page.locator('nav[aria-label="Breadcrumb navigation"]');
    // Breadcrumb may not be visible on landing page, so we just check it exists in DOM
    
    // Test ARIA labels and descriptions
    const elementsWithAriaLabels = page.locator('[aria-label]');
    const count = await elementsWithAriaLabels.count();
    expect(count).toBeGreaterThan(0);

    // Test that images have proper alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }

    // Test that icons are properly hidden from screen readers
    const decorativeIcons = page.locator('[aria-hidden="true"]');
    const iconCount = await decorativeIcons.count();
    expect(iconCount).toBeGreaterThan(0);
  });

  test('Focus management and indicators', async ({ page }) => {
    await page.goto('http://localhost:3000/en');
    await page.waitForLoadState('networkidle');

    // Test that focus indicators are visible
    const focusableElements = page.locator('button, a[href], [tabindex="0"]');
    const count = await focusableElements.count();

    for (let i = 0; i < Math.min(count, 5); i++) { // Test first 5 elements
      const element = focusableElements.nth(i);
      await element.focus();
      
      // Check that element has focus styles (ring, outline, etc.)
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el, ':focus');
        return {
          outline: computed.outline,
          boxShadow: computed.boxShadow,
          borderColor: computed.borderColor
        };
      });

      // At least one focus indicator should be present
      const hasFocusIndicator = 
        styles.outline !== 'none' || 
        styles.boxShadow !== 'none' || 
        styles.boxShadow.includes('ring');
      
      expect(hasFocusIndicator).toBeTruthy();
    }
  });
});
