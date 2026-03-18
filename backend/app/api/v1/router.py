"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.v1 import services, content

api_router = APIRouter()

api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
