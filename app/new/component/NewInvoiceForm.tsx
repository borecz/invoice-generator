"use client";
import Image from "next/image";
import Image from "next/image";
import { UserInputForm } from "@/app/component/form/userInputForm";
import { FormSteps } from "@/app/component/form/step/fromSteps";
import { UserDataPreview } from "@/app/new/component/userDataPreview";
import { useForm, FormProvider } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { saveInvoice } from "@/app/invoices/actions";
import { useAuth } from '@/app/hooks/useAuth';
import { getCustomersForUser } from '@/app/customers/actions'; // Import customer action
// Assuming a Select component is available or will be added to UserInputForm
// For now, this component will prepare data assuming 'customerId' is a form field.

interface Customer {
  id: string;
  name: string;
}

export const NewInvoiceForm = () => {
  const methods = useForm();
  const { user, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customersError, setCustomersError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsClient(true);
      try {
        const step = localStorage.getItem("step");
        if (!(step && typeof +step === "number"))
          localStorage.setItem("step", "1");
      } catch (e) {
        localStorage.setItem("step", "1");
      }
    }
  }, []);

  useEffect(() => {
    const fetchUserCustomers = async () => {
      if (user) {
        setCustomersLoading(true);
        setCustomersError(null);
        const result = await getCustomersForUser();
        if (result.error) {
          setCustomersError(result.error.message);
          setCustomers([]);
        } else if (result.data) {
          setCustomers(result.data as Customer[]); // Cast if necessary
        }
        setCustomersLoading(false);
      } else {
        setCustomers([]);
        setCustomersLoading(false);
      }
    };

    if (!authLoading) { // Fetch customers once user auth state is resolved
        fetchUserCustomers();
    }
  }, [user, authLoading]);


  return (
    <>
      {isClient ? (
        <FormProvider {...methods}>
          <div className="max-w-lg min-h-screen w-full h-full p-4 md:p-12 border-r border-dashed flex flex-col justify-between">
            <div>
              <div className="flex gap-2 items-center">
                <Image
                  src="/android-chrome-512x512.png"
                  width={40}
                  height={40}
                  className="rounded-lg"
                  alt="logo"
                />
                <div>
                  <p className="font-semibold">Invoice Generator</p>
                  <p className="text-orange-500 text-sm">By Prolab</p>
                </div>
              </div>
              {/* Pass customers to UserInputForm or handle Select directly here if UserInputForm is too complex to modify now */}
              {/* For now, assuming UserInputForm will be updated to include a select dropdown for 'customerId' */}
              <UserInputForm customers={customers} customersLoading={customersLoading} customersError={customersError} />
            </div>
            <FormSteps />
            {user && !authLoading && (
              <div className="mt-4">
                <Button
                  onClick={async () => {
                    setSaveStatus(null);
                    const values = methods.getValues();
                    console.log("Form values for saving:", values);

                    // Updated validation to check for customerId
                    if (!values.invoiceNumber || !values.customerId || !values.item || values.item.length === 0) {
                        setSaveStatus({ message: "Missing required fields: Invoice #, Customer, or Items.", type: 'error' });
                        alert("Missing required fields: Invoice #, Customer, or Items.");
                        return;
                    }
                    
                    const invoiceData = {
                      invoice_number: values.invoiceNumber,
                      customer_id: values.customerId, // Use customerId
                      invoice_date: values.invoiceDate, 
                      due_date: values.dueDate,
                      items: values.item?.map((i: any) => ({
                        itemName: i.itemName,
                        itemQty: Number(i.itemQty) || 0,
                        itemPrice: Number(i.itemPrice) || 0,
                        itemTotal: (Number(i.itemQty) || 0) * (Number(i.itemPrice) || 0),
                      })) || [],
                      total_amount: Number(values.totalAmount) || 0,
                    };

                    console.log("Prepared data for saveInvoice:", invoiceData);

                    try {
                      const result = await saveInvoice(invoiceData);
                      if (result.error) {
                        setSaveStatus({ message: `Error: ${result.error.message}`, type: 'error' });
                        alert(`Error saving invoice: ${result.error.message}`);
                      } else {
                        setSaveStatus({ message: "Invoice saved successfully!", type: 'success' });
                        alert("Invoice saved successfully! ID: " + result.data?.[0]?.id);
                      }
                    } catch (e: any) {
                       setSaveStatus({ message: `Client error: ${e.message}`, type: 'error' });
                       alert(`An unexpected error occurred: ${e.message}`);
                    }
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Save Invoice
                </Button>
                {saveStatus && (
                  <p className={`mt-2 text-sm ${saveStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {saveStatus.message}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="relative min-h-screen h-full w-full flex justify-center items-center p-4 md:p-0">
            <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
            {/* Pass form data to UserDataPreview, it might need customer name from selected customer */}
            <UserDataPreview customers={customers} /> 
          </div>
        </FormProvider>
      ) : (
        <div />
      )}
    </>
  );
};
