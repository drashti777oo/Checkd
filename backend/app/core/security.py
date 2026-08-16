import jwt
from typing import Optional, Dict, Any
from app.core.config import settings


def verify_supabase_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates Supabase JWT bearer token."""
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload
    except jwt.PyJWTError:
        return None
