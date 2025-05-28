import { test, expect } from "@playwright/test";
import {
  runAccessibilityCheck,
  checkWCAG21AACompliance,
  runComprehensiveA11yCheck,
  withAccessibilityCheck,
} from "./utils/accessibility";

const getUniqueCustomerName = () => `CustName_${Date.now()}`;

test.describe("Customer Management", () => {
  // Navigate to customers page before each test (using shared authentication)
  test.beforeEach(async ({ page }) => {
    await test.step("Navigate to customers page", async () => {
      await page.goto("/en/customers");
      await page.waitForLoadState("networkidle");
      await expect(
        page.getByRole("heading", { name: "Customer Management" })
      ).toBeVisible({ timeout: 5000 });
    });
  });

  test("Navigate to Customer Page and Verify Initial State (for a new user or after clearing customers)", async ({
    page,
  }) => {
    await test.step("Check customer list state", async () => {
      // The beforeEach already navigates to /customers and checks the main heading.
      // This test will focus on what a user might see if they have no customers yet.
      const customerList = page.locator("table tbody tr");
      const noCustomersMessage = page.getByText("No customers yet");

      const count = await customerList.count();
      if (count === 0) {
        await expect(noCustomersMessage).toBeVisible();
      } else {
        // If customers are present, the "no customers" message should not be visible.
        await expect(noCustomersMessage).not.toBeVisible();
        console.log(
          `Customers found: ${count}. Skipping "No customers found" message check.`
        );
      }
    });
  });

  test(
    withAccessibilityCheck(
      "Create a New Customer and Verify it Appears in List"
    ),
    async ({ page }) => {
      const uniqueCustomerName = getUniqueCustomerName();
      const customerEmail = `customer_${Date.now()}@example.com`;
      const customerAddress = `${Date.now()} Main St, Anytown`;

      await test.step("Run initial accessibility check", async () => {
        // Run accessibility check on customer management page
        await runComprehensiveA11yCheck(page, {
          testName: "Customer Management Page",
          useSoftAssertions: true,
        });
      });

      await test.step("Fill customer form", async () => {
        // First click Add Customer to show the form
        await page.getByRole("button", { name: "Add Customer" }).click();

        // Fill in the new customer form using accessible selectors
        await page.getByPlaceholder("John Doe").fill(uniqueCustomerName);
        await page.getByPlaceholder("john.doe@example.com").fill(customerEmail);
        await page
          .getByPlaceholder("123 Main St, Anytown, USA")
          .fill(customerAddress);
      });

      await test.step("Check form accessibility", async () => {
        // Run accessibility check on filled form state
        await runAccessibilityCheck(page, {
          testName: "Customer Form Filled State",
          useSoftAssertions: true,
        });
      });

      await test.step("Submit customer form", async () => {
        // Look for the submit button within the form
        await page.getByRole("button", { name: "Add Customer" }).last().click();
      });

      await test.step("Verify success message", async () => {
        // Assertion for success message
        await expect(
          page.getByText("Customer added successfully!")
        ).toBeVisible({
          timeout: 10000,
        });
      });

      await test.step("Check success state accessibility", async () => {
        // Run accessibility check after successful customer creation
        await runAccessibilityCheck(page, {
          testName: "Customer Creation Success State",
          useSoftAssertions: true,
        });
      });

      await test.step("Verify customer appears in list", async () => {
        // Locate the row containing the new customer's name.
        const newCustomerRow = page.locator("table tbody tr", {
          hasText: uniqueCustomerName,
        });

        await expect(newCustomerRow).toBeVisible({ timeout: 5000 }); // Ensure the row itself is visible

        // Verify details within that specific row
        await expect(
          newCustomerRow.getByText(uniqueCustomerName)
        ).toBeVisible(); // Name
        await expect(newCustomerRow.getByText(customerEmail)).toBeVisible(); // Email
        await expect(newCustomerRow.getByText(customerAddress)).toBeVisible(); // Address

        // Also check that the "No customers found" message is not visible if it was there before
        const noCustomersMessage = page.getByText(
          "No customers found. Add your first customer using the form above!"
        );
        await expect(noCustomersMessage).not.toBeVisible();
      });

      await test.step("Final accessibility check", async () => {
        // Final accessibility check with customer list populated
        await runAccessibilityCheck(page, {
          testName: "Customer List with Data",
          useSoftAssertions: true,
        });
      });
    }
  );
});
