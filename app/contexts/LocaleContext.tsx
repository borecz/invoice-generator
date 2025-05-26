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
      preferenceManager.setLanguage(currentLocale);
    }
  }, [currentLocale, preferences.language]);

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
    country: preferences.country,
    language: preferences.language,
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
