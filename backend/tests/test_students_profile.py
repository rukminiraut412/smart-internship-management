"""Unit and regression tests for student profile GET and PUT endpoints."""

import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Skill, Student, StudentSkill, User
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


def create_test_student_with_skills(email: str = "alex.rivera@university.edu", name: str = "Alex Rivera"):
    """Helper to create a student user, student record, and initial skills."""
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
        phone="+1 (555) 382-9014",
        college="School of Engineering & Applied Sciences",
        university="State Institute of Technology",
        department="Department of Computer Science & Engineering",
        year_of_study="Final Year (Semester 7 - 2026)",
        gpa=3.84,
    )
    db.add(student)
    db.flush()

    # Add initial skills
    initial_skills = ["Python", "FastAPI", "Docker"]
    for s_name in initial_skills:
        skill = db.query(Skill).filter(Skill.name == s_name).first()
        if not skill:
            skill = Skill(name=s_name, category="Engineering")
            db.add(skill)
            db.flush()
        db.add(StudentSkill(student_id=student.id, skill_id=skill.id, proficiency_level="Intermediate"))

    db.commit()
    db.refresh(user)
    db.refresh(student)

    token = create_access_token({"sub": user.id, "role": user.role})
    db.close()
    return user, student, token


def test_get_student_profile_success():
    """Verify student can retrieve their own profile details and skills."""
    user, student, token = create_test_student_with_skills()

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get(f"/api/students/{student.id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["name"] == "Alex Rivera"
    assert data["email"] == "alex.rivera@university.edu"
    assert data["college"] == "School of Engineering & Applied Sciences"
    assert data["gpa"] == 3.84
    assert set(data["skills"]) == {"Python", "FastAPI", "Docker"}


def test_get_student_profile_with_user_id():
    """Verify student profile can be fetched using account User.id."""
    user, student, token = create_test_student_with_skills()

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get(f"/api/students/{user.id}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["id"] == student.id
    assert data["user_id"] == user.id
    assert data["name"] == "Alex Rivera"


def test_get_student_profile_unauthenticated():
    """Verify accessing profile without token returns 401/403."""
    resp = client.get("/api/students/some-student-id")
    assert resp.status_code in [401, 403]


def test_get_student_profile_forbidden_for_other_student():
    """Verify Student A cannot read Student B's private profile."""
    u1, s1, t1 = create_test_student_with_skills("s1@test.com", "Student One")
    u2, s2, t2 = create_test_student_with_skills("s2@test.com", "Student Two")

    headers = {"Authorization": f"Bearer {t1}"}
    resp = client.get(f"/api/students/{s2.id}", headers=headers)
    assert resp.status_code == 403


def test_update_student_profile_success():
    """Verify updating profile persists changes to User, Student, and StudentSkill tables."""
    user, student, token = create_test_student_with_skills()

    update_payload = {
        "name": "Alex R. Rivera",
        "phone": "+1 (555) 999-8888",
        "college": "College of Computing",
        "university": "State University of Tech",
        "department": "Artificial Intelligence & Software",
        "year_of_study": "Master Year 1 (2026)",
        "gpa": 3.95,
        "skills": ["Python", "FastAPI", "Docker", "PostgreSQL", "Kubernetes"],
    }

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.put(f"/api/students/{student.id}", json=update_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["name"] == "Alex R. Rivera"
    assert data["phone"] == "+1 (555) 999-8888"
    assert data["college"] == "College of Computing"
    assert data["gpa"] == 3.95
    assert "PostgreSQL" in data["skills"]
    assert "Kubernetes" in data["skills"]
    assert len(data["skills"]) == 5

    # Verify database persistence
    db = TestingSessionLocal()
    db_student = db.query(Student).filter(Student.id == student.id).first()
    assert db_student.user.full_name == "Alex R. Rivera"
    assert db_student.phone == "+1 (555) 999-8888"
    assert db_student.gpa == 3.95
    assert db_student.college == "College of Computing"

    db_skills = [ss.skill.name for ss in db_student.student_skills]
    assert "Kubernetes" in db_skills
    assert "Python" in db_skills
    db.close()


def test_update_student_profile_preserves_existing_skills():
    """Verify that updating skills preserves existing skill links and does not create duplicates."""
    user, student, token = create_test_student_with_skills()

    # Add 1 new skill while keeping the original 3
    update_payload = {
        "skills": ["Python", "FastAPI", "Docker", "Git & GitHub"],
    }

    headers = {"Authorization": f"Bearer {token}"}
    resp = client.put(f"/api/students/{user.id}", json=update_payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["skills"]) == 4
    assert set(data["skills"]) == {"Python", "FastAPI", "Docker", "Git & GitHub"}

    # Ensure no duplicates in DB
    db = TestingSessionLocal()
    all_python_skills = db.query(Skill).filter(Skill.name == "Python").all()
    assert len(all_python_skills) == 1
    db.close()


def test_update_student_profile_forbidden_for_other_student():
    """Verify Student A cannot update Student B's profile."""
    u1, s1, t1 = create_test_student_with_skills("s1@test.com", "Student One")
    u2, s2, t2 = create_test_student_with_skills("s2@test.com", "Student Two")

    headers = {"Authorization": f"Bearer {t1}"}
    resp = client.put(f"/api/students/{s2.id}", json={"name": "Hacked Name"}, headers=headers)
    assert resp.status_code == 403
