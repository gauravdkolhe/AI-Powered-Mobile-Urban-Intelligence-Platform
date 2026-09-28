"""
MargaDrishti (मार्गदृष्टि) - Object Tracker & Density Counter
Spec Section 10 & 11: Persistent tracking IDs, duplicate prevention, and vehicle counting.
"""

from typing import List, Dict, Any, Tuple
import math
from .detector import DetectionResult

class TrackedObject:
    def __init__(self, track_id: int, category: str, label: str, bbox: List[int], confidence: float, metadata: Dict[str, Any] = None):
        self.track_id = track_id
        self.category = category
        self.label = label
        self.bbox = bbox
        self.confidence = confidence
        self.metadata = metadata or {}
        self.frames_tracked = 1
        self.consecutive_misses = 0
        self.centroid = self._calculate_centroid(bbox)

    def update(self, bbox: List[int], confidence: float, metadata: Dict[str, Any] = None):
        self.bbox = bbox
        self.confidence = max(self.confidence, confidence)
        if metadata:
            self.metadata.update(metadata)
        self.frames_tracked += 1
        self.consecutive_misses = 0
        self.centroid = self._calculate_centroid(bbox)

    @staticmethod
    def _calculate_centroid(bbox: List[int]) -> Tuple[float, float]:
        x1, y1, x2, y2 = bbox
        return ((x1 + x2) / 2.0, (y1 + y2) / 2.0)

class EdgeObjectTracker:
    def __init__(self, max_misses: int = 4, distance_threshold: float = 75.0):
        self.next_track_id = 101
        self.active_tracks: Dict[int, TrackedObject] = {}
        self.max_misses = max_misses
        self.distance_threshold = distance_threshold
        self.cumulative_counts = {
            "CAR": 0,
            "MOTORCYCLE": 0,
            "BUS": 0,
            "TRUCK": 0,
            "AUTO_RICKSHAW": 0,
            "TOTAL_VEHICLES": 0
        }

    def update(self, detections: List[DetectionResult]) -> List[TrackedObject]:
        """
        Associates current frame detections with active tracks using centroid proximity.
        """
        matched_tracks = set()
        matched_detections = set()

        # Try to match with existing tracks
        for track_id, track in list(self.active_tracks.items()):
            best_dist = float("inf")
            best_det_idx = -1

            for idx, det in enumerate(detections):
                if idx in matched_detections:
                    continue
                if det.label != track.label and det.category != track.category:
                    continue

                det_centroid = TrackedObject._calculate_centroid(det.bbox)
                dist = math.hypot(track.centroid[0] - det_centroid[0], track.centroid[1] - det_centroid[1])
                
                if dist < best_dist and dist < self.distance_threshold:
                    best_dist = dist
                    best_det_idx = idx

            if best_det_idx != -1:
                det = detections[best_det_idx]
                track.update(det.bbox, det.confidence, det.metadata)
                matched_tracks.add(track_id)
                matched_detections.add(best_det_idx)
            else:
                track.consecutive_misses += 1
                if track.consecutive_misses > self.max_misses:
                    del self.active_tracks[track_id]

        # Register new tracks for unmatched detections
        for idx, det in enumerate(detections):
            if idx not in matched_detections:
                new_track = TrackedObject(
                    track_id=self.next_track_id,
                    category=det.category,
                    label=det.label,
                    bbox=det.bbox,
                    confidence=det.confidence,
                    metadata=det.metadata
                )
                self.active_tracks[self.next_track_id] = new_track
                self.next_track_id += 1

                # Update vehicle counts if vehicle
                if det.category == "TRAFFIC":
                    self.cumulative_counts[det.label] = self.cumulative_counts.get(det.label, 0) + 1
                    self.cumulative_counts["TOTAL_VEHICLES"] += 1

        return list(self.active_tracks.values())

    def get_traffic_density_level(self) -> Tuple[str, int]:
        """
        Determines current traffic density based on currently active vehicle tracks.
        Returns (Density string: LOW, NORMAL, HIGH, SEVERE, active_count)
        """
        active_vehicles = sum(
            1 for t in self.active_tracks.values() if t.category == "TRAFFIC"
        )
        if active_vehicles <= 4:
            return "LOW", active_vehicles
        elif active_vehicles <= 12:
            return "NORMAL", active_vehicles
        elif active_vehicles <= 20:
            return "HIGH", active_vehicles
        else:
            return "SEVERE", active_vehicles
