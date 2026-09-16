"""Pydantic schemas for request validation and response serialization."""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRole(str, Enum):
    """Supported roles for the Smart Internship platform."""
    STUDENT = "student"
    MENTOR = "mentor"
    ADMIN = "admin"


class UserRegisterRequest(BaseModel):
    """Schema for user registration."""
    email: str = Field(..., min_length=5, max_length=255, description="Unique user email address")
    password: str = Field(..., min_length=6, max_length=128, description="User password (minimum 6 characters)")
    full_name: str = Field(..., min_length=1, max_length=255, description="Full name of the user")
    role: UserRole = Field(default=UserRole.STUDENT, description="Account role: student, mentor, or admin")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "alex.rivera@university.edu",
                "password": "SecurePassword123!",
                "full_name": "Alex Rivera",
                "role": "student",
            }
        }
    )


class UserLoginRequest(BaseModel):
    """Schema for user login credentials."""
    email: str = Field(..., description="Registered email address")
    password: str = Field(..., description="Account password")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "email": "alex.rivera@university.edu",
                "password": "SecurePassword123!",
            }
        }
    )


class UserResponse(BaseModel):
    """Safe public user profile without sensitive credentials."""
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "123e4567-e89b-12d3-a456-426614174000",
                    "email": "alex.rivera@university.edu",
                    "full_name": "Alex Rivera",
                    "role": "student",
                    "is_active": True,
                    "created_at": "2026-09-16T14:30:00Z",
                },
            }
        }
    )
