"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { FileText, DollarSign, Ruler, Calculator, FileDown, Shield, Receipt, FileSignature, Briefcase } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const tools = [
  {
    id: "file-convert",
    name: "File Converter",
    description: "Convert PDF to JPG and JPG to PDF - 5 free/day!",
    icon: FileText,
    color: "bg-blue-100",
    href: "/dashboard/converters/file",
    free: true,
  },
  {
    id: "currency",
    name: "Currency Converter",
    description: "Real-time currency conversion - Free!",
    icon: DollarSign,
    color: "bg-purple-100",
    href: "/dashboard/converters/currency",
    free: true,
  },
  {
    id: "unit",
    name: "Unit Converter",
    description: "Convert between various units - Free!",
    icon: Ruler,
    color: "bg-pink-100",
    href: "/dashboard/converters/unit",
    free: true,
  },
  {
    id: "calculators",
    name: "Calculators",
    description: "Loan, interest, percentage, date & more - Free!",
    icon: Calculator,
    color: "bg-yellow-100",
    href: "/dashboard/calculators/loan",
    free: true,
  },
  {
    id: "invoice",
    name: "Invoice Generator",
    description: "Create professional invoices - Free with watermark!",
    icon: FileDown,
    color: "bg-green-100",
    href: "/dashboard/documents/invoice",
    free: true,
  },
  {
    id: "receipt",
    name: "Receipt Generator",
    description: "Generate receipts - Free with watermark!",
    icon: Receipt,
    color: "bg-cyan-100",
    href: "/dashboard/documents/receipt",
    free: true,
  },
  {
    id: "nda",
    name: "NDA Generator",
    description: "Create non-disclosure agreements",
    icon: FileSignature,
    color: "bg-orange-100",
    href: "/sign-in",
    free: false,
  },
  {
    id: "employment-letter",
    name: "Employment Letter",
    description: "Generate employment verification letters",
    icon: Briefcase,
    color: "bg-indigo-100",
    href: "/sign-in",
    free: false,
  },
];

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we've confirmed the user is signed in
    if (isLoaded && isSignedIn === true) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show loading state while auth is being determined
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Don't render if user is signed in (redirecting)
  if (isSignedIn === true) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Convert. Calculate. Create. <span className="text-red-500">Instantly.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Your all-in-one productivity toolkit. Transform files between formats, crunch numbers with powerful calculators,
              and generate professional documents — all without signing up. Fast, free, and secure.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/dashboard/converters/file">
                <Button size="lg" className="bg-red-500 hover:bg-red-600 text-white">
                  Get Started Free
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.id} href={tool.href}>
                    <Card className="h-full cursor-pointer hover:shadow-lg transition p-6 flex flex-col bg-white border border-gray-300 relative">
                      {tool.free && (
                        <span className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                          FREE
                        </span>
                      )}
                      <div className={`${tool.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-gray-700" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h3>
                      <p className="text-gray-600 text-sm flex-1">{tool.description}</p>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose CalcnConvert?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">100% Secure</h3>
                <p className="text-gray-600 text-center">Your files are processed securely and deleted after conversion</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Free & Easy</h3>
                <p className="text-gray-600 text-center">Get started free with generous limits. Simple, intuitive interface</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Calculator className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Multiple Tools</h3>
                <p className="text-gray-600 text-center">All the conversion and calculation tools you need in one place</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
