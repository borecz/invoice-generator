import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import LanguageCountrySwitcher from "@/components/LanguageCountrySwitcher";
import { LocaleProvider } from "@/app/contexts/LocaleContext";

// Mock the router
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: vi.fn(),
  }),
  usePathname: () => "/en",
  useParams: () => ({ locale: "en" }),
}));

// Mock translations for testing
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
    IT: "Italy",
  },
  languages: {
    en: "English",
    de: "German",
    nl: "Dutch",
    fr: "French",
    it: "Italian",
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

describe("Language/Country Switcher Functionality", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Auto-Language Selection", () => {
    it("should auto-select German when Germany is selected", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      // Open the switcher
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Wait for dropdown to appear
      await waitFor(() => {
        expect(screen.getByText("Select Country")).toBeInTheDocument();
      });

      // Select Germany
      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      // Verify that router.push was called with German locale
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });
    });

    it("should auto-select Dutch when Netherlands is selected", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Select Country")).toBeInTheDocument();
      });

      const netherlandsOption = screen.getByText("Netherlands");
      await user.click(netherlandsOption);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/nl");
      });
    });

    it("should auto-select French when France is selected", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Select Country")).toBeInTheDocument();
      });

      const franceOption = screen.getByText("France");
      await user.click(franceOption);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/fr");
      });
    });

    it("should auto-select Italian when Italy is selected", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      await waitFor(() => {
        expect(screen.getByText("Select Country")).toBeInTheDocument();
      });

      const italyOption = screen.getByText("Italy");
      await user.click(italyOption);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/it");
      });
    });
  });

  describe("Manual Language Override", () => {
    it("should allow manual language selection after country selection", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // First select Germany (auto-selects German)
      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      // Wait for auto-selection
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });

      // Clear the mock to test manual override
      mockPush.mockClear();

      // Open switcher again
      await user.click(trigger);

      // Manually select English language
      const englishOption = screen.getByText("English");
      await user.click(englishOption);

      // Should navigate to English
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/en");
      });
    });

    it("should preserve manual language override until country changes", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper locale="en">
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");

      // Select Germany first
      await user.click(trigger);
      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      // Override with English
      await user.click(trigger);
      const englishOption = screen.getByText("English");
      await user.click(englishOption);

      // Verify English is maintained
      expect(mockPush).toHaveBeenLastCalledWith("/en");
    });
  });

  describe("URL Routing Updates", () => {
    const routingTestCases = [
      { country: "Germany", expectedRoute: "/de" },
      { country: "Netherlands", expectedRoute: "/nl" },
      { country: "France", expectedRoute: "/fr" },
      { country: "Italy", expectedRoute: "/it" },
      { country: "United States", expectedRoute: "/en" },
    ];

    routingTestCases.forEach(({ country, expectedRoute }) => {
      it(`should navigate to ${expectedRoute} when ${country} is selected`, async () => {
        const user = userEvent.setup();

        render(
          <TestWrapper>
            <LanguageCountrySwitcher />
          </TestWrapper>
        );

        const trigger = screen.getByRole("button");
        await user.click(trigger);

        const countryOption = screen.getByText(country);
        await user.click(countryOption);

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith(expectedRoute);
        });
      });
    });
  });

  describe("Two-Column UI Layout", () => {
    it("should display countries and languages in separate columns", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      await waitFor(() => {
        // Check that both column headers are present
        expect(screen.getByText("Select Country")).toBeInTheDocument();
        expect(screen.getByText("Select Language")).toBeInTheDocument();
      });

      // Check that countries are in the left column
      expect(screen.getByText("Germany")).toBeInTheDocument();
      expect(screen.getByText("Netherlands")).toBeInTheDocument();

      // Check that languages are in the right column
      expect(screen.getByText("English")).toBeInTheDocument();
      expect(screen.getByText("German")).toBeInTheDocument();
    });

    it("should have search functionality for both countries and languages", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      await waitFor(() => {
        // Check that search inputs are present
        expect(
          screen.getByPlaceholderText("Search countries...")
        ).toBeInTheDocument();
        expect(
          screen.getByPlaceholderText("Search languages...")
        ).toBeInTheDocument();
      });

      // Test country search
      const countrySearch = screen.getByPlaceholderText("Search countries...");
      await user.type(countrySearch, "Ger");

      // Germany should still be visible, others might be filtered
      expect(screen.getByText("Germany")).toBeInTheDocument();

      // Test language search
      const languageSearch = screen.getByPlaceholderText("Search languages...");
      await user.type(languageSearch, "Eng");

      // English should still be visible
      expect(screen.getByText("English")).toBeInTheDocument();
    });
  });

  describe("Business Logic vs UI Separation", () => {
    it("should indicate that country affects business logic", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      await waitFor(() => {
        // Should show description about independent selection
        expect(
          screen.getByText(/Select your country and preferred language/)
        ).toBeInTheDocument();
      });
    });

    it("should allow independent country and language selection", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <LanguageCountrySwitcher />
        </TestWrapper>
      );

      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Select Germany (should auto-select German)
      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });

      // Clear mock and manually override language
      mockPush.mockClear();

      await user.click(trigger);
      const englishOption = screen.getByText("English");
      await user.click(englishOption);

      // Should allow English UI with German business logic
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/en");
      });
    });
  });
});
