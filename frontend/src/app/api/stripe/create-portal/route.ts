import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's Stripe customer ID from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (!user[0]?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No subscription found" },
        { status: 400 }
      );
    }

    // Create billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user[0].stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Portal error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create portal session" },
      { status: 500 }
    );
  }
}
