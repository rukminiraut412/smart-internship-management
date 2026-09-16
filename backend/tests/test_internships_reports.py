"""Tests for Internship and Weekly Progress Report APIs."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Application, Company, Internship, Mentor, ProgressReport, Student, User

# In-memory database with StaticPool for test isolation
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def setup_test_db():
    """Create all tables before each test and drop them afterward."""
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


# ============================================================================
# PART 1: INTERNSHIP TESTS
# ============================================================================

def test_create_internship_success():
    """Verify creating a new internship with a valid company."""
    db = TestingSessionLocal()
    company = Company(name="CloudScale Distributed Systems", industry="Cloud")
    db.add(company)
    db.commit()
    company_id = company.id
    db.close()

    payload = {
        "company_id": company_id,
        "title": "Backend Engineering Intern",
        "domain": "Cloud & Distributed Systems",
        "mode": "Hybrid",
        "status": "Open",
        "stipend": "$1,800 / month",
        "location": "Seattle, WA / Remote",
        "description": "Build high-throughput ingestion pipelines.",
    }
    response = client.post("/api/internships", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["title"] == "Backend Engineering Intern"
    assert data["company_id"] == company_id
    assert data["company_name"] == "CloudScale Distributed Systems"
    assert data["mode"] == "Hybrid"
    assert "id" in data


def test_create_internship_company_not_found():
    """Verify creating an internship with an invalid company returns 404."""
    payload = {
        "company_id": "nonexistent-company-id",
        "title": "Software Intern",
    }
    response = client.post("/api/internships", json=payload)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_get_internship_by_id_success():
    """Verify retrieving specific internship details."""
    db = TestingSessionLocal()
    company = Company(name="Tech Corp")
    db.add(company)
    db.commit()

    internship = Internship(
        company_id=company.id,
        title="Frontend Intern",
        domain="Frontend",
    )
    db.add(internship)
    db.commit()
    internship_id = internship.id
    db.close()

    response = client.get(f"/api/internships/{internship_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == internship_id
    assert data["title"] == "Frontend Intern"
    assert data["company_name"] == "Tech Corp"


def test_get_internship_not_found():
    """Verify retrieving a nonexistent internship returns 404."""
    response = client.get("/api/internships/unknown-id")
    assert response.status_code == 404


def test_list_internships():
    """Verify listing internships with optional filters."""
    db = TestingSessionLocal()
    company = Company(name="Acme Inc")
    db.add(company)
    db.commit()

    i1 = Internship(company_id=company.id, title="Backend Intern", domain="Cloud", status="Open")
    i2 = Internship(company_id=company.id, title="ML Intern", domain="AI", status="Closed")
    db.add_all([i1, i2])
    db.commit()
    db.close()

    # List all
    resp = client.get("/api/internships")
    assert resp.status_code == 200
    assert len(resp.json()) == 2

    # Filter by domain
    resp_filtered = client.get("/api/internships?domain=Cloud")
    assert resp_filtered.status_code == 200
    assert len(resp_filtered.json()) == 1
    assert resp_filtered.json()[0]["title"] == "Backend Intern"


def test_get_student_internships():
    """Verify retrieving internships associated with a student via Application."""
    db = TestingSessionLocal()
    user = User(email="alex@univ.edu", hashed_password="pw", full_name="Alex", role="student")
    company = Company(name="BigTech")
    db.add_all([user, company])
    db.commit()

    student = Student(user_id=user.id, student_id_number="STU-001")
    internship = Internship(company_id=company.id, title="Systems Intern")
    db.add_all([student, internship])
    db.commit()

    # Create application
    application = Application(
        student_id=student.id,
        internship_id=internship.id,
        status="Approved",
    )
    db.add(application)
    db.commit()

    student_id = student.id
    db.close()

    response = client.get(f"/api/students/{student_id}/internships")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 1
    assert items[0]["application_status"] == "Approved"
    assert items[0]["internship"]["title"] == "Systems Intern"
    assert items[0]["internship"]["company_name"] == "BigTech"


def test_get_student_internships_student_not_found():
    """Verify querying internships for an invalid student returns 404."""
    response = client.get("/api/students/nonexistent-student-id/internships")
    assert response.status_code == 404


# ============================================================================
# PART 2: WEEKLY PROGRESS REPORT TESTS
# ============================================================================

def test_create_progress_report_success():
    """Verify successful submission of a weekly progress report."""
    db = TestingSessionLocal()
    user = User(email="intern@test.com", hashed_password="pw", full_name="Intern", role="student")
    company = Company(name="CodeBase Inc")
    db.add_all([user, company])
    db.commit()

    student = Student(user_id=user.id, student_id_number="STU-2026")
    internship = Internship(company_id=company.id, title="API Developer")
    db.add_all([student, internship])
    db.commit()

    student_id = student.id
    internship_id = internship.id
    db.close()

    payload = {
        "student_id": student_id,
        "week_number": 1,
        "title": "Sprint 1: Schema Setup",
        "summary": "Completed database schema and registered initial endpoints.",
        "hours_logged": 21.5,
        "status": "Approved",
        "mentor_score": 4.8,
        "mentor_feedback": "Excellent velocity and clean architecture.",
    }
    response = client.post(f"/api/internships/{internship_id}/reports", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["internship_id"] == internship_id
    assert data["student_id"] == student_id
    assert data["week_number"] == 1
    assert data["hours_logged"] == 21.5
    assert data["mentor_score"] == 4.8
    assert "id" in data


def test_create_progress_report_internship_not_found():
    """Verify submitting a report for nonexistent internship returns 404."""
    db = TestingSessionLocal()
    user = User(email="intern2@test.com", hashed_password="pw", full_name="Intern2", role="student")
    db.add(user)
    db.commit()
    student = Student(user_id=user.id)
    db.add(student)
    db.commit()
    student_id = student.id
    db.close()

    payload = {
        "student_id": student_id,
        "week_number": 1,
    }
    response = client.post("/api/internships/bogus-internship-id/reports", json=payload)
    assert response.status_code == 404


def test_create_progress_report_student_not_found():
    """Verify submitting a report with nonexistent student returns 404."""
    db = TestingSessionLocal()
    company = Company(name="Devs Co")
    db.add(company)
    db.commit()
    internship = Internship(company_id=company.id, title="Dev Intern")
    db.add(internship)
    db.commit()
    internship_id = internship.id
    db.close()

    payload = {
        "student_id": "nonexistent-student-id",
        "week_number": 1,
    }
    response = client.post(f"/api/internships/{internship_id}/reports", json=payload)
    assert response.status_code == 404


def test_create_progress_report_duplicate_week_fails():
    """Verify submitting duplicate report for the same student + internship + week returns 400."""
    db = TestingSessionLocal()
    user = User(email="intern3@test.com", hashed_password="pw", full_name="Intern3", role="student")
    company = Company(name="Devs Co")
    db.add_all([user, company])
    db.commit()

    student = Student(user_id=user.id)
    internship = Internship(company_id=company.id, title="Dev Intern")
    db.add_all([student, internship])
    db.commit()

    student_id = student.id
    internship_id = internship.id
    db.close()

    payload = {
        "student_id": student_id,
        "week_number": 2,
        "hours_logged": 20.0,
    }
    resp1 = client.post(f"/api/internships/{internship_id}/reports", json=payload)
    assert resp1.status_code == 201

    # Attempt second report for week 2
    resp2 = client.post(f"/api/internships/{internship_id}/reports", json=payload)
    assert resp2.status_code == 400
    assert "already exists" in resp2.json()["detail"]


def test_create_progress_report_invalid_week_number():
    """Verify submitting a report with week_number < 1 fails validation (422)."""
    payload = {
        "student_id": "some-id",
        "week_number": 0,
    }
    response = client.post("/api/internships/some-internship/reports", json=payload)
    assert response.status_code == 422


def test_list_internship_reports():
    """Verify retrieving reports for an internship, with optional student filtering."""
    db = TestingSessionLocal()
    user1 = User(email="intern_a@test.com", hashed_password="pw", full_name="Intern A", role="student")
    user2 = User(email="intern_b@test.com", hashed_password="pw", full_name="Intern B", role="student")
    company = Company(name="Global Corp")
    db.add_all([user1, user2, company])
    db.commit()

    student1 = Student(user_id=user1.id)
    student2 = Student(user_id=user2.id)
    internship = Internship(company_id=company.id, title="Fullstack Intern")
    db.add_all([student1, student2, internship])
    db.commit()

    r1 = ProgressReport(internship_id=internship.id, student_id=student1.id, week_number=1, hours_logged=15.0)
    r2 = ProgressReport(internship_id=internship.id, student_id=student1.id, week_number=2, hours_logged=18.0)
    r3 = ProgressReport(internship_id=internship.id, student_id=student2.id, week_number=1, hours_logged=20.0)
    db.add_all([r1, r2, r3])
    db.commit()

    internship_id = internship.id
    student1_id = student1.id
    db.close()

    # List all for this internship
    resp = client.get(f"/api/internships/{internship_id}/reports")
    assert resp.status_code == 200
    assert len(resp.json()) == 3

    # Filter by student1
    resp_student1 = client.get(f"/api/internships/{internship_id}/reports?student_id={student1_id}")
    assert resp_student1.status_code == 200
    assert len(resp_student1.json()) == 2
