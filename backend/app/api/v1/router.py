from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, health_data, ml_analysis, llm_explain

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(health_data.router, prefix="/health", tags=["Health Records"])
api_router.include_router(ml_analysis.router, prefix="/analysis", tags=["ML Analysis"])
api_router.include_router(llm_explain.router, prefix="/explain", tags=["AI Explanation"])
