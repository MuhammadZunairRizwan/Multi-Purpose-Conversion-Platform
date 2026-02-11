"use client";

import { useEffect, useState } from "react";
import { usageAPI } from "@/lib/api";
import { useUser } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  DollarSign,
  Ruler,
  Calculator,
  FileDown,
  Zap,
  Crown,
  Star,
  Sparkles,
} from "lucide-react";

interface DailyUsage {
  conversionsUsed: number;
  conversionsLimit: number;
}

interface TierInfo {
  tier: string;
  limits: {
    maxFileSize: number;
    dailyConversions: number;
    hasWatermark: boolean;
    name: string;
  };
  hasSubscription: boolean;
}

interface AnonymousUsage {
  used: number;
  remaining: number;
  limit: number;
  canConvert: boolean;
}

const tools = [
  {
    id: "file",
    name: "File Converter",
    description: "Convert PDF, DOCX, JPG, PNG, and JPEG files",
    icon: FileText,
    href: "/dashboard/converters/file",
    color: "bg-blue-100",
  },
  {
    id: "currency",
    name: "Currency Converter",
    description: "Real-time currency conversion",
    icon: DollarSign,
    href: "/dashboard/converters/currency",
    color: "bg-purple-100",
  },
  {
    id: "unit",
    name: "Unit Converter",
    description: "Convert between various units",
    icon: Ruler,
    href: "/dashboard/converters/unit",
    color: "bg-pink-100",
  },
  {
    id: "calculator",
    name: "Calculators",
    description: "Loan, interest, percentage, and more",
    icon: Calculator,
    href: "/dashboard/calculators/loan",
    color: "bg-yellow-100",
  },
  {
    id: "invoice",
    name: "Invoice Generator",
    description: "Generate professional invoices",
    icon: FileDown,
    href: "/dashboard/documents/invoice",
    color: "bg-green-100",
  },
  {
    id: "receipt",
    name: "Receipt Generator",
    description: "Create receipts quickly",
    icon: FileDown,
    href: "/dashboard/documents/receipt",
    color: "bg-cyan-100",
  },
];

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({
    conversionsUsed: 0,
    conversionsLimit: 5,
  });
  const [tierInfo, setTierInfo] = useState<TierInfo>({
    tier: "FREE",
    limits: {
      maxFileSize: 15 * 1024 * 1024,
      dailyConversions: 5,
      hasWatermark: true,
      name: "Free",
    },
    hasSubscription: false,
  });
  const [ipUsage, setIpUsage] = useState<AnonymousUsage | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchTierAndUsage = async () => {
      if (!user?.id) {
        setDataLoading(false);
        return;
      }

      try {
        // First fetch tier info
        const tierResponse = await fetch("/api/user/tier");
        let currentTier = "FREE";
        if (tierResponse.ok) {
          const data = await tierResponse.json();
          setTierInfo(data);
          currentTier = data.tier;
        }

        // For FREE tier, use IP-based tracking (same as anonymous)
        if (currentTier === "FREE") {
          try {
            const ipResponse = await fetch("/api/anonymous-usage");
            if (ipResponse.ok) {
              const ipData = await ipResponse.json();
              setIpUsage(ipData);
              setDailyUsage({
                conversionsUsed: ipData.used,
                conversionsLimit: ipData.limit,
              });
            }
          } catch (error) {
            console.error("Failed to fetch IP usage:", error);
          }
        } else {
          // For STARTER/PRO, use user-based tracking
          try {
            const response = await usageAPI.getDailyUsage(user.id);
            setDailyUsage({
              conversionsUsed: response.data.conversions_count,
              conversionsLimit: response.data.conversions_limit,
            });
          } catch (error) {
            console.error("Failed to fetch usage:", error);
          }
        }
      } catch (error) {
        console.error("Failed to fetch tier:", error);
      } finally {
        setDataLoading(false);
      }
    };

    if (user?.id) {
      fetchTierAndUsage();
    } else if (isLoaded) {
      setDataLoading(false);
    }
  }, [user?.id, isLoaded]);

  // Listen for usage updates from file converter
  useEffect(() => {
    const handleUsageUpdate = (event: CustomEvent<AnonymousUsage>) => {
      if (tierInfo.tier === "FREE") {
        setIpUsage(event.detail);
        setDailyUsage({
          conversionsUsed: event.detail.used,
          conversionsLimit: event.detail.limit,
        });
      }
    };

    window.addEventListener("anonymous-usage-updated", handleUsageUpdate as EventListener);
    return () => {
      window.removeEventListener("anonymous-usage-updated", handleUsageUpdate as EventListener);
    };
  }, [tierInfo.tier]);

  if (!isLoaded || dataLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName || "User"}!
        </h1>
        <p className="text-gray-600 text-lg">
          Select a tool below to get started
        </p>
      </div>

      {/* User Tier Card */}
      <Card className={`mb-8 p-6 glass-card ${
        tierInfo.tier === "PRO"
          ? "bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200"
          : tierInfo.tier === "STARTER"
          ? "bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200"
          : "bg-gradient-to-r from-red-50 to-red-100 border-red-200"
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
              {tierInfo.tier === "PRO" ? (
                <Crown className="w-5 h-5 text-purple-500" />
              ) : tierInfo.tier === "STARTER" ? (
                <Zap className="w-5 h-5 text-blue-500" />
              ) : (
                <Star className="w-5 h-5 text-red-500" />
              )}
              Your Account
            </h3>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Current Plan</p>
                <p className={`text-2xl font-bold bg-clip-text text-transparent ${
                  tierInfo.tier === "PRO"
                    ? "bg-gradient-to-r from-purple-500 to-purple-600"
                    : tierInfo.tier === "STARTER"
                    ? "bg-gradient-to-r from-blue-500 to-blue-600"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                }`}>
                  {tierInfo.tier} TIER
                </p>
              </div>
              <div className={`border-l pl-6 ${
                tierInfo.tier === "PRO"
                  ? "border-purple-300"
                  : tierInfo.tier === "STARTER"
                  ? "border-blue-300"
                  : "border-red-300"
              }`}>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Daily Conversions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tierInfo.limits.dailyConversions === -1 ? (
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Unlimited
                    </span>
                  ) : (
                    `${dailyUsage.conversionsUsed}/${tierInfo.limits.dailyConversions}`
                  )}
                </p>
              </div>
              {!tierInfo.limits.hasWatermark && (
                <div className={`border-l pl-6 ${
                  tierInfo.tier === "PRO"
                    ? "border-purple-300"
                    : "border-blue-300"
                }`}>
                  <p className="text-xs text-gray-600 uppercase tracking-wide">Watermarks</p>
                  <p className="text-lg font-bold text-green-600">No Watermarks</p>
                </div>
              )}
            </div>
          </div>
          {tierInfo.tier === "FREE" && (
            <Link href="/dashboard/pricing">
              <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white">
                Upgrade Plan
              </Button>
            </Link>
          )}
        </div>
      </Card>

      {/* Usage Warning - Only show for FREE tier */}
      {tierInfo.tier === "FREE" && dailyUsage.conversionsUsed >= dailyUsage.conversionsLimit - 1 && (
        <Card className="mb-8 p-4 bg-gradient-to-br from-red-50 to-red-100 glass-card border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-red-800 font-medium">
              You've used {dailyUsage.conversionsUsed} of {dailyUsage.conversionsLimit} daily conversions.
              Upgrade to get unlimited access!
            </p>
            <Link href="/dashboard/pricing">
              <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Tools Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.id} href={tool.href}>
                <Card className="h-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl p-6 flex flex-col group">
                  <div className={`${tool.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-gray-700" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-red-500 transition">
                    {tool.name}
                  </h3>
                  <p className="text-gray-600 text-sm flex-1 mb-4">
                    {tool.description}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full glass-card border-gray-300 hover:border-red-500 hover:text-red-500 transition"
                  >
                    Open Tool
                  </Button>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
