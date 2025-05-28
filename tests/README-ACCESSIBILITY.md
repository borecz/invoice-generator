# Accessibility Testing with Playwright

This document explains how to use the comprehensive accessibility testing system integrated into our Playwright test suite.

## Overview

Our accessibility testing system provides:
- **Conditional Testing**: Enable/disable accessibility checks via environment variables
- **Soft Assertions**: Capture accessibility violations without breaking functional tests
- **WCAG 2.1 AA Compliance**: Automated validation against accessibility standards
- **Test Tagging**: `@a11y` tags for organizing accessibility-specific tests
- **Comprehensive Utilities**: Reusable functions for common accessibility checks

## Environment Configuration

### Enable/Disable Accessibility Testing

```bash
# Enable accessibility testing (default)
RUN_A11Y_TESTS=true npm run test:e2e

# Disable accessibility testing
RUN_A11Y_TESTS=false npm run test:e2e
```

### Available NPM Scripts

```bash
# Run all tests with accessibility checks enabled
npm run test:e2e:all-with-a11y

# Run all tests with accessibility checks disabled
npm run test:e2e:all-no-a11y

# Run only accessibility-tagged tests
npm run test:e2e:a11y

# Run only functional tests (skip @a11y tagged tests)
npm run test:e2e:functional

# Standard test commands (accessibility depends on RUN_A11Y_TESTS env var)
npm run test:e2e
npm run test:e2e:ui
```

## Accessibility Testing Utilities

### Core Functions

#### `runAccessibilityCheck(page, config)`
Performs a basic accessibility scan using axe-core.

```typescript
import { runAccessibilityCheck } from "./utils/accessibility";

await runAccessibilityCheck(page, {
  testName: "Login Page",
  useSoftAssertions: true,
  tags: ["wcag2a", "wcag2aa", "wcag21aa"],
});
```

#### `checkWCAG21AACompliance(page, config)`
Specifically tests for WCAG 2.1 AA compliance.

```typescript
await checkWCAG21AACompliance(page, {
  testName: "Dashboard",
  useSoftAssertions: true,
});
```

#### `runComprehensiveA11yCheck(page, config)`
Runs multiple accessibility checks including WCAG compliance, keyboard navigation, and touch targets.

```typescript
await runComprehensiveA11yCheck(page, {
  testName: "Customer Management",
  useSoftAssertions: true,
});
```

#### `validateKeyboardNavigation(page, selectors, config)`
Tests keyboard accessibility for specific elements.

```typescript
const selectors = [
  'button[aria-label="Submit"]',
  'a[href="/dashboard"]',
  'input[type="email"]',
];

await validateKeyboardNavigation(page, selectors, {
  useSoftAssertions: true,
});
```

#### `validateTouchTargets(page, minSize, config)`
Validates that interactive elements meet minimum touch target size requirements.

```typescript
await validateTouchTargets(page, 44, {
  useSoftAssertions: true,
});
```

### Test Tagging

Use the `withAccessibilityCheck()` function to add `@a11y` tags to tests:

```typescript
import { withAccessibilityCheck } from "./utils/accessibility";

test(withAccessibilityCheck("User can login successfully"), async ({ page }) => {
  // Test implementation with accessibility checks
});
```

## Integration Patterns

### Pattern 1: Comprehensive Integration
Add accessibility checks at key points in functional tests:

```typescript
test(withAccessibilityCheck("Complete user flow"), async ({ page }) => {
  // Navigate to page
  await page.goto("/login");
  
  // Check initial page accessibility
  await runComprehensiveA11yCheck(page, {
    testName: "Login Page Initial State",
    useSoftAssertions: true,
  });
  
  // Perform user actions
  await page.getByRole("textbox", { name: /email/i }).fill("user@example.com");
  await page.getByRole("textbox", { name: /password/i }).fill("password");
  
  // Check form filled state
  await runAccessibilityCheck(page, {
    testName: "Login Form Filled",
    useSoftAssertions: true,
  });
  
  // Submit and verify
  await page.getByRole("button", { name: /login/i }).click();
  
  // Check post-action state
  await checkWCAG21AACompliance(page, {
    testName: "Post-Login State",
    useSoftAssertions: true,
  });
});
```

### Pattern 2: Conditional Testing
Tests that run accessibility checks only when enabled:

```typescript
import { isAccessibilityTestingEnabled } from "./utils/accessibility";

test("Functional test with optional accessibility", async ({ page }) => {
  await page.goto("/dashboard");
  
  // Always run functional tests
  await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  
  // Conditionally run accessibility tests
  if (isAccessibilityTestingEnabled()) {
    await runComprehensiveA11yCheck(page, {
      testName: "Dashboard",
      useSoftAssertions: true,
    });
  }
});
```

### Pattern 3: Mobile Accessibility Testing
Special considerations for mobile viewports:

```typescript
test(withAccessibilityCheck("Mobile accessibility"), async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  
  // Comprehensive check includes touch target validation for mobile
  await runComprehensiveA11yCheck(page, {
    testName: "Mobile Landing Page",
    useSoftAssertions: true,
  });
  
  // Additional mobile-specific checks
  await validateTouchTargets(page, 44, {
    useSoftAssertions: true,
  });
});
```

## Selector Strategy

### Preferred Selectors (Accessibility-First)
1. **Role-based selectors**: `page.getByRole("button", { name: /submit/i })`
2. **Label-based selectors**: `page.getByLabel("Email address")`
3. **ARIA selectors**: `page.locator('[aria-label="Close dialog"]')`
4. **Semantic selectors**: `page.locator('button[type="submit"]')`

### Avoid
- CSS class selectors: `.btn-primary`
- Generic element selectors: `button:nth-child(2)`
- Data test IDs (unless necessary): `[data-testid="submit-btn"]`

## Configuration Options

### AccessibilityTestConfig Interface
```typescript
interface AccessibilityTestConfig {
  tags?: string[];              // WCAG tags to test against
  include?: string[];           // Elements to include in scan
  exclude?: string[];           // Elements to exclude from scan
  useSoftAssertions?: boolean;  // Use soft assertions (default: true)
  testName?: string;            // Custom test name for reporting
}
```

### Default Configuration
```typescript
const defaultA11yConfig = {
  tags: ["wcag2a", "wcag2aa", "wcag21aa"],
  useSoftAssertions: true,
};
```

## Best Practices

1. **Use Soft Assertions**: Set `useSoftAssertions: true` to capture violations without breaking tests
2. **Test Key User Flows**: Focus on critical paths like authentication, checkout, form submission
3. **Test Multiple Viewports**: Include mobile, tablet, and desktop testing
4. **Use Semantic Selectors**: Prefer ARIA labels and roles over CSS classes
5. **Test Different States**: Check initial load, form filled, error states, success states
6. **Include All Locales**: Test accessibility across different languages and regions

## Troubleshooting

### Common Issues

1. **Tests failing due to accessibility violations**:
   - Ensure `useSoftAssertions: true` is set
   - Check console output for specific violation details

2. **Environment variable not working**:
   - Verify `RUN_A11Y_TESTS` is set correctly
   - Use the provided npm scripts which set the environment variable

3. **Accessibility checks not running**:
   - Check if `isAccessibilityTestingEnabled()` returns true
   - Verify the test has the `@a11y` tag if using filtered scripts

### Debugging

Enable detailed logging by checking console output during test runs:
```bash
RUN_A11Y_TESTS=true npm run test:e2e -- --headed
```

The accessibility utilities provide detailed console output showing:
- Whether accessibility testing is enabled/disabled
- Number of violations found
- Specific violation details with impact levels
- Help URLs for fixing violations

## Reporting

Accessibility test results are included in:
- Console output during test execution
- HTML test reports (`playwright-report/`)
- JSON test results (`test-results/results.json`)

Violations are logged with:
- Violation ID and description
- Impact level (minor, moderate, serious, critical)
- Help documentation links
- Number of affected elements
