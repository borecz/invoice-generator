/**
 * Dashboard Infinite Loop Prevention Tests
 * 
 * This test suite verifies that the dashboard page does not experience
 * infinite loading states or render loops under any circumstances.
 */

import { test, expect } from '@playwright/test';

test.describe('Dashboard Infinite Loop Prevention', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication to access dashboard
    await page.goto('/en/auth/login');
    // Add authentication logic here when available
  });

  test('should not have infinite loading on initial load', async ({ page }) => {
    let requestCount = 0;
    const maxAllowedRequests = 5; // Allow reasonable number of initial requests
    
    // Monitor network requests
    page.on('request', (request) => {
      if (request.url().includes('/dashboard')) {
        requestCount++;
      }
    });

    // Navigate to dashboard
    await page.goto('/en/dashboard');
    
    // Wait for initial load
    await page.waitForTimeout(5000);
    
    // Verify no excessive requests
    expect(requestCount).toBeLessThanOrEqual(maxAllowedRequests);
    
    // Verify page is not stuck in loading state
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
  });

  test('should not have infinite loops when switching locales', async ({ page }) => {
    let requestCount = 0;
    const maxAllowedRequests = 10; // Allow for locale switching requests
    
    page.on('request', (request) => {
      if (request.url().includes('/dashboard')) {
        requestCount++;
      }
    });

    // Test locale switching
    const locales = ['en', 'it', 'cs', 'ru'];
    
    for (const locale of locales) {
      await page.goto(`/${locale}/dashboard`);
      await page.waitForTimeout(2000);
    }
    
    expect(requestCount).toBeLessThanOrEqual(maxAllowedRequests);
  });

  test('should handle API errors gracefully without infinite retries', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/**', (route) => {
      route.abort('failed');
    });

    await page.goto('/en/dashboard');
    
    // Should show error state, not infinite loading
    const errorMessage = page.locator('text=Failed to load dashboard data');
    await expect(errorMessage).toBeVisible({ timeout: 35000 }); // Account for timeout
    
    // Should have retry button
    const retryButton = page.locator('button:has-text("Retry")');
    await expect(retryButton).toBeVisible();
  });

  test('should respect loading timeout', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 35000)); // Longer than timeout
      route.continue();
    });

    await page.goto('/en/dashboard');
    
    // Should show timeout error, not infinite loading
    const timeoutMessage = page.locator('text=Loading is taking longer than expected');
    await expect(timeoutMessage).toBeVisible({ timeout: 40000 });
  });

  test('should not trigger useEffect loops', async ({ page }) => {
    // Monitor console for useEffect warnings
    const consoleMessages: string[] = [];
    
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    await page.goto('/en/dashboard');
    await page.waitForTimeout(5000);
    
    // Check for excessive console logs that might indicate loops
    const dashboardLogs = consoleMessages.filter(msg => 
      msg.includes('Dashboard: Current locale')
    );
    
    // Should not have excessive locale change logs
    expect(dashboardLogs.length).toBeLessThanOrEqual(3);
  });

  test('should handle component unmounting properly', async ({ page }) => {
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Navigate away and back quickly to test cleanup
    await page.goto('/en');
    await page.goto('/en/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should not have memory leaks or hanging requests
    const errors = await page.evaluate(() => {
      return (window as any).errors || [];
    });
    
    expect(errors.length).toBe(0);
  });

  test('should have circuit breaker for failed API calls', async ({ page }) => {
    let apiCallCount = 0;
    
    // Mock API to fail consistently
    await page.route('**/api/**', (route) => {
      apiCallCount++;
      route.abort('failed');
    });

    await page.goto('/en/dashboard');
    await page.waitForTimeout(10000);
    
    // Should not exceed maximum retry attempts
    expect(apiCallCount).toBeLessThanOrEqual(3); // MAX_FETCH_ATTEMPTS
  });
});

test.describe('Dashboard Performance', () => {
  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/en/dashboard');
    await page.waitForSelector('h1:has-text("Welcome")', { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
  });

  test('should not have excessive re-renders', async ({ page }) => {
    let renderCount = 0;
    
    // Monitor for render indicators
    await page.addInitScript(() => {
      const originalLog = console.log;
      (window as any).renderCount = 0;
      console.log = (...args) => {
        if (args[0]?.includes?.('Dashboard: Current locale')) {
          (window as any).renderCount++;
        }
        originalLog.apply(console, args);
      };
    });

    await page.goto('/en/dashboard');
    await page.waitForTimeout(3000);
    
    renderCount = await page.evaluate(() => (window as any).renderCount || 0);
    expect(renderCount).toBeLessThanOrEqual(2); // Initial render + potential locale update
  });
});
