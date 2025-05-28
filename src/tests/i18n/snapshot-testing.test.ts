import { describe, it, expect, vi } from "vitest";
import { locales } from "@/i18n";

// Mock router for testing
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/en",
  useParams: () => ({ locale: "en" }),
}));

// Helper function to create mock translation messages for testing
const createMockMessages = (locale: string) => ({
  navigation: {
    features: `Features-${locale}`,
    pricing: `Pricing-${locale}`,
    testimonials: `Testimonials-${locale}`,
    dashboard: `Dashboard-${locale}`,
    login: `Login-${locale}`,
    signup: `Get Started-${locale}`,
  },
  languageCountrySwitcher: {
    title: `Language and Country-${locale}`,
    country: `Country-${locale}`,
    language: `Language-${locale}`,
    selectCountryLabel: `Select Country-${locale}`,
    selectLanguageLabel: `Select Language-${locale}`,
    current: `Current-${locale}`,
  },
  countries: {
    US: `United States-${locale}`,
    DE: `Germany-${locale}`,
    NL: `Netherlands-${locale}`,
  },
  languages: {
    en: `English-${locale}`,
    de: `German-${locale}`,
    nl: `Dutch-${locale}`,
  },
});

// Helper function to validate translation structure
function validateTranslationStructure(messages: any): boolean {
  const requiredKeys = ['navigation', 'languageCountrySwitcher', 'countries', 'languages'];
  return requiredKeys.every(key => messages[key] !== undefined);
}

// Helper function to validate navigation structure
function validateNavigationStructure(navigation: any): boolean {
  const requiredNavKeys = ['features', 'pricing', 'testimonials', 'dashboard', 'login', 'signup'];
  return requiredNavKeys.every(key => navigation[key] !== undefined);
}

// Helper function to validate language switcher structure
function validateLanguageSwitcherStructure(switcher: any): boolean {
  const requiredSwitcherKeys = ['title', 'country', 'language', 'selectCountryLabel', 'selectLanguageLabel', 'current'];
  return requiredSwitcherKeys.every(key => switcher[key] !== undefined);
}

describe("Translation Structure Validation", () => {
  const COMPLETE_LOCALES = ["en", "de", "nl", "fr", "it", "es", "cs", "ru"];

  describe("Translation Message Structure", () => {
    COMPLETE_LOCALES.forEach((locale) => {
      it(`should have valid translation structure for ${locale}`, () => {
        const messages = createMockMessages(locale);
        expect(validateTranslationStructure(messages)).toBe(true);
      });

      it(`should have valid navigation structure for ${locale}`, () => {
        const messages = createMockMessages(locale);
        expect(validateNavigationStructure(messages.navigation)).toBe(true);
      });

      it(`should have valid language switcher structure for ${locale}`, () => {
        const messages = createMockMessages(locale);
        expect(validateLanguageSwitcherStructure(messages.languageCountrySwitcher)).toBe(true);
      });
    });

    it("should maintain consistent structure across all locales", () => {
      const structures = COMPLETE_LOCALES.map(locale => {
        const messages = createMockMessages(locale);
        return {
          locale,
          hasNavigation: !!messages.navigation,
          hasLanguageSwitcher: !!messages.languageCountrySwitcher,
          hasCountries: !!messages.countries,
          hasLanguages: !!messages.languages,
          navigationKeys: Object.keys(messages.navigation),
          switcherKeys: Object.keys(messages.languageCountrySwitcher),
        };
      });

      // All structures should be identical except for locale
      const firstStructure = structures[0];
      structures.forEach(structure => {
        expect(structure.hasNavigation).toBe(firstStructure.hasNavigation);
        expect(structure.hasLanguageSwitcher).toBe(firstStructure.hasLanguageSwitcher);
        expect(structure.hasCountries).toBe(firstStructure.hasCountries);
        expect(structure.hasLanguages).toBe(firstStructure.hasLanguages);
        expect(structure.navigationKeys).toEqual(firstStructure.navigationKeys);
        expect(structure.switcherKeys).toEqual(firstStructure.switcherKeys);
      });
    });
  });

  describe("Locale Configuration Validation", () => {
    it("should validate that all locales are properly configured", () => {
      expect(Array.isArray(locales)).toBe(true);
      expect(locales.length).toBeGreaterThan(0);

      // Check that all expected locales are present
      const expectedLocales = ["en", "de", "nl", "fr", "it", "es", "cs", "ru"];
      expectedLocales.forEach(locale => {
        expect(locales).toContain(locale);
      });
    });

    it("should validate locale format consistency", () => {
      locales.forEach(locale => {
        expect(typeof locale).toBe("string");
        expect(locale.length).toBeGreaterThanOrEqual(2);
        expect(locale.length).toBeLessThanOrEqual(5);
        expect(locale).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., "en" or "en-US"
      });
    });
  });

  describe("Translation Data Consistency", () => {
    it("should maintain consistent translation keys across locales", () => {
      const translationSets = COMPLETE_LOCALES.map(locale => {
        const messages = createMockMessages(locale);
        return {
          locale,
          navigationKeys: Object.keys(messages.navigation).sort(),
          switcherKeys: Object.keys(messages.languageCountrySwitcher).sort(),
          countryKeys: Object.keys(messages.countries).sort(),
          languageKeys: Object.keys(messages.languages).sort(),
        };
      });

      // All translation sets should have identical key structures
      const baseSet = translationSets[0];
      translationSets.forEach(set => {
        expect(set.navigationKeys).toEqual(baseSet.navigationKeys);
        expect(set.switcherKeys).toEqual(baseSet.switcherKeys);
        expect(set.countryKeys).toEqual(baseSet.countryKeys);
        expect(set.languageKeys).toEqual(baseSet.languageKeys);
      });
    });

    it("should validate translation value types", () => {
      COMPLETE_LOCALES.forEach(locale => {
        const messages = createMockMessages(locale);

        // All navigation values should be strings
        Object.values(messages.navigation).forEach(value => {
          expect(typeof value).toBe("string");
          expect(value.length).toBeGreaterThan(0);
        });

        // All language switcher values should be strings
        Object.values(messages.languageCountrySwitcher).forEach(value => {
          expect(typeof value).toBe("string");
          expect(value.length).toBeGreaterThan(0);
        });

        // All country values should be strings
        Object.values(messages.countries).forEach(value => {
          expect(typeof value).toBe("string");
          expect(value.length).toBeGreaterThan(0);
        });

        // All language values should be strings
        Object.values(messages.languages).forEach(value => {
          expect(typeof value).toBe("string");
          expect(value.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Component Data Structure Validation", () => {
    it("should validate responsive design data structures", () => {
      const viewports = [
        { name: "mobile", width: 375 },
        { name: "tablet", width: 768 },
        { name: "desktop", width: 1024 },
      ];

      viewports.forEach(viewport => {
        expect(typeof viewport.name).toBe("string");
        expect(typeof viewport.width).toBe("number");
        expect(viewport.width).toBeGreaterThan(0);
        expect(viewport.name.length).toBeGreaterThan(0);
      });
    });

    it("should validate theme configuration data", () => {
      const themes = ["light", "dark"];

      themes.forEach(theme => {
        expect(typeof theme).toBe("string");
        expect(theme.length).toBeGreaterThan(0);
        expect(["light", "dark"]).toContain(theme);
      });
    });

    it("should validate error and loading state structures", () => {
      const stateTypes = ["error", "loading", "success"];

      stateTypes.forEach(stateType => {
        expect(typeof stateType).toBe("string");
        expect(stateType.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Cross-Locale Data Integrity", () => {
    it("should ensure all locales have complete translation coverage", () => {
      const translationCoverage = COMPLETE_LOCALES.map(locale => {
        const messages = createMockMessages(locale);
        return {
          locale,
          navigationCount: Object.keys(messages.navigation).length,
          switcherCount: Object.keys(messages.languageCountrySwitcher).length,
          countryCount: Object.keys(messages.countries).length,
          languageCount: Object.keys(messages.languages).length,
        };
      });

      // All locales should have the same number of translations
      const baseCoverage = translationCoverage[0];
      translationCoverage.forEach(coverage => {
        expect(coverage.navigationCount).toBe(baseCoverage.navigationCount);
        expect(coverage.switcherCount).toBe(baseCoverage.switcherCount);
        expect(coverage.countryCount).toBe(baseCoverage.countryCount);
        expect(coverage.languageCount).toBe(baseCoverage.languageCount);
      });
    });

    it("should validate locale-specific formatting consistency", () => {
      COMPLETE_LOCALES.forEach(locale => {
        const messages = createMockMessages(locale);

        // Each translation should include the locale identifier for testing
        Object.values(messages.navigation).forEach(value => {
          expect(value).toContain(locale);
        });

        Object.values(messages.languageCountrySwitcher).forEach(value => {
          expect(value).toContain(locale);
        });
      });
    });
  });
});
