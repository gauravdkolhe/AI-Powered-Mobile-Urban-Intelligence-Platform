"""
MargaDrishti (मार्गदृष्टि) - Standardized JSON Event Generator
Spec Section 16 & 17: Data fusion combining AI detection, GPS, speed, timestamp,
traffic density, likely cause, and evidence metadata into the official JSON schema.
"""

from datetime import datetime, timezone
import uuid
from typing import Dict, Any, Optional
from .config import BUS_ID, ROUTE_ID, CAMERA_ID
from .tracker import TrackedObject
from .cause_engine import SlowdownCauseEngine

class EdgeEventGenerator:
    def __init__(self, bus_id: str = BUS_ID, route_id: str = ROUTE_ID, camera_id: str = CAMERA_ID):
        self.bus_id = bus_id
        self.route_id = route_id
        self.camera_id = camera_id
        self.event_counter = 180

    def generate_event(
        self,
        validated_track: TrackedObject,
        telemetry_snapshot: Dict[str, Any],
        traffic_density: str,
        evidence_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Creates the standardized JSON event specified in Section 17.
        """
        self.event_counter += 1
        event_id = f"EVT_{self.event_counter:05d}"
        
        speed_data = telemetry_snapshot.get("speed", {})
        speed_reduction = speed_data.get("speed_reduction_percent", 0.0)
        
        # Analyze cause
        likely_cause, cause_explanation = SlowdownCauseEngine.analyze_slowdown(
            speed_info=speed_data,
            traffic_density=traffic_density,
            detected_event_label=validated_track.label
        )

        # Determine severity
        severity = SlowdownCauseEngine.calculate_severity(
            event_type=validated_track.label,
            confidence=validated_track.confidence,
            speed_reduction_percent=speed_reduction,
            traffic_density=traffic_density,
            metadata=validated_track.metadata
        )

        evidence = evidence_info or {
            "image_available": True,
            "video_available": False,
            "image_path": f"/uploads/{event_id}_snapshot.jpg"
        }

        # Exact JSON Schema as required by Spec Section 17
        event_payload = {
            "event_id": event_id,
            "event_type": validated_track.label,
            "bus_id": self.bus_id,
            "route_id": self.route_id,
            "camera_id": self.camera_id,
            "timestamp": telemetry_snapshot.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "location": {
                "latitude": telemetry_snapshot["location"]["latitude"],
                "longitude": telemetry_snapshot["location"]["longitude"]
            },
            "speed": {
                "current_kmh": speed_data.get("current_kmh", 0.0),
                "previous_kmh": speed_data.get("previous_kmh", 0.0),
                "speed_reduction_percent": speed_reduction
            },
            "traffic": {
                "density": traffic_density
            },
            "ai": {
                "confidence": validated_track.confidence,
                "bbox": validated_track.bbox,
                "track_id": validated_track.track_id
            },
            "severity": severity,
            "likely_cause": likely_cause,
            "evidence": evidence,
            "impact_explanation": cause_explanation,
            "status": "PENDING_VERIFICATION",
            "metadata": validated_track.metadata
        }

        return event_payload
