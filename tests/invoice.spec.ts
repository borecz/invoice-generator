import { test, expect } from "@playwright/test";

const getUniqueInvoiceNumber = () => `INV-${Date.now()}`;
const getUniqueCustomerNameForInvoice = () => `InvCust_${Date.now()}`;

test.describe("Invoice Management", () => {
  let createdCustomerName: string;
  let createdCustomerId: string; // To store the ID of the customer created for selection

  // Navigate to invoice creation page before each test (using shared authentication)
  test.beforeEach(async ({ page }) => {
    await test.step("Navigate to invoice creation page", async () => {
      await page.goto("/en/new");
      await page.waitForLoadState("networkidle");
      // Wait for the page to load - look for a key element from the form
      await expect(page.getByText("Invoice Details")).toBeVisible({
        timeout: 10000,
      });
    });
  });

  test("Create a New Invoice", async ({ page }) => {
    await test.step("Create a new customer for this invoice test", async () => {
      createdCustomerName = getUniqueCustomerNameForInvoice();
      const customerEmail = `inv_cust_${Date.now()}@example.com`;
      const customerAddress = `${Date.now()} Invoice St, Testville`;

      await page.goto("/en/customers"); // Navigate to customer management page
      await expect(
        page.getByRole("heading", { name: "Customer Management" })
      ).toBeVisible({ timeout: 5000 });

      // Click Add Customer to show the form
      await page.getByRole("button", { name: "Add Customer" }).click();

      await page.getByPlaceholder("John Doe").fill(createdCustomerName);
      await page.getByPlaceholder("john.doe@example.com").fill(customerEmail);
      await page
        .getByPlaceholder("123 Main St, Anytown, USA")
        .fill(customerAddress);
      // Submit the form (use last() to get the submit button in the form)
      await page.getByRole("button", { name: "Add Customer" }).last().click();
      await expect(page.getByText("Customer added successfully!")).toBeVisible({
        timeout: 10000,
      });
    });

    await test.step("Navigate back to invoice creation page", async () => {
      await page.goto("/en/new");
      await expect(page.getByText("Invoice Details")).toBeVisible({
        timeout: 5000,
      });
    });

    await test.step("Fill invoice form and create invoice", async () => {
      // Fill invoice number
      const uniqueInvoiceNumber = getUniqueInvoiceNumber();
      await page.getByLabel("Invoice Number").fill(uniqueInvoiceNumber);

      // Select existing customer (radio button should be selected by default)
      await expect(page.getByText("Select Existing Customer")).toBeVisible();

      // Select the customer from dropdown
      await page.getByRole("combobox").click();
      await page.getByText(createdCustomerName).click();

      // Add line items
      await page.getByPlaceholder("Item name").first().fill("Test Item 1");
      await page.getByPlaceholder("Qty").first().fill("2");
      await page.getByPlaceholder("Price").first().fill("100");

      // Submit the form
      const createButton = page.getByRole("button", { name: "Create Invoice" });
      await expect(createButton).toBeVisible();
      await createButton.click();
    });

    await test.step("Verify success and check dashboard", async () => {
      // Wait for success message and redirect to dashboard
      await expect(page.getByText("Invoice created successfully")).toBeVisible({
        timeout: 15000,
      });

      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });
  });
});
