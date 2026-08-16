from fastapi import APIRouter
from app.api.v1.endpoints import users, health_records

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(health_records.router, prefix="/health/records", tags=["Health Records"])
