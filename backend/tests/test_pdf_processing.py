import uuid
import time
import jwt
import io
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models.base import Base
from app.core.config import settings
from app.core.database import get_db
from app.utils.pdf_extractor import extract_text_from_pdf_bytes
from app.services.pdf_parser_service import parse_health_metrics_from_text
import pypdf

TEST_JWT_SECRET = "test_secret_key_for_jwt_verification_32bytes_long_secret!"


@pytest.fixture(autouse=True)
def setup_test_auth_env(monkeypatch):
    monkeypatch.setattr(settings, "SUPABASE_JWT_SECRET", TEST_JWT_SECRET)
    monkeypatch.setattr(settings, "SUPABASE_JWT_ISSUER", "https://test.supabase.co/auth/v1")
    monkeypatch.setattr(settings, "SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setattr(settings, "SUPABASE_JWKS_URL", None)


@pytest.fixture
def db_session():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=False,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield session
    app.dependency_overrides.clear()
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db_session):
    return TestClient(app)


def create_token(user_id: str, email: str = "pdfuser@example.com") -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "aud": "authenticated",
        "iss": "https://test.supabase.co/auth/v1",
        "exp": int(time.time()) + 3600,
    }
    return jwt.encode(payload, TEST_JWT_SECRET, algorithm="HS256")


def create_dummy_pdf_bytes(text_content: str = "Blood Glucose: 95 mg/dL\nHeart Rate: 72 bpm\nTotal Cholesterol: 180 mg/dL") -> bytes:
    writer = pypdf.PdfWriter()
    page = writer.add_blank_page(width=612, height=792)
    # pypdf blank page text fallback test
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def test_pdf_metric_parser_logic():
    sample_text = """
    LABORATORY HEALTH REPORT
    Date: 2026-08-16
    Heart Rate: 75 bpm
    Blood Pressure: 118/78 mmHg
    Fasting Blood Glucose: 92 mg/dL
    HbA1c: 5.2%
    Total Cholesterol: 185 mg/dL
    HDL Cholesterol: 55 mg/dL
    LDL Cholesterol: 98 mg/dL
    Triglycerides: 110 mg/dL
    Hemoglobin: 14.5 g/dL
    BMI: 22.4 kg/m²
    """
    result = parse_health_metrics_from_text(sample_text)
    assert result["extracted_count"] >= 8
    keys = [m["key"] for m in result["metrics"]]
    assert "heart_rate" in keys
    assert "blood_pressure" in keys
    assert "glucose" in keys
    assert "hba1c" in keys
    assert "total_cholesterol" in keys


def test_pdf_upload_non_pdf_rejection(client):
    user_id = str(uuid.uuid4())
    token = create_token(user_id)

    files = {"file": ("report.txt", b"plain text content", "text/plain")}
    res = client.post(
        "/api/v1/health/records/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
    )
    assert res.status_code == 422


def test_pdf_upload_and_health_record_creation(client):
    user_id = str(uuid.uuid4())
    token = create_token(user_id)

    pdf_bytes = create_dummy_pdf_bytes("Blood Glucose: 90 mg/dL")
    files = {"file": ("health_report.pdf", pdf_bytes, "application/pdf")}
    data = {"symptoms": "Feeling great, routine checkup"}

    res = client.post(
        "/api/v1/health/records/upload",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=data,
    )
    assert res.status_code == 201
    res_data = res.json()

    assert res_data["record_type"] == "pdf_report"
    assert res_data["data"]["report_filename"] == "health_report.pdf"
    assert res_data["data"]["symptoms"] == "Feeling great, routine checkup"
