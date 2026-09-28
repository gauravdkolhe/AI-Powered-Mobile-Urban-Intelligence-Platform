"""
MargaDrishti (मार्गदृष्टि) - Telemetry & GPS Module
Provides speed profiling, GPS geographic context, deceleration calculation, and timestamps.
"""

from datetime import datetime, timezone
import collections
from typing import Dict, Any, Optional

class TelemetryTracker:
    def __init__(self, window_size: int = 10):
        self.window_size = window_size
        self.speed_history = collections.deque(maxlen=window_size)
        self.current_latitude = 19.0760
        self.current_longitude = 72.8777
        self.current_heading = 180.0  # degrees
        self.current_speed = 35.0     # km/h
        self.previous_speed = 35.0    # km/h
        self.last_timestamp = datetime.now(timezone.utc)

    def update(
        self,
        latitude: float,
        longitude: float,
        speed_kmh: float,
        heading: float = 0.0,
        timestamp: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Updates the telemetry state with new GPS and speed readings.
        """
        self.previous_speed = self.current_speed
        self.current_speed = max(0.0, round(speed_kmh, 1))
        self.current_latitude = round(latitude, 6)
        self.current_longitude = round(longitude, 6)
        self.current_heading = round(heading, 1)
        self.last_timestamp = timestamp or datetime.now(timezone.utc)
        self.speed_history.append(self.current_speed)

        return self.get_snapshot()

    def get_speed_reduction(self) -> Dict[str, float]:
        """
        Calculates speed delta and reduction percentage based on previous vs current speed.
        """
        curr = self.current_speed
        prev = self.previous_speed
        reduction_kmh = max(0.0, round(prev - curr, 1))
        
        if prev > 0.1:
            reduction_percent = round((reduction_kmh / prev) * 100.0, 1)
        else:
            reduction_percent = 0.0

        return {
            "current_kmh": curr,
            "previous_kmh": prev,
            "reduction_kmh": reduction_kmh,
            "speed_reduction_percent": reduction_percent
        }

    def get_snapshot(self) -> Dict[str, Any]:
        """
        Returns full telemetry snapshot formatted for fusion with AI detections.
        """
        speed_info = self.get_speed_reduction()
        return {
            "location": {
                "latitude": self.current_latitude,
                "longitude": self.current_longitude,
                "heading": self.current_heading
            },
            "speed": speed_info,
            "timestamp": self.last_timestamp.isoformat()
        }
