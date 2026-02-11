import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Free File Converter - PDF, Excel, PowerPoint, Images",
  description: "Convert PDF to JPG, PNG, DOCX. Convert Excel, PowerPoint to PDF. OCR scanned PDFs to searchable text. Free online file converter with no signup required.",
  keywords: [
    "PDF converter",
    "PDF to JPG",
    "PDF to PNG",
    "JPG to PDF",
    "Excel to PDF",
    "PowerPoint to PDF",
    "XLSX to PDF",
    "PPTX to PDF",
    "image converter",
    "OCR PDF",
    "searchable PDF",
    "free file converter",
    "online converter",
  ],
  openGraph: {
    title: "Free File Converter - PDF, Excel, PowerPoint, Images | CalcnConvert",
    description: "Convert PDF to JPG, PNG, DOCX. Convert Excel, PowerPoint to PDF. OCR scanned PDFs. Free online file converter.",
    url: "https://calcnconvert.net/dashboard/converters/file",
  },
  twitter: {
    title: "Free File Converter - PDF, Excel, PowerPoint, Images",
    description: "Convert PDF to JPG, PNG, DOCX. Convert Excel, PowerPoint to PDF. Free online file converter.",
  },
  alternates: {
    canonical: "/dashboard/converters/file",
  },
};

export default function FileConverterLayout({ children }: { children: ReactNode }) {
  return children;
}
