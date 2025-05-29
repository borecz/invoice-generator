#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

// Define the missing keys that need to be added to all locales
const missingKeys = {
  "mostPopular": {
    en: "Most Popular",
    it: "Più Popolare", 
    cs: "Nejpopulárnější",
    ru: "Самый Популярный",
    de: "Am Beliebtesten",
    fr: "Le Plus Populaire",
    es: "Más Popular",
    nl: "Meest Populair",
    da: "Mest Populære",
    sv: "Mest Populär",
    fi: "Suosituin",
    pl: "Najpopularniejszy",
    pt: "Mais Popular",
    hu: "Legnépszerűbb",
    el: "Πιο Δημοφιλής"
  },
  "year": {
    en: "year",
    it: "anno",
    cs: "rok", 
    ru: "год",
    de: "Jahr",
    fr: "année",
    es: "año",
    nl: "jaar",
    da: "år",
    sv: "år", 
    fi: "vuosi",
    pl: "rok",
    pt: "ano",
    hu: "év",
    el: "έτος"
  },
  "month": {
    en: "month",
    it: "mese",
    cs: "měsíc",
    ru: "месяц", 
    de: "Monat",
    fr: "mois",
    es: "mes",
    nl: "maand",
    da: "måned",
    sv: "månad",
    fi: "kuukausi", 
    pl: "miesiąc",
    pt: "mês",
    hu: "hónap",
    el: "μήνας"
  }
};

const locales = ['en', 'it', 'cs', 'ru', 'de', 'fr', 'es', 'nl', 'da', 'sv', 'fi', 'pl', 'pt', 'hu', 'el'];

function fixTranslationFile(locale: string) {
  const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);

    // Ensure common section exists
    if (!translations.common) {
      translations.common = {};
    }

    let updated = false;

    // Add missing keys to common section
    Object.keys(missingKeys).forEach(key => {
      if (!translations.common[key]) {
        translations.common[key] = missingKeys[key][locale] || missingKeys[key]['en'];
        updated = true;
        console.log(`✅ Added ${locale}.common.${key}: "${translations.common[key]}"`);
      }
    });

    // Remove duplicate keys from landing.common if they exist
    if (translations.landing && translations.landing.common) {
      Object.keys(missingKeys).forEach(key => {
        if (translations.landing.common[key]) {
          delete translations.landing.common[key];
          updated = true;
          console.log(`🗑️  Removed duplicate ${locale}.landing.common.${key}`);
        }
      });

      // Remove empty landing.common section
      if (Object.keys(translations.landing.common).length === 0) {
        delete translations.landing.common;
        updated = true;
        console.log(`🗑️  Removed empty ${locale}.landing.common section`);
      }
    }

    if (updated) {
      fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n');
      console.log(`💾 Updated ${locale}.json`);
    } else {
      console.log(`✅ ${locale}.json already up to date`);
    }

  } catch (error) {
    console.error(`❌ Error processing ${locale}.json:`, error);
  }
}

console.log('🔧 Fixing missing translation keys across all locales...\n');

locales.forEach(locale => {
  console.log(`\n📝 Processing ${locale}.json:`);
  fixTranslationFile(locale);
});

console.log('\n🎉 Translation fix completed!');
