"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import DocumentHistory from "@/components/DocumentHistory";
import { FileText, Receipt, FileCheck, Briefcase, Crown, Lock } from "lucide-react";
import Link from "next/link";

const documentTypes = [
  {
    id: "invoice",
    title: "Invoice",
    description: "Create professional invoices for your clients",
    icon: FileText,
    href: "/dashboard/documents/invoice",
    tier: "FREE",
    color: "blue",
  },
  {
    id: "receipt",
    title: "Receipt",
    description: "Generate receipts for transactions",
    icon: Receipt,
    href: "/dashboard/documents/receipt",
    tier: "FREE",
    color: "green",
  },
  {
    id: "nda",
    title: "NDA",
    description: "Non-Disclosure Agreement for business protection",
    icon: FileCheck,
    href: "/dashboard/documents/nda",
    tier: "PRO",
    color: "purple",
  },
  {
    id: "employment-letter",
    title: "Employment Letter",
    description: "Offer or confirmation letters for employees",
    icon: Briefcase,
    href: "/dashboard/documents/employment-letter",
    tier: "PRO",
    color: "orange",
  },
];

const tierColors: Record<string, string> = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-green-100 text-green-600",
  purple: "bg-purple-100 text-purple-600",
  orange: "bg-orange-100 text-orange-600",
};

const tierHoverColors: Record<string, string> = {
  blue: "hover:border-blue-300 hover:bg-blue-50",
  green: "hover:border-green-300 hover:bg-green-50",
  purple: "hover:border-purple-300 hover:bg-purple-50",
  orange: "hover:border-orange-300 hover:bg-orange-50",
};

export default function DocumentsPage() {
  const { usage } = useUsageLimit();

  const canAccess = (requiredTier: string) => {
    if (requiredTier === "FREE") return true;
    if (requiredTier === "STARTER" && (usage.tier === "STARTER" || usage.tier === "PRO")) return true;
    if (requiredTier === "PRO" && usage.tier === "PRO") return true;
    return false;
  };

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Generators
          </h1>
          <p className="text-gray-600">
            Create professional documents for your business
          </p>
          <div className={`mt-3 p-3 rounded-lg border ${
            usage.tier === "PRO"
              ? "bg-purple-50 border-purple-200"
              : usage.tier === "STARTER"
                ? "bg-blue-50 border-blue-200"
                : "bg-gray-50 border-gray-200"
          }`}>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className={`font-semibold ${
                  usage.tier === "PRO"
                    ? "text-purple-800"
                    : usage.tier === "STARTER"
                      ? "text-blue-800"
                      : "text-gray-800"
                }`}>
                  {usage.tier} TIER:
                </span>
                <span className={`ml-2 ${
                  usage.tier === "PRO"
                    ? "text-purple-700"
                    : usage.tier === "STARTER"
                      ? "text-blue-700"
                      : "text-gray-700"
                }`}>
                  {usage.tier === "FREE"
                    ? "Watermarked documents | Upgrade for more features"
                    : usage.tier === "STARTER"
                      ? "Watermark-free | 1 document in history"
                      : "All documents | 5 documents in history"}
                </span>
              </div>
              {usage.tier !== "PRO" && (
                <Link href="/dashboard/pricing">
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Crown className="w-3 h-3" />
                    Upgrade
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Document Types Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {documentTypes.map((doc) => {
            const Icon = doc.icon;
            const hasAccess = canAccess(doc.tier);

            return (
              <Card
                key={doc.id}
                className={`p-6 transition-all ${
                  hasAccess
                    ? tierHoverColors[doc.color]
                    : "opacity-75 cursor-not-allowed"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${tierColors[doc.color]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {doc.title}
                      </h3>
                      {doc.tier === "PRO" && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                          PRO
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {doc.description}
                    </p>
                    {hasAccess ? (
                      <Link href={doc.href}>
                        <Button size="sm" className="gap-2">
                          Create {doc.title}
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="gap-2">
                        <Lock className="w-4 h-4" />
                        PRO Required
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Document History */}
        <DocumentHistory />
      </div>
    </div>
  );
}
