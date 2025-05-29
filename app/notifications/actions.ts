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

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  category: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  status: "unread" | "read" | "dismissed" | "acted_upon";
  context_data: Record<string, any>;
  quick_actions: string[];
  related_entity_type?: string;
  related_entity_id?: string;
  read_at?: string;
  acted_at?: string;
  dismissed_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationData {
  type: string;
  title: string;
  message: string;
  priority?: "low" | "medium" | "high";
  context_data?: Record<string, any>;
  quick_actions?: string[];
  related_entity_type?: string;
  related_entity_id?: string;
  expires_at?: string;
}

// Get notifications for the current user
export async function getNotificationsForUser(
  limit: number = 50,
  offset: number = 0,
  status?: string,
  category?: string
) {
  try {
    const { session, error: sessionError } = await readUserSession();
    if (sessionError || !session || !session.user) {
      return { error: { message: "User not authenticated" } };
    }
    const user = session.user;

    const supabase = await createSupabaseServerActionClient();

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq("status", status);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching notifications:", error);
      return { error };
    }

    return { data };
  } catch (error: any) {
    console.error("Error in getNotificationsForUser:", error);
    return { error: { message: error.message } };
  }
}

// Create a new notification
export async function createNotification(
  notificationData: CreateNotificationData
) {
  try {
    const { session, error: sessionError } = await readUserSession();
    if (sessionError || !session || !session.user) {
      return { error: { message: "User not authenticated" } };
    }
    const user = session.user;

    const supabase = await createSupabaseServerActionClient();

    // Get notification type details
    const { data: notificationType } = await supabase
      .from("notification_types")
      .select("*")
      .eq("type", notificationData.type)
      .single();

    if (!notificationType) {
      return { error: { message: "Invalid notification type" } };
    }

    const dataToInsert = {
      user_id: user.id,
      type: notificationData.type,
      category: notificationType.category,
      title: notificationData.title,
      message: notificationData.message,
      priority: notificationData.priority || notificationType.default_priority,
      context_data: notificationData.context_data || {},
      quick_actions:
        notificationData.quick_actions ||
        notificationType.default_quick_actions,
      related_entity_type: notificationData.related_entity_type,
      related_entity_id: notificationData.related_entity_id,
      expires_at: notificationData.expires_at,
    };

    const { data, error } = await supabase
      .from("notifications")
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error("Error creating notification:", error);
      return { error };
    }

    return { data };
  } catch (error: any) {
    console.error("Error in createNotification:", error);
    return { error: { message: error.message } };
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    const { session, error: sessionError } = await readUserSession();
    if (sessionError || !session || !session.user) {
      return { error: { message: "User not authenticated" } };
    }
    const user = session.user;

    const supabase = await createSupabaseServerActionClient();

    const { data, error } = await supabase
      .from("notifications")
      .update({
        status: "read",
        read_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error marking notification as read:", error);
      return { error };
    }

    return { data };
  } catch (error: any) {
    console.error("Error in markNotificationAsRead:", error);
    return { error: { message: error.message } };
  }
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
  try {
    const { session, error: sessionError } = await readUserSession();
    if (sessionError || !session || !session.user) {
      return { error: { message: "User not authenticated" } };
    }
    const user = session.user;

    const supabase = await createSupabaseServerActionClient();

    const { data, error } = await supabase
      .from("notifications")
      .update({
        status: "read",
        read_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("status", "unread");

    if (error) {
      console.error("Error marking all notifications as read:", error);
      return { error };
    }

    return { data };
  } catch (error: any) {
    console.error("Error in markAllNotificationsAsRead:", error);
    return { error: { message: error.message } };
  }
}

// Dismiss notification
export async function dismissNotification(notificationId: string) {
  try {
    const { session, error: sessionError } = await readUserSession();
    if (sessionError || !session || !session.user) {
      return { error: { message: "User not authenticated" } };
    }
    const user = session.user;

    const supabase = await createSupabaseServerActionClient();

    const { data, error } = await supabase
      .from("notifications")
      .update({
        status: "dismissed",
        dismissed_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error dismissing notification:", error);
      return { error };
    }

    return { data };
  } catch (error: any) {
    console.error("Error in dismissNotification:", error);
    return { error: { message: error.message } };
  }
}

// Mark notification as acted upon
export async function markNotificationAsActed(notificationId: string) {
  try {
    const { session, error: sessionError } = await readUserSession();
    if (sessionError || !session || !session.user) {
      return { error: { message: "User not authenticated" } };
    }
    const user = session.user;

    const supabase = await createSupabaseServerActionClient();

    const { data, error } = await supabase
      .from("notifications")
      .update({
        status: "acted_upon",
        acted_at: new Date().toISOString(),
      })
      .eq("id", notificationId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error marking notification as acted:", error);
      return { error };
    }

    return { data };
  } catch (error: any) {
    console.error("Error in markNotificationAsActed:", error);
    return { error: { message: error.message } };
  }
}

// Get notification counts by status
export async function getNotificationCounts() {
  try {
    const { session, error: sessionError } = await readUserSession();
    if (sessionError || !session || !session.user) {
      return { error: { message: "User not authenticated" } };
    }
    const user = session.user;

    const supabase = await createSupabaseServerActionClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("status")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error getting notification counts:", error);
      return { error };
    }

    const counts = {
      total: data.length,
      unread: data.filter((n) => n.status === "unread").length,
      read: data.filter((n) => n.status === "read").length,
      dismissed: data.filter((n) => n.status === "dismissed").length,
      acted_upon: data.filter((n) => n.status === "acted_upon").length,
    };

    return { data: counts };
  } catch (error: any) {
    console.error("Error in getNotificationCounts:", error);
    return { error: { message: error.message } };
  }
}
