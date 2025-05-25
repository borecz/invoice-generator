"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertCircle,
  ArrowLeft,
  Bell,
  ChevronDown,
  Edit,
  FileText,
  Loader2,
  MoreVertical,
  Plus,
  Save,
  Search,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { getCustomersForUser, addCustomer } from '@/app/customers/actions';
import { useAuth } from '@/app/hooks/useAuth';

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  company?: string | null;
  notes?: string | null;
  created_at: string;
}

interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  company?: string;
  notes?: string;
}

const CustomersPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const methods = useForm<CustomerFormData>();
  const { register, handleSubmit, reset, formState: { errors } } = methods;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'company'>('name');

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCustomersForUser();
      if (result.error) {
        setError(result.error.message);
        setCustomers([]);
        setFilteredCustomers([]);
      } else if (result.data) {
        setCustomers(result.data);
        setFilteredCustomers(result.data);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred while fetching customers.');
      setCustomers([]);
      setFilteredCustomers([]);
    }
    setIsLoading(false);
  };

  // Filter and sort customers
  useEffect(() => {
    let filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort customers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'company':
          return (a.company || '').localeCompare(b.company || '');
        case 'created_at':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, sortBy]);

  useEffect(() => {
    if (user) {
      fetchCustomers();
    } else if (!authLoading) {
      setIsLoading(false);
      setError("Please log in to manage customers.");
    }
  }, [user, authLoading]);

  const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
    setFormError(null);
    setFormMessage(null);
    setIsSubmitting(true);

    try {
      const result = await addCustomer(data);
      if (result.error) {
        setFormError(result.error.message);
      } else {
        setFormMessage('Customer added successfully!');
        reset();
        setShowForm(false);
        fetchCustomers();
        // Clear success message after 3 seconds
        setTimeout(() => setFormMessage(null), 3000);
      }
    } catch (e: any) {
      setFormError(e.message || 'An unexpected error occurred while adding the customer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCustomerInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCreateInvoice = (customerId: string) => {
    router.push(`/new?customerId=${customerId}`);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Please log in to manage customers.</p>
            <Link href="/auth/login">
              <Button className="w-full">Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Breadcrumb */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <Image
                  src="/android-chrome-512x512.png"
                  width={32}
                  height={32}
                  className="rounded-lg"
                  alt="InvoicePro Logo"
                />
                <span className="text-xl font-bold text-gray-900">InvoicePro</span>
              </Link>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
                <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
                <span>/</span>
                <span>Customers</span>
              </div>
            </div>

            {/* Actions and User Menu */}
            <div className="flex items-center space-x-4">
              {/* Quick Actions */}
              <div className="hidden sm:flex items-center space-x-2">
                <Link href="/new">
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    New Invoice
                  </Button>
                </Link>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user.email || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href="/dashboard" className="w-full">
                      Back to Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
                <p className="text-gray-600">Manage your customer database and relationships</p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {formMessage && (
          <div className="mb-6">
            <div className="p-3 rounded-md border border-green-200 bg-green-50">
              <p className="text-sm text-green-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {formMessage}
              </p>
            </div>
          </div>
        )}

        {/* Customer Creation Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-orange-500" />
                  Add New Customer
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setFormError(null);
                    reset();
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Add a new customer to your database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Customer Name *</Label>
                      <Input
                        id="name"
                        {...register("name", { required: "Customer name is required" })}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        {...register("company")}
                        placeholder="Acme Corporation"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="john.doe@example.com"
                      />
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        {...register("phone")}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        {...register("address")}
                        placeholder="123 Main St, Anytown, USA"
                      />
                    </div>

                    {/* Notes */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        {...register("notes")}
                        placeholder="Additional notes about this customer"
                      />
                    </div>
                  </div>

                  {formError && (
                    <div className="p-3 rounded-md border border-red-200 bg-red-50">
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {formError}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setFormError(null);
                        reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Add Customer
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </CardContent>
          </Card>
        )}

        {/* Customer List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  Customer Database
                </CardTitle>
                <CardDescription>
                  {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
                </CardDescription>
              </div>

              {/* Search and Filter Controls */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search customers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'created_at' | 'company')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="name">Sort by Name</option>
                  <option value="company">Sort by Company</option>
                  <option value="created_at">Sort by Date Added</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
                  <p className="text-gray-600">Loading customers...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <div className="p-3 rounded-md border border-red-200 bg-red-50">
                  <p className="text-sm text-red-600 flex items-center justify-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Error: {error}
                  </p>
                </div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {customers.length === 0 ? 'No customers yet' : 'No customers found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {customers.length === 0
                    ? 'Add your first customer to get started with invoicing.'
                    : 'Try adjusting your search terms or filters.'
                  }
                </p>
                {customers.length === 0 && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Customer
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Contact
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Company
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Added
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCustomers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Avatar className="h-10 w-10 mr-3">
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                    {getCustomerInitials(customer.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {customer.name}
                                  </div>
                                  {customer.notes && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                      {customer.notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {customer.email || 'No email'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {customer.phone || 'No phone'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {customer.company || 'No company'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {customer.address || 'No address'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(customer.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleCreateInvoice(customer.id)}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Create Invoice
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Customer
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Customer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                  {filteredCustomers.map((customer) => (
                    <Card key={customer.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {getCustomerInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{customer.name}</h3>
                            {customer.company && (
                              <p className="text-sm text-gray-600">{customer.company}</p>
                            )}
                            <div className="mt-1 space-y-1">
                              {customer.email && (
                                <p className="text-sm text-gray-500">{customer.email}</p>
                              )}
                              {customer.phone && (
                                <p className="text-sm text-gray-500">{customer.phone}</p>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              Added {new Date(customer.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCreateInvoice(customer.id)}>
                              <FileText className="h-4 w-4 mr-2" />
                              Create Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Customer
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Customer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CustomersPage;
