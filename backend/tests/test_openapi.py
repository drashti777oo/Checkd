import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings


@pytest.fixture
def client():
    return TestClient(app)


def test_openapi_schema_endpoint(client):
    """Verifies that GET /api/v1/openapi.json returns valid OpenAPI 3.x schema JSON."""
    openapi_url = app.openapi_url or f"{settings.API_V1_PREFIX}/openapi.json"
    response = client.get(openapi_url)
    assert response.status_code == 200
    schema = response.json()

    assert "openapi" in schema
    assert "paths" in schema
    assert "components" in schema
    assert schema["info"]["title"] == settings.APP_NAME


def test_openapi_security_scheme_defined(client):
    """Verifies HTTPBearer security scheme is defined for JWT authentication."""
    openapi_url = app.openapi_url or f"{settings.API_V1_PREFIX}/openapi.json"
    response = client.get(openapi_url)
    schema = response.json()
    security_schemes = schema["components"].get("securitySchemes", {})

    assert "HTTPBearer" in security_schemes
    assert security_schemes["HTTPBearer"]["type"] == "http"
    assert security_schemes["HTTPBearer"]["scheme"] == "bearer"


def test_openapi_all_routes_registered(client):
    """Verifies all application REST routes are registered in OpenAPI schema."""
    openapi_url = app.openapi_url or f"{settings.API_V1_PREFIX}/openapi.json"
    response = client.get(openapi_url)
    paths = response.json()["paths"]

    expected_routes = [
        "/health",
        "/api/v1/users/me",
        "/api/v1/health/records",
        "/api/v1/health/records/{record_id}",
        "/api/v1/analysis/assess",
        "/api/v1/analysis",
        "/api/v1/analysis/{analysis_id}",
        "/api/v1/explain/generate",
        "/api/v1/explain/{explanation_id}",
        "/api/v1/recommendations/generate",
        "/api/v1/recommendations",
        "/api/v1/recommendations/{recommendation_id}",
    ]

    for route in expected_routes:
        assert route in paths, f"Route {route} missing from OpenAPI schema!"


def test_swagger_ui_endpoint(client):
    """Verifies that GET /docs loads Swagger UI page successfully."""
    response = client.get("/docs")
    assert response.status_code == 200
    assert "swagger-ui" in response.text.lower()
