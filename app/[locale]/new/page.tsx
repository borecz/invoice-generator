"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/app/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Plus,
  Save,
  Users,
  X,
} from 'lucide-react';
import { NewInvoiceForm } from "@/app/[locale]/new/component/NewInvoiceForm";
import { Header } from "@/app/components/layout/Header";

const NewInvoicePage = () => {
  const t = useTranslations('invoices.newInvoicePage');
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">{t('error')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Link href="/">
              <Button variant="outline" className="w-full">{t('goToHomepage')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>{t('accessDenied')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{t('pleaseLoginToCreateInvoices')}</p>
            <Link href="/auth/login">
              <Button className="w-full">{t('login')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header Component */}
      <Header
        mode="minimal"
        user={user}
        showQuickActions={true}
        breadcrumbs={[
          { label: t('dashboard'), href: '/dashboard' },
          { label: t('newInvoice') }
        ]}
        customActions={
          <Link href="/customers">
            <Button variant="outline" size="sm">
              <Users className="h-4 w-4 mr-2" />
              {t('addCustomer')}
            </Button>
          </Link>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('backToDashboard')}
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
                <p className="text-gray-600">{t('fillDetails')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Form */}
        <NewInvoiceForm />
      </main>
    </div>
  );
};

export default NewInvoicePage;
