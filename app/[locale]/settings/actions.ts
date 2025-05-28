"use server";

import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { readUserSession } from "@/app/[locale]/auth/actions";

// Helper function to create a Supabase client for server actions
const createSupabaseServerActionClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
};

// User Profile Settings Interface
interface UserProfileData {
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  avatar_url?: string;
}

// Business Settings Interface
export interface BusinessSettingsData {
  business_name?: string;
  business_email?: string;
  business_phone?: string;
  business_address?: string;
  business_city?: string;
  business_state?: string;
  business_country?: string;
  business_zip?: string;
  tax_id?: string;
  business_logo_url?: string;
}

// Invoice Preferences Interface
export interface InvoicePreferencesData {
  default_currency?: string;
  default_payment_terms?: number; // days
  default_tax_rate?: number; // percentage
  invoice_number_format?: string;
  default_notes?: string;
  auto_send_reminders?: boolean;
  reminder_days_before_due?: number;
  reminder_days_after_due?: number;
}

// Notification Settings Interface
export interface NotificationSettingsData {
  email_invoice_created?: boolean;
  email_invoice_paid?: boolean;
  email_invoice_overdue?: boolean;
  email_new_customer?: boolean;
  email_marketing?: boolean;
  email_product_updates?: boolean;
}

// Get user profile settings
export async function getUserProfile() {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "getUserProfile Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    console.error("getUserProfile Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to fetch user profile: ${error.message}` },
    };
  }

  console.log("getUserProfile: Profile fetched successfully:", data);
  return { data: data || {}, error: null };
}

// Update user profile settings
export async function updateUserProfile(profileData: UserProfileData) {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "updateUserProfile Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  const dataToUpsert = {
    user_id: userId,
    ...profileData,
    updated_at: new Date().toISOString(),
  };

  console.log("updateUserProfile: Data to upsert:", dataToUpsert);

  const { data, error } = await supabase
    .from("user_profiles")
    .upsert([dataToUpsert])
    .select();

  if (error) {
    console.error("updateUserProfile Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to update user profile: ${error.message}` },
    };
  }

  console.log("updateUserProfile: Profile updated successfully:", data);
  return { data, error: null };
}

// Get business settings
export async function getBusinessSettings() {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "getBusinessSettings Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("business_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("getBusinessSettings Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to fetch business settings: ${error.message}` },
    };
  }

  console.log("getBusinessSettings: Settings fetched successfully:", data);
  return { data: data || {}, error: null };
}

// Update business settings
export async function updateBusinessSettings(
  businessData: BusinessSettingsData
) {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "updateBusinessSettings Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  const dataToUpsert = {
    user_id: userId,
    ...businessData,
    updated_at: new Date().toISOString(),
  };

  console.log("updateBusinessSettings: Data to upsert:", dataToUpsert);

  const { data, error } = await supabase
    .from("business_settings")
    .upsert([dataToUpsert])
    .select();

  if (error) {
    console.error("updateBusinessSettings Supabase Error:", error.message);
    return {
      data: null,
      error: {
        message: `Failed to update business settings: ${error.message}`,
      },
    };
  }

  console.log("updateBusinessSettings: Settings updated successfully:", data);
  return { data, error: null };
}

// Get invoice preferences
export async function getInvoicePreferences() {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "getInvoicePreferences Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("invoice_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("getInvoicePreferences Supabase Error:", error.message);
    return {
      data: null,
      error: {
        message: `Failed to fetch invoice preferences: ${error.message}`,
      },
    };
  }

  console.log("getInvoicePreferences: Preferences fetched successfully:", data);
  return { data: data || {}, error: null };
}

// Update invoice preferences
export async function updateInvoicePreferences(
  preferencesData: InvoicePreferencesData
) {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "updateInvoicePreferences Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  const dataToUpsert = {
    user_id: userId,
    ...preferencesData,
    updated_at: new Date().toISOString(),
  };

  console.log("updateInvoicePreferences: Data to upsert:", dataToUpsert);

  const { data, error } = await supabase
    .from("invoice_preferences")
    .upsert([dataToUpsert])
    .select();

  if (error) {
    console.error("updateInvoicePreferences Supabase Error:", error.message);
    return {
      data: null,
      error: {
        message: `Failed to update invoice preferences: ${error.message}`,
      },
    };
  }

  console.log(
    "updateInvoicePreferences: Preferences updated successfully:",
    data
  );
  return { data, error: null };
}

// Get notification settings
export async function getNotificationSettings() {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "getNotificationSettings Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("getNotificationSettings Supabase Error:", error.message);
    return {
      data: null,
      error: {
        message: `Failed to fetch notification settings: ${error.message}`,
      },
    };
  }

  console.log("getNotificationSettings: Settings fetched successfully:", data);
  return { data: data || {}, error: null };
}

// Update notification settings
export async function updateNotificationSettings(
  notificationData: NotificationSettingsData
) {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "updateNotificationSettings Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  const dataToUpsert = {
    user_id: userId,
    ...notificationData,
    updated_at: new Date().toISOString(),
  };

  console.log("updateNotificationSettings: Data to upsert:", dataToUpsert);

  const { data, error } = await supabase
    .from("notification_settings")
    .upsert([dataToUpsert])
    .select();

  if (error) {
    console.error("updateNotificationSettings Supabase Error:", error.message);
    return {
      data: null,
      error: {
        message: `Failed to update notification settings: ${error.message}`,
      },
    };
  }

  console.log(
    "updateNotificationSettings: Settings updated successfully:",
    data
  );
  return { data, error: null };
}
