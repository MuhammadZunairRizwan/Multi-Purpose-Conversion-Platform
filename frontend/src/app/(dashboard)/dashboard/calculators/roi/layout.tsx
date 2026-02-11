import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free ROI Calculator - Return on Investment",
  description: "Calculate return on investment (ROI) for stocks, real estate, business investments. Free ROI calculator with percentage and annualized returns.",
  keywords: [
    "ROI calculator",
    "return on investment calculator",
    "investment return calculator",
    "stock ROI calculator",
    "real estate ROI",
    "business ROI calculator",
    "free ROI calculator",
  ],
  openGraph: {
    title: "Free ROI Calculator - Return on Investment | CalcnConvert",
    description: "Calculate return on investment (ROI) for stocks, real estate, business investments. Free ROI calculator.",
    url: "https://calcnconvert.net/dashboard/calculators/roi",
  },
  alternates: {
    canonical: "/dashboard/calculators/roi",
  },
};

export default function ROICalculatorLayout({ children }: { children: ReactNode }) {
  return children;
}
