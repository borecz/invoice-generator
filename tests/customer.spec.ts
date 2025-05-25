import { test, expect } from '@playwright/test';

const TEST_USER_EMAIL = 'testuser@example.com'; // ENSURE THIS USER EXISTS IN YOUR TEST DB
const TEST_USER_PASSWORD = 'password123';    // ENSURE THIS PASSWORD IS CORRECT

const getUniqueCustomerName = () => `CustName_${Date.now()}`;

test.describe('Customer Management', () => {
  // Login before each test in this describe block
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill in login form
    // Using getByPlaceholder as an alternative to getByLabel if labels are not strictly associated
    await page.getByPlaceholder('you@example.com').fill(TEST_USER_EMAIL);
    await page.getByPlaceholder('••••••••').fill(TEST_USER_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait for successful login message and redirection to /new
    await expect(page.getByText(/Sign in successful!/i)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL('/new', { timeout: 10000 });

    // Navigate to the customers page for the tests
    await page.goto('/customers');
    await expect(page.getByRole('heading', { name: 'Manage Customers' })).toBeVisible({ timeout: 5000 });
  });

  test('Navigate to Customer Page and Verify Initial State (for a new user or after clearing customers)', async ({ page }) => {
    // The beforeEach already navigates to /customers and checks the main heading.
    // This test will focus on what a user might see if they have no customers yet.
    // This assertion is tricky if customers persist from previous test runs or other users.
    // For a truly isolated test, you'd need to ensure the test user has no customers.
    // We'll check if the list is empty or if the "No customers found" message is there.
    
    const customerList = page.locator('table tbody tr');
    const noCustomersMessage = page.getByText('No customers found. Add your first customer using the form above!');
    
    const count = await customerList.count();
    if (count === 0) {
      await expect(noCustomersMessage).toBeVisible();
    } else {
      // If customers are present, the "no customers" message should not be visible.
      // This is useful if the test environment is not reset between runs.
      await expect(noCustomersMessage).not.toBeVisible();
      console.log(`Customers found: ${count}. Skipping "No customers found" message check.`);
    }
  });

  test('Create a New Customer and Verify it Appears in List', async ({ page }) => {
    const uniqueCustomerName = getUniqueCustomerName();
    const customerEmail = `customer_${Date.now()}@example.com`;
    const customerAddress = `${Date.now()} Main St, Anytown`;

    // Fill in the new customer form
    await page.getByPlaceholder('e.g. John Doe').fill(uniqueCustomerName);
    await page.getByPlaceholder('e.g. john.doe@example.com').fill(customerEmail);
    await page.getByPlaceholder('e.g. 123 Main St, Anytown, USA').fill(customerAddress);
    
    await page.getByRole('button', { name: 'Add Customer' }).click();

    // Assertion for success message
    await expect(page.getByText('Customer added successfully!')).toBeVisible({ timeout: 10000 });

    // Assertions for the new customer in the list
    // Wait for the list to potentially update.
    // A more robust way might be to wait for a specific network response if applicable,
    // or for the specific row to appear.
    
    // Locate the row containing the new customer's name.
    // This assumes customer names are unique enough for this test context.
    const newCustomerRow = page.locator('table tbody tr', { hasText: uniqueCustomerName });
    
    await expect(newCustomerRow).toBeVisible({ timeout: 5000 }); // Ensure the row itself is visible
    
    // Verify details within that specific row
    await expect(newCustomerRow.getByText(uniqueCustomerName)).toBeVisible(); // Name
    await expect(newCustomerRow.getByText(customerEmail)).toBeVisible();      // Email
    await expect(newCustomerRow.getByText(customerAddress)).toBeVisible();   // Address
    
    // Also check that the "No customers found" message is not visible if it was there before
    const noCustomersMessage = page.getByText('No customers found. Add your first customer using the form above!');
    await expect(noCustomersMessage).not.toBeVisible();
  });
});
