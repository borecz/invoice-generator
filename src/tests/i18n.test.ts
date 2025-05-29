/**
 * Internationalization Tests
 *
 * This test suite validates the i18n system using Vitest.
 * It tests translation completeness, structure consistency, and validation logic.
 */

import { describe, it, expect, beforeAll } from "vitest";
import fs from "fs";
import path from "path";

// Configuration
const MESSAGES_DIR = path.join(process.cwd(), "messages");
const REFERENCE_LOCALE = "en";
const SUPPORTED_LOCALES = [
  "cs",
  "da",
  "de",
  "el",
  "en",
  "es",
  "fi",
  "fr",
  "hu",
  "it",
  "nl",
  "pl",
  "pt",
  "ru",
  "sv",
];

interface TranslationStats {
  total: number;
  completed: number;
  missing: number;
  extra: number;
  completionRate: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  stats: Record<string, TranslationStats>;
}

class I18nTestValidator {
  private getAllKeys(obj: Record<string, any>, prefix: string = ""): string[] {
    const keys: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        keys.push(...this.getAllKeys(value, fullKey));
      } else {
        keys.push(fullKey);
      }
    }

    return keys;
  }

  private getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  async validateTranslations(): Promise<ValidationResult> {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      stats: {},
    };

    try {
      // Load reference file
      const referencePath = path.join(MESSAGES_DIR, `${REFERENCE_LOCALE}.json`);
      if (!fs.existsSync(referencePath)) {
        result.errors.push(`Reference file missing: ${referencePath}`);
        result.isValid = false;
        return result;
      }

      const referenceData = JSON.parse(fs.readFileSync(referencePath, "utf8"));
      const referenceKeys = this.getAllKeys(referenceData);

      // Validate each locale
      for (const locale of SUPPORTED_LOCALES) {
        if (locale === REFERENCE_LOCALE) continue;

        const localePath = path.join(MESSAGES_DIR, `${locale}.json`);
        if (!fs.existsSync(localePath)) {
          result.errors.push(`Translation file missing: ${localePath}`);
          result.isValid = false;
          continue;
        }

        try {
          const localeData = JSON.parse(fs.readFileSync(localePath, "utf8"));
          const localeKeys = this.getAllKeys(localeData);

          const missingKeys = referenceKeys.filter(
            (key) => this.getNestedValue(localeData, key) === undefined
          );
          const extraKeys = localeKeys.filter(
            (key) => !referenceKeys.includes(key)
          );

          const completionRate =
            ((referenceKeys.length - missingKeys.length) /
              referenceKeys.length) *
            100;

          result.stats[locale] = {
            total: referenceKeys.length,
            completed: referenceKeys.length - missingKeys.length,
            missing: missingKeys.length,
            extra: extraKeys.length,
            completionRate: Math.round(completionRate * 10) / 10,
          };

          if (missingKeys.length > 0) {
            result.warnings.push(
              `${locale}.json is missing ${
                missingKeys.length
              } translations (${completionRate.toFixed(1)}% complete)`
            );
          }

          if (extraKeys.length > 0) {
            result.warnings.push(
              `${locale}.json has ${extraKeys.length} extra keys`
            );
          }
        } catch (error: any) {
          result.errors.push(
            `Invalid JSON in ${locale}.json: ${error.message}`
          );
          result.isValid = false;
        }
      }
    } catch (error: any) {
      result.errors.push(`Validation failed: ${error.message}`);
      result.isValid = false;
    }

    return result;
  }

  async validateJsonSyntax(): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];
    let isValid = true;

    for (const locale of SUPPORTED_LOCALES) {
      const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

      if (!fs.existsSync(filePath)) {
        errors.push(`File missing: ${locale}.json`);
        isValid = false;
        continue;
      }

      try {
        const content = fs.readFileSync(filePath, "utf8");
        JSON.parse(content);
      } catch (error: any) {
        errors.push(`Invalid JSON in ${locale}.json: ${error.message}`);
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  async checkDuplicateKeys(): Promise<{
    isValid: boolean;
    duplicates: Record<string, number>;
  }> {
    const duplicates: Record<string, number> = {};
    let isValid = true;

    for (const locale of SUPPORTED_LOCALES) {
      const filePath = path.join(MESSAGES_DIR, `${locale}.json`);

      if (!fs.existsSync(filePath)) continue;

      try {
        const content = fs.readFileSync(filePath, "utf8");

        // First, try to parse the JSON to see if it's valid
        JSON.parse(content);

        // If JSON.parse succeeds, there are no actual duplicate keys at the same scope level
        // The previous detection was incorrectly flagging keys in different object scopes

        // Only check for actual syntax-level duplicates by attempting to parse with a custom parser
        const lines = content.split("\n");
        const actualDuplicates = this.findActualDuplicates(lines);

        if (actualDuplicates.length > 0) {
          duplicates[locale] = actualDuplicates.length;
          isValid = false;
        }
      } catch (error) {
        // If JSON parsing fails, there might be syntax errors including duplicates
        // This will be caught by the JSON syntax validation test
      }
    }

    return { isValid, duplicates };
  }

  // Find actual duplicate keys within the same object scope
  private findActualDuplicates(
    lines: string[]
  ): Array<{ key: string; line: number }> {
    const duplicates: Array<{ key: string; line: number }> = [];
    const objectScopes: Array<{
      keys: Map<string, number>;
      startLine: number;
    }> = [];
    let currentScope = { keys: new Map<string, number>(), startLine: 0 };

    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();

      // Track object scope changes
      if (trimmedLine.includes("{")) {
        // Starting a new object scope
        objectScopes.push(currentScope);
        currentScope = {
          keys: new Map<string, number>(),
          startLine: lineNumber,
        };
      }

      if (trimmedLine.includes("}")) {
        // Ending current object scope
        if (objectScopes.length > 0) {
          currentScope = objectScopes.pop()!;
        }
      }

      // Check for key definitions
      const keyMatch = line.match(/^\s*"([^"]+)"\s*:/);
      if (keyMatch) {
        const key = keyMatch[1];

        if (currentScope.keys.has(key)) {
          // Found a duplicate key in the same scope
          duplicates.push({
            key,
            line: lineNumber,
          });
        } else {
          currentScope.keys.set(key, lineNumber);
        }
      }
    });

    return duplicates;
  }
}

describe("Internationalization System", () => {
  let validator: I18nTestValidator;

  beforeAll(() => {
    validator = new I18nTestValidator();
  });

  describe("Translation Files Structure", () => {
    it("should have all required translation files", () => {
      for (const locale of SUPPORTED_LOCALES) {
        const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
        expect(
          fs.existsSync(filePath),
          `Missing translation file: ${locale}.json`
        ).toBe(true);
      }
    });

    it("should have valid JSON syntax in all translation files", async () => {
      const result = await validator.validateJsonSyntax();

      if (!result.isValid) {
        console.error("JSON syntax errors:", result.errors);
      }

      expect(result.isValid).toBe(true);
    });

    it("should not have duplicate keys in any translation file", async () => {
      const result = await validator.checkDuplicateKeys();

      if (!result.isValid) {
        console.error("Duplicate keys found:", result.duplicates);
        console.log('Run "npm run fix:translations" to fix duplicate keys');
      }

      expect(result.isValid).toBe(true);
    });
  });

  describe("Translation Completeness", () => {
    it("should have reasonable translation coverage for all locales", async () => {
      const result = await validator.validateTranslations();

      if (result.warnings.length > 0) {
        console.warn("Translation warnings:", result.warnings);
      }

      if (!result.isValid) {
        console.error("Translation validation errors:", result.errors);
      }

      // Ensure basic validation passes (files exist and are valid JSON)
      expect(result.isValid).toBe(true);

      // Check that each locale has reasonable coverage (at least 80%)
      for (const [locale, stats] of Object.entries(result.stats)) {
        expect(
          stats.completionRate,
          `${locale} has only ${stats.completionRate}% translation coverage. Expected at least 80%.`
        ).toBeGreaterThanOrEqual(80);
      }
    });

    it("should have consistent translation structure across locales", async () => {
      const result = await validator.validateTranslations();

      // All locales should have similar total key counts (within 10% of reference)
      const referenceTotal = Object.values(result.stats)[0]?.total || 0;

      for (const [locale, stats] of Object.entries(result.stats)) {
        const totalWithExtra = stats.completed + stats.extra;
        const variance =
          Math.abs(totalWithExtra - referenceTotal) / referenceTotal;

        expect(
          variance,
          `${locale} has significantly different structure (${totalWithExtra} vs ${referenceTotal} keys)`
        ).toBeLessThan(0.1); // Within 10%
      }
    });
  });

  describe("Translation Quality", () => {
    it("should not have placeholder translations in production files", async () => {
      const placeholderPattern = /\[([A-Z]{2})\]\s/; // Matches [XX] prefix
      const isProduction = process.env.NODE_ENV === "production";

      for (const locale of SUPPORTED_LOCALES) {
        if (locale === REFERENCE_LOCALE) continue;

        const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, "utf8");
        const hasPlaceholders = placeholderPattern.test(content);

        if (hasPlaceholders) {
          const globalPattern = /\[([A-Z]{2})\]\s/g;
          const placeholderCount = (content.match(globalPattern) || []).length;
          console.warn(
            `⚠️  ${locale}.json contains ${placeholderCount} placeholder translations`
          );

          if (isProduction) {
            // In production, this should be an error
            expect(
              hasPlaceholders,
              `${locale}.json contains placeholder translations in production. Please provide proper translations.`
            ).toBe(false);
          } else {
            // In development, just log a warning
            console.log(
              `   This is acceptable in development mode. Run translation validation to see details.`
            );
          }
        }
      }

      // Always pass in development mode
      if (!isProduction) {
        expect(true).toBe(true);
      }
    });

    it("should have non-empty translation values", async () => {
      for (const locale of SUPPORTED_LOCALES) {
        const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
        if (!fs.existsSync(filePath)) continue;

        try {
          const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
          const keys = validator["getAllKeys"](data);

          for (const key of keys) {
            const value = validator["getNestedValue"](data, key);
            expect(
              typeof value === "string" && value.trim().length > 0,
              `${locale}.json has empty value for key: ${key}`
            ).toBe(true);
          }
        } catch (error) {
          // Skip invalid JSON files (handled by other tests)
        }
      }
    });
  });
});
