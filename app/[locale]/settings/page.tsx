"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Building2,
  CreditCard,
  FileText,
  Loader2,
  Save,
  Settings,
  Shield,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '@/app/hooks/useAuth';
import {
  getUserProfile,
  updateUserProfile,
  getBusinessSettings,
  updateBusinessSettings,
  getInvoicePreferences,
  updateInvoicePreferences,
  getNotificationSettings,
  updateNotificationSettings,
  type BusinessSettingsData,
  type InvoicePreferencesData,
  type NotificationSettingsData,
} from './actions';
import { currencyList } from '@/lib/currency';
import { Header } from "@/app/components/layout/Header";

interface UserProfileData {
  full_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  avatar_url?: string;
}

const SettingsPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Form instances for each tab
  const profileForm = useForm<UserProfileData>();
  const businessForm = useForm<BusinessSettingsData>();
  const invoiceForm = useForm<InvoicePreferencesData>();
  const notificationForm = useForm<NotificationSettingsData>();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Load settings data
  useEffect(() => {
    if (user) {
      loadAllSettings();
    }
  }, [user]);

  const loadAllSettings = async () => {
    setLoading(true);
    try {
      const [profileResult, businessResult, invoiceResult, notificationResult] = await Promise.all([
        getUserProfile(),
        getBusinessSettings(),
        getInvoicePreferences(),
        getNotificationSettings(),
      ]);

      if (profileResult.data) {
        profileForm.reset(profileResult.data);
      }
      if (businessResult.data) {
        businessForm.reset(businessResult.data as BusinessSettingsData);
      }
      if (invoiceResult.data) {
        invoiceForm.reset(invoiceResult.data as InvoicePreferencesData);
      }
      if (notificationResult.data) {
        notificationForm.reset(notificationResult.data as NotificationSettingsData);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const showSaveMessage = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleProfileSave = async (data: UserProfileData) => {
    setSaving(true);
    try {
      const result = await updateUserProfile(data);
      if (result.error) {
        showSaveMessage(`Error: ${(result.error as any)?.message || 'Unknown error'}`);
      } else {
        showSaveMessage('Profile updated successfully!');
      }
    } catch (error) {
      showSaveMessage('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleBusinessSave = async (data: BusinessSettingsData) => {
    setSaving(true);
    try {
      const result = await updateBusinessSettings(data);
      if (result.error) {
        showSaveMessage(`Error: ${(result.error as any)?.message || 'Unknown error'}`);
      } else {
        showSaveMessage('Business settings updated successfully!');
      }
    } catch (error) {
      showSaveMessage('Error updating business settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInvoiceSave = async (data: InvoicePreferencesData) => {
    setSaving(true);
    try {
      const result = await updateInvoicePreferences(data);
      if (result.error) {
        showSaveMessage(`Error: ${(result.error as any)?.message || 'Unknown error'}`);
      } else {
        showSaveMessage('Invoice preferences updated successfully!');
      }
    } catch (error) {
      showSaveMessage('Error updating invoice preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSave = async (data: NotificationSettingsData) => {
    setSaving(true);
    try {
      const result = await updateNotificationSettings(data);
      if (result.error) {
        showSaveMessage(`Error: ${(result.error as any)?.message || 'Unknown error'}`);
      } else {
        showSaveMessage('Notification settings updated successfully!');
      }
    } catch (error) {
      showSaveMessage('Error updating notification settings');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header Component */}
      <Header
        mode="minimal"
        user={user}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' }
        ]}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">
            Manage your account, business information, and preferences.
          </p>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="mb-6">
            <div className={`p-4 rounded-lg ${saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {saveMessage}
            </div>
          </div>
        )}

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="business" className="flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Business</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Invoices</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        {...profileForm.register('full_name')}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...profileForm.register('phone')}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        {...profileForm.register('address')}
                        placeholder="Enter your address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        {...profileForm.register('city')}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        {...profileForm.register('state')}
                        placeholder="Enter your state"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        {...profileForm.register('country')}
                        placeholder="Enter your country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip_code">ZIP/Postal Code</Label>
                      <Input
                        id="zip_code"
                        {...profileForm.register('zip_code')}
                        placeholder="Enter your ZIP code"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="bg-gradient-to-r from-orange-500 to-pink-500">
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Configure your business details that will appear on invoices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={businessForm.handleSubmit(handleBusinessSave)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input
                        id="business_name"
                        {...businessForm.register('business_name')}
                        placeholder="Enter your business name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_email">Business Email</Label>
                      <Input
                        id="business_email"
                        type="email"
                        {...businessForm.register('business_email')}
                        placeholder="Enter your business email"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_phone">Business Phone</Label>
                      <Input
                        id="business_phone"
                        {...businessForm.register('business_phone')}
                        placeholder="Enter your business phone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_id">Tax ID / Registration Number</Label>
                      <Input
                        id="tax_id"
                        {...businessForm.register('tax_id')}
                        placeholder="Enter your tax ID"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="business_address">Business Address</Label>
                      <Input
                        id="business_address"
                        {...businessForm.register('business_address')}
                        placeholder="Enter your business address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_city">City</Label>
                      <Input
                        id="business_city"
                        {...businessForm.register('business_city')}
                        placeholder="Enter your business city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_state">State/Province</Label>
                      <Input
                        id="business_state"
                        {...businessForm.register('business_state')}
                        placeholder="Enter your business state"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_country">Country</Label>
                      <Input
                        id="business_country"
                        {...businessForm.register('business_country')}
                        placeholder="Enter your business country"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="business_zip">ZIP/Postal Code</Label>
                      <Input
                        id="business_zip"
                        {...businessForm.register('business_zip')}
                        placeholder="Enter your business ZIP code"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="bg-gradient-to-r from-orange-500 to-pink-500">
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Business Info
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoice Preferences Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Preferences</CardTitle>
                <CardDescription>
                  Set default values and preferences for your invoices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={invoiceForm.handleSubmit(handleInvoiceSave)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="default_currency">Default Currency</Label>
                      <Select
                        value={invoiceForm.watch('default_currency') || 'USD'}
                        onValueChange={(value) => invoiceForm.setValue('default_currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencyList.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              <div className="flex items-center space-x-2">
                                <currency.details.icon className="h-4 w-4" />
                                <span>{currency.details.currencySymbol} {currency.value}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default_payment_terms">Default Payment Terms (Days)</Label>
                      <Input
                        id="default_payment_terms"
                        type="number"
                        {...invoiceForm.register('default_payment_terms', { valueAsNumber: true })}
                        placeholder="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default_tax_rate">Default Tax Rate (%)</Label>
                      <Input
                        id="default_tax_rate"
                        type="number"
                        step="0.01"
                        {...invoiceForm.register('default_tax_rate', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice_number_format">Invoice Number Format</Label>
                      <Input
                        id="invoice_number_format"
                        {...invoiceForm.register('invoice_number_format')}
                        placeholder="INV-{YYYY}-{MM}-{###}"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="default_notes">Default Invoice Notes</Label>
                      <Input
                        id="default_notes"
                        {...invoiceForm.register('default_notes')}
                        placeholder="Thank you for your business!"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-900">Reminder Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="auto_send_reminders"
                          checked={invoiceForm.watch('auto_send_reminders') || false}
                          onCheckedChange={(checked) => invoiceForm.setValue('auto_send_reminders', checked)}
                        />
                        <Label htmlFor="auto_send_reminders">Auto-send reminders</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reminder_days_before_due">Days before due date</Label>
                        <Input
                          id="reminder_days_before_due"
                          type="number"
                          {...invoiceForm.register('reminder_days_before_due', { valueAsNumber: true })}
                          placeholder="3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reminder_days_after_due">Days after due date</Label>
                        <Input
                          id="reminder_days_after_due"
                          type="number"
                          {...invoiceForm.register('reminder_days_after_due', { valueAsNumber: true })}
                          placeholder="7"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="bg-gradient-to-r from-orange-500 to-pink-500">
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Preferences
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Choose which email notifications you'd like to receive.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={notificationForm.handleSubmit(handleNotificationSave)} className="space-y-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Invoice Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email_invoice_created">Invoice Created</Label>
                            <p className="text-sm text-gray-500">Get notified when a new invoice is created</p>
                          </div>
                          <Switch
                            id="email_invoice_created"
                            checked={notificationForm.watch('email_invoice_created') || false}
                            onCheckedChange={(checked) => notificationForm.setValue('email_invoice_created', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email_invoice_paid">Invoice Paid</Label>
                            <p className="text-sm text-gray-500">Get notified when an invoice is marked as paid</p>
                          </div>
                          <Switch
                            id="email_invoice_paid"
                            checked={notificationForm.watch('email_invoice_paid') || false}
                            onCheckedChange={(checked) => notificationForm.setValue('email_invoice_paid', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email_invoice_overdue">Invoice Overdue</Label>
                            <p className="text-sm text-gray-500">Get notified when an invoice becomes overdue</p>
                          </div>
                          <Switch
                            id="email_invoice_overdue"
                            checked={notificationForm.watch('email_invoice_overdue') || false}
                            onCheckedChange={(checked) => notificationForm.setValue('email_invoice_overdue', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Customer Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email_new_customer">New Customer</Label>
                            <p className="text-sm text-gray-500">Get notified when a new customer is added</p>
                          </div>
                          <Switch
                            id="email_new_customer"
                            checked={notificationForm.watch('email_new_customer') || false}
                            onCheckedChange={(checked) => notificationForm.setValue('email_new_customer', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">General Notifications</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email_marketing">Marketing Communications</Label>
                            <p className="text-sm text-gray-500">Receive updates about new features and tips</p>
                          </div>
                          <Switch
                            id="email_marketing"
                            checked={notificationForm.watch('email_marketing') || false}
                            onCheckedChange={(checked) => notificationForm.setValue('email_marketing', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="email_product_updates">Product Updates</Label>
                            <p className="text-sm text-gray-500">Get notified about important product updates</p>
                          </div>
                          <Switch
                            id="email_product_updates"
                            checked={notificationForm.watch('email_product_updates') || false}
                            onCheckedChange={(checked) => notificationForm.setValue('email_product_updates', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving} className="bg-gradient-to-r from-orange-500 to-pink-500">
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Notifications
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription plan and billing information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Current Plan */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Current Plan</h4>
                    <div className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Free Plan</h3>
                          <p className="text-sm text-gray-500">Perfect for getting started</p>
                        </div>
                        <Badge variant="secondary">Active</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">5</p>
                          <p className="text-sm text-gray-500">Invoices per month</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">∞</p>
                          <p className="text-sm text-gray-500">Customers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">✓</p>
                          <p className="text-sm text-gray-500">PDF Export</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                          Upgrade to Pro
                        </Button>
                        <Button variant="outline">
                          View All Plans
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Usage This Month */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Usage This Month</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">Invoices Created</span>
                          <span className="text-sm text-gray-500">0 / 5</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-orange-500 to-pink-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-900">Customers Added</span>
                          <span className="text-sm text-gray-500">1</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Settings */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Account Security</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Password</Label>
                          <p className="text-sm text-gray-500">Last updated 30 days ago</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="space-y-0.5">
                          <Label>Two-Factor Authentication</Label>
                          <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
                      </div>
                      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                        <div className="space-y-0.5">
                          <Label className="text-red-700">Delete Account</Label>
                          <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="destructive" size="sm">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SettingsPage;