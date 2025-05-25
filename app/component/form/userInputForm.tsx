"use client";

import { DownloadInvoiceButton } from "@/app/component/form/downloadInvoice/downloadInvoiceButton";
import { InvoiceDetailsForm } from "@/app/component/form/invoiceDetails/invoiceDetailsForm";
import { InvoiceTermsForm } from "@/app/component/form/invoiceTerms/invoiceTermsForm";
import { PaymentDetailsForm } from "@/app/component/form/paymentDetails/paymentDetailsForm";
import { CompanyDetailsForm } from "@/app/component/form/companyDetails/companyDetailsForm";
import { YourDetailsForm } from "@/app/component/form/yourDetails/yourDetailsForm";
import { useGetValue } from "@/app/hooks/useGetValue";
import { getInitialValue } from "@/lib/getInitialValue";

interface Customer {
  id: string;
  name: string;
}

interface UserInputFormProps {
  customers: Customer[];
  customersLoading: boolean;
  customersError: string | null;
}

export const UserInputForm: React.FC<UserInputFormProps> = ({
  customers,
  customersLoading,
  customersError,
}) => {
  const step = useGetValue("step", getInitialValue("step", "1"));

  return (
    <div>
      <div className={step === "1" ? "block" : "hidden"}>
        <YourDetailsForm />
      </div>
      <div className={step === "2" ? "block" : "hidden"}>
        <CompanyDetailsForm 
          customers={customers} 
          customersLoading={customersLoading} 
          customersError={customersError} 
        />
      </div>
      <div className={step === "3" ? "block" : "hidden"}>
        <InvoiceDetailsForm />
      </div>
      <div className={step === "4" ? "block" : "hidden"}>
        <PaymentDetailsForm />
      </div>
      <div className={step === "5" ? "block" : "hidden"}>
        <InvoiceTermsForm />
      </div>
      {step === "6" && <DownloadInvoiceButton />}
    </div>
  );
};
