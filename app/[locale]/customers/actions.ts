"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { readUserSession } from "@/app/[locale]/auth/actions";

// Helper function to create a Supabase client for server actions
// This is similar to the one in auth/actions.ts and invoices/actions.ts
// Consider refactoring to a shared utility if this pattern continues.
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

interface CustomerData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
}

export async function addCustomer(customerData: CustomerData) {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "addCustomer Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  if (!customerData.name) {
    return { data: null, error: { message: "Customer name is required." } };
  }

  const dataToInsert = {
    user_id: userId,
    name: customerData.name,
    email: customerData.email || null,
    phone: customerData.phone || null,
    address: customerData.address || null,
    company: customerData.company || null,
    notes: customerData.notes || null,
    // created_at is defaulted by Supabase
  };

  console.log("addCustomer: Data to insert:", dataToInsert);

  const { data, error } = await supabase
    .from("customers")
    .insert([dataToInsert])
    .select(); // Return the inserted row

  if (error) {
    console.error("addCustomer Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to add customer: ${error.message}` },
    };
  }

  console.log("addCustomer: Customer added successfully:", data);
  return { data, error: null };
}

export async function getCustomersForUser() {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "getCustomersForUser Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, email, phone, address, company, notes, created_at")
    .eq("user_id", userId)
    .order("name", { ascending: true });

  if (error) {
    console.error("getCustomersForUser Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to fetch customers: ${error.message}` },
    };
  }

  console.log("getCustomersForUser: Customers fetched successfully:", data);
  return { data, error: null };
}

export async function updateCustomer(
  customerId: string,
  customerData: CustomerData
) {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "updateCustomer Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  if (!customerData.name) {
    return { data: null, error: { message: "Customer name is required." } };
  }

  const dataToUpdate = {
    name: customerData.name,
    email: customerData.email || null,
    phone: customerData.phone || null,
    address: customerData.address || null,
    company: customerData.company || null,
    notes: customerData.notes || null,
  };

  console.log("updateCustomer: Data to update:", dataToUpdate);

  const { data, error } = await supabase
    .from("customers")
    .update(dataToUpdate)
    .eq("id", customerId)
    .eq("user_id", userId) // Ensure user can only update their own customers
    .select();

  if (error) {
    console.error("updateCustomer Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to update customer: ${error.message}` },
    };
  }

  console.log("updateCustomer: Customer updated successfully:", data);
  return { data, error: null };
}

export async function deleteCustomer(customerId: string) {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "deleteCustomer Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  console.log("deleteCustomer: Deleting customer:", customerId);

  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customerId)
    .eq("user_id", userId) // Ensure user can only delete their own customers
    .select();

  if (error) {
    console.error("deleteCustomer Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to delete customer: ${error.message}` },
    };
  }

  console.log("deleteCustomer: Customer deleted successfully:", data);
  return { data, error: null };
}
