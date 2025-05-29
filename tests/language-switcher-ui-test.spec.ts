import { test, expect } from "@playwright/test";

test.describe("Language Switcher UI Tests", () => {
  test("Language switcher shows flag and initials format (🇺🇸 US EN)", async ({
    page,
  }) => {
    // Navigate to English landing page
    await page.goto("/en");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Find the language switcher button
    const languageSwitcher = page.getByRole("button", {
      name: /Language and region settings/i,
    });
    await expect(languageSwitcher).toBeVisible();

    // Check that it contains the US flag emoji
    await expect(languageSwitcher).toContainText("🇺🇸");

    // Check that it contains "US" (country initials)
    await expect(languageSwitcher).toContainText("US");

    // Check that it contains "EN" (language initials)
    await expect(languageSwitcher).toContainText("EN");

    console.log("✅ English language switcher shows: 🇺🇸 US EN");
  });

  test("Language switcher works for Italian (🇮🇹 IT IT)", async ({ page }) => {
    // Navigate to Italian landing page
    await page.goto("http://localhost:3000/it");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Find the language switcher button
    const languageSwitcher = page.getByRole("button", {
      name: /Language and region settings/i,
    });
    await expect(languageSwitcher).toBeVisible();

    // Check that it contains the Italian flag emoji
    await expect(languageSwitcher).toContainText("🇮🇹");

    // Check that it contains "IT" (country initials)
    await expect(languageSwitcher).toContainText("IT");

    console.log("✅ Italian language switcher shows: 🇮🇹 IT IT");
  });

  test("Language switcher works for Czech (🇨🇿 CZ CS)", async ({ page }) => {
    // Navigate to Czech landing page
    await page.goto("http://localhost:3000/cs");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Find the language switcher button
    const languageSwitcher = page.getByRole("button", {
      name: /Language and region settings/i,
    });
    await expect(languageSwitcher).toBeVisible();

    // Check that it contains the Czech flag emoji
    await expect(languageSwitcher).toContainText("🇨🇿");

    // Check that it contains "CZ" (country initials)
    await expect(languageSwitcher).toContainText("CZ");

    // Check that it contains "CS" (language initials)
    await expect(languageSwitcher).toContainText("CS");

    console.log("✅ Czech language switcher shows: 🇨🇿 CZ CS");
  });

  test("Language switcher works for Russian (🇷🇺 RU RU)", async ({ page }) => {
    // Navigate to Russian landing page
    await page.goto("http://localhost:3000/ru");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Find the language switcher button
    const languageSwitcher = page.getByRole("button", {
      name: /Language and region settings/i,
    });
    await expect(languageSwitcher).toBeVisible();

    // Check that it contains the Russian flag emoji
    await expect(languageSwitcher).toContainText("🇷🇺");

    // Check that it contains "RU" (country initials)
    await expect(languageSwitcher).toContainText("RU");

    console.log("✅ Russian language switcher shows: 🇷🇺 RU RU");
  });

  test("Language switcher dropdown shows new format for all options", async ({
    page,
  }) => {
    // Navigate to English landing page
    await page.goto("http://localhost:3000/en");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Click the language switcher to open dropdown
    const languageSwitcher = page.getByRole("button", {
      name: /Language and region settings/i,
    });
    await languageSwitcher.click();

    // Wait for dropdown to appear
    await page.waitForSelector('[role="menu"]', { state: "visible" });

    // Check that language options show the new format
    const languageSection = page
      .locator("text=Language")
      .locator("..")
      .locator("..");

    // Check English option
    const englishOption = languageSection
      .locator("button")
      .filter({ hasText: "English" });
    await expect(englishOption).toContainText("🇺🇸");
    await expect(englishOption).toContainText("US");
    await expect(englishOption).toContainText("EN");

    // Check Italian option
    const italianOption = languageSection
      .locator("button")
      .filter({ hasText: "Italiano" });
    await expect(italianOption).toContainText("🇮🇹");
    await expect(italianOption).toContainText("IT");

    // Check Czech option
    const czechOption = languageSection
      .locator("button")
      .filter({ hasText: "Čeština" });
    await expect(czechOption).toContainText("🇨🇿");
    await expect(czechOption).toContainText("CZ");
    await expect(czechOption).toContainText("CS");

    // Check Russian option
    const russianOption = languageSection
      .locator("button")
      .filter({ hasText: "Русский" });
    await expect(russianOption).toContainText("🇷🇺");
    await expect(russianOption).toContainText("RU");

    console.log(
      "✅ All language options show flag + country initials + language initials"
    );
  });

  test("Language switcher dropdown country section shows new format", async ({
    page,
  }) => {
    // Navigate to English landing page
    await page.goto("http://localhost:3000/en");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Click the language switcher to open dropdown
    const languageSwitcher = page.getByRole("button", {
      name: /Language and region settings/i,
    });
    await languageSwitcher.click();

    // Wait for dropdown to appear
    await page.waitForSelector('[role="menu"]', { state: "visible" });

    // Check that country options show the new format
    const countrySection = page
      .locator("text=Current Shop")
      .locator("..")
      .locator("..");

    // Check United States option
    const usOption = countrySection
      .locator("button")
      .filter({ hasText: "United States" });
    await expect(usOption).toContainText("🇺🇸");
    await expect(usOption).toContainText("US");
    await expect(usOption).toContainText("EN");

    // Check Italy option
    const italyOption = countrySection
      .locator("button")
      .filter({ hasText: "Italy" });
    await expect(italyOption).toContainText("🇮🇹");
    await expect(italyOption).toContainText("IT");

    // Check Czech Republic option
    const czechOption = countrySection
      .locator("button")
      .filter({ hasText: "Czech Republic" });
    await expect(czechOption).toContainText("🇨🇿");
    await expect(czechOption).toContainText("CZ");
    await expect(czechOption).toContainText("CS");

    // Check Russia option
    const russiaOption = countrySection
      .locator("button")
      .filter({ hasText: "Russia" });
    await expect(russiaOption).toContainText("🇷🇺");
    await expect(russiaOption).toContainText("RU");

    console.log(
      "✅ All country options show flag + country initials + language initials"
    );
  });

  test("Language switching functionality works with new UI", async ({
    page,
  }) => {
    // Start with English
    await page.goto("http://localhost:3000/en");
    await page.waitForLoadState("networkidle");

    // Verify we're on English page
    await expect(page).toHaveURL(/\/en/);

    // Open language switcher
    const languageSwitcher = page.getByRole("button", {
      name: /Language and region settings/i,
    });
    await languageSwitcher.click();

    // Wait for dropdown
    await page.waitForSelector('[role="menu"]', { state: "visible" });

    // Click Italian option
    const italianOption = page
      .locator("button")
      .filter({ hasText: "Italiano" });
    await italianOption.click();

    // Verify we're now on Italian page
    await page.waitForURL(/\/it/);
    await expect(page).toHaveURL(/\/it/);

    // Verify language switcher now shows Italian format
    const newLanguageSwitcher = page.getByRole("button", {
      name: /Language and region settings/i,
    });
    await expect(newLanguageSwitcher).toContainText("🇮🇹");
    await expect(newLanguageSwitcher).toContainText("IT");

    console.log("✅ Language switching works correctly with new UI format");
  });

  test("Mobile language switcher shows new format", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to English landing page
    await page.goto("http://localhost:3000/en");
    await page.waitForLoadState("networkidle");

    // Open mobile menu
    const mobileMenuButton = page.getByRole("button", {
      name: /toggle mobile menu/i,
    });
    await expect(mobileMenuButton).toBeVisible();
    await mobileMenuButton.click();

    // Wait for mobile menu to open
    await page.waitForSelector('[role="navigation"]', { state: "visible" });

    // Find language switcher in mobile menu
    const mobileLangSwitcher = page.getByRole("button", {
      name: /Language and region settings/i,
    });
    await expect(mobileLangSwitcher).toBeVisible();

    // Check that it shows the new format
    await expect(mobileLangSwitcher).toContainText("🇺🇸");
    await expect(mobileLangSwitcher).toContainText("US");
    await expect(mobileLangSwitcher).toContainText("EN");

    console.log("✅ Mobile language switcher shows new format: 🇺🇸 US EN");
  });

  test("Language switcher maintains format across all pages", async ({
    page,
  }) => {
    const testPages = ["/en", "/en/auth/login", "/en/auth/signup"];

    for (const testPage of testPages) {
      console.log(`Testing language switcher format on: ${testPage}`);

      // Navigate to test page
      await page.goto(`http://localhost:3000${testPage}`);
      await page.waitForLoadState("networkidle");

      // Find language switcher
      const languageSwitcher = page.getByRole("button", {
        name: /Language and region settings/i,
      });
      await expect(languageSwitcher).toBeVisible();

      // Verify format
      await expect(languageSwitcher).toContainText("🇺🇸");
      await expect(languageSwitcher).toContainText("US");
      await expect(languageSwitcher).toContainText("EN");

      console.log(`✅ Language switcher format correct on: ${testPage}`);
    }
  });
});
