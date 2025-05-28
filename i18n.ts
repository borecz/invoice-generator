import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
export const locales = [
  "en",
  "it",
  "cs",
  "ru",
  "es",
  "fr",
  "pl",
  "de",
  "nl",
  "pt",
  "sv",
  "da",
  "fi",
  "el",
  "hu",
] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// Country-language mappings
export const countryLanguageMappings = {
  // Original countries
  US: { defaultLanguage: "en", flag: "🇺🇸", name: "United States" },
  IT: { defaultLanguage: "it", flag: "🇮🇹", name: "Italy" },
  CZ: { defaultLanguage: "cs", flag: "🇨🇿", name: "Czech Republic" },
  RU: { defaultLanguage: "ru", flag: "🇷🇺", name: "Russia" },

  // EU Member Countries (27 total)
  AT: { defaultLanguage: "de", flag: "🇦🇹", name: "Austria" },
  BE: { defaultLanguage: "fr", flag: "🇧🇪", name: "Belgium" },
  BG: { defaultLanguage: "en", flag: "🇧🇬", name: "Bulgaria" },
  HR: { defaultLanguage: "en", flag: "🇭🇷", name: "Croatia" },
  CY: { defaultLanguage: "en", flag: "🇨🇾", name: "Cyprus" },
  DK: { defaultLanguage: "da", flag: "🇩🇰", name: "Denmark" },
  EE: { defaultLanguage: "en", flag: "🇪🇪", name: "Estonia" },
  FI: { defaultLanguage: "fi", flag: "🇫🇮", name: "Finland" },
  FR: { defaultLanguage: "fr", flag: "🇫🇷", name: "France" },
  DE: { defaultLanguage: "de", flag: "🇩🇪", name: "Germany" },
  GR: { defaultLanguage: "el", flag: "🇬🇷", name: "Greece" },
  HU: { defaultLanguage: "hu", flag: "🇭🇺", name: "Hungary" },
  IE: { defaultLanguage: "en", flag: "🇮🇪", name: "Ireland" },
  LV: { defaultLanguage: "en", flag: "🇱🇻", name: "Latvia" },
  LT: { defaultLanguage: "en", flag: "🇱🇹", name: "Lithuania" },
  LU: { defaultLanguage: "fr", flag: "🇱🇺", name: "Luxembourg" },
  MT: { defaultLanguage: "en", flag: "🇲🇹", name: "Malta" },
  NL: { defaultLanguage: "nl", flag: "🇳🇱", name: "Netherlands" },
  PL: { defaultLanguage: "pl", flag: "🇵🇱", name: "Poland" },
  PT: { defaultLanguage: "pt", flag: "🇵🇹", name: "Portugal" },
  RO: { defaultLanguage: "en", flag: "🇷🇴", name: "Romania" },
  SK: { defaultLanguage: "en", flag: "🇸🇰", name: "Slovakia" },
  SI: { defaultLanguage: "en", flag: "🇸🇮", name: "Slovenia" },
  ES: { defaultLanguage: "es", flag: "🇪🇸", name: "Spain" },
  SE: { defaultLanguage: "sv", flag: "🇸🇪", name: "Sweden" },

  // Additional Non-EU Countries
  GB: { defaultLanguage: "en", flag: "🇬🇧", name: "United Kingdom" },
  TR: { defaultLanguage: "en", flag: "🇹🇷", name: "Turkey" },
  AE: { defaultLanguage: "en", flag: "🇦🇪", name: "United Arab Emirates" },
  ID: { defaultLanguage: "en", flag: "🇮🇩", name: "Indonesia" },
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
      es: "Inglés",
      fr: "Anglais",
      pl: "Angielski",
      de: "Englisch",
      nl: "Engels",
      pt: "Inglês",
      sv: "Engelska",
      da: "Engelsk",
      fi: "Englanti",
      el: "Αγγλικά",
      hu: "Angol",
    },
  },
  it: {
    native: "Italiano",
    translated: {
      en: "Italian",
      it: "Italiano",
      cs: "Italština",
      ru: "Итальянский",
      es: "Italiano",
      fr: "Italien",
      pl: "Włoski",
      de: "Italienisch",
      nl: "Italiaans",
      pt: "Italiano",
      sv: "Italienska",
      da: "Italiensk",
      fi: "Italia",
      el: "Ιταλικά",
      hu: "Olasz",
    },
  },
  cs: {
    native: "Čeština",
    translated: {
      en: "Czech",
      it: "Ceco",
      cs: "Čeština",
      ru: "Чешский",
      es: "Checo",
      fr: "Tchèque",
      pl: "Czeski",
      de: "Tschechisch",
      nl: "Tsjechisch",
      pt: "Tcheco",
      sv: "Tjeckiska",
      da: "Tjekkisk",
      fi: "Tšekki",
      el: "Τσεχικά",
      hu: "Cseh",
    },
  },
  ru: {
    native: "Русский",
    translated: {
      en: "Russian",
      it: "Russo",
      cs: "Ruština",
      ru: "Русский",
      es: "Ruso",
      fr: "Russe",
      pl: "Rosyjski",
      de: "Russisch",
      nl: "Russisch",
      pt: "Russo",
      sv: "Ryska",
      da: "Russisk",
      fi: "Venäjä",
      el: "Ρωσικά",
      hu: "Orosz",
    },
  },
  es: {
    native: "Español",
    translated: {
      en: "Spanish",
      it: "Spagnolo",
      cs: "Španělština",
      ru: "Испанский",
      es: "Español",
      fr: "Espagnol",
      pl: "Hiszpański",
      de: "Spanisch",
      nl: "Spaans",
      pt: "Espanhol",
      sv: "Spanska",
      da: "Spansk",
      fi: "Espanja",
      el: "Ισπανικά",
      hu: "Spanyol",
    },
  },
  fr: {
    native: "Français",
    translated: {
      en: "French",
      it: "Francese",
      cs: "Francouzština",
      ru: "Французский",
      es: "Francés",
      fr: "Français",
      pl: "Francuski",
      de: "Französisch",
      nl: "Frans",
      pt: "Francês",
      sv: "Franska",
      da: "Fransk",
      fi: "Ranska",
      el: "Γαλλικά",
      hu: "Francia",
    },
  },
  pl: {
    native: "Polski",
    translated: {
      en: "Polish",
      it: "Polacco",
      cs: "Polština",
      ru: "Польский",
      es: "Polaco",
      fr: "Polonais",
      pl: "Polski",
      de: "Polnisch",
      nl: "Pools",
      pt: "Polonês",
      sv: "Polska",
      da: "Polsk",
      fi: "Puola",
      el: "Πολωνικά",
      hu: "Lengyel",
    },
  },
  de: {
    native: "Deutsch",
    translated: {
      en: "German",
      it: "Tedesco",
      cs: "Němčina",
      ru: "Немецкий",
      es: "Alemán",
      fr: "Allemand",
      pl: "Niemiecki",
      de: "Deutsch",
      nl: "Duits",
      pt: "Alemão",
      sv: "Tyska",
      da: "Tysk",
      fi: "Saksa",
      el: "Γερμανικά",
      hu: "Német",
    },
  },
  nl: {
    native: "Nederlands",
    translated: {
      en: "Dutch",
      it: "Olandese",
      cs: "Nizozemština",
      ru: "Голландский",
      es: "Holandés",
      fr: "Néerlandais",
      pl: "Holenderski",
      de: "Niederländisch",
      nl: "Nederlands",
      pt: "Holandês",
      sv: "Nederländska",
      da: "Hollandsk",
      fi: "Hollanti",
      el: "Ολλανδικά",
      hu: "Holland",
    },
  },
  pt: {
    native: "Português",
    translated: {
      en: "Portuguese",
      it: "Portoghese",
      cs: "Portugalština",
      ru: "Португальский",
      es: "Portugués",
      fr: "Portugais",
      pl: "Portugalski",
      de: "Portugiesisch",
      nl: "Portugees",
      pt: "Português",
      sv: "Portugisiska",
      da: "Portugisisk",
      fi: "Portugali",
      el: "Πορτογαλικά",
      hu: "Portugál",
    },
  },
  sv: {
    native: "Svenska",
    translated: {
      en: "Swedish",
      it: "Svedese",
      cs: "Švédština",
      ru: "Шведский",
      es: "Sueco",
      fr: "Suédois",
      pl: "Szwedzki",
      de: "Schwedisch",
      nl: "Zweeds",
      pt: "Sueco",
      sv: "Svenska",
      da: "Svensk",
      fi: "Ruotsi",
      el: "Σουηδικά",
      hu: "Svéd",
    },
  },
  da: {
    native: "Dansk",
    translated: {
      en: "Danish",
      it: "Danese",
      cs: "Dánština",
      ru: "Датский",
      es: "Danés",
      fr: "Danois",
      pl: "Duński",
      de: "Dänisch",
      nl: "Deens",
      pt: "Dinamarquês",
      sv: "Danska",
      da: "Dansk",
      fi: "Tanska",
      el: "Δανικά",
      hu: "Dán",
    },
  },
  fi: {
    native: "Suomi",
    translated: {
      en: "Finnish",
      it: "Finlandese",
      cs: "Finština",
      ru: "Финский",
      es: "Finés",
      fr: "Finnois",
      pl: "Fiński",
      de: "Finnisch",
      nl: "Fins",
      pt: "Finlandês",
      sv: "Finska",
      da: "Finsk",
      fi: "Suomi",
      el: "Φινλανδικά",
      hu: "Finn",
    },
  },
  el: {
    native: "Ελληνικά",
    translated: {
      en: "Greek",
      it: "Greco",
      cs: "Řečtina",
      ru: "Греческий",
      es: "Griego",
      fr: "Grec",
      pl: "Grecki",
      de: "Griechisch",
      nl: "Grieks",
      pt: "Grego",
      sv: "Grekiska",
      da: "Græsk",
      fi: "Kreikka",
      el: "Ελληνικά",
      hu: "Görög",
    },
  },
  hu: {
    native: "Magyar",
    translated: {
      en: "Hungarian",
      it: "Ungherese",
      cs: "Maďarština",
      ru: "Венгерский",
      es: "Húngaro",
      fr: "Hongrois",
      pl: "Węgierski",
      de: "Ungarisch",
      nl: "Hongaars",
      pt: "Húngaro",
      sv: "Ungerska",
      da: "Ungarsk",
      fi: "Unkari",
      el: "Ουγγρικά",
      hu: "Magyar",
    },
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
