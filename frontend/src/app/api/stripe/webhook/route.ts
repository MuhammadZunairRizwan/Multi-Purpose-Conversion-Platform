import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    console.log("Stripe webhook event:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const customerEmail = session.customer_email || session.customer_details?.email;

        if (userId) {
          // Get subscription details to determine tier
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;

          // Determine tier based on price ID
          // Starter: price_1SgMp2Q5lyGIw2nIY51CnCql
          // Pro: price_1SgMBjQ5lyGIw2nIgQ6Ife0A
          let tier: "FREE" | "STARTER" | "PRO" = "STARTER";
          if (priceId === "price_1SgMBjQ5lyGIw2nIgQ6Ife0A") {
            tier = "PRO";
          } else if (priceId === "price_1SgMp2Q5lyGIw2nIY51CnCql") {
            tier = "STARTER";
          }

          // Check if user exists
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, userId))
            .limit(1);

          if (existingUser.length === 0) {
            // Create user if doesn't exist
            await db.insert(users).values({
              clerkId: userId,
              email: customerEmail || "unknown@example.com",
              tier: tier,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
            });
            console.log(`User ${userId} created with tier ${tier}`);
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
            console.log(`User ${userId} upgraded to ${tier}`);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          const status = subscription.status;
          const priceId = subscription.items.data[0]?.price.id;

          // Starter: price_1SgMp2Q5lyGIw2nIY51CnCql
          // Pro: price_1SgMBjQ5lyGIw2nIgQ6Ife0A
          let tier: "FREE" | "STARTER" | "PRO" = "STARTER";
          if (priceId === "price_1SgMBjQ5lyGIw2nIgQ6Ife0A") {
            tier = "PRO";
          } else if (priceId === "price_1SgMp2Q5lyGIw2nIY51CnCql") {
            tier = "STARTER";
          }

          // If subscription is not active, downgrade to free
          if (status !== "active" && status !== "trialing") {
            tier = "FREE";
          }

          await db
            .update(users)
            .set({
              tier: tier,
              updatedAt: new Date(),
            })
            .where(eq(users.clerkId, userId));

          console.log(`User ${userId} subscription updated to ${tier}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          // Downgrade to free tier
          await db
            .update(users)
            .set({
              tier: "FREE",
              stripeSubscriptionId: null,
              updatedAt: new Date(),
            })
            .where(eq(users.clerkId, userId));

          console.log(`User ${userId} subscription canceled, downgraded to FREE`);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as any).subscription as string | null;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;

          if (userId) {
            console.log(`Payment failed for user ${userId}`);
            // Optionally send notification email here
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
