#!/usr/bin/env node

/**
 * Translation Validation Script
 * 
 * This script validates that all translation files have consistent structure,
 * especially for array-like objects that use indexed keys.
 * 
 * Run with: node scripts/validate-translations.js
 */

const fs = require('fs');
const path = require('path');

const LOCALES = ['en', 'it', 'cs', 'ru'];
const MESSAGES_DIR = path.join(process.cwd(), 'messages');

// Define array paths that should be validated
const ARRAY_PATHS = [
  'landing.pricing.free.features',
  'landing.pricing.pro.features', 
  'landing.pricing.enterprise.features'
];

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

/**
 * Load translation file for a locale
 */
function loadTranslations(locale) {
  try {
    const filePath = path.join(MESSAGES_DIR, `${locale}.json`);
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error loading translations for ${locale}:`, error.message);
    return null;
  }
}

/**
 * Validate array structure consistency
 */
function validateArrayStructure() {
  console.log('🔍 Validating array structure consistency...\n');
  
  const translations = {};
  let hasErrors = false;

  // Load all translations
  for (const locale of LOCALES) {
    translations[locale] = loadTranslations(locale);
    if (!translations[locale]) {
      hasErrors = true;
      continue;
    }
  }

  if (hasErrors) {
    return false;
  }

  // Use English as the reference
  const reference = translations['en'];

  // Validate each array path
  for (const arrayPath of ARRAY_PATHS) {
    console.log(`📋 Validating: ${arrayPath}`);
    
    const referenceArray = getNestedValue(reference, arrayPath);
    if (!referenceArray) {
      console.error(`❌ Reference array not found: ${arrayPath}`);
      hasErrors = true;
      continue;
    }

    const referenceKeys = Object.keys(referenceArray).sort();
    console.log(`   📊 Reference (en) has ${referenceKeys.length} items: [${referenceKeys.join(', ')}]`);

    // Check each locale against reference
    for (const locale of LOCALES) {
      if (locale === 'en') continue; // Skip reference locale

      const localeArray = getNestedValue(translations[locale], arrayPath);
      if (!localeArray) {
        console.error(`   ❌ ${locale}: Array not found`);
        hasErrors = true;
        continue;
      }

      const localeKeys = Object.keys(localeArray).sort();
      
      // Check if key counts match
      if (referenceKeys.length !== localeKeys.length) {
        console.error(`   ❌ ${locale}: Key count mismatch. Expected ${referenceKeys.length}, got ${localeKeys.length}`);
        hasErrors = true;
        continue;
      }

      // Check if keys match exactly
      const keysMismatch = referenceKeys.some((key, index) => key !== localeKeys[index]);
      if (keysMismatch) {
        console.error(`   ❌ ${locale}: Key structure mismatch. Expected [${referenceKeys.join(', ')}], got [${localeKeys.join(', ')}]`);
        hasErrors = true;
        continue;
      }

      // Check for empty values
      const emptyValues = localeKeys.filter(key => !localeArray[key] || localeArray[key].trim() === '');
      if (emptyValues.length > 0) {
        console.warn(`   ⚠️  ${locale}: Empty values found for keys: [${emptyValues.join(', ')}]`);
      }

      console.log(`   ✅ ${locale}: Structure matches (${localeKeys.length} items)`);
    }
    
    console.log('');
  }

  return !hasErrors;
}

/**
 * Validate general translation completeness
 */
function validateCompleteness() {
  console.log('🔍 Validating translation completeness...\n');
  
  const translations = {};
  let hasErrors = false;

  // Load all translations
  for (const locale of LOCALES) {
    translations[locale] = loadTranslations(locale);
    if (!translations[locale]) {
      hasErrors = true;
    }
  }

  if (hasErrors) {
    return false;
  }

  // Get all keys from English (reference)
  const referenceKeys = getAllKeys(translations['en']);
  console.log(`📊 Reference (en) has ${referenceKeys.length} translation keys`);

  // Check each locale
  for (const locale of LOCALES) {
    if (locale === 'en') continue;

    const localeKeys = getAllKeys(translations[locale]);
    const missingKeys = referenceKeys.filter(key => !hasKey(translations[locale], key));
    const extraKeys = localeKeys.filter(key => !hasKey(translations['en'], key));

    console.log(`📊 ${locale}: ${localeKeys.length} keys`);
    
    if (missingKeys.length > 0) {
      console.error(`   ❌ Missing keys (${missingKeys.length}): ${missingKeys.slice(0, 5).join(', ')}${missingKeys.length > 5 ? '...' : ''}`);
      hasErrors = true;
    }
    
    if (extraKeys.length > 0) {
      console.warn(`   ⚠️  Extra keys (${extraKeys.length}): ${extraKeys.slice(0, 5).join(', ')}${extraKeys.length > 5 ? '...' : ''}`);
    }
    
    if (missingKeys.length === 0 && extraKeys.length === 0) {
      console.log(`   ✅ Complete`);
    }
  }

  return !hasErrors;
}

/**
 * Get all keys from nested object
 */
function getAllKeys(obj, prefix = '') {
  let keys = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}

/**
 * Check if object has a nested key
 */
function hasKey(obj, key) {
  return getNestedValue(obj, key) !== null;
}

/**
 * Main validation function
 */
function main() {
  console.log('🌐 Translation Validation Tool\n');
  console.log('===============================\n');

  let success = true;

  // Validate array structures
  if (!validateArrayStructure()) {
    success = false;
  }

  // Validate completeness
  if (!validateCompleteness()) {
    success = false;
  }

  console.log('\n===============================\n');

  if (success) {
    console.log('✅ All validations passed! Translations are consistent.');
    process.exit(0);
  } else {
    console.log('❌ Validation failed! Please fix the issues above.');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  validateArrayStructure,
  validateCompleteness,
  getAllKeys,
  getNestedValue
};
