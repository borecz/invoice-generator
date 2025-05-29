#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

const locales = ['en', 'it', 'cs', 'ru', 'de', 'fr', 'es', 'nl', 'da', 'sv', 'fi', 'pl', 'pt', 'hu', 'el'];
const requiredKeys = ['mostPopular', 'year', 'month'];

console.log('🔍 Testing translation keys that were causing errors...\n');

let allGood = true;

locales.forEach(locale => {
  const filePath = path.join(process.cwd(), 'messages', `${locale}.json`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${locale}: File not found`);
    allGood = false;
    return;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);

    console.log(`📝 ${locale}.json:`);
    
    requiredKeys.forEach(key => {
      if (translations.common && translations.common[key]) {
        console.log(`  ✅ common.${key}: "${translations.common[key]}"`);
      } else {
        console.log(`  ❌ common.${key}: MISSING`);
        allGood = false;
      }
    });

    // Check if there are any duplicate keys in landing.common
    if (translations.landing && translations.landing.common) {
      requiredKeys.forEach(key => {
        if (translations.landing.common[key]) {
          console.log(`  ⚠️  landing.common.${key}: DUPLICATE (should be removed)`);
          allGood = false;
        }
      });
    }

    console.log('');

  } catch (error) {
    console.log(`❌ ${locale}: Error parsing JSON - ${error}`);
    allGood = false;
  }
});

if (allGood) {
  console.log('🎉 All translation keys are correctly placed!');
  console.log('✅ No more "MISSING_MESSAGE" errors should occur!');
} else {
  console.log('❌ Some issues found. Please fix them.');
  process.exit(1);
}
