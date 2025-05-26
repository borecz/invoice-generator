# Translation Array Handling Guide

## Overview

This document provides guidelines for handling arrays in next-intl translations to prevent `MISSING_MESSAGE` errors and ensure robust internationalization.

## The Problem

Next.js with next-intl throws `MISSING_MESSAGE` errors when trying to access non-existent translation keys. This is particularly problematic when handling arrays because:

1. `useTranslations` with `returnObjects: true` is unreliable
2. Iterating through unknown array indices causes errors for missing keys
3. Different locales may have different array lengths

## The Solution

### 1. Use Indexed Object Structure

Instead of arrays in translation files, use indexed objects:

```json
// ❌ DON'T: Array structure
{
  "features": [
    "Feature 1",
    "Feature 2", 
    "Feature 3"
  ]
}

// ✅ DO: Indexed object structure
{
  "features": {
    "0": "Feature 1",
    "1": "Feature 2",
    "2": "Feature 3"
  }
}
```

### 2. Use Known Indices

Always specify the exact indices that exist for each array:

```typescript
// ✅ DO: Specify known indices
const knownIndices = {
  free: [0, 1, 2, 3], // 4 features
  pro: [0, 1, 2, 3, 4, 5], // 6 features
  enterprise: [0, 1, 2, 3, 4, 5], // 6 features
};

// ❌ DON'T: Iterate through unknown range
for (let i = 0; i < maxItems; i++) {
  const translation = t(`${key}.${i}`); // May throw error
}
```

### 3. Implement Proper Error Handling

Always wrap translation calls in try-catch blocks:

```typescript
const getTranslationArray = (key: string, knownIndices: number[]): string[] => {
  const items: string[] = [];
  
  for (const index of knownIndices) {
    try {
      const itemKey = `${key}.${index}`;
      const translation = t(itemKey);
      if (translation && typeof translation === 'string') {
        items.push(translation);
      }
    } catch (error) {
      console.warn(`Missing translation for key: ${key}.${index}`);
    }
  }
  
  return items;
};
```

### 4. Provide Fallback Values

Always have fallback values for when translations fail:

```typescript
const fallbackFeatures = {
  free: ["Basic features", "Limited usage", "Email support"],
  pro: ["Advanced features", "Unlimited usage", "Priority support"],
  enterprise: ["All features", "Custom solutions", "Dedicated support"],
};

// Use fallback if translation fails
return features.length > 0 ? features : fallbackFeatures[planType];
```

## Best Practices

### 1. Consistent Array Lengths

Ensure all locales have the same array structure:

```json
// en.json
{
  "pricing": {
    "free": {
      "features": {
        "0": "Up to 5 invoices per month",
        "1": "Basic invoice templates",
        "2": "Email support",
        "3": "Payment tracking"
      }
    }
  }
}

// it.json  
{
  "pricing": {
    "free": {
      "features": {
        "0": "Fino a 5 fatture al mese",
        "1": "Modelli di fattura base", 
        "2": "Supporto email",
        "3": "Tracciamento pagamenti"
      }
    }
  }
}
```

### 2. Validation Scripts

Create validation scripts to ensure translation consistency:

```typescript
// scripts/validate-translations.ts
import { readFileSync } from 'fs';
import { join } from 'path';

const locales = ['en', 'it', 'cs', 'ru'];
const messagesDir = join(process.cwd(), 'messages');

function validateArrayStructure() {
  const baseStructure = JSON.parse(
    readFileSync(join(messagesDir, 'en.json'), 'utf8')
  );
  
  locales.forEach(locale => {
    const messages = JSON.parse(
      readFileSync(join(messagesDir, `${locale}.json`), 'utf8')
    );
    
    // Validate pricing features arrays
    ['free', 'pro', 'enterprise'].forEach(plan => {
      const basePath = `landing.pricing.${plan}.features`;
      const baseFeatures = getNestedValue(baseStructure, basePath);
      const localeFeatures = getNestedValue(messages, basePath);
      
      if (Object.keys(baseFeatures).length !== Object.keys(localeFeatures).length) {
        console.error(`Array length mismatch for ${locale}:${basePath}`);
      }
    });
  });
}
```

### 3. Type Safety

Use TypeScript to ensure type safety:

```typescript
type PricingPlan = 'free' | 'pro' | 'enterprise';

interface PricingFeatures {
  [key: string]: {
    [index: string]: string;
  };
}

const getPricingFeatures = (planType: PricingPlan): string[] => {
  // Implementation with type safety
};
```

## Common Pitfalls to Avoid

### 1. Using `returnObjects: true`

```typescript
// ❌ DON'T: Unreliable in next-intl
const features = t('pricing.free.features', { returnObjects: true }) as string[];

// ✅ DO: Use custom hook with known indices
const features = getPricingFeatures('free');
```

### 2. Iterating Through Unknown Ranges

```typescript
// ❌ DON'T: May access non-existent keys
for (let i = 0; i < 20; i++) {
  const item = t(`features.${i}`); // Error if i >= actual array length
}

// ✅ DO: Use known indices
const knownIndices = [0, 1, 2, 3];
knownIndices.forEach(i => {
  const item = t(`features.${i}`);
});
```

### 3. Missing Error Handling

```typescript
// ❌ DON'T: No error handling
const translation = t(key); // May throw error

// ✅ DO: Proper error handling
try {
  const translation = t(key);
  // Use translation
} catch (error) {
  console.warn(`Missing translation: ${key}`);
  // Use fallback
}
```

## Testing Checklist

- [ ] All locales have consistent array structures
- [ ] No `MISSING_MESSAGE` errors in console
- [ ] Fallback values work correctly
- [ ] Arrays display correctly in all locales
- [ ] Error handling prevents crashes
- [ ] Type safety is maintained

## Tools and Utilities

Use the provided hooks for safe array handling:

- `useTranslationArrays()` - Main hook for array translations
- `useTranslationSafeguards()` - General purpose safe translation utilities
- `usePricingTranslations()` - Specific hook for pricing features

## Maintenance

When adding new array translations:

1. Update all locale files simultaneously
2. Use consistent indexing (0, 1, 2, ...)
3. Update known indices in hooks
4. Test all locales
5. Update fallback values
6. Run validation scripts

This approach ensures robust, error-free array handling in the internationalization system.
