"use client";

import { Button } from "@/components/ui/button";
import { Document, Font, Page } from "@react-pdf/renderer";
import { CheckCircle2, Download, LoaderIcon } from "lucide-react";
import { PdfDetails } from "../pdfDetails";
import { useData } from "@/app/hooks/useData";
import { pdfContainers } from "@/lib/pdfStyles";
import { saveAs } from "file-saver";
import { pdf } from "@react-pdf/renderer";
import { svgToDataUri } from "@/lib/svgToDataUri";
import { useEffect, useState } from "react";
import { currencyList } from "@/lib/currency";

export const DownloadInvoiceButton = () => {
  const [status, setStatus] = useState<
    "downloaded" | "downloading" | "not-downloaded" | "error"
  >("not-downloaded");
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const {
    companyDetails,
    invoiceDetails,
    invoiceTerms,
    paymentDetails,
    yourDetails,
  } = useData();

  useEffect(() => {
    if (status === "downloaded" || status === "error") {
      const timer = setTimeout(() => {
        setStatus("not-downloaded");
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleDownload = async () => {
    try {
      setStatus("downloading");
      setErrorMessage("");

      const currencyDetails = currencyList.find(
        (currencyDetail) =>
          currencyDetail.value.toLowerCase() === invoiceDetails.currency.toLowerCase()
      )?.details;

      const defaultCurrency = currencyList.find(
        (currencyDetail) =>
          currencyDetail.value.toLowerCase() === "INR".toLowerCase()
      )?.details;

      const flagResponse = await fetch(
        `/flag/1x1/${currencyDetails?.iconName || defaultCurrency?.iconName}.svg`
      );
      
      if (!flagResponse.ok) {
        throw new Error("Failed to fetch flag SVG");
      }

      const svgFlag = await flagResponse.text();
      const countryImageUrl = await svgToDataUri(svgFlag);

      if (!countryImageUrl) {
        throw new Error("Failed to convert SVG to data URI");
      }

      const pdfDoc = (
        <Document>
          <Page size="A4" style={pdfContainers.page}>
            <PdfDetails
              companyDetails={companyDetails}
              invoiceDetails={invoiceDetails}
              invoiceTerms={invoiceTerms}
              paymentDetails={paymentDetails}
              yourDetails={yourDetails}
              countryImageUrl={countryImageUrl}
            />
          </Page>
        </Document>
      );

      const pdfPromise = pdf(pdfDoc).toBlob();
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("PDF generation timed out")), 10000);
      });

      const blob = await Promise.race([pdfPromise, timeoutPromise]);
      await saveAs(blob, "invoice.pdf");
      setStatus("downloaded");
    } catch (error) {
      console.error("Download error:", error);
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to generate PDF");
    }
  };

  return (
    <div className="flex h-[calc(100vh-208px)] justify-center items-center">
      <div>
        <h1 className="text-5xl font-semibold pb-6">Your invoice is ready</h1>
        <p className="text-neutral-500 text-xl pb-7">
          Please review the details carefully before downloading your invoice.
        </p>
        {errorMessage && (
          <p className="text-red-500 mb-4">{errorMessage}</p>
        )}
        <Button
          disabled={status === "downloading"}
          onClick={handleDownload}
          type="button"
          className="w-full h-12 rounded-lg text-lg"
        >
          {status === "not-downloaded" && (
            <>
              <Download className="mr-2 h-6 w-6" /> Download Invoice
            </>
          )}
          {status === "downloading" && (
            <>
              <LoaderIcon className="mr-2 h-6 w-6 animate-spin" /> Downloading...
            </>
          )}
          {status === "downloaded" && (
            <>
              <CheckCircle2 className="mr-2 h-6 w-6" /> Downloaded
            </>
          )}
          {status === "error" && (
            <>
              <Download className="mr-2 h-6 w-6" /> Try Again
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

Font.register({
  family: "Geist",
  fonts: [
    {
      src: "/font/Geist-Thin.ttf",
      fontWeight: "thin",
    },
    {
      src: "/font/Geist-Ultralight.ttf",
      fontWeight: "ultralight",
    },
    {
      src: "/font/Geist-Light.ttf",
      fontWeight: "light",
    },
    {
      src: "/font/Geist-Regular.ttf",
      fontWeight: "normal",
    },
    {
      src: "/font/Geist-Medium.ttf",
      fontWeight: "medium",
    },
    {
      src: "/font/Geist-SemiBold.ttf",
      fontWeight: "semibold",
    },
    {
      src: "/font/Geist-Bold.ttf",
      fontWeight: "bold",
    },
    {
      src: "/font/Geist-UltraBlack.ttf",
      fontWeight: "ultrabold",
    },
  ],
});