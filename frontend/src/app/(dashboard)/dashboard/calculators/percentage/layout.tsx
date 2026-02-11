import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Percentage Calculator - Calculate Percentages Easily",
  description: "Calculate percentages, percentage increase/decrease, and percentage of a number. Free percentage calculator for discounts, tips, grades, and more.",
  keywords: [
    "percentage calculator",
    "percent calculator",
    "percentage increase calculator",
    "percentage decrease calculator",
    "discount calculator",
    "tip calculator",
    "free percentage calculator",
  ],
  openGraph: {
    title: "Free Percentage Calculator - Calculate Percentages Easily | CalcnConvert",
    description: "Calculate percentages, percentage increase/decrease, and percentage of a number. Free percentage calculator.",
    url: "https://calcnconvert.net/dashboard/calculators/percentage",
  },
  alternates: {
    canonical: "/dashboard/calculators/percentage",
  },
};

export default function PercentageCalculatorLayout({ children }: { children: ReactNode }) {
  return children;
}
