"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import SignUpForm from '@/app/component/auth/SignUpForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const SignUpPage = () => {
  const t = useTranslations('auth.signup');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Invoice Generator</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {t('title')}
          </h2>
          <p className="text-sm text-gray-600">
            {t('hasAccount')}{' '}
            <Link href="/auth/login">
              <Button variant="link" className="p-0 h-auto font-medium text-orange-600 hover:text-orange-500">
                {t('signInExisting')}
              </Button>
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10 border border-gray-200">
          <SignUpForm />

          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="link" className="text-sm text-gray-500 hover:text-gray-700">
                {t('backToHomepage')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
