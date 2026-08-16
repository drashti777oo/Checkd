from fastapi import APIRouter, Depends
from typing import Dict, Any
from app.api.deps import get_current_user

router = APIRouter()


@router.get("/profile")
def get_user_details(current_user: Dict[str, Any] = Depends(get_current_user)):
    return {"user": current_user}
