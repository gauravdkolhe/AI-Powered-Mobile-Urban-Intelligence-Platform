"""
MargaDrishti (मार्गदृष्टि) - Route Delay & Cause Attribution Engine
Spec Section 31: Route Delay Analysis
Compares segment transit durations against baseline travel times
and links abnormal delays to nearby verified events (potholes, congestion, waterlogging, accidents).
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from ..models import RouteSegment, Event
from .defect_cluster import haversine_distance_meters

def analyze_segment_delays(db: Session) -> List[Dict[str, Any]]:
    """
    Evaluates all active route segments, detects abnormal delays (> 25% over baseline),
    and correlates nearby verified events within 300m of the segment path to explain the cause.
    """
    segments = db.query(RouteSegment).all()
    results = []

    for seg in segments:
        delay_ratio = seg.current_duration_min / max(0.1, seg.normal_duration_min)
        is_delayed = delay_ratio >= 1.30  # > 30% longer than baseline
        seg.is_delayed = is_delayed

        likely_cause = "NORMAL_FLOW"
        correlated_event_id = None
        delay_explanation = "Traffic moving at normal corridor velocity."

        if is_delayed:
            # Segment midpoint
            mid_lat = (seg.start_lat + seg.end_lat) / 2.0
            mid_lon = (seg.start_lon + seg.end_lon) / 2.0

            # Find closest event within 500 meters
            nearby_events = db.query(Event).all()
            closest_event: Optional[Event] = None
            min_dist = 600.0  # Search radius 600m

            for evt in nearby_events:
                dist = haversine_distance_meters(mid_lat, mid_lon, evt.latitude, evt.longitude)
                if dist < min_dist:
                    min_dist = dist
                    closest_event = evt

            if closest_event:
                likely_cause = closest_event.likely_cause
                correlated_event_id = closest_event.event_id
                delay_explanation = f"Delay correlated with {closest_event.event_type} ({closest_event.event_id}) causing {closest_event.speed_reduction_percent}% vehicle deceleration."
            else:
                likely_cause = "TRAFFIC_BOTTLENECK"
                delay_explanation = "Elevated volume / corridor bottleneck without specific point hazard detected."

            seg.likely_cause = likely_cause
            seg.correlated_event_id = correlated_event_id

        results.append({
            "segment_id": seg.id,
            "route_id": seg.route_id,
            "segment_name": seg.segment_name,
            "normal_duration_min": seg.normal_duration_min,
            "current_duration_min": seg.current_duration_min,
            "delay_minutes": round(max(0.0, seg.current_duration_min - seg.normal_duration_min), 1),
            "is_delayed": is_delayed,
            "likely_cause": likely_cause,
            "correlated_event_id": correlated_event_id,
            "explanation": delay_explanation,
            "start_coords": [seg.start_lat, seg.start_lon],
            "end_coords": [seg.end_lat, seg.end_lon]
        })

    db.commit()
    return results
