# Testing Guide

This guide covers the comprehensive testing setup for the Invoice Generator application, including local Supabase integration, ARIA snapshots, shared authentication, and debugging tools.

## 🚨 CRITICAL REQUIREMENTS

### 1. **MANDATORY: Use test.step() for ALL Test Actions**

**ALL test actions MUST be wrapped in `test.step()` with descriptive names for better debugging and reporting.**

```typescript
// ✅ CORRECT - All actions wrapped in test.step()
test("User can create invoice", async ({ page }) => {
  await test.step("Navigate to invoice creation page", async () => {
    await page.goto("/new");
    await page.waitForLoadState("networkidle");
  });

  await test.step("Fill invoice form", async () => {
    await page.getByPlaceholder("Invoice number").fill("INV-001");
    await page.getByPlaceholder("Customer name").fill("Test Customer");
  });

  await test.step("Submit invoice", async () => {
    await page.getByRole("button", { name: "Create Invoice" }).click();
  });

  await test.step("Verify invoice creation success", async () => {
    await expect(page.getByText("Invoice created successfully")).toBeVisible();
  });
});

// ❌ INCORRECT - Actions not wrapped in test.step()
test("User can create invoice", async ({ page }) => {
  await page.goto("/new");
  await page.getByPlaceholder("Invoice number").fill("INV-001");
  await page.getByRole("button", { name: "Create Invoice" }).click();
  await expect(page.getByText("Invoice created successfully")).toBeVisible();
});
```

### 2. **Shared Authentication State**

Tests use shared authentication created in `global-setup.ts` to avoid redundant login flows. The shared user is automatically available in all tests via `storageState`.

```typescript
// ✅ CORRECT - Using shared auth (no login needed)
test("User can view dashboard", async ({ page }) => {
  await test.step("Navigate to dashboard", async () => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
  });

  await test.step("Verify authenticated state", async () => {
    await expect(
      page.getByRole("button", { name: /User menu for/ })
    ).toBeVisible();
  });
});

// ✅ CORRECT - Access shared user info when needed
import { getSharedUserInfo } from "./utils/shared-auth";

test("User can update profile", async ({ page }) => {
  const sharedUser = await getSharedUserInfo();

  await test.step("Navigate to profile page", async () => {
    await page.goto("/profile");
  });

  await test.step("Verify current user email", async () => {
    await expect(page.getByText(sharedUser.email)).toBeVisible();
  });
});

// ❌ INCORRECT - Creating new users unnecessarily
test("User can view dashboard", async ({ page }) => {
  // Don't do this - wastes time and hits rate limits
  await page.goto("/auth/signup");
  await page.getByPlaceholder("email").fill("newuser@example.com");
  // ... signup flow
});
```

### 3. **UI Selector Verification**

Before writing or updating selectors, use Playwright browser tools to inspect the current UI state:

```typescript
// Use this pattern to debug and verify selectors
test("Debug UI selectors", async ({ page }) => {
  await test.step("Navigate and inspect", async () => {
    await page.goto("/target-page");

    // Take screenshot for visual verification
    await page.screenshot({ path: "debug-page-state.png" });

    // Check actual button text
    const buttons = await page.locator("button").allTextContents();
    console.log("Available buttons:", buttons);

    // Check form fields
    const inputs = await page.locator("input").all();
    for (let i = 0; i < inputs.length; i++) {
      const placeholder = await inputs[i].getAttribute("placeholder");
      console.log(`Input ${i}: placeholder=${placeholder}`);
    }
  });
});
```

## Quick Start

```bash
# Start local Supabase (required for all tests)
npm run supabase:start

# Run all tests
npm run test:e2e

# Run tests with debugging
npm run test:debug

# Run tests with UI explorer
npm run test:ui

# View test reports
npm run test:report
```

## Local Development Environment

### Supabase Local Setup

All tests run against a local Supabase instance to avoid production database pollution and email bounce issues.

**Local Services:**

- **API**: http://127.0.0.1:54321
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio**: http://127.0.0.1:54323
- **Inbucket (Email)**: http://127.0.0.1:54324

**Management Commands:**

```bash
npm run supabase:start    # Start local Supabase
npm run supabase:stop     # Stop local Supabase
npm run supabase:status   # Check status
npm run supabase:reset    # Reset database
npm run supabase:studio   # Open Supabase Studio
```

### Environment Configuration

Tests use `.env.test` which is configured for local Supabase:

- `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321`
- `USE_EMAIL_TESTING=true`
- `INBUCKET_WEB_URL=http://127.0.0.1:54324`

## Testing Features

### 1. Desktop-Only Testing

Tests are configured to run only on desktop Chrome to focus on desktop functionality and reduce execution time.

### 2. ARIA Snapshots (Primary UI Testing Method)

We use ARIA snapshots as our primary method for UI validation instead of visual regression testing. This approach provides more reliable, semantic, and accessible testing:

```typescript
import {
  AriaPatternValidator,
  takePageAriaSnapshot,
} from "./utils/aria-snapshots";

test("validate login form structure", async ({ page }) => {
  await page.goto("/auth/login");

  const validator = new AriaPatternValidator(page);
  await validator.validateForm(
    page.locator("form"),
    `form:
      textbox "Email" (required)
      textbox "Password" (required)
      button "Login"`
  );
});
```

**Why ARIA Snapshots over Visual Regression?**

- **Semantic Focus**: Tests the meaning and structure, not just appearance
- **Accessibility First**: Ensures UI is accessible to screen readers and assistive technologies
- **More Stable**: Less prone to false positives from minor visual changes
- **Faster Execution**: No need to capture and compare screenshots
- **Better Debugging**: Clear semantic representation of UI state

### 3. Debugging Tools

**Debug Mode:**

```bash
# Run tests in headed mode with slow motion
npm run test:debug

# Run specific test with debugging
DEBUG=1 npm run test:e2e -- tests/auth.spec.ts
```

**UI Explorer:**

```bash
# Interactive test development
npm run test:ui
```

**ARIA Snapshot Debugging:**

```typescript
import { debugAriaSnapshot } from "./utils/aria-snapshots";

test("debug page structure", async ({ page }) => {
  await page.goto("/dashboard");
  await debugAriaSnapshot(page, "Dashboard Page");
});
```

### 4. Email Testing

Local Inbucket captures all emails sent during tests:

```typescript
import { waitForEmailWithSubject, clearMailbox } from "./utils/email";

test("signup email flow", async ({ page }) => {
  // Perform signup
  await page.goto("/auth/signup");
  // ... signup steps ...

  // Check for confirmation email
  const email = await waitForEmailWithSubject(userEmail, "Confirm your signup");
  expect(email).toBeTruthy();
});
```

## Test Structure

### Authentication Tests

- User signup with email validation
- Login/logout flows
- Email confirmation handling

### Customer Management Tests

- CRUD operations for customers
- Form validation
- List/grid views

### Invoice Tests

- Invoice creation and editing
- PDF generation
- Status management

### Accessibility Tests

- WCAG 2.1 AA compliance
- ARIA snapshot validation
- Keyboard navigation

## Best Practices

### 1. Test Isolation

- Each test should be independent
- Use unique email addresses: `testuser_${Date.now()}@mailinator.com`
- Clean up test data when necessary

### 2. Realistic Test Data

- Use valid email domains (e.g., @mailinator.com)
- Create meaningful test scenarios
- Follow real user workflows

### 3. Error Handling

- Test both success and failure paths
- Validate error messages
- Check accessibility of error states

### 4. Performance

- Use `page.waitForLoadState('networkidle')` for stability
- Implement proper timeouts
- Use ARIA snapshots for fast validation

## Troubleshooting

### Common Issues

**Supabase Not Running:**

```bash
npm run supabase:status
npm run supabase:start
```

**Email Validation Errors:**

- Use realistic email domains like @mailinator.com
- Avoid @example.com or @test.local

**Test Timeouts:**

- Check if local services are running
- Increase timeout for slow operations
- Use `page.waitForLoadState()` appropriately

**Database Issues:**

```bash
# Reset local database
npm run supabase:reset

# Check database schema
npm run supabase:studio
```

### Debug Commands

```bash
# Run single test with full debugging
DEBUG=1 npx playwright test tests/auth.spec.ts --headed --debug

# Generate test code interactively
npx playwright codegen localhost:3000

# View trace files
npx playwright show-trace trace.zip
```

## Configuration Files

- `playwright.config.ts` - Main Playwright configuration
- `.env.test` - Test environment variables
- `supabase/config.toml` - Local Supabase configuration
- `supabase/migrations/` - Database schema migrations
- `tests/utils/` - Test utilities and helpers

## Continuous Integration

For CI environments, ensure:

1. Docker is available for Supabase
2. Environment variables are properly set
3. Sufficient timeouts for service startup
4. Proper cleanup of resources

```yaml
# Example CI configuration
- name: Start Supabase
  run: |
    npm run supabase:start
    npm run test:e2e
    npm run supabase:stop
```
