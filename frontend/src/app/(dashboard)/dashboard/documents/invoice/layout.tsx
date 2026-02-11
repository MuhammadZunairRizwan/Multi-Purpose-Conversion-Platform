import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Invoice Generator - Create Professional Invoices",
  description: "Create professional invoices instantly. Free invoice generator with customizable templates. Download as PDF. No signup required for basic use.",
  keywords: [
    "invoice generator",
    "free invoice maker",
    "invoice template",
    "create invoice online",
    "invoice PDF",
    "business invoice",
    "freelance invoice",
    "invoice creator",
  ],
  openGraph: {
    title: "Free Invoice Generator - Create Professional Invoices | CalcnConvert",
    description: "Create professional invoices instantly. Free invoice generator with customizable templates. Download as PDF.",
    url: "https://calcnconvert.net/dashboard/documents/invoice",
  },
  alternates: {
    canonical: "/dashboard/documents/invoice",
  },
};

export default function InvoiceGeneratorLayout({ children }: { children: ReactNode }) {
  return children;
}
