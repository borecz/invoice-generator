'use server';

// Mock settings actions for the header audit
// These would normally interact with Supabase

export interface UserProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
}

export interface BusinessSettingsData {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  taxId?: string;
  vatNumber?: string;
}

export interface InvoicePreferencesData {
  defaultCurrency?: string;
  defaultTaxRate?: number;
  invoiceNumberPrefix?: string;
  invoiceNumberStart?: number;
  paymentTerms?: number;
  notes?: string;
}

export interface NotificationSettingsData {
  emailNotifications?: boolean;
  invoiceReminders?: boolean;
  paymentNotifications?: boolean;
  marketingEmails?: boolean;
}

export async function getUserProfile() {
  // Mock implementation
  return {
    data: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890'
    },
    error: null
  };
}

export async function updateUserProfile(data: UserProfileData) {
  // Mock implementation
  return {
    data: data,
    error: null
  };
}

export async function getBusinessSettings() {
  // Mock implementation
  return {
    data: {
      companyName: 'Acme Corp',
      companyAddress: '123 Business St, City, State 12345',
      companyPhone: '+1234567890',
      companyEmail: 'info@acme.com'
    },
    error: null
  };
}

export async function updateBusinessSettings(data: BusinessSettingsData) {
  // Mock implementation
  return {
    data: data,
    error: null
  };
}

export async function getInvoicePreferences() {
  // Mock implementation
  return {
    data: {
      defaultCurrency: 'USD',
      defaultTaxRate: 10,
      invoiceNumberPrefix: 'INV-',
      invoiceNumberStart: 1000,
      paymentTerms: 30
    },
    error: null
  };
}

export async function updateInvoicePreferences(data: InvoicePreferencesData) {
  // Mock implementation
  return {
    data: data,
    error: null
  };
}

export async function getNotificationSettings() {
  // Mock implementation
  return {
    data: {
      emailNotifications: true,
      invoiceReminders: true,
      paymentNotifications: true,
      marketingEmails: false
    },
    error: null
  };
}

export async function updateNotificationSettings(data: NotificationSettingsData) {
  // Mock implementation
  return {
    data: data,
    error: null
  };
}
