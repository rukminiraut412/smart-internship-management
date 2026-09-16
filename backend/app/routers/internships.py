"""Internship and weekly progress report endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Company, Internship, Mentor, ProgressReport, Student
from app.schemas import (
    InternshipCreate,
    InternshipResponse,
    ProgressReportCreate,
    ProgressReportResponse,
)

router = APIRouter(
    prefix="/internships",
    tags=["Internships"],
)


@router.post(
    "",
    response_model=InternshipResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new internship",
    description="Create an internship opportunity linked to a valid company and optional mentor.",
)
def create_internship(
    payload: InternshipCreate,
    db: Session = Depends(get_db),
):
    """Create a new internship opportunity."""
    # Validate company existence
    company = db.query(Company).filter(Company.id == payload.company_id).first()
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID '{payload.company_id}' not found",
        )

    # Validate mentor existence if supplied
    if payload.mentor_id:
        mentor = db.query(Mentor).filter(Mentor.id == payload.mentor_id).first()
        if not mentor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Mentor with ID '{payload.mentor_id}' not found",
            )

    new_internship = Internship(
        company_id=payload.company_id,
        mentor_id=payload.mentor_id,
        title=payload.title,
        domain=payload.domain,
        description=payload.description,
        location=payload.location,
        mode=payload.mode,
        status=payload.status,
        stipend=payload.stipend,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(new_internship)
    db.commit()
    db.refresh(new_internship)

    response_data = InternshipResponse.model_validate(new_internship)
    response_data.company_name = company.name
    return response_data


@router.get(
    "",
    response_model=List[InternshipResponse],
    summary="List internships",
    description="Retrieve all internships, optionally filtered by domain or status.",
)
def list_internships(
    domain: Optional[str] = Query(None, description="Filter by domain"),
    status: Optional[str] = Query(None, description="Filter by status (e.g. Open, Active)"),
    db: Session = Depends(get_db),
):
    """List all available internships."""
    query = db.query(Internship)
    if domain:
        query = query.filter(Internship.domain.ilike(f"%{domain}%"))
    if status:
        query = query.filter(Internship.status == status)

    internships = query.all()
    results = []
    for item in internships:
        res = InternshipResponse.model_validate(item)
        if item.company:
            res.company_name = item.company.name
        results.append(res)
    return results


@router.get(
    "/{internship_id}",
    response_model=InternshipResponse,
    summary="Get internship details",
    description="Retrieve specific details of an internship by its unique identifier.",
)
def get_internship(
    internship_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve details of an internship by ID."""
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID '{internship_id}' not found",
        )

    res = InternshipResponse.model_validate(internship)
    if internship.company:
        res.company_name = internship.company.name
    return res


# ============================================================================
# WEEKLY PROGRESS REPORT ENDPOINTS
# ============================================================================

@router.post(
    "/{internship_id}/reports",
    response_model=ProgressReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a weekly progress report",
    description="Submit a weekly progress report for a student enrolled in the specified internship.",
)
def create_progress_report(
    internship_id: str,
    payload: ProgressReportCreate,
    db: Session = Depends(get_db),
):
    """Create a weekly progress report for an internship."""
    # Verify internship exists
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID '{internship_id}' not found",
        )

    # Verify student exists
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{payload.student_id}' not found",
        )

    # Prevent duplicate report for the same student + internship + week
    existing_report = (
        db.query(ProgressReport)
        .filter(
            ProgressReport.internship_id == internship_id,
            ProgressReport.student_id == payload.student_id,
            ProgressReport.week_number == payload.week_number,
        )
        .first()
    )
    if existing_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Progress report for week {payload.week_number} already exists for this student in this internship",
        )

    report = ProgressReport(
        internship_id=internship_id,
        student_id=payload.student_id,
        week_number=payload.week_number,
        title=payload.title or f"Week {payload.week_number} Progress Report",
        summary=payload.summary,
        hours_logged=payload.hours_logged,
        status=payload.status,
        mentor_feedback=payload.mentor_feedback,
        mentor_score=payload.mentor_score,
        submission_date=payload.submission_date,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return report


@router.get(
    "/{internship_id}/reports",
    response_model=List[ProgressReportResponse],
    summary="List weekly progress reports for an internship",
    description="Retrieve all weekly progress reports for an internship, optionally filtered by student_id.",
)
def list_internship_reports(
    internship_id: str,
    student_id: Optional[str] = Query(None, description="Filter reports by student ID"),
    db: Session = Depends(get_db),
):
    """List progress reports for an internship."""
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID '{internship_id}' not found",
        )

    query = db.query(ProgressReport).filter(ProgressReport.internship_id == internship_id)
    if student_id:
        query = query.filter(ProgressReport.student_id == student_id)

    reports = query.order_by(ProgressReport.week_number.asc()).all()
    return reports
