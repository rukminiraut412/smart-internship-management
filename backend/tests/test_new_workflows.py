"""End-to-end unit tests for newly implemented workflows:
- Student Profile & Persistence
- Internship Registration
- Task Management
- Mentor Review & Portals
- Admin Oversight & Application Approvals
- Explainable Intelligence (Quality Score, Completion Readiness, Growth Analytics)
- Proactive Alerts
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Company, Internship, ProgressReport, Student, Task, User
from app.security import hash_password

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def setup_test_db():
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


def test_student_registration_and_profile_workflow():
    """Test registering a new student, reading profile, and updating profile."""
    # 1. Register student
    reg_res = client.post(
        "/api/auth/register",
        json={
            "email": "maria.chen@state.edu",
            "password": "Password123!",
            "full_name": "Maria Chen",
            "role": "student",
        },
    )
    assert reg_res.status_code == 201
    user_data = reg_res.json()
    assert user_data["student_id"] is not None
    student_id = user_data["student_id"]

    # 2. Login
    login_res = client.post(
        "/api/auth/login",
        json={"email": "maria.chen@state.edu", "password": "Password123!"},
    )
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. GET /api/students/me
    me_res = client.get("/api/students/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["full_name"] == "Maria Chen"
    assert me_data["id"] == student_id

    # 4. PUT /api/students/me (update profile)
    update_res = client.put(
        "/api/students/me",
        headers=headers,
        json={
            "phone": "+1 (555) 987-6543",
            "college": "School of Computer Science",
            "university": "State University",
            "department": "Software Engineering",
            "year_of_study": "Year 3",
            "gpa": 3.92,
            "skills": ["Python", "FastAPI", "React", "PostgreSQL"],
        },
    )
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["phone"] == "+1 (555) 987-6543"
    assert updated["department"] == "Software Engineering"
    assert set(updated["skills"]) == {"Python", "FastAPI", "React", "PostgreSQL"}

    # 5. Verify persistence by re-fetching
    fetch_res = client.get(f"/api/students/{student_id}")
    assert fetch_res.status_code == 200
    fetched = fetch_res.json()
    assert fetched["gpa"] == 3.92
    assert "FastAPI" in fetched["skills"]


def test_internship_registration_endpoint():
    """Test student internship registration endpoint creating company, internship, and application."""
    # Create student
    reg = client.post(
        "/api/auth/register",
        json={
            "email": "dev.student@test.edu",
            "password": "Password123!",
            "full_name": "Dev Student",
            "role": "student",
        },
    )
    student_id = reg.json()["student_id"]

    # Register internship
    payload = {
        "company_name": "Apex Analytics",
        "internship_title": "Backend Engineering Intern",
        "domain": "Data Engineering",
        "description": "Building scalable ingestion pipelines.",
        "location": "New York, NY",
        "mode": "Hybrid",
        "stipend": "$2,200 / month",
        "required_skills": ["Python", "SQL", "Docker", "Kafka"],
    }
    reg_res = client.post(f"/api/students/{student_id}/internships/register", json=payload)
    assert reg_res.status_code == 201
    item = reg_res.json()
    assert item["application_status"] == "Approved"
    assert item["internship"]["title"] == "Backend Engineering Intern"
    assert item["internship"]["company_name"] == "Apex Analytics"

    # Verify duplicate registration prevention
    dup_res = client.post(f"/api/students/{student_id}/internships/register", json=payload)
    assert dup_res.status_code == 400

    # Verify student internships listing
    list_res = client.get(f"/api/students/{student_id}/internships")
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1


def test_task_management_workflow():
    """Test creating, listing, and updating tasks."""
    # Seed db
    db = TestingSessionLocal()
    user = User(email="s@u.edu", hashed_password="pw", full_name="S", role="student")
    company = Company(name="Co")
    db.add_all([user, company])
    db.commit()

    student = Student(user_id=user.id)
    internship = Internship(company_id=company.id, title="Intern")
    db.add_all([student, internship])
    db.commit()
    s_id, i_id = student.id, internship.id
    db.close()

    # Create task
    task_res = client.post(
        "/api/tasks",
        json={
            "student_id": s_id,
            "internship_id": i_id,
            "title": "Build FastAPI authentication router",
            "category": "API",
            "status": "In Progress",
        },
    )
    assert task_res.status_code == 201
    task_data = task_res.json()
    task_id = task_data["id"]
    assert task_data["status"] == "In Progress"

    # List tasks for student
    get_res = client.get(f"/api/students/{s_id}/tasks")
    assert get_res.status_code == 200
    assert len(get_res.json()) == 1

    # Update task to Completed
    patch_res = client.patch(f"/api/tasks/{task_id}", json={"status": "Completed"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Completed"
    assert patch_res.json()["completed_at"] is not None


def test_mentor_portal_review_and_assigned_interns():
    """Test mentor viewing assigned intern and reviewing a submitted report."""
    db = TestingSessionLocal()
    # Mentor
    m_user = User(email="mentor@apex.io", hashed_password="pw", full_name="Dr. Mentor", role="mentor")
    # Student
    s_user = User(email="intern@univ.edu", hashed_password="pw", full_name="Intern Student", role="student")
    comp = Company(name="Apex Systems")
    db.add_all([m_user, s_user, comp])
    db.commit()

    from app.models import Mentor
    mentor = Mentor(user_id=m_user.id, company_id=comp.id, job_title="Tech Lead")
    student = Student(user_id=s_user.id)
    internship = Internship(company_id=comp.id, mentor_id=mentor.id, title="Systems Intern")
    db.add_all([mentor, student, internship])
    db.commit()

    from app.models import Application
    app_rec = Application(student_id=student.id, internship_id=internship.id, status="Approved")
    db.add(app_rec)
    db.commit()

    # Student submits report
    report = ProgressReport(
        student_id=student.id,
        internship_id=internship.id,
        week_number=1,
        hours_logged=20.0,
        status="Under Review",
    )
    db.add(report)
    db.commit()
    r_id = report.id
    m_id = mentor.id
    db.close()

    # Mentor views interns
    interns_res = client.get(f"/api/mentors/{m_id}/interns")
    assert interns_res.status_code == 200
    interns = interns_res.json()
    assert len(interns) >= 1
    assert interns[0]["student_name"] == "Intern Student"

    # Mentor reviews report
    rev_res = client.put(
        f"/api/mentors/reports/{r_id}/review",
        json={"mentor_feedback": "Great progress on the database schema.", "mentor_score": 4.8},
    )
    assert rev_res.status_code == 200
    assert rev_res.json()["mentor_score"] == 4.8
    assert rev_res.json()["status"] == "Approved"


def test_admin_portal_workflows():
    """Test admin overview, listing applications, and approving application."""
    # Register student & internship
    reg = client.post(
        "/api/auth/register",
        json={"email": "ad.student@test.edu", "password": "Password123!", "full_name": "Ad Student", "role": "student"},
    )
    s_id = reg.json()["student_id"]

    db = TestingSessionLocal()
    comp = Company(name="Admin Co")
    db.add(comp)
    db.commit()
    internship = Internship(company_id=comp.id, title="Cloud Intern")
    db.add(internship)
    db.commit()

    from app.models import Application
    app_rec = Application(student_id=s_id, internship_id=internship.id, status="Pending")
    db.add(app_rec)
    db.commit()
    app_id = app_rec.id
    db.close()

    # Admin overview
    overview_res = client.get("/api/admin/overview")
    assert overview_res.status_code == 200
    data = overview_res.json()
    assert data["total_students"] >= 1
    assert data["pending_applications"] >= 1

    # Admin approves application
    patch_res = client.patch(f"/api/admin/applications/{app_id}", json={"status": "Approved"})
    assert patch_res.status_code == 200
    assert patch_res.json()["status"] == "Approved"


def test_intelligence_quality_score_and_completion_readiness():
    """Test deterministic Quality Score, Completion Readiness, and Growth Analytics."""
    db = TestingSessionLocal()
    user = User(email="q@u.edu", hashed_password="pw", full_name="Q Student", role="student")
    comp = Company(name="Metrics Corp")
    db.add_all([user, comp])
    db.commit()

    student = Student(user_id=user.id)
    internship = Internship(company_id=comp.id, title="Data Intern")
    db.add_all([student, internship])
    db.commit()
    s_id, i_id = student.id, internship.id
    db.close()

    # Quality score
    qs_res = client.get(f"/api/intelligence/quality-score/{i_id}")
    assert qs_res.status_code == 200
    qs_data = qs_res.json()
    assert "quality_score" in qs_data
    assert "breakdown" in qs_data
    assert "explanation" in qs_data

    # Completion readiness (insufficient data -> PENDING ITEMS)
    cr_res = client.get(f"/api/intelligence/completion-readiness/{s_id}")
    assert cr_res.status_code == 200
    assert cr_res.json()["status"] == "PENDING ITEMS"
    assert len(cr_res.json()["pending_items"]) > 0

    # Growth analytics (less than 2 reports -> has_sufficient_data = False)
    ga_res = client.get(f"/api/intelligence/growth-analytics/{s_id}")
    assert ga_res.status_code == 200
    assert ga_res.json()["has_sufficient_data"] is False
    assert "Not enough data yet" in ga_res.json()["message"]
