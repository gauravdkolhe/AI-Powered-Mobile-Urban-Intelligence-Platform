"""
MargaDrishti (मार्गदृष्टि) - Edge Configuration
SIH 2026 Problem Statement 26124 | Bharat Electronics Limited (BEL)
"""

import os
from pathlib import Path

# Base Paths
EDGE_ROOT = Path(__file__).resolve().parent
PROJECT_ROOT = EDGE_ROOT.parent
LOCAL_BUFFER_DB = EDGE_ROOT / "local_buffer.sqlite3"
EVIDENCE_DIR = EDGE_ROOT / "evidence_cache"

# Ensure directories exist
EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)

# Device Configuration
BUS_ID = os.getenv("MARGADRISHTI_BUS_ID", "BUS_102")
ROUTE_ID = os.getenv("MARGADRISHTI_ROUTE_ID", "R12")
CAMERA_ID = os.getenv("MARGADRISHTI_CAMERA_ID", "CAM_FRONT")
HARDWARE_PROFILE = os.getenv("MARGADRISHTI_HARDWARE", "JETSON")  # "JETSON" or "RPI5_CORAL"

# Cloud & Network Settings
CLOUD_API_URL = os.getenv("MARGADRISHTI_CLOUD_URL", "http://127.0.0.1:8000")
CLOUD_WS_URL = os.getenv("MARGADRISHTI_WS_URL", "ws://127.0.0.1:8000/ws/events")
MAX_OFFLINE_BUFFER_SIZE = 1000  # Number of events to store locally before purge
SYNC_INTERVAL_SECONDS = 5.0

# Detection & Model Thresholds
CONFIDENCE_THRESHOLDS = {
    "POTHOLE": 0.70,
    "DAMAGED_ROAD": 0.65,
    "WATERLOGGING": 0.60,
    "MISSING_SIGN": 0.65,
    "PEDESTRIAN_CROSSING": 0.70,
    "VULNERABLE_PEDESTRIAN": 0.75,
    "ACCIDENT": 0.80,
    "ROAD_OBSTRUCTION": 0.70,
    "ANPR": 0.80,
}

# Multi-Frame Verification (spec #14)
CONSECUTIVE_FRAME_VERIFICATION_THRESHOLD = 3

# Telemetry & Speed Analysis Thresholds
SPEED_REDUCTION_SIGNIFICANT_PERCENT = 25.0  # Speed drop > 25% flags deceleration
SPEED_REDUCTION_SEVERE_PERCENT = 50.0       # Speed drop > 50% flags sharp deceleration
SPEED_STOPPAGE_KMH = 5.0                   # Near complete stop

# Traffic Density Thresholds
DENSITY_LEVELS = {
    "LOW": 4,        # <= 4 vehicles
    "NORMAL": 12,    # 5 - 12 vehicles
    "HIGH": 20,      # 13 - 20 vehicles
    "SEVERE": 999    # > 20 vehicles
}

# Severity Criteria Mapping
SEVERITY_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
