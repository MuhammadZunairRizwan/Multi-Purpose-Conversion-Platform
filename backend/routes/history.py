from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from collections import defaultdict

router = APIRouter()

# Tier-based document history limits
HISTORY_LIMITS = {
    "FREE": 0,      # No history for free tier
    "STARTER": 1,   # Last 1 document
    "PRO": 5,       # Last 5 documents
}

class DocumentHistoryItem(BaseModel):
    document_type: str  # 'invoice', 'receipt', 'nda', 'employment_letter'
    document_id: str    # e.g., invoice number, receipt number
    document_name: str  # Display name
    created_at: str
    tier: str

class AddHistoryRequest(BaseModel):
    user_id: str
    document_type: str
    document_id: str
    document_name: str
    tier: Optional[str] = "FREE"

# In-memory document history storage (in production, use a database)
# Format: {user_id: [DocumentHistoryItem, ...]}
document_history_cache: dict = defaultdict(list)


def get_history_limit(tier: str) -> int:
    """Get document history limit for a specific tier"""
    return HISTORY_LIMITS.get(tier.upper(), 0)


@router.post("/add")
async def add_document_to_history(request: AddHistoryRequest, authorization: Optional[str] = Header(None)):
    """
    Add a document to user's history (Starter and Pro only)
    """
    try:
        tier = request.tier.upper() if request.tier else "FREE"
        limit = get_history_limit(tier)

        # Free tier doesn't get history
        if limit == 0:
            return {
                "success": False,
                "message": "Document history not available for FREE tier",
                "tier": tier
            }

        # Create history item
        history_item = {
            "document_type": request.document_type,
            "document_id": request.document_id,
            "document_name": request.document_name,
            "created_at": datetime.now().isoformat(),
            "tier": tier
        }

        # Add to beginning of list (most recent first)
        document_history_cache[request.user_id].insert(0, history_item)

        # Trim to limit
        if len(document_history_cache[request.user_id]) > limit:
            document_history_cache[request.user_id] = document_history_cache[request.user_id][:limit]

        return {
            "success": True,
            "message": "Document added to history",
            "user_id": request.user_id,
            "history_count": len(document_history_cache[request.user_id]),
            "history_limit": limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{user_id}")
async def get_document_history(
    user_id: str,
    tier: Optional[str] = "FREE",
    authorization: Optional[str] = Header(None)
):
    """
    Get document history for a user
    Returns documents based on tier limit (Starter: 1, Pro: 5)
    """
    try:
        tier = tier.upper() if tier else "FREE"
        limit = get_history_limit(tier)

        # Free tier doesn't get history
        if limit == 0:
            return {
                "user_id": user_id,
                "tier": tier,
                "history_limit": 0,
                "history": [],
                "message": "Upgrade to Starter or Pro for document history"
            }

        # Get user's history (already limited when added)
        history = document_history_cache.get(user_id, [])[:limit]

        return {
            "user_id": user_id,
            "tier": tier,
            "history_limit": limit,
            "history_count": len(history),
            "history": history
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}/{document_id}")
async def delete_from_history(
    user_id: str,
    document_id: str,
    authorization: Optional[str] = Header(None)
):
    """
    Delete a specific document from user's history
    """
    try:
        if user_id not in document_history_cache:
            raise HTTPException(status_code=404, detail="User history not found")

        original_count = len(document_history_cache[user_id])
        document_history_cache[user_id] = [
            item for item in document_history_cache[user_id]
            if item.get("document_id") != document_id
        ]

        if len(document_history_cache[user_id]) == original_count:
            raise HTTPException(status_code=404, detail="Document not found in history")

        return {
            "success": True,
            "message": "Document removed from history",
            "user_id": user_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{user_id}")
async def clear_history(user_id: str, authorization: Optional[str] = Header(None)):
    """
    Clear all document history for a user
    """
    try:
        if user_id in document_history_cache:
            document_history_cache[user_id] = []

        return {
            "success": True,
            "message": "History cleared",
            "user_id": user_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
