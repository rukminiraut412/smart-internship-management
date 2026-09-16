"""Pydantic schemas for request validation and response serialization."""

from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ============================================================================
# USER & AUTH SCHEMAS
# ============================================================================

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
    student_id: Optional[str] = None
    mentor_id: Optional[str] = None
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


# ============================================================================
# INTERNSHIP SCHEMAS
# ============================================================================

class InternshipCreate(BaseModel):
    """Schema for creating a new internship."""
    company_id: str = Field(..., description="ID of the company offering the internship")
    mentor_id: Optional[str] = Field(default=None, description="Optional ID of the assigned mentor")
    title: str = Field(..., min_length=2, max_length=255, description="Title of the internship")
    domain: Optional[str] = Field(default=None, max_length=255, description="Domain/industry field (e.g. Cloud, AI)")
    description: Optional[str] = Field(default=None, description="Detailed internship description")
    location: Optional[str] = Field(default=None, max_length=255, description="Location or remote description")
    mode: str = Field(default="Hybrid", description="Online, Offline, or Hybrid")
    status: str = Field(default="Open", description="Open, Active, Closed, or Completed")
    stipend: Optional[str] = Field(default=None, max_length=100, description="Stipend details (e.g. $1,800 / month)")
    start_date: Optional[datetime] = Field(default=None, description="Internship start date")
    end_date: Optional[datetime] = Field(default=None, description="Internship end date")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "company_id": "c1234567-e89b-12d3-a456-426614174000",
                "title": "Backend Engineering Intern",
                "domain": "Cloud & Distributed Systems",
                "mode": "Hybrid",
                "status": "Open",
                "stipend": "$1,800 / month",
                "location": "Seattle, WA / Remote",
            }
        }
    )


class InternshipResponse(BaseModel):
    """Schema representing detailed internship information."""
    id: str
    company_id: str
    company_name: Optional[str] = None
    mentor_id: Optional[str] = None
    title: str
    domain: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    mode: str
    status: str
    stipend: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class StudentInternshipItem(BaseModel):
    """Representation of an internship associated with a student via application."""
    application_id: str
    application_status: str
    applied_at: datetime
    internship: InternshipResponse

    model_config = ConfigDict(from_attributes=True)


class StudentInternshipRegisterRequest(BaseModel):
    """Schema for a student registering an off-campus or institutional internship placement."""
    company_name: str = Field(..., min_length=2, max_length=255, description="Name of company or host organization")
    internship_title: str = Field(..., min_length=2, max_length=255, description="Official role title of the internship")
    domain: Optional[str] = Field(default=None, max_length=255, description="Domain or discipline (e.g. Cloud, AI, Web)")
    start_date: Optional[datetime] = Field(default=None, description="Start date of the internship")
    end_date: Optional[datetime] = Field(default=None, description="End date of the internship")
    mode: str = Field(default="Hybrid", description="Online, Offline, or Hybrid")
    location: Optional[str] = Field(default=None, max_length=255, description="Work location or Remote")
    required_skills: List[str] = Field(default_factory=list, description="Key skills and technologies used")
    description: Optional[str] = Field(default=None, description="Job description or scope of work")
    mentor_name: Optional[str] = Field(default=None, max_length=255, description="Host supervisor or mentor name")
    mentor_email: Optional[str] = Field(default=None, max_length=255, description="Supervisor official email")
    mentor_phone: Optional[str] = Field(default=None, max_length=50, description="Supervisor contact phone")
    stipend: Optional[str] = Field(default=None, max_length=100, description="Stipend information")

    @field_validator("start_date", "end_date", mode="before")
    @classmethod
    def parse_empty_date(cls, v):
        if v == "" or v is None:
            return None
        return v

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "company_name": "Acme Technologies",
                "internship_title": "Backend Engineering Intern",
                "domain": "Software Engineering & Architecture",
                "start_date": "2026-09-01T00:00:00",
                "end_date": "2026-12-01T00:00:00",
                "mode": "Hybrid",
                "location": "Seattle, WA / Remote",
                "required_skills": ["Python", "FastAPI", "Docker"],
                "description": "Designing and deploying backend services.",
                "mentor_name": "Dr. Marcus Vance",
                "mentor_email": "m.vance@cloudscale.io",
                "mentor_phone": "+1 (555) 441-2099",
                "stipend": "$1,800 / month",
            }
        }
    )


# ============================================================================
# STUDENT PROFILE SCHEMAS
# ============================================================================

class StudentProfileResponse(BaseModel):
    """Schema representing detailed student profile information."""
    id: str
    user_id: str
    name: str
    email: str
    student_id_number: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    university: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[str] = None
    gpa: Optional[float] = None
    resume_url: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class StudentProfileUpdateRequest(BaseModel):
    """Schema for updating student profile information."""
    name: Optional[str] = Field(default=None, min_length=2, max_length=255, description="Full name of the student")
    phone: Optional[str] = Field(default=None, max_length=50, description="Contact phone number")
    college: Optional[str] = Field(default=None, max_length=255, description="College or school name")
    university: Optional[str] = Field(default=None, max_length=255, description="University name")
    department: Optional[str] = Field(default=None, max_length=255, description="Academic department")
    year_of_study: Optional[str] = Field(default=None, max_length=100, description="Current academic year / cohort")
    gpa: Optional[float] = Field(default=None, ge=0.0, le=10.0, description="Grade point average")
    resume_url: Optional[str] = Field(default=None, max_length=500, description="URL or filename of student resume")
    skills: Optional[List[str]] = Field(default=None, description="List of skill names")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Alex Rivera",
                "phone": "+1 (555) 382-9014",
                "college": "School of Engineering & Applied Sciences",
                "university": "State Institute of Technology",
                "department": "Department of Computer Science & Engineering",
                "year_of_study": "Final Year (Semester 7 - 2026)",
                "gpa": 3.90,
                "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git & GitHub", "React"],
            }
        }
    )




# ============================================================================
# PROGRESS REPORT SCHEMAS
# ============================================================================

class ProgressReportCreate(BaseModel):
    """Schema for submitting a weekly progress report."""
    student_id: str = Field(..., description="ID of the student submitting the report")
    week_number: int = Field(..., ge=1, description="Week number for the progress report (must be >= 1)")
    title: Optional[str] = Field(default=None, max_length=255, description="Optional title for the weekly log")
    summary: Optional[str] = Field(default=None, description="Summary of work completed during the week")
    hours_logged: float = Field(default=0.0, ge=0.0, description="Total hours logged during this week")
    status: str = Field(default="Pending Submission", description="Report status: Pending Submission, Under Review, Approved")
    mentor_feedback: Optional[str] = Field(default=None, description="Optional mentor feedback")
    mentor_score: Optional[float] = Field(default=None, ge=1.0, le=5.0, description="Score assigned by mentor (1.0 to 5.0)")
    submission_date: Optional[datetime] = Field(default=None, description="Date of report submission")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "student_id": "s1234567-e89b-12d3-a456-426614174000",
                "week_number": 1,
                "title": "Onboarding & Local Dev Setup",
                "summary": "Completed FastAPI setup and configured local PostgreSQL database.",
                "hours_logged": 20.0,
                "status": "Pending Submission",
            }
        }
    )


class ProgressReportResponse(BaseModel):
    """Schema representing a weekly progress report."""
    id: str
    student_id: str
    internship_id: str
    week_number: int
    title: Optional[str] = None
    summary: Optional[str] = None
    hours_logged: float
    status: str
    mentor_feedback: Optional[str] = None
    mentor_score: Optional[float] = None
    submission_date: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
