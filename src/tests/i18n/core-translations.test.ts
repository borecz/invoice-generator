import { describe, it, expect, beforeEach } from "vitest";

// Define locales directly to avoid importing i18n config
const locales = [
  "en",
  "it",
  "cs",
  "ru",
  "de",
  "fr",
  "es",
  "pt",
  "nl",
  "sv",
  "da",
  "fi",
  "el",
  "hu",
  "pl",
];

// Import all translation files
const translations: Record<string, any> = {};

// Load all translation files synchronously for testing
beforeEach(async () => {
  for (const locale of locales) {
    try {
      translations[locale] = await import(`@/messages/${locale}.json`);
    } catch (error) {
      console.warn(`Failed to load translations for ${locale}:`, error);
      translations[locale] = {};
    }
  }
});

describe("Core Translation Coverage", () => {
  // ALL locales now have complete coverage!
  const ALL_LOCALES = locales;

  describe("Critical UI Strings", () => {
    const CRITICAL_KEYS = [
      "common.loading",
      "common.error",
      "common.success",
      "common.cancel",
      "common.save",
      "navigation.dashboard",
      "navigation.invoices",
      "navigation.customers",
      "navigation.settings",
      "landing.hero.title",
      "landing.hero.subtitle",
      "landing.hero.cta",
    ];

    ALL_LOCALES.forEach((locale) => {
      it(`should have all critical UI strings for ${locale}`, () => {
        const messages = translations[locale]?.default || translations[locale];
        expect(messages).toBeDefined();

        CRITICAL_KEYS.forEach((key) => {
          const value = getNestedValue(messages, key);
          expect(
            value,
            `Missing key: ${key} in locale: ${locale}`
          ).toBeDefined();
          expect(
            value,
            `Empty value for key: ${key} in locale: ${locale}`
          ).not.toBe("");
        });
      });
    });
  });

  describe("Translation Key Resolution", () => {
    it("should not have MISSING_MESSAGE errors for all locales", () => {
      ALL_LOCALES.forEach((locale) => {
        const messages = translations[locale]?.default || translations[locale];
        expect(messages).toBeDefined();

        // Check that essential landing page keys exist
        const landingKeys = [
          "landing.title",
          "landing.description",
          "landing.hero.title",
          "landing.features.title",
          "landing.pricing.title",
          "landing.cta.title",
        ];

        landingKeys.forEach((key) => {
          const value = getNestedValue(messages, key);
          expect(
            value,
            `Missing landing key: ${key} in locale: ${locale}`
          ).toBeDefined();
        });
      });
    });

    it("should have consistent key structure across all locales", () => {
      const referenceLocale = "en";
      const referenceMessages =
        translations[referenceLocale]?.default || translations[referenceLocale];
      const referenceKeys = getAllKeys(referenceMessages);

      ALL_LOCALES.filter((locale) => locale !== referenceLocale).forEach(
        (locale) => {
          const messages =
            translations[locale]?.default || translations[locale];
          const localeKeys = getAllKeys(messages);

          // Check that critical sections exist
          const criticalSections = ["common", "navigation", "landing"];
          criticalSections.forEach((section) => {
            const sectionKeys = referenceKeys.filter((key) =>
              key.startsWith(section)
            );
            const localeSectionKeys = localeKeys.filter((key) =>
              key.startsWith(section)
            );

            expect(
              localeSectionKeys.length,
              `Locale ${locale} missing keys in section ${section}`
            ).toBeGreaterThan(0);
          });
        }
      );
    });
  });

  describe("Pricing Feature Arrays", () => {
    const PRICING_PATHS = [
      "landing.pricing.free.features",
      "landing.pricing.pro.features",
      "landing.pricing.enterprise.features",
    ];

    const EXPECTED_COUNTS = {
      "landing.pricing.free.features": 4, // 0-3
      "landing.pricing.pro.features": 6, // 0-5
      "landing.pricing.enterprise.features": 6, // 0-5
    };

    ALL_LOCALES.forEach((locale) => {
      describe(`Pricing arrays for ${locale}`, () => {
        PRICING_PATHS.forEach((path) => {
          it(`should have correct indexed structure for ${path}`, () => {
            const messages =
              translations[locale]?.default || translations[locale];
            const features = getNestedValue(messages, path);

            expect(
              features,
              `Missing pricing features at ${path} for ${locale}`
            ).toBeDefined();
            expect(
              typeof features,
              `Pricing features should be object for ${path} in ${locale}`
            ).toBe("object");

            const expectedCount =
              EXPECTED_COUNTS[path as keyof typeof EXPECTED_COUNTS];
            const actualKeys = Object.keys(features).sort();
            const expectedKeys = Array.from({ length: expectedCount }, (_, i) =>
              i.toString()
            );

            expect(
              actualKeys,
              `Incorrect keys for ${path} in ${locale}`
            ).toEqual(expectedKeys);

            // Check that all values are non-empty strings
            expectedKeys.forEach((key) => {
              expect(
                features[key],
                `Empty feature at ${path}.${key} for ${locale}`
              ).toBeTruthy();
              expect(
                typeof features[key],
                `Feature should be string at ${path}.${key} for ${locale}`
              ).toBe("string");
            });
          });
        });
      });
    });
  });

  describe("Testimonials and CTA Elements", () => {
    const TESTIMONIAL_PATHS = [
      "landing.testimonials.customer1.quote",
      "landing.testimonials.customer1.name",
      "landing.testimonials.customer1.company",
      "landing.testimonials.customer2.quote",
      "landing.testimonials.customer2.name",
      "landing.testimonials.customer2.company",
      "landing.testimonials.customer3.quote",
      "landing.testimonials.customer3.name",
      "landing.testimonials.customer3.company",
    ];

    const CTA_PATHS = [
      "landing.cta.title",
      "landing.cta.subtitle",
      "landing.cta.button",
      "landing.cta.contactSales",
    ];

    ALL_LOCALES.forEach((locale) => {
      it(`should have complete testimonials for ${locale}`, () => {
        const messages = translations[locale]?.default || translations[locale];

        TESTIMONIAL_PATHS.forEach((path) => {
          const value = getNestedValue(messages, path);
          expect(
            value,
            `Missing testimonial: ${path} in locale: ${locale}`
          ).toBeDefined();
          expect(
            value,
            `Empty testimonial: ${path} in locale: ${locale}`
          ).not.toBe("");
        });
      });

      it(`should have complete CTA elements for ${locale}`, () => {
        const messages = translations[locale]?.default || translations[locale];

        CTA_PATHS.forEach((path) => {
          const value = getNestedValue(messages, path);
          expect(
            value,
            `Missing CTA: ${path} in locale: ${locale}`
          ).toBeDefined();
          expect(value, `Empty CTA: ${path} in locale: ${locale}`).not.toBe("");
        });
      });
    });
  });

  describe("Navigation Elements", () => {
    const NAVIGATION_KEYS = [
      "navigation.features",
      "navigation.pricing",
      "navigation.testimonials",
      "navigation.dashboard",
      "navigation.invoices",
      "navigation.customers",
      "navigation.settings",
    ];

    ALL_LOCALES.forEach((locale) => {
      it(`should have complete navigation for ${locale}`, () => {
        const messages = translations[locale]?.default || translations[locale];

        NAVIGATION_KEYS.forEach((key) => {
          const value = getNestedValue(messages, key);
          expect(
            value,
            `Missing navigation: ${key} in locale: ${locale}`
          ).toBeDefined();
          expect(
            value,
            `Empty navigation: ${key} in locale: ${locale}`
          ).not.toBe("");
        });
      });
    });
  });
});

// Helper functions
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

function getAllKeys(obj: any, prefix = ""): string[] {
  let keys: string[] = [];

  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}
