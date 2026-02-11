import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Loan Calculator - Monthly Payment & Interest",
  description: "Calculate loan payments, total interest, and amortization schedule. Free loan calculator for mortgages, car loans, personal loans. No signup required.",
  keywords: [
    "loan calculator",
    "mortgage calculator",
    "car loan calculator",
    "personal loan calculator",
    "monthly payment calculator",
    "loan interest calculator",
    "EMI calculator",
    "free loan calculator",
  ],
  openGraph: {
    title: "Free Loan Calculator - Monthly Payment & Interest | CalcnConvert",
    description: "Calculate loan payments, total interest, and amortization schedule. Free loan calculator for all loan types.",
    url: "https://calcnconvert.net/dashboard/calculators/loan",
  },
  twitter: {
    title: "Free Loan Calculator - Monthly Payment & Interest",
    description: "Calculate loan payments, total interest, and amortization schedule. Free loan calculator.",
  },
  alternates: {
    canonical: "/dashboard/calculators/loan",
  },
};

export default function LoanCalculatorLayout({ children }: { children: ReactNode }) {
  return children;
}
