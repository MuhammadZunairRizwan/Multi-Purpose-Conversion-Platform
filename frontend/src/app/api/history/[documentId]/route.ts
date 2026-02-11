import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { documentHistory } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// DELETE - Remove specific document from history
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { documentId } = await params;
    const { searchParams } = new URL(request.url);
    const clerkId = searchParams.get("userId");

    if (!clerkId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!documentId) {
      return NextResponse.json(
        { error: "Document ID is required" },
        { status: 400 }
      );
    }

    await db
      .delete(documentHistory)
      .where(
        and(
          eq(documentHistory.clerkId, clerkId),
          eq(documentHistory.documentId, documentId)
        )
      );

    return NextResponse.json({
      success: true,
      message: "Document removed from history",
      user_id: clerkId,
    });
  } catch (error) {
    console.error("Error deleting document from history:", error);
    return NextResponse.json(
      { error: "Failed to delete document from history" },
      { status: 500 }
    );
  }
}
