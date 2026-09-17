"""Tests for mentor and admin API endpoints and role protection."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Application, Company, Internship, Mentor, ProgressReport, Student, User
from app.security import create_access_token, hash_password

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


def test_mentor_flow_and_review():
    db = TestingSessionLocal()

    # Create mentor user
    mentor_user = User(
        email="mentor.test@company.com",
        hashed_password=hash_password("Pass123!"),
        full_name="Dr. Test Mentor",
        role="mentor",
        is_active=True,
    )
    db.add(mentor_user)
    db.flush()

    mentor = Mentor(
        user_id=mentor_user.id,
        company_name="Test Company",
        job_title="Lead Architect",
    )
    db.add(mentor)

    # Create student user
    student_user = User(
        email="student.test@univ.edu",
        hashed_password=hash_password("Pass123!"),
        full_name="Student One",
        role="student",
        is_active=True,
    )
    db.add(student_user)
    db.flush()

    student = Student(user_id=student_user.id, student_id_number="STU-001")
    db.add(student)

    # Create company and internship
    company = Company(name="Test Company")
    db.add(company)
    db.flush()

    internship = Internship(
        company_id=company.id,
        mentor_id=mentor.id,
        title="Software Intern",
        mode="Remote",
    )
    db.add(internship)
    db.flush()

    # Create application
    app_record = Application(
        student_id=student.id,
        internship_id=internship.id,
        status="Approved",
    )
    db.add(app_record)

    # Create report
    report = ProgressReport(
        student_id=student.id,
        internship_id=internship.id,
        week_number=1,
        title="Week 1 Deliverables",
        summary="Set up dev environment",
        hours_logged=20.0,
        status="Pending Submission",
    )
    db.add(report)
    db.commit()

    token = create_access_token({"sub": mentor_user.id, "email": mentor_user.email, "role": "mentor"})
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Get mentor profile
    res_me = client.get("/api/mentors/me", headers=headers)
    assert res_me.status_code == 200
    assert res_me.json()["name"] == "Dr. Test Mentor"

    # 2. Update mentor profile
    res_update = client.put(
        "/api/mentors/me",
        headers=headers,
        json={"phone": "+1 555-999-8888", "job_title": "Principal Architect"},
    )
    assert res_update.status_code == 200
    assert res_update.json()["job_title"] == "Principal Architect"

    # 3. List assigned interns
    res_interns = client.get(f"/api/mentors/{mentor.id}/interns", headers=headers)
    assert res_interns.status_code == 200
    data = res_interns.json()
    assert len(data) >= 1
    assert data[0]["student_name"] == "Student One"

    # 4. Review progress report
    res_review = client.put(
        f"/api/mentors/reports/{report.id}/review",
        headers=headers,
        json={
            "status": "Approved",
            "mentor_feedback": "Great work on onboarding!",
            "mentor_score": 4.8,
        },
    )
    assert res_review.status_code == 200
    assert res_review.json()["status"] == "Approved"
    assert res_review.json()["mentor_score"] == 4.8

    # 5. Submit evaluation
    res_eval = client.post(
        "/api/mentors/evaluations",
        headers=headers,
        json={
            "student_id": student.id,
            "internship_id": internship.id,
            "evaluation_type": "Midterm",
            "rating": 4.5,
            "comments": "Consistently exceeds expectations.",
            "recommendation": "Recommend for conversion.",
        },
    )
    assert res_eval.status_code == 201
    assert res_eval.json()["rating"] == 4.5

    db.close()


def test_admin_flow_and_role_protection():
    db = TestingSessionLocal()

    # Create admin user
    admin_user = User(
        email="admin.test@univ.edu",
        hashed_password=hash_password("Pass123!"),
        full_name="Admin Test",
        role="admin",
        is_active=True,
    )
    db.add(admin_user)

    # Create student user
    student_user = User(
        email="student.test2@univ.edu",
        hashed_password=hash_password("Pass123!"),
        full_name="Student Two",
        role="student",
        is_active=True,
    )
    db.add(student_user)
    db.flush()

    student = Student(user_id=student_user.id)
    db.add(student)

    company = Company(name="Cloud Solutions")
    db.add(company)
    db.flush()

    internship = Internship(
        company_id=company.id,
        title="DevOps Intern",
        mode="Hybrid",
    )
    db.add(internship)
    db.flush()

    app_record = Application(
        student_id=student.id,
        internship_id=internship.id,
        status="Pending",
    )
    db.add(app_record)
    db.commit()

    admin_token = create_access_token({"sub": admin_user.id, "email": admin_user.email, "role": "admin"})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    student_token = create_access_token({"sub": student_user.id, "email": student_user.email, "role": "student"})
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # 1. Student trying to access admin stats -> 403 Forbidden
    res_denied = client.get("/api/admin/stats", headers=student_headers)
    assert res_denied.status_code == 403

    # 2. Admin access stats
    res_stats = client.get("/api/admin/stats", headers=admin_headers)
    assert res_stats.status_code == 200
    stats = res_stats.json()
    assert stats["total_students"] >= 1
    assert stats["pending_applications"] >= 1

    # 3. Admin list applications
    res_apps = client.get("/api/admin/applications", headers=admin_headers)
    assert res_apps.status_code == 200
    apps = res_apps.json()
    assert len(apps) >= 1

    # 4. Admin approve application
    res_approve = client.patch(
        f"/api/admin/applications/{app_record.id}",
        headers=admin_headers,
        json={"status": "Approved"},
    )
    assert res_approve.status_code == 200
    assert res_approve.json()["status"] == "Approved"

    db.close()
