import { test, expect } from '@playwright/test';

test('should navigate to the home page and see title', async ({ page }) => {
  await page.goto('/');
  // The heading is a bit complex with spans, so we target a more specific element
  // that contains the unique text.
  // We look for a text block that contains "Get Paid Faster with Free Invoice Generator"
  // This can be made more specific if needed, e.g. by targeting the h1 and checking its text content.
  await expect(page.locator('h1', { hasText: 'Get Paid Faster with Free Invoice Generator' })).toBeVisible();
  
  // A more robust way might be to check for the parts:
  await expect(page.locator('h1')).toContainText('Get Paid Faster with Free');
  await expect(page.locator('h1').locator('span.text-transparent')).toContainText('Invoice Generator');
});
