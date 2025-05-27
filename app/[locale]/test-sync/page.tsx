'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useLocaleContext } from '@/app/contexts/LocaleContext';
import { LanguageCountrySwitcher } from '@/app/components/ui/LanguageCountrySwitcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestSyncPage() {
  const currentLocale = useLocale();
  const { country, language } = useLocaleContext();
  const t = useTranslations('common');
  const tLanding = useTranslations('landing');
  
  const countryFlags = {
    US: '🇺🇸',
    IT: '🇮🇹',
    CZ: '🇨🇿',
    RU: '🇷🇺',
  } as const;

  const languageNames = {
    en: 'English',
    it: 'Italiano',
    cs: 'Čeština',
    ru: 'Русский',
  } as const;

  const isSynchronized = currentLocale === language;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Language/Country Switcher Synchronization Test
          </h1>
          <p className="text-gray-600">
            This page tests the synchronization between URL locale, LocaleContext, and UI components.
          </p>
        </div>

        {/* Language Switcher Component */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Language/Country Switcher</CardTitle>
          </CardHeader>
          <CardContent>
            <LanguageCountrySwitcher />
          </CardContent>
        </Card>

        {/* Current State Display */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">URL & Routing</h3>
                  <div className="space-y-2">
                    <p><strong>Current URL Locale:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{currentLocale}</code></p>
                    <p><strong>Current URL:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</code></p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">LocaleContext State</h3>
                  <div className="space-y-2">
                    <p><strong>Context Language:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{language}</code></p>
                    <p><strong>Context Country:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{country}</code></p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Display Values</h3>
                  <div className="space-y-2">
                    <p><strong>Flag:</strong> <span className="text-2xl">{countryFlags[country]}</span></p>
                    <p><strong>Language Name:</strong> {languageNames[language]}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Synchronization Status</h3>
                  <Badge variant={isSynchronized ? "success" : "destructive"} className="text-sm">
                    {isSynchronized ? '✅ SYNCHRONIZED' : '❌ DESYNCHRONIZED'}
                  </Badge>
                  {!isSynchronized && (
                    <p className="text-sm text-red-600 mt-2">
                      URL locale ({currentLocale}) does not match context language ({language})
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Translation Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Common Translations</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Loading:</p>
                    <p className="font-medium">{t('loading')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Save:</p>
                    <p className="font-medium">{t('save')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cancel:</p>
                    <p className="font-medium">{t('cancel')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Success:</p>
                    <p className="font-medium">{t('success')}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Landing Page Translations</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Hero Title:</p>
                    <p className="font-medium">{tLanding('hero.title')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Hero CTA:</p>
                    <p className="font-medium">{tLanding('hero.cta')}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Links */}
        <Card>
          <CardHeader>
            <CardTitle>Test Navigation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a 
                href="/en/test-sync" 
                className="block p-3 border rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <div className="text-2xl mb-1">🇺🇸</div>
                <div className="text-sm font-medium">English</div>
                <div className="text-xs text-gray-500">/en</div>
              </a>
              <a 
                href="/it/test-sync" 
                className="block p-3 border rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <div className="text-2xl mb-1">🇮🇹</div>
                <div className="text-sm font-medium">Italiano</div>
                <div className="text-xs text-gray-500">/it</div>
              </a>
              <a 
                href="/cs/test-sync" 
                className="block p-3 border rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <div className="text-2xl mb-1">🇨🇿</div>
                <div className="text-sm font-medium">Čeština</div>
                <div className="text-xs text-gray-500">/cs</div>
              </a>
              <a 
                href="/ru/test-sync" 
                className="block p-3 border rounded-lg hover:bg-gray-50 text-center transition-colors"
              >
                <div className="text-2xl mb-1">🇷🇺</div>
                <div className="text-sm font-medium">Русский</div>
                <div className="text-xs text-gray-500">/ru</div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
