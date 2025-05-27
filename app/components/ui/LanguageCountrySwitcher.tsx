'use client';

import React, { useState } from 'react';
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
import { Globe, ChevronDown, MapPin, Languages, Check, ArrowRight } from 'lucide-react';
import {
  locales,
  countryLanguageMappings,
  languageNames,
  type Locale,
  type Country
} from '@/i18n';
import { useLocaleContext } from '@/app/contexts/LocaleContext';

const countryFlags = {
  US: '🇺🇸',
  IT: '🇮🇹',
  CZ: '🇨🇿',
  RU: '🇷🇺',
} as const;

// Country code mappings for display
const countryInitials = {
  US: 'US',
  IT: 'IT',
  CZ: 'CZ',
  RU: 'RU',
} as const;

// Language code mappings for display
const languageInitials = {
  en: 'EN',
  it: 'IT',
  cs: 'CS',
  ru: 'RU',
} as const;

export function LanguageCountrySwitcher() {
  const t = useTranslations('languageSwitcher');
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { country: currentCountry, language: currentLanguage, setCountry, setLanguage, setCountryAndLanguage } = useLocaleContext();

  // No longer need step-based state since selections are independent

  const handleCountrySelection = (newCountry: Country) => {
    // Apply country change immediately, keeping current language
    setCountry(newCountry);
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
      <DropdownMenuContent className="w-96 max-w-[calc(100vw-2rem)] p-0" align="end">
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

        {/* Country Selection */}
        <div className="p-4 border-b">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-3 flex items-center space-x-2">
            <MapPin className="h-3 w-3" />
            <span>{t('selectCountryLabel')}</span>
          </DropdownMenuLabel>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* Sort countries with selected country first */}
            {Object.entries(countryLanguageMappings)
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
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-950/30 dark:to-pink-950/30 border-2 border-orange-200 dark:border-orange-800'
                        : 'border-2 border-transparent hover:bg-accent hover:border-border'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg flex-shrink-0">
                        {countryFlags[countryOption]}
                      </span>
                      <span className="text-sm font-medium">
                        {countryInitials[countryOption]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{config.name}</div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center space-x-1">
                        <Check className="h-4 w-4 text-orange-600" />
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                          {t('current')}
                        </Badge>
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Language Selection */}
        <div className="p-4">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-3 flex items-center space-x-2">
            <Languages className="h-3 w-3" />
            <span>{t('selectLanguageLabel')}</span>
          </DropdownMenuLabel>
          <div className="grid grid-cols-2 gap-2">
            {locales.map((locale) => {
              const isCurrentLanguage = locale === displayLanguage;

              return (
                <button
                  key={locale}
                  onClick={() => handleLanguageSelection(locale)}
                  className={`p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                    isCurrentLanguage
                      ? 'bg-gradient-to-r from-orange-100 to-pink-100 dark:from-orange-950/30 dark:to-pink-950/30 border-2 border-orange-200 dark:border-orange-800'
                      : 'border-border hover:bg-accent hover:border-orange-200 dark:hover:border-orange-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="bg-muted/60 border border-border rounded px-2 py-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {languageInitials[locale]}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm">
                          <span className="truncate">{languageNames[locale].native}</span>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {languageNames[locale].translated[currentLocale]}
                        </div>
                      </div>
                    </div>
                    {isCurrentLanguage && (
                      <Check className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
