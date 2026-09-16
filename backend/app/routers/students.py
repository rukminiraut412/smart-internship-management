"""Student-related API endpoints."""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, Company, Internship, Student
from app.schemas import (
    InternshipRegistrationRequest,
    InternshipResponse,
    StudentInternshipItem,
)

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


# ============================================================================
# GET STUDENT INTERNSHIPS
# ============================================================================

@router.get(
    "/{student_id}/internships",
    response_model=List[StudentInternshipItem],
    summary="Get student's internships",
    description="Retrieve all internships associated with a specific student through their applications.",
)
def get_student_internships(
    student_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve all internships for which the student has an application."""

    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    applications = (
        db.query(Application)
        .filter(Application.student_id == student_id)
        .order_by(Application.applied_at.desc())
        .all()
    )

    items = []

    for app_record in applications:
        internship = app_record.internship

        internship_data = InternshipResponse.model_validate(
            internship
        )

        if internship.company:
            internship_data.company_name = internship.company.name

        items.append(
            StudentInternshipItem(
                application_id=app_record.id,
                application_status=app_record.status,
                applied_at=app_record.applied_at,
                internship=internship_data,
            )
        )

    return items


# ============================================================================
# POST STUDENT INTERNSHIP REGISTRATION
# ============================================================================

@router.post(
    "/{student_id}/register-internship",
    response_model=StudentInternshipItem,
    status_code=status.HTTP_201_CREATED,
    summary="Register an internship",
    description="Allow a student to register an internship provided by the student.",
)
def register_internship(
    student_id: str,
    registration: InternshipRegistrationRequest,
    db: Session = Depends(get_db),
):
    """Register an internship for a student."""

    # ------------------------------------------------------------------------
    # 1. Check whether student exists
    # ------------------------------------------------------------------------

    student = (
        db.query(Student)
        .filter(Student.id == student_id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    # ------------------------------------------------------------------------
    # 2. Find existing company or create a new company
    # ------------------------------------------------------------------------

    company = (
        db.query(Company)
        .filter(Company.name == registration.company_name)
        .first()
    )

    if not company:
        company = Company(
            name=registration.company_name,
            location=registration.location,
        )

        db.add(company)
        db.flush()

    # ------------------------------------------------------------------------
    # 3. Create internship
    # ------------------------------------------------------------------------

    internship = Internship(
        company_id=company.id,
        title=registration.internship_title,
        domain=registration.domain,
        description=registration.description,
        location=registration.location,
        mode=registration.mode,
        status="Active",
        start_date=registration.start_date,
        end_date=registration.end_date,
    )

    db.add(internship)
    db.flush()

    # ------------------------------------------------------------------------
    # 4. Create application for the student
    # ------------------------------------------------------------------------

    application = Application(
        student_id=student_id,
        internship_id=internship.id,
        status="Pending",
        cover_letter=registration.cover_letter,
    )

    db.add(application)

    # ------------------------------------------------------------------------
    # 5. Save everything
    # ------------------------------------------------------------------------

    try:
        db.commit()
        db.refresh(application)
        db.refresh(internship)
    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to register internship",
        )

    # ------------------------------------------------------------------------
    # 6. Prepare response
    # ------------------------------------------------------------------------

    internship_data = InternshipResponse.model_validate(
        internship
    )

    internship_data.company_name = company.name

    return StudentInternshipItem(
        application_id=application.id,
        application_status=application.status,
        applied_at=application.applied_at,
        internship=internship_data,
    )
