"""
MargaDrishti (मार्गदृष्टि) - Defect Clustering & Multi-Bus Confirmation
Spec Section 30: Repeated Event Confirmation
Correlates spatially proximate defect observations from different buses
into confirmed 'Persistent Road Defects' with reinforced confidence.
"""

from typing import List, Dict, Any
import math
from sqlalchemy.orm import Session
from ..models import Event, PersistentDefect

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance in meters between two coordinates."""
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def cluster_and_update_persistent_defects(db: Session, radius_meters: float = 30.0):
    """
    Scans road defect events (POTHOLE, DAMAGED_ROAD, WATERLOGGING),
    groups them within radius_meters, and updates PersistentDefect entities.
    """
    defect_events = db.query(Event).filter(
        Event.event_type.in_(["POTHOLE", "DAMAGED_ROAD", "WATERLOGGING"])
    ).order_by(Event.timestamp.asc()).all()

    if not defect_events:
        return

    # Spatial clustering
    clusters: List[List[Event]] = []
    for evt in defect_events:
        placed = False
        for cluster in clusters:
            # check distance against cluster representative (first event)
            rep = cluster[0]
            if evt.event_type == rep.event_type:
                dist = haversine_distance_meters(evt.latitude, evt.longitude, rep.latitude, rep.longitude)
                if dist <= radius_meters:
                    cluster.append(evt)
                    placed = True
                    break
        if not placed:
            clusters.append([evt])

    # Convert clusters into PersistentDefect records
    for idx, cluster in enumerate(clusters):
        defect_id = f"DEF_{(idx + 1):04d}"
        rep = cluster[0]
        
        # Collect distinct buses
        buses = sorted(list(set(e.bus_id for e in cluster)))
        obs_count = len(cluster)
        first_time = cluster[0].timestamp
        last_time = cluster[-1].timestamp
        
        # Confidence increases with repeated observations: 1 - (1-0.9)^N
        base_conf = max(e.confidence for e in cluster)
        multi_conf = min(0.99, round(base_conf + (obs_count - 1) * 0.02, 2))
        
        # Average coordinates
        avg_lat = sum(e.latitude for e in cluster) / obs_count
        avg_lon = sum(e.longitude for e in cluster) / obs_count

        existing = db.query(PersistentDefect).filter(PersistentDefect.defect_id == defect_id).first()
        if existing:
            existing.observation_count = obs_count
            existing.observed_by_buses = ", ".join(buses)
            existing.last_detected = last_time
            existing.confidence = multi_conf
            existing.latitude = avg_lat
            existing.longitude = avg_lon
        else:
            new_defect = PersistentDefect(
                defect_id=defect_id,
                defect_type=rep.event_type,
                latitude=round(avg_lat, 6),
                longitude=round(avg_lon, 6),
                location_name=rep.location_name or "Urban Transit Corridor",
                observed_by_buses=", ".join(buses),
                observation_count=obs_count,
                first_detected=first_time,
                last_detected=last_time,
                confidence=multi_conf,
                severity=rep.severity,
                status="CONFIRMED_BY_FLEET" if len(buses) > 1 else "PENDING_INSPECTION"
            )
            db.add(new_defect)
    
    db.commit()
