import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free Currency Converter - Real-Time Exchange Rates",
  description: "Convert currencies with real-time exchange rates. Support for USD, EUR, GBP, JPY, and 150+ currencies. Free online currency converter.",
  keywords: [
    "currency converter",
    "exchange rate",
    "USD to EUR",
    "EUR to USD",
    "currency exchange",
    "forex converter",
    "money converter",
    "real-time exchange rates",
    "free currency converter",
  ],
  openGraph: {
    title: "Free Currency Converter - Real-Time Exchange Rates | CalcnConvert",
    description: "Convert currencies with real-time exchange rates. Support for 150+ currencies. Free online currency converter.",
    url: "https://calcnconvert.net/dashboard/converters/currency",
  },
  twitter: {
    title: "Free Currency Converter - Real-Time Exchange Rates",
    description: "Convert currencies with real-time exchange rates. Support for 150+ currencies. Free online.",
  },
  alternates: {
    canonical: "/dashboard/converters/currency",
  },
};

export default function CurrencyConverterLayout({ children }: { children: ReactNode }) {
  return children;
}
