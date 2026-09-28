"""
MargaDrishti (मार्गदृष्टि) - Pydantic Request/Response Schemas
Spec Section 17, 26, 30, 31, 32, 34
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

class LocationSchema(BaseModel):
    latitude: float
    longitude: float
    heading: Optional[float] = 0.0

class SpeedSchema(BaseModel):
    current_kmh: float
    previous_kmh: float
    speed_reduction_percent: float

class TrafficSchema(BaseModel):
    density: str = "NORMAL"

class AISchema(BaseModel):
    confidence: float
    bbox: Optional[List[int]] = None
    track_id: Optional[int] = None

class EvidenceSchema(BaseModel):
    image_available: bool = True
    video_available: bool = False
    image_path: Optional[str] = None
    video_path: Optional[str] = None

# Ingestion Schema matching Spec Section 17 precisely
class EventIngestSchema(BaseModel):
    event_id: str
    event_type: str
    bus_id: str
    route_id: str
    camera_id: str = "CAM_FRONT"
    timestamp: str
    location: LocationSchema
    speed: SpeedSchema
    traffic: TrafficSchema
    ai: AISchema
    severity: str = "MEDIUM"
    likely_cause: str = "ROAD_DEFECT"
    evidence: Optional[EvidenceSchema] = None
    impact_explanation: Optional[str] = None
    status: Optional[str] = "PENDING_VERIFICATION"
    metadata: Optional[Dict[str, Any]] = None

class EventStatusUpdateSchema(BaseModel):
    status: str  # DETECTED, PENDING_VERIFICATION, ASSIGNED, UNDER_INSPECTION, RESOLVED, CLOSED
    assigned_to: Optional[str] = None
    resolution_notes: Optional[str] = None

class TelemetryPingSchema(BaseModel):
    bus_id: str
    route_id: str
    latitude: float
    longitude: float
    heading: float = 0.0
    speed_kmh: float = 30.0
    timestamp: Optional[str] = None

class BusOutSchema(BaseModel):
    bus_id: str
    route_id: str
    model: str
    hardware_profile: str
    status: str
    latitude: float
    longitude: float
    heading: float
    speed_kmh: float

class PersistentDefectOutSchema(BaseModel):
    defect_id: str
    defect_type: str
    latitude: float
    longitude: float
    location_name: Optional[str]
    observed_by_buses: str
    observation_count: int
    first_detected: str
    last_detected: str
    confidence: float
    severity: str
    status: str

class RouteSegmentOutSchema(BaseModel):
    id: int
    route_id: str
    segment_name: str
    normal_duration_min: float
    current_duration_min: float
    is_delayed: bool
    likely_cause: Optional[str]
    correlated_event_id: Optional[str]

# --- User & RBAC Schemas ---
class UserSchema(BaseModel):
    user_id: str
    name: str
    email: str
    department: str
    role: str  # TRANSPORT_OPERATOR, TRAFFIC_DEPT, MUNICIPAL_CORP, PWD
    zone: str
    avatar: str

class UserLoginSchema(BaseModel):
    user_id: str

# --- Work Order Schemas ---
class WorkOrderCreateSchema(BaseModel):
    event_id: Optional[str] = None
    title: str
    problem_type: str  # POTHOLE, DAMAGED_ROAD, WATERLOGGING, INFRASTRUCTURE
    location_name: str
    latitude: float
    longitude: float
    severity: str = "HIGH"
    priority: str = "HIGH"
    assigned_department: str = "PWD"
    assigned_zone: str = "PWD Zone 3 - Western Corridor"
    deadline_date: Optional[str] = None
    evidence_before_url: Optional[str] = None
    repair_notes: Optional[str] = None

class WorkOrderStatusUpdateSchema(BaseModel):
    status: str  # ASSIGNED, IN_PROGRESS, COMPLETED, VERIFIED_AND_CLOSED
    repair_notes: Optional[str] = None
    verification_notes: Optional[str] = None

class WorkOrderProofSchema(BaseModel):
    evidence_after_url: str
    repair_notes: Optional[str] = None

class WorkOrderOutSchema(BaseModel):
    id: int
    order_id: str
    event_id: Optional[str]
    title: str
    problem_type: str
    location_name: str
    latitude: float
    longitude: float
    severity: str
    priority: str
    assigned_department: str
    assigned_zone: str
    created_by_department: str
    created_by_user: str
    deadline_date: Optional[str]
    status: str
    evidence_before_url: Optional[str]
    evidence_after_url: Optional[str]
    repair_notes: Optional[str]
    verification_notes: Optional[str]
    created_at: Optional[datetime]
    completed_at: Optional[datetime]
    closed_at: Optional[datetime]

class BusCreateSchema(BaseModel):
    bus_id: str
    route_id: str
    model: str = "Tata Starbus EV Ultra"
    hardware_profile: str = "NVIDIA Jetson"
    latitude: float = 19.0760
    longitude: float = 72.8777
    heading: float = 180.0
    speed_kmh: float = 30.0

