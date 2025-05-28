# Enhanced Internationalization (i18n) System Documentation

## Overview

The InvoiceAgent application features a comprehensive internationalization system built with Next.js 15 and next-intl, supporting multiple languages and country-specific business logic with advanced search and filtering capabilities.

## Supported Languages

### Core Languages (8 total)
- **English (en)** - Default locale, global business language
- **Italian (it)** - Italy and Italian-speaking regions
- **Czech (cs)** - Czech Republic and Czech-speaking regions
- **Russian (ru)** - Russia and Russian-speaking regions
- **Spanish (es)** - Spain and Spanish-speaking regions
- **French (fr)** - France and French-speaking regions
- **Polish (pl)** - Poland and Polish-speaking regions
- **German (de)** - Germany and German-speaking regions

## Supported Countries

### EU Member Countries (27 total)
- **Austria (AT)** - German, Euro, 20% VAT
- **Belgium (BE)** - French, Euro, 21% VAT
- **Bulgaria (BG)** - English, Bulgarian Lev, 20% VAT
- **Croatia (HR)** - English, Euro, 25% VAT
- **Cyprus (CY)** - English, Euro, 19% VAT
- **Czech Republic (CZ)** - Czech, Czech Koruna, 21% VAT
- **Denmark (DK)** - English, Danish Krone, 25% VAT
- **Estonia (EE)** - English, Euro, 20% VAT
- **Finland (FI)** - English, Euro, 24% VAT
- **France (FR)** - French, Euro, 20% VAT
- **Germany (DE)** - German, Euro, 19% VAT
- **Greece (GR)** - English, Euro, 24% VAT
- **Hungary (HU)** - English, Hungarian Forint, 27% VAT
- **Ireland (IE)** - English, Euro, 23% VAT
- **Italy (IT)** - Italian, Euro, 22% VAT
- **Latvia (LV)** - English, Euro, 21% VAT
- **Lithuania (LT)** - English, Euro, 21% VAT
- **Luxembourg (LU)** - French, Euro, 17% VAT
- **Malta (MT)** - English, Euro, 18% VAT
- **Netherlands (NL)** - English, Euro, 21% VAT
- **Poland (PL)** - Polish, Polish Złoty, 23% VAT
- **Portugal (PT)** - English, Euro, 23% VAT
- **Romania (RO)** - English, Romanian Leu, 19% VAT
- **Slovakia (SK)** - English, Euro, 20% VAT
- **Slovenia (SI)** - English, Euro, 22% VAT
- **Spain (ES)** - Spanish, Euro, 21% VAT
- **Sweden (SE)** - English, Swedish Krona, 25% VAT

### Additional Non-EU Countries (5 total)
- **United States (US)** - English, US Dollar, 8.75% Sales Tax
- **United Kingdom (GB)** - English, British Pound, 20% VAT
- **Russia (RU)** - Russian, Russian Ruble, 20% VAT
- **Turkey (TR)** - English, Turkish Lira, 18% VAT
- **United Arab Emirates (AE)** - English, UAE Dirham, 5% VAT
- **Indonesia (ID)** - English, Indonesian Rupiah, 11% VAT

## Architecture

### Core Components

1. **Enhanced i18n Configuration** (`i18n.ts`)
   - Supports 8 languages and 32 countries
   - Maps countries to default languages with auto-suggestions
   - Comprehensive language name translations
   - Configures message loading with fallback handling

2. **Advanced Language/Country Switcher** (`LanguageCountrySwitcher.tsx`)
   - Search and auto-completion for countries and languages
   - Keyboard navigation support (arrow keys, enter, escape)
   - Two-step selection (country for business logic, language for UI)
   - Responsive design with virtualization for performance
   - WCAG 2.1 AA accessibility compliance

3. **Enhanced Business Logic** (`lib/business-logic.ts`)
   - Country-specific tax rates, currency symbols, and legal requirements
   - Date and number formatting by locale
   - Comprehensive business registry information for all countries

4. **Multi-layered Preference Management** (`lib/preference-manager.ts`)
   - localStorage + database + URL persistence
   - Browser language detection with intelligent fallbacks
   - Independent country and language selection
   - User preference synchronization across sessions

### Search and Auto-completion Features

#### Country Search
- Search by country name in current UI language
- Search by country code (e.g., "DE", "FR", "ES")
- Search by country initials
- Real-time filtering with instant results
- Clear search functionality with X button

#### Language Search
- Search by native language name (e.g., "Deutsch", "Français")
- Search by translated language name in current UI
- Search by language code (e.g., "de", "fr", "es")
- Search by language initials
- Supports multi-language search terms

#### Keyboard Navigation
- **Arrow Keys**: Navigate through filtered results
- **Enter**: Select highlighted option
- **Escape**: Close dropdown or clear search
- **Tab**: Move between search fields
- **Backspace/Delete**: Edit search terms

### UI/UX Enhancements

#### Visual Design
- Maintains orange/pink gradient theme throughout
- Country flags with country and language initials display
- Professional card-based layouts for options
- Smooth transitions and hover effects
- Dark/light mode support

#### Accessibility Features
- WCAG 2.1 AA compliance
- Minimum 44x44px touch targets
- 8px minimum spacing between interactive elements
- Proper ARIA labels, roles, and descriptions
- Screen reader support with descriptive text
- High contrast ratios for all text
- Focus indicators and management

#### Responsive Design
- Mobile-first approach with touch-friendly interface
- Adaptive dropdown sizing for different screen sizes
- Virtualization for performance with large lists
- Optimized for both desktop and mobile interactions

### Business Logic Integration

#### Tax Configuration
Each country has specific tax rates and names:
- **EU Countries**: VAT rates from 17% (Luxembourg) to 27% (Hungary)
- **Non-EU Countries**: Various tax systems (Sales Tax, VAT, etc.)
- **Automatic Calculation**: Tax applied based on selected country

#### Currency Formatting
- **Euro Zone**: 19 countries using Euro (€)
- **National Currencies**: 13 countries with local currencies
- **Proper Positioning**: Currency symbols positioned according to local conventions
- **Number Formatting**: Decimal and thousands separators by country

#### Date and Number Formats
- **US Format**: MM/DD/YYYY with decimal point
- **European Formats**: DD/MM/YYYY or DD.MM.YYYY with comma decimal
- **Nordic Formats**: YYYY-MM-DD in Sweden and Lithuania
- **Localized Separators**: Appropriate thousands and decimal separators

## Implementation Details

### Translation Structure
```
messages/
├── en.json (English - 800+ keys)
├── it.json (Italian - 800+ keys)
├── cs.json (Czech - 800+ keys)
├── ru.json (Russian - 800+ keys)
├── es.json (Spanish - 800+ keys)
├── fr.json (French - 800+ keys)
├── pl.json (Polish - 800+ keys)
└── de.json (German - 800+ keys)
```

### Key Features
- **Complete Coverage**: All UI strings translated in all 8 languages
- **Search Integration**: Dedicated keys for search placeholders
- **Consistent Structure**: Hierarchical organization by feature
- **Professional Quality**: Native speaker translations

### URL Structure
- **Locale Routing**: `/[locale]/page` pattern
- **SEO Optimization**: Proper hreflang tags for all languages
- **Fallback Handling**: Graceful degradation for invalid locales
- **Redirect Logic**: Automatic redirection to appropriate locale

## Usage Examples

### Adding New Countries
```typescript
// Add to countryLanguageMappings in i18n.ts
NO: { defaultLanguage: "en", flag: "🇳🇴", name: "Norway" },

// Add business logic in lib/business-logic.ts
NO: { standard: 0.25, name: "MVA" }, // Norwegian VAT
```

### Adding New Languages
```typescript
// Add to locales array in i18n.ts
export const locales = ["en", "it", "cs", "ru", "es", "fr", "pl", "de", "no"] as const;

// Create translation file
messages/no.json
```

### Using in Components
```tsx
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('languageSwitcher');
  
  return (
    <input placeholder={t('searchCountries')} />
  );
}
```

## Testing Strategy

### Functional Testing
1. **Language Switching**: Verify all 8 languages load correctly
2. **Country Selection**: Test all 32 countries with proper business logic
3. **Search Functionality**: Validate search and filtering in all languages
4. **Persistence**: Confirm preferences persist across sessions
5. **URL Routing**: Test locale-based routing and redirects

### Accessibility Testing
1. **Screen Reader**: Test with NVDA, JAWS, and VoiceOver
2. **Keyboard Navigation**: Verify all functionality accessible via keyboard
3. **Color Contrast**: Validate WCAG 2.1 AA compliance
4. **Touch Targets**: Confirm minimum 44x44px size
5. **Focus Management**: Test focus indicators and logical flow

### Performance Testing
1. **Load Times**: Measure translation file loading performance
2. **Search Performance**: Test filtering with large datasets
3. **Memory Usage**: Monitor memory consumption with all countries
4. **Mobile Performance**: Validate smooth operation on mobile devices

## Future Enhancements

### Planned Features
- **Voice Search**: Voice input for country/language selection
- **Geolocation**: Automatic country detection based on IP
- **Regional Variants**: Support for regional language variants
- **Currency Conversion**: Real-time currency conversion rates
- **Legal Compliance**: Enhanced legal requirement validation

### Scalability Considerations
- **Lazy Loading**: Load translations on demand
- **CDN Integration**: Serve translations from CDN
- **Caching Strategy**: Implement intelligent caching
- **Bundle Optimization**: Split translations by feature
- **Performance Monitoring**: Track i18n performance metrics

This enhanced internationalization system provides a robust, scalable, and user-friendly solution for global business operations while maintaining excellent performance and accessibility standards.
