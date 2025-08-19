from fastapi import Depends, HTTPException, status, Request
from typing import Dict, Any
from app.core.supabase_auth import supabase_auth


async def get_current_user(request: Request) -> Dict[str, Any]:
    """Validate Supabase access token from Authorization header and return user info.

    Uses the existing Supabase client wrapper in app.core.supabase_auth to
    validate and fetch the user corresponding to the access token. Returns the
    user object (as dict) extracted from Supabase.
    """
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth_header or not auth_header.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Empty token")

    try:
        # Use the Supabase helper to get user from access token
        user = await supabase_auth.get_user(token)
        # Ensure 'id' key exists for downstream code
        if "id" not in user:
            if "user_id" in user:
                user["id"] = user["user_id"]
            elif "sub" in user:
                user["id"] = user["sub"]
            elif "uuid" in user:
                user["id"] = user["uuid"]
            else:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User ID not found in token")
        return user
    except HTTPException:
        # propagate known HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
