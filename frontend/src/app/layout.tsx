import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ToasterProvider } from "@/components/providers/Toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CalcnConvert - Free Online File Converter & Calculator Tools",
    template: "%s | CalcnConvert",
  },
  description: "Free online tools to convert PDF, Excel, PowerPoint, images. Calculate loans, interest, ROI, savings. Convert units and currencies instantly. No signup required.",
  keywords: [
    "file converter",
    "PDF converter",
    "Excel to PDF",
    "PowerPoint to PDF",
    "image converter",
    "JPG to PDF",
    "PNG to JPG",
    "unit converter",
    "currency converter",
    "loan calculator",
    "interest calculator",
    "ROI calculator",
    "online tools",
    "free converter",
    "document converter",
    "OCR PDF",
  ],
  authors: [{ name: "CalcnConvert" }],
  creator: "CalcnConvert",
  publisher: "CalcnConvert",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/onlylogo.png",
    shortcut: "/onlylogo.png",
    apple: "/onlylogo.png",
  },
  metadataBase: new URL("https://calcnconvert.net"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://calcnconvert.net",
    siteName: "CalcnConvert",
    title: "CalcnConvert - Free Online File Converter & Calculator Tools",
    description: "Free online tools to convert PDF, Excel, PowerPoint, images. Calculate loans, interest, ROI, savings. Convert units and currencies instantly.",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "CalcnConvert - Online Converter and Calculator Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CalcnConvert - Free Online File Converter & Calculator Tools",
    description: "Free online tools to convert PDF, Excel, PowerPoint, images. Calculate loans, interest, ROI, savings.",
    images: ["/logo.png"],
    creator: "@calcnconvert",
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
        >
          <ToasterProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
