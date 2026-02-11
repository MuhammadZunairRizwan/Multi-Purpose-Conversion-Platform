import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { anonymousUsage } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const DAILY_LIMIT = 5;

// Helper to get client IP
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP (behind proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback - this might not work in all environments
  return "unknown";
}

// GET - Check current usage for an IP
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const today = new Date().toISOString().split("T")[0];

    // Find existing usage record for today
    const existingUsage = await db
      .select()
      .from(anonymousUsage)
      .where(
        and(
          eq(anonymousUsage.ipAddress, ip),
          eq(anonymousUsage.date, today)
        )
      )
      .limit(1);

    const currentCount = existingUsage[0]?.conversionCount || 0;
    const remaining = Math.max(0, DAILY_LIMIT - currentCount);

    return NextResponse.json({
      used: currentCount,
      remaining,
      limit: DAILY_LIMIT,
      canConvert: currentCount < DAILY_LIMIT,
    });
  } catch (error) {
    console.error("Error checking anonymous usage:", error);
    return NextResponse.json(
      { error: "Failed to check usage" },
      { status: 500 }
    );
  }
}

// POST - Record a conversion
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const today = new Date().toISOString().split("T")[0];

    // Find existing usage record for today
    const existingUsage = await db
      .select()
      .from(anonymousUsage)
      .where(
        and(
          eq(anonymousUsage.ipAddress, ip),
          eq(anonymousUsage.date, today)
        )
      )
      .limit(1);

    const currentCount = existingUsage[0]?.conversionCount || 0;

    // Check if limit reached
    if (currentCount >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          error: "Daily limit reached",
          used: currentCount,
          remaining: 0,
          limit: DAILY_LIMIT,
          canConvert: false,
        },
        { status: 429 }
      );
    }

    // Update or insert usage record
    if (existingUsage[0]) {
      // Update existing record
      await db
        .update(anonymousUsage)
        .set({
          conversionCount: currentCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(anonymousUsage.id, existingUsage[0].id));
    } else {
      // Insert new record
      await db.insert(anonymousUsage).values({
        ipAddress: ip,
        date: today,
        conversionCount: 1,
      });
    }

    const newCount = currentCount + 1;
    const remaining = Math.max(0, DAILY_LIMIT - newCount);

    return NextResponse.json({
      success: true,
      used: newCount,
      remaining,
      limit: DAILY_LIMIT,
      canConvert: newCount < DAILY_LIMIT,
    });
  } catch (error) {
    console.error("Error recording anonymous usage:", error);
    return NextResponse.json(
      { error: "Failed to record usage" },
      { status: 500 }
    );
  }
}
