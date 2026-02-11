// Tier limits configuration - can be imported on both client and server
export const TIER_LIMITS = {
  FREE: {
    maxFileSize: 15 * 1024 * 1024, // 15MB
    dailyConversions: 5,
    hasWatermark: true,
    hasHistory: false,
    hasBatchConversion: false,
    hasDocxSupport: false,
    name: "Free",
  },
  STARTER: {
    maxFileSize: 30 * 1024 * 1024, // 30MB
    dailyConversions: 7,
    hasWatermark: false,
    hasHistory: true, // Last document history
    hasBatchConversion: false,
    hasDocxSupport: true,
    name: "Starter",
  },
  PRO: {
    maxFileSize: 100 * 1024 * 1024, // 100MB
    dailyConversions: -1, // Unlimited
    hasWatermark: false,
    hasHistory: true, // Last 5 docs history
    hasBatchConversion: true,
    hasDocxSupport: true,
    name: "Pro",
  },
};

export type TierType = keyof typeof TIER_LIMITS;
