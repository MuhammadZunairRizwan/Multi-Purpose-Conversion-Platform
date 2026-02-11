import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Unit Converter - Length, Weight, Temperature, Volume",
  description: "Convert between units of length, weight, temperature, volume, area, speed, and time. Free online unit converter with instant results. No signup required.",
  keywords: [
    "unit converter",
    "length converter",
    "weight converter",
    "temperature converter",
    "volume converter",
    "area converter",
    "speed converter",
    "time converter",
    "metric to imperial",
    "km to miles",
    "kg to pounds",
    "celsius to fahrenheit",
    "free unit converter",
  ],
  openGraph: {
    title: "Free Unit Converter - Length, Weight, Temperature & More | CalcnConvert",
    description: "Convert between units of length, weight, temperature, volume, area, speed, and time. Free online unit converter.",
    url: "https://calcnconvert.net/dashboard/converters/unit",
  },
  twitter: {
    title: "Free Unit Converter - Length, Weight, Temperature & More",
    description: "Convert between units of length, weight, temperature, volume, area, speed, and time. Free online.",
  },
  alternates: {
    canonical: "/dashboard/converters/unit",
  },
};

export default function UnitConverterLayout({ children }: { children: ReactNode }) {
  return children;
}
