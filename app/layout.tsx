import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import Script from "next/script";
import { ThemeProvider } from "./contexts/ThemeContext";

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL!),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-US",
    },
  },
  title:
    "InvoicePro - Professional Invoicing Software for Modern Businesses",
  description:
    "Streamline your billing with InvoicePro. Create professional invoices, track payments, manage customers, and get paid faster. Free trial available.",
  keywords: [
    "invoice software",
    "invoicing platform",
    "billing software",
    "invoice management",
    "professional invoices",
    "payment tracking",
    "customer management",
    "business invoicing",
    "SaaS invoicing",
    "invoice automation",
  ],
  robots: "index, follow",
  openGraph: {
    title:
      "InvoicePro - Professional Invoicing Software for Modern Businesses",
    description:
      "Streamline your billing with InvoicePro. Create professional invoices, track payments, manage customers, and get paid faster. Free trial available.",
    url: process.env.NEXT_PUBLIC_URL,
    type: "website",
    images: "/og-image.jpeg",
    siteName: "InvoicePro",
  },
  twitter: {
    card: "summary_large_image",
    site: "@ThatsPranav",
    creator: "@ThatsPranav",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#f97316" />
        <meta name="msapplication-TileColor" content="#f97316" />
        <meta name="theme-color" content="#f97316" />
      </head>
      <body className={`${GeistSans.className} theme-transition`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
