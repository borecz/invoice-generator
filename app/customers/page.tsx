"use client";

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Using standard input for simplicity here
import { getCustomersForUser, addCustomer } from '@/app/customers/actions';
import Link from 'next/link';
import { useAuth } from '@/app/hooks/useAuth';

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  address?: string | null;
  created_at: string;
}

interface CustomerFormData {
  name: string;
  email?: string;
  address?: string;
}

const CustomersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const methods = useForm<CustomerFormData>();
  const { register, handleSubmit, reset, formState: { errors } } = methods;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getCustomersForUser();
      if (result.error) {
        setError(result.error.message);
        setCustomers([]);
      } else if (result.data) {
        setCustomers(result.data);
      }
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred while fetching customers.');
      setCustomers([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (user) { // Only fetch if user is authenticated
      fetchCustomers();
    } else if (!authLoading) { // If auth is done loading and no user
        setIsLoading(false);
        setError("Please log in to manage customers.");
    }
  }, [user, authLoading]);

  const onSubmit: SubmitHandler<CustomerFormData> = async (data) => {
    setFormError(null);
    setFormMessage(null);
    try {
      const result = await addCustomer(data);
      if (result.error) {
        setFormError(result.error.message);
      } else {
        setFormMessage('Customer added successfully!');
        reset(); // Reset form fields
        fetchCustomers(); // Refresh the customer list
      }
    } catch (e: any) {
      setFormError(e.message || 'An unexpected error occurred while adding the customer.');
    }
  };
  
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading user authentication...</p></div>;
  }

  if (!user) {
     return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-700 mb-6">You must be logged in to manage customers.</p>
          <Link href="/auth/login">
            <Button variant="default">Login</Button>
          </Link>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 pb-4 border-b">Manage Customers</h1>
          
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-8">
              <h2 className="text-xl font-semibold text-gray-700">Add New Customer</h2>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name <span className="text-red-500">*</span></label>
                <Input 
                  id="name"
                  {...register("name", { required: "Name is required" })}
                  className="mt-1 block w-full" 
                  placeholder="e.g. John Doe"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <Input 
                  id="email"
                  type="email"
                  {...register("email")}
                  className="mt-1 block w-full"
                  placeholder="e.g. john.doe@example.com"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <Input 
                  id="address"
                  {...register("address")}
                  className="mt-1 block w-full"
                  placeholder="e.g. 123 Main St, Anytown, USA"
                />
              </div>
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              {formMessage && <p className="text-green-600 text-sm">{formMessage}</p>}
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">Add Customer</Button>
            </form>
          </FormProvider>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">My Customers</h2>
          {isLoading && <p>Loading customers...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          {!isLoading && !error && customers.length === 0 && (
            <p>No customers found. Add your first customer using the form above!</p>
          )}
          {!isLoading && !error && customers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added On</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.address || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(customer.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
         <div className="mt-8 text-center">
            <Link href="/">
                <Button variant="outline">Back to Homepage</Button>
            </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
