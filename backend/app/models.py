"""SQLAlchemy database models for Smart Internship Management platform.

Entities:
1. User
2. Student
3. Mentor
4. Company
5. Internship
6. Application
7. ProgressReport
8. Task
9. Skill
10. InternshipSkill
11. Evaluation
12. Alert
13. StudentSkill
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.database import Base


def generate_uuid() -> str:
    """Generate a standard UUID4 string for primary keys."""
    return str(uuid.uuid4())


# ============================================================================
# 1. USER MODEL
# ============================================================================
class User(Base):
    """Core user entity representing system accounts (Student, Mentor, Admin, Company)."""

    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # student, mentor, admin, company
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # 1-to-1 relationships with specialized profiles
    student = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")
    mentor = relationship("Mentor", back_populates="user", uselist=False, cascade="all, delete-orphan")

    @property
    def student_id(self) -> Optional[str]:
        return self.student.id if self.student else None

    @property
    def mentor_id(self) -> Optional[str]:
        return self.mentor.id if self.mentor else None

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"


# ============================================================================
# 2. STUDENT MODEL
# ============================================================================
class Student(Base):
    """Student profile containing academic and contact details."""

    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    student_id_number = Column(String(100), unique=True, nullable=True, index=True)  # e.g., STU-2026-8842
    phone = Column(String(50), nullable=True)
    college = Column(String(255), nullable=True)
    university = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    year_of_study = Column(String(100), nullable=True)
    gpa = Column(Float, nullable=True)
    resume_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="student")
    student_skills = relationship("StudentSkill", back_populates="student", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="student", cascade="all, delete-orphan")
    progress_reports = relationship("ProgressReport", back_populates="student", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="student", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="student", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Student id={self.id} user_id={self.user_id} student_id_number={self.student_id_number}>"


# ============================================================================
# 3. MENTOR MODEL
# ============================================================================
class Mentor(Base):
    """Mentor profile containing professional role and organizational affiliations."""

    __tablename__ = "mentors"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="SET NULL"), nullable=True)
    job_title = Column(String(255), nullable=True)
    department = Column(String(255), nullable=True)
    company_name = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="mentor")
    company = relationship("Company", back_populates="mentors")
    internships = relationship("Internship", back_populates="mentor")
    created_tasks = relationship("Task", back_populates="mentor")
    evaluations = relationship("Evaluation", back_populates="mentor", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Mentor id={self.id} user_id={self.user_id} title={self.job_title}>"


# ============================================================================
# 4. COMPANY MODEL
# ============================================================================
class Company(Base):
    """Organization offering internship opportunities."""

    __tablename__ = "companies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False, index=True)
    website = Column(String(255), nullable=True)
    industry = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    internships = relationship("Internship", back_populates="company", cascade="all, delete-orphan")
    mentors = relationship("Mentor", back_populates="company")

    def __repr__(self) -> str:
        return f"<Company id={self.id} name={self.name}>"


# ============================================================================
# 5. INTERNSHIP MODEL
# ============================================================================
class Internship(Base):
    """Internship opportunity created by a company and supervised by a mentor."""

    __tablename__ = "internships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    company_id = Column(String(36), ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)
    mentor_id = Column(String(36), ForeignKey("mentors.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    domain = Column(String(255), nullable=True)  # e.g., Cloud, AI, Web Development
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    mode = Column(String(50), default="Hybrid", nullable=False)  # Online, Offline, Hybrid
    status = Column(String(50), default="Open", nullable=False)  # Open, Active, Closed, Completed
    stipend = Column(String(100), nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    company = relationship("Company", back_populates="internships")
    mentor = relationship("Mentor", back_populates="internships")
    internship_skills = relationship("InternshipSkill", back_populates="internship", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="internship", cascade="all, delete-orphan")
    progress_reports = relationship("ProgressReport", back_populates="internship", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="internship", cascade="all, delete-orphan")
    evaluations = relationship("Evaluation", back_populates="internship", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="internship", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Internship id={self.id} title={self.title} status={self.status}>"


# ============================================================================
# 6. APPLICATION MODEL
# ============================================================================
class Application(Base):
    """Student application to a specific internship."""

    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    internship_id = Column(String(36), ForeignKey("internships.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="Pending", nullable=False)  # Pending, Approved, Rejected, Withdrawn
    cover_letter = Column(Text, nullable=True)
    applied_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="applications")
    internship = relationship("Internship", back_populates="applications")

    def __repr__(self) -> str:
        return f"<Application id={self.id} student_id={self.student_id} status={self.status}>"


# ============================================================================
# 7. PROGRESS REPORT MODEL
# ============================================================================
class ProgressReport(Base):
    """Weekly or periodic progress log submitted by a student during an internship."""

    __tablename__ = "progress_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    internship_id = Column(String(36), ForeignKey("internships.id", ondelete="CASCADE"), nullable=False)
    week_number = Column(Integer, nullable=False)
    title = Column(String(255), nullable=True)
    summary = Column(Text, nullable=True)
    hours_logged = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="Pending Submission", nullable=False)  # Pending Submission, Under Review, Approved
    mentor_feedback = Column(Text, nullable=True)
    mentor_score = Column(Float, nullable=True)  # e.g., 1.0 to 5.0
    submission_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="progress_reports")
    internship = relationship("Internship", back_populates="progress_reports")

    def __repr__(self) -> str:
        return f"<ProgressReport id={self.id} week={self.week_number} status={self.status}>"


# ============================================================================
# 8. TASK MODEL
# ============================================================================
class Task(Base):
    """Work items and deliverables assigned to a student during an internship."""

    __tablename__ = "tasks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    internship_id = Column(String(36), ForeignKey("internships.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    mentor_id = Column(String(36), ForeignKey("mentors.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)  # Architecture, Database, API, Testing, etc.
    status = Column(String(50), default="Pending", nullable=False)  # Pending, In Progress, Completed
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    internship = relationship("Internship", back_populates="tasks")
    student = relationship("Student", back_populates="tasks")
    mentor = relationship("Mentor", back_populates="created_tasks")

    def __repr__(self) -> str:
        return f"<Task id={self.id} title={self.title} status={self.status}>"


# ============================================================================
# 9. SKILL MODEL
# ============================================================================
class Skill(Base):
    """Master skill dictionary (e.g., Python, PostgreSQL, Docker)."""

    __tablename__ = "skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=True)  # Programming, Framework, Database, Tool
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships with association models
    student_skills = relationship("StudentSkill", back_populates="skill", cascade="all, delete-orphan")
    internship_skills = relationship("InternshipSkill", back_populates="skill", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Skill id={self.id} name={self.name}>"


# ============================================================================
# 10. STUDENT SKILL MODEL (Student ↔ Skill association)
# ============================================================================
class StudentSkill(Base):
    """Association model connecting Student to Skill with proficiency level."""

    __tablename__ = "student_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency_level = Column(String(50), default="Beginner", nullable=False)  # Beginner, Intermediate, Advanced
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("student_id", "skill_id", name="uq_student_skill"),
    )

    # Relationships
    student = relationship("Student", back_populates="student_skills")
    skill = relationship("Skill", back_populates="student_skills")

    def __repr__(self) -> str:
        return f"<StudentSkill student_id={self.student_id} skill_id={self.skill_id} level={self.proficiency_level}>"


# ============================================================================
# 11. INTERNSHIP SKILL MODEL (Internship ↔ Skill association)
# ============================================================================
class InternshipSkill(Base):
    """Association model connecting Internship to Skill with required level."""

    __tablename__ = "internship_skills"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    internship_id = Column(String(36), ForeignKey("internships.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(String(36), ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    required_level = Column(String(50), default="Intermediate", nullable=False)  # Beginner, Intermediate, Advanced
    is_mandatory = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("internship_id", "skill_id", name="uq_internship_skill"),
    )

    # Relationships
    internship = relationship("Internship", back_populates="internship_skills")
    skill = relationship("Skill", back_populates="internship_skills")

    def __repr__(self) -> str:
        return f"<InternshipSkill internship_id={self.internship_id} skill_id={self.skill_id} level={self.required_level}>"


# ============================================================================
# 12. EVALUATION MODEL
# ============================================================================
class Evaluation(Base):
    """Performance evaluation submitted by a mentor for an intern."""

    __tablename__ = "evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    internship_id = Column(String(36), ForeignKey("internships.id", ondelete="CASCADE"), nullable=False)
    mentor_id = Column(String(36), ForeignKey("mentors.id", ondelete="CASCADE"), nullable=False)
    evaluation_type = Column(String(50), default="Midterm", nullable=False)  # Midterm, Final, Monthly
    rating = Column(Float, nullable=False)  # Score/rating e.g. 1.0 - 5.0
    comments = Column(Text, nullable=True)
    recommendation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="evaluations")
    internship = relationship("Internship", back_populates="evaluations")
    mentor = relationship("Mentor", back_populates="evaluations")

    def __repr__(self) -> str:
        return f"<Evaluation id={self.id} type={self.evaluation_type} rating={self.rating}>"


# ============================================================================
# 13. ALERT MODEL
# ============================================================================
class Alert(Base):
    """Automated or mentor-flagged alert regarding student progress or risks."""

    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    internship_id = Column(String(36), ForeignKey("internships.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(50), default="Info", nullable=False)  # Info, Warning, Critical
    is_read = Column(Boolean, default=False, nullable=False)
    is_resolved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    student = relationship("Student", back_populates="alerts")
    internship = relationship("Internship", back_populates="alerts")

    def __repr__(self) -> str:
        return f"<Alert id={self.id} severity={self.severity} title={self.title}>"
