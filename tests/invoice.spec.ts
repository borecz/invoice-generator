import { test, expect } from '@playwright/test';

// Ensure this user exists in your test DB and is verified if email verification is on.
const TEST_USER_EMAIL_INVOICE = 'testuser_invoice@example.com'; 
const TEST_USER_PASSWORD_INVOICE = 'password123';

const getUniqueInvoiceNumber = () => `INV-${Date.now()}`;
const getUniqueCustomerNameForInvoice = () => `InvCust_${Date.now()}`;

test.describe('Invoice Management', () => {
  let createdCustomerName: string;
  let createdCustomerId: string; // To store the ID of the customer created for selection

  // Login before each test in this describe block
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.getByPlaceholder('you@example.com').fill(TEST_USER_EMAIL_INVOICE);
    await page.getByPlaceholder('••••••••').fill(TEST_USER_PASSWORD_INVOICE);
    await page.getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/Sign in successful!/i)).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL('/new', { timeout: 10000 }); // Should redirect to /new after login
  });

  test('Create a New Invoice', async ({ page }) => {
    // Part 1: Create a new customer for this invoice test
    createdCustomerName = getUniqueCustomerNameForInvoice();
    const customerEmail = `inv_cust_${Date.now()}@example.com`;
    const customerAddress = `${Date.now()} Invoice St, Testville`;

    await page.goto('/customers'); // Navigate to customer management page
    await expect(page.getByRole('heading', { name: 'Manage Customers' })).toBeVisible({ timeout: 5000 });

    await page.getByPlaceholder('e.g. John Doe').fill(createdCustomerName);
    await page.getByPlaceholder('e.g. john.doe@example.com').fill(customerEmail);
    await page.getByPlaceholder('e.g. 123 Main St, Anytown, USA').fill(customerAddress);
    await page.getByRole('button', { name: 'Add Customer' }).click();
    await expect(page.getByText('Customer added successfully!')).toBeVisible({ timeout: 10000 });
    
    // Get the ID of the created customer (this is tricky without exposing ID in UI)
    // For now, we'll rely on selecting by name. If names are not unique, this could fail.
    // A better way would be if the "Add Customer" returned the ID or if the table had IDs.
    // We will select the customer by name in the invoice form.

    // Part 2: Navigate to the new invoice page
    await page.goto('/new');
    await expect(page.getByText('Invoice Generator', { exact: true })).toBeVisible({ timeout: 5000 });


    // Part 3: Fill in invoice details
    // Step 1: Your Details (From) - Assuming these are pre-filled or not strictly required by the test flow for now
    // For a full test, you'd fill these:
    // await page.getByLabel('Your Name').fill('Test Invoice Sender');
    // await page.getByLabel('Your Email').fill('sender_invoice@example.com');
    // ... other "Your Details" fields

    // Click "Next Step" to go to "Bill To" (Company Details / Customer Selection)
    // The form uses localStorage to manage steps, direct navigation or programmatic step changes might be complex.
    // We'll rely on clicking the "Next Step" button.
    // The "Next Step" button is inside FormSteps component.
    // Let's assume the initial step is 1.
    await page.getByRole('button', { name: 'Next Step' }).click(); // To Step 2 (Company Details)
    
    // Step 2: Company Details (To) - Select the customer
    await expect(page.getByText('Company Details (To)')).toBeVisible();
    
    // Select the newly created customer from the dropdown
    // The select element is now directly in CompanyDetailsForm
    const customerSelect = page.locator('select#customerId');
    await expect(customerSelect).toBeVisible({timeout: 10000}); // Wait for customers to load
    
    // Wait for the option with the customer name to be present
    await expect(customerSelect.locator(`option:has-text("${createdCustomerName}")`)).toBeVisible({ timeout: 10000 });
    await customerSelect.selectOption({ label: createdCustomerName });
    
    // Fill other optional company details if needed, e.g., company email
    // await page.getByLabel('Client Email (Optional...)').fill('client_contact@example.com');


    // Click "Next Step" to go to Invoice Details
    await page.getByRole('button', { name: 'Next Step' }).click(); // To Step 3 (Invoice Details)

    // Step 3: Invoice Details
    await expect(page.getByText('Invoice Details', { exact: true })).toBeVisible();
    const uniqueInvoiceNumber = getUniqueInvoiceNumber();
    await page.getByLabel('Invoice No').fill(uniqueInvoiceNumber);
    
    // Dates - Assuming DateInput component allows direct text input or has accessible calendar popup
    // For simplicity, let's assume direct input or that defaults are fine for now.
    // await page.getByLabel('Issue Date').fill('2024-05-26'); 
    // await page.getByLabel('Due Date').fill('2024-06-25');

    // Add line items
    // Locators for items depend heavily on ItemTable.tsx structure.
    // Assuming CustomTextInput for item fields inside ItemTable
    // This will target the *first* row's inputs.
    await page.getByPlaceholder('Item name').first().fill('Test Item 1');
    await page.getByPlaceholder('Enter Qty').first().fill('2');
    await page.getByPlaceholder('Enter Price').first().fill('100');
    
    // Verify calculated total for the item (e.g., 2 * 100 = 200)
    // This requires knowing the exact locator for the item total.
    // For now, we'll assume it calculates correctly and proceed.
    // await expect(page.locator('.item-total').first()).toHaveText('200.00');

    // Verify overall totals (Subtotal, Tax, Total Amount)
    // These locators are in PreviewDetails.tsx, need to ensure they are updated and visible
    // For this test, we'll primarily check the final total amount if available, or rely on the invoice list.
    // Example: await expect(page.getByText('Total Amount:')).toContainText('200.00'); // Or whatever the total is

    // Click "Next Step" until save or review step if applicable
    // Or directly click a "Save" or "Preview" button if visible on this step.
    // The current structure has a "Save Invoice" button on the main NewInvoiceForm component,
    // not tied to a specific step beyond user being logged in.
    // The "Save Invoice" button is outside the step-specific forms.

    // Part 4: Click the "Save Invoice" button
    // This button is available on NewInvoiceForm.tsx
    const saveButton = page.getByRole('button', { name: 'Save Invoice' });
    await expect(saveButton).toBeVisible();
    await saveButton.click();

    // Part 5: Assertion for success message
    // The message appears on NewInvoiceForm.tsx
    await expect(page.getByText('Invoice saved successfully!')).toBeVisible({ timeout: 15000 });

    // Part 6: Navigate to the invoice list page
    await page.goto('/invoices');
    await expect(page.getByRole('heading', { name: 'My Invoices' })).toBeVisible({ timeout: 5000 });

    // Part 7: Assertion for the new invoice in the list
    // Locate the row containing the new invoice number and customer name.
    const newInvoiceRow = page.locator('table tbody tr', { 
      hasText: uniqueInvoiceNumber 
    }).filter({
      has: page.getByText(createdCustomerName) // Ensure customer name is also in the row
    });

    await expect(newInvoiceRow).toBeVisible({ timeout: 10000 }); // Wait for list to update

    // Verify key details in that row
    await expect(newInvoiceRow.getByText(uniqueInvoiceNumber)).toBeVisible();
    await expect(newInvoiceRow.getByText(createdCustomerName)).toBeVisible();
    // await expect(newInvoiceRow.getByText('2024-05-26')).toBeVisible(); // Or formatted date
    await expect(newInvoiceRow.getByText('200.00')).toBeVisible(); // Assuming total was 200.00
    await expect(newInvoiceRow.getByText('Draft', { exact: true })).toBeVisible(); // Status
  });
});
