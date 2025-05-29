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

export async function getInvoicesForUser(options?: {
  includeDeleted?: boolean;
  includeArchived?: boolean;
  status?: string;
  limit?: number;
}) {
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

  // 2. Build query with filters
  let query = supabase
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
      deleted_at,
      archived_at,
      customers ( name )
    `
    )
    .eq("user_id", userId);

  // Apply filters
  if (!options?.includeDeleted) {
    query = query.is("deleted_at", null);
  }

  if (!options?.includeArchived) {
    query = query.is("archived_at", null);
  }

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  query = query.order("invoice_date", { ascending: false });

  const { data, error } = await query;

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

// Soft delete invoice (move to trash)
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
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .is("deleted_at", null) // Only delete if not already deleted
    .select();

  if (error) {
    console.error("deleteInvoice Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to delete invoice: ${error.message}` },
    };
  }

  if (!data || data.length === 0) {
    return {
      data: null,
      error: { message: "Invoice not found or already deleted." },
    };
  }

  return { data, error: null };
}

// Permanently delete invoice
export async function permanentlyDeleteInvoice(invoiceId: string) {
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
    console.error("permanentlyDeleteInvoice Supabase Error:", error.message);
    return {
      data: null,
      error: {
        message: `Failed to permanently delete invoice: ${error.message}`,
      },
    };
  }

  return { data, error: null };
}

// Restore invoice from trash
export async function restoreInvoice(invoiceId: string) {
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
    .update({ deleted_at: null })
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .not("deleted_at", "is", null) // Only restore if deleted
    .select();

  if (error) {
    console.error("restoreInvoice Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to restore invoice: ${error.message}` },
    };
  }

  if (!data || data.length === 0) {
    return {
      data: null,
      error: { message: "Invoice not found or not deleted." },
    };
  }

  return { data, error: null };
}

// Archive/Unarchive invoice
export async function toggleArchiveInvoice(
  invoiceId: string,
  archive: boolean
) {
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
    .update({
      archived_at: archive ? new Date().toISOString() : null,
      status: archive ? "archived" : "draft",
    })
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .is("deleted_at", null) // Don't archive deleted invoices
    .select();

  if (error) {
    console.error("toggleArchiveInvoice Supabase Error:", error.message);
    return {
      data: null,
      error: {
        message: `Failed to ${archive ? "archive" : "unarchive"} invoice: ${
          error.message
        }`,
      },
    };
  }

  return { data, error: null };
}

// Duplicate invoice
export async function duplicateInvoice(invoiceId: string) {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  // First, get the original invoice
  const { data: originalInvoice, error: fetchError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (fetchError || !originalInvoice) {
    console.error("duplicateInvoice Fetch Error:", fetchError?.message);
    return {
      data: null,
      error: { message: "Failed to fetch original invoice for duplication." },
    };
  }

  // Create new invoice data with updated fields
  const newInvoiceData = {
    ...originalInvoice,
    id: undefined, // Let database generate new ID
    invoice_number: `${originalInvoice.invoice_number}-COPY-${Date.now()}`,
    status: "draft",
    created_at: undefined,
    updated_at: undefined,
    deleted_at: null,
    archived_at: null,
    public_url_token: null,
    public_url_enabled: false,
    email_sent_at: null,
    last_viewed_at: null,
    view_count: 0,
    payment_due_reminder_sent_at: null,
  };

  const { data, error } = await supabase
    .from("invoices")
    .insert([newInvoiceData])
    .select();

  if (error) {
    console.error("duplicateInvoice Insert Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to duplicate invoice: ${error.message}` },
    };
  }

  return { data, error: null };
}

// Get deleted invoices (trash)
export async function getDeletedInvoices() {
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
    .select(
      `
      *,
      customers (
        name
      )
    `
    )
    .eq("user_id", userId)
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) {
    console.error("getDeletedInvoices Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to fetch deleted invoices: ${error.message}` },
    };
  }

  return { data, error: null };
}

// Get archived invoices
export async function getArchivedInvoices() {
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
    .select(
      `
      *,
      customers (
        name
      )
    `
    )
    .eq("user_id", userId)
    .not("archived_at", "is", null)
    .is("deleted_at", null)
    .order("archived_at", { ascending: false });

  if (error) {
    console.error("getArchivedInvoices Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to fetch archived invoices: ${error.message}` },
    };
  }

  return { data, error: null };
}

// Update invoice data (for editing)
export async function updateInvoice(
  invoiceId: string,
  invoiceData: Partial<InvoiceData>
) {
  const supabase = await createSupabaseServerActionClient();
  const { session, error: sessionError } = await readUserSession();

  if (sessionError || !session || !session.user) {
    return {
      data: null,
      error: { message: "User not authenticated. Please log in." },
    };
  }

  const userId = session.user.id;

  // Prepare update data
  const updateData: any = {};

  if (invoiceData.invoice_number)
    updateData.invoice_number = invoiceData.invoice_number;
  if (invoiceData.customer_id !== undefined)
    updateData.customer_id = invoiceData.customer_id;
  if (invoiceData.inline_customer) {
    updateData.customer_name = invoiceData.inline_customer.name;
    updateData.customer_email = invoiceData.inline_customer.email;
    updateData.customer_address = invoiceData.inline_customer.address;
  }
  if (invoiceData.invoice_date)
    updateData.invoice_date = invoiceData.invoice_date;
  if (invoiceData.due_date !== undefined)
    updateData.due_date = invoiceData.due_date;
  if (invoiceData.items) updateData.items = JSON.stringify(invoiceData.items);
  if (invoiceData.total_amount !== undefined)
    updateData.total_amount = invoiceData.total_amount;

  const { data, error } = await supabase
    .from("invoices")
    .update(updateData)
    .eq("id", invoiceId)
    .eq("user_id", userId)
    .is("deleted_at", null) // Don't update deleted invoices
    .select();

  if (error) {
    console.error("updateInvoice Supabase Error:", error.message);
    return {
      data: null,
      error: { message: `Failed to update invoice: ${error.message}` },
    };
  }

  if (!data || data.length === 0) {
    return {
      data: null,
      error: { message: "Invoice not found or cannot be updated." },
    };
  }

  return { data, error: null };
}
