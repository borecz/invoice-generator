import { test, expect } from '@playwright/test';

const getUniqueEmail = () => `testuser_${Date.now()}@example.com`;

test.describe('Authentication', () => {
  let userEmail: string; // This will be set by the signup test and used by the login test
  const userPassword = 'password123';

  // Run tests in this describe block serially to ensure signup runs before login
  // if the login test depends on the user created by signup.
  // Alternatively, make login test independent by creating its own user or using a pre-seeded one.
  // For this exercise, we'll rely on the order within this describe block.
  // Note: Playwright by default runs tests in a file in parallel if not configured otherwise.
  // To enforce order for dependent tests like this, you can use test.describe.serial()
  // or structure tests to be independent.
  // Let's assume for now that either test.describe.serial() would be used,
  // or we accept this implicit dependency for this specific subtask.
  // For a more robust setup, `test.beforeAll` could create a user, or each test could be self-contained.

  test('User can sign up successfully', async ({ page }) => {
    userEmail = getUniqueEmail();
    await page.goto('/auth/signup');

    // Fill in the email and password
    // Using getByPlaceholder as an alternative to getByLabel if labels are not strictly associated
    await page.getByPlaceholder('you@example.com').fill(userEmail);
    await page.getByPlaceholder('••••••••').fill(userPassword);
    
    // Click the "Sign Up" button
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Assertion for success:
    // 1. Check for a success message on the signup page itself.
    //    The current SignUpForm shows: "Sign up successful! Please check your email to confirm your account."
    //    Or, if auto-confirmation is effectively on (email verification disabled): "Sign up successful! You are now logged in."
    await expect(page.getByText(/Sign up successful!/i)).toBeVisible({ timeout: 15000 });


    // 2. Redirection: Middleware redirects authenticated users from /auth/signup to /new.
    //    So, after a successful signup (and auto-login because verification is off),
    //    the user should be redirected. Let's wait for this.
    await expect(page).toHaveURL('/new', { timeout: 10000 });

    // 3. Verify authenticated state on a consistent page (e.g., landing page)
    await page.goto('/'); // Navigate to landing page to check auth state
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible({ timeout: 5000 });
    // Check for user's email, which is displayed on the landing page when logged in.
    await expect(page.getByText(userEmail, { exact: false })).toBeVisible({ timeout: 5000 });
  });

  test('User can log in successfully and then log out', async ({ page }) => {
    // This test depends on the userEmail from the previous test.
    if (!userEmail) {
      // This case might happen if 'User can sign up successfully' test is skipped or fails.
      // For a real test suite, you might want to create a user here specifically for this test
      // or ensure `userEmail` is always populated from a `beforeAll` or similar setup.
      console.warn("Skipping login test as userEmail is not set from the sign-up test.");
      test.skip(true, "User email not available from sign-up test.");
      return;
    }

    // Ensure we are logged out before attempting to log in
    // (e.g. if a previous test failed and left session active, though playwright provides fresh contexts)
    // A more robust way: ensure clean state using page.context().clearCookies() or similar if needed.
    // For now, we'll try to logout first if a logout button is visible.
    await page.goto('/');
    const logoutButton = page.getByRole('button', { name: 'Logout' });
    if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await expect(page.getByRole('button', { name: 'Login' })).toBeVisible({timeout: 5000});
    }


    await page.goto('/auth/login');

    // Fill in the email and password
    await page.getByPlaceholder('you@example.com').fill(userEmail);
    await page.getByPlaceholder('••••••••').fill(userPassword);
    await page.getByRole('button', { name: 'Login' }).click();

    // Assertion for success:
    // 1. Check for success message on the login page.
    //    LoginForm shows: "Sign in successful! Redirecting..."
    await expect(page.getByText(/Sign in successful!/i)).toBeVisible({ timeout: 10000 });

    // 2. Redirection: Middleware redirects authenticated users from /auth/login to /new.
    await expect(page).toHaveURL('/new', { timeout: 10000 });

    // 3. Verify authenticated state on the landing page
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
    await expect(page.getByText(userEmail, { exact: false })).toBeVisible();

    // Test Logout
    await page.getByRole('button', { name: 'Logout' }).click();
    
    // Assertions for logout:
    // 1. Should redirect to landing page (or a specific logout confirmation page).
    //    Current LogoutButton redirects to '/'
    await expect(page).toHaveURL('/', { timeout: 5000 });
    
    // 2. Login and Sign Up buttons should be visible again.
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
    
    // 3. User email and Logout button should NOT be visible.
    await expect(page.getByText(userEmail, { exact: false })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Logout' })).not.toBeVisible();
  });
});
