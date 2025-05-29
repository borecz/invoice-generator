#!/usr/bin/env node

/**
 * Comprehensive Translation Validation Script
 *
 * This script provides comprehensive validation for internationalization:
 * - Translation completeness validation against English baseline
 * - Duplicate key detection with line numbers
 * - JSON structure validation and consistency
 * - Coverage reporting and statistics
 * - Unused key detection
 * - Auto-generation of placeholder translations
 *
 * Run with: tsx scripts/validate-translations.ts [options]
 * Options:
 *   --generate-placeholders: Auto-generate missing translations
 *   --check-unused: Check for unused translation keys
 *   --report-only: Generate report without failing on errors
 *   --locale=xx: Validate specific locale only
 */

import fs from "fs";
import path from "path";
import { glob } from "glob";

// TypeScript interfaces
interface ValidationOptions {
  generatePlaceholders?: boolean;
  checkUnused?: boolean;
  reportOnly?: boolean;
  locale?: string;
}

interface DuplicateKey {
  key: string;
  firstLine: number;
  duplicateLine: number;
  context: string;
}

interface TranslationStats {
  total: number;
  completed: number;
  missing: number;
  extra: number;
  completionRate: number;
}

interface InvalidJsonError {
  file: string;
  error: string;
  line: number | null;
}

interface ValidationStats {
  totalKeys: number;
  completedTranslations: Record<string, TranslationStats>;
  missingTranslations: Record<string, string[]>;
  duplicateKeys: Record<string, DuplicateKey[]>;
  invalidJson: InvalidJsonError[];
  unusedKeys: string[];
  structureErrors: Record<string, string[]>;
}

// Configuration
const MESSAGES_DIR = path.join(process.cwd(), "messages");
const REFERENCE_LOCALE = "en";
const SUPPORTED_LOCALES: readonly string[] = [
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
] as const;

// Source directories to scan for usage
const SOURCE_DIRS: readonly string[] = [
  "app/**/*.{ts,tsx,js,jsx}",
  "components/**/*.{ts,tsx,js,jsx}",
  "lib/**/*.{ts,tsx,js,jsx}",
  "pages/**/*.{ts,tsx,js,jsx}",
] as const;

// Colors for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
} as const;

type ColorName = keyof typeof colors;

class TranslationValidator {
  private options: ValidationOptions & { specificLocale?: string | null };
  private errors: string[];
  private warnings: string[];
  private stats: ValidationStats;

  constructor(options: Partial<ValidationOptions & { locale?: string }> = {}) {
    this.options = {
      generatePlaceholders: options.generatePlaceholders || false,
      checkUnused: options.checkUnused || false,
      reportOnly: options.reportOnly || false,
      specificLocale: options.locale || null,
      ...options,
    };

    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalKeys: 0,
      completedTranslations: {},
      missingTranslations: {},
      duplicateKeys: {},
      invalidJson: [],
      unusedKeys: [],
      structureErrors: {},
    };
  }

  private log(message: string, color: ColorName = "white"): void {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }

  private error(message: string): void {
    this.errors.push(message);
    this.log(`❌ ${message}`, "red");
  }

  private warning(message: string): void {
    this.warnings.push(message);
    this.log(`⚠️  ${message}`, "yellow");
  }

  private success(message: string): void {
    this.log(`✅ ${message}`, "green");
  }

  private info(message: string): void {
    this.log(`ℹ️  ${message}`, "blue");
  }

  // Load and parse JSON file with comprehensive error handling
  private loadJsonFile(filePath: string): Record<string, any> | null {
    try {
      if (!fs.existsSync(filePath)) {
        this.error(`Translation file missing: ${filePath}`);
        return null;
      }

      const content = fs.readFileSync(filePath, "utf8");

      // Check for duplicate keys by parsing line by line
      this.checkDuplicateKeys(content, filePath);

      // Validate JSON syntax
      const parsed = JSON.parse(content);

      // Additional validation for empty content
      if (!parsed || typeof parsed !== "object") {
        this.error(
          `Invalid translation file structure in ${filePath}: Expected object, got ${typeof parsed}`
        );
        return null;
      }

      return parsed;
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        this.error(`Invalid JSON syntax in ${filePath}: ${error.message}`);
        this.stats.invalidJson.push({
          file: filePath,
          error: error.message,
          line: this.extractLineNumber(error.message),
        });
      } else {
        this.error(`Failed to read ${filePath}: ${error.message}`);
      }
      return null;
    }
  }

  // Extract line number from JSON syntax error
  private extractLineNumber(errorMessage: string): number | null {
    const match = errorMessage.match(/line (\d+)/i);
    return match ? parseInt(match[1]) : null;
  }

  // Check for duplicate keys in JSON content with proper scope handling
  private checkDuplicateKeys(content: string, filePath: string): void {
    try {
      // First, try to parse the JSON to see if it's valid
      const parsed = JSON.parse(content);

      // If JSON.parse succeeds, there are no actual duplicate keys at the same scope level
      // The previous detection was incorrectly flagging keys in different object scopes

      // Only check for actual syntax-level duplicates by attempting to parse with a custom parser
      const lines = content.split("\n");
      const duplicates = this.findActualDuplicates(lines);

      if (duplicates.length > 0) {
        this.stats.duplicateKeys[filePath] = duplicates;
        duplicates.forEach((dup) => {
          this.error(
            `Duplicate key "${dup.key}" in ${path.basename(filePath)} (lines ${
              dup.firstLine
            } and ${dup.duplicateLine})`
          );
          this.log(`  Context: ${dup.context}`, "dim");
        });
      }
    } catch (error: any) {
      // If JSON parsing fails, there might be syntax errors including duplicates
      this.error(
        `JSON syntax error in ${path.basename(filePath)}: ${error.message}`
      );
    }
  }

  // Find actual duplicate keys within the same object scope
  private findActualDuplicates(lines: string[]): DuplicateKey[] {
    const duplicates: DuplicateKey[] = [];
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
            firstLine: currentScope.keys.get(key)!,
            duplicateLine: lineNumber,
            context: this.getLineContext(lines, index),
          });
        } else {
          currentScope.keys.set(key, lineNumber);
        }
      }
    });

    return duplicates;
  }

  // Get context around a line for better error reporting
  private getLineContext(
    lines: string[],
    lineIndex: number,
    contextSize: number = 1
  ): string {
    const start = Math.max(0, lineIndex - contextSize);
    const end = Math.min(lines.length, lineIndex + contextSize + 1);
    return lines
      .slice(start, end)
      .map((line, i) => {
        const actualLineNum = start + i + 1;
        const marker = start + i === lineIndex ? "→" : " ";
        return `${marker} ${actualLineNum}: ${line.trim()}`;
      })
      .join("\n  ");
  }

  // Recursively get all keys from nested object
  getAllKeys(obj, prefix = "") {
    const keys = [];

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

  // Get nested value from object using dot notation
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  // Set nested value in object using dot notation
  setNestedValue(obj, path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!current[key] || typeof current[key] !== "object") {
        current[key] = {};
      }
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  // Validate translation completeness
  validateCompleteness() {
    this.info("🔍 Validating translation completeness...");

    // Load reference file (English)
    const referencePath = path.join(MESSAGES_DIR, `${REFERENCE_LOCALE}.json`);
    const referenceData = this.loadJsonFile(referencePath);

    if (!referenceData) {
      this.error(`Cannot load reference file: ${referencePath}`);
      return false;
    }

    const referenceKeys = this.getAllKeys(referenceData);
    this.stats.totalKeys = referenceKeys.length;

    this.info(
      `Found ${referenceKeys.length} keys in reference file (${REFERENCE_LOCALE}.json)`
    );

    // Determine which locales to validate
    const localesToValidate = this.options.specificLocale
      ? [this.options.specificLocale]
      : SUPPORTED_LOCALES.filter((locale) => locale !== REFERENCE_LOCALE);

    // Validate each locale
    for (const locale of localesToValidate) {
      const localePath = path.join(MESSAGES_DIR, `${locale}.json`);

      if (!fs.existsSync(localePath)) {
        this.error(`Translation file missing: ${localePath}`);
        continue;
      }

      const localeData = this.loadJsonFile(localePath);
      if (!localeData) continue;

      const missingKeys = [];
      const localeKeys = this.getAllKeys(localeData);

      // Check for missing keys
      for (const key of referenceKeys) {
        const value = this.getNestedValue(localeData, key);
        if (value === undefined) {
          missingKeys.push(key);
        }
      }

      // Check for extra keys (not in reference)
      const extraKeys = localeKeys.filter(
        (key) => !referenceKeys.includes(key)
      );

      if (missingKeys.length > 0) {
        this.stats.missingTranslations[locale] = missingKeys;
        this.error(
          `${locale}.json is missing ${missingKeys.length} translations:`
        );
        missingKeys.slice(0, 10).forEach((key) => {
          this.log(`  - ${key}`, "red");
        });
        if (missingKeys.length > 10) {
          this.log(`  ... and ${missingKeys.length - 10} more`, "red");
        }
      }

      if (extraKeys.length > 0) {
        this.warning(
          `${locale}.json has ${extraKeys.length} extra keys not in reference:`
        );
        extraKeys.slice(0, 5).forEach((key) => {
          this.log(`  + ${key}`, "yellow");
        });
        if (extraKeys.length > 5) {
          this.log(`  ... and ${extraKeys.length - 5} more`, "yellow");
        }
      }

      const completionRate = (
        ((referenceKeys.length - missingKeys.length) / referenceKeys.length) *
        100
      ).toFixed(1);
      this.stats.completedTranslations[locale] = {
        total: referenceKeys.length,
        completed: referenceKeys.length - missingKeys.length,
        missing: missingKeys.length,
        extra: extraKeys.length,
        completionRate: parseFloat(completionRate),
      };

      if (missingKeys.length === 0) {
        this.success(
          `${locale}.json: 100% complete (${referenceKeys.length}/${referenceKeys.length})`
        );
      } else {
        this.log(
          `${locale}.json: ${completionRate}% complete (${
            referenceKeys.length - missingKeys.length
          }/${referenceKeys.length})`,
          "yellow"
        );
      }
    }

    return Object.keys(this.stats.missingTranslations).length === 0;
  }

  // Validate JSON structure consistency
  validateStructure() {
    this.info("🔍 Validating JSON structure consistency...");

    const referencePath = path.join(MESSAGES_DIR, `${REFERENCE_LOCALE}.json`);
    const referenceData = this.loadJsonFile(referencePath);

    if (!referenceData) return false;

    const referenceStructure = this.getObjectStructure(referenceData);

    const localesToValidate = this.options.specificLocale
      ? [this.options.specificLocale]
      : SUPPORTED_LOCALES.filter((locale) => locale !== REFERENCE_LOCALE);

    for (const locale of localesToValidate) {
      const localePath = path.join(MESSAGES_DIR, `${locale}.json`);
      if (!fs.existsSync(localePath)) continue;

      const localeData = this.loadJsonFile(localePath);
      if (!localeData) continue;

      const localeStructure = this.getObjectStructure(localeData);
      const structureDiff = this.compareStructures(
        referenceStructure,
        localeStructure
      );

      if (structureDiff.length > 0) {
        this.stats.structureErrors[locale] = structureDiff;
        this.error(`Structure mismatch in ${locale}.json:`);
        structureDiff.slice(0, 10).forEach((diff) => {
          this.log(`  ${diff}`, "red");
        });
        if (structureDiff.length > 10) {
          this.log(
            `  ... and ${structureDiff.length - 10} more differences`,
            "red"
          );
        }
      } else {
        this.success(`${locale}.json: Structure matches reference`);
      }
    }

    return Object.keys(this.stats.structureErrors).length === 0;
  }

  // Get object structure for comparison
  getObjectStructure(obj, prefix = "") {
    const structure = [];

    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
      ) {
        structure.push(`${fullKey}: object`);
        structure.push(...this.getObjectStructure(value, fullKey));
      } else {
        structure.push(`${fullKey}: ${typeof value}`);
      }
    }

    return structure;
  }

  // Compare two structure arrays
  compareStructures(reference, target) {
    const differences = [];

    for (const item of reference) {
      if (!target.includes(item)) {
        differences.push(`Missing: ${item}`);
      }
    }

    for (const item of target) {
      if (!reference.includes(item)) {
        differences.push(`Extra: ${item}`);
      }
    }

    return differences;
  }

  // Check for unused translation keys
  async checkUnusedKeys() {
    if (!this.options.checkUnused) return true;

    this.info("🔍 Checking for unused translation keys...");

    try {
      // Get all source files
      const sourceFiles = [];
      for (const pattern of SOURCE_DIRS) {
        const files = glob.sync(pattern, { cwd: process.cwd() });
        sourceFiles.push(...files);
      }

      // Read all source content
      let sourceContent = "";
      for (const file of sourceFiles) {
        try {
          const content = fs.readFileSync(file, "utf8");
          sourceContent += content + "\n";
        } catch (error) {
          this.warning(`Could not read source file: ${file}`);
        }
      }

      // Load reference translations
      const referencePath = path.join(MESSAGES_DIR, `${REFERENCE_LOCALE}.json`);
      const referenceData = this.loadJsonFile(referencePath);
      if (!referenceData) return false;

      const allKeys = this.getAllKeys(referenceData);
      const unusedKeys = [];

      // Check each key for usage
      for (const key of allKeys) {
        // Look for various usage patterns
        const patterns = [
          `'${key}'`,
          `"${key}"`,
          `\`${key}\``,
          `t('${key}')`,
          `t("${key}")`,
          `useTranslations('${key.split(".")[0]}')`,
          `useTranslations("${key.split(".")[0]}")`,
        ];

        const isUsed = patterns.some((pattern) =>
          sourceContent.includes(pattern)
        );

        if (!isUsed) {
          unusedKeys.push(key);
        }
      }

      this.stats.unusedKeys = unusedKeys;

      if (unusedKeys.length > 0) {
        this.warning(
          `Found ${unusedKeys.length} potentially unused translation keys:`
        );
        unusedKeys.slice(0, 10).forEach((key) => {
          this.log(`  - ${key}`, "yellow");
        });
        if (unusedKeys.length > 10) {
          this.log(`  ... and ${unusedKeys.length - 10} more`, "yellow");
        }
      } else {
        this.success("No unused translation keys found");
      }

      return true;
    } catch (error) {
      this.warning(`Error checking unused keys: ${error.message}`);
      return true; // Don't fail validation for this
    }
  }

  // Generate placeholder translations for missing keys
  generatePlaceholders() {
    if (!this.options.generatePlaceholders) return;

    this.info("🔧 Generating placeholder translations...");

    for (const [locale, missingKeys] of Object.entries(
      this.stats.missingTranslations
    )) {
      if (missingKeys.length === 0) continue;

      const localePath = path.join(MESSAGES_DIR, `${locale}.json`);
      const localeData = this.loadJsonFile(localePath) || {};

      let modified = false;
      for (const key of missingKeys) {
        const placeholder = `[${locale.toUpperCase()}] ${key}`;
        this.setNestedValue(localeData, key, placeholder);
        modified = true;
      }

      if (modified) {
        try {
          fs.writeFileSync(
            localePath,
            JSON.stringify(localeData, null, 2) + "\n"
          );
          this.success(
            `Generated ${missingKeys.length} placeholders for ${locale}.json`
          );
        } catch (error) {
          this.error(
            `Failed to write placeholders to ${localePath}: ${error.message}`
          );
        }
      }
    }
  }

  // Generate coverage report
  generateCoverageReport() {
    this.log("\n" + "=".repeat(80), "cyan");
    this.log("📊 TRANSLATION COVERAGE REPORT", "cyan");
    this.log("=".repeat(80), "cyan");

    const sortedLocales = Object.entries(this.stats.completedTranslations).sort(
      ([, a], [, b]) => b.completionRate - a.completionRate
    );

    for (const [locale, stats] of sortedLocales) {
      const percentage = stats.completionRate.toFixed(1);
      const bar = this.generateProgressBar(stats.completionRate);
      const color =
        stats.completionRate === 100
          ? "green"
          : stats.completionRate >= 90
          ? "yellow"
          : "red";

      this.log(
        `${locale.toUpperCase()}: ${bar} ${percentage}% (${stats.completed}/${
          stats.total
        })`,
        color
      );

      if (stats.missing > 0) {
        this.log(`  Missing: ${stats.missing} keys`, "red");
      }
      if (stats.extra > 0) {
        this.log(`  Extra: ${stats.extra} keys`, "yellow");
      }
    }

    // Summary statistics
    const totalLocales = Object.keys(this.stats.completedTranslations).length;
    const completeLocales = Object.values(
      this.stats.completedTranslations
    ).filter((stats) => stats.completionRate === 100).length;
    const averageCompletion =
      totalLocales > 0
        ? Object.values(this.stats.completedTranslations).reduce(
            (sum, stats) => sum + stats.completionRate,
            0
          ) / totalLocales
        : 0;

    this.log("\n📈 SUMMARY:", "cyan");
    this.log(`Total translation keys: ${this.stats.totalKeys}`, "white");
    this.log(
      `Complete locales: ${completeLocales}/${totalLocales}`,
      completeLocales === totalLocales ? "green" : "yellow"
    );
    this.log(
      `Average completion: ${averageCompletion.toFixed(1)}%`,
      averageCompletion === 100 ? "green" : "yellow"
    );

    if (this.stats.unusedKeys.length > 0) {
      this.log(`Unused keys: ${this.stats.unusedKeys.length}`, "yellow");
    }

    if (Object.keys(this.stats.duplicateKeys).length > 0) {
      const totalDuplicates = Object.values(this.stats.duplicateKeys).reduce(
        (sum, dups) => sum + dups.length,
        0
      );
      this.log(`Duplicate keys: ${totalDuplicates}`, "red");
    }

    if (this.stats.invalidJson.length > 0) {
      this.log(`Invalid JSON files: ${this.stats.invalidJson.length}`, "red");
    }
  }

  // Generate progress bar
  generateProgressBar(percentage, width = 20) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }

  // Main validation function
  async validate() {
    this.log("🌍 Starting Comprehensive Translation Validation...", "bold");
    this.log(
      `Validating ${SUPPORTED_LOCALES.length} locales against reference (${REFERENCE_LOCALE})`,
      "blue"
    );

    // Check if messages directory exists
    if (!fs.existsSync(MESSAGES_DIR)) {
      this.error(`Messages directory not found: ${MESSAGES_DIR}`);
      return false;
    }

    let allValid = true;

    // 1. Validate completeness
    this.log("\n" + "─".repeat(60), "cyan");
    const completenessValid = this.validateCompleteness();
    if (!completenessValid) allValid = false;

    // 2. Validate structure
    this.log("\n" + "─".repeat(60), "cyan");
    const structureValid = this.validateStructure();
    if (!structureValid) allValid = false;

    // 3. Check for unused keys (optional)
    if (this.options.checkUnused) {
      this.log("\n" + "─".repeat(60), "cyan");
      await this.checkUnusedKeys();
    }

    // 4. Generate placeholders if requested
    if (this.options.generatePlaceholders && !allValid) {
      this.log("\n" + "─".repeat(60), "cyan");
      this.generatePlaceholders();
    }

    // 5. Generate report
    this.generateCoverageReport();

    // Final summary
    this.log("\n" + "=".repeat(80), "cyan");
    this.log("📋 VALIDATION SUMMARY", "cyan");
    this.log("=".repeat(80), "cyan");

    if (this.errors.length === 0) {
      this.success("✨ All translations are valid and complete!");

      if (this.warnings.length > 0) {
        this.log(
          `\n⚠️  Found ${this.warnings.length} warning(s) (non-blocking):`,
          "yellow"
        );
        this.warnings
          .slice(0, 5)
          .forEach((warning) => this.log(`  • ${warning}`, "yellow"));
        if (this.warnings.length > 5) {
          this.log(
            `  ... and ${this.warnings.length - 5} more warnings`,
            "yellow"
          );
        }
      }

      return true;
    } else {
      this.log(`\n❌ Found ${this.errors.length} error(s):`, "red");
      this.errors
        .slice(0, 10)
        .forEach((error) => this.log(`  • ${error}`, "red"));
      if (this.errors.length > 10) {
        this.log(`  ... and ${this.errors.length - 10} more errors`, "red");
      }

      if (this.warnings.length > 0) {
        this.log(`\n⚠️  Found ${this.warnings.length} warning(s):`, "yellow");
        this.warnings
          .slice(0, 5)
          .forEach((warning) => this.log(`  • ${warning}`, "yellow"));
        if (this.warnings.length > 5) {
          this.log(
            `  ... and ${this.warnings.length - 5} more warnings`,
            "yellow"
          );
        }
      }

      if (this.options.reportOnly) {
        this.log("\n📊 Report-only mode: Not failing validation", "blue");
        return true;
      }

      return false;
    }
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (const arg of args) {
    if (arg === "--generate-placeholders") {
      options.generatePlaceholders = true;
    } else if (arg === "--check-unused") {
      options.checkUnused = true;
    } else if (arg === "--report-only") {
      options.reportOnly = true;
    } else if (arg.startsWith("--locale=")) {
      options.locale = arg.split("=")[1];
      if (!SUPPORTED_LOCALES.includes(options.locale)) {
        console.error(`❌ Unsupported locale: ${options.locale}`);
        console.error(`Supported locales: ${SUPPORTED_LOCALES.join(", ")}`);
        process.exit(1);
      }
    } else if (arg === "--help" || arg === "-h") {
      console.log(`
🌍 Translation Validation Tool

Usage: node scripts/validate-translations.js [options]

Options:
  --generate-placeholders  Auto-generate missing translations with placeholders
  --check-unused          Check for unused translation keys in source code
  --report-only           Generate report without failing on errors
  --locale=xx             Validate specific locale only (e.g., --locale=it)
  --help, -h              Show this help message

Examples:
  node scripts/validate-translations.js
  node scripts/validate-translations.js --check-unused
  node scripts/validate-translations.js --locale=it --generate-placeholders
  node scripts/validate-translations.js --report-only --check-unused
      `);
      process.exit(0);
    } else {
      console.error(`❌ Unknown option: ${arg}`);
      console.error("Use --help for usage information");
      process.exit(1);
    }
  }

  return options;
}

// CLI execution
if (require.main === module) {
  const options = parseArgs();
  const validator = new TranslationValidator(options);

  validator
    .validate()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Validation failed with error:", error);
      process.exit(1);
    });
}

module.exports = TranslationValidator;
