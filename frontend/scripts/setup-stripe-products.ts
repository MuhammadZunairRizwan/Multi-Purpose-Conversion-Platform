import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

async function setupStripeProducts() {
  console.log("Setting up Stripe products for CalcnConvert...\n");

  try {
    // Create Starter product
    const starterProduct = await stripe.products.create({
      name: "CalcnConvert Starter",
      description: "7 conversions/day, 30MB file size, no watermarks, DOCX support",
    });
    console.log("Created Starter product:", starterProduct.id);

    // Create Starter price - $4.99/month
    const starterPrice = await stripe.prices.create({
      product: starterProduct.id,
      unit_amount: 499, // $4.99 in cents
      currency: "usd",
      recurring: {
        interval: "month",
      },
      lookup_key: "starter_monthly",
    });
    console.log("Created Starter price:", starterPrice.id);

    // Create Pro product
    const proProduct = await stripe.products.create({
      name: "CalcnConvert Pro",
      description: "Unlimited conversions, 100MB file size, batch processing, priority support",
    });
    console.log("Created Pro product:", proProduct.id);

    // Create Pro price - $9.99/month
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 999, // $9.99 in cents
      currency: "usd",
      recurring: {
        interval: "month",
      },
      lookup_key: "pro_monthly",
    });
    console.log("Created Pro price:", proPrice.id);

    console.log("\n=== SETUP COMPLETE ===");
    console.log("\nAdd these to your .env.local:");
    console.log(`STRIPE_STARTER_PRICE_ID=${starterPrice.id}`);
    console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID=${starterPrice.id}`);
    console.log(`NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${proPrice.id}`);

  } catch (error) {
    console.error("Error setting up Stripe products:", error);
  }
}

setupStripeProducts();
