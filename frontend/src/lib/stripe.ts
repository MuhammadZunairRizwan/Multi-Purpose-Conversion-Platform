import Stripe from "stripe";

// Re-export TIER_LIMITS from client-safe module
export { TIER_LIMITS, type TierType } from "./tier-limits";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  typescript: true,
});

// Price IDs - Replace these with your actual Stripe price IDs after creating products
export const PRICE_IDS = {
  STARTER: process.env.STRIPE_STARTER_PRICE_ID || "price_starter_monthly",
  PRO: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
};
