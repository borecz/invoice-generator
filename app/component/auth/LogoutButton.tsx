"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { signOut } from '@/app/auth/actions'; // Import server action
import { useRouter } from 'next/navigation'; // For redirecting

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await signOut();

    if (error) {
      console.error('Logout error:', error.message);
      // Optionally, display an error message to the user
      alert(`Logout failed: ${error.message}`);
    } else {
      console.log('Logout successful');
      // Redirect to homepage or login page after logout
      router.push('/'); 
      // You might also want to refresh the page or revalidate data
      // router.refresh(); // If you need to ensure server components re-fetch data
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Logout
    </Button>
  );
};

export default LogoutButton;
