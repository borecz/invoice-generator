'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Globe, ChevronDown } from 'lucide-react';
import {
  locales,
  countryLanguageMappings,
  languageNames,
  type Locale,
  type Country
} from '@/i18n';
import { useLocaleContext } from '@/app/contexts/LocaleContext';

interface LanguageCountryState {
  country: Country;
  language: Locale;
}

const countryFlags = {
  US: '🇺🇸',
  IT: '🇮🇹',
  CZ: '🇨🇿',
  RU: '🇷🇺',
} as const;

export function LanguageCountrySwitcher() {
  const t = useTranslations('languageSwitcher');
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { country, language, setCountry, setLanguage, setCountryAndLanguage } = useLocaleContext();

  const handleLanguageChange = (newLanguage: Locale) => {
    setLanguage(newLanguage);

    // Navigate to new locale
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLanguage;
    } else {
      segments.splice(1, 0, newLanguage);
    }

    router.push(segments.join('/'));
  };

  const handleCountryChange = (newCountry: Country) => {
    setCountry(newCountry);
  };

  const handleCountryLanguageChange = (newCountry: Country) => {
    const defaultLanguage = countryLanguageMappings[newCountry].defaultLanguage;
    setCountryAndLanguage(newCountry, defaultLanguage);

    // Navigate to new locale
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = defaultLanguage;
    } else {
      segments.splice(1, 0, defaultLanguage);
    }

    router.push(segments.join('/'));
  };

  const currentCountryConfig = countryLanguageMappings[country];
  const currentLanguageConfig = languageNames[language];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 hover:bg-accent/50 transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-0"
          aria-label={`Language and region settings. Current: ${currentLanguageConfig.native}, ${currentCountryConfig.name}`}
        >
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-lg flex-shrink-0" role="img" aria-label={`${currentCountryConfig.name} flag`}>
              {countryFlags[country]}
            </span>
            <span className="text-sm font-medium hidden sm:inline truncate">
              {currentLanguageConfig.native}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50 flex-shrink-0" aria-hidden="true" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)] p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="h-4 w-4" aria-hidden="true" />
            <span className="font-semibold text-sm">{t('title')}</span>
          </div>
        </div>

        {/* Language Selection */}
        <div className="p-4 border-b">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-2">
            {t('language')}
          </DropdownMenuLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Select language">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`p-2 text-left rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  language === locale
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:bg-accent'
                }`}
                role="radio"
                aria-checked={language === locale}
                aria-label={`Select ${languageNames[locale].native} language`}
              >
                <div className="font-medium text-sm">
                  {languageNames[locale].native}
                </div>
                <div className="text-xs text-muted-foreground">
                  {languageNames[locale].translated[currentLocale]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Country Selection */}
        <div className="p-4">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-2">
            {t('currentShop')}
          </DropdownMenuLabel>

          {/* Current Selection */}
          <div className="mb-3 p-3 rounded-md bg-accent/30 border" role="status" aria-label="Current country and language selection">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className="text-lg flex-shrink-0" role="img" aria-label={`${currentCountryConfig.name} flag`}>
                  {countryFlags[country]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">
                    {currentCountryConfig.name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {currentLanguageConfig.native}
                  </div>
                </div>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" aria-hidden="true" />
            </div>
          </div>

          {/* Country Options */}
          <div
            className="space-y-1 max-h-48 overflow-y-auto"
            role="radiogroup"
            aria-label="Select country and region"
          >
            {Object.entries(countryLanguageMappings).map(([countryCode, config]) => {
              const countryOption = countryCode as Country;
              const isSelected = country === countryOption;

              return (
                <button
                  key={countryOption}
                  onClick={() => handleCountryLanguageChange(countryOption)}
                  className={`w-full flex items-center space-x-3 p-2 rounded-md text-left transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-accent'
                  }`}
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={`Select ${config.name} with ${languageNames[config.defaultLanguage].native} language`}
                >
                  <span className="text-lg flex-shrink-0" role="img" aria-label={`${config.name} flag`}>
                    {countryFlags[countryOption]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{config.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {languageNames[config.defaultLanguage].native}
                    </div>
                  </div>
                  {isSelected && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0" aria-hidden="true">
                      Current
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
