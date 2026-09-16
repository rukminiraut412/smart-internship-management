"""Authentication routes for registration, login, and user profile retrieval."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Mentor, Student, User
from app.schemas import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
    UserRole,
)
from app.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user account",
    description="Create a new user account (student, mentor, or admin) with secure bcrypt password hashing.",
)
def register(
    payload: UserRegisterRequest,
    db: Session = Depends(get_db),
):
    """Register a new user, ensuring email uniqueness and initializing role-specific profiles."""
    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered",
        )

    # Hash the password securely with bcrypt
    hashed_pw = hash_password(payload.password)

    # Create the user record
    new_user = User(
        email=payload.email.lower().strip(),
        hashed_password=hashed_pw,
        full_name=payload.full_name.strip(),
        role=payload.role.value,
        is_active=True,
    )
    db.add(new_user)
    db.flush()  # Flush to generate new_user.id for profile linking

    # Initialize connected profile based on role
    if payload.role == UserRole.STUDENT:
        student_profile = Student(user_id=new_user.id)
        db.add(student_profile)
    elif payload.role == UserRole.MENTOR:
        mentor_profile = Mentor(user_id=new_user.id)
        db.add(mentor_profile)

    db.commit()
    db.refresh(new_user)

    return new_user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="User login and JWT generation",
    description="Authenticate user credentials against bcrypt hash and return a JWT access token.",
)
def login(
    payload: UserLoginRequest,
    db: Session = Depends(get_db),
):
    """Authenticate user with email and password and return a bearer JWT access token."""
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()

    # Verify user exists and credentials match
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive",
        )

    # Generate access token
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
    }
    access_token = create_access_token(data=token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
    description="Retrieve the profile of the currently authenticated user using their JWT bearer token.",
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    """Return the profile of the authenticated user."""
    return current_user
