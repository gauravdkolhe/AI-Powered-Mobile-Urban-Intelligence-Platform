"""
MargaDrishti (मार्गदृष्टि) - Analytics API Endpoints
Spec Section 28, 29, 30, 31: Congestion Heatmaps, Road Condition, Repeated Defects, Route Delays.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Event, Bus, PersistentDefect, RouteSegment
from ..analytics.defect_cluster import cluster_and_update_persistent_defects
from ..analytics.delay_analyzer import analyze_segment_delays
from ..analytics.congestion_grid import get_congestion_heatmap_points, get_road_condition_network

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """Provides high-level KPI metrics for the Authority Dashboard."""
    total_events = db.query(Event).count()
    critical_events = db.query(Event).filter(Event.severity.in_(["HIGH", "CRITICAL"])).count()
    resolved_events = db.query(Event).filter(Event.status == "RESOLVED").count()
    active_buses = db.query(Bus).filter(Bus.status == "ONLINE").count()
    persistent_defects = db.query(PersistentDefect).count()

    potholes = db.query(Event).filter(Event.event_type == "POTHOLE").count()
    congestion_events = db.query(Event).filter(Event.event_type.in_(["CONGESTION", "TRAFFIC_CONGESTION"])).count()
    waterlogging = db.query(Event).filter(Event.event_type == "WATERLOGGING").count()
    pedestrian_events = db.query(Event).filter(Event.event_type.in_(["PEDESTRIAN", "VULNERABLE_PEDESTRIAN"])).count()

    return {
        "kpis": {
            "total_events": total_events,
            "critical_events": critical_events,
            "resolved_events": resolved_events,
            "active_buses": active_buses,
            "persistent_defects": persistent_defects
        },
        "breakdown": {
            "potholes": potholes,
            "congestion": congestion_events,
            "waterlogging": waterlogging,
            "pedestrian_risk": pedestrian_events
        }
    }

@router.get("/repeated-defects")
def get_repeated_defects(db: Session = Depends(get_db)):
    """Spec Section 30: Multi-bus aggregated persistent road defects."""
    defects = db.query(PersistentDefect).order_by(PersistentDefect.observation_count.desc()).all()
    return defects

@router.get("/route-delays")
def get_route_delays(db: Session = Depends(get_db)):
    """Spec Section 31: Route delay analysis with cause attribution."""
    return analyze_segment_delays(db)

@router.get("/congestion-heatmap")
def get_congestion_heatmap(db: Session = Depends(get_db)):
    """Spec Section 28: Heatmap coordinate points."""
    return get_congestion_heatmap_points(db)

@router.get("/road-conditions")
def get_road_conditions(db: Session = Depends(get_db)):
    """Spec Section 29: Road condition status across key arterial corridors."""
    return get_road_condition_network(db)
