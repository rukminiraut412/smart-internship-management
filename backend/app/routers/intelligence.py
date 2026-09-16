"""Intelligence and analytics endpoints connecting pure deterministic Python modules.

Uses intelligence.app.skill_gap and intelligence.app.progress_analysis
without any external AI API.
"""

from typing import List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Internship, InternshipSkill, ProgressReport, Student, StudentSkill, Task

# Import deterministic intelligence functions and schemas
from intelligence.app.models import (
    ProgressAttentionEngineResult,
    ProgressData,
    SkillGapRequest,
    SkillGapResult,
)
from intelligence.app.progress_analysis import (
    calculate_attention_score,
    evaluate_progress_attention,
)
from intelligence.app.skill_gap import analyze_skill_gap

router = APIRouter(
    prefix="/intelligence",
    tags=["Intelligence & Analytics"],
)


# Request schema for direct attention evaluation
class ProgressAttentionRequest(BaseModel):
    """Input metrics for progress attention evaluation (0 to 100)."""
    progress_consistency: Union[int, float] = Field(default=85.0, ge=0, le=100, description="Progress consistency (0-100)")
    task_completion: Union[int, float] = Field(default=80.0, ge=0, le=100, description="Task completion rate (0-100)")
    report_submission: Union[int, float] = Field(default=90.0, ge=0, le=100, description="Report submission rate (0-100)")
    mentor_feedback: Union[int, float] = Field(default=85.0, ge=0, le=100, description="Mentor feedback index (0-100)")


@router.post(
    "/skill-gap",
    response_model=SkillGapResult,
    summary="Evaluate Skill Gap",
    description="Deterministic comparison of student skills against required skills with explainable recommendations.",
)
def evaluate_skill_gap(payload: SkillGapRequest) -> SkillGapResult:
    """Execute deterministic skill gap analysis without external AI APIs."""
    return analyze_skill_gap(payload)


@router.get(
    "/skill-gap/{internship_id}",
    response_model=SkillGapResult,
    summary="Evaluate Skill Gap for Internship",
    description="Compare a student's skills against an internship's required skills from the database.",
)
def get_internship_skill_gap(
    internship_id: str,
    student_id: Optional[str] = Query(None, description="Optional student ID to evaluate against"),
    db: Session = Depends(get_db),
) -> SkillGapResult:
    """Compare student skills with an internship's declared skills."""
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID '{internship_id}' not found",
        )

    # Fetch required skills from database or fallback to domain keywords
    required_skills = [s.skill.name for s in internship.internship_skills if s.skill]
    if not required_skills:
        # If no explicit skills linked in DB, extract standard skills from internship domain/title
        if internship.domain and "cloud" in internship.domain.lower():
            required_skills = ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis"]
        else:
            required_skills = ["Python", "FastAPI", "PostgreSQL", "Docker"]

    student_skills: List[str] = []
    if student_id:
        student = db.query(Student).filter(Student.id == student_id).first()
        if student and student.student_skills:
            student_skills = [s.skill.name for s in student.student_skills if s.skill]

    if not student_skills:
        # Default student baseline skills if not yet added in database
        student_skills = ["Python", "FastAPI", "PostgreSQL", "Docker", "Git & GitHub"]

    return analyze_skill_gap(student_skills=student_skills, required_skills=required_skills)


@router.post(
    "/evaluate-attention",
    response_model=ProgressAttentionEngineResult,
    summary="Evaluate Internship Progress Attention",
    description="Deterministic formula evaluating student progress consistency, task completion, and report cadence.",
)
def evaluate_attention(payload: ProgressAttentionRequest) -> ProgressAttentionEngineResult:
    """Execute deterministic progress attention scoring without external AI APIs."""
    return evaluate_progress_attention(
        progress_consistency=payload.progress_consistency,
        task_completion=payload.task_completion,
        report_submission=payload.report_submission,
        mentor_feedback=payload.mentor_feedback,
    )


@router.get(
    "/attention-status/{student_id}",
    response_model=ProgressAttentionEngineResult,
    summary="Get Student Attention Status",
    description="Compute live explainable attention status for an enrolled student using their report and task history.",
)
def get_student_attention_status(
    student_id: str,
    db: Session = Depends(get_db),
) -> ProgressAttentionEngineResult:
    """Evaluate attention status for an enrolled student using actual reports and tasks in the DB."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    # 1. Evaluate report submission rate
    reports = db.query(ProgressReport).filter(ProgressReport.student_id == student_id).all()
    reports_submitted = len(reports)
    # Target baseline: at least 4-5 weekly reports in active cycle
    reports_expected = max(reports_submitted, 5)
    report_submission_rate = min(100.0, (reports_submitted / reports_expected) * 100.0) if reports_expected > 0 else 100.0

    # 2. Evaluate task completion rate
    tasks = db.query(Task).filter(Task.student_id == student_id).all()
    tasks_total = len(tasks)
    tasks_completed = sum(1 for t in tasks if t.status == "Completed")
    task_completion_rate = (
        min(100.0, (tasks_completed / tasks_total) * 100.0)
        if tasks_total > 0
        else (85.0 if reports_submitted >= 4 else 70.0)
    )

    # 3. Progress consistency & Mentor feedback
    approved_reports = sum(1 for r in reports if r.status == "Approved")
    progress_consistency = (
        min(100.0, (approved_reports / max(1, reports_submitted)) * 100.0)
        if reports_submitted > 0
        else 80.0
    )

    # Average mentor score if available (score / 5.0 * 100)
    scores = [r.mentor_score for r in reports if r.mentor_score is not None]
    mentor_feedback = (
        (sum(scores) / len(scores) / 5.0) * 100.0
        if scores
        else 85.0
    )

    return evaluate_progress_attention(
        progress_consistency=progress_consistency,
        task_completion=task_completion_rate,
        report_submission=report_submission_rate,
        mentor_feedback=mentor_feedback,
    )
