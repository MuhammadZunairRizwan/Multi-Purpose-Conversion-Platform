import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Savings Calculator - Future Value & Growth",
  description: "Calculate savings growth with compound interest. Plan retirement, emergency fund, or any savings goal. Free savings calculator with monthly contributions.",
  keywords: [
    "savings calculator",
    "future value calculator",
    "retirement calculator",
    "compound interest savings",
    "savings growth calculator",
    "investment growth calculator",
    "free savings calculator",
  ],
  openGraph: {
    title: "Free Savings Calculator - Future Value & Growth | CalcnConvert",
    description: "Calculate savings growth with compound interest. Plan retirement or any savings goal. Free savings calculator.",
    url: "https://calcnconvert.net/dashboard/calculators/savings",
  },
  alternates: {
    canonical: "/dashboard/calculators/savings",
  },
};

export default function SavingsCalculatorLayout({ children }: { children: ReactNode }) {
  return children;
}
