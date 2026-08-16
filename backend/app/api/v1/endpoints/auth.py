from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/me")
def get_authenticated_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {"user_id": current_user.get("sub"), "email": current_user.get("email")}
