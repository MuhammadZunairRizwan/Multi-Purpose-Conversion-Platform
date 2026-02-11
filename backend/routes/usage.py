from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter()

# Tier-based limits
TIER_LIMITS = {
    "FREE": {"conversions": 5, "file_size_mb": 15},
    "STARTER": {"conversions": 7, "file_size_mb": 30},
    "PRO": {"conversions": -1, "file_size_mb": 100},  # -1 = unlimited
}

class RecordUsageRequest(BaseModel):
    user_id: str
    conversion_type: str
    tier: Optional[str] = "FREE"

# In-memory usage tracking (in production, use a database)
# Format: {user_id: {date: {type: count}}}
usage_cache = {}

def get_tier_limits(tier: str) -> dict:
    """Get limits for a specific tier"""
    return TIER_LIMITS.get(tier.upper(), TIER_LIMITS["FREE"])

@router.get("/daily/{user_id}")
async def get_daily_usage(user_id: str, tier: Optional[str] = "FREE", authorization: Optional[str] = Header(None)):
    """
    Get daily usage for a user
    Returns: {conversions_count, conversions_limit}
    """
    try:
        today = datetime.now().date().isoformat()
        limits = get_tier_limits(tier)

        if user_id not in usage_cache:
            return {
                "conversions_count": 0,
                "conversions_limit": limits["conversions"],
                "file_size_limit_mb": limits["file_size_mb"],
                "tier": tier.upper(),
                "user_id": user_id,
                "date": today
            }

        if today not in usage_cache[user_id]:
            usage_cache[user_id][today] = {}

        conversions_count = sum(usage_cache[user_id][today].values())

        return {
            "conversions_count": conversions_count,
            "conversions_limit": limits["conversions"],
            "file_size_limit_mb": limits["file_size_mb"],
            "tier": tier.upper(),
            "user_id": user_id,
            "date": today
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/record")
async def record_usage(request: RecordUsageRequest, authorization: Optional[str] = Header(None)):
    """
    Record a conversion usage for a user
    """
    try:
        user_id = request.user_id
        conversion_type = request.conversion_type
        tier = request.tier or "FREE"
        today = datetime.now().date().isoformat()

        limits = get_tier_limits(tier)
        conversions_limit = limits["conversions"]

        # Initialize user data if not exists
        if user_id not in usage_cache:
            usage_cache[user_id] = {}

        if today not in usage_cache[user_id]:
            usage_cache[user_id][today] = {}

        # Initialize conversion type if not exists
        if conversion_type not in usage_cache[user_id][today]:
            usage_cache[user_id][today][conversion_type] = 0

        # Check limit before incrementing (skip for unlimited tier)
        conversions_count = sum(usage_cache[user_id][today].values())
        if conversions_limit != -1 and conversions_count >= conversions_limit:
            raise HTTPException(
                status_code=429,
                detail=f"Daily conversion limit reached for {tier.upper()} tier ({conversions_limit} conversions)"
            )

        # Increment count
        usage_cache[user_id][today][conversion_type] += 1

        return {
            "success": True,
            "user_id": user_id,
            "conversion_type": conversion_type,
            "tier": tier.upper(),
            "date": today,
            "total_conversions": conversions_count + 1
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}")
async def get_conversion_history(user_id: str, authorization: Optional[str] = Header(None)):
    """
    Get conversion history for a user (last 7 days)
    """
    try:
        history = []

        if user_id not in usage_cache:
            return {"user_id": user_id, "history": []}

        # Get last 7 days
        for i in range(7):
            date = (datetime.now().date() - timedelta(days=i)).isoformat()
            if date in usage_cache[user_id]:
                conversions_count = sum(usage_cache[user_id][date].values())
                history.append({
                    "date": date,
                    "total_conversions": conversions_count,
                    "details": usage_cache[user_id][date]
                })

        return {"user_id": user_id, "history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
