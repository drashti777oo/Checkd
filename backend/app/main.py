from fastapi import FastAPI
from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
def read_root():
    return {"message": f"Welcome to {settings.APP_NAME}"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
