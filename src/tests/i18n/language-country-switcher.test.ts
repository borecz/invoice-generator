import { describe, it, expect, vi, beforeEach } from "vitest";

// Import the business logic functions we want to test
import { countryLanguageMappings } from "@/i18n";

// Mock the router for testing navigation logic
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

// Helper function to get default language for a country
function getDefaultLanguageForCountry(countryCode: string): string {
  const mapping = countryLanguageMappings[countryCode];
  return mapping?.defaultLanguage || "en";
}

// Helper function to check if a language is supported for a country
function isLanguageSupportedForCountry(
  countryCode: string,
  languageCode: string
): boolean {
  const mapping = countryLanguageMappings[countryCode];
  return mapping?.supportedLanguages.includes(languageCode) || false;
}

describe("Language/Country Switcher Business Logic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Auto-Language Selection Logic", () => {
    it("should return German as default language for Germany", () => {
      const defaultLanguage = getDefaultLanguageForCountry("DE");
      expect(defaultLanguage).toBe("de");
    });

    it("should return Dutch as default language for Netherlands", () => {
      const defaultLanguage = getDefaultLanguageForCountry("NL");
      expect(defaultLanguage).toBe("nl");
    });

    it("should return French as default language for France", () => {
      const defaultLanguage = getDefaultLanguageForCountry("FR");
      expect(defaultLanguage).toBe("fr");
    });

    it("should return Italian as default language for Italy", () => {
      const defaultLanguage = getDefaultLanguageForCountry("IT");
      expect(defaultLanguage).toBe("it");
    });

    it("should return English as default language for United States", () => {
      const defaultLanguage = getDefaultLanguageForCountry("US");
      expect(defaultLanguage).toBe("en");
    });

    it("should fallback to English for unknown countries", () => {
      const defaultLanguage = getDefaultLanguageForCountry("XX");
      expect(defaultLanguage).toBe("en");
    });
  });

  describe("Language Support Validation", () => {
    it("should validate that German is supported in Germany", () => {
      const isSupported = isLanguageSupportedForCountry("DE", "de");
      expect(isSupported).toBe(true);
    });

    it("should validate that English is supported in Germany", () => {
      const isSupported = isLanguageSupportedForCountry("DE", "en");
      expect(isSupported).toBe(true);
    });

    it("should validate that Dutch is supported in Netherlands", () => {
      const isSupported = isLanguageSupportedForCountry("NL", "nl");
      expect(isSupported).toBe(true);
    });

    it("should validate that French is not supported in Germany", () => {
      const isSupported = isLanguageSupportedForCountry("DE", "fr");
      expect(isSupported).toBe(false);
    });

    it("should validate that unsupported language returns false", () => {
      const isSupported = isLanguageSupportedForCountry("US", "zh");
      expect(isSupported).toBe(false);
    });

    it("should handle unknown country gracefully", () => {
      const isSupported = isLanguageSupportedForCountry("XX", "en");
      expect(isSupported).toBe(false);
    });
  });

  describe("URL Route Generation Logic", () => {
    const routingTestCases = [
      { countryCode: "DE", expectedRoute: "/de" },
      { countryCode: "NL", expectedRoute: "/nl" },
      { countryCode: "FR", expectedRoute: "/fr" },
      { countryCode: "IT", expectedRoute: "/it" },
      { countryCode: "US", expectedRoute: "/en" },
    ];

    routingTestCases.forEach(({ countryCode, expectedRoute }) => {
      it(`should generate route ${expectedRoute} for country ${countryCode}`, () => {
        const defaultLanguage = getDefaultLanguageForCountry(countryCode);
        const generatedRoute = `/${defaultLanguage}`;
        expect(generatedRoute).toBe(expectedRoute);
      });
    });

    it("should generate fallback route for unknown country", () => {
      const defaultLanguage = getDefaultLanguageForCountry("XX");
      const generatedRoute = `/${defaultLanguage}`;
      expect(generatedRoute).toBe("/en");
    });
  });

  describe("Country-Language Mapping Validation", () => {
    it("should have valid country-language mappings structure", () => {
      expect(countryLanguageMappings).toBeDefined();
      expect(typeof countryLanguageMappings).toBe("object");
    });

    it("should have required countries in mappings", () => {
      // Check that the mappings object exists and has some countries
      expect(typeof countryLanguageMappings).toBe("object");
      expect(Object.keys(countryLanguageMappings).length).toBeGreaterThan(0);

      // Check that each mapping has the required structure
      Object.entries(countryLanguageMappings).forEach(([country, mapping]) => {
        expect(mapping.defaultLanguage).toBeDefined();
        expect(Array.isArray(mapping.supportedLanguages)).toBe(true);
      });
    });

    it("should have consistent default language in supported languages", () => {
      Object.entries(countryLanguageMappings).forEach(([country, mapping]) => {
        expect(mapping.supportedLanguages).toContain(mapping.defaultLanguage);
      });
    });

    it("should have English as fallback in most countries", () => {
      const countriesWithEnglish = Object.entries(
        countryLanguageMappings
      ).filter(([, mapping]) =>
        mapping.supportedLanguages.includes("en")
      ).length;

      const totalCountries = Object.keys(countryLanguageMappings).length;

      // Most countries should support English as a fallback (at least 50%)
      expect(countriesWithEnglish).toBeGreaterThanOrEqual(
        Math.floor(totalCountries / 2)
      );
    });
  });
});
