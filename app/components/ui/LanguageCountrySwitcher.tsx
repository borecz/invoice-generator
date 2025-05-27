'use client';

import React from 'react';
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
import { Globe, ChevronDown } from 'lucide-react';
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

export function LanguageCountrySwitcher() {
  const t = useTranslations('languageSwitcher');
  const currentLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { setCountry, setLanguage, setCountryAndLanguage } = useLocaleContext();

  const handleLanguageChange = (newLanguage: Locale) => {
    setLanguage(newLanguage);
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = newLanguage;
    } else {
      segments.splice(1, 0, newLanguage);
    }
    router.push(segments.join('/'));
  };

  const handleCountryLanguageChange = (newCountry: Country) => {
    const defaultLanguage = countryLanguageMappings[newCountry].defaultLanguage;
    setCountryAndLanguage(newCountry, defaultLanguage);
    const segments = pathname.split('/');
    if (locales.includes(segments[1] as Locale)) {
      segments[1] = defaultLanguage;
    } else {
      segments.splice(1, 0, defaultLanguage);
    }
    router.push(segments.join('/'));
  };

  // Get the default country for the current URL locale
  const getDefaultCountryForLanguage = (lang: Locale): Country => {
    const countryEntry = Object.entries(countryLanguageMappings).find(
      ([, config]) => config.defaultLanguage === lang
    );
    return (countryEntry?.[0] as Country) || 'US';
  };

  // Use URL locale for display to ensure synchronization
  const displayLanguage = currentLocale as Locale;
  const displayCountry = getDefaultCountryForLanguage(displayLanguage);
  const currentCountryConfig = countryLanguageMappings[displayCountry];
  const currentLanguageConfig = languageNames[displayLanguage];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center space-x-2 hover:bg-accent/50 transition-colors"
          aria-label={`Language and region settings. Current: ${currentLanguageConfig.native}, ${currentCountryConfig.name}`}
        >
          <div className="flex items-center space-x-2 min-w-0">
            <span className="text-lg flex-shrink-0">
              {countryFlags[displayCountry]}
            </span>
            <span className="text-sm font-medium hidden sm:inline truncate">
              {currentLanguageConfig.native}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50 flex-shrink-0" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-w-[calc(100vw-2rem)] p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2 mb-2">
            <Globe className="h-4 w-4" />
            <span className="font-semibold text-sm">{t('title')}</span>
          </div>
        </div>
        <div className="p-4 border-b">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-2">
            {t('language')}
          </DropdownMenuLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {locales.map((locale) => (
              <button
                key={locale}
                onClick={() => handleLanguageChange(locale)}
                className={`p-2 text-left rounded-md border transition-colors ${
                  displayLanguage === locale
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border hover:bg-accent'
                }`}
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
        <div className="p-4">
          <DropdownMenuLabel className="text-xs font-medium text-muted-foreground mb-2">
            {t('currentShop')}
          </DropdownMenuLabel>
          <div className="mb-3 p-3 rounded-md bg-accent/30 border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className="text-lg flex-shrink-0">
                  {countryFlags[displayCountry]}
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
              <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
            </div>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {Object.entries(countryLanguageMappings).map(([countryCode, config]) => {
              const countryOption = countryCode as Country;
              const isSelected = displayCountry === countryOption;
              return (
                <button
                  key={countryOption}
                  onClick={() => handleCountryLanguageChange(countryOption)}
                  className={`w-full flex items-center space-x-3 p-2 rounded-md text-left transition-colors ${
                    isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-accent'
                  }`}
                >
                  <span className="text-lg flex-shrink-0">
                    {countryFlags[countryOption]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{config.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {languageNames[config.defaultLanguage].native}
                    </div>
                  </div>
                  {isSelected && (
                    <Badge variant="secondary" className="text-xs flex-shrink-0">
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
