"""Task management API endpoints."""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Internship, Student, Task
from app.schemas import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
)


@router.get(
    "",
    response_model=List[TaskResponse],
    summary="List tasks",
    description="Retrieve tasks optionally filtered by student_id, internship_id, or status.",
)
def list_tasks(
    student_id: Optional[str] = Query(None, description="Filter tasks by student ID"),
    internship_id: Optional[str] = Query(None, description="Filter tasks by internship ID"),
    status: Optional[str] = Query(None, description="Filter tasks by status (Pending, In Progress, Completed)"),
    db: Session = Depends(get_db),
):
    """List tasks with optional filters."""
    query = db.query(Task)
    if student_id:
        query = query.filter(Task.student_id == student_id)
    if internship_id:
        query = query.filter(Task.internship_id == internship_id)
    if status:
        query = query.filter(Task.status == status)

    return query.order_by(Task.created_at.desc()).all()


@router.post(
    "",
    response_model=TaskResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create task",
    description="Create a new task assignment for an intern.",
)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
):
    """Create a new task deliverable."""
    # Verify student exists
    student = db.query(Student).filter(Student.id == payload.student_id).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with ID '{payload.student_id}' not found",
        )

    # Verify internship exists
    internship = db.query(Internship).filter(Internship.id == payload.internship_id).first()
    if not internship:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Internship with ID '{payload.internship_id}' not found",
        )

    task = Task(
        internship_id=payload.internship_id,
        student_id=payload.student_id,
        mentor_id=payload.mentor_id or internship.mentor_id,
        title=payload.title.strip(),
        description=payload.description,
        category=payload.category or "Development",
        status=payload.status or "Pending",
        due_date=payload.due_date,
        completed_at=datetime.utcnow() if payload.status == "Completed" else None,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch(
    "/{task_id}",
    response_model=TaskResponse,
    summary="Update task",
    description="Update task status (e.g. In Progress, Completed) or task details.",
)
def update_task(
    task_id: str,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
):
    """Update task status and metadata."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with ID '{task_id}' not found",
        )

    if payload.title is not None:
        task.title = payload.title.strip()
    if payload.description is not None:
        task.description = payload.description
    if payload.category is not None:
        task.category = payload.category
    if payload.due_date is not None:
        task.due_date = payload.due_date

    if payload.status is not None:
        task.status = payload.status
        if payload.status == "Completed" and not task.completed_at:
            task.completed_at = datetime.utcnow()
        elif payload.status != "Completed":
            task.completed_at = None

    db.commit()
    db.refresh(task)
    return task
