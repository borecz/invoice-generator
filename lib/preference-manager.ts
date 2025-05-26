import { Country, Locale, countryLanguageMappings, defaultLocale } from '@/i18n';

export interface UserPreferences {
  country: Country;
  language: Locale;
  lastUpdated: string;
  source: 'user' | 'browser' | 'url' | 'default';
}

const STORAGE_KEY = 'invoicepro_user_preferences';
const STORAGE_VERSION = '1.0';

// Browser language detection
function detectBrowserLanguage(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const browserLang = navigator.language.split('-')[0] as Locale;
  const supportedLocales: Locale[] = ['en', 'it', 'cs', 'ru'];
  
  return supportedLocales.includes(browserLang) ? browserLang : defaultLocale;
}

// Country detection based on language
function getDefaultCountryForLanguage(language: Locale): Country {
  const countryEntry = Object.entries(countryLanguageMappings).find(
    ([, config]) => config.defaultLanguage === language
  );
  return (countryEntry?.[0] as Country) || 'US';
}

// Validate preferences object
function validatePreferences(prefs: any): prefs is UserPreferences {
  return (
    prefs &&
    typeof prefs === 'object' &&
    typeof prefs.country === 'string' &&
    typeof prefs.language === 'string' &&
    typeof prefs.lastUpdated === 'string' &&
    typeof prefs.source === 'string' &&
    prefs.country in countryLanguageMappings &&
    ['en', 'it', 'cs', 'ru'].includes(prefs.language) &&
    ['user', 'browser', 'url', 'default'].includes(prefs.source)
  );
}

export class PreferenceManager {
  private static instance: PreferenceManager;
  private preferences: UserPreferences | null = null;
  private listeners: Array<(prefs: UserPreferences) => void> = [];

  private constructor() {}

  static getInstance(): PreferenceManager {
    if (!PreferenceManager.instance) {
      PreferenceManager.instance = new PreferenceManager();
    }
    return PreferenceManager.instance;
  }

  // Load preferences with fallback chain
  loadPreferences(): UserPreferences {
    if (this.preferences) {
      return this.preferences;
    }

    // Try localStorage first
    const stored = this.loadFromStorage();
    if (stored) {
      this.preferences = stored;
      return stored;
    }

    // Fallback to browser detection
    const browserLang = detectBrowserLanguage();
    const defaultCountry = getDefaultCountryForLanguage(browserLang);

    this.preferences = {
      country: defaultCountry,
      language: browserLang,
      lastUpdated: new Date().toISOString(),
      source: 'browser'
    };

    // Save the detected preferences
    this.saveToStorage(this.preferences);
    return this.preferences;
  }

  // Save preferences to localStorage
  private saveToStorage(prefs: UserPreferences): void {
    if (typeof window === 'undefined') return;

    try {
      const data = {
        version: STORAGE_VERSION,
        preferences: prefs
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save preferences to localStorage:', error);
    }
  }

  // Load preferences from localStorage
  private loadFromStorage(): UserPreferences | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const data = JSON.parse(stored);
      
      // Check version compatibility
      if (data.version !== STORAGE_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      if (validatePreferences(data.preferences)) {
        return data.preferences;
      }
    } catch (error) {
      console.warn('Failed to load preferences from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEY);
    }

    return null;
  }

  // Update preferences
  updatePreferences(updates: Partial<Pick<UserPreferences, 'country' | 'language'>>, source: UserPreferences['source'] = 'user'): UserPreferences {
    const current = this.loadPreferences();
    
    const updated: UserPreferences = {
      ...current,
      ...updates,
      lastUpdated: new Date().toISOString(),
      source
    };

    this.preferences = updated;
    this.saveToStorage(updated);
    
    // Notify listeners
    this.listeners.forEach(listener => listener(updated));
    
    return updated;
  }

  // Set country and optionally language
  setCountry(country: Country, language?: Locale): UserPreferences {
    const updates: Partial<Pick<UserPreferences, 'country' | 'language'>> = { country };
    
    if (language) {
      updates.language = language;
    } else {
      // Use default language for the country
      updates.language = countryLanguageMappings[country].defaultLanguage;
    }

    return this.updatePreferences(updates, 'user');
  }

  // Set language
  setLanguage(language: Locale): UserPreferences {
    return this.updatePreferences({ language }, 'user');
  }

  // Get current preferences
  getPreferences(): UserPreferences {
    return this.loadPreferences();
  }

  // Subscribe to preference changes
  subscribe(listener: (prefs: UserPreferences) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Clear all preferences (useful for testing or reset)
  clearPreferences(): void {
    this.preferences = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // Import preferences from URL or external source
  importPreferences(country?: string, language?: string): UserPreferences {
    const updates: Partial<Pick<UserPreferences, 'country' | 'language'>> = {};
    
    if (country && country in countryLanguageMappings) {
      updates.country = country as Country;
    }
    
    if (language && ['en', 'it', 'cs', 'ru'].includes(language)) {
      updates.language = language as Locale;
    }

    if (Object.keys(updates).length > 0) {
      return this.updatePreferences(updates, 'url');
    }

    return this.loadPreferences();
  }
}

// Export singleton instance
export const preferenceManager = PreferenceManager.getInstance();

// Utility hooks for React components
export function usePreferenceManager() {
  return preferenceManager;
}
