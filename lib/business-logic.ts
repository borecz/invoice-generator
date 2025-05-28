import { Country, countryLanguageMappings } from "@/i18n";

// Tax rates by country (simplified example)
export const taxRates = {
  // Original countries
  US: { standard: 0.0875, name: "Sales Tax" }, // Average US sales tax
  IT: { standard: 0.22, name: "IVA" }, // Italian VAT
  CZ: { standard: 0.21, name: "DPH" }, // Czech VAT
  RU: { standard: 0.2, name: "НДС" }, // Russian VAT

  // EU Member Countries
  AT: { standard: 0.2, name: "USt" }, // Austrian VAT
  BE: { standard: 0.21, name: "TVA/BTW" }, // Belgian VAT
  BG: { standard: 0.2, name: "ДДС" }, // Bulgarian VAT
  HR: { standard: 0.25, name: "PDV" }, // Croatian VAT
  CY: { standard: 0.19, name: "ΦΠΑ" }, // Cypriot VAT
  DK: { standard: 0.25, name: "Moms" }, // Danish VAT
  EE: { standard: 0.2, name: "KM" }, // Estonian VAT
  FI: { standard: 0.24, name: "ALV" }, // Finnish VAT
  FR: { standard: 0.2, name: "TVA" }, // French VAT
  DE: { standard: 0.19, name: "MwSt" }, // German VAT
  GR: { standard: 0.24, name: "ΦΠΑ" }, // Greek VAT
  HU: { standard: 0.27, name: "ÁFA" }, // Hungarian VAT
  IE: { standard: 0.23, name: "VAT" }, // Irish VAT
  LV: { standard: 0.21, name: "PVN" }, // Latvian VAT
  LT: { standard: 0.21, name: "PVM" }, // Lithuanian VAT
  LU: { standard: 0.17, name: "TVA" }, // Luxembourg VAT
  MT: { standard: 0.18, name: "VAT" }, // Maltese VAT
  NL: { standard: 0.21, name: "BTW" }, // Dutch VAT
  PL: { standard: 0.23, name: "VAT" }, // Polish VAT
  PT: { standard: 0.23, name: "IVA" }, // Portuguese VAT
  RO: { standard: 0.19, name: "TVA" }, // Romanian VAT
  SK: { standard: 0.2, name: "DPH" }, // Slovak VAT
  SI: { standard: 0.22, name: "DDV" }, // Slovenian VAT
  ES: { standard: 0.21, name: "IVA" }, // Spanish VAT
  SE: { standard: 0.25, name: "Moms" }, // Swedish VAT

  // Additional Non-EU Countries
  GB: { standard: 0.2, name: "VAT" }, // UK VAT
  TR: { standard: 0.18, name: "KDV" }, // Turkish VAT
  AE: { standard: 0.05, name: "VAT" }, // UAE VAT
  ID: { standard: 0.11, name: "PPN" }, // Indonesian VAT
} as const;

// Currency symbols by country
export const currencySymbols = {
  // Original countries
  US: "$",
  IT: "€",
  CZ: "Kč",
  RU: "₽",

  // EU Member Countries (Euro zone)
  AT: "€", // Austria
  BE: "€", // Belgium
  BG: "лв", // Bulgaria - Bulgarian Lev
  HR: "€", // Croatia (adopted Euro in 2023)
  CY: "€", // Cyprus
  DK: "kr", // Denmark - Danish Krone
  EE: "€", // Estonia
  FI: "€", // Finland
  FR: "€", // France
  DE: "€", // Germany
  GR: "€", // Greece
  HU: "Ft", // Hungary - Hungarian Forint
  IE: "€", // Ireland
  LV: "€", // Latvia
  LT: "€", // Lithuania
  LU: "€", // Luxembourg
  MT: "€", // Malta
  NL: "€", // Netherlands
  PL: "zł", // Poland - Polish Złoty
  PT: "€", // Portugal
  RO: "lei", // Romania - Romanian Leu
  SK: "€", // Slovakia
  SI: "€", // Slovenia
  ES: "€", // Spain
  SE: "kr", // Sweden - Swedish Krona

  // Additional Non-EU Countries
  GB: "£", // United Kingdom - British Pound
  TR: "₺", // Turkey - Turkish Lira
  AE: "د.إ", // UAE - UAE Dirham
  ID: "Rp", // Indonesia - Indonesian Rupiah
} as const;

// Date formats by country
export const dateFormats = {
  // Original countries
  US: "MM/DD/YYYY",
  IT: "DD/MM/YYYY",
  CZ: "DD.MM.YYYY",
  RU: "DD.MM.YYYY",

  // EU Member Countries
  AT: "DD.MM.YYYY", // Austria
  BE: "DD/MM/YYYY", // Belgium
  BG: "DD.MM.YYYY", // Bulgaria
  HR: "DD.MM.YYYY", // Croatia
  CY: "DD/MM/YYYY", // Cyprus
  DK: "DD.MM.YYYY", // Denmark
  EE: "DD.MM.YYYY", // Estonia
  FI: "DD.MM.YYYY", // Finland
  FR: "DD/MM/YYYY", // France
  DE: "DD.MM.YYYY", // Germany
  GR: "DD/MM/YYYY", // Greece
  HU: "YYYY.MM.DD", // Hungary
  IE: "DD/MM/YYYY", // Ireland
  LV: "DD.MM.YYYY", // Latvia
  LT: "YYYY-MM-DD", // Lithuania
  LU: "DD/MM/YYYY", // Luxembourg
  MT: "DD/MM/YYYY", // Malta
  NL: "DD-MM-YYYY", // Netherlands
  PL: "DD.MM.YYYY", // Poland
  PT: "DD/MM/YYYY", // Portugal
  RO: "DD.MM.YYYY", // Romania
  SK: "DD.MM.YYYY", // Slovakia
  SI: "DD.MM.YYYY", // Slovenia
  ES: "DD/MM/YYYY", // Spain
  SE: "YYYY-MM-DD", // Sweden

  // Additional Non-EU Countries
  GB: "DD/MM/YYYY", // United Kingdom
  TR: "DD.MM.YYYY", // Turkey
  AE: "DD/MM/YYYY", // UAE
  ID: "DD/MM/YYYY", // Indonesia
} as const;

// Number formats by country
export const numberFormats = {
  // Original countries
  US: { decimal: ".", thousands: "," },
  IT: { decimal: ",", thousands: "." },
  CZ: { decimal: ",", thousands: " " },
  RU: { decimal: ",", thousands: " " },

  // EU Member Countries
  AT: { decimal: ",", thousands: "." }, // Austria
  BE: { decimal: ",", thousands: "." }, // Belgium
  BG: { decimal: ",", thousands: " " }, // Bulgaria
  HR: { decimal: ",", thousands: "." }, // Croatia
  CY: { decimal: ",", thousands: "." }, // Cyprus
  DK: { decimal: ",", thousands: "." }, // Denmark
  EE: { decimal: ",", thousands: " " }, // Estonia
  FI: { decimal: ",", thousands: " " }, // Finland
  FR: { decimal: ",", thousands: " " }, // France
  DE: { decimal: ",", thousands: "." }, // Germany
  GR: { decimal: ",", thousands: "." }, // Greece
  HU: { decimal: ",", thousands: " " }, // Hungary
  IE: { decimal: ".", thousands: "," }, // Ireland
  LV: { decimal: ",", thousands: " " }, // Latvia
  LT: { decimal: ",", thousands: " " }, // Lithuania
  LU: { decimal: ",", thousands: "." }, // Luxembourg
  MT: { decimal: ".", thousands: "," }, // Malta
  NL: { decimal: ",", thousands: "." }, // Netherlands
  PL: { decimal: ",", thousands: " " }, // Poland
  PT: { decimal: ",", thousands: " " }, // Portugal
  RO: { decimal: ",", thousands: "." }, // Romania
  SK: { decimal: ",", thousands: " " }, // Slovakia
  SI: { decimal: ",", thousands: "." }, // Slovenia
  ES: { decimal: ",", thousands: "." }, // Spain
  SE: { decimal: ",", thousands: " " }, // Sweden

  // Additional Non-EU Countries
  GB: { decimal: ".", thousands: "," }, // United Kingdom
  TR: { decimal: ",", thousands: "." }, // Turkey
  AE: { decimal: ".", thousands: "," }, // UAE
  ID: { decimal: ",", thousands: "." }, // Indonesia
} as const;

// Business registry information by country
export const businessRegistries = {
  US: {
    name: "IRS EIN",
    format: "XX-XXXXXXX",
    description: "Employer Identification Number",
  },
  IT: {
    name: "Partita IVA",
    format: "ITXXXXXXXXXXX",
    description: "Italian VAT Number",
  },
  CZ: {
    name: "DIČ",
    format: "CZXXXXXXXX",
    description: "Czech Tax Identification Number",
  },
  RU: {
    name: "ИНН",
    format: "XXXXXXXXXX",
    description: "Russian Tax Identification Number",
  },
} as const;

// Invoice legal requirements by country
export const invoiceRequirements = {
  US: {
    requiredFields: [
      "invoiceNumber",
      "date",
      "sellerInfo",
      "buyerInfo",
      "items",
      "total",
    ],
    optionalFields: ["taxNumber", "paymentTerms"],
    notes: "Sales tax may be required depending on state regulations.",
  },
  IT: {
    requiredFields: [
      "invoiceNumber",
      "date",
      "sellerInfo",
      "buyerInfo",
      "items",
      "total",
      "vatNumber",
      "vatAmount",
    ],
    optionalFields: ["paymentTerms", "bankDetails"],
    notes:
      "Must include VAT details and comply with Italian electronic invoicing requirements.",
  },
  CZ: {
    requiredFields: [
      "invoiceNumber",
      "date",
      "sellerInfo",
      "buyerInfo",
      "items",
      "total",
      "vatNumber",
      "vatAmount",
    ],
    optionalFields: ["paymentTerms", "bankDetails"],
    notes:
      "Must include VAT registration number and comply with Czech accounting standards.",
  },
  RU: {
    requiredFields: [
      "invoiceNumber",
      "date",
      "sellerInfo",
      "buyerInfo",
      "items",
      "total",
      "vatNumber",
      "vatAmount",
    ],
    optionalFields: ["paymentTerms", "bankDetails"],
    notes: "Must comply with Russian Federal Tax Service requirements.",
  },
} as const;

// Utility functions
export function getTaxRate(country: Country): number {
  return taxRates[country]?.standard || 0;
}

export function getTaxName(country: Country): string {
  return taxRates[country]?.name || "Tax";
}

export function getCurrencySymbol(country: Country): string {
  return currencySymbols[country] || "$";
}

export function getDateFormat(country: Country): string {
  return dateFormats[country] || "MM/DD/YYYY";
}

export function getNumberFormat(country: Country) {
  return numberFormats[country] || { decimal: ".", thousands: "," };
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
  const formatted = amount
    .toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    .replace(/,/g, format.thousands)
    .replace(/\./g, format.decimal);

  // Position currency symbol based on country conventions
  switch (country) {
    case "US":
      return `${symbol}${formatted}`;
    case "IT":
      return `${formatted} ${symbol}`;
    case "CZ":
      return `${formatted} ${symbol}`;
    case "RU":
      return `${formatted} ${symbol}`;
    default:
      return `${symbol}${formatted}`;
  }
}

export function formatDate(date: Date, country: Country): string {
  const format = getDateFormat(country);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear().toString();

  switch (format) {
    case "MM/DD/YYYY":
      return `${month}/${day}/${year}`;
    case "DD/MM/YYYY":
      return `${day}/${month}/${year}`;
    case "DD.MM.YYYY":
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
