from fastapi import APIRouter
from app.api.v1.endpoints import users, health_records, ml_analysis, llm_explanation

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(health_records.router, prefix="/health/records", tags=["Health Records"])
api_router.include_router(ml_analysis.router, prefix="/analysis", tags=["ML Analysis"])
api_router.include_router(llm_explanation.router, prefix="/explain", tags=["LLM Explanation"])
