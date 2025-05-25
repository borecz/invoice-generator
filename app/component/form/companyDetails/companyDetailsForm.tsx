import CustomTextInput from "@/app/component/ui/customTextInput";
import CustomNumberInput from "@/app/component/ui/customNumberInput";
import ImageInput from "@/app/component/ui/imageInput";
import { useFormContext } from 'react-hook-form'; // Import useFormContext

interface Customer {
  id: string;
  name: string;
}

interface CompanyDetailsFormProps {
  customers: Customer[];
  customersLoading: boolean;
  customersError: string | null;
}

export const CompanyDetailsForm: React.FC<CompanyDetailsFormProps> = ({
  customers,
  customersLoading,
  customersError,
}) => {
  const { register, formState: { errors } } = useFormContext(); // Get register from context

  return (
    <div className="pt-24">
      <p className="text-2xl font-semibold pb-3">Company Details (To)</p>
      
      {/* Customer Select Dropdown */}
      <div className="mb-4">
        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">
          Select Customer <span className="text-red-500">*</span>
        </label>
        {customersLoading && <p className="text-sm text-gray-500">Loading customers...</p>}
        {customersError && <p className="text-sm text-red-500">Error: {customersError}</p>}
        {!customersLoading && !customersError && (
          <>
            <select
              id="customerId"
              {...register("customerId", { required: "Customer selection is required." })}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              defaultValue=""
            >
              <option value="" disabled>-- Select a Customer --</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customerId && <p className="text-red-500 text-xs mt-1">{(errors.customerId as any).message}</p>}
            <p className="pt-2 text-xs font-medium text-neutral-500">
              Need to add a new customer? <a href="/customers" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Manage Customers</a>
            </p>
          </>
        )}
      </div>

      <CustomTextInput
        label="Client Email (Optional, if different from selected customer)"
        placeholder="e.g. client@example.com"
        variableName="email" // This 'email' is for the client/company contact, not auth user
      />
      <p className="pb-4 pt-1 text-xs font-medium text-neutral-500">
        We&apos;ll fill the billing details automatically if we find the company (based on email, if applicable).
      </p>
      
      <p className="pb-2 text-sm font-medium text-neutral-500">Additional Billing details (Optional)</p>
      <CustomTextInput
        label="Company name (Optional, if different from selected customer)"
      placeholder="Prolab Inc"
      variableName="companyName"
    />
    <ImageInput label="Company Logo (Optional)" variableName="companyLogo" />
    <CustomTextInput
      label="Company Address (Optional)"
      placeholder="Whitefield Circle,12"
      variableName="companyAddress"
    />
    <CustomTextInput
      label="Company City (Optional)"
      placeholder="Bangalore"
      variableName="companyCity"
    />
    <CustomTextInput
      label="Company State (Optional)"
      placeholder="Karnataka"
      variableName="companyState"
    />
    <CustomNumberInput
      label="Company Zip (Optional)"
      placeholder="560066"
      variableName="companyZip"
    />
    <CustomTextInput
      label="Company Country (Optional)"
      placeholder="India"
      variableName="companyCountry"
    />
    <CustomTextInput
      label="Company Tax ID (Optional)"
      placeholder="GSTIN 1234"
      variableName="companyTaxId"
    />
  </div>
  );
}
