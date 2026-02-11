import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Interest Calculator - Simple & Compound Interest",
  description: "Calculate simple and compound interest on savings and investments. Free interest calculator with detailed breakdown. No signup required.",
  keywords: [
    "interest calculator",
    "compound interest calculator",
    "simple interest calculator",
    "savings interest calculator",
    "investment calculator",
    "interest rate calculator",
    "free interest calculator",
  ],
  openGraph: {
    title: "Free Interest Calculator - Simple & Compound Interest | CalcnConvert",
    description: "Calculate simple and compound interest on savings and investments. Free interest calculator.",
    url: "https://calcnconvert.net/dashboard/calculators/interest",
  },
  alternates: {
    canonical: "/dashboard/calculators/interest",
  },
};

export default function InterestCalculatorLayout({ children }: { children: ReactNode }) {
  return children;
}
