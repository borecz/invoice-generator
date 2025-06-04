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

  const fetchWithTimeout = async (url: string, timeout = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Flag fetch request timed out');
        }
        // Handle the terminated error specifically
        if (error instanceof TypeError && error.message.includes('terminated')) {
          throw new Error('Network request was terminated');
        }
        // For any other error, throw with the original message
        throw new Error(error.message || 'An error occurred while fetching the flag');
      }
      
      // For unknown error types, throw a generic error
      throw new Error('An unexpected error occurred');
    }
  };

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

      let countryImageUrl;
      try {
        const flagResponse = await fetchWithTimeout(
          `/flag/1x1/${currencyDetails?.iconName || defaultCurrency?.iconName}.svg`
        );
        
        const svgText = await flagResponse.text().catch(error => {
          console.error("Error reading flag response:", error);
          throw new Error("Failed to read flag data");
        });
        
        countryImageUrl = await svgToDataUri(svgText).catch(error => {
          console.error("Error converting SVG to data URI:", error);
          throw new Error("Failed to process flag image");
        });

        if (!countryImageUrl) {
          throw new Error("Failed to convert SVG to data URI");
        }
      } catch (flagError) {
        console.error("Flag fetch error:", flagError);
        // Continue without the flag if there's an error
        countryImageUrl = null;
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

      const pdfPromise = pdf(pdfDoc)
        .toBlob()
        .catch(error => {
          console.error("PDF generation error:", error);
          throw new Error("Failed to generate PDF. Please try again.");
        });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("PDF generation timed out")), 10000);
      });

      const blob = await Promise.race([pdfPromise, timeoutPromise]);
      
      if (!blob) {
        throw new Error("PDF generation failed - no data received");
      }

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
          onClick={() => {
            handleDownload().catch(error => {
              console.error("Global error handler:", error);
              setStatus("error");
              setErrorMessage("An unexpected error occurred. Please try again.");
            });
          }}
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