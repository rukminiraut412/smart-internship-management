"""Admin portal API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Alert,
    Application,
    Company,
    Internship,
    Mentor,
    ProgressReport,
    Student,
    User,
)
from app.schemas import (
    AdminApplicationActionRequest,
    AdminApplicationItem,
    AdminAssignMentorRequest,
    AdminOverviewResponse,
    InternshipResponse,
    MentorProfileResponse,
    StudentProfileResponse,
)

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


@router.get(
    "/overview",
    response_model=AdminOverviewResponse,
    summary="Get admin overview KPIs",
    description="Retrieve institution-wide metrics including students, active internships, pending applications, and alerts.",
)
def get_admin_overview(
    db: Session = Depends(get_db),
):
    """Compute and return aggregate institutional metrics."""
    total_students = db.query(Student).count()
    active_internships = db.query(Internship).filter(Internship.status.in_(["Active", "Open"])).count()
    total_companies = db.query(Company).count()
    total_mentors = db.query(Mentor).count()
    pending_applications = db.query(Application).filter(Application.status == "Pending").count()
    reports_pending_review = db.query(ProgressReport).filter(ProgressReport.status.in_(["Pending Submission", "Under Review"])).count()
    students_needing_attention = db.query(Alert).filter(Alert.is_resolved == False).count()
    internships_completed = db.query(Internship).filter(Internship.status == "Completed").count()

    return AdminOverviewResponse(
        total_students=total_students,
        active_internships=active_internships,
        total_companies=total_companies,
        total_mentors=total_mentors,
        pending_applications=pending_applications,
        reports_pending_review=reports_pending_review,
        students_needing_attention=students_needing_attention,
        internships_completed=internships_completed,
    )


@router.get(
    "/applications",
    response_model=List[AdminApplicationItem],
    summary="List student applications",
    description="List internship applications with optional filter by status.",
)
def list_applications(
    status: Optional[str] = Query(None, description="Filter applications by status"),
    db: Session = Depends(get_db),
):
    """List applications for admin oversight."""
    query = db.query(Application)
    if status:
        query = query.filter(Application.status == status)

    apps = query.order_by(Application.applied_at.desc()).all()
    results = []
    for a in apps:
        student = a.student
        internship = a.internship
        company_name = internship.company.name if internship and internship.company else "Organization"
        results.append(
            AdminApplicationItem(
                application_id=a.id,
                student_id=a.student_id,
                student_name=student.user.full_name if student and student.user else "Student",
                student_email=student.user.email if student and student.user else "",
                internship_id=a.internship_id,
                internship_title=internship.title if internship else "Internship",
                company_name=company_name,
                status=a.status,
                applied_at=a.applied_at,
            )
        )
    return results


@router.patch(
    "/applications/{application_id}",
    response_model=AdminApplicationItem,
    summary="Approve or reject application",
    description="Update the approval status of an internship placement application.",
)
def update_application_status(
    application_id: str,
    payload: AdminApplicationActionRequest,
    db: Session = Depends(get_db),
):
    """Approve or reject student application."""
    app_record = db.query(Application).filter(Application.id == application_id).first()
    if not app_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID '{application_id}' not found",
        )

    app_record.status = payload.status
    db.commit()
    db.refresh(app_record)

    student = app_record.student
    internship = app_record.internship
    company_name = internship.company.name if internship and internship.company else "Organization"

    return AdminApplicationItem(
        application_id=app_record.id,
        student_id=app_record.student_id,
        student_name=student.user.full_name if student and student.user else "Student",
        student_email=student.user.email if student and student.user else "",
        internship_id=app_record.internship_id,
        internship_title=internship.title if internship else "Internship",
        company_name=company_name,
        status=app_record.status,
        applied_at=app_record.applied_at,
    )


@router.get(
    "/mentors",
    response_model=List[MentorProfileResponse],
    summary="List mentors",
    description="Retrieve all registered mentors for placement supervisor assignment.",
)
def list_mentors(
    db: Session = Depends(get_db),
):
    """List mentors for assignment."""
    mentors = db.query(Mentor).all()
    results = []
    for m in mentors:
        results.append(
            MentorProfileResponse(
                id=m.id,
                user_id=m.user_id,
                email=m.user.email if m.user else "",
                full_name=m.user.full_name if m.user else "Mentor",
                company_name=m.company_name or (m.company.name if m.company else None),
                job_title=m.job_title,
                department=m.department,
                phone=m.phone,
            )
        )
    return results


@router.post(
    "/assign-mentor",
    summary="Assign mentor to internship",
    description="Link a mentor to supervise an internship opportunity.",
)
def assign_mentor(
    payload: AdminAssignMentorRequest,
    db: Session = Depends(get_db),
):
    """Assign mentor to internship."""
    internship = db.query(Internship).filter(Internship.id == payload.internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID '{payload.internship_id}' not found",
        )

    mentor = db.query(Mentor).filter(Mentor.id == payload.mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mentor with ID '{payload.mentor_id}' not found",
        )

    internship.mentor_id = mentor.id
    db.commit()
    db.refresh(internship)
    return {
        "success": True,
        "message": f"Assigned mentor '{mentor.user.full_name if mentor.user else mentor.id}' to internship '{internship.title}'",
    }
