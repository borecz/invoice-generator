"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/hooks/useAuth';
import { useTranslations } from 'next-intl';
import { useLocaleContext } from '@/app/contexts/LocaleContext';
import { formatCurrency, formatDate } from '@/lib/business-logic';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ArrowUpRight,
  Bell,
  ChevronDown,
  CreditCard,
  DollarSign,
  FileText,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { getInvoicesForUser } from '@/app/invoices/actions';
import { getCustomersForUser } from '@/app/customers/actions';
import { ThemeToggle } from '@/app/components/ui/ThemeToggle';
import { Header } from '@/app/components/layout/Header';

interface Invoice {
  id: string;
  invoice_number: string;
  customers: { name: string } | null;
  invoice_date: string;
  total_amount: number;
  status: string;
}

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  address?: string | null;
  created_at: string;
}

const DashboardPage = () => {
  const { user, loading, error } = useAuth();
  const { country } = useLocaleContext();
  const t = useTranslations('dashboard');
  const tNav = useTranslations('navigation');
  const tCommon = useTranslations('common');
  const tInvoices = useTranslations('invoices');
  const tCustomers = useTranslations('customers');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      setLoadingData(true);
      try {
        const [invoicesResult, customersResult] = await Promise.all([
          getInvoicesForUser(),
          getCustomersForUser()
        ]);

        if (invoicesResult.data) {
          setInvoices(invoicesResult.data);
        }
        if (customersResult.data) {
          setCustomers(customersResult.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">{tCommon('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">{tCommon('error')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <Link href="/">
              <Button variant="outline" className="w-full">{tNav('backToHomepage')}</Button>
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
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
            <Link href="/auth/login">
              <Button className="w-full">{tNav('login')}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate dashboard metrics
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length;
  const totalRevenue = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total_amount, 0);
  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'sent')
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
      case 'sent':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
      case 'sent':
        return 'warning';
      case 'overdue':
        return 'destructive';
      case 'draft':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        showQuickActions={true}
        breadcrumbs={[{ label: tNav('dashboard'), href: '/dashboard' }]}
        pendingCount={pendingInvoices}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('welcome')}, {user.email?.split('@')[0]}!
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your invoices today.
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('metrics.totalRevenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue, country)}</div>
              <p className="text-xs text-muted-foreground">
                From {paidInvoices} {t('metrics.paidInvoices').toLowerCase()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('metrics.pendingInvoices')}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingAmount, country)}</div>
              <p className="text-xs text-muted-foreground">
                {pendingInvoices} pending invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{tInvoices('title')}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {overdueInvoices > 0 ? `${overdueInvoices} overdue` : 'All up to date'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('metrics.totalCustomers')}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">
                Active customers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
            <TabsTrigger value="invoices">{tInvoices('title')}</TabsTrigger>
            <TabsTrigger value="customers">{tCustomers('title')}</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('recentActivity')}</CardTitle>
                  <CardDescription>Your latest invoice activity</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingData ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : invoices.length === 0 ? (
                    <div className="text-center py-6">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No invoices yet</p>
                      <Link href="/new">
                        <Button size="sm">{tInvoices('create')}</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {invoices.slice(0, 5).map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(invoice.status)}
                            <div>
                              <p className="text-sm font-medium">
                                Invoice #{invoice.invoice_number}
                              </p>
                              <p className="text-xs text-gray-500">
                                {invoice.customers?.name || 'No customer'} • {formatDate(new Date(invoice.invoice_date), country)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(invoice.total_amount, country)}</p>
                            <Badge variant={getStatusBadgeVariant(invoice.status) as any} className="text-xs">
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                      {invoices.length > 5 && (
                        <div className="pt-4 border-t">
                          <Button variant="outline" size="sm" className="w-full" onClick={() => setActiveTab('invoices')}>
                            View All Invoices
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>{t('quickActions')}</CardTitle>
                  <CardDescription>Common tasks to get you started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/new" className="block">
                    <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center mr-4">
                        <Plus className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{tInvoices('create')}</p>
                        <p className="text-sm text-gray-500">Generate a professional invoice</p>
                      </div>
                    </div>
                  </Link>

                  <Link href="/customers" className="block">
                    <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{tCustomers('title')} Management</p>
                        <p className="text-sm text-gray-500">Add or edit customer information</p>
                      </div>
                    </div>
                  </Link>

                  <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors cursor-pointer">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center mr-4">
                      <Download className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">Export Data</p>
                      <p className="text-sm text-gray-500">Download your invoices as PDF or CSV</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <CardTitle>Invoice Management</CardTitle>
                    <CardDescription>View and manage all your invoices</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Link href="/new">
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500">
                        <Plus className="h-4 w-4 mr-2" />
                        New Invoice
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                    <p className="text-gray-500 mb-6">Get started by creating your first invoice</p>
                    <Link href="/new">
                      <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Invoice
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Invoice Table Header */}
                    <div className="hidden md:grid md:grid-cols-6 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-500">
                      <div>Invoice #</div>
                      <div>Customer</div>
                      <div>Date</div>
                      <div>Amount</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </div>

                    {/* Invoice Rows */}
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                          <div className="md:col-span-1">
                            <p className="font-medium text-gray-900">#{invoice.invoice_number}</p>
                            <p className="text-sm text-gray-500 md:hidden">
                              {invoice.customers?.name || 'No customer'}
                            </p>
                          </div>
                          <div className="hidden md:block">
                            <p className="text-gray-900">{invoice.customers?.name || 'No customer'}</p>
                          </div>
                          <div className="hidden md:block">
                            <p className="text-gray-900">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                          </div>
                          <div className="hidden md:block">
                            <p className="font-medium text-gray-900">${invoice.total_amount.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(invoice.status)}
                            <Badge variant={getStatusBadgeVariant(invoice.status) as any}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Mobile-only additional info */}
                        <div className="md:hidden mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                          <span className="text-gray-500">
                            {new Date(invoice.invoice_date).toLocaleDateString()}
                          </span>
                          <span className="font-medium">${invoice.total_amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <CardTitle>Customer Management</CardTitle>
                    <CardDescription>View and manage your customer database</CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Link href="/customers">
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Customer
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : customers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
                    <p className="text-gray-500 mb-6">Add your first customer to get started</p>
                    <Link href="/customers">
                      <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Customer
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Customer Table Header */}
                    <div className="hidden md:grid md:grid-cols-5 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-500">
                      <div>Name</div>
                      <div>Email</div>
                      <div>Address</div>
                      <div>Added</div>
                      <div>Actions</div>
                    </div>

                    {/* Customer Rows */}
                    {customers.map((customer) => (
                      <div key={customer.id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div className="md:col-span-1">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm">
                                  {customer.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{customer.name}</p>
                                <p className="text-sm text-gray-500 md:hidden">
                                  {customer.email || 'No email'}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="hidden md:block">
                            <p className="text-gray-900">{customer.email || 'No email'}</p>
                          </div>
                          <div className="hidden md:block">
                            <p className="text-gray-900">{customer.address || 'No address'}</p>
                          </div>
                          <div className="hidden md:block">
                            <p className="text-gray-900">{new Date(customer.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  Create Invoice
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Mobile-only additional info */}
                        <div className="md:hidden mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                          <p>{customer.address || 'No address'}</p>
                          <p>Added {new Date(customer.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardPage;