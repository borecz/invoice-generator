import { Country, countryLanguageMappings } from '@/i18n';

// Tax rates by country (simplified example)
export const taxRates = {
  US: { standard: 0.0875, name: 'Sales Tax' }, // Average US sales tax
  IT: { standard: 0.22, name: 'IVA' }, // Italian VAT
  CZ: { standard: 0.21, name: 'DPH' }, // Czech VAT
  RU: { standard: 0.20, name: 'НДС' }, // Russian VAT
} as const;

// Currency symbols by country
export const currencySymbols = {
  US: '$',
  IT: '€',
  CZ: 'Kč',
  RU: '₽',
} as const;

// Date formats by country
export const dateFormats = {
  US: 'MM/DD/YYYY',
  IT: 'DD/MM/YYYY',
  CZ: 'DD.MM.YYYY',
  RU: 'DD.MM.YYYY',
} as const;

// Number formats by country
export const numberFormats = {
  US: { decimal: '.', thousands: ',' },
  IT: { decimal: ',', thousands: '.' },
  CZ: { decimal: ',', thousands: ' ' },
  RU: { decimal: ',', thousands: ' ' },
} as const;

// Business registry information by country
export const businessRegistries = {
  US: {
    name: 'IRS EIN',
    format: 'XX-XXXXXXX',
    description: 'Employer Identification Number',
  },
  IT: {
    name: 'Partita IVA',
    format: 'ITXXXXXXXXXXX',
    description: 'Italian VAT Number',
  },
  CZ: {
    name: 'DIČ',
    format: 'CZXXXXXXXX',
    description: 'Czech Tax Identification Number',
  },
  RU: {
    name: 'ИНН',
    format: 'XXXXXXXXXX',
    description: 'Russian Tax Identification Number',
  },
} as const;

// Invoice legal requirements by country
export const invoiceRequirements = {
  US: {
    requiredFields: ['invoiceNumber', 'date', 'sellerInfo', 'buyerInfo', 'items', 'total'],
    optionalFields: ['taxNumber', 'paymentTerms'],
    notes: 'Sales tax may be required depending on state regulations.',
  },
  IT: {
    requiredFields: ['invoiceNumber', 'date', 'sellerInfo', 'buyerInfo', 'items', 'total', 'vatNumber', 'vatAmount'],
    optionalFields: ['paymentTerms', 'bankDetails'],
    notes: 'Must include VAT details and comply with Italian electronic invoicing requirements.',
  },
  CZ: {
    requiredFields: ['invoiceNumber', 'date', 'sellerInfo', 'buyerInfo', 'items', 'total', 'vatNumber', 'vatAmount'],
    optionalFields: ['paymentTerms', 'bankDetails'],
    notes: 'Must include VAT registration number and comply with Czech accounting standards.',
  },
  RU: {
    requiredFields: ['invoiceNumber', 'date', 'sellerInfo', 'buyerInfo', 'items', 'total', 'vatNumber', 'vatAmount'],
    optionalFields: ['paymentTerms', 'bankDetails'],
    notes: 'Must comply with Russian Federal Tax Service requirements.',
  },
} as const;

// Utility functions
export function getTaxRate(country: Country): number {
  return taxRates[country]?.standard || 0;
}

export function getTaxName(country: Country): string {
  return taxRates[country]?.name || 'Tax';
}

export function getCurrencySymbol(country: Country): string {
  return currencySymbols[country] || '$';
}

export function getDateFormat(country: Country): string {
  return dateFormats[country] || 'MM/DD/YYYY';
}

export function getNumberFormat(country: Country) {
  return numberFormats[country] || { decimal: '.', thousands: ',' };
}

export function getBusinessRegistry(country: Country) {
  return businessRegistries[country];
}

export function getInvoiceRequirements(country: Country) {
  return invoiceRequirements[country];
}

export function formatCurrency(amount: number, country: Country): string {
  const symbol = getCurrencySymbol(country);
  const format = getNumberFormat(country);
  
  // Format the number with appropriate decimal and thousands separators
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace(/,/g, format.thousands).replace(/\./g, format.decimal);
  
  // Position currency symbol based on country conventions
  switch (country) {
    case 'US':
      return `${symbol}${formatted}`;
    case 'IT':
      return `${formatted} ${symbol}`;
    case 'CZ':
      return `${formatted} ${symbol}`;
    case 'RU':
      return `${formatted} ${symbol}`;
    default:
      return `${symbol}${formatted}`;
  }
}

export function formatDate(date: Date, country: Country): string {
  const format = getDateFormat(country);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'DD.MM.YYYY':
      return `${day}.${month}.${year}`;
    default:
      return `${month}/${day}/${year}`;
  }
}

export function calculateTax(amount: number, country: Country): number {
  const rate = getTaxRate(country);
  return amount * rate;
}

export function calculateTotal(subtotal: number, country: Country): number {
  const tax = calculateTax(subtotal, country);
  return subtotal + tax;
}
