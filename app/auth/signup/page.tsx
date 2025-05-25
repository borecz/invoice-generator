"use client";

import React from 'react';
import SignUpForm from '@/app/component/auth/SignUpForm'; // Adjusted import path
import Link from 'next/link';

const SignUpPage = () => {
  const handleSignUp = async (values: { email?: string; password?: string }) => {
    console.log('Sign Up Page received:', values);
    // Actual sign-up logic will be added here later
    alert(`Sign Up attempt with: ${values.email}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUpForm onSubmit={handleSignUp} />
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
