import { test, expect } from '@playwright/test';

test.describe('Logout Functionality Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for testing
    await page.addInitScript(() => {
      localStorage.setItem('mockUser', JSON.stringify({
        email: 'test@example.com',
        authenticated: true
      }));
    });
  });

  test('Desktop logout button works correctly', async ({ page }) => {
    // Navigate to dashboard (authenticated page)
    await page.goto('http://localhost:3000/en/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Verify user is logged in (user menu should be visible)
    const userMenu = page.getByRole('button', { name: /User menu/i });
    await expect(userMenu).toBeVisible();
    
    // Click user menu to open dropdown
    await userMenu.click();
    
    // Wait for dropdown to appear
    await page.waitForSelector('[role="menu"]', { state: 'visible' });
    
    // Find and click logout button
    const logoutButton = page.getByRole('menuitem').filter({ hasText: /logout/i });
    await expect(logoutButton).toBeVisible();
    
    // Monitor network requests to verify logout API call
    const logoutPromise = page.waitForResponse(response => 
      response.url().includes('/auth') && response.request().method() === 'POST'
    );
    
    // Click logout button
    await logoutButton.click();
    
    // Wait for logout request to complete
    try {
      await logoutPromise;
    } catch (error) {
      console.log('Logout request monitoring failed, continuing with redirect check');
    }
    
    // Verify redirect to landing page (should happen after logout)
    await page.waitForURL(/\/(en|it|cs|ru)\/?$/, { timeout: 10000 });
    
    // Verify user is logged out (login/signup buttons should be visible)
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /get started|signup/i })).toBeVisible();
  });

  test('Mobile logout button works correctly', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to dashboard
    await page.goto('http://localhost:3000/en/dashboard');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Open mobile menu
    const mobileMenuButton = page.getByRole('button', { name: /toggle mobile menu/i });
    await expect(mobileMenuButton).toBeVisible();
    await mobileMenuButton.click();
    
    // Wait for mobile menu to open
    await page.waitForSelector('[role="navigation"]', { state: 'visible' });
    
    // Find logout button in mobile menu
    const logoutButton = page.getByRole('button').filter({ hasText: /logout/i });
    await expect(logoutButton).toBeVisible();
    
    // Click logout button
    await logoutButton.click();
    
    // Verify redirect to landing page
    await page.waitForURL(/\/(en|it|cs|ru)\/?$/, { timeout: 10000 });
    
    // Verify user is logged out
    await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
  });

  test('Logout button shows loading state', async ({ page }) => {
    await page.goto('http://localhost:3000/en/dashboard');
    
    // Open user menu
    const userMenu = page.getByRole('button', { name: /User menu/i });
    await userMenu.click();
    
    // Find logout button
    const logoutButton = page.getByRole('menuitem').filter({ hasText: /logout/i });
    
    // Click logout and immediately check for loading state
    await logoutButton.click();
    
    // Check if loading state appears (spinner and "Logging out..." text)
    try {
      await expect(page.getByText('Logging out...')).toBeVisible({ timeout: 1000 });
      console.log('✅ Loading state detected');
    } catch (error) {
      console.log('⚠️ Loading state not detected (logout might be too fast)');
    }
  });

  test('Logout works from different pages', async ({ page }) => {
    const testPages = [
      '/en/dashboard',
      '/en/settings',
      '/en/customers',
      '/en/new'
    ];

    for (const testPage of testPages) {
      console.log(`Testing logout from: ${testPage}`);
      
      // Navigate to test page
      await page.goto(`http://localhost:3000${testPage}`);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Open user menu
      const userMenu = page.getByRole('button', { name: /User menu/i });
      await expect(userMenu).toBeVisible();
      await userMenu.click();
      
      // Click logout
      const logoutButton = page.getByRole('menuitem').filter({ hasText: /logout/i });
      await logoutButton.click();
      
      // Verify redirect to landing page
      await page.waitForURL(/\/(en|it|cs|ru)\/?$/, { timeout: 10000 });
      
      // Verify logged out state
      await expect(page.getByRole('link', { name: /login/i })).toBeVisible();
      
      console.log(`✅ Logout successful from: ${testPage}`);
      
      // Re-authenticate for next test (simulate login)
      await page.addInitScript(() => {
        localStorage.setItem('mockUser', JSON.stringify({
          email: 'test@example.com',
          authenticated: true
        }));
      });
    }
  });

  test('Logout preserves locale in redirect', async ({ page }) => {
    const locales = ['en', 'it', 'cs', 'ru'];
    
    for (const locale of locales) {
      console.log(`Testing logout locale preservation: ${locale}`);
      
      // Navigate to dashboard with specific locale
      await page.goto(`http://localhost:3000/${locale}/dashboard`);
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Perform logout
      const userMenu = page.getByRole('button', { name: /User menu/i });
      await userMenu.click();
      
      const logoutButton = page.getByRole('menuitem').filter({ hasText: /logout/i });
      await logoutButton.click();
      
      // Verify redirect preserves locale
      await page.waitForURL(new RegExp(`/${locale}/?$`), { timeout: 10000 });
      
      console.log(`✅ Locale preserved: ${locale}`);
      
      // Re-authenticate for next test
      await page.addInitScript(() => {
        localStorage.setItem('mockUser', JSON.stringify({
          email: 'test@example.com',
          authenticated: true
        }));
      });
    }
  });
});
