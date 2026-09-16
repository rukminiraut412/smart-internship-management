"""Tests for authentication endpoints (register, login, me)."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import Mentor, Student, User

# In-memory database with StaticPool so all connections share the same memory instance
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


def test_register_student_success():
    """Verify that a student can register and a Student profile is created."""
    payload = {
        "email": "student@university.edu",
        "password": "StrongPassword123!",
        "full_name": "Jane Student",
        "role": "student",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()

    assert data["email"] == "student@university.edu"
    assert data["full_name"] == "Jane Student"
    assert data["role"] == "student"
    assert data["is_active"] is True
    assert "password" not in data
    assert "hashed_password" not in data

    # Verify user and student exist in database
    db = TestingSessionLocal()
    db_user = db.query(User).filter(User.email == "student@university.edu").first()
    assert db_user is not None
    assert db_user.hashed_password != "StrongPassword123!"
    assert db_user.student is not None
    db.close()


def test_register_mentor_success():
    """Verify that a mentor can register and a Mentor profile is created."""
    payload = {
        "email": "mentor@company.com",
        "password": "StrongPassword123!",
        "full_name": "Dr. Mentor",
        "role": "mentor",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["role"] == "mentor"

    db = TestingSessionLocal()
    db_user = db.query(User).filter(User.email == "mentor@company.com").first()
    assert db_user is not None
    assert db_user.mentor is not None
    db.close()


def test_register_duplicate_email_fails():
    """Verify that duplicate email registration returns HTTP 400 Bad Request."""
    payload = {
        "email": "duplicate@test.com",
        "password": "Password123!",
        "full_name": "Duplicate User",
        "role": "student",
    }
    resp1 = client.post("/api/auth/register", json=payload)
    assert resp1.status_code == 201

    resp2 = client.post("/api/auth/register", json=payload)
    assert resp2.status_code == 400
    assert resp2.json()["detail"] == "Email is already registered"


def test_register_invalid_role():
    """Verify that registering with an unsupported role fails validation."""
    payload = {
        "email": "invalid_role@test.com",
        "password": "Password123!",
        "full_name": "Invalid Role User",
        "role": "superadmin",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 422


def test_login_success():
    """Verify login with correct credentials returns valid JWT token and user info."""
    reg_payload = {
        "email": "alex.rivera@university.edu",
        "password": "SecurePassword123!",
        "full_name": "Alex Rivera",
        "role": "student",
    }
    client.post("/api/auth/register", json=reg_payload)

    login_payload = {
        "email": "alex.rivera@university.edu",
        "password": "SecurePassword123!",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "alex.rivera@university.edu"
    assert "password" not in data["user"]
    assert "hashed_password" not in data["user"]


def test_login_wrong_password_fails():
    """Verify login fails with incorrect password."""
    reg_payload = {
        "email": "wrong_pw@test.com",
        "password": "CorrectPassword123!",
        "full_name": "User",
        "role": "student",
    }
    client.post("/api/auth/register", json=reg_payload)

    login_payload = {
        "email": "wrong_pw@test.com",
        "password": "WrongPassword!",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_login_nonexistent_user_fails():
    """Verify login fails for nonexistent email."""
    login_payload = {
        "email": "nonexistent@test.com",
        "password": "Password123!",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_get_me_success():
    """Verify /api/auth/me returns current user when valid bearer token is provided."""
    reg_payload = {
        "email": "me_test@university.edu",
        "password": "Password123!",
        "full_name": "Me User",
        "role": "student",
    }
    client.post("/api/auth/register", json=reg_payload)

    login_resp = client.post("/api/auth/login", json={"email": "me_test@university.edu", "password": "Password123!"})
    token = login_resp.json()["access_token"]

    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/auth/me", headers=headers)
    assert me_resp.status_code == 200
    user_data = me_resp.json()
    assert user_data["email"] == "me_test@university.edu"
    assert user_data["full_name"] == "Me User"
    assert user_data["role"] == "student"


def test_get_me_without_token_fails():
    """Verify /api/auth/me returns HTTP 403 or 401 when token is missing."""
    response = client.get("/api/auth/me")
    assert response.status_code in (401, 403)


def test_get_me_with_invalid_token_fails():
    """Verify /api/auth/me returns HTTP 401 when token is forged or invalid."""
    headers = {"Authorization": "Bearer invalid.fake.token"}
    response = client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401
