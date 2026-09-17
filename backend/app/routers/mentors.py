"""Mentor portal API endpoints."""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Application,
    Company,
    Evaluation,
    Internship,
    Mentor,
    ProgressReport,
    Student,
    Task,
    User,
)
from app.schemas import (
    AssignedStudentItem,
    MentorProfileResponse,
    MentorReviewReportRequest,
    ProgressReportResponse,
)
from app.security import get_current_user
from intelligence.app.progress_analysis import evaluate_progress_attention

router = APIRouter(
    prefix="/mentors",
    tags=["Mentors"],
)


class EvaluationCreate(BaseModel):
    student_id: str
    internship_id: str
    mentor_id: Optional[str] = None
    evaluation_type: str = Field(default="Midterm")
    rating: float = Field(..., ge=1.0, le=5.0)
    comments: Optional[str] = None
    recommendation: Optional[str] = None


class EvaluationResponse(BaseModel):
    id: str
    student_id: str
    internship_id: str
    mentor_id: str
    evaluation_type: str
    rating: float
    comments: Optional[str] = None
    recommendation: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get(
    "/me",
    response_model=MentorProfileResponse,
    summary="Get current mentor profile",
    description="Retrieve the profile of the authenticated mentor.",
)
def get_current_mentor(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve profile of authenticated mentor."""
    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()
    if not mentor:
        if current_user.role == "mentor":
            mentor = Mentor(
                user_id=current_user.id,
                job_title="Internship Mentor",
                company_name="Affiliated Partner",
            )
            db.add(mentor)
            db.commit()
            db.refresh(mentor)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Current user is not a mentor",
            )

    return MentorProfileResponse(
        id=mentor.id,
        user_id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        company_name=mentor.company_name or (mentor.company.name if mentor.company else None),
        job_title=mentor.job_title,
        department=mentor.department,
        phone=mentor.phone,
    )


@router.get(
    "/{mentor_id}/interns",
    response_model=List[AssignedStudentItem],
    summary="Get assigned interns",
    description="Retrieve all interns assigned to this mentor with their current metrics and attention status.",
)
def get_assigned_interns(
    mentor_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve assigned interns for a mentor."""
    mentor = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mentor with ID '{mentor_id}' not found",
        )

    # Find internships supervised by this mentor
    internships = db.query(Internship).filter(Internship.mentor_id == mentor_id).all()
    internship_ids = [i.id for i in internships]

    # Find applications for these internships
    applications = (
        db.query(Application)
        .filter(Application.internship_id.in_(internship_ids))
        .all()
    ) if internship_ids else []

    # If no explicitly assigned internships, also check tasks or student applications
    # or fallback to active students if mentor has an assigned company
    items = []
    seen_students = set()

    for app_record in applications:
        student = app_record.student
        if not student or student.id in seen_students:
            continue
        seen_students.add(student.id)

        internship = app_record.internship
        company_name = internship.company.name if internship and internship.company else "Organization"

        # Reports metrics
        reports = (
            db.query(ProgressReport)
            .filter(ProgressReport.student_id == student.id)
            .order_by(ProgressReport.week_number.desc())
            .all()
        )
        reports_count = len(reports)
        latest_report = ProgressReportResponse.model_validate(reports[0]) if reports else None

        # Tasks metrics
        tasks = db.query(Task).filter(Task.student_id == student.id).all()
        tasks_total = len(tasks)
        tasks_completed = sum(1 for t in tasks if t.status == "Completed")

        # Evaluate attention status
        rep_submission_rate = min(100.0, (reports_count / max(1, reports_count, 5)) * 100.0)
        task_completion_rate = min(100.0, (tasks_completed / max(1, tasks_total)) * 100.0) if tasks_total > 0 else 80.0
        approved_reports = sum(1 for r in reports if r.status == "Approved")
        consistency = min(100.0, (approved_reports / max(1, reports_count)) * 100.0) if reports_count > 0 else 80.0
        scores = [r.mentor_score for r in reports if r.mentor_score is not None]
        mentor_score_avg = (sum(scores) / len(scores) / 5.0 * 100.0) if scores else 85.0

        attn = evaluate_progress_attention(
            progress_consistency=consistency,
            task_completion=task_completion_rate,
            report_submission=rep_submission_rate,
            mentor_feedback=mentor_score_avg,
        )

        items.append(
            AssignedStudentItem(
                student_id=student.id,
                user_id=student.user.id if student.user else student.user_id,
                student_name=student.user.full_name if student.user else "Student",
                email=student.user.email if student.user else "",
                college=student.college,
                department=student.department,
                internship_id=internship.id if internship else None,
                internship_title=internship.title if internship else "Internship",
                company_name=company_name,
                reports_submitted=reports_count,
                latest_report=latest_report,
                tasks_completed=tasks_completed,
                tasks_total=tasks_total,
                attention_status=attn.status,
                attention_score=float(attn.score),
            )
        )

    # If mentor has no explicitly linked internships, allow seeing all active applications for convenience
    if not items:
        all_apps = db.query(Application).filter(Application.status == "Approved").all()
        for app_record in all_apps:
            student = app_record.student
            if not student or student.id in seen_students:
                continue
            seen_students.add(student.id)

            internship = app_record.internship
            company_name = internship.company.name if internship and internship.company else "Organization"

            reports = db.query(ProgressReport).filter(ProgressReport.student_id == student.id).order_by(ProgressReport.week_number.desc()).all()
            reports_count = len(reports)
            latest_report = ProgressReportResponse.model_validate(reports[0]) if reports else None

            tasks = db.query(Task).filter(Task.student_id == student.id).all()
            tasks_total = len(tasks)
            tasks_completed = sum(1 for t in tasks if t.status == "Completed")

            attn = evaluate_progress_attention(
                progress_consistency=80.0 if reports_count == 0 else min(100.0, (sum(1 for r in reports if r.status == "Approved") / reports_count) * 100.0),
                task_completion=80.0 if tasks_total == 0 else min(100.0, (tasks_completed / tasks_total) * 100.0),
                report_submission=min(100.0, (reports_count / 5.0) * 100.0),
                mentor_feedback=85.0,
            )

            items.append(
                AssignedStudentItem(
                    student_id=student.id,
                    user_id=student.user.id if student.user else student.user_id,
                    student_name=student.user.full_name if student.user else "Student",
                    email=student.user.email if student.user else "",
                    college=student.college,
                    department=student.department,
                    internship_id=internship.id if internship else None,
                    internship_title=internship.title if internship else "Internship",
                    company_name=company_name,
                    reports_submitted=reports_count,
                    latest_report=latest_report,
                    tasks_completed=tasks_completed,
                    tasks_total=tasks_total,
                    attention_status=attn.status,
                    attention_score=float(attn.score),
                )
            )

    return items


@router.put(
    "/reports/{report_id}/review",
    response_model=ProgressReportResponse,
    summary="Review weekly report",
    description="Add mentor feedback and score to an intern's weekly report and update status.",
)
def review_weekly_report(
    report_id: str,
    payload: MentorReviewReportRequest,
    db: Session = Depends(get_db),
):
    """Review and score a weekly report."""
    report = db.query(ProgressReport).filter(ProgressReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Progress report with ID '{report_id}' not found",
        )

    report.mentor_feedback = payload.mentor_feedback.strip()
    report.mentor_score = payload.mentor_score
    report.status = payload.status or "Approved"
    db.commit()
    db.refresh(report)
    return report


@router.post(
    "/evaluations",
    response_model=EvaluationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit mentor evaluation",
    description="Submit a formal midterm or final performance evaluation for an intern.",
)
def submit_evaluation(
    payload: EvaluationCreate,
    db: Session = Depends(get_db),
):
    """Submit intern evaluation."""
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{payload.student_id}' not found",
        )

    internship = db.query(Internship).filter(Internship.id == payload.internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID '{payload.internship_id}' not found",
        )

    # Determine mentor ID
    mentor_id = payload.mentor_id or internship.mentor_id
    if not mentor_id:
        # Pick default mentor if available
        first_mentor = db.query(Mentor).first()
        if first_mentor:
            mentor_id = first_mentor.id
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mentor ID is required",
            )

    eval_record = Evaluation(
        student_id=payload.student_id,
        internship_id=payload.internship_id,
        mentor_id=mentor_id,
        evaluation_type=payload.evaluation_type,
        rating=payload.rating,
        comments=payload.comments,
        recommendation=payload.recommendation,
    )
    db.add(eval_record)
    db.commit()
    db.refresh(eval_record)
    return eval_record
