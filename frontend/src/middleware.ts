import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/privacy",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/stripe/(.*)",
  "/api/user/(.*)",
  "/api/history(.*)",
  "/api/anonymous-usage(.*)",
  // Free converters - accessible without login
  "/dashboard/converters/currency",
  "/dashboard/converters/unit",
  "/dashboard/converters/file",
  // Free calculators - accessible without login (unlimited)
  "/dashboard/calculators/loan",
  "/dashboard/calculators/interest",
  "/dashboard/calculators/percentage",
  "/dashboard/calculators/date-difference",
  "/dashboard/calculators/unit-price",
  // Free document generators - accessible without login (with watermark)
  "/dashboard/documents/invoice",
  "/dashboard/documents/receipt",
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
