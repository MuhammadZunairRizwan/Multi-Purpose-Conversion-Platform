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

    // Get recent checkout sessions for this user
    const sessions = await stripe.checkout.sessions.list({
      limit: 5,
    });

    // Find the most recent completed session for this user
    const userSession = sessions.data.find(
      (session) =>
        session.metadata?.userId === userId &&
        session.status === "complete" &&
        session.payment_status === "paid"
    );

    if (!userSession) {
      return NextResponse.json({
        success: false,
        message: "No completed session found",
      });
    }

    const customerId = userSession.customer as string;
    const subscriptionId = userSession.subscription as string;

    if (!subscriptionId) {
      return NextResponse.json({
        success: false,
        message: "No subscription found",
      });
    }

    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;

    // Determine tier based on price ID
    // Starter: price_1SgMp2Q5lyGIw2nIY51CnCql
    // Pro: price_1SgMBjQ5lyGIw2nIgQ6Ife0A
    let tier: "FREE" | "STARTER" | "PRO" = "STARTER";
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID || "price_1SgMBjQ5lyGIw2nIgQ6Ife0A";
    if (priceId === proPriceId) {
      tier = "PRO";
    }

    // Check if user exists in database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);

    if (existingUser.length === 0) {
      // Create user if doesn't exist
      await db.insert(users).values({
        clerkId: userId,
        email: userSession.customer_email || "",
        tier: tier,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscriptionId,
      });
    } else {
      // Update existing user
      await db
        .update(users)
        .set({
          tier: tier,
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscriptionId,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkId, userId));
    }

    console.log(`User ${userId} upgraded to ${tier}`);

    return NextResponse.json({
      success: true,
      tier: tier,
      message: `Successfully upgraded to ${tier}`,
    });
  } catch (error: any) {
    console.error("Verify session error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}
