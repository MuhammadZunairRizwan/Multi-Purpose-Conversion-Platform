"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Star } from "lucide-react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out CalcnConvert",
    icon: <Star className="w-6 h-6" />,
    features: [
      "5 file conversions per day",
      "15MB max file size",
      "PDF, JPG, PNG, DOCX conversion",
      "Free calculators (loan, interest, percentage)",
      "Unlimited currency & unit conversion",
      "Invoice & receipt with watermark",
    ],
  },
  {
    name: "Starter",
    price: "$4.99",
    description: "Best for regular users",
    icon: <Zap className="w-6 h-6" />,
    popular: true,
    features: [
      "7 file conversions per day",
      "30MB max file size",
      "All file formats supported",
      "No watermarks on documents",
      "Additional calculators (amortization, profit margin)",
      "Document history",
    ],
  },
  {
    name: "Pro",
    price: "$9.99",
    description: "For power users and teams",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Unlimited file conversions",
      "100MB max file size",
      "Batch file conversion",
      "All calculators (ROI, break-even)",
      "NDA & Employment letter generator",
      "Extended history & priority support",
    ],
  },
];

export default function PublicPricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start free, upgrade anytime.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <Card
                key={tier.name}
                className={`relative p-8 flex flex-col ${
                  tier.popular
                    ? "border-2 border-red-500 shadow-xl scale-105"
                    : "border border-gray-200"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Tier Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      tier.popular
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tier.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">
                    {tier.price}
                  </span>
                  {tier.price !== "$0" && (
                    <span className="text-gray-500">/month</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6">{tier.description}</p>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check
                        className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                          tier.popular ? "text-red-500" : "text-green-500"
                        }`}
                      />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link href={tier.price === "$0" ? "/dashboard/converters/file" : "/sign-up"} className="w-full">
                  <Button
                    className={`w-full py-6 text-lg ${
                      tier.popular
                        ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                        : tier.price === "$0"
                        ? "bg-gray-900 hover:bg-gray-800 text-white"
                        : "bg-gray-900 hover:bg-gray-800 text-white"
                    }`}
                  >
                    {tier.price === "$0" ? "Get Started Free" : `Get ${tier.name}`}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 mb-4">
              All plans include access to our core conversion tools.
              <br />
              Need a custom plan?{" "}
              <a href="mailto:support@calcnconvert.com" className="text-red-500 hover:underline">
                Contact us
              </a>
            </p>
            <p className="text-sm text-gray-400">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-red-500 hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
