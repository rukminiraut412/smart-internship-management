"""Unit and integration tests for student internship registration endpoint."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Application, Company, Internship, InternshipSkill, Skill, Student, User
from app.security import create_access_token, hash_password

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


import uuid


def create_test_student(email: str = "alex.rivera@university.edu", name: str = "Alex Rivera"):
    """Helper to create a student user and student record."""
    db = TestingSessionLocal()
    user = User(
        email=email,
        hashed_password=hash_password("Password123!"),
        full_name=name,
        role="student",
        is_active=True,
    )
    db.add(user)
    db.flush()

    student = Student(
        user_id=user.id,
        student_id_number=f"STU-{uuid.uuid4().hex[:8]}",
    )
    db.add(student)
    db.commit()
    db.refresh(user)
    db.refresh(student)

    token = create_access_token({"sub": user.id, "role": user.role})
    db.close()
    return user, student, token


def test_student_register_internship_success():
    """Verify an authenticated student can register their internship placement."""
    user, student, token = create_test_student()

    payload = {
        "company_name": "Acme Robotics",
        "internship_title": "Autonomous Systems Engineer Intern",
        "domain": "Embedded Systems & IoT",
        "start_date": "2026-09-01T00:00:00",
        "end_date": "2026-12-15T00:00:00",
        "mode": "Hybrid",
        "location": "Boston, MA / Hybrid",
        "required_skills": ["Python", "ROS2", "C++", "Docker"],
        "description": "Developing autonomous path planning algorithms.",
        "mentor_name": "Dr. Sarah Connor",
        "mentor_email": "sconnor@acmerobotics.com",
        "mentor_phone": "+1 (555) 998-1234",
        "stipend": "$2,200 / month",
    }

    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(f"/api/students/{student.id}/register-internship", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()

    assert data["title"] == "Autonomous Systems Engineer Intern"
    assert data["company_name"] == "Acme Robotics"
    assert data["domain"] == "Embedded Systems & IoT"
    assert data["mode"] == "Hybrid"
    assert data["status"] == "Active"
    assert data["stipend"] == "$2,200 / month"
    assert "id" in data

    # Verify database persistence
    db = TestingSessionLocal()
    company = db.query(Company).filter(Company.name == "Acme Robotics").first()
    assert company is not None

    internship = db.query(Internship).filter(Internship.id == data["id"]).first()
    assert internship is not None
    assert internship.company_id == company.id

    # Verify Application record created with Approved status
    application = (
        db.query(Application)
        .filter(Application.student_id == student.id, Application.internship_id == internship.id)
        .first()
    )
    assert application is not None
    assert application.status == "Approved"

    # Verify skills linked
    skills = (
        db.query(Skill)
        .join(InternshipSkill, InternshipSkill.skill_id == Skill.id)
        .filter(InternshipSkill.internship_id == internship.id)
        .all()
    )
    skill_names = [s.name for s in skills]
    assert "Python" in skill_names
    assert "ROS2" in skill_names

    db.close()


def test_student_register_internship_with_user_id():
    """Verify endpoint resolves student using User.id as path parameter."""
    user, student, token = create_test_student()

    payload = {
        "company_name": "CloudScale Inc",
        "internship_title": "Cloud Platform Intern",
        "domain": "Cloud & DevOps Engineering",
        "mode": "Online",
        "location": "Remote",
        "required_skills": ["AWS", "Terraform"],
        "description": "Infrastructure as code development.",
    }

    headers = {"Authorization": f"Bearer {token}"}
    # Pass user.id instead of student.id
    response = client.post(f"/api/students/{user.id}/register-internship", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Cloud Platform Intern"
    assert data["company_name"] == "CloudScale Inc"


def test_student_register_internship_forbidden_for_other_student():
    """Verify a student cannot register an internship for a different student."""
    user1, student1, token1 = create_test_student("student1@university.edu", "Student One")
    user2, student2, token2 = create_test_student("student2@university.edu", "Student Two")

    payload = {
        "company_name": "Unauthorized Corp",
        "internship_title": "Sneaky Intern",
    }

    headers = {"Authorization": f"Bearer {token1}"}
    # Student 1 tries to register for Student 2
    response = client.post(f"/api/students/{student2.id}/register-internship", json=payload, headers=headers)
    assert response.status_code == 403
    assert "not authorized" in response.json()["detail"].lower()


def test_student_register_internship_unauthenticated():
    """Verify request without bearer token is rejected."""
    payload = {
        "company_name": "Unauth Corp",
        "internship_title": "No Auth Intern",
    }
    response = client.post("/api/students/some-student-id/register-internship", json=payload)
    assert response.status_code in [401, 403]


def test_student_register_internship_student_not_found():
    """Verify 404 returned for nonexistent student ID."""
    user, student, token = create_test_student()

    payload = {
        "company_name": "Mystery Corp",
        "internship_title": "Mystery Intern",
    }

    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/api/students/nonexistent-id-0000/register-internship", json=payload, headers=headers)
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_student_internships_list_returns_registered():
    """Verify that after registration, GET /api/students/{id}/internships returns the registered internship."""
    user, student, token = create_test_student()

    payload = {
        "company_name": "FinTech Innovations",
        "internship_title": "Quantitative Developer Intern",
        "domain": "Data Science & Machine Learning",
        "mode": "Hybrid",
        "location": "New York, NY",
        "required_skills": ["Python", "Pandas", "SQL"],
        "description": "Building high frequency data models.",
    }

    headers = {"Authorization": f"Bearer {token}"}
    reg_resp = client.post(f"/api/students/{student.id}/register-internship", json=payload, headers=headers)
    assert reg_resp.status_code == 201

    # Now fetch student internships
    list_resp = client.get(f"/api/students/{student.id}/internships")
    assert list_resp.status_code == 200
    items = list_resp.json()
    assert len(items) == 1
    assert items[0]["internship"]["title"] == "Quantitative Developer Intern"
    assert items[0]["internship"]["company_name"] == "FinTech Innovations"
    assert items[0]["application_status"] == "Approved"

    # Also test fetching via user.id
    user_list_resp = client.get(f"/api/students/{user.id}/internships")
    assert user_list_resp.status_code == 200
    assert len(user_list_resp.json()) == 1


def test_student_register_internship_invalid_data():
    """Verify validation errors (422) for invalid registration payloads."""
    user, student, token = create_test_student()
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Missing required company name
    resp1 = client.post(
        f"/api/students/{student.id}/register-internship",
        json={"internship_title": "Software Engineer"},
        headers=headers,
    )
    assert resp1.status_code == 422

    # 2. Company name too short (< 2 chars)
    resp2 = client.post(
        f"/api/students/{student.id}/register-internship",
        json={"company_name": "A", "internship_title": "Software Engineer"},
        headers=headers,
    )
    assert resp2.status_code == 422

    # 3. Title too short (< 2 chars)
    resp3 = client.post(
        f"/api/students/{student.id}/register-internship",
        json={"company_name": "Acme Corp", "internship_title": "X"},
        headers=headers,
    )
    assert resp3.status_code == 422

    # 4. end_date before start_date
    resp4 = client.post(
        f"/api/students/{student.id}/register-internship",
        json={
            "company_name": "Acme Corp",
            "internship_title": "Software Engineer",
            "start_date": "2026-10-01T00:00:00",
            "end_date": "2026-09-01T00:00:00",
        },
        headers=headers,
    )
    assert resp4.status_code == 422


def test_student_register_internship_prevent_duplicate():
    """Verify that duplicate registration for the same student, company, and title is rejected with 400."""
    user, student, token = create_test_student()
    headers = {"Authorization": f"Bearer {token}"}

    payload = {
        "company_name": "NexGen AI Systems",
        "internship_title": "Applied ML Intern",
        "domain": "Artificial Intelligence",
        "mode": "Hybrid",
    }

    # First registration succeeds
    resp1 = client.post(f"/api/students/{student.id}/register-internship", json=payload, headers=headers)
    assert resp1.status_code == 201

    # Second registration with identical company and title should be rejected
    resp2 = client.post(f"/api/students/{student.id}/register-internship", json=payload, headers=headers)
    assert resp2.status_code == 400
    assert "already exists" in resp2.json()["detail"].lower()

