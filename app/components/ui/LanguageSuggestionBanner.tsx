'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, Globe, Check } from 'lucide-react';
import { preferenceManager } from '@/lib/preference-manager';
import { languageNames, type Locale } from '@/i18n';
import { useLocaleContext } from '@/app/contexts/LocaleContext';

export function LanguageSuggestionBanner() {
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [suggestedLanguage, setSuggestedLanguage] = useState<Locale | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('languageSuggestion');
  const { setLanguage } = useLocaleContext();

  useEffect(() => {
    // Check if we should show language suggestion
    const shouldShow = preferenceManager.shouldShowLanguageSuggestion();
    const suggested = preferenceManager.getSuggestedLanguage();
    
    if (shouldShow && suggested && !dismissed) {
      setShowSuggestion(true);
      setSuggestedLanguage(suggested);
    }
  }, [dismissed]);

  const handleAcceptSuggestion = () => {
    if (suggestedLanguage) {
      // Update language preference
      setLanguage(suggestedLanguage);
      
      // Update URL to reflect new language
      const segments = pathname.split('/');
      if (segments[1] && segments[1].length === 2) {
        segments[1] = suggestedLanguage;
      } else {
        segments.splice(1, 0, suggestedLanguage);
      }
      router.push(segments.join('/'));
      
      // Hide banner
      setShowSuggestion(false);
    }
  };

  const handleDismiss = () => {
    setShowSuggestion(false);
    setDismissed(true);
    
    // Mark preference as user-set to avoid future suggestions
    preferenceManager.updatePreferences({}, 'user');
  };

  if (!showSuggestion || !suggestedLanguage) {
    return null;
  }

  const suggestedLanguageName = languageNames[suggestedLanguage];

  return (
    <Card className="mx-4 mt-4 border-orange-200 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/20 dark:to-pink-950/20 dark:border-orange-800">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <Globe className="h-5 w-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                {t('suggestion', { language: suggestedLanguageName.native })}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('description')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAcceptSuggestion}
              className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-950/30"
            >
              <Check className="h-4 w-4 mr-1" />
              {t('accept')}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
