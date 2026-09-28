"""
MargaDrishti (मार्गदृष्टि) - Multi-Bus Fleet & Event Simulator
Simulates buses travelling along Mumbai transit corridors, emitting live GPS telemetry,
and triggering realistic road events (Potholes, Congestion, Waterlogging, Pedestrian Risk, ANPR).
"""

import time
import math
import json
import urllib.request
import urllib.error
from datetime import datetime, timezone
import random

BASE_URL = "http://127.0.0.1:8000"

# Bus Routes and waypoints across Mumbai
BUS_ROUTES = {
    "BUS_102": {
        "route_id": "R12",
        "waypoints": [
            (19.0550, 72.8420),
            (19.0620, 72.8680),
            (19.0760, 72.8777), # Pothole location
            (19.0850, 72.8650),
            (19.0950, 72.8550),
            (19.1136, 72.8697)
        ]
    },
    "BUS_105": {
        "route_id": "R40",
        "waypoints": [
            (19.1180, 72.8460),
            (19.1150, 72.8580),
            (19.1136, 72.8697), # Congestion location
            (19.1120, 72.8820)
        ]
    },
    "BUS_107": {
        "route_id": "R12",
        "waypoints": [
            (19.0950, 72.8450),
            (19.0882, 72.8421), # Waterlogging location
            (19.0760, 72.8777),
            (19.0620, 72.8680)
        ]
    }
}

def post_json(url: str, data: dict):
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=2.0) as resp:
            return resp.status in [200, 201]
    except Exception as e:
        return False

def simulate_step_telemetry(bus_id: str, lat: float, lon: float, speed_kmh: float, heading: float = 180.0):
    route_id = BUS_ROUTES.get(bus_id, {}).get("route_id", "R12")
    payload = {
        "bus_id": bus_id,
        "route_id": route_id,
        "latitude": round(lat, 6),
        "longitude": round(lon, 6),
        "heading": round(heading, 1),
        "speed_kmh": round(speed_kmh, 1),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    return post_json(f"{BASE_URL}/api/fleet/telemetry", payload)

def trigger_pothole_event(bus_id: str = "BUS_102"):
    """Triggers Spec Section 17 & 35 Pothole Event on Western Express Highway"""
    event_payload = {
        "event_id": f"EVT_{random.randint(200, 999):05d}",
        "event_type": "POTHOLE",
        "bus_id": bus_id,
        "route_id": "R12",
        "camera_id": "CAM_FRONT",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "location": {
            "latitude": 19.0760,
            "longitude": 72.8777
        },
        "speed": {
            "current_kmh": 12.4,
            "previous_kmh": 34.1,
            "speed_reduction_percent": 63.6
        },
        "traffic": {
            "density": "NORMAL"
        },
        "ai": {
            "confidence": 0.93,
            "bbox": [410, 520, 680, 690]
        },
        "severity": "HIGH",
        "likely_cause": "ROAD_DEFECT",
        "evidence": {
            "image_available": True,
            "video_available": False,
            "image_path": "/uploads/EVT_00182_snapshot.jpg"
        },
        "impact_explanation": "Bus decelerated by 63.6% to navigate severe pothole defect (~14.5cm depth).",
        "status": "PENDING_VERIFICATION",
        "metadata": {
            "depth_estimate_cm": 14.5,
            "area_sq_m": 0.42
        }
    }
    return post_json(f"{BASE_URL}/api/events", event_payload)

def trigger_congestion_event(bus_id: str = "BUS_105"):
    event_payload = {
        "event_id": f"EVT_{random.randint(200, 999):05d}",
        "event_type": "CONGESTION",
        "bus_id": bus_id,
        "route_id": "R40",
        "camera_id": "CAM_FRONT",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "location": {
            "latitude": 19.1136,
            "longitude": 72.8697
        },
        "speed": {
            "current_kmh": 8.2,
            "previous_kmh": 32.0,
            "speed_reduction_percent": 74.3
        },
        "traffic": {
            "density": "SEVERE"
        },
        "ai": {
            "confidence": 0.95,
            "bbox": [180, 180, 520, 220]
        },
        "severity": "HIGH",
        "likely_cause": "TRAFFIC_CONGESTION",
        "evidence": {
            "image_available": True,
            "video_available": False,
            "image_path": "/uploads/EVT_00183_snapshot.jpg"
        },
        "impact_explanation": "Dense gridlock detected; 14 active vehicles in bus path, severe slowdown.",
        "status": "ASSIGNED"
    }
    return post_json(f"{BASE_URL}/api/events", event_payload)

def trigger_anpr_incident(bus_id: str = "BUS_108"):
    event_payload = {
        "event_id": f"EVT_{random.randint(200, 999):05d}",
        "event_type": "ACCIDENT",
        "bus_id": bus_id,
        "route_id": "R12",
        "camera_id": "CAM_FRONT",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "location": {
            "latitude": 19.0620,
            "longitude": 72.8680
        },
        "speed": {
            "current_kmh": 28.0,
            "previous_kmh": 36.0,
            "speed_reduction_percent": 22.2
        },
        "traffic": {
            "density": "HIGH"
        },
        "ai": {
            "confidence": 0.94,
            "bbox": [280, 170, 360, 230]
        },
        "severity": "CRITICAL",
        "likely_cause": "INCIDENT",
        "evidence": {
            "image_available": True,
            "video_available": False,
            "image_path": "/uploads/EVT_00186_snapshot.jpg"
        },
        "impact_explanation": "Suspected hit-and-run incident observed; silver sedan fled scene. Registration MH12AB1234 extracted.",
        "status": "UNDER_INSPECTION"
    }
    return post_json(f"{BASE_URL}/api/events", event_payload)

if __name__ == "__main__":
    print("MargaDrishti Multi-Bus Simulator Ready.")
    print("Testing connectivity to backend...")
    if simulate_step_telemetry("BUS_102", 19.0760, 72.8777, 12.4):
        print("Connected to MargaDrishti Cloud Backend!")
    else:
        print("Note: Start the FastAPI backend first via 'python -m backend.main'")
