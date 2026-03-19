"""API dependencies."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config.settings import settings

security = HTTPBearer(auto_error=False)


async def verify_dashboard_token(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> None:
    """Verify the dashboard access token.

    If no token is configured (empty string), access is allowed (dev mode).
    """
    if not settings.dashboard_token:
        return
    if not credentials or credentials.credentials != settings.dashboard_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing dashboard access token",
        )
