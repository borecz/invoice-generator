"use server";

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
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
  };

  console.log("addCustomer: Data to insert:", dataToInsert);

  const { data, error } = await supabase
    .from("customers")
    .insert([dataToInsert])
    .select();

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

export async function getCustomerById(customerId: string) {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("id", customerId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("getCustomerById Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to fetch customer: ${error.message}` },
    };
  }

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
    .eq("user_id", userId)
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
    .eq("user_id", userId)
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

export async function searchCustomers(query: string) {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, email, phone, address, company")
    .eq("user_id", userId)
    .or(`name.ilike.%${query}%,email.ilike.%${query}%,company.ilike.%${query}%`)
    .order("name", { ascending: true })
    .limit(10);

  if (error) {
    console.error("searchCustomers Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to search customers: ${error.message}` },
    };
  }

  return { data, error: null };
}
