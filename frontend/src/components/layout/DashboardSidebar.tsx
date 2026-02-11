"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  FileText,
  DollarSign,
  Ruler,
  Calculator,
  FileDown,
  Home,
  Crown,
  Zap,
  TrendingUp,
  PiggyBank,
  Briefcase,
  Target,
  BarChart3,
  Shield,
  FileSignature,
  Mail,
  Headphones,
  UserPlus
} from "lucide-react";
import { useUsageLimit } from "@/hooks/useUsageLimit";
import { Button } from "@/components/ui/button";

interface AnonymousUsage {
  used: number;
  remaining: number;
  limit: number;
  canConvert: boolean;
}

interface MenuItem {
  label: string;
  href?: string;
  icon?: any;
  tier?: "STARTER" | "PRO";
  items?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Converters",
    items: [
      { label: "File Converter", href: "/dashboard/converters/file", icon: FileText },
      { label: "Currency", href: "/dashboard/converters/currency", icon: DollarSign },
      { label: "Unit", href: "/dashboard/converters/unit", icon: Ruler },
    ],
  },
  {
    label: "Free Calculators",
    items: [
      { label: "Loan Calculator", href: "/dashboard/calculators/loan", icon: Calculator },
      { label: "Interest Calculator", href: "/dashboard/calculators/interest", icon: Calculator },
      { label: "Percentage", href: "/dashboard/calculators/percentage", icon: Calculator },
      { label: "Date Difference", href: "/dashboard/calculators/date-difference", icon: Calculator },
      { label: "Unit Price", href: "/dashboard/calculators/unit-price", icon: Calculator },
    ],
  },
  {
    label: "Starter Calculators",
    items: [
      { label: "Amortization", href: "/dashboard/calculators/amortization", icon: BarChart3, tier: "STARTER" },
      { label: "Profit Margin", href: "/dashboard/calculators/profit-margin", icon: TrendingUp, tier: "STARTER" },
      { label: "Salary/Hourly", href: "/dashboard/calculators/salary-hourly", icon: Briefcase, tier: "STARTER" },
      { label: "Savings", href: "/dashboard/calculators/savings", icon: PiggyBank, tier: "STARTER" },
    ],
  },
  {
    label: "Pro Calculators",
    items: [
      { label: "ROI Calculator", href: "/dashboard/calculators/roi", icon: TrendingUp, tier: "PRO" },
      { label: "Break-even", href: "/dashboard/calculators/breakeven", icon: Target, tier: "PRO" },
    ],
  },
  {
    label: "Documents",
    items: [
      { label: "All Documents", href: "/dashboard/documents", icon: FileDown },
      { label: "Invoice Generator", href: "/dashboard/documents/invoice", icon: FileDown },
      { label: "Receipt Generator", href: "/dashboard/documents/receipt", icon: FileDown },
    ],
  },
  {
    label: "Pro Documents",
    items: [
      { label: "NDA Generator", href: "/dashboard/documents/nda", icon: Shield, tier: "PRO" },
      { label: "Employment Letter", href: "/dashboard/documents/employment-letter", icon: FileSignature, tier: "PRO" },
    ],
  },
  {
    label: "Upgrade",
    href: "/dashboard/pricing",
    icon: Crown,
  },
];

const SUPPORT_EMAIL = "support@calcnconvert.com";

// Simplified menu for anonymous users
const anonymousMenuItems: MenuItem[] = [
  {
    label: "Free Converters",
    items: [
      { label: "File Converter", href: "/dashboard/converters/file", icon: FileText },
      { label: "Currency Converter", href: "/dashboard/converters/currency", icon: DollarSign },
      { label: "Unit Converter", href: "/dashboard/converters/unit", icon: Ruler },
    ],
  },
  {
    label: "Free Calculators",
    items: [
      { label: "Loan Calculator", href: "/dashboard/calculators/loan", icon: Calculator },
      { label: "Interest Calculator", href: "/dashboard/calculators/interest", icon: Calculator },
      { label: "Percentage", href: "/dashboard/calculators/percentage", icon: Calculator },
      { label: "Date Difference", href: "/dashboard/calculators/date-difference", icon: Calculator },
      { label: "Unit Price", href: "/dashboard/calculators/unit-price", icon: Calculator },
    ],
  },
  {
    label: "Free Documents",
    items: [
      { label: "Invoice Generator", href: "/dashboard/documents/invoice", icon: FileDown },
      { label: "Receipt Generator", href: "/dashboard/documents/receipt", icon: FileDown },
    ],
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const { usage } = useUsageLimit();
  const [anonymousUsage, setAnonymousUsage] = useState<AnonymousUsage | null>(null);

  const showSupport = usage.tier === "STARTER" || usage.tier === "PRO";
  const isLoggedIn = isLoaded && isSignedIn;

  // Fetch anonymous usage when not logged in
  useEffect(() => {
    const fetchAnonymousUsage = async () => {
      if (!isLoaded || isSignedIn) return;

      try {
        const response = await fetch("/api/anonymous-usage");
        if (response.ok) {
          const data = await response.json();
          setAnonymousUsage(data);
        }
      } catch (err) {
        console.error("Failed to fetch anonymous usage:", err);
      }
    };

    fetchAnonymousUsage();
  }, [isLoaded, isSignedIn]);

  // Listen for usage updates from file converter
  useEffect(() => {
    const handleUsageUpdate = (event: CustomEvent<AnonymousUsage>) => {
      setAnonymousUsage(event.detail);
    };

    window.addEventListener("anonymous-usage-updated", handleUsageUpdate as EventListener);
    return () => {
      window.removeEventListener("anonymous-usage-updated", handleUsageUpdate as EventListener);
    };
  }, []);

  const isActive = (href: string) => pathname === href;

  // Use different menu for anonymous users
  const currentMenuItems = isLoggedIn ? menuItems : anonymousMenuItems;

  return (
    <aside className="w-64 glass-sidebar p-6 hidden md:block min-h-screen flex flex-col">
      {/* Logo Area */}
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="CalcnConvert"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav className="space-y-6">
        {currentMenuItems.map((item) => (
          <div key={item.label}>
            {!item.items ? (
              <Link href={item.href!} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                isActive(item.href!)
                  ? "glass-card bg-red-50 text-red-600 font-medium shadow-md"
                  : "text-gray-700 hover:glass-card hover:shadow-sm"
              }`}>
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            ) : (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {item.label}
                </h3>
                <ul className="space-y-1">
                  {item.items.map((subitem) => {
                    const Icon = subitem.icon;
                    return (
                      <li key={subitem.href}>
                        <Link
                          href={subitem.href!}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition ${
                            isActive(subitem.href!)
                              ? "glass-card bg-red-50 text-red-600 font-medium shadow-md"
                              : "text-gray-700 hover:glass-card hover:shadow-sm"
                          }`}
                        >
                          {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                          <span className="text-sm flex-1">{subitem.label}</span>
                          {subitem.tier === "STARTER" && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-100 text-blue-600 rounded">
                              S
                            </span>
                          )}
                          {subitem.tier === "PRO" && (
                            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-purple-100 text-purple-600 rounded">
                              P
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Anonymous User Section */}
      {!isLoggedIn && anonymousUsage && (
        <div className="mt-auto pt-6 border-t border-gray-200">
          {/* Usage Display */}
          <div className={`p-4 rounded-lg mb-4 ${
            anonymousUsage.canConvert
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className={`w-4 h-4 ${
                anonymousUsage.canConvert ? "text-green-600" : "text-red-600"
              }`} />
              <span className={`text-xs font-semibold ${
                anonymousUsage.canConvert ? "text-green-800" : "text-red-800"
              }`}>
                File Conversions
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${
                anonymousUsage.canConvert ? "text-green-700" : "text-red-700"
              }`}>
                {anonymousUsage.remaining}/{anonymousUsage.limit}
              </span>
              <span className={`text-xs ${
                anonymousUsage.canConvert ? "text-green-600" : "text-red-600"
              }`}>
                remaining today
              </span>
            </div>
          </div>

          {/* Sign Up Prompt */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-orange-50 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <UserPlus className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-red-800">
                Get More Features
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Upgrade for calculators, documents & more conversions!
            </p>
            <Link href="/dashboard/pricing">
              <Button size="sm" className="w-full bg-red-500 hover:bg-red-600 text-white">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Support Section for Starter+ users */}
      {isLoggedIn && showSupport && (
        <div className="mt-auto pt-6 border-t border-gray-200">
          <div className={`p-4 rounded-lg ${
            usage.tier === "PRO"
              ? "bg-purple-50 border border-purple-100"
              : "bg-blue-50 border border-blue-100"
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Headphones className={`w-4 h-4 ${
                usage.tier === "PRO" ? "text-purple-600" : "text-blue-600"
              }`} />
              <span className={`text-xs font-semibold ${
                usage.tier === "PRO" ? "text-purple-800" : "text-blue-800"
              }`}>
                Priority Support
              </span>
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className={`flex items-center gap-2 text-sm hover:underline ${
                usage.tier === "PRO" ? "text-purple-700" : "text-blue-700"
              }`}
            >
              <Mail className="w-4 h-4" />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      )}
    </aside>
  );
}
