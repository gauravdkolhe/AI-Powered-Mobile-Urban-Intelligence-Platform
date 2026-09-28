"""
MargaDrishti (मार्गदृष्टि) - Fleet Telemetry & Bus Management API
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from ..database import get_db
from ..models import Bus
from ..schemas import TelemetryPingSchema, BusOutSchema, BusCreateSchema
from ..websocket.manager import manager

router = APIRouter(prefix="/api/fleet", tags=["Fleet"])

@router.get("")
def get_fleet(db: Session = Depends(get_db)):
    """Retrieves all registered transit buses and their current coordinates/status."""
    buses = db.query(Bus).all()
    return buses

@router.post("/buses", status_code=201)
async def register_bus(payload: BusCreateSchema, db: Session = Depends(get_db)):
    """
    Public Transport Operator action: Adds a new bus to the fleet sensing network.
    """
    existing = db.query(Bus).filter(Bus.bus_id == payload.bus_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Bus {payload.bus_id} is already registered.")

    bus = Bus(
        bus_id=payload.bus_id,
        route_id=payload.route_id,
        model=payload.model,
        hardware_profile=payload.hardware_profile,
        latitude=payload.latitude,
        longitude=payload.longitude,
        heading=payload.heading,
        speed_kmh=payload.speed_kmh,
        status="ONLINE",
        last_ping=datetime.now(timezone.utc)
    )
    db.add(bus)
    db.commit()
    db.refresh(bus)

    await manager.broadcast("NEW_BUS_REGISTERED", {
        "bus_id": bus.bus_id,
        "route_id": bus.route_id,
        "model": bus.model,
        "status": bus.status
    })

    return bus

@router.post("/telemetry")
async def update_bus_telemetry(payload: TelemetryPingSchema, db: Session = Depends(get_db)):
    """
    Receives periodic telemetry ping from an on-bus edge computer
    and broadcasts the updated GPS position to the GIS dashboard.
    """
    bus = db.query(Bus).filter(Bus.bus_id == payload.bus_id).first()
    if not bus:
        bus = Bus(
            bus_id=payload.bus_id,
            route_id=payload.route_id,
            status="ONLINE"
        )
        db.add(bus)

    bus.latitude = payload.latitude
    bus.longitude = payload.longitude
    bus.heading = payload.heading
    bus.speed_kmh = payload.speed_kmh
    bus.status = "ONLINE"
    bus.last_ping = datetime.now(timezone.utc)

    db.commit()

    # Broadcast bus movement via WebSocket
    bus_data = {
        "bus_id": bus.bus_id,
        "route_id": bus.route_id,
        "latitude": bus.latitude,
        "longitude": bus.longitude,
        "heading": bus.heading,
        "speed_kmh": bus.speed_kmh,
        "status": bus.status
    }
    await manager.broadcast("FLEET_TELEMETRY", bus_data)

    return {"status": "TELEMETRY_UPDATED", "bus_id": bus.bus_id}

