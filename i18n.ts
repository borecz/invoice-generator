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

export default getRequestConfig(async ({ locale }) => {
  // Use default locale if the incoming locale is invalid
  const validLocale = locales.includes(locale as any) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`./messages/${validLocale}.json`)).default,
  };
});
