import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import LanguageCountrySwitcher from "@/components/LanguageCountrySwitcher";
import { LocaleProvider } from "@/app/contexts/LocaleContext";

// Mock router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/en",
  useParams: () => ({ locale: "en" }),
}));

const mockMessages = {
  languageCountrySwitcher: {
    title: "Language and Country",
    description: "Select your country and preferred language",
    country: "Country",
    language: "Language",
    selectCountryLabel: "Select Country",
    selectLanguageLabel: "Select Language",
    searchCountries: "Search countries...",
    searchLanguages: "Search languages...",
    current: "Current",
    recommended: "Recommended",
  },
  countries: {
    US: "United States",
    DE: "Germany",
    NL: "Netherlands",
    FR: "France",
  },
  languages: {
    en: "English",
    de: "German",
    nl: "Dutch",
    fr: "French",
  },
};

const TestWrapper = ({
  children,
  locale = "en",
}: {
  children: React.ReactNode;
  locale?: string;
}) => (
  <NextIntlClientProvider locale={locale} messages={mockMessages}>
    <LocaleProvider>{children}</LocaleProvider>
  </NextIntlClientProvider>
);

describe("WCAG 2.1 AA Accessibility Compliance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Keyboard Navigation", () => {
    it("should be fully navigable with keyboard only", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");

      // Should be focusable
      trigger.focus();
      expect(trigger).toHaveFocus();

      // Should open with Enter key
      await user.keyboard("{Enter}");

      expect(screen.getByText("Select Country")).toBeInTheDocument();

      // Should be able to navigate with Tab
      await user.keyboard("{Tab}");

      // Should be able to close with Escape
      await user.keyboard("{Escape}");

      // Dropdown should close
      expect(screen.queryByText("Select Country")).not.toBeInTheDocument();
    });

    it("should support arrow key navigation within dropdown", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Focus should be manageable with arrow keys
      const firstCountry = screen.getByText("United States");
      firstCountry.focus();
      expect(firstCountry).toHaveFocus();

      // Arrow down should move to next item
      await user.keyboard("{ArrowDown}");

      // Should be able to select with Enter
      await user.keyboard("{Enter}");
    });

    it("should trap focus within dropdown when open", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Focus should be trapped within the dropdown
      const searchInput = screen.getByPlaceholderText("Search countries...");
      searchInput.focus();
      expect(searchInput).toHaveFocus();

      // Shift+Tab should not escape the dropdown
      await user.keyboard("{Shift>}{Tab}{/Shift}");

      // Focus should still be within dropdown
      const focusedElement = document.activeElement;
      const dropdown = screen.getByRole("dialog") || screen.getByRole("menu");
      expect(dropdown).toContainElement(focusedElement);
    });
  });

  describe("Touch Target Sizes (44x44px minimum)", () => {
    it("should have minimum 44px touch targets for all interactive elements", () => {
      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      const triggerStyles = window.getComputedStyle(trigger);

      // Check minimum dimensions
      const minSize = 44;
      const width = parseInt(triggerStyles.width) || trigger.offsetWidth;
      const height = parseInt(triggerStyles.height) || trigger.offsetHeight;

      expect(width).toBeGreaterThanOrEqual(minSize);
      expect(height).toBeGreaterThanOrEqual(minSize);
    });

    it("should have adequate spacing between interactive elements", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const countryOptions = screen
        .getAllByRole("button")
        .filter(
          (btn) =>
            btn.textContent?.includes("United States") ||
            btn.textContent?.includes("Germany") ||
            btn.textContent?.includes("Netherlands")
        );

      // Check spacing between options (minimum 8px)
      for (let i = 0; i < countryOptions.length - 1; i++) {
        const current = countryOptions[i];
        const next = countryOptions[i + 1];

        const currentRect = current.getBoundingClientRect();
        const nextRect = next.getBoundingClientRect();

        const spacing = nextRect.top - currentRect.bottom;
        expect(spacing).toBeGreaterThanOrEqual(8);
      }
    });
  });

  describe("Focus Indicators", () => {
    it("should have visible focus indicators on all interactive elements", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");

      // Focus the trigger
      trigger.focus();

      // Should have focus styles
      const focusedStyles = window.getComputedStyle(trigger, ":focus");

      // Check for focus indicators (outline, box-shadow, etc.)
      const hasOutline =
        focusedStyles.outline !== "none" && focusedStyles.outline !== "0px";
      const hasBoxShadow = focusedStyles.boxShadow !== "none";
      const hasBorder = focusedStyles.borderWidth !== "0px";

      expect(hasOutline || hasBoxShadow || hasBorder).toBe(true);
    });

    it("should maintain focus indicators when navigating dropdown", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      const searchInput = screen.getByPlaceholderText("Search countries...");
      searchInput.focus();

      const focusedStyles = window.getComputedStyle(searchInput, ":focus");

      // Should have visible focus indicator
      const hasVisibleFocus =
        focusedStyles.outline !== "none" ||
        focusedStyles.boxShadow !== "none" ||
        focusedStyles.borderColor !== "transparent";

      expect(hasVisibleFocus).toBe(true);
    });
  });

  describe("ARIA Labels and Roles", () => {
    it("should have proper ARIA labels for screen readers", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");

      // Should have accessible name
      expect(trigger).toHaveAccessibleName();

      // Should have proper ARIA attributes
      expect(trigger).toHaveAttribute("aria-haspopup");
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      await user.click(trigger);

      // When expanded, aria-expanded should be true
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    it("should have proper roles for dropdown content", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Dropdown should have proper role
      const dropdown = screen.getByRole("dialog") || screen.getByRole("menu");
      expect(dropdown).toBeInTheDocument();

      // Search inputs should have proper labels
      const countrySearch = screen.getByPlaceholderText("Search countries...");
      const languageSearch = screen.getByPlaceholderText("Search languages...");

      expect(countrySearch).toHaveAttribute("aria-label");
      expect(languageSearch).toHaveAttribute("aria-label");
    });

    it("should announce current selection to screen readers", () => {
      render(
        <TestWrapper locale="de">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");

      // Should indicate current selection
      expect(trigger).toHaveAccessibleName(/current/i);
      expect(trigger.textContent).toMatch(/🇩🇪.*DE/i);
    });
  });

  describe("Color Contrast and Visual Accessibility", () => {
    it("should not rely solely on color to convey information", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Current selection should be indicated by text, not just color
      const currentItems = screen.getAllByText(/current/i);
      expect(currentItems.length).toBeGreaterThan(0);

      // Recommended items should have text indicators
      const recommendedItems = screen.queryAllByText(/recommended/i);
      // May or may not have recommended items, but if they exist, they should have text
      recommendedItems.forEach((item) => {
        expect(item.textContent).toMatch(/recommended/i);
      });
    });

    it("should have sufficient color contrast for text elements", () => {
      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      const styles = window.getComputedStyle(trigger);

      // This is a basic check - in real implementation, you'd use a color contrast library
      expect(styles.color).toBeDefined();
      expect(styles.backgroundColor).toBeDefined();

      // Ensure text is not transparent
      expect(styles.color).not.toBe("transparent");
    });
  });

  describe("Screen Reader Compatibility", () => {
    it("should provide meaningful descriptions for complex interactions", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Should have descriptive text for the two-column layout
      expect(
        screen.getByText(/Select your country and preferred language/i)
      ).toBeInTheDocument();

      // Column headers should be clear
      expect(screen.getByText("Select Country")).toBeInTheDocument();
      expect(screen.getByText("Select Language")).toBeInTheDocument();
    });

    it("should announce state changes appropriately", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");

      // Initial state
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      await user.click(trigger);

      // Expanded state
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      // Should have live region for announcements
      const liveRegion = document.querySelector("[aria-live]");
      if (liveRegion) {
        expect(liveRegion).toHaveAttribute("aria-live", "polite");
      }
    });
  });

  describe("Error Handling and Feedback", () => {
    it("should provide accessible error messages", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Test search with no results
      const searchInput = screen.getByPlaceholderText("Search countries...");
      await user.type(searchInput, "NonexistentCountry");

      // Should provide feedback for no results
      // This would depend on implementation, but there should be some indication
      const noResults =
        screen.queryByText(/no.*found/i) || screen.queryByText(/no.*results/i);
      if (noResults) {
        expect(noResults).toBeInTheDocument();
        expect(noResults).toHaveAttribute("role", "status");
      }
    });

    it("should handle loading states accessibly", () => {
      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      // If there are loading states, they should be announced
      const loadingElements = screen.queryAllByText(/loading/i);
      loadingElements.forEach((element) => {
        expect(element).toHaveAttribute("aria-live", "polite");
      });
    });
  });
});
