"""
MargaDrishti (मार्गदृष्टि) - Camera Stream & Adaptive Preprocessor
Spec Section 8: Frame capture, adaptive FPS downsampling, ROI selection, and preprocessing.
"""

from typing import Tuple, Optional, Any
import time

class CameraStreamProcessor:
    """
    Manages camera acquisition (video device, RTSP IP stream, or synthetic dashcam generator)
    and optimizes resolution / frame rate for edge processing (Jetson vs Coral TPU).
    """
    def __init__(
        self,
        source: Any = 0,
        target_fps: int = 10,
        target_resolution: Tuple[int, int] = (1280, 720),
        roi_crop: Optional[Tuple[int, int, int, int]] = None  # (y1, y2, x1, x2)
    ):
        self.source = source
        self.target_fps = target_fps
        self.frame_interval = 1.0 / target_fps
        self.target_resolution = target_resolution
        self.roi_crop = roi_crop or (200, 720, 100, 1180)  # Standard roadway ROI
        self.last_frame_time = 0.0
        self.frame_count = 0

    def should_process_frame(self) -> bool:
        """Throttles frame inference to target FPS to preserve compute for edge device."""
        now = time.time()
        if now - self.last_frame_time >= self.frame_interval:
            self.last_frame_time = now
            self.frame_count += 1
            return True
        return False

    def preprocess_frame(self, raw_frame: Any) -> Dict[str, Any]:
        """
        Prepares frame for inference: extracts metadata, dimensions, and applies ROI.
        """
        return {
            "frame_id": self.frame_count,
            "timestamp": time.time(),
            "target_resolution": self.target_resolution,
            "roi": self.roi_crop,
            "raw_frame": raw_frame
        }
