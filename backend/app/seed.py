"""Seed demo initial data for development and testing environments."""

from datetime import datetime
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import (
    Application,
    Company,
    Internship,
    InternshipSkill,
    Mentor,
    ProgressReport,
    Skill,
    Student,
    StudentSkill,
    Task,
    User,
)
from app.security import hash_password


def seed_demo_data() -> None:
    """Populates initial demo records if the database is empty."""
    db: Session = SessionLocal()
    try:
        # Ensure default demo Admin user exists even if database was already partially seeded
        admin_user = db.query(User).filter(User.email == "admin@university.edu").first()
        if not admin_user:
            admin_pw = hash_password("SecurePassword123!")
            admin_user = User(
                email="admin@university.edu",
                hashed_password=admin_pw,
                full_name="System Administrator",
                role="admin",
                is_active=True,
            )
            db.add(admin_user)
            db.commit()

        # Check if rest of demo data is already seeded
        if db.query(User).filter(User.email == "alex.rivera@university.edu").first():
            return

        # 1. Create Default Student User
        student_pw = hash_password("SecurePassword123!")
        alex_user = User(
            email="alex.rivera@university.edu",
            hashed_password=student_pw,
            full_name="Alex Rivera",
            role="student",
            is_active=True,
        )
        db.add(alex_user)
        db.flush()

        # 2. Student Profile
        student_profile = Student(
            user_id=alex_user.id,
            student_id_number="STU-2026-8842",
            phone="+1 (555) 382-9014",
            college="School of Engineering & Applied Sciences",
            university="State Institute of Technology",
            department="Department of Computer Science & Engineering",
            year_of_study="Final Year (Semester 7 - 2026)",
            gpa=3.84,
        )
        db.add(student_profile)
        db.flush()

        # 3. Company
        company = Company(
            name="CloudScale Distributed Systems",
            industry="Cloud & Distributed Systems",
            location="Seattle, WA / Remote",
            website="https://cloudscale.io",
            description="High-throughput distributed systems and cloud infrastructure.",
        )
        db.add(company)
        db.flush()

        # 4. Mentor User & Profile
        mentor_pw = hash_password("SecurePassword123!")
        mentor_user = User(
            email="m.vance@cloudscale.io",
            hashed_password=mentor_pw,
            full_name="Dr. Marcus Vance",
            role="mentor",
            is_active=True,
        )
        db.add(mentor_user)
        db.flush()

        mentor_profile = Mentor(
            user_id=mentor_user.id,
            company_id=company.id,
            job_title="Staff Systems Architect",
            department="Platform Infrastructure",
            company_name="CloudScale Distributed Systems",
            phone="+1 (555) 441-2099",
        )
        db.add(mentor_profile)
        db.flush()

        # 5. Internship Placement
        internship = Internship(
            company_id=company.id,
            mentor_id=mentor_profile.id,
            title="Backend Engineering Intern",
            domain="Cloud & Distributed Systems",
            description="Developing scalable telemetry ingestion pipelines and microservices in Python with automated integration testing.",
            location="Seattle, WA / Remote",
            mode="Hybrid",
            status="Active",
            stipend="$1,800 / month",
        )
        db.add(internship)
        db.flush()

        # 6. Student Application (Approved)
        application = Application(
            student_id=student_profile.id,
            internship_id=internship.id,
            status="Approved",
        )
        db.add(application)

        # 7. Skills & Mappings
        skill_names = ["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "Git & GitHub"]
        skills_map = {}
        for s_name in skill_names:
            s_obj = Skill(name=s_name, category="Engineering")
            db.add(s_obj)
            db.flush()
            skills_map[s_name] = s_obj

            # Link to student
            db.add(
                StudentSkill(
                    student_id=student_profile.id,
                    skill_id=s_obj.id,
                    proficiency_level="Advanced" if s_name in ["Python", "Git & GitHub"] else "Intermediate",
                )
            )
            # Link to internship
            db.add(
                InternshipSkill(
                    internship_id=internship.id,
                    skill_id=s_obj.id,
                    required_level="Intermediate",
                    is_mandatory=True,
                )
            )

        # 8. Initial Progress Reports (Weeks 1 to 4)
        reports_data = [
            (1, "Orientation & Repository Setup", 21.0, 4.8, "Strong start to the internship. Alex demonstrated quick onboarding.", "Reviewed"),
            (2, "PostgreSQL Database Schema & Indexes", 20.0, 4.6, "Solid database design principles. Good foresight on indexing timestamp columns.", "Reviewed"),
            (3, "FastAPI CRUD & Route Architecture", 22.0, 4.9, "Excellent work on Pydantic v2 schemas and clean error formatting.", "Reviewed"),
            (4, "Docker Multi-stage Optimization", 22.0, 4.5, "Impressive reduction in container image size. Docker configuration is clean.", "Reviewed"),
        ]
        for week_num, title, hours, score, feedback, status_str in reports_data:
            rep = ProgressReport(
                student_id=student_profile.id,
                internship_id=internship.id,
                week_number=week_num,
                title=f"Week {week_num}: {title}",
                summary=f"Completed deliverables for {title}. Met all milestones.",
                hours_logged=hours,
                mentor_score=score,
                mentor_feedback=feedback,
                status="Approved",
                submission_date=datetime.utcnow(),
            )
            db.add(rep)

        # 9. Tasks
        tasks_data = [
            ("Design PostgreSQL schema for telemetry ingestion", "Completed", "Database"),
            ("Implement FastAPI CRUD routes with Pydantic v2 schemas", "Completed", "API"),
            ("Set up Docker multi-stage build container & compose stack", "Completed", "Architecture"),
            ("Write pytest integration tests with >80% code coverage", "In Progress", "Testing"),
            ("Benchmark Redis caching layer under concurrent query load", "Pending", "Architecture"),
        ]
        for title, t_status, cat in tasks_data:
            task = Task(
                internship_id=internship.id,
                student_id=student_profile.id,
                mentor_id=mentor_profile.id,
                title=title,
                status=t_status,
                category=cat,
            )
            db.add(task)

        db.commit()
    except Exception as e:
        db.rollback()
        # Logging failure softly so startup is not blocked if table already seeded
        print(f"[Seed Warning] Demo seed initialization: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
    print("Demo data seeded successfully.")
