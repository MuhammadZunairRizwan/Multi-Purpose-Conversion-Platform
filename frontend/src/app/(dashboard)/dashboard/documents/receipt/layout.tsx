import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Receipt Generator - Create Payment Receipts",
  description: "Create professional payment receipts instantly. Free receipt generator for businesses and freelancers. Download as PDF. No signup required.",
  keywords: [
    "receipt generator",
    "free receipt maker",
    "payment receipt",
    "receipt template",
    "create receipt online",
    "receipt PDF",
    "business receipt",
    "sales receipt",
  ],
  openGraph: {
    title: "Free Receipt Generator - Create Payment Receipts | CalcnConvert",
    description: "Create professional payment receipts instantly. Free receipt generator. Download as PDF.",
    url: "https://calcnconvert.net/dashboard/documents/receipt",
  },
  alternates: {
    canonical: "/dashboard/documents/receipt",
  },
};

export default function ReceiptGeneratorLayout({ children }: { children: ReactNode }) {
  return children;
}
