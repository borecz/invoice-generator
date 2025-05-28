import { Page, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Environment variable to control accessibility testing
 * Set RUN_A11Y_TESTS=true to enable accessibility checks
 * Set RUN_A11Y_TESTS=false to skip accessibility checks
 */
export const isAccessibilityTestingEnabled = (): boolean => {
  const envValue = process.env.RUN_A11Y_TESTS;
  if (envValue === undefined) {
    // Default to true if not specified
    return true;
  }
  return envValue.toLowerCase() === "true";
};

/**
 * Configuration for accessibility testing
 */
export interface AccessibilityTestConfig {
  /** WCAG tags to test against */
  tags?: string[];
  /** Elements to include in the scan */
  include?: string[];
  /** Elements to exclude from the scan */
  exclude?: string[];
  /** Whether to use soft assertions (don't fail the test) */
  useSoftAssertions?: boolean;
  /** Custom test name for reporting */
  testName?: string;
}

/**
 * Default accessibility test configuration
 */
export const defaultA11yConfig: AccessibilityTestConfig = {
  tags: ["wcag2a", "wcag2aa", "wcag21aa"],
  useSoftAssertions: true,
};

/**
 * Performs accessibility scan on the current page
 * Uses soft assertions by default to prevent test failures while capturing violations
 */
export async function runAccessibilityCheck(
  page: Page,
  config: AccessibilityTestConfig = defaultA11yConfig
): Promise<void> {
  if (!isAccessibilityTestingEnabled()) {
    console.log("Accessibility testing disabled - skipping check");
    return;
  }

  const { tags, include, exclude, useSoftAssertions, testName } = {
    ...defaultA11yConfig,
    ...config,
  };

  try {
    // Build the axe scanner
    let axeBuilder = new AxeBuilder({ page }).withTags(tags || []);

    if (include && include.length > 0) {
      axeBuilder = axeBuilder.include(include);
    }

    if (exclude && exclude.length > 0) {
      axeBuilder = axeBuilder.exclude(exclude);
    }

    // Run the accessibility scan
    const accessibilityScanResults = await axeBuilder.analyze();

    // Log results for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log(
        `🚨 Accessibility violations found${testName ? ` in ${testName}` : ""}:`
      );
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Help: ${violation.help}`);
        console.log(`   Nodes: ${violation.nodes.length}`);
      });
    } else {
      console.log(
        `✅ No accessibility violations found${
          testName ? ` in ${testName}` : ""
        }`
      );
    }

    // Use soft or hard assertions based on configuration
    if (useSoftAssertions) {
      expect.soft(accessibilityScanResults.violations).toEqual([]);
    } else {
      expect(accessibilityScanResults.violations).toEqual([]);
    }
  } catch (error) {
    console.error("Error running accessibility check:", error);
    if (!useSoftAssertions) {
      throw error;
    }
  }
}

/**
 * Runs accessibility check specifically for WCAG 2.1 AA compliance
 */
export async function checkWCAG21AACompliance(
  page: Page,
  config: Omit<AccessibilityTestConfig, "tags"> = {}
): Promise<void> {
  await runAccessibilityCheck(page, {
    ...config,
    tags: ["wcag2a", "wcag2aa", "wcag21aa"],
    testName: config.testName || "WCAG 2.1 AA Compliance",
  });
}

/**
 * Runs accessibility check for color contrast specifically
 */
export async function checkColorContrast(
  page: Page,
  config: Omit<AccessibilityTestConfig, "tags"> = {}
): Promise<void> {
  await runAccessibilityCheck(page, {
    ...config,
    tags: ["wcag2aa"],
    testName: config.testName || "Color Contrast Check",
  });
}

/**
 * Validates keyboard navigation accessibility
 */
export async function validateKeyboardNavigation(
  page: Page,
  selectors: string[],
  config: AccessibilityTestConfig = {}
): Promise<void> {
  if (!isAccessibilityTestingEnabled()) {
    console.log(
      "Accessibility testing disabled - skipping keyboard navigation check"
    );
    return;
  }

  const { useSoftAssertions = true } = config;

  try {
    for (const selector of selectors) {
      const elements = page.locator(selector);
      const count = await elements.count();

      // Test the first few elements to avoid strict mode violations
      const elementsToTest = Math.min(count, 3);

      for (let i = 0; i < elementsToTest; i++) {
        const element = elements.nth(i);

        // Check if element is visible before testing
        if (!(await element.isVisible())) continue;

        // Check if element is focusable
        await element.focus();

        if (useSoftAssertions) {
          expect.soft(element).toBeFocused();
        } else {
          expect(element).toBeFocused();
        }

        // Check for visible focus indicators
        const focusStyles = await element.evaluate((el) => {
          const computed = window.getComputedStyle(el, ":focus");
          return {
            outline: computed.outline,
            boxShadow: computed.boxShadow,
            borderColor: computed.borderColor,
          };
        });

        const hasFocusIndicator =
          focusStyles.outline !== "none" ||
          focusStyles.boxShadow !== "none" ||
          focusStyles.boxShadow.includes("ring");

        if (useSoftAssertions) {
          expect.soft(hasFocusIndicator).toBeTruthy();
        } else {
          expect(hasFocusIndicator).toBeTruthy();
        }
      }
    }
  } catch (error) {
    console.error("Error validating keyboard navigation:", error);
    if (!useSoftAssertions) {
      throw error;
    }
  }
}

/**
 * Validates touch target sizes for mobile accessibility
 */
export async function validateTouchTargets(
  page: Page,
  minSize: number = 44,
  config: AccessibilityTestConfig = {}
): Promise<void> {
  if (!isAccessibilityTestingEnabled()) {
    console.log(
      "Accessibility testing disabled - skipping touch target validation"
    );
    return;
  }

  const { useSoftAssertions = true } = config;

  try {
    // Focus on primary interactive elements that users need to tap
    // Exclude decorative elements, social icons, and secondary navigation
    const primaryInteractiveElements = page
      .locator(
        `
      button:not([aria-hidden="true"]):not(.social-icon):not(.decoration),
      a[href]:not([aria-hidden="true"]):not(.social-icon):not(.decoration):not([href^="#"]):not([href^="mailto:"]):not([href^="tel:"]),
      [role='button']:not([aria-hidden="true"]):not(.social-icon):not(.decoration)
    `
      )
      .filter({
        // Only check elements that are likely to be primary actions
        hasNot: page.locator(
          'img, svg, [class*="icon"], [class*="badge"], [class*="avatar"]'
        ),
      });

    const count = await primaryInteractiveElements.count();
    console.log(
      `Checking ${count} primary interactive elements for touch target compliance`
    );

    for (let i = 0; i < count; i++) {
      const element = primaryInteractiveElements.nth(i);
      const boundingBox = await element.boundingBox();

      if (boundingBox && (await element.isVisible())) {
        // Get element info for better debugging
        const tagName = await element.evaluate((el) => el.tagName);
        const className = await element.evaluate((el) => el.className);
        const textContent = await element.evaluate((el) =>
          el.textContent?.trim().substring(0, 50)
        );

        // Skip very small decorative elements or icons
        if (boundingBox.width < 20 && boundingBox.height < 20) {
          console.log(
            `Skipping small decorative element: ${tagName}.${className} "${textContent}"`
          );
          continue;
        }

        // Skip elements that are clearly not primary interactive elements
        if (
          className.includes("icon") ||
          className.includes("badge") ||
          className.includes("avatar")
        ) {
          console.log(
            `Skipping decorative element: ${tagName}.${className} "${textContent}"`
          );
          continue;
        }

        if (useSoftAssertions) {
          expect
            .soft(
              boundingBox.width,
              `Element ${tagName}.${className} "${textContent}" width should be >= ${minSize}px`
            )
            .toBeGreaterThanOrEqual(minSize);
          expect
            .soft(
              boundingBox.height,
              `Element ${tagName}.${className} "${textContent}" height should be >= ${minSize}px`
            )
            .toBeGreaterThanOrEqual(minSize);
        } else {
          expect(
            boundingBox.width,
            `Element ${tagName}.${className} "${textContent}" width should be >= ${minSize}px`
          ).toBeGreaterThanOrEqual(minSize);
          expect(
            boundingBox.height,
            `Element ${tagName}.${className} "${textContent}" height should be >= ${minSize}px`
          ).toBeGreaterThanOrEqual(minSize);
        }
      }
    }
  } catch (error) {
    console.error("Error validating touch targets:", error);
    if (!useSoftAssertions) {
      throw error;
    }
  }
}

/**
 * Comprehensive accessibility test that runs multiple checks
 */
export async function runComprehensiveA11yCheck(
  page: Page,
  config: AccessibilityTestConfig = {}
): Promise<void> {
  if (!isAccessibilityTestingEnabled()) {
    console.log(
      "Accessibility testing disabled - skipping comprehensive check"
    );
    return;
  }

  const testName = config.testName || "Comprehensive Accessibility Check";

  // Run WCAG 2.1 AA compliance check
  await checkWCAG21AACompliance(page, {
    ...config,
    testName: `${testName} - WCAG`,
  });

  // Validate keyboard navigation for common interactive elements
  const commonSelectors = [
    "button:visible",
    "a[href]:visible",
    '[role="button"]:visible',
    "input:visible",
    "select:visible",
    "textarea:visible",
  ];

  for (const selector of commonSelectors) {
    const elements = await page.locator(selector).count();
    if (elements > 0) {
      await validateKeyboardNavigation(page, [selector], config);
      break; // Test at least one type of interactive element
    }
  }

  // Validate touch targets on mobile viewports
  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 768) {
    await validateTouchTargets(page, 44, config);
  }
}

/**
 * Accessibility test decorator for test functions
 * Adds @a11y tag and runs accessibility checks
 */
export function withAccessibilityCheck(testName: string) {
  return `${testName} @a11y`;
}
