"use server";

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Helper function to create a Supabase client for server actions
const createSupabaseServerActionClient = () => {
  const cookieStore = cookies();
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
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
};

export async function signUpWithEmailPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createSupabaseServerActionClient();

  if (!email || !password) {
    return { error: { message: 'Email and password are required.' }, data: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Optional: email redirect URL for email confirmation
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  });

  if (error) {
    console.error('Server Action SignUp Error:', error.message);
    return { error: { message: error.message }, data: null };
  }

  // On successful sign-up, Supabase sends a confirmation email.
  // The user object might be null until the email is confirmed, depending on your Supabase settings.
  // data.user will contain the user session if email confirmation is disabled or already confirmed.
  console.log("Server Action signUpWithEmailPassword: Success. User:", data.user, "Session:", data.session);
  return { error: null, data };
}

export async function signInWithEmailPassword(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createSupabaseServerActionClient();

  if (!email || !password) {
    return { error: { message: 'Email and password are required.' }, data: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Server Action SignIn Error:', error.message);
    return { error: { message: error.message }, data: null };
  }
  
  // If sign-in is successful, the user session is set in the cookies.
  // The `data.user` object will contain the user details.
  // Typically, you would redirect after successful login.
  // For now, just returning the data.
  // For example, to redirect: redirect('/dashboard');
  console.log("Server Action signInWithEmailPassword: Success. User:", data.user, "Session:", data.session);
  return { error: null, data };
}

export async function signOut() {
  const supabase = createSupabaseServerActionClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Server Action SignOut Error:', error.message);
    return { error: { message: error.message } };
  }

  // Typically, you would redirect after successful logout.
  // redirect('/'); // Or to login page
  return { error: null };
}

export async function readUserSession() {
  const supabase = createSupabaseServerActionClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Server Action Read User Session Error:', error.message);
    return { error: { message: error.message }, session: null };
  }
  
  if (!session) {
    console.log("Server Action readUserSession: No active session.");
    return { error: { message: "User not authenticated." }, session: null };
  }
  console.log("Server Action readUserSession: Active session found.", session);
  return { error: null, session };
}

// Utility function to get the current user directly (can be used in Server Components)
export async function getCurrentUser() {
  const supabase = createSupabaseServerActionClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error('Server Action Get Current User Error:', error.message);
    return null;
  }
  if (!user) {
    console.log("Server Action getCurrentUser: No user found.");
  } else {
    console.log("Server Action getCurrentUser: User found.", user);
  }
  return user;
}
