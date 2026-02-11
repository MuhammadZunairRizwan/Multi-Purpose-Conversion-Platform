import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TIER_LIMITS } from "@/lib/stripe";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user[0]) {
      // User not found in DB, return free tier
      return NextResponse.json({
        tier: "FREE",
        limits: TIER_LIMITS.FREE,
      });
    }

    const userTier = user[0].tier as keyof typeof TIER_LIMITS;

    return NextResponse.json({
      tier: userTier,
      limits: TIER_LIMITS[userTier],
      hasSubscription: !!user[0].stripeSubscriptionId,
    });
  } catch (error: any) {
    console.error("Get tier error:", error);
    return NextResponse.json(
      { error: "Failed to get user tier" },
      { status: 500 }
    );
  }
}
