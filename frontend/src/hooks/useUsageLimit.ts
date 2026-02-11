"use client";

import { useUser } from "@clerk/nextjs";
import { usageAPI } from "@/lib/api";
import { useEffect, useState, useCallback } from "react";
import { getTodayDate } from "@/lib/utils";

// Tier-based limits
const TIER_LIMITS = {
  FREE: { conversions: 5, fileSizeMB: 15 },
  STARTER: { conversions: 7, fileSizeMB: 30 },
  PRO: { conversions: -1, fileSizeMB: 100 }, // -1 = unlimited
};

interface UsageData {
  conversionsUsed: number;
  conversionsLimit: number;
  canConvert: boolean;
  remainingConversions: number;
  fileSizeLimitMB: number;
  tier: string;
  isUnlimited: boolean;
}

export function useUsageLimit() {
  const { user } = useUser();
  const [usage, setUsage] = useState<UsageData>({
    conversionsUsed: 0,
    conversionsLimit: 5, // FREE TIER limit
    canConvert: true,
    remainingConversions: 5,
    fileSizeLimitMB: 15,
    tier: "FREE",
    isUnlimited: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user tier
  const fetchTier = useCallback(async (): Promise<string> => {
    try {
      const response = await fetch("/api/user/tier");
      if (response.ok) {
        const data = await response.json();
        return data.tier || "FREE";
      }
    } catch (error) {
      console.error("Failed to fetch tier:", error);
    }
    return "FREE";
  }, []);

  // Fetch daily usage
  const fetchUsage = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch tier first, then usage with the tier
      const tier = await fetchTier();
      const usageResponse = await usageAPI.getDailyUsage(user.id, tier);

      const conversionsUsed = usageResponse.data.conversions_count || 0;
      const tierLimits = TIER_LIMITS[tier as keyof typeof TIER_LIMITS] || TIER_LIMITS.FREE;
      const conversionsLimit = tierLimits.conversions;
      const isUnlimited = conversionsLimit === -1;

      setUsage({
        conversionsUsed,
        conversionsLimit: isUnlimited ? Infinity : conversionsLimit,
        canConvert: isUnlimited || conversionsUsed < conversionsLimit,
        remainingConversions: isUnlimited ? Infinity : conversionsLimit - conversionsUsed,
        fileSizeLimitMB: tierLimits.fileSizeMB,
        tier,
        isUnlimited,
      });
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch usage:", err);
      // Set default values if API fails
      setUsage({
        conversionsUsed: 0,
        conversionsLimit: 5,
        canConvert: true,
        remainingConversions: 5,
        fileSizeLimitMB: 15,
        tier: "FREE",
        isUnlimited: false,
      });
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id, fetchTier]);

  // Record a conversion
  const recordConversion = useCallback(
    async (type: string) => {
      if (!user?.id) return false;

      try {
        // Check limit before recording
        if (usage.conversionsUsed >= usage.conversionsLimit) {
          setError("Daily conversion limit reached");
          return false;
        }

        await usageAPI.recordConversion(user.id, type, usage.tier);

        // Update local state
        const newCount = usage.conversionsUsed + 1;
        setUsage((prev) => ({
          ...prev,
          conversionsUsed: newCount,
          canConvert: newCount < prev.conversionsLimit,
          remainingConversions: prev.conversionsLimit - newCount,
        }));
        setError(null);
        return true;
      } catch (err: any) {
        console.error("Failed to record conversion:", err);
        setError(err.message);
        return false;
      }
    },
    [user?.id, usage]
  );

  useEffect(() => {
    fetchUsage();

    // Set up interval to check for daily reset
    const interval = setInterval(() => {
      fetchUsage();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [fetchUsage]);

  return {
    usage,
    loading,
    error,
    recordConversion,
    refetch: fetchUsage,
  };
}
