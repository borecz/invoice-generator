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

interface InvoiceItem {
  itemName: string;
  itemQty: number;
  itemPrice: number;
  itemTotal: number;
}

interface InlineCustomer {
  name: string;
  email?: string | null;
  address?: string | null;
}

interface InvoiceData {
  invoice_number: string;
  customer_id?: string | null;
  inline_customer?: InlineCustomer;
  invoice_date: string;
  due_date?: string | null;
  items: InvoiceItem[];
  total_amount: number;
}

export async function saveInvoice(invoiceData: InvoiceData) {
  const supabase = await createSupabaseServerActionClient();

  // 1. Get current user session
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "saveInvoice Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  // 2. Prepare data for insertion
  const {
    invoice_number,
    customer_id,
    inline_customer,
    invoice_date,
    due_date,
    items,
    total_amount,
  } = invoiceData;

  // Validate required fields
  if (
    !invoice_number ||
    !invoice_date ||
    !items ||
    total_amount === undefined
  ) {
    return {
      data: null,
      error: {
        message:
          "Missing required invoice fields (number, date, items, total).",
      },
    };
  }

  // Validate customer information
  if (!customer_id && (!inline_customer || !inline_customer.name)) {
    return {
      data: null,
      error: {
        message: "Either customer ID or inline customer name is required.",
      },
    };
  }

  const dataToInsert = {
    user_id: userId,
    invoice_number,
    customer_id: customer_id || null,
    customer_name: inline_customer?.name || null,
    customer_email: inline_customer?.email || null,
    customer_address: inline_customer?.address || null,
    invoice_date,
    due_date: due_date || null,
    items: JSON.stringify(items),
    total_amount,
    status: "draft",
  };

  console.log("saveInvoice: Data to insert:", dataToInsert);

  // 3. Perform insert operation
  const { data, error } = await supabase
    .from("invoices")
    .insert([dataToInsert])
    .select();

  if (error) {
    console.error("saveInvoice Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to save invoice: ${error.message}` },
    };
  }

  console.log("saveInvoice: Invoice saved successfully:", data);
  return { data, error: null };
}

export async function getInvoicesForUser() {
  const supabase = await createSupabaseServerActionClient();

  // 1. Get current user session
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    console.error(
      "getInvoicesForUser Error: User not authenticated.",
      sessionError?.message
    );
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  // 2. Fetch invoices for the user
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      invoice_date,
      total_amount,
      status,
      customer_id,
      customer_name,
      customer_email,
      customer_address,
      customers ( name )
    `
    )
    .eq("user_id", userId)
    .order("invoice_date", { ascending: false });

  if (error) {
    console.error("getInvoicesForUser Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to fetch invoices: ${error.message}` },
    };
  }

  console.log("getInvoicesForUser: Invoices fetched successfully:", data);
  return { data, error: null };
}

export async function getInvoiceById(invoiceId: string) {
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
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("getInvoiceById Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to fetch invoice: ${error.message}` },
    };
  }

  return { data, error: null };
}

export async function updateInvoiceStatus(invoiceId: string, status: string) {
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
    .from("invoices")
    .update({ status })
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("updateInvoiceStatus Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to update invoice status: ${error.message}` },
    };
  }

  return { data, error: null };
}

export async function deleteInvoice(invoiceId: string) {
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
    .from("invoices")
    .delete()
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("deleteInvoice Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to delete invoice: ${error.message}` },
    };
  }

  return { data, error: null };
}
