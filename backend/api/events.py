"""
MargaDrishti (मार्गदृष्टि) - Events API Endpoints
Spec Section 17, 26, 34: Ingestion, Filtering, Details, and Workflow State Transitions.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import asyncio

from ..database import get_db
from ..models import Event
from ..schemas import EventIngestSchema, EventStatusUpdateSchema
from ..websocket.manager import manager
from ..analytics.defect_cluster import cluster_and_update_persistent_defects
from ..analytics.delay_analyzer import analyze_segment_delays

router = APIRouter(prefix="/api/events", tags=["Events"])

@router.post("", status_code=201)
async def ingest_event(payload: EventIngestSchema, db: Session = Depends(get_db)):
    """
    Edge-to-Cloud Ingestion Endpoint (Spec Section 17 & 22).
    Receives JSON events from on-bus edge units.
    """
    # Check if event already exists
    existing = db.query(Event).filter(Event.event_id == payload.event_id).first()
    if existing:
        return {"status": "ALREADY_EXISTS", "event_id": payload.event_id}

    evidence_img = None
    if payload.evidence and payload.evidence.image_available:
        evidence_img = payload.evidence.image_path or f"/uploads/{payload.event_id}_snapshot.jpg"

    event = Event(
        event_id=payload.event_id,
        event_type=payload.event_type,
        bus_id=payload.bus_id,
        route_id=payload.route_id,
        camera_id=payload.camera_id,
        timestamp=payload.timestamp,
        latitude=payload.location.latitude,
        longitude=payload.location.longitude,
        location_name=f"Corridor {payload.route_id} ({payload.location.latitude:.4f}, {payload.location.longitude:.4f})",
        current_kmh=payload.speed.current_kmh,
        previous_kmh=payload.speed.previous_kmh,
        speed_reduction_percent=payload.speed.speed_reduction_percent,
        traffic_density=payload.traffic.density,
        confidence=payload.ai.confidence,
        severity=payload.severity,
        likely_cause=payload.likely_cause,
        impact_explanation=payload.impact_explanation,
        image_available=payload.evidence.image_available if payload.evidence else True,
        video_available=payload.evidence.video_available if payload.evidence else False,
        evidence_image_url=evidence_img,
        status=payload.status or "PENDING_VERIFICATION",
        metadata_json=json.dumps(payload.metadata or {})
    )

    db.add(event)
    db.commit()
    db.refresh(event)

    # Re-run clustering if hazard
    if payload.event_type in ["POTHOLE", "DAMAGED_ROAD", "WATERLOGGING"]:
        cluster_and_update_persistent_defects(db)
        analyze_segment_delays(db)

    # Real-time WebSocket broadcast to GIS Dashboard
    event_dict = {
        "event_id": event.event_id,
        "event_type": event.event_type,
        "bus_id": event.bus_id,
        "route_id": event.route_id,
        "timestamp": event.timestamp,
        "latitude": event.latitude,
        "longitude": event.longitude,
        "location_name": event.location_name,
        "current_kmh": event.current_kmh,
        "previous_kmh": event.previous_kmh,
        "speed_reduction_percent": event.speed_reduction_percent,
        "traffic_density": event.traffic_density,
        "confidence": event.confidence,
        "severity": event.severity,
        "likely_cause": event.likely_cause,
        "evidence_image_url": event.evidence_image_url,
        "status": event.status
    }
    await manager.broadcast("NEW_EVENT", event_dict)

    return {"status": "INGESTED", "event_id": event.event_id}

@router.get("")
def get_events(
    event_type: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    route_id: Optional[str] = Query(None),
    bus_id: Optional[str] = Query(None),
    limit: int = Query(100, le=500),
    db: Session = Depends(get_db)
):
    """
    Fetches events with multi-criteria authority filtering (Spec Section 27).
    """
    query = db.query(Event)

    if event_type and event_type != "ALL":
        query = query.filter(Event.event_type == event_type)
    if severity and severity != "ALL":
        query = query.filter(Event.severity == severity)
    if status and status != "ALL":
        query = query.filter(Event.status == status)
    if route_id and route_id != "ALL":
        query = query.filter(Event.route_id == route_id)
    if bus_id and bus_id != "ALL":
        query = query.filter(Event.bus_id == bus_id)

    events = query.order_by(Event.id.desc()).limit(limit).all()
    return events

@router.get("/{event_id}")
def get_event_detail(event_id: str, db: Session = Depends(get_db)):
    """
    Retrieves full event details for the Authority Event Detail Panel (Spec Section 26).
    """
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")
    return event

@router.patch("/{event_id}/status")
async def update_event_status(
    event_id: str,
    update: EventStatusUpdateSchema,
    db: Session = Depends(get_db)
):
    """
    Authority Workflow Transition Endpoint (Spec Section 34).
    Transitions: DETECTED -> PENDING_VERIFICATION -> ASSIGNED -> UNDER_INSPECTION -> RESOLVED -> CLOSED
    """
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail=f"Event {event_id} not found")

    event.status = update.status
    if update.assigned_to:
        event.assigned_to = update.assigned_to
    if update.resolution_notes:
        event.resolution_notes = update.resolution_notes

    db.commit()
    db.refresh(event)

    # Broadcast status change to connected GIS dashboards
    await manager.broadcast("EVENT_STATUS_UPDATED", {
        "event_id": event.event_id,
        "status": event.status,
        "assigned_to": event.assigned_to,
        "resolution_notes": event.resolution_notes
    })

    return {"status": "UPDATED", "event_id": event.event_id, "new_status": event.status}
