"""Tests for Intelligence API endpoints (skill gap and progress attention)."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Company, Internship, ProgressReport, Student, Task, User

# Isolated in-memory database
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def setup_test_db():
    """Create all tables before each test and clean up afterward."""
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)


client = TestClient(app)


def test_evaluate_skill_gap_direct():
    """Verify POST /api/intelligence/skill-gap returns deterministic matching."""
    payload = {
        "student_skills": ["Python", "SQL", "Excel"],
        "required_skills": ["Python", "SQL", "Power BI", "Tableau"],
    }
    response = client.post("/api/intelligence/skill-gap", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["match_percentage"] == 50
    assert data["matched_skills"] == ["Python", "SQL"]
    assert data["missing_skills"] == ["Power BI", "Tableau"]
    assert "Consider improving Power BI and Tableau skills." in data["recommendation"]


def test_evaluate_attention_on_track():
    """Verify POST /api/intelligence/evaluate-attention for high metrics returns ON_TRACK."""
    payload = {
        "progress_consistency": 90.0,
        "task_completion": 90.0,
        "report_submission": 100.0,
        "mentor_feedback": 90.0,
    }
    response = client.post("/api/intelligence/evaluate-attention", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "ON_TRACK"
    assert data["score"] >= 75
    assert len(data["reasons"]) > 0
    assert len(data["recommendations"]) > 0


def test_evaluate_attention_needs_attention():
    """Verify POST /api/intelligence/evaluate-attention for low metrics returns NEEDS_ATTENTION."""
    payload = {
        "progress_consistency": 30.0,
        "task_completion": 25.0,
        "report_submission": 30.0,
        "mentor_feedback": 30.0,
    }
    response = client.post("/api/intelligence/evaluate-attention", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "NEEDS_ATTENTION"
    assert data["score"] < 50
    assert any("Task completion is below" in r for r in data["reasons"])
    assert any("Complete pending tasks." in r for r in data["recommendations"])


def test_get_student_attention_status_from_db():
    """Verify GET /api/intelligence/attention-status/{student_id} evaluates real DB records."""
    db = TestingSessionLocal()
    user = User(email="alex@univ.edu", hashed_password="pw", full_name="Alex", role="student")
    company = Company(name="Tech Corp")
    db.add_all([user, company])
    db.commit()

    student = Student(user_id=user.id, student_id_number="STU-001")
    internship = Internship(company_id=company.id, title="Backend Intern")
    db.add_all([student, internship])
    db.commit()

    # Add 4 reports
    for w in range(1, 5):
        rep = ProgressReport(
            student_id=student.id,
            internship_id=internship.id,
            week_number=w,
            hours_logged=20.0,
            status="Approved",
            mentor_score=4.8,
        )
        db.add(rep)

    # Add 3 tasks
    for t_idx in range(1, 4):
        task = Task(
            internship_id=internship.id,
            student_id=student.id,
            title=f"Task {t_idx}",
            status="Completed",
        )
        db.add(task)

    db.commit()
    student_id = student.id
    db.close()

    response = client.get(f"/api/intelligence/attention-status/{student_id}")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] in ["ON_TRACK", "MONITOR", "NEEDS_ATTENTION"]
    assert "score" in data
    assert "reasons" in data
    assert "recommendations" in data


def test_get_internship_skill_gap_from_db():
    """Verify GET /api/intelligence/skill-gap/{internship_id} evaluates DB internship."""
    db = TestingSessionLocal()
    company = Company(name="Cloud Inc")
    db.add(company)
    db.commit()

    internship = Internship(
        company_id=company.id,
        title="Cloud Intern",
        domain="Cloud & Distributed Systems",
    )
    db.add(internship)
    db.commit()
    internship_id = internship.id
    db.close()

    response = client.get(f"/api/intelligence/skill-gap/{internship_id}")
    assert response.status_code == 200
    data = response.json()

    assert "match_percentage" in data
    assert "matched_skills" in data
    assert "missing_skills" in data
    assert "recommendation" in data
