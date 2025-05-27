import { lazy, Suspense } from 'react';

// Lazy load the heavy PreviewDetails component
const PreviewDetails = lazy(() =>
  import("@/app/component/form/previewDetails").then(module => ({
    default: module.PreviewDetails
  }))
);

const DemoPreview = () => (
  <div className="mx-auto w-full flex justify-center items-center">
    <Suspense fallback={
      <div className="w-[595px] h-[842px] bg-white rounded-2xl border border-dashed flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invoice preview...</p>
        </div>
      </div>
    }>
      <PreviewDetails
        companyDetails={defaultValue.companyDetails}
        invoiceDetails={defaultValue.invoiceDetails}
        invoiceTerms={defaultValue.invoiceTerms}
        paymentDetails={defaultValue.paymentDetails}
        yourDetails={defaultValue.yourDetails}
      />
    </Suspense>
  </div>
);

const defaultValue = {
  companyDetails: {
    companyName: "Prolab Inc",
    companyAddress: "1600 Amphitheatre Parkway",
    companyCity: "Mountain View",
    companyState: "CA",
    companyCountry: "USA",
    companyLogo: "/android-chrome-192x192.png",
    companyTaxId: "",
    companyZip: "94043",
    email: "support@prolab.sh",
  },
  yourDetails: {
    yourName: "Pranav Patel",
    yourAddress: "6th Main Rd, Eshwara Layout, Indiranagar,",
    yourCity: "Bengaluru",
    yourState: "Karnataka",
    yourCountry: "India",
    yourLogo: "/pranav.png",
    yourEmail: "hi@pranavp.xyz",
    yourTaxId: "",
    yourZip: "560038",
  },
  paymentDetails: {
    bankName: "Axis Bank",
    accountNumber: "1234567890",
    accountName: "PRANAV",
    routingCode: "123456",
    swiftCode: "AXISINBB1234",
    ifscCode: "UTIB0000000",
    currency: "INR",
  },
  invoiceTerms: {
    invoiceNumber: "Invoice #25",
    issueDate: "Fri Apr 19 2024 00:00:00 GMT+0530 (India Standard Time)",
    dueDate: "Mon Apr 22 2024 00:00:00 GMT+0530 (India Standard Time)",
  },
  invoiceDetails: {
    note: "Services Period  21/03/2024 to 20/04/2024",
    discount: "22000",
    taxRate: "18",
    items: [
      {
        itemDescription: "Software Development Services",
        amount: 225000,
        qty: 0,
      },
      {
        itemDescription: "Hosting Charge",
        amount: 22000,
        qty: 0,
      },
    ],
    currency: "INR",
  },
};
export default DemoPreview;
