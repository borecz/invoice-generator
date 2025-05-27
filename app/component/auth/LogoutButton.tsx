"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/[locale]/auth/actions'; // Import server action
import { useRouter } from 'next/navigation'; // For redirecting
import { useLocale } from 'next-intl'; // For locale-aware redirects
import { supabase } from '@/lib/supabase/client'; // For client-side logout
import { Loader2 } from 'lucide-react'; // For loading spinner

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = "outline",
  size = "default",
  className = "",
  children = "Logout"
}) => {
  const router = useRouter();
  const locale = useLocale();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts

    setIsLoggingOut(true);

    try {
      console.log('LogoutButton: Starting logout process...');

      // First, perform client-side logout to immediately update the auth state
      const { error: clientError } = await supabase.auth.signOut();

      if (clientError) {
        console.error('LogoutButton: Client-side logout error:', clientError.message);
        // Continue with server-side logout even if client-side fails
      } else {
        console.log('LogoutButton: Client-side logout successful');
      }

      // Then call the server action for complete logout and redirect
      await signOut(locale);

      // If we reach here, there was likely an error (since successful logout redirects)
      console.error('LogoutButton: Logout failed - no redirect occurred');
    } catch (catchError: any) {
      // Check if this is a redirect error (which is expected on successful logout)
      if (catchError.message?.includes('NEXT_REDIRECT')) {
        // This is expected - the server action is redirecting
        console.log('LogoutButton: Redirect detected - logout successful');
        return;
      }

      console.error('LogoutButton: Logout error:', catchError.message);

      // Fallback: try manual redirect if server action fails
      try {
        console.log('LogoutButton: Attempting fallback redirect...');
        router.push(`/${locale}`);
        router.refresh();
      } catch (redirectError) {
        console.error('LogoutButton: Fallback redirect failed:', redirectError);
        // Last resort: reload the page
        window.location.href = `/${locale}`;
      }
    } finally {
      // Reset loading state (though this might not execute if redirect happens)
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      variant={variant}
      size={size}
      className={className}
      disabled={isLoggingOut}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Logging out...
        </>
      ) : (
        children
      )}
    </Button>
  );
};

export default LogoutButton;
