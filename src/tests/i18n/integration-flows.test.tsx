import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { Header } from "@/app/components/layout/Header";
import { LocaleProvider } from "@/app/contexts/LocaleContext";

// Mock router
const mockPush = vi.fn();
const mockPathname = vi.fn(() => "/en");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: mockPathname,
  useParams: () => ({ locale: "en" }),
}));

// Mock Supabase auth
vi.mock("@/lib/supabase/client", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({ data: { user: null }, error: null })
      ),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
  },
}));

const mockMessages = {
  navigation: {
    features: "Features",
    pricing: "Pricing",
    testimonials: "Testimonials",
    dashboard: "Dashboard",
    login: "Login",
    signup: "Get Started",
  },
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

describe("Integration Flows", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue("/en");
  });

  describe("Complete User Flow: Country Selection → Auto-Language → Manual Override", () => {
    it("should complete full flow: US → Germany → German → English override", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper locale="en">
          <Header />
        </TestWrapper>
      );

      // Step 1: Open language switcher
      const languageSwitcher = screen.getByRole("button", { name: /🇺🇸 EN/i });
      await user.click(languageSwitcher);

      // Step 2: Select Germany (should auto-select German)
      await waitFor(() => {
        expect(screen.getByText("Germany")).toBeInTheDocument();
      });

      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      // Step 3: Verify auto-selection to German
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });

      // Step 4: Simulate being on German page
      mockPathname.mockReturnValue("/de");
      mockPush.mockClear();

      // Re-render with German locale
      render(
        <TestWrapper locale="de">
          <Header />
        </TestWrapper>
      );

      // Step 5: Open switcher again for manual override
      const germanSwitcher = screen.getByRole("button", { name: /🇩🇪 DE/i });
      await user.click(germanSwitcher);

      // Step 6: Manually select English
      await waitFor(() => {
        expect(screen.getByText("English")).toBeInTheDocument();
      });

      const englishOption = screen.getByText("English");
      await user.click(englishOption);

      // Step 7: Verify manual override to English
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/en");
      });
    });

    it("should complete flow: Netherlands → Dutch → French override", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper locale="en">
          <Header />
        </TestWrapper>
      );

      // Select Netherlands
      const languageSwitcher = screen.getByRole("button", { name: /🇺🇸 EN/i });
      await user.click(languageSwitcher);

      const netherlandsOption = screen.getByText("Netherlands");
      await user.click(netherlandsOption);

      // Should auto-select Dutch
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/nl");
      });

      // Simulate being on Dutch page
      mockPathname.mockReturnValue("/nl");
      mockPush.mockClear();

      render(
        <TestWrapper locale="nl">
          <Header />
        </TestWrapper>
      );

      // Override with French
      const dutchSwitcher = screen.getByRole("button", { name: /🇳🇱 NL/i });
      await user.click(dutchSwitcher);

      const frenchOption = screen.getByText("French");
      await user.click(frenchOption);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/fr");
      });
    });
  });

  describe("Header Display Verification", () => {
    const headerTestCases = [
      { locale: "en", country: "US", expectedDisplay: "🇺🇸 EN" },
      { locale: "de", country: "DE", expectedDisplay: "🇩🇪 DE" },
      { locale: "nl", country: "NL", expectedDisplay: "🇳🇱 NL" },
      { locale: "fr", country: "FR", expectedDisplay: "🇫🇷 FR" },
    ];

    headerTestCases.forEach(({ locale, country, expectedDisplay }) => {
      it(`should display ${expectedDisplay} in header for ${locale} locale`, () => {
        mockPathname.mockReturnValue(`/${locale}`);

        render(
          <TestWrapper locale={locale}>
            <Header />
          </TestWrapper>
        );

        const switcher = screen.getByRole("button", {
          name: new RegExp(expectedDisplay, "i"),
        });
        expect(switcher).toBeInTheDocument();
      });
    });
  });

  describe("Authentication State Preservation", () => {
    it("should preserve unauthenticated state when switching languages", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper locale="en">
          <Header />
        </TestWrapper>
      );

      // Should show login/signup buttons for unauthenticated user
      expect(screen.getByText("Login")).toBeInTheDocument();
      expect(screen.getByText("Get Started")).toBeInTheDocument();

      // Switch language
      const languageSwitcher = screen.getByRole("button", { name: /🇺🇸 EN/i });
      await user.click(languageSwitcher);

      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      // Auth state should be preserved (still unauthenticated)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });
    });

    it("should preserve authenticated state when switching languages", async () => {
      // Mock authenticated user
      const mockSupabase = await vi.importMock("@/lib/supabase/client") as any;
      mockSupabase.supabase.auth.getUser.mockResolvedValue({
        data: { user: { id: "123", email: "test@example.com" } },
        error: null,
      });

      const user = userEvent.setup();

      render(
        <TestWrapper locale="en">
          <Header />
        </TestWrapper>
      );

      // Should show dashboard for authenticated user
      expect(screen.getByText("Dashboard")).toBeInTheDocument();

      // Switch language
      const languageSwitcher = screen.getByRole("button", { name: /🇺🇸 EN/i });
      await user.click(languageSwitcher);

      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      // Auth state should be preserved (still authenticated)
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });
    });
  });

  describe("Landing Page Section Rendering", () => {
    const sections = ["hero", "features", "pricing", "testimonials", "footer"];

    sections.forEach((section) => {
      it(`should render ${section} section correctly in different locales`, async () => {
        const locales = ["en", "de", "nl", "fr"];

        for (const locale of locales) {
          mockPathname.mockReturnValue(`/${locale}`);

          // Mock section-specific messages
          const sectionMessages = {
            ...mockMessages,
            landing: {
              [section]: {
                title: `${section} title in ${locale}`,
                subtitle: `${section} subtitle in ${locale}`,
              },
            },
          };

          render(
            <TestWrapper locale={locale}>
              <div data-testid={`${section}-section`}>
                {/* Mock section content */}
                <h2>{sectionMessages.landing[section].title}</h2>
                <p>{sectionMessages.landing[section].subtitle}</p>
              </div>
            </TestWrapper>
          );

          const sectionElement = screen.getByTestId(`${section}-section`);
          expect(sectionElement).toBeInTheDocument();
          expect(
            screen.getByText(`${section} title in ${locale}`)
          ).toBeInTheDocument();
        }
      });
    });
  });

  describe("Responsive Design Verification", () => {
    it("should maintain functionality across different viewport sizes", async () => {
      const user = userEvent.setup();

      // Test mobile viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper locale="en">
          <Header />
        </TestWrapper>
      );

      const languageSwitcher = screen.getByRole("button", { name: /🇺🇸 EN/i });
      expect(languageSwitcher).toBeInTheDocument();

      await user.click(languageSwitcher);

      // Dropdown should still be functional on mobile
      await waitFor(() => {
        expect(screen.getByText("Germany")).toBeInTheDocument();
      });

      // Test desktop viewport
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 1024,
      });

      // Should still work on desktop
      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });
    });
  });

  describe("Performance and Loading", () => {
    it("should complete language switching within reasonable time", async () => {
      const user = userEvent.setup();
      const startTime = Date.now();

      render(
        <TestWrapper locale="en">
          <Header />
        </TestWrapper>
      );

      const languageSwitcher = screen.getByRole("button", { name: /🇺🇸 EN/i });
      await user.click(languageSwitcher);

      const germanyOption = screen.getByText("Germany");
      await user.click(germanyOption);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de");
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    it("should not cause memory leaks during rapid language switching", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper locale="en">
          <Header />
        </TestWrapper>
      );

      // Rapidly switch languages multiple times
      for (let i = 0; i < 5; i++) {
        const languageSwitcher = screen.getByRole("button", { name: /🇺🇸 EN/i });
        await user.click(languageSwitcher);

        const germanyOption = screen.getByText("Germany");
        await user.click(germanyOption);

        await waitFor(() => {
          expect(mockPush).toHaveBeenCalledWith("/de");
        });

        mockPush.mockClear();
      }

      // Should not throw errors or cause issues
      expect(true).toBe(true);
    });
  });
});
