"""Pydantic schemas for request validation and response serialization."""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, ConfigDict, EmailStr, Field


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
    created_at: datetime
    updated_at: Optional[datetime] = None
    student_id: Optional[str] = None
    mentor_id: Optional[str] = None

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


# ============================================================================
# STUDENT PROFILE SCHEMAS
# ============================================================================

class StudentProfileResponse(BaseModel):
    """Schema representing complete student profile with academic and contact information."""
    id: str
    user_id: str
    email: str
    full_name: str
    student_id_number: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    university: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[str] = None
    gpa: Optional[float] = None
    resume_url: Optional[str] = None
    skills: List[str] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class StudentProfileUpdate(BaseModel):
    """Schema for updating a student's profile."""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    college: Optional[str] = None
    university: Optional[str] = None
    department: Optional[str] = None
    year_of_study: Optional[str] = None
    gpa: Optional[float] = None
    skills: Optional[List[str]] = None


# ============================================================================
# INTERNSHIP REGISTRATION SCHEMA
# ============================================================================

class InternshipRegistrationRequest(BaseModel):
    """Schema for registering a student internship placement."""
    company_name: str = Field(..., min_length=1, max_length=255, description="Company/Organization name")
    internship_title: str = Field(..., min_length=1, max_length=255, description="Internship title")
    domain: Optional[str] = Field(default=None, max_length=255)
    description: Optional[str] = None
    location: Optional[str] = Field(default=None, max_length=255)
    mode: str = Field(default="Hybrid", description="Online, Offline, or Hybrid")
    stipend: Optional[str] = Field(default=None, max_length=100)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    required_skills: List[str] = []
    mentor_name: Optional[str] = None
    mentor_email: Optional[str] = None
    mentor_phone: Optional[str] = None
    cover_letter: Optional[str] = None


# ============================================================================
# TASK SCHEMAS
# ============================================================================

class TaskCreate(BaseModel):
    """Schema for creating a task for an intern."""
    internship_id: str
    student_id: str
    mentor_id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = "Development"
    status: str = Field(default="Pending")
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    """Schema for updating task status or details."""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = Field(default=None, description="Pending, In Progress, Completed")
    due_date: Optional[datetime] = None


class TaskResponse(BaseModel):
    """Schema representing an assigned task."""
    id: str
    internship_id: str
    student_id: str
    mentor_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    category: Optional[str] = None
    status: str
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# MENTOR SCHEMAS
# ============================================================================

class MentorProfileResponse(BaseModel):
    """Schema representing a mentor profile."""
    id: str
    user_id: str
    email: str
    full_name: str
    company_name: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class MentorReviewReportRequest(BaseModel):
    """Schema for mentor feedback and grading on a report."""
    mentor_feedback: str = Field(..., min_length=1)
    mentor_score: float = Field(..., ge=1.0, le=5.0)
    status: str = Field(default="Approved")


class AssignedStudentItem(BaseModel):
    """Schema for student assigned to a mentor."""
    student_id: str
    user_id: str
    student_name: str
    email: str
    college: Optional[str] = None
    department: Optional[str] = None
    internship_id: Optional[str] = None
    internship_title: Optional[str] = None
    company_name: Optional[str] = None
    reports_submitted: int = 0
    latest_report: Optional[ProgressReportResponse] = None
    tasks_completed: int = 0
    tasks_total: int = 0
    attention_status: str = "ON_TRACK"
    attention_score: float = 100.0


# ============================================================================
# ADMIN SCHEMAS
# ============================================================================

class AdminOverviewResponse(BaseModel):
    """Schema representing institutional high-level overview."""
    total_students: int
    active_internships: int
    total_companies: int
    total_mentors: int
    pending_applications: int
    reports_pending_review: int
    students_needing_attention: int
    internships_completed: int


class AdminApplicationItem(BaseModel):
    """Schema representing an internship application in admin queue."""
    application_id: str
    student_id: str
    student_name: str
    student_email: str
    internship_id: str
    internship_title: str
    company_name: str
    status: str
    applied_at: datetime


class AdminApplicationActionRequest(BaseModel):
    """Schema for approving or rejecting an application."""
    status: str = Field(..., description="'Approved' or 'Rejected'")


class AdminAssignMentorRequest(BaseModel):
    """Schema for assigning mentor to an internship."""
    mentor_id: str
    internship_id: str


# ============================================================================
# ALERT SCHEMAS
# ============================================================================

class AlertResponse(BaseModel):
    """Schema representing an early-intervention attention alert."""
    id: str
    student_id: str
    student_name: Optional[str] = None
    internship_id: Optional[str] = None
    title: str
    message: str
    severity: str
    is_read: bool
    is_resolved: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AlertResolveRequest(BaseModel):
    """Schema for resolving an alert."""
    is_resolved: bool = True


# ============================================================================
# INTELLIGENCE EXTENDED SCHEMAS
# ============================================================================

class QualityScoreResult(BaseModel):
    """Explainable Internship Quality Score."""
    quality_score: float
    breakdown: Dict[str, Any]
    explanation: str


class CompletionReadinessResult(BaseModel):
    """Internship Completion Readiness evaluation."""
    status: str  # "READY" or "PENDING ITEMS"
    completion_score: float
    pending_items: List[str]
    summary: str


class GrowthAnalyticsResult(BaseModel):
    """Student Growth Analytics over time."""
    has_sufficient_data: bool
    message: Optional[str] = None
    weeks: List[Dict[str, Any]] = []
    skills_practiced: List[str] = []
    average_mentor_score: Optional[float] = None
    reports_count: int = 0
    tasks_completed_count: int = 0
