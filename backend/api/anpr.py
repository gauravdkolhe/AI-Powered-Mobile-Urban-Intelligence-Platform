"""
MargaDrishti (मार्गदृष्टि) - ANPR & Incident Management API
Spec Section 32 & 33: Incident dossiers, hit-and-run tracking, and license plate lookups.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List

from ..database import get_db
from ..models import IncidentLead

router = APIRouter(prefix="/api/anpr", tags=["ANPR & Incidents"])

@router.get("/incidents")
def get_incident_leads(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Fetches flagged safety incidents and hit-and-run leads."""
    query = db.query(IncidentLead)
    if status and status != "ALL":
        query = query.filter(IncidentLead.status == status)
    return query.order_by(IncidentLead.incident_id.desc()).all()

@router.get("/search")
def search_license_plate(plate: str, db: Session = Depends(get_db)):
    """Searches for records associated with a specific vehicle registration plate."""
    clean_plate = plate.replace(" ", "").upper()
    leads = db.query(IncidentLead).filter(
        IncidentLead.license_plate.like(f"%{clean_plate}%")
    ).all()
    return leads

@router.patch("/incidents/{incident_id}/status")
def update_incident_status(
    incident_id: str,
    status: str,
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    lead = db.query(IncidentLead).filter(IncidentLead.incident_id == incident_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    lead.status = status
    if notes:
        lead.notes = (lead.notes or "") + f"\n[Update]: {notes}"

    db.commit()
    return {"status": "UPDATED", "incident_id": incident_id, "new_status": lead.status}
