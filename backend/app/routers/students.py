"""Student-related API endpoints."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, Student
from app.schemas import InternshipResponse, StudentInternshipItem

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


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
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    # Fetch applications for this student
    applications = (
        db.query(Application)
        .filter(Application.student_id == student_id)
        .order_by(Application.applied_at.desc())
        .all()
    )

    items = []
    for app_record in applications:
        internship = app_record.internship
        internship_data = InternshipResponse.model_validate(internship)
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
