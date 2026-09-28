"""
MargaDrishti (मार्गदृष्टि) - Event Validation & Multi-Frame Verification
Spec Section 14: Filters transient false positives using temporal persistence and confidence verification.
"""

from typing import List, Dict, Any, Optional
from .tracker import TrackedObject
from .config import CONFIDENCE_THRESHOLDS, CONSECUTIVE_FRAME_VERIFICATION_THRESHOLD

class EventValidator:
    def __init__(
        self,
        min_frames: int = CONSECUTIVE_FRAME_VERIFICATION_THRESHOLD,
        confidence_thresholds: Optional[Dict[str, float]] = None
    ):
        self.min_frames = min_frames
        self.confidence_thresholds = confidence_thresholds or CONFIDENCE_THRESHOLDS
        # To avoid firing the same event every frame once confirmed:
        self.confirmed_track_ids = set()

    def validate_tracks(self, tracks: List[TrackedObject]) -> List[TrackedObject]:
        """
        Filters tracks to only return newly confirmed, valid events.
        Requires:
        1. frames_tracked >= min_frames
        2. confidence >= confidence_threshold for that class
        3. track hasn't already emitted an event
        """
        validated: List[TrackedObject] = []

        for track in tracks:
            # We validate hazard, safety, incident, and ANPR tracks
            if track.category in ["ROAD_HAZARD", "SAFETY", "INCIDENT", "ANPR"]:
                if track.track_id in self.confirmed_track_ids:
                    continue

                req_conf = self.confidence_thresholds.get(track.label, 0.65)
                
                # Check confidence threshold
                if track.confidence >= req_conf:
                    # Check multi-frame temporal persistence
                    if track.frames_tracked >= self.min_frames:
                        self.confirmed_track_ids.add(track.track_id)
                        validated.append(track)

        return validated

    def reset_confirmed_cache(self):
        """Allows clearing older confirmed track IDs when tracks leave field of view."""
        if len(self.confirmed_track_ids) > 500:
            self.confirmed_track_ids.clear()
