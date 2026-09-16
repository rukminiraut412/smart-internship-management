"""Student-related API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Application, Company, Internship, InternshipSkill, Skill, Student, User
from app.schemas import (
    InternshipResponse,
    StudentInternshipItem,
    StudentInternshipRegisterRequest,
)
from app.security import get_current_user

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
    student = (
        db.query(Student)
        .filter((Student.id == student_id) | (Student.user_id == student_id))
        .first()
    )
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    # Fetch applications for this student
    applications = (
        db.query(Application)
        .filter(Application.student_id == student.id)
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


@router.post(
    "/{student_id}/register-internship",
    response_model=InternshipResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register an internship for a student",
    description="Register an off-campus or external internship for an authenticated student, creating Company, Internship, Skills, and approved Application.",
)
def register_student_internship(
    student_id: str,
    payload: StudentInternshipRegisterRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Register an internship placement for the specified student."""
    # 1. Resolve student by either canonical Student.id or User.id
    student = (
        db.query(Student)
        .filter((Student.id == student_id) | (Student.user_id == student_id))
        .first()
    )
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    # 2. Authorization check: user must be the student account owner or an admin
    if student.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to register an internship for this student profile",
        )

    # 3. Find or create company
    clean_company_name = payload.company_name.strip()
    company = db.query(Company).filter(Company.name.ilike(clean_company_name)).first()
    if not company:
        company = Company(
            name=clean_company_name,
            industry=payload.domain.strip() if payload.domain else None,
            location=payload.location.strip() if payload.location else None,
            description=f"Company profile auto-created for {clean_company_name}",
        )
        db.add(company)
        db.flush()

    # 4. Check if supervisor email corresponds to an existing Mentor account
    mentor_id = None
    if payload.mentor_email:
        mentor_user = (
            db.query(User)
            .filter(User.email == payload.mentor_email.lower().strip())
            .first()
        )
        if mentor_user and mentor_user.mentor:
            mentor_id = mentor_user.mentor.id

    # 5. Build description with supervisor metadata note
    desc = payload.description.strip() if payload.description else ""
    supervisor_notes = []
    if payload.mentor_name:
        supervisor_notes.append(f"Supervisor: {payload.mentor_name.strip()}")
    if payload.mentor_email:
        supervisor_notes.append(f"Email: {payload.mentor_email.strip()}")
    if payload.mentor_phone:
        supervisor_notes.append(f"Phone: {payload.mentor_phone.strip()}")

    if supervisor_notes:
        note_str = f" [{ ' | '.join(supervisor_notes) }]"
        if note_str not in desc:
            desc = (desc + note_str).strip()

    # 6. Create Internship record
    new_internship = Internship(
        company_id=company.id,
        mentor_id=mentor_id,
        title=payload.internship_title.strip(),
        domain=payload.domain.strip() if payload.domain else None,
        description=desc if desc else None,
        location=payload.location.strip() if payload.location else None,
        mode=payload.mode if payload.mode in ["Online", "Offline", "Hybrid"] else "Hybrid",
        status="Active",
        stipend=payload.stipend.strip() if payload.stipend else None,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(new_internship)
    db.flush()

    # 7. Associate Skills and create InternshipSkill records
    if payload.required_skills:
        for skill_name in payload.required_skills:
            clean_skill = skill_name.strip()
            if not clean_skill:
                continue
            skill = db.query(Skill).filter(Skill.name.ilike(clean_skill)).first()
            if not skill:
                skill = Skill(name=clean_skill, category="General")
                db.add(skill)
                db.flush()

            existing_link = (
                db.query(InternshipSkill)
                .filter(
                    InternshipSkill.internship_id == new_internship.id,
                    InternshipSkill.skill_id == skill.id,
                )
                .first()
            )
            if not existing_link:
                internship_skill = InternshipSkill(
                    internship_id=new_internship.id,
                    skill_id=skill.id,
                    required_level="Intermediate",
                    is_mandatory=True,
                )
                db.add(internship_skill)

    # 8. Create approved Application linking student to the new internship
    application = Application(
        student_id=student.id,
        internship_id=new_internship.id,
        status="Approved",
        cover_letter=f"Direct student registration for {payload.internship_title}",
    )
    db.add(application)
    db.commit()
    db.refresh(new_internship)

    # 9. Format response with company name
    response_data = InternshipResponse.model_validate(new_internship)
    response_data.company_name = company.name
    return response_data

