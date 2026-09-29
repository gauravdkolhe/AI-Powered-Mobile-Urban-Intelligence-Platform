"""
MargaDrishti (मार्गदृष्टि) - SQLAlchemy Database Models
Spec Section 23, 26, 30, 31, 32, 33, 34
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime
from datetime import datetime, timezone
from .database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(64), unique=True, index=True, nullable=False)
    event_type = Column(String(64), index=True, nullable=False)  # POTHOLE, CONGESTION, WATERLOGGING, etc.
    bus_id = Column(String(64), index=True, nullable=False)
    route_id = Column(String(64), index=True, nullable=False)
    camera_id = Column(String(64), default="CAM_FRONT")
    timestamp = Column(String(64), nullable=False)

    # Geographic Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), default="Urban Transit Corridor")

    # Telemetry & Speed Dynamics
    current_kmh = Column(Float, default=0.0)
    previous_kmh = Column(Float, default=0.0)
    speed_reduction_percent = Column(Float, default=0.0)

    # Context & Density
    traffic_density = Column(String(32), default="NORMAL")
    confidence = Column(Float, default=0.90)
    severity = Column(String(32), index=True, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    likely_cause = Column(String(64), default="ROAD_DEFECT")
    impact_explanation = Column(Text, nullable=True)

    # Evidence References
    image_available = Column(Boolean, default=True)
    video_available = Column(Boolean, default=False)
    evidence_image_url = Column(String(512), nullable=True)
    evidence_video_url = Column(String(512), nullable=True)

    # Authority & Work Order Status
    # AI_DETECTED -> PENDING_VERIFICATION -> VERIFIED -> WORK_ORDER_CREATED -> ASSIGNED -> IN_PROGRESS -> COMPLETED -> VERIFIED_AND_CLOSED
    status = Column(String(64), default="PENDING_VERIFICATION", index=True)
    work_order_id = Column(String(64), nullable=True)
    assigned_to = Column(String(128), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Bus(Base):
    __tablename__ = "buses"

    bus_id = Column(String(64), primary_key=True, index=True)
    route_id = Column(String(64), index=True)
    model = Column(String(128), default="Tata Starbus EV")
    hardware_profile = Column(String(64), default="NVIDIA Jetson")
    status = Column(String(32), default="ONLINE")  # ONLINE, BUFFERING, OFFLINE
    last_ping = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    latitude = Column(Float, default=19.0760)
    longitude = Column(Float, default=72.8777)
    heading = Column(Float, default=180.0)
    speed_kmh = Column(Float, default=32.0)

class PersistentDefect(Base):
    __tablename__ = "persistent_defects"

    defect_id = Column(String(64), primary_key=True, index=True)
    defect_type = Column(String(64), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255))
    observed_by_buses = Column(String(255))  # e.g. "BUS_101, BUS_107, BUS_114, BUS_121"
    observation_count = Column(Integer, default=1)
    first_detected = Column(String(64))
    last_detected = Column(String(64))
    confidence = Column(Float, default=0.95)
    severity = Column(String(32), default="HIGH")
    status = Column(String(64), default="PENDING_INSPECTION")

class RouteSegment(Base):
    __tablename__ = "route_segments"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(String(64), index=True, nullable=False)
    segment_name = Column(String(128), nullable=False)  # e.g. "Segment B -> C"
    start_lat = Column(Float, nullable=False)
    start_lon = Column(Float, nullable=False)
    end_lat = Column(Float, nullable=False)
    end_lon = Column(Float, nullable=False)
    normal_duration_min = Column(Float, default=5.0)
    current_duration_min = Column(Float, default=5.0)
    is_delayed = Column(Boolean, default=False)
    likely_cause = Column(String(64), nullable=True)
    correlated_event_id = Column(String(64), nullable=True)

class IncidentLead(Base):
    __tablename__ = "incident_leads"

    incident_id = Column(String(64), primary_key=True, index=True)
    incident_type = Column(String(64), nullable=False)
    vehicle_type = Column(String(64), default="CAR")
    license_plate = Column(String(32), index=True, nullable=False)
    ocr_confidence = Column(Float, default=0.92)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255))
    timestamp = Column(String(64), nullable=False)
    reporting_bus_id = Column(String(64), nullable=False)
    status = Column(String(64), default="UNDER_INVESTIGATION")
    reason = Column(String(255), nullable=True)
    evidence_snapshot_url = Column(String(512))
    notes = Column(Text, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(64), unique=True, index=True, nullable=False)
    name = Column(String(128), nullable=False)
    email = Column(String(128), nullable=False)
    department = Column(String(128), nullable=False)  # e.g. "Public Transport Authority", "Traffic Police Department", "Brihanmumbai Municipal Corporation (BMC)", "Public Works Department (PWD)"
    role = Column(String(64), index=True, nullable=False)  # TRANSPORT_OPERATOR, TRAFFIC_DEPT, MUNICIPAL_CORP, PWD
    zone = Column(String(128), default="Central City / Fleet HQ")
    avatar = Column(String(255), default="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80")

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String(64), unique=True, index=True, nullable=False)  # e.g. "WO_1042"
    event_id = Column(String(64), index=True, nullable=True)  # Associated Event ID, e.g. "EVT_00182"
    title = Column(String(255), nullable=False)
    problem_type = Column(String(64), nullable=False)  # POTHOLE, DAMAGED_ROAD, WATERLOGGING, INFRASTRUCTURE
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(String(32), default="HIGH")
    priority = Column(String(32), default="HIGH")  # NORMAL, HIGH, EMERGENCY
    
    # Department & Assignment
    assigned_department = Column(String(64), default="PWD")
    assigned_zone = Column(String(128), default="PWD Zone 3 - Western Corridor")
    created_by_department = Column(String(128), default="Brihanmumbai Municipal Corporation (BMC)")
    created_by_user = Column(String(128), default="Dr. Sneha Patil (BMC Ward H-West)")
    deadline_date = Column(String(64), nullable=True)

    # Status: ASSIGNED -> IN_PROGRESS -> COMPLETED -> VERIFIED_AND_CLOSED
    status = Column(String(64), default="ASSIGNED", index=True)
    
    # Visual Evidence
    evidence_before_url = Column(String(512), nullable=True)  # Snapshot from bus edge AI
    evidence_after_url = Column(String(512), nullable=True)   # Repaired photo uploaded by PWD crew

    repair_notes = Column(Text, nullable=True)
    verification_notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)

