import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documentHistory } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const HISTORY_LIMITS: Record<string, number> = {
  FREE: 0,
  STARTER: 1,
  PRO: 5,
};

function getHistoryLimit(tier: string): number {
  return HISTORY_LIMITS[tier.toUpperCase()] || 0;
}

// GET - Retrieve document history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("userId");
    const tier = searchParams.get("tier") || "FREE";

    if (!clerkId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const limit = getHistoryLimit(tier);

    if (limit === 0) {
      return NextResponse.json({
        user_id: clerkId,
        tier: tier.toUpperCase(),
        history_limit: 0,
        history: [],
        message: "Upgrade to Starter or Pro for document history",
      });
    }

    const history = await db
      .select({
        document_type: documentHistory.documentType,
        document_id: documentHistory.documentId,
        document_name: documentHistory.documentName,
        created_at: documentHistory.createdAt,
      })
      .from(documentHistory)
      .where(eq(documentHistory.clerkId, clerkId))
      .orderBy(desc(documentHistory.createdAt))
      .limit(limit);

    const formattedHistory = history.map((item) => ({
      document_type: item.document_type,
      document_id: item.document_id,
      document_name: item.document_name,
      created_at: item.created_at.toISOString(),
      tier: tier.toUpperCase(),
    }));

    return NextResponse.json({
      user_id: clerkId,
      tier: tier.toUpperCase(),
      history_limit: limit,
      history_count: formattedHistory.length,
      history: formattedHistory,
    });
  } catch (error) {
    console.error("Error fetching document history:", error);
    return NextResponse.json(
      { error: "Failed to fetch document history" },
      { status: 500 }
    );
  }
}

// POST - Add document to history
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, document_type, document_id, document_name, tier } = body;

    if (!user_id || !document_type || !document_id || !document_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const userTier = (tier || "FREE").toUpperCase();
    const limit = getHistoryLimit(userTier);

    if (limit === 0) {
      return NextResponse.json({
        success: false,
        message: "Document history not available for FREE tier",
        tier: userTier,
      });
    }

    // Insert new document
    await db.insert(documentHistory).values({
      clerkId: user_id,
      documentType: document_type.toLowerCase(),
      documentId: document_id,
      documentName: document_name,
      tier: userTier,
    });

    // Get current count
    const allDocs = await db
      .select({ id: documentHistory.id, createdAt: documentHistory.createdAt })
      .from(documentHistory)
      .where(eq(documentHistory.clerkId, user_id))
      .orderBy(desc(documentHistory.createdAt));

    // If over limit, delete oldest documents
    if (allDocs.length > limit) {
      const docsToDelete = allDocs.slice(limit);
      for (const doc of docsToDelete) {
        await db.delete(documentHistory).where(eq(documentHistory.id, doc.id));
      }
    }

    return NextResponse.json({
      success: true,
      message: "Document added to history",
      user_id: user_id,
      history_count: Math.min(allDocs.length, limit),
      history_limit: limit,
    });
  } catch (error) {
    console.error("Error adding document to history:", error);
    return NextResponse.json(
      { error: "Failed to add document to history" },
      { status: 500 }
    );
  }
}

// DELETE - Clear all history for a user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("userId");

    if (!clerkId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await db.delete(documentHistory).where(eq(documentHistory.clerkId, clerkId));

    return NextResponse.json({
      success: true,
      message: "History cleared",
      user_id: clerkId,
    });
  } catch (error) {
    console.error("Error clearing history:", error);
    return NextResponse.json(
      { error: "Failed to clear history" },
      { status: 500 }
    );
  }
}
