"""Student-related API endpoints."""

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
    Task,
    User,
)
from app.schemas import (
    InternshipRegistrationRequest,
    InternshipResponse,
    StudentInternshipItem,
    StudentProfileResponse,
    StudentProfileUpdate,
    TaskResponse,
)
from app.security import get_current_user

router = APIRouter(
    prefix="/students",
    tags=["Students"],
)


def _build_student_profile_response(student: Student) -> StudentProfileResponse:
    """Helper to convert Student model to StudentProfileResponse including declared skills."""
    skills = [s.skill.name for s in student.student_skills if s.skill]
    return StudentProfileResponse(
        id=student.id,
        user_id=student.user.id if student.user else student.user_id,
        email=student.user.email if student.user else "",
        full_name=student.user.full_name if student.user else "",
        student_id_number=student.student_id_number or f"STU-{student.id[:8].upper()}",
        phone=student.phone,
        college=student.college,
        university=student.university,
        department=student.department,
        year_of_study=str(student.year_of_study) if student.year_of_study is not None else None,
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
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        # If user registered as student but profile record missing, create one safely
        if current_user.role == "student":
            student = Student(user_id=current_user.id, student_id_number=f"STU-{current_user.id[:8].upper()}")
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
    payload: StudentProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update authenticated student's profile information."""
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found for the authenticated user",
        )

    return _update_student_record(student, current_user, payload, db)


@router.get(
    "/{student_id}",
    response_model=StudentProfileResponse,
    summary="Get student profile by ID",
    description="Retrieve a specific student's profile by their unique Student ID.",
)
def get_student_by_id(
    student_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve student profile by student_id."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    return _build_student_profile_response(student)


@router.put(
    "/{student_id}",
    response_model=StudentProfileResponse,
    summary="Update student profile by ID",
    description="Update a student's profile by their unique Student ID.",
)
def update_student_by_id(
    student_id: str,
    payload: StudentProfileUpdate,
    db: Session = Depends(get_db),
):
    """Update student profile by student_id."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    return _update_student_record(student, student.user, payload, db)


def _update_student_record(
    student: Student,
    user: Optional[User],
    payload: StudentProfileUpdate,
    db: Session,
) -> StudentProfileResponse:
    """Helper to update Student and User fields and synchronize skills."""
    if payload.full_name and user:
        user.full_name = payload.full_name.strip()

    if payload.phone is not None:
        student.phone = payload.phone.strip() if payload.phone else None
    if payload.college is not None:
        student.college = payload.college.strip() if payload.college else None
    if payload.university is not None:
        student.university = payload.university.strip() if payload.university else None
    if payload.department is not None:
        student.department = payload.department.strip() if payload.department else None
    if payload.year_of_study is not None:
        student.year_of_study = payload.year_of_study.strip() if payload.year_of_study else None
    if payload.gpa is not None:
        student.gpa = payload.gpa

    # Update skills if provided
    if payload.skills is not None:
        # Remove existing skills
        db.query(StudentSkill).filter(StudentSkill.student_id == student.id).delete()
        db.flush()

        # Add new skills
        seen_skills = set()
        for s_name in payload.skills:
            clean = s_name.strip()
            if clean and clean.lower() not in seen_skills:
                seen_skills.add(clean.lower())
                skill_obj = db.query(Skill).filter(Skill.name.ilike(clean)).first()
                if not skill_obj:
                    skill_obj = Skill(name=clean, category="General")
                    db.add(skill_obj)
                    db.flush()

                db.add(
                    StudentSkill(
                        student_id=student.id,
                        skill_id=skill_obj.id,
                        proficiency_level="Intermediate",
                    )
                )

    db.commit()
    db.refresh(student)
    return _build_student_profile_response(student)


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
        if not internship:
            continue
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
    "/{student_id}/internships/register",
    response_model=StudentInternshipItem,
    status_code=status.HTTP_201_CREATED,
    summary="Register student internship",
    description="Register an internship placement for a student, creating company, internship, skills, and approved application.",
)
def register_student_internship(
    student_id: str,
    payload: InternshipRegistrationRequest,
    db: Session = Depends(get_db),
):
    """Backend registration flow for student internships."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    # 1. Find or create company
    comp_name = payload.company_name.strip()
    company = db.query(Company).filter(Company.name.ilike(comp_name)).first()
    if not company:
        company = Company(
            name=comp_name,
            industry=payload.domain or "Engineering",
            location=payload.location,
            description=f"Organization for {payload.internship_title}",
        )
        db.add(company)
        db.flush()

    # 2. Check for duplicate registration for this student
    existing_app = (
        db.query(Application)
        .join(Internship, Application.internship_id == Internship.id)
        .filter(
            Application.student_id == student_id,
            Internship.company_id == company.id,
            Internship.title.ilike(payload.internship_title.strip()),
        )
        .first()
    )
    if existing_app:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Student is already registered for '{payload.internship_title}' at '{company.name}'",
        )

    # 3. Create internship
    new_internship = Internship(
        company_id=company.id,
        title=payload.internship_title.strip(),
        domain=payload.domain,
        description=payload.description,
        location=payload.location,
        mode=payload.mode or "Hybrid",
        status="Active",
        stipend=payload.stipend,
        start_date=payload.start_date,
        end_date=payload.end_date,
    )
    db.add(new_internship)
    db.flush()

    # 4. Create internship-skill mappings
    for skill_name in payload.required_skills:
        clean_skill = skill_name.strip()
        if not clean_skill:
            continue
        skill_obj = db.query(Skill).filter(Skill.name.ilike(clean_skill)).first()
        if not skill_obj:
            skill_obj = Skill(name=clean_skill, category="Engineering")
            db.add(skill_obj)
            db.flush()

        db.add(
            InternshipSkill(
                internship_id=new_internship.id,
                skill_id=skill_obj.id,
                required_level="Intermediate",
                is_mandatory=True,
            )
        )

    # 5. Create application linking student and internship
    application = Application(
        student_id=student_id,
        internship_id=new_internship.id,
        status="Approved",
        cover_letter=payload.cover_letter,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    db.refresh(new_internship)

    internship_data = InternshipResponse.model_validate(new_internship)
    internship_data.company_name = company.name

    return StudentInternshipItem(
        application_id=application.id,
        application_status=application.status,
        applied_at=application.applied_at,
        internship=internship_data,
    )


@router.get(
    "/{student_id}/tasks",
    response_model=List[TaskResponse],
    summary="Get student's tasks",
    description="Retrieve all tasks assigned to the student.",
)
def get_student_tasks(
    student_id: str,
    db: Session = Depends(get_db),
):
    """Retrieve all tasks assigned to the student."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    tasks = (
        db.query(Task)
        .filter(Task.student_id == student_id)
        .order_by(Task.created_at.desc())
        .all()
    )
    return tasks
