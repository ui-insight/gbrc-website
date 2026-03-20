"""API v1 router aggregation."""

from fastapi import APIRouter

from app.api.v1 import services, content, dashboard, intake, chat

api_router = APIRouter()

api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(content.router, prefix="/content", tags=["content"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(intake.router, prefix="/intake", tags=["intake"])
api_router.include_router(chat.router, prefix="/intake", tags=["chat"])
