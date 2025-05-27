# Internationalization (i18n) System Documentation

## Overview

The InvoiceAgent application features a comprehensive internationalization system built with Next.js 15 and next-intl, supporting multiple languages and country-specific business logic.

## Supported Locales

- **English (en)** - Default locale, United States
- **Italian (it)** - Italy
- **Czech (cs)** - Czech Republic
- **Russian (ru)** - Russia

## Architecture

### Core Components

1. **i18n Configuration** (`i18n.ts`)

   - Defines supported locales and default locale
   - Maps countries to default languages
   - Configures message loading with fallback handling

2. **Middleware** (`middleware.ts`)

   - Handles locale routing and redirects
   - Integrates with Supabase authentication
   - Preserves locale context during navigation

3. **Translation Files** (`messages/`)

   - Structured JSON files for each locale
   - Hierarchical organization by feature/component
   - Consistent key naming conventions

4. **Business Logic** (`lib/business-logic.ts`)

   - Country-specific tax rates and currency formatting
   - Date and number formatting by locale
   - Legal requirements and business registry information

5. **Preference Management** (`lib/preference-manager.ts`)
   - Multi-layered persistence (localStorage + database + URL)
   - Browser language detection with fallbacks
   - User preference synchronization

### URL Structure

- Root redirect: `/` → `/en` (default locale)
- Locale-specific routes: `/[locale]/page`
- Preserved during authentication redirects
- SEO-friendly with proper hreflang tags

## Usage

### Adding Translations

1. **Add translation keys** to all locale files in `messages/`:

```json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Feature description"
  }
}
```

2. **Use in components**:

```tsx
import { useTranslations } from "next-intl";

function MyComponent() {
  const t = useTranslations("newFeature");

  return (
    <div>
      <h1>{t("title")}</h1>
      <p>{t("description")}</p>
    </div>
  );
}
```

### Country-Specific Business Logic

```tsx
import { useLocaleContext } from "@/app/contexts/LocaleContext";
import { formatCurrency, getTaxRate } from "@/lib/business-logic";

function InvoiceComponent() {
  const { country } = useLocaleContext();

  const amount = 100;
  const tax = getTaxRate(country);
  const formattedAmount = formatCurrency(amount, country);

  return (
    <div>
      {formattedAmount} (Tax: {tax * 100}%)
    </div>
  );
}
```

### Language/Country Switching

The `LanguageCountrySwitcher` component provides:

- Separate language and country selection
- aboutyou.de-inspired UX design
- Automatic locale routing
- Preference persistence

## Translation Key Structure

### Naming Conventions

- Use camelCase for keys: `myFeature.subKey`
- Group by feature/component: `dashboard.metrics.totalRevenue`
- Common keys in `common` namespace: `common.loading`
- Navigation items in `navigation` namespace: `navigation.dashboard`

### Required Namespaces

- `common` - Shared UI elements (buttons, messages)
- `navigation` - Menu items and navigation
- `landing` - Landing page content
- `dashboard` - Dashboard-specific content
- `invoices` - Invoice management
- `customers` - Customer management
- `settings` - Settings and preferences
- `auth` - Authentication forms
- `languageSwitcher` - Language/country switcher

## Business Logic Integration

### Tax Rates by Country

```typescript
export const taxRates = {
  US: { standard: 0.0875, name: "Sales Tax" },
  IT: { standard: 0.22, name: "IVA" },
  CZ: { standard: 0.21, name: "DPH" },
  RU: { standard: 0.2, name: "НДС" },
} as const;
```

### Currency Formatting

- US: $1,234.56
- IT: 1.234,56 €
- CZ: 1 234,56 Kč
- RU: 1 234,56 ₽

### Date Formatting

- US: MM/DD/YYYY
- IT: DD/MM/YYYY
- CZ: DD.MM.YYYY
- RU: DD.MM.YYYY

## Persistence Strategy

### Multi-layered Approach

1. **Primary**: localStorage for immediate client-side persistence
2. **Secondary**: User profile database storage (for authenticated users)
3. **Fallback**: URL-based locale detection and browser language detection

### Graceful Fallbacks

- Corrupted localStorage → Browser language detection
- Missing translations → Default locale (English)
- Invalid locale → Default locale with error logging
- Network issues → Cached preferences

## Testing

### Locale Switching

1. Navigate to different locale URLs (`/en`, `/it`, `/cs`, `/ru`)
2. Verify content translation
3. Check currency and date formatting
4. Test language switcher component

### Persistence

1. Change language/country preferences
2. Refresh browser → preferences should persist
3. Clear localStorage → should fallback to browser language
4. Test across different browsers and devices

### Business Logic

1. Verify tax calculations by country
2. Test currency formatting
3. Check date format consistency
4. Validate legal requirement compliance

## Adding New Languages

1. **Add locale to configuration**:

```typescript
// i18n.ts
export const locales = ["en", "it", "cs", "ru", "de"] as const;

export const countryLanguageMappings = {
  // ... existing mappings
  DE: { defaultLanguage: "de", flag: "🇩🇪", name: "Germany" },
} as const;
```

2. **Create translation file**: `messages/de.json`

3. **Add business logic**: Update tax rates, currency symbols, etc.

4. **Update language names**: Add German translations

5. **Test thoroughly**: All features and edge cases

## Performance Considerations

- Translation files are loaded on-demand per locale
- Preference manager uses singleton pattern
- localStorage operations are debounced
- Fallback chains prevent blocking UI

## Security

- No sensitive data in translation files
- Preference validation prevents injection
- Locale validation in middleware
- CSRF protection maintained across locales
