"""
MargaDrishti (मार्गदृष्टि) - Work Order Management API
Enables Municipal Corporation to assign repair tasks to PWD,
and allows PWD to execute, upload completion proof, and request closure.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
import random

from ..database import get_db
from ..models import WorkOrder, Event
from ..schemas import (
    WorkOrderCreateSchema,
    WorkOrderStatusUpdateSchema,
    WorkOrderProofSchema,
    WorkOrderOutSchema
)
from ..websocket.manager import manager

router = APIRouter(prefix="/api/work-orders", tags=["Work Orders"])

@router.get("", response_model=List[WorkOrderOutSchema])
def list_work_orders(
    status: Optional[str] = Query(None),
    assigned_department: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Fetches work orders with optional filtering for PWD inbox or Municipal tracking.
    """
    query = db.query(WorkOrder)
    if isinstance(status, str) and status != "ALL":
        query = query.filter(WorkOrder.status == status)
    if isinstance(assigned_department, str) and assigned_department != "ALL":
        query = query.filter(WorkOrder.assigned_department == assigned_department)
    if isinstance(priority, str) and priority != "ALL":
        query = query.filter(WorkOrder.priority == priority)

    return query.order_by(WorkOrder.id.desc()).all()

@router.post("", response_model=WorkOrderOutSchema, status_code=201)
async def create_work_order(
    payload: WorkOrderCreateSchema,
    db: Session = Depends(get_db)
):
    """
    Municipal Corporation action: Turns a verified road hazard event
    into an official Work Order dispatched to PWD.
    """
    count = db.query(WorkOrder).count() + 1040
    order_id = f"WO_{count}"

    work_order = WorkOrder(
        order_id=order_id,
        event_id=payload.event_id,
        title=payload.title,
        problem_type=payload.problem_type,
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        severity=payload.severity,
        priority=payload.priority,
        assigned_department=payload.assigned_department or "PWD",
        assigned_zone=payload.assigned_zone or "PWD Zone 3 - Western Corridor",
        deadline_date=payload.deadline_date or "Within 48 Hours",
        status="ASSIGNED",
        evidence_before_url=payload.evidence_before_url,
        repair_notes=payload.repair_notes,
        created_at=datetime.now(timezone.utc)
    )

    db.add(work_order)

    # Link to Event if specified and update Event status to WORK_ORDER_CREATED
    if payload.event_id:
        event = db.query(Event).filter(Event.event_id == payload.event_id).first()
        if event:
            event.status = "WORK_ORDER_CREATED"
            event.work_order_id = order_id
            event.assigned_to = f"PWD ({payload.assigned_zone})"

    db.commit()
    db.refresh(work_order)

    # Broadcast event via WebSocket
    await manager.broadcast("WORK_ORDER_CREATED", {
        "order_id": work_order.order_id,
        "title": work_order.title,
        "problem_type": work_order.problem_type,
        "priority": work_order.priority,
        "assigned_zone": work_order.assigned_zone,
        "status": work_order.status
    })

    return work_order

@router.get("/{order_id}", response_model=WorkOrderOutSchema)
def get_work_order(order_id: str, db: Session = Depends(get_db)):
    """Retrieves specific work order details and visual proof."""
    work_order = db.query(WorkOrder).filter(WorkOrder.order_id == order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail=f"Work Order {order_id} not found")
    return work_order

@router.patch("/{order_id}/status", response_model=WorkOrderOutSchema)
async def update_work_order_status(
    order_id: str,
    payload: WorkOrderStatusUpdateSchema,
    db: Session = Depends(get_db)
):
    """
    Transitions work order lifecycle:
    ASSIGNED -> IN_PROGRESS -> COMPLETED -> VERIFIED_AND_CLOSED
    """
    work_order = db.query(WorkOrder).filter(WorkOrder.order_id == order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail=f"Work Order {order_id} not found")

    work_order.status = payload.status

    now = datetime.now(timezone.utc)
    if payload.status == "COMPLETED":
        work_order.completed_at = now
    elif payload.status == "VERIFIED_AND_CLOSED":
        work_order.closed_at = now

    if payload.repair_notes:
        work_order.repair_notes = payload.repair_notes
    if payload.verification_notes:
        work_order.verification_notes = payload.verification_notes

    # Sync back to associated Event if any
    if work_order.event_id:
        event = db.query(Event).filter(Event.event_id == work_order.event_id).first()
        if event:
            if payload.status == "IN_PROGRESS":
                event.status = "UNDER_INSPECTION"
            elif payload.status == "COMPLETED":
                event.status = "COMPLETED"
            elif payload.status == "VERIFIED_AND_CLOSED":
                event.status = "RESOLVED"

    db.commit()
    db.refresh(work_order)

    await manager.broadcast("WORK_ORDER_STATUS_CHANGED", {
        "order_id": work_order.order_id,
        "status": work_order.status,
        "event_id": work_order.event_id
    })

    return work_order

@router.post("/{order_id}/proof", response_model=WorkOrderOutSchema)
async def upload_work_order_proof(
    order_id: str,
    payload: WorkOrderProofSchema,
    db: Session = Depends(get_db)
):
    """
    PWD Action: Uploads photographic proof of repaired road/hazard
    and automatically marks the work order as COMPLETED, awaiting Municipal verification.
    """
    work_order = db.query(WorkOrder).filter(WorkOrder.order_id == order_id).first()
    if not work_order:
        raise HTTPException(status_code=404, detail=f"Work Order {order_id} not found")

    work_order.evidence_after_url = payload.evidence_after_url
    work_order.status = "COMPLETED"
    work_order.completed_at = datetime.now(timezone.utc)
    if payload.repair_notes:
        work_order.repair_notes = payload.repair_notes

    if work_order.event_id:
        event = db.query(Event).filter(Event.event_id == work_order.event_id).first()
        if event:
            event.status = "COMPLETED"
            event.resolution_notes = payload.repair_notes

    db.commit()
    db.refresh(work_order)

    await manager.broadcast("WORK_ORDER_PROOF_SUBMITTED", {
        "order_id": work_order.order_id,
        "status": work_order.status,
        "proof_url": work_order.evidence_after_url
    })

    return work_order
