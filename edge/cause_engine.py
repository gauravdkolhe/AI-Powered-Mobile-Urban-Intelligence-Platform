"""
MargaDrishti (मार्गदृष्टि) - Slowdown Cause & Severity Analysis Engine
Spec Section 13 & 15: Correlates telemetry deceleration with vision detections
to answer: 'The bus slowed down — why?' and computes event severity.
"""

from typing import Dict, Any, Optional, Tuple
from .config import SPEED_REDUCTION_SIGNIFICANT_PERCENT, SPEED_REDUCTION_SEVERE_PERCENT

class SlowdownCauseEngine:
    """
    Fuses telemetry speed profiles, traffic density, and detected hazard classes
    to determine the most probable explanation for vehicle deceleration and calculate severity.
    """

    @staticmethod
    def analyze_slowdown(
        speed_info: Dict[str, float],
        traffic_density: str,
        detected_event_label: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Determines the 'likely_cause' and impact description.
        Returns: (likely_cause_code, impact_explanation)
        """
        drop_percent = speed_info.get("speed_reduction_percent", 0.0)
        is_slowdown = drop_percent >= SPEED_REDUCTION_SIGNIFICANT_PERCENT
        is_severe_drop = drop_percent >= SPEED_REDUCTION_SEVERE_PERCENT

        # Scenario: Road Defect (Pothole, Damaged Road)
        if detected_event_label in ["POTHOLE", "DAMAGED_ROAD"]:
            cause = "ROAD_DEFECT"
            if is_slowdown:
                explanation = f"Bus decelerated by {drop_percent}% to navigate detected {detected_event_label.lower().replace('_', ' ')}."
            else:
                explanation = f"{detected_event_label.replace('_', ' ').title()} observed with steady transit speed."
            return cause, explanation

        # Scenario: Waterlogging
        if detected_event_label == "WATERLOGGING":
            cause = "WATERLOGGING"
            if is_slowdown:
                explanation = f"Bus speed reduced by {drop_percent}% due to water accumulation and roadway hydroplaning risk."
            else:
                explanation = "Waterlogged surface detected; transit proceeding at moderate speed."
            return cause, explanation

        # Scenario: Pedestrian Activity
        if detected_event_label in ["PEDESTRIAN", "PEDESTRIAN_CROSSING", "VULNERABLE_PEDESTRIAN"]:
            cause = "PEDESTRIAN_ACTIVITY"
            if is_slowdown:
                explanation = f"Transit braked by {drop_percent}% accommodating pedestrian movement near roadway."
            else:
                explanation = "Pedestrian proximity flagged; safe transit speed maintained."
            return cause, explanation

        # Scenario: Incident / Road Obstruction / Collision
        if detected_event_label in ["ACCIDENT", "ROAD_OBSTRUCTION", "HIT_AND_RUN"]:
            cause = "INCIDENT"
            explanation = f"Significant obstruction or collision incident detected; bus speed altered by {drop_percent}%."
            return cause, explanation

        # Scenario: Traffic Congestion (Dense traffic + slowdown without defect)
        if traffic_density in ["HIGH", "SEVERE"] and is_slowdown:
            cause = "TRAFFIC_CONGESTION"
            explanation = f"High vehicle density ({traffic_density}) causing {drop_percent}% speed reduction along corridor."
            return cause, explanation

        # Scenario: Stoppage without visual hazard
        if is_slowdown:
            cause = "UNKNOWN / REQUIRES INVESTIGATION"
            explanation = f"Transit experienced {drop_percent}% speed drop without conspicuous visual obstacle."
            return cause, explanation

        return "NORMAL_OPERATION", "Transit operating within standard velocity parameters."

    @staticmethod
    def calculate_severity(
        event_type: str,
        confidence: float,
        speed_reduction_percent: float,
        traffic_density: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Assesses severity level: LOW, MEDIUM, HIGH, CRITICAL based on
        confidence, object metadata, speed impact, and event type.
        """
        meta = metadata or {}

        # Critical triggers: Accidents, hit-and-run, school children crossing hazard
        if event_type in ["ACCIDENT", "HIT_AND_RUN"]:
            return "CRITICAL"
        if event_type == "VULNERABLE_PEDESTRIAN" and meta.get("risk_type") == "SCHOOL_CHILDREN_CROSSING":
            return "CRITICAL"

        # High triggers: Deep pothole with severe braking, severe congestion, waterlogging with high reduction
        if event_type == "POTHOLE":
            depth = meta.get("depth_estimate_cm", 0.0)
            if depth > 10.0 or speed_reduction_percent > SPEED_REDUCTION_SEVERE_PERCENT:
                return "HIGH"
            elif speed_reduction_percent > SPEED_REDUCTION_SIGNIFICANT_PERCENT:
                return "MEDIUM"
            return "LOW"

        if event_type == "WATERLOGGING":
            if speed_reduction_percent > SPEED_REDUCTION_SIGNIFICANT_PERCENT or meta.get("submersion_risk") == "HIGH":
                return "HIGH"
            return "MEDIUM"

        if event_type == "TRAFFIC_CONGESTION":
            if traffic_density == "SEVERE" or speed_reduction_percent > SPEED_REDUCTION_SEVERE_PERCENT:
                return "HIGH"
            return "MEDIUM"

        if event_type == "DAMAGED_ROAD":
            if speed_reduction_percent > SPEED_REDUCTION_SIGNIFICANT_PERCENT:
                return "HIGH"
            return "MEDIUM"

        if event_type == "MISSING_SIGN":
            return "LOW"

        return "MEDIUM"
