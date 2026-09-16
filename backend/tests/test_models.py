"""Tests for SQLAlchemy database models, table initialization, and relationships."""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, init_db
from app.models import (
    Alert,
    Application,
    Company,
    Evaluation,
    Internship,
    InternshipSkill,
    Mentor,
    ProgressReport,
    Skill,
    Student,
    StudentSkill,
    Task,
    User,
)


@pytest.fixture
def db_session():
    """Create an isolated in-memory SQLite database session for model testing."""
    test_engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=test_engine)


def test_init_db_registers_all_13_tables():
    """Verify that all 13 required entity tables exist in Base.metadata."""
    init_db()
    expected_tables = {
        "users",
        "students",
        "mentors",
        "companies",
        "internships",
        "applications",
        "progress_reports",
        "tasks",
        "skills",
        "student_skills",
        "internship_skills",
        "evaluations",
        "alerts",
    }
    actual_tables = set(Base.metadata.tables.keys())
    assert expected_tables.issubset(actual_tables), f"Missing tables: {expected_tables - actual_tables}"


def test_create_user_and_student_relationship(db_session):
    """Verify 1-to-1 User <-> Student relationship."""
    user = User(
        email="alex.rivera@university.edu",
        hashed_password="secure_hashed_password",
        full_name="Alex Rivera",
        role="student",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    student = Student(
        user_id=user.id,
        student_id_number="STU-2026-8842",
        phone="+1 (555) 382-9014",
        college="School of Engineering",
        department="Computer Science",
        year_of_study="Final Year",
        gpa=3.85,
    )
    db_session.add(student)
    db_session.commit()
    db_session.refresh(student)

    assert student.user.email == "alex.rivera@university.edu"
    assert user.student.student_id_number == "STU-2026-8842"
    assert len(student.id) == 36  # UUID length check


def test_create_company_mentor_and_internship(db_session):
    """Verify Company, Mentor, and Internship relationships."""
    company = Company(
        name="CloudScale Distributed Systems",
        industry="Cloud Computing",
        location="Seattle, WA",
    )
    db_session.add(company)
    db_session.commit()

    mentor_user = User(
        email="m.vance@cloudscale.io",
        hashed_password="hashed_pw_mentor",
        full_name="Dr. Marcus Vance",
        role="mentor",
    )
    db_session.add(mentor_user)
    db_session.commit()

    mentor = Mentor(
        user_id=mentor_user.id,
        company_id=company.id,
        job_title="Staff Systems Architect",
        department="Platform Infrastructure",
    )
    db_session.add(mentor)
    db_session.commit()

    internship = Internship(
        company_id=company.id,
        mentor_id=mentor.id,
        title="Backend Engineering Intern",
        domain="Cloud & Distributed Systems",
        mode="Hybrid",
        status="Open",
        stipend="$1,800 / month",
    )
    db_session.add(internship)
    db_session.commit()
    db_session.refresh(internship)

    assert internship.company.name == "CloudScale Distributed Systems"
    assert internship.mentor.job_title == "Staff Systems Architect"
    assert mentor.user.full_name == "Dr. Marcus Vance"
    assert len(company.internships) == 1


def test_student_and_internship_skills_many_to_many(db_session):
    """Verify many-to-many relationships via StudentSkill and InternshipSkill."""
    # Create skill
    skill_python = Skill(name="Python", category="Programming")
    skill_fastapi = Skill(name="FastAPI", category="Framework")
    db_session.add_all([skill_python, skill_fastapi])
    db_session.commit()

    # Create student
    user = User(email="intern@test.com", hashed_password="pw", full_name="Intern", role="student")
    db_session.add(user)
    db_session.commit()
    student = Student(user_id=user.id, student_id_number="STU-001")
    db_session.add(student)
    db_session.commit()

    # Create company & internship
    company = Company(name="Tech Corp")
    db_session.add(company)
    db_session.commit()
    internship = Internship(company_id=company.id, title="Backend Intern")
    db_session.add(internship)
    db_session.commit()

    # Link skills
    student_skill = StudentSkill(student_id=student.id, skill_id=skill_python.id, proficiency_level="Advanced")
    internship_skill = InternshipSkill(internship_id=internship.id, skill_id=skill_python.id, required_level="Intermediate")
    db_session.add_all([student_skill, internship_skill])
    db_session.commit()

    db_session.refresh(student)
    db_session.refresh(internship)

    assert len(student.student_skills) == 1
    assert student.student_skills[0].skill.name == "Python"
    assert student.student_skills[0].proficiency_level == "Advanced"

    assert len(internship.internship_skills) == 1
    assert internship.internship_skills[0].skill.name == "Python"
    assert internship.internship_skills[0].required_level == "Intermediate"


def test_application_progress_report_task_evaluation_and_alert(db_session):
    """Verify application, progress report, task, evaluation, and alert records."""
    # Setup base entities
    u1 = User(email="stu@test.com", hashed_password="pw", full_name="Student", role="student")
    u2 = User(email="men@test.com", hashed_password="pw", full_name="Mentor", role="mentor")
    comp = Company(name="Base Corp")
    db_session.add_all([u1, u2, comp])
    db_session.commit()

    stu = Student(user_id=u1.id, student_id_number="STU-999")
    men = Mentor(user_id=u2.id, company_id=comp.id, job_title="Tech Lead")
    db_session.add_all([stu, men])
    db_session.commit()

    intern = Internship(company_id=comp.id, mentor_id=men.id, title="Dev Intern")
    db_session.add(intern)
    db_session.commit()

    # 1. Application
    app = Application(student_id=stu.id, internship_id=intern.id, status="Approved")
    db_session.add(app)

    # 2. ProgressReport
    report = ProgressReport(
        student_id=stu.id,
        internship_id=intern.id,
        week_number=1,
        title="Week 1 Onboarding",
        hours_logged=20.0,
        status="Approved",
        mentor_score=4.8,
    )
    db_session.add(report)

    # 3. Task
    task = Task(
        internship_id=intern.id,
        student_id=stu.id,
        mentor_id=men.id,
        title="Set up dev environment",
        status="Completed",
        category="Architecture",
    )
    db_session.add(task)

    # 4. Evaluation
    eval_record = Evaluation(
        student_id=stu.id,
        internship_id=intern.id,
        mentor_id=men.id,
        evaluation_type="Midterm",
        rating=4.5,
        comments="Great progress in the first half.",
    )
    db_session.add(eval_record)

    # 5. Alert
    alert = Alert(
        student_id=stu.id,
        internship_id=intern.id,
        title="Report due soon",
        message="Please submit Week 2 progress report.",
        severity="Warning",
    )
    db_session.add(alert)
    db_session.commit()

    # Assertions
    db_session.refresh(stu)
    assert len(stu.applications) == 1
    assert stu.applications[0].internship.title == "Dev Intern"

    assert len(stu.progress_reports) == 1
    assert stu.progress_reports[0].hours_logged == 20.0

    assert len(stu.tasks) == 1
    assert stu.tasks[0].mentor.job_title == "Tech Lead"

    assert len(stu.evaluations) == 1
    assert stu.evaluations[0].rating == 4.5

    assert len(stu.alerts) == 1
    assert stu.alerts[0].severity == "Warning"
