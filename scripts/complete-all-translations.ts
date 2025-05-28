#!/usr/bin/env tsx

import fs from 'fs'
import path from 'path'

// Load English reference
const enMessages = JSON.parse(fs.readFileSync('messages/en.json', 'utf8'))

// Language mappings for common terms
const languageMappings: Record<string, Record<string, string>> = {
  it: {
    // Common terms
    'Loading...': 'Caricamento...',
    'Error': 'Errore',
    'Success': 'Successo',
    'Cancel': 'Annulla',
    'Save': 'Salva',
    'Delete': 'Elimina',
    'Edit': 'Modifica',
    'Create': 'Crea',
    'Update': 'Aggiorna',
    'Search': 'Cerca',
    'Filter': 'Filtra',
    'Clear': 'Cancella',
    'Close': 'Chiudi',
    'Back': 'Indietro',
    'Next': 'Avanti',
    'Previous': 'Precedente',
    'Submit': 'Invia',
    'Confirm': 'Conferma',
    'Yes': 'Sì',
    'No': 'No',
    'Retry': 'Riprova',
    'Welcome': 'Benvenuto',
    'Account': 'Account',
    'Dashboard': 'Dashboard',
    'Invoices': 'Fatture',
    'Customers': 'Clienti',
    'Settings': 'Impostazioni',
    'Profile': 'Profilo',
    'Login': 'Accedi',
    'Get Started': 'Inizia',
    'Features': 'Caratteristiche',
    'Pricing': 'Prezzi',
    'Testimonials': 'Testimonianze',
    'Free': 'Gratuito',
    'Pro': 'Pro',
    'Enterprise': 'Enterprise',
    'Monthly': 'Mensile',
    'Annually': 'Annuale',
    'Name': 'Nome',
    'Email': 'Email',
    'Address': 'Indirizzo',
    'Phone': 'Telefono',
    'Company': 'Azienda',
    'Date': 'Data',
    'Amount': 'Importo',
    'Status': 'Stato',
    'Actions': 'Azioni',
    'Total': 'Totale',
    'Subtotal': 'Subtotale',
    'Tax': 'Tassa',
    'Discount': 'Sconto',
    'Quantity': 'Quantità',
    'Price': 'Prezzo',
    'Description': 'Descrizione',
    'Notes': 'Note',
    'Currency': 'Valuta',
    'Language': 'Lingua',
    'Country': 'Paese',
    'City': 'Città',
    'State': 'Stato',
    'ZIP': 'CAP',
    'Business': 'Azienda',
    'Personal': 'Personale',
    'Professional': 'Professionale',
    'Invoice': 'Fattura',
    'Customer': 'Cliente',
    'Payment': 'Pagamento',
    'Due Date': 'Data di Scadenza',
    'Paid': 'Pagato',
    'Pending': 'In Attesa',
    'Overdue': 'Scaduto',
    'Draft': 'Bozza',
    'Sent': 'Inviato',
    'View': 'Visualizza',
    'Download': 'Scarica',
    'Export': 'Esporta',
    'Import': 'Importa',
    'Add': 'Aggiungi',
    'Remove': 'Rimuovi',
    'Select': 'Seleziona',
    'Choose': 'Scegli',
    'Upload': 'Carica',
    'Download PDF': 'Scarica PDF',
    'New Invoice': 'Nuova Fattura',
    'Add Customer': 'Aggiungi Cliente',
    'Create Invoice': 'Crea Fattura',
    'Edit Customer': 'Modifica Cliente',
    'Delete Customer': 'Elimina Cliente',
    'Customer Management': 'Gestione Clienti',
    'Invoice Management': 'Gestione Fatture',
    'Profile Settings': 'Impostazioni Profilo',
    'Log out': 'Disconnetti',
    'Back to Dashboard': 'Torna al Dashboard',
    'Go to Dashboard': 'Vai al Dashboard',
    'Contact Sales': 'Contatta Vendite',
    'Start Free Trial': 'Inizia Prova Gratuita',
    'Watch Demo': 'Guarda Demo',
    'Most Popular': 'Più Popolare',
    'Current': 'Attuale',
    'Recommended': 'Consigliato',
    'Loading': 'Caricamento',
    'Saving': 'Salvataggio',
    'Creating': 'Creazione',
    'Updating': 'Aggiornamento',
    'Deleting': 'Eliminazione',
    'Processing': 'Elaborazione',
    'Sending': 'Invio',
    'year': 'anno',
    'month': 'mese',
    'day': 'giorno',
    'week': 'settimana',
    'hour': 'ora',
    'minute': 'minuto',
    'second': 'secondo',
  },
  de: {
    // Common German terms
    'Loading...': 'Laden...',
    'Error': 'Fehler',
    'Success': 'Erfolg',
    'Cancel': 'Abbrechen',
    'Save': 'Speichern',
    'Delete': 'Löschen',
    'Edit': 'Bearbeiten',
    'Create': 'Erstellen',
    'Update': 'Aktualisieren',
    'Search': 'Suchen',
    'Filter': 'Filtern',
    'Clear': 'Löschen',
    'Close': 'Schließen',
    'Back': 'Zurück',
    'Next': 'Weiter',
    'Previous': 'Vorherige',
    'Submit': 'Senden',
    'Confirm': 'Bestätigen',
    'Yes': 'Ja',
    'No': 'Nein',
    'Retry': 'Wiederholen',
    'Welcome': 'Willkommen',
    'Account': 'Konto',
    'Dashboard': 'Dashboard',
    'Invoices': 'Rechnungen',
    'Customers': 'Kunden',
    'Settings': 'Einstellungen',
    'Profile': 'Profil',
    'Login': 'Anmelden',
    'Get Started': 'Loslegen',
    'Features': 'Funktionen',
    'Pricing': 'Preise',
    'Testimonials': 'Testimonials',
    'Free': 'Kostenlos',
    'Pro': 'Pro',
    'Enterprise': 'Enterprise',
    'Monthly': 'Monatlich',
    'Annually': 'Jährlich',
    'Name': 'Name',
    'Email': 'E-Mail',
    'Address': 'Adresse',
    'Phone': 'Telefon',
    'Company': 'Unternehmen',
    'Date': 'Datum',
    'Amount': 'Betrag',
    'Status': 'Status',
    'Actions': 'Aktionen',
    'Total': 'Gesamt',
    'Subtotal': 'Zwischensumme',
    'Tax': 'Steuer',
    'Discount': 'Rabatt',
    'Quantity': 'Menge',
    'Price': 'Preis',
    'Description': 'Beschreibung',
    'Notes': 'Notizen',
    'Currency': 'Währung',
    'Language': 'Sprache',
    'Country': 'Land',
    'City': 'Stadt',
    'State': 'Bundesland',
    'ZIP': 'PLZ',
    'Business': 'Geschäft',
    'Personal': 'Persönlich',
    'Professional': 'Professionell',
    'Invoice': 'Rechnung',
    'Customer': 'Kunde',
    'Payment': 'Zahlung',
    'Due Date': 'Fälligkeitsdatum',
    'Paid': 'Bezahlt',
    'Pending': 'Ausstehend',
    'Overdue': 'Überfällig',
    'Draft': 'Entwurf',
    'Sent': 'Gesendet',
    'View': 'Ansehen',
    'Download': 'Herunterladen',
    'Export': 'Exportieren',
    'Import': 'Importieren',
    'Add': 'Hinzufügen',
    'Remove': 'Entfernen',
    'Select': 'Auswählen',
    'Choose': 'Wählen',
    'Upload': 'Hochladen',
    'year': 'Jahr',
    'month': 'Monat',
    'day': 'Tag',
    'week': 'Woche',
    'hour': 'Stunde',
    'minute': 'Minute',
    'second': 'Sekunde',
  },
  // Add more languages as needed...
}

function translateText(text: string, targetLang: string): string {
  const mapping = languageMappings[targetLang]
  if (!mapping) return text
  
  // Try exact match first
  if (mapping[text]) return mapping[text]
  
  // Try partial matches for common patterns
  for (const [en, translated] of Object.entries(mapping)) {
    if (text.includes(en)) {
      return text.replace(en, translated)
    }
  }
  
  return text
}

function translateObject(obj: any, targetLang: string): any {
  if (typeof obj === 'string') {
    return translateText(obj, targetLang)
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => translateObject(item, targetLang))
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const result: any = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = translateObject(value, targetLang)
    }
    return result
  }
  
  return obj
}

function completeTranslationFile(locale: string) {
  const filePath = `messages/${locale}.json`
  let existingMessages = {}
  
  // Load existing translations if file exists
  if (fs.existsSync(filePath)) {
    try {
      existingMessages = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch (error) {
      console.warn(`Warning: Could not parse existing ${locale}.json, starting fresh`)
    }
  }
  
  // Merge with English structure, preserving existing translations
  function mergeTranslations(enObj: any, existingObj: any): any {
    if (typeof enObj === 'string') {
      // If we have an existing translation, keep it; otherwise translate from English
      return existingObj || translateText(enObj, locale)
    }
    
    if (Array.isArray(enObj)) {
      return enObj.map((item, index) => 
        mergeTranslations(item, existingObj?.[index])
      )
    }
    
    if (typeof enObj === 'object' && enObj !== null) {
      const result: any = {}
      for (const [key, value] of Object.entries(enObj)) {
        result[key] = mergeTranslations(value, existingObj?.[key])
      }
      return result
    }
    
    return enObj
  }
  
  const completeMessages = mergeTranslations(enMessages, existingMessages)
  
  // Write the completed translation file
  fs.writeFileSync(filePath, JSON.stringify(completeMessages, null, 2), 'utf8')
  console.log(`✅ Completed ${locale}.json`)
}

// Complete all translation files
const locales = ['it', 'cs', 'ru', 'de', 'fr', 'es', 'pt', 'nl', 'sv', 'da', 'fi', 'el', 'hu', 'pl']

console.log('🌐 Completing all translation files...\n')

locales.forEach(locale => {
  completeTranslationFile(locale)
})

console.log('\n🎉 All translation files completed!')
console.log('\nNext steps:')
console.log('1. Review the generated translations')
console.log('2. Replace auto-generated text with proper translations')
console.log('3. Run npm run test:i18n to validate')
