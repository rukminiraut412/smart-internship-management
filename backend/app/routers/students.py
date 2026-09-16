"""Student-related API endpoints."""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Application,
    Company,
    Internship,
    InternshipSkill,
    Skill,
    Student,
    StudentSkill,
    User,
)
from app.schemas import (
    InternshipResponse,
    StudentInternshipItem,
    StudentInternshipRegisterRequest,
    StudentProfileResponse,
    StudentProfileUpdateRequest,
)
from app.security import get_current_user

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


@router.get(
    "/{student_id}",
    response_model=StudentProfileResponse,
    summary="Get student profile",
    description="Retrieve student profile details, academic records, and skills.",
)
def get_student_profile(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve detailed student profile."""
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

    # Authorization: student can view only their own profile, or mentor/admin
    if (
        student.user_id != current_user.id
        and current_user.role not in ["admin", "mentor"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this student profile",
        )

    skill_names = [ss.skill.name for ss in student.student_skills if ss.skill]

    return StudentProfileResponse(
        id=student.id,
        user_id=student.user_id,
        name=student.user.full_name if student.user else "",
        email=student.user.email if student.user else "",
        student_id_number=student.student_id_number,
        phone=student.phone,
        college=student.college,
        university=student.university,
        department=student.department,
        year_of_study=student.year_of_study,
        gpa=student.gpa,
        resume_url=student.resume_url,
        skills=skill_names,
        created_at=student.created_at,
        updated_at=student.updated_at,
    )


@router.put(
    "/{student_id}",
    response_model=StudentProfileResponse,
    summary="Update student profile",
    description="Update student academic information, contact details, bio, and associated skills.",
)
def update_student_profile(
    student_id: str,
    payload: StudentProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update student profile and associated skills."""
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

    # Authorization: only the student owner or admin can update
    if student.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this student profile",
        )

    # Update User full_name if provided
    if payload.name is not None and student.user:
        student.user.full_name = payload.name.strip()

    # Update Student fields if provided
    if payload.phone is not None:
        student.phone = payload.phone.strip() if payload.phone.strip() else None
    if payload.college is not None:
        student.college = payload.college.strip() if payload.college.strip() else None
    if payload.university is not None:
        student.university = payload.university.strip() if payload.university.strip() else None
    if payload.department is not None:
        student.department = payload.department.strip() if payload.department.strip() else None
    if payload.year_of_study is not None:
        student.year_of_study = payload.year_of_study.strip() if payload.year_of_study.strip() else None
    if payload.gpa is not None:
        student.gpa = payload.gpa
    if payload.resume_url is not None:
        student.resume_url = payload.resume_url.strip() if payload.resume_url.strip() else None

    student.updated_at = datetime.utcnow()

    # Update StudentSkill associations if skills list is provided
    if payload.skills is not None:
        current_skills_map = {
            ss.skill.name.lower(): ss
            for ss in student.student_skills
            if ss.skill
        }
        new_skill_names_lower = {s.strip().lower() for s in payload.skills if s.strip()}

        # Remove skills not in new list
        for lower_name, ss in list(current_skills_map.items()):
            if lower_name not in new_skill_names_lower:
                db.delete(ss)

        # Add newly specified skills, preserving existing ones
        for skill_name in payload.skills:
            clean_name = skill_name.strip()
            if not clean_name:
                continue
            if clean_name.lower() not in current_skills_map:
                skill = db.query(Skill).filter(Skill.name.ilike(clean_name)).first()
                if not skill:
                    skill = Skill(name=clean_name, category="General")
                    db.add(skill)
                    db.flush()
                new_ss = StudentSkill(
                    student_id=student.id,
                    skill_id=skill.id,
                    proficiency_level="Intermediate",
                )
                db.add(new_ss)

    db.commit()
    db.refresh(student)

    skill_names = [ss.skill.name for ss in student.student_skills if ss.skill]

    return StudentProfileResponse(
        id=student.id,
        user_id=student.user_id,
        name=student.user.full_name if student.user else "",
        email=student.user.email if student.user else "",
        student_id_number=student.student_id_number,
        phone=student.phone,
        college=student.college,
        university=student.university,
        department=student.department,
        year_of_study=student.year_of_study,
        gpa=student.gpa,
        resume_url=student.resume_url,
        skills=skill_names,
        created_at=student.created_at,
        updated_at=student.updated_at,
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

