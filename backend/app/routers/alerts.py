"""Proactive alerts API endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Alert, Student
from app.schemas import AlertResolveRequest, AlertResponse

router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"],
)


@router.get(
    "",
    response_model=List[AlertResponse],
    summary="List alerts",
    description="Retrieve proactive attention alerts, optionally filtered by student_id or resolved status.",
)
def list_alerts(
    student_id: Optional[str] = Query(None, description="Filter by student ID"),
    is_resolved: Optional[bool] = Query(None, description="Filter by resolved status"),
    db: Session = Depends(get_db),
):
    """List system alerts for early intervention."""
    query = db.query(Alert)
    if student_id:
        query = query.filter(Alert.student_id == student_id)
    if is_resolved is not None:
        query = query.filter(Alert.is_resolved == is_resolved)

    alerts = query.order_by(Alert.created_at.desc()).all()
    results = []
    for al in alerts:
        st_name = al.student.user.full_name if al.student and al.student.user else None
        res = AlertResponse(
            id=al.id,
            student_id=al.student_id,
            student_name=st_name,
            internship_id=al.internship_id,
            title=al.title,
            message=al.message,
            severity=al.severity,
            is_read=al.is_read,
            is_resolved=al.is_resolved,
            created_at=al.created_at,
        )
        results.append(res)
    return results


@router.patch(
    "/{alert_id}/resolve",
    response_model=AlertResponse,
    summary="Resolve alert",
    description="Mark an attention alert as resolved by a mentor or administrator.",
)
def resolve_alert(
    alert_id: str,
    payload: AlertResolveRequest,
    db: Session = Depends(get_db),
):
    """Mark alert as resolved."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Alert with ID '{alert_id}' not found",
        )

    alert.is_resolved = payload.is_resolved
    alert.is_read = True
    db.commit()
    db.refresh(alert)

    st_name = alert.student.user.full_name if alert.student and alert.student.user else None
    return AlertResponse(
        id=alert.id,
        student_id=alert.student_id,
        student_name=st_name,
        internship_id=alert.internship_id,
        title=alert.title,
        message=alert.message,
        severity=alert.severity,
        is_read=alert.is_read,
        is_resolved=alert.is_resolved,
        created_at=alert.created_at,
    )
