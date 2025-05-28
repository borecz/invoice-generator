# Email Interception and Testing with Inbucket

This document explains how to use the comprehensive email testing system integrated into our Playwright test suite using Inbucket.

## Overview

Our email testing system provides:
- **Email Interception**: Capture emails sent during test execution using Inbucket
- **Conditional Testing**: Enable/disable email testing via environment variables
- **Content Validation**: Automated validation of email content, attachments, and metadata
- **Service Management**: Automated Docker service management for Inbucket
- **Integration**: Seamless integration with existing accessibility and functional tests

## Quick Start

### 1. Start Email Testing Service

```bash
# Start Inbucket service
npm run email:start

# Verify service is running
npm run email:ui  # Opens Inbucket web interface
```

### 2. Run Email Tests

```bash
# Run all email tests
npm run test:email

# Run all tests with email interception enabled
npm run test:with-email

# Run tests without email interception
npm run test:no-email

# Full email testing workflow (start service, run tests, stop service)
npm run test:email:full
```

### 3. Stop Email Testing Service

```bash
npm run email:stop
```

## Environment Configuration

### Enable/Disable Email Testing

```bash
# Enable email testing (default)
USE_EMAIL_TESTING=true npm run test:e2e

# Disable email testing
USE_EMAIL_TESTING=false npm run test:e2e
```

### Environment Variables

Create a `.env.test` file with:

```env
# Email Testing Configuration
USE_EMAIL_TESTING=true
INBUCKET_WEB_URL=http://localhost:9000
INBUCKET_SMTP_HOST=localhost
INBUCKET_SMTP_PORT=2500
INBUCKET_API_URL=http://localhost:9000/api/v1

# Supabase Test Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key

# SMTP Configuration for Supabase
SMTP_HOST=localhost
SMTP_PORT=2500
SMTP_SENDER_NAME=Invoice Generator Test
SMTP_SENDER_EMAIL=noreply@test.localhost
```

## Email Testing Utilities

### Core Functions

#### `startInbucketService()` / `stopInbucketService()`
Manages the Inbucket Docker service.

```typescript
import { startInbucketService, stopInbucketService } from "./utils/email";

test.beforeAll(async () => {
  await startInbucketService();
});

test.afterAll(async () => {
  await stopInbucketService();
});
```

#### `waitForEmail(emailAddress, config)`
Waits for any email to arrive at the specified address.

```typescript
const email = await waitForEmail("user@example.com", {
  timeout: 30000,
  testName: "Signup Email",
  useSoftAssertions: true,
  clearMailbox: true,
});
```

#### `waitForEmailWithSubject(emailAddress, subjectPattern, config)`
Waits for an email with a specific subject pattern.

```typescript
const confirmationEmail = await waitForEmailWithSubject(
  "user@example.com",
  /confirm.*email|verification/i,
  {
    timeout: 30000,
    useSoftAssertions: true,
  }
);
```

#### `validateEmailContent(email, validations, config)`
Validates email content against specified criteria.

```typescript
await validateEmailContent(email, {
  subject: /welcome|confirmation/i,
  from: /noreply@/,
  to: "user@example.com",
  bodyText: /click.*link/i,
  hasAttachments: false,
});
```

#### `clearMailbox(emailAddress, config)`
Clears all emails from a mailbox.

```typescript
await clearMailbox("user@example.com", {
  testName: "Test Setup",
  useSoftAssertions: true,
});
```

### Comprehensive Testing

#### `waitForAndValidateEmail(emailAddress, validations, config)`
Combines waiting and validation in one function.

```typescript
const email = await waitForAndValidateEmail("user@example.com", {
  subject: /password.*reset/i,
  bodyText: /reset.*password/i,
  hasAttachments: false,
});
```

## Integration Patterns

### Pattern 1: Authentication Flow Testing

```typescript
import { withEmailTesting, waitForEmailWithSubject } from "./utils/email";

test(withEmailTesting("User signup with email confirmation"), async ({ page }) => {
  const userEmail = `test_${Date.now()}@example.com`;
  
  // Clear mailbox before test
  await clearMailbox(userEmail);
  
  // Perform signup
  await page.goto("/auth/signup");
  await page.getByRole("textbox", { name: /email/i }).fill(userEmail);
  await page.getByRole("textbox", { name: /password/i }).fill("password123");
  await page.getByRole("button", { name: /sign up/i }).click();
  
  // Wait for confirmation email
  const confirmationEmail = await waitForEmailWithSubject(
    userEmail,
    /confirm.*email/i,
    { timeout: 30000 }
  );
  
  // Validate email content
  if (confirmationEmail) {
    await validateEmailContent(confirmationEmail, {
      to: userEmail,
      bodyText: /click.*link.*confirm/i,
    });
  }
});
```

### Pattern 2: Password Reset Testing

```typescript
test(withEmailTesting("Password reset flow"), async ({ page }) => {
  const userEmail = `reset_${Date.now()}@example.com`;
  
  await page.goto("/auth/forgot-password");
  await page.getByRole("textbox", { name: /email/i }).fill(userEmail);
  await page.getByRole("button", { name: /send reset/i }).click();
  
  const resetEmail = await waitForEmailWithSubject(
    userEmail,
    /reset.*password/i,
    { timeout: 30000 }
  );
  
  expect(resetEmail).toBeTruthy();
  await validateEmailContent(resetEmail, {
    subject: /password.*reset/i,
    bodyText: /reset.*password/i,
  });
});
```

### Pattern 3: Conditional Email Testing

```typescript
test("Functional test with optional email validation", async ({ page }) => {
  const userEmail = `test_${Date.now()}@example.com`;
  
  // Always run functional test
  await page.goto("/auth/signup");
  await page.getByRole("textbox", { name: /email/i }).fill(userEmail);
  await page.getByRole("button", { name: /sign up/i }).click();
  
  // Conditionally test email
  if (isEmailTestingEnabled()) {
    const email = await waitForEmail(userEmail, { timeout: 10000 });
    if (email) {
      await validateEmailContent(email, {
        to: userEmail,
        subject: /welcome|confirmation/i,
      });
    }
  }
  
  // Continue with functional assertions
  await expect(page.getByText(/success/i)).toBeVisible();
});
```

### Pattern 4: Integration with Accessibility Testing

```typescript
import { runAccessibilityCheck } from "./utils/accessibility";

test(withEmailTesting("Email form accessibility and functionality"), async ({ page }) => {
  await page.goto("/auth/signup");
  
  // Test accessibility of email form
  await runAccessibilityCheck(page, {
    testName: "Email Signup Form",
    useSoftAssertions: true,
  });
  
  // Test email functionality
  const userEmail = `a11y_test_${Date.now()}@example.com`;
  await page.getByRole("textbox", { name: /email/i }).fill(userEmail);
  await page.getByRole("button", { name: /sign up/i }).click();
  
  // Validate email delivery
  const email = await waitForEmail(userEmail, { timeout: 30000 });
  expect(email).toBeTruthy();
});
```

## Service Management

### Docker Configuration

The system uses `docker-compose.test.yml` to manage Inbucket:

```yaml
services:
  inbucket:
    image: inbucket/inbucket:latest
    ports:
      - "9000:9000"  # Web UI
      - "2500:2500"  # SMTP
    environment:
      - INBUCKET_SMTP_DOMAIN=localhost
      - INBUCKET_STORAGE_TYPE=memory
```

### NPM Scripts

```bash
# Service management
npm run email:start      # Start Inbucket service
npm run email:stop       # Stop Inbucket service
npm run email:logs       # View service logs
npm run email:ui         # Open web interface

# Testing
npm run test:email       # Run email tests only
npm run test:with-email  # Run all tests with email enabled
npm run test:no-email    # Run all tests with email disabled
npm run test:email:full  # Complete workflow (start → test → stop)
```

### Manual Service Management

```bash
# Start service manually
docker-compose -f docker-compose.test.yml up -d inbucket

# Check service status
docker-compose -f docker-compose.test.yml ps

# View logs
docker-compose -f docker-compose.test.yml logs -f inbucket

# Stop service
docker-compose -f docker-compose.test.yml down
```

## Inbucket Web Interface

Access the Inbucket web interface at `http://localhost:9000` to:
- View intercepted emails in real-time
- Browse mailboxes by email address
- Inspect email content, headers, and attachments
- Monitor email delivery during test execution

## Configuration Options

### EmailTestConfig Interface

```typescript
interface EmailTestConfig {
  timeout?: number;           // Wait timeout in milliseconds
  useSoftAssertions?: boolean; // Use soft assertions
  testName?: string;          // Custom test name for logging
  clearMailbox?: boolean;     // Clear mailbox before test
}
```

### Default Configuration

```typescript
const defaultEmailConfig = {
  timeout: 30000,
  useSoftAssertions: true,
  clearMailbox: true,
};
```

## Best Practices

1. **Use Soft Assertions**: Set `useSoftAssertions: true` to capture email issues without breaking functional tests
2. **Clear Mailboxes**: Always clear mailboxes before tests to avoid interference
3. **Test Key Flows**: Focus on critical email flows like signup, password reset, notifications
4. **Conditional Testing**: Use environment variables to enable/disable email testing
5. **Validate Content**: Test both email metadata and content for completeness
6. **Service Management**: Use provided npm scripts for consistent service management

## Troubleshooting

### Common Issues

1. **Inbucket service not starting**:
   ```bash
   # Check Docker status
   docker ps
   
   # Check service logs
   npm run email:logs
   
   # Restart service
   npm run email:stop && npm run email:start
   ```

2. **Emails not being intercepted**:
   - Verify Supabase is configured to use Inbucket SMTP
   - Check environment variables in `.env.test`
   - Ensure `USE_EMAIL_TESTING=true`

3. **Tests timing out**:
   - Increase timeout values in test configuration
   - Check if emails are actually being sent
   - Verify Inbucket service is running

### Debugging

Enable detailed logging:
```bash
USE_EMAIL_TESTING=true npm run test:email -- --headed
```

Check service status:
```bash
curl http://localhost:9000/api/v1/monitor/messages
```

## Integration with CI/CD

For continuous integration, ensure:
1. Docker is available in CI environment
2. Email testing is enabled via environment variables
3. Service startup/shutdown is handled in test setup
4. Proper cleanup after test execution

Example GitHub Actions configuration:
```yaml
- name: Start email testing service
  run: npm run email:start

- name: Run tests with email
  run: npm run test:with-email

- name: Stop email testing service
  run: npm run email:stop
  if: always()
```
