import uuid
import logging
import jwt
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.services import user_service

logger = logging.getLogger(__name__)

security_scheme = HTTPBearer(auto_error=False)
_jwks_client: Optional[jwt.PyJWKClient] = None


def get_jwks_client() -> Optional[jwt.PyJWKClient]:
    global _jwks_client
    if _jwks_client is None:
        jwks_url = settings.SUPABASE_JWKS_URL
        if not jwks_url and settings.SUPABASE_URL:
            jwks_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
        if jwks_url and not jwks_url.startswith("https://your-project.supabase.co"):
            try:
                _jwks_client = jwt.PyJWKClient(jwks_url)
            except Exception as err:
                logger.warning(f"Could not initialize PyJWKClient: {err}")
    return _jwks_client


def verify_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Cryptographically verifies Supabase access token signature, issuer, audience, and expiration.
    Supports asymmetric JWKS (RS256/ES256) and legacy symmetric secret (HS256).
    """
    expected_issuer = settings.SUPABASE_JWT_ISSUER or (
        f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"
        if settings.SUPABASE_URL and not settings.SUPABASE_URL.startswith("https://your-project.supabase.co")
        else None
    )

    # 1. Attempt JWKS asymmetric signature verification if configured
    jwks_client = get_jwks_client()
    if jwks_client:
        try:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256", "ES256", "HS256"],
                audience="authenticated",
                issuer=expected_issuer,
                options={"verify_aud": True, "verify_iss": bool(expected_issuer)},
            )
            return payload
        except jwt.PyJWTError as e:
            logger.debug(f"JWKS verification failed: {e}")
        except Exception as e:
            logger.debug(f"JWKS client error: {e}")

    # 2. Attempt symmetric secret (HS256) verification if SUPABASE_JWT_SECRET is configured
    if settings.SUPABASE_JWT_SECRET and settings.SUPABASE_JWT_SECRET != "your_supabase_jwt_secret_key":
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256", "RS256"],
                audience="authenticated",
                issuer=expected_issuer,
                options={"verify_aud": True, "verify_iss": bool(expected_issuer)},
            )
            return payload
        except jwt.PyJWTError as e:
            logger.debug(f"Symmetric JWT verification failed: {e}")

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    FastAPI dependency that enforces HTTP Bearer JWT authentication,
    verifies Supabase tokens, provisions application User records, and validates account activity status.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed Bearer token format",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = verify_supabase_jwt(token)

    # Validate sub claim exists and is valid UUID
    sub_str = payload.get("sub")
    if not sub_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims: missing sub identifier",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        supabase_user_id = uuid.UUID(sub_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user identity format in token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user attributes from verified claims
    email = payload.get("email") or payload.get("user_metadata", {}).get("email")
    if not email:
        email = f"{supabase_user_id}@auth.supabase.local"

    full_name = payload.get("user_metadata", {}).get("full_name")

    # Retrieve or auto-provision application User
    user = user_service.get_or_create_user_from_supabase_identity(
        db=db,
        supabase_id=supabase_user_id,
        email=email,
        full_name=full_name,
    )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated",
        )

    return user
