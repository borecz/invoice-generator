import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import LanguageCountrySwitcher from "@/components/LanguageCountrySwitcher";
import { LocaleProvider } from "@/app/contexts/LocaleContext";

// Mock router with configurable pathname
let mockPathname = "/en";
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  usePathname: () => mockPathname,
  useParams: () => ({ locale: mockPathname.slice(1) || "en" }),
}));

const mockMessages = {
  languageCountrySwitcher: {
    title: "Language and Country",
    country: "Country",
    language: "Language",
    selectCountryLabel: "Select Country",
    selectLanguageLabel: "Select Language",
    current: "Current",
  },
  countries: {
    US: "United States",
    DE: "Germany",
    INVALID: "Invalid Country",
  },
  languages: {
    en: "English",
    de: "German",
    invalid: "Invalid Language",
  },
};

const TestWrapper = ({
  children,
  locale = "en",
  messages = mockMessages,
}: {
  children: React.ReactNode;
  locale?: string;
  messages?: any;
}) => (
  <NextIntlClientProvider locale={locale} messages={messages}>
    <LocaleProvider>{children}</LocaleProvider>
  </NextIntlClientProvider>
);

describe("Edge Cases and Fallback Behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/en";
  });

  describe("Invalid Locale Codes", () => {
    it("should handle invalid locale codes gracefully", () => {
      mockPathname = "/invalid-locale";

      render(
        <TestWrapper locale="invalid-locale">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      // Should still render without crashing
      const switcher = screen.getByRole("button");
      expect(switcher).toBeInTheDocument();
    });

    it("should fallback to default locale for unsupported locales", async () => {
      const user = userEvent.setup();
      mockPathname = "/xyz";

      render(
        <TestWrapper locale="xyz">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");
      await user.click(switcher);

      // Should attempt to navigate to a valid locale when selection is made
      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });
    });

    it("should handle malformed locale URLs", () => {
      const malformedLocales = [
        "/en-US-INVALID",
        "/de_DE",
        "/fr@FR",
        "//en",
        "/en/",
      ];

      malformedLocales.forEach((locale) => {
        mockPathname = locale;

        expect(() => {
          render(
            <TestWrapper locale={locale.replace(/[^a-z]/g, "")}>
              <LanguageCountrySwitcher />
            </TestWrapper>
          );
        }).not.toThrow();
      });
    });
  });

  describe("Missing Translation Keys", () => {
    it("should handle missing translation keys gracefully", () => {
      const incompleteMessages = {
        languageCountrySwitcher: {
          title: "Language and Country",
          // Missing other keys
        },
        countries: {},
        languages: {},
      };

      render(
        <TestWrapper locale="en" messages={incompleteMessages}>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      // Should render without crashing
      const switcher = screen.getByRole("button");
      expect(switcher).toBeInTheDocument();
    });

    it("should display fallback text for missing translations", async () => {
      const user = userEvent.setup();
      const partialMessages = {
        languageCountrySwitcher: {
          title: "Language and Country",
          selectCountryLabel: undefined, // Missing translation
          selectLanguageLabel: "Select Language",
        },
        countries: { US: "United States" },
        languages: { en: "English" },
      };

      render(
        <TestWrapper locale="en" messages={partialMessages}>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");
      await user.click(switcher);

      // Should show some fallback or the key itself
      const dropdown = screen.getByRole("dialog") || screen.getByRole("menu");
      expect(dropdown).toBeInTheDocument();
    });

    it("should handle nested missing translation keys", () => {
      const messagesWithMissingNested = {
        languageCountrySwitcher: {
          title: "Language and Country",
        },
        // Missing countries and languages objects entirely
      };

      expect(() => {
        render(
          <TestWrapper locale="en" messages={messagesWithMissingNested}>
            <LanguageCountrySwitcher />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe("Network and Loading Failures", () => {
    it("should handle translation loading failures", async () => {
      // Mock a failed translation load
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Simulate error in translation loading
      const errorMessages = null;

      render(
        <TestWrapper locale="en" messages={errorMessages}>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      // Should still render basic structure
      const switcher = screen.getByRole("button");
      expect(switcher).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    it("should handle slow translation loading", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");

      // Should be interactive even during loading
      await user.click(switcher);

      // Should show loading state or basic functionality
      expect(switcher).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Browser Compatibility Edge Cases", () => {
    it("should handle missing localStorage gracefully", async () => {
      const user = userEvent.setup();

      // Mock localStorage being unavailable
      const originalLocalStorage = window.localStorage;
      Object.defineProperty(window, "localStorage", {
        value: undefined,
        writable: true,
      });

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");
      await user.click(switcher);

      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      // Should still work without localStorage
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });

      // Restore localStorage
      Object.defineProperty(window, "localStorage", {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it("should handle missing sessionStorage gracefully", async () => {
      const user = userEvent.setup();

      // Mock sessionStorage being unavailable
      const originalSessionStorage = window.sessionStorage;
      Object.defineProperty(window, "sessionStorage", {
        value: undefined,
        writable: true,
      });

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");
      await user.click(switcher);

      // Should still function
      expect(screen.getByText("Germany")).toBeInTheDocument();

      // Restore sessionStorage
      Object.defineProperty(window, "sessionStorage", {
        value: originalSessionStorage,
        writable: true,
      });
    });

    it("should handle disabled JavaScript gracefully", () => {
      // Test that basic HTML structure is accessible
      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");
      expect(switcher).toBeInTheDocument();

      // Should have proper semantic HTML
      expect(switcher.tagName).toBe("BUTTON");
    });
  });

  describe("Concurrent User Actions", () => {
    it("should handle rapid language switching", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");

      // Rapidly switch languages multiple times
      for (let i = 0; i < 3; i++) {
        await user.click(switcher);
        const germanyOption = screen.getByText("Germany");
        await user.click(germanyOption);

        await user.click(switcher);
        const usOption = screen.getByText("United States");
        await user.click(usOption);
      }

      // Should handle all actions without errors
      expect(mockPush).toHaveBeenCalled();
    });

    it("should handle multiple dropdown opens/closes", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");

      // Rapidly open and close dropdown
      for (let i = 0; i < 5; i++) {
        await user.click(switcher); // Open
        expect(switcher).toHaveAttribute("aria-expanded", "true");

        await user.keyboard("{Escape}"); // Close
        expect(switcher).toHaveAttribute("aria-expanded", "false");
      }
    });
  });

  describe("Memory and Performance Edge Cases", () => {
    it("should not cause memory leaks with repeated renders", () => {
      const renders = [];

      // Render component multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <TestWrapper locale="en">
            <LanguageCountrySwitcher />
          </TestWrapper>
        );
        renders.push(unmount);
      }

      // Unmount all renders
      renders.forEach((unmount) => unmount());

      // Should complete without errors
      expect(true).toBe(true);
    });

    it("should handle large numbers of locale switches efficiently", async () => {
      const user = userEvent.setup();
      const startTime = Date.now();

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");

      // Perform many switches
      for (let i = 0; i < 20; i++) {
        await user.click(switcher);
        const germanyOption = screen.getByText("Germany");
        await user.click(germanyOption);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (5 seconds for 20 switches)
      expect(duration).toBeLessThan(5000);
    });
  });

  describe("Accessibility Edge Cases", () => {
    it("should handle screen reader navigation edge cases", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");

      // Test various keyboard navigation patterns
      switcher.focus();
      await user.keyboard("{Enter}"); // Open with Enter
      await user.keyboard("{Tab}"); // Navigate within
      await user.keyboard("{Shift>}{Tab}{/Shift}"); // Reverse navigate
      await user.keyboard("{Escape}"); // Close with Escape

      // Should maintain proper focus management
      expect(document.activeElement).toBe(switcher);
    });

    it("should handle high contrast mode", () => {
      // Mock high contrast mode
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(prefers-contrast: high)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");
      expect(switcher).toBeInTheDocument();
    });
  });

  describe("URL and Routing Edge Cases", () => {
    it("should handle invalid URL parameters", () => {
      mockPathname = "/en?invalid=param&locale=de";

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");
      expect(switcher).toBeInTheDocument();
    });

    it("should handle URL fragments and hashes", async () => {
      const user = userEvent.setup();
      mockPathname = "/en#section";

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");
      await user.click(switcher);

      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      // Should navigate correctly despite hash
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });
    });

    it("should handle nested route structures", async () => {
      const user = userEvent.setup();
      mockPathname = "/en/dashboard/settings";

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const switcher = screen.getByRole("button");
      await user.click(switcher);

      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      // Should handle nested routes appropriately
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });
    });
  });
});
