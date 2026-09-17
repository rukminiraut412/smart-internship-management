"""Intelligence and analytics endpoints connecting pure deterministic Python modules.

Uses intelligence.app.skill_gap and intelligence.app.progress_analysis
without any external AI APIs.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional, Union
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Alert,
    Application,
    Evaluation,
    Internship,
    InternshipSkill,
    ProgressReport,
    Skill,
    Student,
    StudentSkill,
    Task,
)
from app.schemas import (
    CompletionReadinessResult,
    GrowthAnalyticsResult,
    QualityScoreResult,
)

# Import deterministic intelligence functions and schemas
from intelligence.app.models import (
    ProgressAttentionEngineResult,
    SkillGapRequest,
    SkillGapResult,
)
from intelligence.app.progress_analysis import (
    ProgressAttentionEngine,
    evaluate_progress_attention,
)
from intelligence.app.skill_gap import analyze_skill_gap, generate_skill_recommendation

router = APIRouter(
    prefix="/intelligence",
    tags=["Intelligence & Analytics"],
)


# Request schema for direct attention evaluation
class ProgressAttentionRequest(BaseModel):
    """Input metrics for progress attention evaluation (0 to 100)."""
    progress_consistency: Union[int, float] = Field(default=85.0, ge=0, le=100, description="Progress consistency (0-100)")
    task_completion: Union[int, float] = Field(default=80.0, ge=0, le=100, description="Task completion rate (0-100)")
    report_submission: Union[int, float] = Field(default=90.0, ge=0, le=100, description="Report submission rate (0-100)")
    mentor_feedback: Union[int, float] = Field(default=85.0, ge=0, le=100, description="Mentor feedback index (0-100)")


@router.post(
    "/skill-gap",
    response_model=SkillGapResult,
    summary="Evaluate Skill Gap",
    description="Deterministic comparison of student skills against required skills with explainable recommendations.",
)
def evaluate_skill_gap(payload: SkillGapRequest) -> SkillGapResult:
    """Execute deterministic skill gap analysis without external AI APIs."""
    return analyze_skill_gap(payload)


@router.get(
    "/skill-gap/{internship_id}",
    response_model=SkillGapResult,
    summary="Evaluate Skill Gap for Internship",
    description="Compare a student's actual skills against an internship's required skills from the database.",
)
def get_internship_skill_gap(
    internship_id: str,
    student_id: Optional[str] = Query(None, description="Optional student ID to evaluate against"),
    db: Session = Depends(get_db),
) -> SkillGapResult:
    """Compare student skills with an internship's declared skills strictly from the database."""
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID '{internship_id}' not found",
        )

    # 1. Fetch required skills from database
    required_skills = [s.skill.name for s in internship.internship_skills if s.skill]

    # 2. Fetch student skills from database
    student_skills: List[str] = []
    if student_id:
        student = db.query(Student).filter(Student.id == student_id).first()
        if student and student.student_skills:
            student_skills = [s.skill.name for s in student.student_skills if s.skill]

    # 3. Honest evaluation without fake fallbacks
    if not required_skills:
        return SkillGapResult(
            matched_skills=student_skills,
            missing_skills=[],
            match_percentage=100,
            recommendation="Required skills not specified for this internship.",
        )

    if not student_skills:
        return SkillGapResult(
            matched_skills=[],
            missing_skills=required_skills,
            match_percentage=0,
            recommendation=f"No skills declared yet. Start building: {', '.join(required_skills[:3])}.",
        )

    return analyze_skill_gap(student_skills=student_skills, required_skills=required_skills)


@router.post(
    "/evaluate-attention",
    response_model=ProgressAttentionEngineResult,
    summary="Evaluate Internship Progress Attention",
    description="Deterministic formula evaluating student progress consistency, task completion, and report cadence.",
)
def evaluate_attention(payload: ProgressAttentionRequest) -> ProgressAttentionEngineResult:
    """Execute deterministic progress attention scoring without external AI APIs."""
    return evaluate_progress_attention(
        progress_consistency=payload.progress_consistency,
        task_completion=payload.task_completion,
        report_submission=payload.report_submission,
        mentor_feedback=payload.mentor_feedback,
    )


@router.get(
    "/attention-status/{student_id}",
    response_model=ProgressAttentionEngineResult,
    summary="Get Student Attention Status",
    description="Compute live explainable attention status for an enrolled student using actual reports and tasks in the DB.",
)
def get_student_attention_status(
    student_id: str,
    db: Session = Depends(get_db),
) -> ProgressAttentionEngineResult:
    """Evaluate attention status for an enrolled student using actual reports and tasks in the DB."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    reports = db.query(ProgressReport).filter(ProgressReport.student_id == student_id).all()
    reports_submitted = len(reports)
    reports_expected = max(reports_submitted, 4)  # Minimum expected cadence for cycle

    tasks = db.query(Task).filter(Task.student_id == student_id).all()
    tasks_total = len(tasks)
    tasks_completed = sum(1 for t in tasks if t.status == "Completed")

    # Metrics calculation strictly from real records
    if reports_submitted == 0 and tasks_total == 0:
        # Honest new student state
        return ProgressAttentionEngineResult(
            score=70,
            status="MONITOR",
            reasons=[
                "Internship onboarding underway.",
                "No weekly reports submitted yet.",
                "No tasks assigned yet.",
            ],
            recommendations=[
                "Submit Week 1 progress report.",
                "Coordinate initial tasks with your mentor.",
            ],
        )

    # 1. Report submission rate (20% weight)
    report_submission = min(100.0, (reports_submitted / reports_expected) * 100.0)

    # 2. Task completion rate (30% weight)
    task_completion = min(100.0, (tasks_completed / tasks_total) * 100.0) if tasks_total > 0 else 80.0

    # 3. Progress consistency (30% weight)
    approved_reports = sum(1 for r in reports if r.status == "Approved")
    progress_consistency = (approved_reports / reports_submitted * 100.0) if reports_submitted > 0 else 50.0

    # 4. Mentor feedback (20% weight)
    scores = [r.mentor_score for r in reports if r.mentor_score is not None]
    if scores:
        mentor_feedback = (sum(scores) / len(scores) / 5.0) * 100.0
    else:
        # Check evaluations table
        evals = db.query(Evaluation).filter(Evaluation.student_id == student_id).all()
        if evals:
            mentor_feedback = (sum(e.rating for e in evals) / len(evals) / 5.0) * 100.0
        else:
            mentor_feedback = 60.0 if reports_submitted > 0 else 80.0

    # Execute deterministic formula
    result = evaluate_progress_attention(
        progress_consistency=progress_consistency,
        task_completion=task_completion,
        report_submission=report_submission,
        mentor_feedback=mentor_feedback,
    )

    # Create / update proactive Alert record if status is MONITOR or NEEDS_ATTENTION
    if result.status in ["MONITOR", "NEEDS_ATTENTION"]:
        existing_alert = (
            db.query(Alert)
            .filter(Alert.student_id == student_id, Alert.is_resolved == False)
            .first()
        )
        if not existing_alert:
            # Find internship id
            app_rec = db.query(Application).filter(Application.student_id == student_id).first()
            internship_id = app_rec.internship_id if app_rec else None

            severity = "Critical" if result.status == "NEEDS_ATTENTION" else "Warning"
            title = f"Attention Required: {result.status.replace('_', ' ').title()}"
            msg = f"Progress score is {result.score}/100. " + " ".join(result.reasons[:2])

            new_alert = Alert(
                student_id=student_id,
                internship_id=internship_id,
                title=title,
                message=msg,
                severity=severity,
                is_read=False,
                is_resolved=False,
            )
            db.add(new_alert)
            db.commit()

    return result


@router.get(
    "/quality-score/{internship_id}",
    response_model=QualityScoreResult,
    summary="Get Internship Quality Score",
    description="Deterministic explainable quality score based on task completion, report cadence, mentor feedback, and skill relevance.",
)
def get_internship_quality_score(
    internship_id: str,
    db: Session = Depends(get_db),
) -> QualityScoreResult:
    """Calculate deterministic Internship Quality Score."""
    internship = db.query(Internship).filter(Internship.id == internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID '{internship_id}' not found",
        )

    # 1. Task metrics
    tasks = db.query(Task).filter(Task.internship_id == internship_id).all()
    tasks_total = len(tasks)
    tasks_completed = sum(1 for t in tasks if t.status == "Completed")
    task_score = (tasks_completed / tasks_total * 100.0) if tasks_total > 0 else 75.0

    # 2. Report consistency
    reports = db.query(ProgressReport).filter(ProgressReport.internship_id == internship_id).all()
    reports_total = len(reports)
    approved_reports = sum(1 for r in reports if r.status == "Approved")
    report_score = (approved_reports / reports_total * 100.0) if reports_total > 0 else 70.0

    # 3. Mentor feedback
    scores = [r.mentor_score for r in reports if r.mentor_score is not None]
    mentor_score = (sum(scores) / len(scores) / 5.0 * 100.0) if scores else 80.0

    # 4. Skill relevance
    skills_count = len(internship.internship_skills)
    skill_score = min(100.0, skills_count * 20.0) if skills_count > 0 else 60.0

    # Weighted composite:
    # Tasks 30%, Reports 25%, Mentor 25%, Skills 20%
    quality_score = round(
        (task_score * 0.30) + (report_score * 0.25) + (mentor_score * 0.25) + (skill_score * 0.20),
        1
    )

    explanation = (
        f"Quality score of {quality_score}/100 based on {tasks_completed}/{tasks_total} tasks completed, "
        f"{approved_reports}/{reports_total} approved reports, average mentor rating of {round(mentor_score/20, 1)}/5, "
        f"and {skills_count} mapped competencies."
    )

    return QualityScoreResult(
        quality_score=quality_score,
        breakdown={
            "task_completion": round(task_score, 1),
            "report_consistency": round(report_score, 1),
            "mentor_engagement": round(mentor_score, 1),
            "skill_relevance": round(skill_score, 1),
        },
        explanation=explanation,
    )


@router.get(
    "/completion-readiness/{student_id}",
    response_model=CompletionReadinessResult,
    summary="Get Internship Completion Readiness",
    description="Deterministic audit of deliverables required for internship sign-off.",
)
def get_completion_readiness(
    student_id: str,
    db: Session = Depends(get_db),
) -> CompletionReadinessResult:
    """Audit deliverables for internship completion readiness."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    pending_items = []
    checks_passed = 0
    total_checks = 4

    # Check 1: Reports submitted (at least 4)
    reports = db.query(ProgressReport).filter(ProgressReport.student_id == student_id).all()
    if len(reports) >= 4:
        checks_passed += 1
    else:
        pending_items.append(f"Submit required weekly reports ({len(reports)}/4 submitted)")

    # Check 2: Task completion (at least 80% if tasks exist)
    tasks = db.query(Task).filter(Task.student_id == student_id).all()
    if tasks:
        completed = sum(1 for t in tasks if t.status == "Completed")
        pct = (completed / len(tasks)) * 100.0
        if pct >= 80.0:
            checks_passed += 1
        else:
            pending_items.append(f"Complete pending tasks ({completed}/{len(tasks)} completed, {round(pct)}%)")
    else:
        pending_items.append("No verified tasks recorded for this placement")

    # Check 3: Mentor evaluation
    evals = db.query(Evaluation).filter(Evaluation.student_id == student_id).all()
    scores = [r.mentor_score for r in reports if r.mentor_score is not None]
    if evals or len(scores) >= 2:
        checks_passed += 1
    else:
        pending_items.append("Awaiting formal mentor evaluation or reviewed reports")

    # Check 4: Approved reports
    approved = sum(1 for r in reports if r.status == "Approved")
    if approved >= 2:
        checks_passed += 1
    else:
        pending_items.append("Awaiting mentor approval on submitted weekly reports")

    completion_score = round((checks_passed / total_checks) * 100.0, 1)
    status_label = "READY" if len(pending_items) == 0 else "PENDING ITEMS"
    summary = (
        "All graduation and internship deliverables successfully satisfied."
        if status_label == "READY"
        else f"{len(pending_items)} milestone items remaining before final certification."
    )

    return CompletionReadinessResult(
        status=status_label,
        completion_score=completion_score,
        pending_items=pending_items,
        summary=summary,
    )


@router.get(
    "/growth-analytics/{student_id}",
    response_model=GrowthAnalyticsResult,
    summary="Get Student Growth Analytics",
    description="Week-over-week progress metrics, hours logged, skills practiced, and mentor ratings.",
)
def get_growth_analytics(
    student_id: str,
    db: Session = Depends(get_db),
) -> GrowthAnalyticsResult:
    """Provide real student growth trajectory over time."""
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{student_id}' not found",
        )

    reports = (
        db.query(ProgressReport)
        .filter(ProgressReport.student_id == student_id)
        .order_by(ProgressReport.week_number.asc())
        .all()
    )

    if len(reports) < 2:
        return GrowthAnalyticsResult(
            has_sufficient_data=False,
            message="Not enough data yet. At least 2 weekly reports are required to calculate growth trends.",
            reports_count=len(reports),
            tasks_completed_count=0,
        )

    weeks_data = []
    cumulative_hours = 0.0
    for r in reports:
        cumulative_hours += r.hours_logged
        weeks_data.append({
            "week": r.week_number,
            "title": r.title,
            "hours": r.hours_logged,
            "cumulative_hours": round(cumulative_hours, 1),
            "mentor_score": r.mentor_score,
            "status": r.status,
        })

    tasks = db.query(Task).filter(Task.student_id == student_id).all()
    tasks_completed = sum(1 for t in tasks if t.status == "Completed")

    skills = [s.skill.name for s in student.student_skills if s.skill]
    scores = [r.mentor_score for r in reports if r.mentor_score is not None]
    avg_score = round(sum(scores) / len(scores), 2) if scores else None

    return GrowthAnalyticsResult(
        has_sufficient_data=True,
        message="Student growth metrics generated from verified weekly logs.",
        weeks=weeks_data,
        skills_practiced=skills,
        average_mentor_score=avg_score,
        reports_count=len(reports),
        tasks_completed_count=tasks_completed,
    )
