'use client';

import React, { useState, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Globe, ChevronDown, MapPin, Languages, Check, ArrowRight, Search, X } from 'lucide-react';
import {
  locales,
  countryLanguageMappings,
  languageNames,
  type Locale,
  type Country
} from '@/i18n';
import { useLocaleContext } from '@/app/contexts/LocaleContext';

const countryFlags = {
  // Original countries
  US: '🇺🇸',
  IT: '🇮🇹',
  CZ: '🇨🇿',
  RU: '🇷🇺',

  // EU Member Countries
  AT: '🇦🇹', // Austria
  BE: '🇧🇪', // Belgium
  BG: '🇧🇬', // Bulgaria
  HR: '🇭🇷', // Croatia
  CY: '🇨🇾', // Cyprus
  DK: '🇩🇰', // Denmark
  EE: '🇪🇪', // Estonia
  FI: '🇫🇮', // Finland
  FR: '🇫🇷', // France
  DE: '🇩🇪', // Germany
  GR: '🇬🇷', // Greece
  HU: '🇭🇺', // Hungary
  IE: '🇮🇪', // Ireland
  LV: '🇱🇻', // Latvia
  LT: '🇱🇹', // Lithuania
  LU: '🇱🇺', // Luxembourg
  MT: '🇲🇹', // Malta
  NL: '🇳🇱', // Netherlands
  PL: '🇵🇱', // Poland
  PT: '🇵🇹', // Portugal
  RO: '🇷🇴', // Romania
  SK: '🇸🇰', // Slovakia
  SI: '🇸🇮', // Slovenia
  ES: '🇪🇸', // Spain
  SE: '🇸🇪', // Sweden

  // Additional Non-EU Countries
  GB: '🇬🇧', // United Kingdom
  TR: '🇹🇷', // Turkey
  AE: '🇦🇪', // UAE
  ID: '🇮🇩', // Indonesia
} as const;

// Country code mappings for display
const countryInitials = {
  // Original countries
  US: 'US',
  IT: 'IT',
  CZ: 'CZ',
  RU: 'RU',

  // EU Member Countries
  AT: 'AT', // Austria
  BE: 'BE', // Belgium
  BG: 'BG', // Bulgaria
  HR: 'HR', // Croatia
  CY: 'CY', // Cyprus
  DK: 'DK', // Denmark
  EE: 'EE', // Estonia
  FI: 'FI', // Finland
  FR: 'FR', // France
  DE: 'DE', // Germany
  GR: 'GR', // Greece
  HU: 'HU', // Hungary
  IE: 'IE', // Ireland
  LV: 'LV', // Latvia
  LT: 'LT', // Lithuania
  LU: 'LU', // Luxembourg
  MT: 'MT', // Malta
  NL: 'NL', // Netherlands
  PL: 'PL', // Poland
  PT: 'PT', // Portugal
  RO: 'RO', // Romania
  SK: 'SK', // Slovakia
  SI: 'SI', // Slovenia
  ES: 'ES', // Spain
  SE: 'SE', // Sweden

  // Additional Non-EU Countries
  GB: 'GB', // United Kingdom
  TR: 'TR', // Turkey
  AE: 'AE', // UAE
  ID: 'ID', // Indonesia
} as const;

// Language code mappings for display
const languageInitials = {
  en: 'EN',
  it: 'IT',
  cs: 'CS',
  ru: 'RU',
  es: 'ES',
  fr: 'FR',
  pl: 'PL',
  de: 'DE',
  nl: 'NL',
  pt: 'PT',
  sv: 'SV',
  da: 'DA',
  fi: 'FI',
  el: 'EL',
  hu: 'HU',
} as const;

export function LanguageCountrySwitcher() {
  const t = useTranslations('languageSwitcher');
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { country: currentCountry, language: currentLanguage, setCountry, setLanguage, setCountryAndLanguage } = useLocaleContext();

  // Search state
  const [countrySearch, setCountrySearch] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');

  // Filtered countries based on search
  const filteredCountries = useMemo(() => {
    if (!countrySearch.trim()) {
      return Object.entries(countryLanguageMappings);
    }

    const searchLower = countrySearch.toLowerCase();
    return Object.entries(countryLanguageMappings).filter(([countryCode, config]) => {
      return (
        config.name.toLowerCase().includes(searchLower) ||
        countryCode.toLowerCase().includes(searchLower) ||
        countryInitials[countryCode as Country].toLowerCase().includes(searchLower)
      );
    });
  }, [countrySearch]);

  // Filtered languages based on search
  const filteredLanguages = useMemo(() => {
    if (!languageSearch.trim()) {
      return locales;
    }

    const searchLower = languageSearch.toLowerCase();
    return locales.filter((locale) => {
      const langConfig = languageNames[locale];
      return (
        langConfig.native.toLowerCase().includes(searchLower) ||
        langConfig.translated[currentLocale].toLowerCase().includes(searchLower) ||
        locale.toLowerCase().includes(searchLower) ||
        languageInitials[locale].toLowerCase().includes(searchLower)
      );
    });
  }, [languageSearch, currentLocale]);

  // No longer need step-based state since selections are independent

  const handleCountrySelection = (newCountry: Country) => {
    // Get the default language for the selected country
    const countryConfig = countryLanguageMappings[newCountry];
    const defaultLanguage = countryConfig.defaultLanguage;

    // Apply country change and auto-select language
    setCountryAndLanguage(newCountry, defaultLanguage);

    // Update URL to reflect new language immediately
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = defaultLanguage;
    } else {
      segments.splice(1, 0, defaultLanguage);
    }

    // Use router.replace for instant navigation without adding to history
    router.replace(segments.join('/'));
  };

  const handleLanguageSelection = (newLanguage: Locale) => {
    // Apply language change only, keeping current country
    setLanguage(newLanguage);

    // Update URL to reflect new language
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLanguage;
    } else {
      segments.splice(1, 0, newLanguage);
    }

    // Use router.replace for instant navigation without adding to history
    router.replace(segments.join('/'));
  };

  // Get current display values
  const displayLanguage = currentLanguage;
  const displayCountry = currentCountry;
  const currentCountryConfig = countryLanguageMappings[displayCountry];
  const currentLanguageConfig = languageNames[displayLanguage];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-1.5 hover:bg-accent/50 transition-colors px-2 py-1.5 h-auto"
          aria-label={`Language and region settings. Current: ${currentLanguageConfig.native}, ${currentCountryConfig.name}`}
        >
          <div className="flex items-center space-x-1.5 min-w-0">
            {/* Country Flag */}
            <span className="text-base flex-shrink-0">
              {countryFlags[displayCountry]}
            </span>

            {/* Country Initials */}
            <span className="text-sm font-medium text-foreground flex-shrink-0">
              {countryInitials[displayCountry]}
            </span>

            {/* Language Initials in Badge */}
            <div className="bg-muted/60 border border-border rounded px-1.5 py-0.5 flex-shrink-0">
              <span className="text-xs font-medium text-muted-foreground">
                {languageInitials[displayLanguage]}
              </span>
            </div>

            <ChevronDown className="h-3 w-3 opacity-50 flex-shrink-0 ml-0.5" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[600px] max-w-[calc(100vw-2rem)] p-0" align="end">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="h-4 w-4 text-orange-600" />
            <span className="font-semibold text-sm">{t('title')}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {t('independentSelection')}
          </div>
        </div>

        {/* Current Selection Display */}
        <div className="p-4 border-b bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-muted-foreground">{t('country')}:</span>
                <span className="text-base">{countryFlags[displayCountry]}</span>
                <span className="text-sm font-medium">{currentCountryConfig.name}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Languages className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-muted-foreground">{t('language')}:</span>
                <div className="bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 rounded px-2 py-1">
                  <span className="text-xs font-medium text-orange-800 dark:text-orange-200">
                    {languageInitials[displayLanguage]}
                  </span>
                </div>
                <span className="text-sm font-medium">{currentLanguageConfig.native}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-2 divide-x divide-gray-100 dark:divide-gray-800">
          {/* Country Selection Column */}
          <div className="p-4">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-3 flex items-center space-x-2">
              <MapPin className="h-3 w-3" />
              <span>{t('selectCountryLabel')}</span>
            </DropdownMenuLabel>

            {/* Country Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchCountries') || 'Search countries...'}
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="pl-10 pr-10 h-9 text-sm"
              />
              {countrySearch && (
                <button
                  onClick={() => setCountrySearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {/* Sort filtered countries with selected country first */}
              {filteredCountries
                .sort(([countryCodeA], [countryCodeB]) => {
                  // Put selected country first
                  if (countryCodeA === displayCountry) return -1;
                  if (countryCodeB === displayCountry) return 1;
                  return 0;
                })
                .map(([countryCode, config]) => {
                  const countryOption = countryCode as Country;
                  const isSelected = displayCountry === countryOption;

                  return (
                    <button
                      key={countryOption}
                      onClick={() => handleCountrySelection(countryOption)}
                      className={`w-full flex items-center space-x-2 p-2 rounded-md text-left transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-950/30 dark:to-pink-950/30 border border-orange-200 dark:border-orange-800'
                          : 'border border-transparent hover:bg-accent hover:border-border'
                      }`}
                    >
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <span className="text-sm">
                          {countryFlags[countryOption]}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground">
                          {countryInitials[countryOption]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{config.name}</div>
                      </div>
                      {isSelected && (
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <Check className="h-3 w-3 text-orange-600" />
                          <span className="text-xs text-orange-600 font-medium">
                            {t('current')}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Language Selection Column */}
          <div className="p-4">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-3 flex items-center space-x-2">
              <Languages className="h-3 w-3" />
              <span>{t('selectLanguageLabel')}</span>
            </DropdownMenuLabel>

            {/* Language Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('searchLanguages') || 'Search languages...'}
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                className="pl-10 pr-10 h-9 text-sm"
              />
              {languageSearch && (
                <button
                  onClick={() => setLanguageSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-64 overflow-y-auto">
              {filteredLanguages.map((locale) => {
                const isCurrentLanguage = locale === displayLanguage;

                return (
                  <button
                    key={locale}
                    onClick={() => handleLanguageSelection(locale)}
                    className={`w-full p-2 text-left rounded-md border transition-all duration-200 ${
                      isCurrentLanguage
                        ? 'bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-950/30 dark:to-pink-950/30 border border-orange-200 dark:border-orange-800'
                        : 'border border-transparent hover:bg-accent hover:border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <div className="bg-muted/60 border border-border rounded px-1.5 py-0.5 flex-shrink-0">
                          <span className="text-xs font-medium text-muted-foreground">
                            {languageInitials[locale]}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-sm truncate">
                            {languageNames[locale]?.native || locale}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {languageNames[locale]?.translated?.[currentLocale] || languageNames[locale]?.native || locale}
                          </div>
                        </div>
                      </div>
                      {isCurrentLanguage && (
                        <Check className="h-3 w-3 text-orange-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
