# 🌍 Translation Validation System

A comprehensive internationalization (i18n) validation system that ensures 100% translation coverage across all supported locales and prevents untranslated strings from appearing in the user interface.

## 📋 Features

### ✅ Core Validation
- **Translation Completeness**: Validates all translation files against English baseline
- **Duplicate Key Detection**: Finds duplicate keys with exact line numbers
- **JSON Structure Validation**: Ensures consistent nested object structure
- **Syntax Validation**: Validates JSON syntax and structure

### 📊 Advanced Features
- **Coverage Reporting**: Detailed completion percentages per locale
- **Unused Key Detection**: Identifies translation keys not used in source code
- **Auto-placeholder Generation**: Creates placeholder translations for missing keys
- **Locale-specific Validation**: Validate individual locales
- **CI/CD Integration**: Automated validation in GitHub Actions

## 🚀 Quick Start

### Basic Validation
```bash
# Validate all translations
npm run validate:translations

# Generate coverage report (non-blocking)
npm run validate:translations:report

# Check for unused translation keys
npm run validate:translations:unused

# Auto-generate placeholders for missing translations
npm run validate:translations:generate

# Full validation with all features
npm run validate:translations:full
```

### Command Line Options
```bash
# Validate specific locale only
node scripts/validate-translations.js --locale=it

# Generate placeholders for missing keys
node scripts/validate-translations.js --generate-placeholders

# Check for unused keys in source code
node scripts/validate-translations.js --check-unused

# Report-only mode (don't fail on errors)
node scripts/validate-translations.js --report-only

# Combine multiple options
node scripts/validate-translations.js --locale=it --generate-placeholders
```

## 📁 Supported Locales

The system validates translations for all 15 supported locales:

| Locale | Language | Region |
|--------|----------|---------|
| `en` | English | Reference |
| `it` | Italian | Italy |
| `cs` | Czech | Czech Republic |
| `ru` | Russian | Russia |
| `de` | German | Germany |
| `fr` | French | France |
| `es` | Spanish | Spain |
| `pt` | Portuguese | Portugal |
| `nl` | Dutch | Netherlands |
| `sv` | Swedish | Sweden |
| `da` | Danish | Denmark |
| `fi` | Finnish | Finland |
| `el` | Greek | Greece |
| `hu` | Hungarian | Hungary |
| `pl` | Polish | Poland |

## 🔍 Validation Types

### 1. Translation Completeness
Ensures every key in `messages/en.json` exists in all other locale files.

**Example Error:**
```
❌ it.json is missing 3 translations:
  - invoices.actions.duplicate
  - invoices.actions.archive
  - common.comingSoon
```

### 2. Duplicate Key Detection
Finds duplicate keys within the same JSON file with line numbers.

**Example Error:**
```
❌ Duplicate key "common" in it.json (lines 5 and 15)
  Context:
  → 5: "common": {
    6:   "save": "Salva"
    7: },
```

### 3. JSON Structure Validation
Validates that nested object structures match between locales.

**Example Error:**
```
❌ Structure mismatch in it.json:
  Missing: invoices.actions: object
  Extra: invoices.actions: string
```

### 4. Unused Key Detection
Identifies translation keys that aren't used in the source code.

**Example Warning:**
```
⚠️  Found 2 potentially unused translation keys:
  - old.feature.removed
  - deprecated.button.text
```

## 📊 Coverage Report

The system generates detailed coverage reports:

```
📊 TRANSLATION COVERAGE REPORT
================================================================================
IT: ████████████████████ 100.0% (156/156)
DE: ███████████████████░ 98.7% (154/156)
  Missing: 2 keys
FR: ██████████████████░░ 96.8% (151/156)
  Missing: 5 keys
ES: ████████████████░░░░ 85.3% (133/156)
  Missing: 23 keys

📈 SUMMARY:
Total translation keys: 156
Complete locales: 1/14
Average completion: 95.2%
```

## 🔧 Integration

### Pre-build Validation
The validation runs automatically before builds:

```json
{
  "scripts": {
    "prebuild": "npm run validate:translations"
  }
}
```

### GitHub Actions
Automated validation on every push and pull request:

- ✅ Translation completeness validation
- 📊 Coverage reports in PR comments
- 🔧 Auto-generation of missing placeholders
- 🕐 Weekly scheduled audits

### Test Integration
Include validation in your test suite:

```bash
# Run as part of test suite
npm run test:i18n

# Run with full validation
npm run test:i18n:full
```

## 🛠️ Configuration

### Supported Locales
Update `SUPPORTED_LOCALES` in `scripts/validate-translations.js`:

```javascript
const SUPPORTED_LOCALES = [
  "cs", "da", "de", "el", "en", "es", "fi", "fr", 
  "hu", "it", "nl", "pl", "pt", "ru", "sv"
];
```

### Source Code Patterns
The unused key detection scans for these patterns:

```javascript
const patterns = [
  `'${key}'`,
  `"${key}"`,
  `t('${key}')`,
  `t("${key}")`,
  `useTranslations('${namespace}')`,
];
```

### File Structure
```
messages/
├── en.json          # Reference locale (baseline)
├── it.json          # Italian translations
├── cs.json          # Czech translations
├── ru.json          # Russian translations
└── ...              # Other locales
```

## 🚨 Error Handling

### Exit Codes
- `0`: All validations passed
- `1`: Validation failed (missing translations, duplicates, etc.)

### Error Types
1. **Critical Errors** (fail validation):
   - Missing translation files
   - Invalid JSON syntax
   - Duplicate keys
   - Missing translations

2. **Warnings** (don't fail validation):
   - Extra keys not in reference
   - Potentially unused keys
   - Structure recommendations

## 🔄 Workflow Examples

### Adding New Translation Keys
1. Add key to `messages/en.json`
2. Run `npm run validate:translations:generate` to create placeholders
3. Translate placeholders in all locale files
4. Run `npm run validate:translations` to verify

### Fixing Translation Issues
1. Run `npm run validate:translations` to see errors
2. Fix missing translations manually or use placeholders
3. Verify with `npm run validate:translations`
4. Commit changes

### Cleaning Up Unused Keys
1. Run `npm run validate:translations:unused`
2. Review reported unused keys
3. Remove unused keys from all locale files
4. Verify with validation

## 📈 Best Practices

1. **Always use English as reference**: All other locales are validated against `en.json`
2. **Run validation before commits**: Use pre-commit hooks or CI/CD
3. **Keep structure consistent**: Maintain the same nested object structure across locales
4. **Use meaningful placeholders**: Auto-generated placeholders should be replaced with proper translations
5. **Regular audits**: Use scheduled validation to catch issues early
6. **Document translation context**: Add comments for complex translations

## 🐛 Troubleshooting

### Common Issues

**Issue**: `Translation file missing`
**Solution**: Create the missing locale file with proper JSON structure

**Issue**: `Invalid JSON syntax`
**Solution**: Fix JSON syntax errors (missing commas, quotes, etc.)

**Issue**: `Structure mismatch`
**Solution**: Ensure nested object structure matches the reference file

**Issue**: `Duplicate keys`
**Solution**: Remove or rename duplicate keys in the JSON file

### Debug Mode
For detailed debugging, run with verbose output:

```bash
DEBUG=1 node scripts/validate-translations.js
```

## 📚 API Reference

### TranslationValidator Class

```javascript
const validator = new TranslationValidator({
  generatePlaceholders: false,
  checkUnused: false,
  reportOnly: false,
  specificLocale: null
});

await validator.validate();
```

### Methods
- `validate()`: Main validation function
- `validateCompleteness()`: Check translation completeness
- `validateStructure()`: Validate JSON structure
- `checkUnusedKeys()`: Find unused translation keys
- `generatePlaceholders()`: Create placeholder translations
- `generateCoverageReport()`: Generate coverage statistics
