/**
 * ARIA Snapshot Utilities for Playwright Testing
 * 
 * This module provides utilities for using Playwright's ARIA snapshot feature
 * for fast and precise UI state validation. ARIA snapshots provide a semantic
 * representation of the page structure that is more reliable than visual or
 * DOM-based assertions.
 * 
 * @see https://playwright.dev/docs/aria-snapshots
 */

import { Page, Locator, expect } from "@playwright/test";

/**
 * Options for ARIA snapshot operations
 */
export interface AriaSnapshotOptions {
  /** Whether to include hidden elements in the snapshot */
  includeHidden?: boolean;
  /** Custom timeout for the snapshot operation */
  timeout?: number;
  /** Whether to use soft assertions (won't fail the test immediately) */
  useSoftAssertions?: boolean;
}

/**
 * Take an ARIA snapshot of the entire page
 */
export async function takePageAriaSnapshot(
  page: Page,
  options: AriaSnapshotOptions = {}
): Promise<string> {
  const { timeout = 5000 } = options;
  
  try {
    // Wait for the page to be stable
    await page.waitForLoadState("networkidle", { timeout });
    
    // Take the ARIA snapshot
    const snapshot = await page.locator("body").ariaSnapshot();
    return snapshot;
  } catch (error) {
    console.error("Failed to take ARIA snapshot:", error);
    throw error;
  }
}

/**
 * Take an ARIA snapshot of a specific element
 */
export async function takeElementAriaSnapshot(
  locator: Locator,
  options: AriaSnapshotOptions = {}
): Promise<string> {
  const { timeout = 5000 } = options;
  
  try {
    // Wait for the element to be visible
    await locator.waitFor({ state: "visible", timeout });
    
    // Take the ARIA snapshot
    const snapshot = await locator.ariaSnapshot();
    return snapshot;
  } catch (error) {
    console.error("Failed to take element ARIA snapshot:", error);
    throw error;
  }
}

/**
 * Assert that the page matches an expected ARIA snapshot
 */
export async function expectPageAriaSnapshot(
  page: Page,
  expectedSnapshot: string,
  options: AriaSnapshotOptions = {}
): Promise<void> {
  const { useSoftAssertions = false } = options;
  
  const actualSnapshot = await takePageAriaSnapshot(page, options);
  
  if (useSoftAssertions) {
    await expect.soft(actualSnapshot).toBe(expectedSnapshot);
  } else {
    await expect(actualSnapshot).toBe(expectedSnapshot);
  }
}

/**
 * Assert that an element matches an expected ARIA snapshot
 */
export async function expectElementAriaSnapshot(
  locator: Locator,
  expectedSnapshot: string,
  options: AriaSnapshotOptions = {}
): Promise<void> {
  const { useSoftAssertions = false } = options;
  
  const actualSnapshot = await takeElementAriaSnapshot(locator, options);
  
  if (useSoftAssertions) {
    await expect.soft(actualSnapshot).toBe(expectedSnapshot);
  } else {
    await expect(actualSnapshot).toBe(expectedSnapshot);
  }
}

/**
 * Validate common UI patterns using ARIA snapshots
 */
export class AriaPatternValidator {
  constructor(private page: Page) {}

  /**
   * Validate navigation structure
   */
  async validateNavigation(expectedPattern: string): Promise<void> {
    const nav = this.page.locator("nav").first();
    await expectElementAriaSnapshot(nav, expectedPattern);
  }

  /**
   * Validate form structure
   */
  async validateForm(formLocator: Locator, expectedPattern: string): Promise<void> {
    await expectElementAriaSnapshot(formLocator, expectedPattern);
  }

  /**
   * Validate button states and accessibility
   */
  async validateButton(buttonLocator: Locator, expectedPattern: string): Promise<void> {
    await expectElementAriaSnapshot(buttonLocator, expectedPattern);
  }

  /**
   * Validate modal/dialog structure
   */
  async validateModal(modalLocator: Locator, expectedPattern: string): Promise<void> {
    await expectElementAriaSnapshot(modalLocator, expectedPattern);
  }

  /**
   * Validate table structure and accessibility
   */
  async validateTable(tableLocator: Locator, expectedPattern: string): Promise<void> {
    await expectElementAriaSnapshot(tableLocator, expectedPattern);
  }
}

/**
 * Common ARIA snapshot patterns for reuse across tests
 */
export const CommonAriaPatterns = {
  // Authentication forms
  LOGIN_FORM: `
    form:
      textbox "Email" (required)
      textbox "Password" (required)
      button "Login"
  `,
  
  SIGNUP_FORM: `
    form:
      textbox "Email" (required)
      textbox "Password" (required)
      button "Sign Up"
  `,

  // Navigation patterns
  MAIN_NAVIGATION: `
    navigation:
      link "Home"
      link "Dashboard"
      link "Customers"
      link "Invoices"
      link "Settings"
  `,

  // Button states
  ENABLED_BUTTON: `button "Submit"`,
  DISABLED_BUTTON: `button "Submit" (disabled)`,
  LOADING_BUTTON: `button "Loading..." (disabled)`,

  // Form validation
  FORM_WITH_ERROR: `
    form:
      textbox "Email" (required, invalid)
      text "Please enter a valid email address"
      button "Submit"
  `,

  // Modal patterns
  CONFIRMATION_MODAL: `
    dialog "Confirm Action":
      heading "Are you sure?"
      text "This action cannot be undone."
      button "Cancel"
      button "Confirm"
  `,
};

/**
 * Helper function to normalize ARIA snapshots for comparison
 * Removes extra whitespace and normalizes formatting
 */
export function normalizeAriaSnapshot(snapshot: string): string {
  return snapshot
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

/**
 * Debug helper to log ARIA snapshots
 */
export async function debugAriaSnapshot(
  page: Page,
  label: string = "ARIA Snapshot"
): Promise<void> {
  try {
    const snapshot = await takePageAriaSnapshot(page);
    console.log(`\n=== ${label} ===`);
    console.log(snapshot);
    console.log(`=== End ${label} ===\n`);
  } catch (error) {
    console.error(`Failed to debug ARIA snapshot for ${label}:`, error);
  }
}
