"use client";

import React, { useEffect, useState } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { saveInvoice } from "@/app/invoices/actions";
import { useAuth } from '@/app/hooks/useAuth';
import { getCustomersForUser, addCustomer } from '@/app/customers/actions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Loader2,
  Plus,
  Save,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email?: string;
  address?: string;
}

interface InvoiceItem {
  itemName: string;
  itemQty: number;
  itemPrice: number;
  itemTotal: number;
}

interface InlineCustomerData {
  name: string;
  email?: string;
  address?: string;
}

interface InvoiceFormData {
  invoiceNumber: string;
  customerType: 'existing' | 'new';
  customerId?: string;
  inlineCustomer?: InlineCustomerData;
  saveCustomer?: boolean;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: number;
}

export const NewInvoiceForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const methods = useForm<InvoiceFormData>({
    defaultValues: {
      invoiceNumber: `INV-${Date.now()}`,
      customerType: 'existing',
      saveCustomer: false,
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ itemName: '', itemQty: 1, itemPrice: 0, itemTotal: 0 }],
      totalAmount: 0,
      inlineCustomer: {
        name: '',
        email: '',
        address: ''
      }
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "items"
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!user) return;

      setCustomersLoading(true);
      setCustomersError(null);

      try {
        const result = await getCustomersForUser();
        if (result.error) {
          setCustomersError(result.error.message);
          setCustomers([]);
        } else if (result.data) {
          setCustomers(result.data as Customer[]);
        }
      } catch (error) {
        setCustomersError('Failed to fetch customers');
        setCustomers([]);
      } finally {
        setCustomersLoading(false);
      }
    };

    if (!authLoading) {
      fetchCustomers();
    }
  }, [user, authLoading]);

  // Handle pre-selected customer from URL parameter
  useEffect(() => {
    const customerId = searchParams.get('customerId');
    if (customerId && customers.length > 0) {
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        methods.setValue('customerType', 'existing');
        methods.setValue('customerId', customerId);
      }
    }
  }, [customers, searchParams, methods]);

  // Watch for form changes
  const watchedItems = methods.watch("items");
  const customerType = methods.watch("customerType");

  // Calculate total amount when items change
  useEffect(() => {
    const total = watchedItems?.reduce((sum, item) => {
      const itemTotal = (item.itemQty || 0) * (item.itemPrice || 0);
      return sum + itemTotal;
    }, 0) || 0;
    methods.setValue("totalAmount", total);
  }, [watchedItems, methods]);


  // Handle form submission
  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      let customerData;
      let savedCustomerId: string | null = null;
      let customerSaveMessage = '';

      if (data.customerType === 'existing') {
        if (!data.customerId) {
          setSubmitStatus({ message: "Please select a customer", type: 'error' });
          setIsSubmitting(false);
          return;
        }
        customerData = { customer_id: data.customerId };
      } else {
        if (!data.inlineCustomer?.name) {
          setSubmitStatus({ message: "Customer name is required", type: 'error' });
          setIsSubmitting(false);
          return;
        }

        // If user wants to save the customer, create it first
        if (data.saveCustomer) {
          const customerResult = await addCustomer({
            name: data.inlineCustomer.name,
            email: data.inlineCustomer.email || '',
            address: data.inlineCustomer.address || '',
          });

          if (customerResult.error) {
            setSubmitStatus({
              message: `Failed to save customer: ${customerResult.error.message}`,
              type: 'error'
            });
            setIsSubmitting(false);
            return;
          } else if (customerResult.data && customerResult.data.length > 0) {
            savedCustomerId = customerResult.data[0].id;
            customerData = { customer_id: savedCustomerId };
            customerSaveMessage = ' Customer has been added to your database.';
          }
        } else {
          // Use inline customer data without saving
          customerData = {
            inline_customer: {
              name: data.inlineCustomer.name,
              email: data.inlineCustomer.email || null,
              address: data.inlineCustomer.address || null,
            }
          };
        }
      }

      const invoiceData = {
        invoice_number: data.invoiceNumber,
        ...customerData,
        invoice_date: data.invoiceDate,
        due_date: data.dueDate,
        items: data.items.map(item => ({
          itemName: item.itemName,
          itemQty: Number(item.itemQty) || 0,
          itemPrice: Number(item.itemPrice) || 0,
          itemTotal: (Number(item.itemQty) || 0) * (Number(item.itemPrice) || 0),
        })),
        total_amount: Number(data.totalAmount) || 0,
      };

      const result = await saveInvoice(invoiceData);

      if (result.error) {
        setSubmitStatus({ message: result.error.message, type: 'error' });
      } else {
        const successMessage = `Invoice created successfully!${customerSaveMessage}`;
        setSubmitStatus({ message: successMessage, type: 'success' });
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      }
    } catch (error: any) {
      setSubmitStatus({ message: error.message || 'An unexpected error occurred', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    append({ itemName: '', itemQty: 1, itemPrice: 0, itemTotal: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Invoice Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-orange-500" />
                Invoice Details
              </CardTitle>
              <CardDescription>
                Basic information about your invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Invoice Number */}
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  {...methods.register("invoiceNumber", { required: "Invoice number is required" })}
                  placeholder="INV-001"
                />
                {methods.formState.errors.invoiceNumber && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {methods.formState.errors.invoiceNumber.message}
                  </p>
                )}
              </div>

              {/* Customer Type Selection */}
              <div className="space-y-4">
                <Label>Customer Information *</Label>
                <RadioGroup
                  value={customerType}
                  onValueChange={(value: 'existing' | 'new') => {
                    methods.setValue("customerType", value);
                    // Clear the other customer field when switching
                    if (value === 'existing') {
                      methods.setValue("inlineCustomer", { name: '', email: '', address: '' });
                    } else {
                      methods.setValue("customerId", '');
                    }
                  }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing" className="cursor-pointer flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-500" />
                      Select Existing Customer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="cursor-pointer flex items-center gap-2">
                      <UserPlus className="h-4 w-4 text-green-500" />
                      Enter New Customer Details
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Existing Customer Selection */}
              {customerType === 'existing' && (
                <div className="space-y-2">
                  <Label htmlFor="customerId">Select Customer *</Label>
                  {customersLoading ? (
                    <div className="flex items-center gap-2 p-3 border rounded-md">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-500">Loading customers...</span>
                    </div>
                  ) : customersError ? (
                    <div className="p-3 border border-red-200 rounded-md bg-red-50">
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {customersError}
                      </p>
                    </div>
                  ) : (
                    <Select
                      value={methods.watch("customerId") || ""}
                      onValueChange={(value) => methods.setValue("customerId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{customer.name}</span>
                              {customer.email && (
                                <span className="text-xs text-gray-500">{customer.email}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {customers.length === 0 && !customersLoading && !customersError && (
                    <div className="p-3 border border-orange-200 rounded-md bg-orange-50">
                      <p className="text-sm text-orange-600 mb-2">No customers found.</p>
                      <Link href="/customers">
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Customer
                        </Button>
                      </Link>
                    </div>
                  )}
                  {methods.formState.errors.customerId && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {methods.formState.errors.customerId.message}
                    </p>
                  )}
                </div>
              )}

              {/* Inline Customer Details */}
              {customerType === 'new' && (
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <UserPlus className="h-4 w-4 text-green-500" />
                    <Label className="text-sm font-medium text-gray-700">Customer Details</Label>
                  </div>

                  <div className="space-y-4">
                    {/* Customer Name */}
                    <div className="space-y-2">
                      <Label htmlFor="inlineCustomer.name">Customer Name *</Label>
                      <Input
                        id="inlineCustomer.name"
                        {...methods.register("inlineCustomer.name", {
                          required: customerType === 'new' ? "Customer name is required" : false
                        })}
                        placeholder="Enter customer name"
                      />
                      {methods.formState.errors.inlineCustomer?.name && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {methods.formState.errors.inlineCustomer.name.message}
                        </p>
                      )}
                    </div>

                    {/* Customer Email */}
                    <div className="space-y-2">
                      <Label htmlFor="inlineCustomer.email">Customer Email</Label>
                      <Input
                        id="inlineCustomer.email"
                        type="email"
                        {...methods.register("inlineCustomer.email")}
                        placeholder="customer@example.com (optional)"
                      />
                      {methods.formState.errors.inlineCustomer?.email && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {methods.formState.errors.inlineCustomer.email.message}
                        </p>
                      )}
                    </div>

                    {/* Customer Address */}
                    <div className="space-y-2">
                      <Label htmlFor="inlineCustomer.address">Customer Address</Label>
                      <Input
                        id="inlineCustomer.address"
                        {...methods.register("inlineCustomer.address")}
                        placeholder="Customer address (optional)"
                      />
                      {methods.formState.errors.inlineCustomer?.address && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {methods.formState.errors.inlineCustomer.address.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Save Customer Option */}
                  <div className="flex items-center space-x-2 p-3 border border-orange-200 rounded-lg bg-orange-50">
                    <Checkbox
                      id="saveCustomer"
                      checked={methods.watch("saveCustomer")}
                      onCheckedChange={(checked) => methods.setValue("saveCustomer", !!checked)}
                    />
                    <Label htmlFor="saveCustomer" className="text-sm font-medium text-gray-700 cursor-pointer">
                      Save this customer to my database for future use
                    </Label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {methods.watch("saveCustomer")
                      ? "✓ This customer will be saved to your database and can be selected for future invoices."
                      : "Customer information will only be used for this invoice and won't be saved permanently."
                    }
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date *</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    {...methods.register("invoiceDate", { required: "Invoice date is required" })}
                  />
                  {methods.formState.errors.invoiceDate && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {methods.formState.errors.invoiceDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...methods.register("dueDate")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-orange-500" />
                  Invoice Items
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </CardTitle>
              <CardDescription>
                Add products or services to your invoice
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Item #{index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor={`items.${index}.itemName`}>Item Name *</Label>
                      <Input
                        {...methods.register(`items.${index}.itemName`, {
                          required: "Item name is required"
                        })}
                        placeholder="Product or service name"
                      />
                      {methods.formState.errors.items?.[index]?.itemName && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {methods.formState.errors.items[index]?.itemName?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.itemQty`}>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        {...methods.register(`items.${index}.itemQty`, {
                          required: "Quantity is required",
                          min: { value: 1, message: "Quantity must be at least 1" }
                        })}
                        placeholder="1"
                      />
                      {methods.formState.errors.items?.[index]?.itemQty && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {methods.formState.errors.items[index]?.itemQty?.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.itemPrice`}>Price *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...methods.register(`items.${index}.itemPrice`, {
                          required: "Price is required",
                          min: { value: 0, message: "Price must be positive" }
                        })}
                        placeholder="0.00"
                      />
                      {methods.formState.errors.items?.[index]?.itemPrice && (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {methods.formState.errors.items[index]?.itemPrice?.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Item Total Display */}
                  <div className="flex justify-end">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Item Total</p>
                      <p className="text-lg font-semibold text-gray-900">
                        ${((watchedItems?.[index]?.itemQty || 0) * (watchedItems?.[index]?.itemPrice || 0)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Total and Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Total Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${methods.watch("totalAmount")?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-lg font-semibold">
                  <span>Total Amount</span>
                  <span className="text-orange-600">${methods.watch("totalAmount")?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Save your invoice or go back to dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {submitStatus && (
                <div className={`p-3 rounded-md border ${
                  submitStatus.type === 'success'
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}>
                  <p className={`text-sm flex items-center gap-1 ${
                    submitStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {submitStatus.type === 'success' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {submitStatus.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Invoice
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </FormProvider>
  );
};
