import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
export const locales = ["en", "it", "cs", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// Country-language mappings
export const countryLanguageMappings = {
  US: { defaultLanguage: "en", flag: "🇺🇸", name: "United States" },
  IT: { defaultLanguage: "it", flag: "🇮🇹", name: "Italy" },
  CZ: { defaultLanguage: "cs", flag: "🇨🇿", name: "Czech Republic" },
  RU: { defaultLanguage: "ru", flag: "🇷🇺", name: "Russia" },
} as const;

export type Country = keyof typeof countryLanguageMappings;

export const languageNames = {
  en: {
    native: "English",
    translated: {
      en: "English",
      it: "Inglese",
      cs: "Angličtina",
      ru: "Английский",
    },
  },
  it: {
    native: "Italiano",
    translated: {
      en: "Italian",
      it: "Italiano",
      cs: "Italština",
      ru: "Итальянский",
    },
  },
  cs: {
    native: "Čeština",
    translated: { en: "Czech", it: "Ceco", cs: "Čeština", ru: "Чешский" },
  },
  ru: {
    native: "Русский",
    translated: { en: "Russian", it: "Russo", cs: "Ruština", ru: "Русский" },
  },
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // CUSTOM SOLUTION: Extract locale from URL manually
  let resolvedLocale: string | undefined;

  try {
    // Try to get locale from requestLocale first
    resolvedLocale = await requestLocale;
  } catch (error) {
    // Silently handle requestLocale errors
  }

  // If requestLocale didn't work, try to extract from URL
  if (!resolvedLocale) {
    try {
      // Get the current URL from headers
      const { headers } = await import("next/headers");
      const headersList = await headers();

      // Try multiple header sources for the URL
      const url =
        headersList.get("x-url") ||
        headersList.get("x-pathname") ||
        headersList.get("referer") ||
        "";

      // Extract locale from URL path
      const urlObj = new URL(
        url.startsWith("http") ? url : `http://localhost${url}`
      );
      const pathSegments = urlObj.pathname.split("/").filter(Boolean);
      const potentialLocale = pathSegments[0];

      if (potentialLocale && locales.includes(potentialLocale as any)) {
        resolvedLocale = potentialLocale;
      }
    } catch (error) {
      // Silently handle URL extraction errors
    }
  }

  // Use default locale if we still don't have a valid locale
  const validLocale =
    resolvedLocale && locales.includes(resolvedLocale as any)
      ? resolvedLocale
      : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default,
  };
});
