'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocale } from 'next-intl';
import { Country, Locale, countryLanguageMappings } from '@/i18n';
import { preferenceManager, UserPreferences } from '@/lib/preference-manager';

interface LocaleContextType {
  country: Country;
  language: Locale;
  setCountry: (country: Country) => void;
  setLanguage: (language: Locale) => void;
  setCountryAndLanguage: (country: Country, language?: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const currentLocale = useLocale() as Locale;

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    return preferenceManager.loadPreferences();
  });

  // Subscribe to preference changes
  useEffect(() => {
    const unsubscribe = preferenceManager.subscribe((newPrefs) => {
      setPreferences(newPrefs);
    });

    return unsubscribe;
  }, []);

  // Update language when locale changes (from URL navigation)
  useEffect(() => {
    if (preferences.language !== currentLocale) {
      // Update preferences to match the current URL locale
      preferenceManager.setLanguage(currentLocale);
    }
  }, [currentLocale, preferences.language]);

  // Get the default country for the current language
  const getDefaultCountryForLanguage = (language: Locale): Country => {
    const countryEntry = Object.entries(countryLanguageMappings).find(
      ([, config]) => config.defaultLanguage === language
    );
    return (countryEntry?.[0] as Country) || 'US';
  };

  // Always use the current URL locale for immediate synchronization
  const effectiveLanguage = currentLocale as Locale;
  const effectiveCountry = getDefaultCountryForLanguage(effectiveLanguage);

  const setCountry = (newCountry: Country) => {
    preferenceManager.setCountry(newCountry);
  };

  const setLanguage = (newLanguage: Locale) => {
    preferenceManager.setLanguage(newLanguage);
  };

  const setCountryAndLanguage = (newCountry: Country, newLanguage?: Locale) => {
    preferenceManager.setCountry(newCountry, newLanguage);
  };

  const value: LocaleContextType = {
    country: effectiveCountry,
    language: effectiveLanguage,
    setCountry,
    setLanguage,
    setCountryAndLanguage,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocaleContext() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocaleContext must be used within a LocaleProvider');
  }
  return context;
}
