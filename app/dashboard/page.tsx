"use client";

import React from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LogoutButton from '@/app/component/auth/LogoutButton';

const DashboardPage = () => {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl text-red-500">Error loading dashboard: {error.message}</p>
        <Link href="/">
          <Button variant="link">Go to Homepage</Button>
        </Link>
      </div>
    );
  }

  if (!user) {
    // This should ideally be handled by middleware, but as a fallback:
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-xl">Access Denied. Please log in.</p>
        <Link href="/auth/login">
          <Button variant="link">Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to your Dashboard!</h1>
        <p className="text-lg text-gray-600 mb-6">
          Hello, <span className="font-semibold text-indigo-600">{user.email}</span>
        </p>
        <p className="text-gray-500 mb-2">This is your protected dashboard area.</p>
        <p className="text-gray-500 mb-6">You can view your invoices or manage your account settings here (eventually!).</p>

        <div className="space-y-4">
          <Link href="/new">
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
              Create New Invoice
            </Button>
          </Link>
          <LogoutButton />
        </div>

        <div className="mt-8">
          <Link href="/">
            <Button variant="link">Back to Homepage</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
