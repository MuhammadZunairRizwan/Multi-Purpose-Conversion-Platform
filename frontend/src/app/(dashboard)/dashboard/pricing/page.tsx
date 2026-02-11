"use client";

import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader, Crown, Zap, Star } from "lucide-react";

interface PricingTier {
  name: string;
  price: string;
  priceId: string;
  tierKey: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    priceId: "free",
    tierKey: "FREE",
    description: "Perfect for trying out CalcnConvert",
    icon: <Star className="w-6 h-6" />,
    features: [
      "5 conversions per day",
      "15MB max file size",
      "PDF & JPG file conversion",
      "Basic calculators (loan, interest, percentage)",
      "Unit & currency conversion",
      "Watermarked documents",
    ],
  },
  {
    name: "Starter",
    price: "$4.99",
    priceId: "price_1SgMp2Q5lyGIw2nIY51CnCql",
    tierKey: "STARTER",
    description: "Best for regular users",
    icon: <Zap className="w-6 h-6" />,
    popular: true,
    features: [
      "7 conversions per day",
      "30MB max file size",
      "DOCX files included",
      "No watermarks on documents",
      "Additional calculators (amortization, profit margin)",
      "Last document history",
    ],
  },
  {
    name: "Pro",
    price: "$9.99",
    priceId: "price_1SgMBjQ5lyGIw2nIgQ6Ife0A",
    tierKey: "PRO",
    description: "For power users and teams",
    icon: <Crown className="w-6 h-6" />,
    features: [
      "Unlimited conversions",
      "100MB max file size",
      "Batch file conversion",
      "All calculators (ROI, break-even)",
      "NDA & Employment letter generator",
      "Last 5 docs history & priority support",
    ],
  },
];

function PricingContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [currentTier, setCurrentTier] = useState<string>("FREE");
  const [verifying, setVerifying] = useState(false);

  // Fetch user's current tier on mount
  useEffect(() => {
    const fetchUserTier = async () => {
      if (!user) return;

      try {
        const response = await fetch("/api/user/tier");
        if (response.ok) {
          const data = await response.json();
          setCurrentTier(data.tier || "FREE");
        }
      } catch (error) {
        console.error("Error fetching tier:", error);
      }
    };

    if (isLoaded && user) {
      fetchUserTier();
    }
  }, [user, isLoaded]);

  // Handle success redirect from Stripe
  useEffect(() => {
    const success = searchParams.get("success");
    const canceled = searchParams.get("canceled");

    if (success === "true" && user) {
      setVerifying(true);
      // Verify the session and update tier
      fetch("/api/stripe/verify-session", {
        method: "POST",
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCurrentTier(data.tier);
            toast.success(`Successfully upgraded to ${data.tier}!`);
          } else {
            toast.info("Processing your subscription...");
          }
        })
        .catch((error) => {
          console.error("Verification error:", error);
        })
        .finally(() => {
          setVerifying(false);
          // Clear URL params
          window.history.replaceState({}, "", "/dashboard/pricing");
        });
    }

    if (canceled === "true") {
      toast.info("Payment was canceled");
      window.history.replaceState({}, "", "/dashboard/pricing");
    }
  }, [searchParams, user]);

  const handleSubscribe = async (tier: PricingTier) => {
    if (tier.priceId === "free") {
      toast.info("You're already on the Free tier!");
      return;
    }

    if (currentTier === tier.tierKey) {
      toast.info(`You're already on the ${tier.name} plan!`);
      return;
    }

    if (!user) {
      toast.error("Please sign in to subscribe");
      return;
    }

    try {
      setLoading(tier.name);

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: tier.priceId,
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to process subscription");
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading("manage");
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
      });
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to open billing portal");
      }
    } catch (error) {
      toast.error("Failed to open billing portal");
    } finally {
      setLoading(null);
    }
  };

  if (verifying) {
    return (
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Verifying your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Unlock premium features and take your productivity to the next level
          </p>
          {currentTier !== "FREE" && (
            <div className="mt-4">
              <span className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                <Check className="w-4 h-4" />
                Current Plan: {currentTier}
              </span>
              <Button
                onClick={handleManageSubscription}
                variant="outline"
                className="ml-4"
                disabled={loading === "manage"}
              >
                {loading === "manage" ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  "Manage Subscription"
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const isCurrentPlan = currentTier === tier.tierKey;

            return (
              <Card
                key={tier.name}
                className={`relative p-8 flex flex-col ${
                  tier.popular
                    ? "border-2 border-red-500 shadow-xl scale-105"
                    : isCurrentPlan
                    ? "border-2 border-green-500"
                    : "border border-gray-200"
                }`}
              >
                {tier.popular && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Tier Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`p-2 rounded-lg ${
                      isCurrentPlan
                        ? "bg-green-100 text-green-600"
                        : tier.popular
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
                          isCurrentPlan
                            ? "text-green-500"
                            : tier.popular
                            ? "text-red-500"
                            : "text-green-500"
                        }`}
                      />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={() => handleSubscribe(tier)}
                  disabled={loading !== null || isCurrentPlan}
                  className={`w-full py-6 text-lg ${
                    isCurrentPlan
                      ? "bg-green-100 text-green-700 cursor-default"
                      : tier.popular
                      ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                      : tier.priceId === "free"
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  {loading === tier.name ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : tier.priceId === "free" ? (
                    "Free Forever"
                  ) : (
                    `Get ${tier.name}`
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-500">
            All plans include access to our core conversion tools.
            <br />
            Need a custom plan?{" "}
            <a href="mailto:support@calcnconvert.com" className="text-red-500 hover:underline">
              Contact us
            </a>
          </p>
        </div>

        {/* Test Card Info */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-yellow-800 text-center">
            <strong>Test Mode:</strong> Use card number{" "}
            <code className="bg-yellow-100 px-1 rounded">4242 4242 4242 4242</code>{" "}
            with any future date and CVC
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="p-6 md:p-8 flex items-center justify-center min-h-[60vh]">
        <Loader className="w-12 h-12 animate-spin text-red-500" />
      </div>
    }>
      <PricingContent />
    </Suspense>
  );
}
