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


def _build_student_profile_response(
    student: Student,
) -> StudentProfileResponse:
    """Helper to convert Student model to StudentProfileResponse including declared skills."""
    skills = [
        s.skill.name
        for s in student.student_skills
        if s.skill
    ]

    return StudentProfileResponse(
        id=student.id,
        user_id=student.user.id if student.user else student.user_id,
        email=student.user.email if student.user else "",
        full_name=student.user.full_name if student.user else "",
        student_id_number=(
            student.student_id_number
            or f"STU-{student.id[:8].upper()}"
        ),
        phone=student.phone,
        college=student.college,
        university=student.university,
        department=student.department,
        year_of_study=(
            str(student.year_of_study)
            if student.year_of_study is not None
            else None
        ),
        gpa=student.gpa,
        resume_url=student.resume_url,
        skills=skills,
        created_at=student.created_at,
        updated_at=student.updated_at,
    )


@router.get(
    "/me",
    response_model=StudentProfileResponse,
    summary="Get current student profile",
    description="Retrieve the authenticated student's profile, resolving the Student record from JWT token.",
)
def get_current_student_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Resolve and return the authenticated student's profile."""
    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )

    if not student:
        # If user registered as student but profile record missing, create one safely
        if current_user.role == "student":
            student = Student(
                user_id=current_user.id,
                student_id_number=(
                    f"STU-{current_user.id[:8].upper()}"
                ),
            )

            db.add(student)
            db.commit()
            db.refresh(student)
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Current authenticated user is not registered as a student",
            )

    return _build_student_profile_response(student)


@router.put(
    "/me",
    response_model=StudentProfileResponse,
    summary="Update current student profile",
    description="Update authenticated student's profile details and declared skills with persistence.",
)
def update_current_student_profile(
    payload: StudentProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update authenticated student's profile information."""
    student = (
        db.query(Student)
        .filter(Student.user_id == current_user.id)
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found for the authenticated user",
        )

    return _update_student_record(
        student,
        current_user,
        payload,
        db,
    )


def _update_student_record(
    student: Student,
    user: Optional[User],
    payload: StudentProfileUpdateRequest,
    db: Session,
) -> StudentProfileResponse:
    """Helper to update Student and User fields and synchronize skills."""

    if payload.name and user:
        user.full_name = payload.name.strip()

    if payload.phone is not None:
        student.phone = (
            payload.phone.strip()
            if payload.phone
            else None
        )

    if payload.college is not None:
        student.college = (
            payload.college.strip()
            if payload.college
            else None
        )

    if payload.university is not None:
        student.university = (
            payload.university.strip()
            if payload.university
            else None
        )

    if payload.department is not None:
        student.department = (
            payload.department.strip()
            if payload.department
            else None
        )

    if payload.year_of_study is not None:
        student.year_of_study = (
            payload.year_of_study.strip()
            if payload.year_of_study
            else None
        )

    if payload.gpa is not None:
        student.gpa = payload.gpa

    if payload.resume_url is not None:
        student.resume_url = (
            payload.resume_url.strip()
            if payload.resume_url
            else None
        )

    # Update skills if provided
    if payload.skills is not None:

        # Remove existing skills
        db.query(StudentSkill).filter(
            StudentSkill.student_id == student.id
        ).delete()

        db.flush()

        # Add new skills
        seen_skills = set()

        for skill_name in payload.skills:
            clean = skill_name.strip()

            if not clean:
                continue

            if clean.lower() in seen_skills:
                continue

            seen_skills.add(clean.lower())

            skill_obj = (
                db.query(Skill)
                .filter(Skill.name.ilike(clean))
                .first()
            )

            if not skill_obj:
                skill_obj = Skill(
                    name=clean,
                    category="General",
                )

                db.add(skill_obj)
                db.flush()

            db.add(
                StudentSkill(
                    student_id=student.id,
                    skill_id=skill_obj.id,
                    proficiency_level="Intermediate",
                )
            )

    student.updated_at = datetime.utcnow()

    if user:
        user.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(student)

    return _build_student_profile_response(student)


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
        .filter(
            (Student.id == student_id)
            | (Student.user_id == student_id)
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    # Authorization:
    # student can view only their own profile,
    # or mentor/admin can view it.
    if (
        student.user_id != current_user.id
        and current_user.role not in ["admin", "mentor"]
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this student profile",
        )

    skill_names = [
        ss.skill.name
        for ss in student.student_skills
        if ss.skill
    ]

    return StudentProfileResponse(
        id=student.id,
        user_id=student.user_id,
        email=student.user.email if student.user else "",
        full_name=(
            student.user.full_name
            if student.user
            else ""
        ),
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
    description="Update student academic information, contact details, and associated skills.",
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
        .filter(
            (Student.id == student_id)
            | (Student.user_id == student_id)
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    # Authorization:
    # only the student owner or admin can update
    if (
        student.user_id != current_user.id
        and current_user.role != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this student profile",
        )

    return _update_student_record(
        student,
        student.user,
        payload,
        db,
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
        .filter(
            (Student.id == student_id)
            | (Student.user_id == student_id)
        )
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

        if not internship:
            continue

        internship_data = InternshipResponse.model_validate(
            internship
        )

        if internship.company:
            internship_data.company_name = (
                internship.company.name
            )

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
        .filter(
            (Student.id == student_id)
            | (Student.user_id == student_id)
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    # 2. Authorization check:
    # user must be the student account owner or an admin
    if (
        student.user_id != current_user.id
        and current_user.role != "admin"
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to register an internship for this student profile",
        )

    # 3. Find or create company
    clean_company_name = payload.company_name.strip()

    company = (
        db.query(Company)
        .filter(Company.name.ilike(clean_company_name))
        .first()
    )

    if not company:
        company = Company(
            name=clean_company_name,
            industry=(
                payload.domain.strip()
                if payload.domain
                else None
            ),
            location=(
                payload.location.strip()
                if payload.location
                else None
            ),
            description=(
                f"Company profile auto-created for "
                f"{clean_company_name}"
            ),
        )

        db.add(company)
        db.flush()

    # 4. Check for duplicate registration:
    # same student, same company, same internship title
    clean_title = payload.internship_title.strip()

    existing_duplicate = (
        db.query(Application)
        .join(
            Internship,
            Application.internship_id == Internship.id,
        )
        .filter(
            Application.student_id == student.id,
            Internship.company_id == company.id,
            Internship.title.ilike(clean_title),
            Internship.status == "Active",
        )
        .first()
    )

    if existing_duplicate:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"An active internship registration already exists "
                f"for '{clean_company_name}' and role '{clean_title}'"
            ),
        )

    # 5. Check if supervisor email corresponds
    # to an existing Mentor account
    mentor_id = None

    if payload.mentor_email:
        mentor_user = (
            db.query(User)
            .filter(
                User.email
                == payload.mentor_email.lower().strip()
            )
            .first()
        )

        if mentor_user and mentor_user.mentor:
            mentor_id = mentor_user.mentor.id

    # 6. Build description with supervisor metadata
    desc = (
        payload.description.strip()
        if payload.description
        else ""
    )

    supervisor_notes = []

    if payload.mentor_name:
        supervisor_notes.append(
            f"Supervisor: {payload.mentor_name.strip()}"
        )

    if payload.mentor_email:
        supervisor_notes.append(
            f"Email: {payload.mentor_email.strip()}"
        )

    if payload.mentor_phone:
        supervisor_notes.append(
            f"Phone: {payload.mentor_phone.strip()}"
        )

    if supervisor_notes:
        note_str = (
            f" [{' | '.join(supervisor_notes)}]"
        )

        if note_str not in desc:
            desc = (desc + note_str).strip()

    # 7. Create Internship record
    new_internship = Internship(
        company_id=company.id,
        mentor_id=mentor_id,
        title=payload.internship_title.strip(),
        domain=(
            payload.domain.strip()
            if payload.domain
            else None
        ),
        description=desc if desc else None,
        location=(
            payload.location.strip()
            if payload.location
            else None
        ),
        mode=(
            payload.mode
            if payload.mode in [
                "Online",
                "Offline",
                "Hybrid",
            ]
            else "Hybrid"
        ),
        status="Active",
        stipend=(
            payload.stipend.strip()
            if payload.stipend
            else None
        ),
        start_date=payload.start_date,
        end_date=payload.end_date,
    )

    db.add(new_internship)
    db.flush()

    # 8. Associate Skills and create InternshipSkill records
    if payload.required_skills:
        for skill_name in payload.required_skills:

            clean_skill = skill_name.strip()

            if not clean_skill:
                continue

            skill = (
                db.query(Skill)
                .filter(Skill.name.ilike(clean_skill))
                .first()
            )

            if not skill:
                skill = Skill(
                    name=clean_skill,
                    category="General",
                )

                db.add(skill)
                db.flush()

            existing_link = (
                db.query(InternshipSkill)
                .filter(
                    InternshipSkill.internship_id
                    == new_internship.id,
                    InternshipSkill.skill_id
                    == skill.id,
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

    # 9. Create approved Application
    # linking student to the new internship
    application = Application(
        student_id=student.id,
        internship_id=new_internship.id,
        status="Approved",
        cover_letter=(
            f"Direct student registration for "
            f"{payload.internship_title}"
        ),
    )

    db.add(application)

    db.commit()
    db.refresh(new_internship)

    # 10. Format response with company name
    response_data = InternshipResponse.model_validate(
        new_internship
    )

    response_data.company_name = company.name

    return response_data