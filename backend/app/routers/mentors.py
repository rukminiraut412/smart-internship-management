"""Mentor-related API endpoints for intern supervision, report review, and evaluations."""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Application,
    Evaluation,
    Internship,
    Mentor,
    ProgressReport,
    Student,
    Task,
    User,
)
from app.schemas import (
    EvaluationCreate,
    EvaluationResponse,
    MentorInternItem,
    MentorProfileResponse,
    MentorProfileUpdateRequest,
    ProgressReportResponse,
    ReportReviewRequest,
    TaskCreateRequest,
    TaskResponse,
)
from app.security import get_current_user

router = APIRouter(
    prefix="/mentors",
    tags=["Mentors"],
)


def _get_resolved_mentor(
    db: Session,
    mentor_id_or_user_id: str,
) -> Optional[Mentor]:
    """Helper to resolve Mentor record by either canonical Mentor.id or User.id."""
    return (
        db.query(Mentor)
        .filter(
            (Mentor.id == mentor_id_or_user_id)
            | (Mentor.user_id == mentor_id_or_user_id)
        )
        .first()
    )


@router.get(
    "/me",
    response_model=MentorProfileResponse,
    summary="Get current mentor profile",
    description="Retrieve the mentor profile of the authenticated user.",
)
def get_mentor_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve currently authenticated mentor's profile."""
    if current_user.role not in ["mentor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to mentor and admin accounts",
        )

    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()

    if not mentor:
        mentor = Mentor(
            user_id=current_user.id,
            job_title="Industry Mentor",
            department="Engineering",
            company_name="Partner Organization",
        )
        db.add(mentor)
        db.commit()
        db.refresh(mentor)

    company_name = (
        mentor.company_name
        or (mentor.company.name if mentor.company else "Independent / Partner")
    )

    return MentorProfileResponse(
        id=mentor.id,
        user_id=mentor.user_id,
        name=current_user.full_name,
        email=current_user.email,
        company_id=mentor.company_id,
        company_name=company_name,
        job_title=mentor.job_title or "Industry Supervisor",
        department=mentor.department or "Department of Engineering",
        phone=mentor.phone or "+1 (555) 000-0000",
        created_at=mentor.created_at,
        updated_at=mentor.updated_at,
    )


@router.put(
    "/me",
    response_model=MentorProfileResponse,
    summary="Update current mentor profile",
    description="Update mentor contact info, job title, department, or company.",
)
def update_mentor_me(
    payload: MentorProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update mentor profile details and persist to database."""
    if current_user.role not in ["mentor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to mentor and admin accounts",
        )

    mentor = db.query(Mentor).filter(Mentor.user_id == current_user.id).first()

    if not mentor:
        mentor = Mentor(user_id=current_user.id)
        db.add(mentor)

    if payload.name:
        current_user.full_name = payload.name.strip()

    if payload.company_name is not None:
        mentor.company_name = payload.company_name.strip()

    if payload.job_title is not None:
        mentor.job_title = payload.job_title.strip()

    if payload.department is not None:
        mentor.department = payload.department.strip()

    if payload.phone is not None:
        mentor.phone = payload.phone.strip()

    mentor.updated_at = datetime.utcnow()
    current_user.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(mentor)
    db.refresh(current_user)

    company_name = (
        mentor.company_name
        or (mentor.company.name if mentor.company else "Partner Organization")
    )

    return MentorProfileResponse(
        id=mentor.id,
        user_id=mentor.user_id,
        name=current_user.full_name,
        email=current_user.email,
        company_id=mentor.company_id,
        company_name=company_name,
        job_title=mentor.job_title,
        department=mentor.department,
        phone=mentor.phone,
        created_at=mentor.created_at,
        updated_at=mentor.updated_at,
    )


@router.get(
    "/{mentor_id}/interns",
    response_model=List[MentorInternItem],
    summary="Get assigned interns for a mentor",
    description="Retrieve all interns currently supervised by this mentor.",
)
def get_mentor_interns(
    mentor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all interns assigned to the mentor."""
    mentor = _get_resolved_mentor(db, mentor_id)

    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mentor with ID '{mentor_id}' not found",
        )

    internships = (
        db.query(Internship)
        .filter(Internship.mentor_id == mentor.id)
        .all()
    )

    internship_ids = [i.id for i in internships]

    applications = []

    if internship_ids:
        applications = (
            db.query(Application)
            .filter(
                Application.internship_id.in_(internship_ids),
                Application.status.in_(["Approved", "Active"]),
            )
            .all()
        )

    # If mentor has no assigned applications yet, fallback to all active applications
    # so prototype/demo experience stays interactive.
    if not applications:
        applications = (
            db.query(Application)
            .filter(Application.status.in_(["Approved", "Active"]))
            .all()
        )

    results: List[MentorInternItem] = []

    for app in applications:
        student = app.student

        if not student:
            continue

        internship = app.internship

        internship_title = (
            internship.title
            if internship
            else "Software Engineering Intern"
        )

        company_name = (
            internship.company.name
            if internship and internship.company
            else (
                mentor.company_name
                or "CloudScale Distributed Systems"
            )
        )

        reports = (
            db.query(ProgressReport)
            .filter(ProgressReport.student_id == student.id)
            .all()
        )

        reports_count = len(reports)

        total_reports = 12

        progress_pct = min(
            100,
            int((reports_count / total_reports) * 100),
        )

        tasks = (
            db.query(Task)
            .filter(Task.student_id == student.id)
            .all()
        )

        completed_tasks = sum(
            1 for t in tasks if t.status == "Completed"
        )

        total_tasks = len(tasks)

        attention_status = "ON_TRACK"

        has_low_score = any(
            r.mentor_score is not None and r.mentor_score < 3.5
            for r in reports
        )

        has_revision = any(
            r.status == "Needs Revision"
            for r in reports
        )

        if has_low_score or has_revision:
            attention_status = "NEEDS_ATTENTION"

        elif (
            reports_count < 3
            and total_tasks > 0
            and completed_tasks == 0
        ):
            attention_status = "MONITOR"

        latest_report = (
            db.query(ProgressReport)
            .filter(ProgressReport.student_id == student.id)
            .order_by(ProgressReport.week_number.desc())
            .first()
        )

        results.append(
            MentorInternItem(
                student_id=student.id,
                user_id=student.user_id,
                student_name=(
                    student.user.full_name
                    if student.user
                    else "Student"
                ),
                student_email=(
                    student.user.email
                    if student.user
                    else "student@university.edu"
                ),
                student_id_number=(
                    student.student_id_number
                    or "STU-2026-8842"
                ),
                college=(
                    student.college
                    or "School of Engineering"
                ),
                department=(
                    student.department
                    or "Computer Science"
                ),
                internship_id=(
                    internship.id
                    if internship
                    else app.internship_id
                ),
                internship_title=internship_title,
                company_name=company_name,
                progress_pct=progress_pct,
                tasks_completed=completed_tasks,
                total_tasks=total_tasks,
                reports_submitted=reports_count,
                total_reports=total_reports,
                attention_status=attention_status,
                latest_report_status=(
                    latest_report.status
                    if latest_report
                    else "Pending Submission"
                ),
            )
        )

    return results


@router.put(
    "/reports/{report_id}/review",
    response_model=ProgressReportResponse,
    summary="Review a weekly progress report",
    description="Submit mentor score, feedback, and update report status (Approved, Needs Revision, Rejected).",
)
def review_progress_report(
    report_id: str,
    payload: ReportReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Review and grade an intern's weekly report."""
    if current_user.role not in ["mentor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors and administrators can review progress reports",
        )

    report = (
        db.query(ProgressReport)
        .filter(ProgressReport.id == report_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Progress report with ID '{report_id}' not found",
        )

    report.status = payload.status

    if payload.mentor_feedback is not None:
        report.mentor_feedback = payload.mentor_feedback

    if payload.mentor_score is not None:
        report.mentor_score = payload.mentor_score

    report.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(report)

    return report


@router.post(
    "/evaluations",
    response_model=EvaluationResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit student evaluation",
    description="Submit formal midterm or final evaluation for an intern.",
)
def create_evaluation(
    payload: EvaluationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Submit formal intern evaluation."""
    if current_user.role not in ["mentor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors and administrators can submit evaluations",
        )

    mentor = (
        db.query(Mentor)
        .filter(Mentor.user_id == current_user.id)
        .first()
    )

    mentor_id = mentor.id if mentor else current_user.id

    student = (
        db.query(Student)
        .filter(
            (Student.id == payload.student_id)
            | (Student.user_id == payload.student_id)
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{payload.student_id}' not found",
        )

    evaluation = Evaluation(
        student_id=student.id,
        internship_id=payload.internship_id,
        mentor_id=mentor_id,
        evaluation_type=payload.evaluation_type,
        rating=payload.rating,
        comments=payload.comments,
        recommendation=payload.recommendation,
    )

    db.add(evaluation)
    db.commit()
    db.refresh(evaluation)

    return evaluation


@router.get(
    "/{mentor_id}/evaluations",
    response_model=List[EvaluationResponse],
    summary="List mentor evaluations",
)
def list_evaluations(
    mentor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List evaluations submitted by this mentor."""
    mentor = _get_resolved_mentor(db, mentor_id)

    resolved_id = mentor.id if mentor else mentor_id

    evals = (
        db.query(Evaluation)
        .filter(Evaluation.mentor_id == resolved_id)
        .order_by(Evaluation.created_at.desc())
        .all()
    )

    return evals


@router.get(
    "/{mentor_id}/tasks",
    response_model=List[TaskResponse],
    summary="List mentor tasks",
)
def list_tasks(
    mentor_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List tasks assigned by mentor."""
    mentor = _get_resolved_mentor(db, mentor_id)

    resolved_id = mentor.id if mentor else mentor_id

    tasks = (
        db.query(Task)
        .filter(
            (Task.mentor_id == resolved_id)
            | (Task.mentor_id.is_(None))
        )
        .order_by(Task.created_at.desc())
        .all()
    )

    return tasks


@router.post(
    "/tasks",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create intern task",
)
def create_task(
    payload: TaskCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new work item / task for an intern."""
    if current_user.role not in ["mentor", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentors and administrators can create tasks",
        )

    mentor = (
        db.query(Mentor)
        .filter(Mentor.user_id == current_user.id)
        .first()
    )

    mentor_id = mentor.id if mentor else None

    student = (
        db.query(Student)
        .filter(
            (Student.id == payload.student_id)
            | (Student.user_id == payload.student_id)
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{payload.student_id}' not found",
        )

    task = Task(
        internship_id=payload.internship_id,
        student_id=student.id,
        mentor_id=mentor_id,
        title=payload.title,
        description=payload.description,
        category=payload.category,
        due_date=payload.due_date,
        status="Pending",
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task