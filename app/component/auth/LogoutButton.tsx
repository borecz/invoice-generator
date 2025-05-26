"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/[locale]/auth/actions'; // Import server action
import { useRouter } from 'next/navigation'; // For redirecting

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

  const handleLogout = async () => {
    try {
      // Call the server action - it will redirect on success
      await signOut();

      // If we reach here, there was likely an error (since successful logout redirects)
      console.error('Logout failed - no redirect occurred');
      alert('Logout failed. Please try again.');
    } catch (catchError: any) {
      // Check if this is a redirect error (which is expected on successful logout)
      if (catchError.message?.includes('NEXT_REDIRECT')) {
        // This is expected - the server action is redirecting
        console.log('LogoutButton: Redirect detected - logout successful');
        return;
      }

      console.error('Logout error:', catchError.message);
      alert(`Logout failed: ${catchError.message}`);
    }
  };

  return (
    <Button onClick={handleLogout} variant={variant} size={size} className={className}>
      {children}
    </Button>
  );
};

export default LogoutButton;
