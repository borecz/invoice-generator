import { useTranslations } from "next-intl";

/**
 * Safeguard hooks for translation handling
 * These hooks provide safe ways to handle different types of translation data
 * and prevent common errors with next-intl
 */

export function useTranslationSafeguards() {
  const t = useTranslations();

  /**
   * Safely get a translation with fallback
   * @param key - Translation key
   * @param fallback - Fallback value if translation is missing
   * @returns Translation string or fallback
   */
  const safeTranslation = (key: string, fallback: string = ""): string => {
    try {
      const translation = t(key);
      // Check if the translation key was not found (next-intl returns the key itself)
      if (translation === key) {
        console.warn(`Translation missing for key: ${key}`);
        return fallback || key;
      }
      return translation;
    } catch (error) {
      console.error(`Error getting translation for key: ${key}`, error);
      return fallback || key;
    }
  };

  /**
   * Safely get an array of translations using indexed keys
   * @param baseKey - Base translation key (e.g., 'pricing.free.features')
   * @param maxItems - Maximum number of items to retrieve
   * @param fallback - Fallback array if no translations found
   * @returns Array of translation strings
   */
  const safeTranslationArray = (
    baseKey: string,
    maxItems: number = 20,
    fallback: string[] = []
  ): string[] => {
    const items: string[] = [];

    try {
      for (let i = 0; i < maxItems; i++) {
        const key = `${baseKey}.${i}`;

        let translation: string;
        try {
          translation = t(key);
        } catch (error) {
          // If translation throws an error (missing key), stop here
          break;
        }

        // If the translation key doesn't exist, t() might return the key itself
        // or throw an error. We check both cases.
        if (
          translation &&
          translation !== key &&
          typeof translation === "string"
        ) {
          items.push(translation);
        } else {
          // Stop when we encounter a missing translation
          break;
        }
      }

      // Return fallback if no items were found
      if (items.length === 0) {
        console.warn(`No translations found for array key: ${baseKey}`);
        return fallback;
      }

      return items;
    } catch (error) {
      console.error(
        `Error getting translation array for key: ${baseKey}`,
        error
      );
      return fallback;
    }
  };

  /**
   * Safely get an object of translations
   * @param baseKey - Base translation key
   * @param keys - Array of sub-keys to retrieve
   * @param fallback - Fallback object if translations are missing
   * @returns Object with translation values
   */
  const safeTranslationObject = (
    baseKey: string,
    keys: string[],
    fallback: Record<string, string> = {}
  ): Record<string, string> => {
    const result: Record<string, string> = {};

    try {
      keys.forEach((key) => {
        const fullKey = `${baseKey}.${key}`;
        const translation = t(fullKey);

        if (translation && translation !== fullKey) {
          result[key] = translation;
        } else {
          console.warn(`Translation missing for key: ${fullKey}`);
          result[key] = fallback[key] || key;
        }
      });

      return result;
    } catch (error) {
      console.error(
        `Error getting translation object for key: ${baseKey}`,
        error
      );
      return fallback;
    }
  };

  /**
   * Validate that a translation exists
   * @param key - Translation key to validate
   * @returns True if translation exists, false otherwise
   */
  const hasTranslation = (key: string): boolean => {
    try {
      const translation = t(key);
      return translation !== key;
    } catch (error) {
      return false;
    }
  };

  /**
   * Get translation with type safety for arrays
   * This is a safer alternative to using returnObjects: true
   * @param key - Translation key
   * @param expectedType - Expected type ('string' | 'array' | 'object')
   * @param fallback - Fallback value
   * @returns Safely typed translation value
   */
  const safeTypedTranslation = <T>(
    key: string,
    expectedType: "string" | "array" | "object",
    fallback: T
  ): T => {
    try {
      if (expectedType === "array") {
        // For arrays, use the indexed approach
        return safeTranslationArray(key, 20, fallback as string[]) as T;
      } else if (expectedType === "object") {
        // For objects, we need to know the keys in advance
        console.warn(
          `Object translations require explicit key specification. Use safeTranslationObject instead for key: ${key}`
        );
        return fallback;
      } else {
        // For strings, use regular translation
        return safeTranslation(key, fallback as string) as T;
      }
    } catch (error) {
      console.error(`Error getting typed translation for key: ${key}`, error);
      return fallback;
    }
  };

  return {
    safeTranslation,
    safeTranslationArray,
    safeTranslationObject,
    hasTranslation,
    safeTypedTranslation,
  };
}

/**
 * Hook specifically for pricing features to prevent the array handling error
 */
export function usePricingTranslations() {
  const { safeTranslationArray } = useTranslationSafeguards();

  const getPricingFeatures = (
    planType: "free" | "pro" | "enterprise"
  ): string[] => {
    const fallbackFeatures = {
      free: ["Basic features", "Limited usage", "Email support"],
      pro: ["Advanced features", "Unlimited usage", "Priority support"],
      enterprise: ["All features", "Custom solutions", "Dedicated support"],
    };

    return safeTranslationArray(
      `landing.pricing.${planType}.features`,
      10,
      fallbackFeatures[planType]
    );
  };

  return { getPricingFeatures };
}
