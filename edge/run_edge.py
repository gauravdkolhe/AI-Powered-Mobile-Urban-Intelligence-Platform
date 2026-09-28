"""
MargaDrishti (मार्गदृष्टि) - Edge Main Onboard Daemon
Spec Section 35 & 36: Complete end-to-end edge pipeline execution loop.
"""

import time
import argparse
import sys
from pathlib import Path

from .config import BUS_ID, ROUTE_ID, CAMERA_ID, HARDWARE_PROFILE
from .camera_stream import CameraStreamProcessor
from .telemetry import TelemetryTracker
from .detector import ModularAIDetector
from .tracker import EdgeObjectTracker
from .validation import EventValidator
from .cause_engine import SlowdownCauseEngine
from .event_generator import EdgeEventGenerator
from .local_buffer import LocalOfflineBuffer
from .transmitter import CloudTransmitter

class MargaDrishtiEdgeNode:
    def __init__(self, bus_id: str = BUS_ID, route_id: str = ROUTE_ID, hardware: str = HARDWARE_PROFILE):
        self.bus_id = bus_id
        self.route_id = route_id
        self.hardware = hardware

        print(f"==================================================")
        print(f"  MARGADRISHTI (मार्गदृष्टि) - Edge AI System")
        print(f"  Bus ID: {self.bus_id} | Route: {self.route_id} | HW: {self.hardware}")
        print(f"==================================================")

        self.camera = CameraStreamProcessor(target_fps=10)
        self.telemetry = TelemetryTracker()
        self.detector = ModularAIDetector(hardware_profile=self.hardware)
        self.tracker = EdgeObjectTracker()
        self.validator = EventValidator()
        self.event_gen = EdgeEventGenerator(bus_id=self.bus_id, route_id=self.route_id, camera_id=CAMERA_ID)
        self.buffer = LocalOfflineBuffer()
        self.transmitter = CloudTransmitter(local_buffer=self.buffer)

    def process_step(
        self,
        lat: float,
        lon: float,
        speed_kmh: float,
        simulated_scenario: str = None
    ):
        """
        Executes one full cycle of the edge pipeline:
        Frame -> AI Detect -> Track -> Multi-frame Validate -> Telemetry Fusion -> Cause Analysis -> JSON -> Transmit
        """
        # 1. Update Telemetry
        telemetry_snap = self.telemetry.update(latitude=lat, longitude=lon, speed_kmh=speed_kmh)

        # 2. Frame processing check
        if not self.camera.should_process_frame():
            return None

        # 3. AI Inference (Modular)
        detections = self.detector.infer(frame_data=None, simulated_scenario=simulated_scenario)

        # 4. Object Tracking & Duplicate filtering
        active_tracks = self.tracker.update(detections)
        traffic_density, active_vehicle_count = self.tracker.get_traffic_density_level()

        # 5. Multi-Frame Event Validation (Spec #14)
        validated_events = self.validator.validate_tracks(active_tracks)

        # 6. Event Generation & Cloud Transmission for each validated event
        emitted_events = []
        for track in validated_events:
            event_json = self.event_gen.generate_event(
                validated_track=track,
                telemetry_snapshot=telemetry_snap,
                traffic_density=traffic_density
            )
            # 7. Transmit to Cloud or buffer locally
            self.transmitter.transmit_event(event_json)
            emitted_events.append(event_json)

        # 8. Periodic buffer sync attempt
        self.transmitter.sync_pending_buffer()

        return emitted_events

    def run_demo_scenario_pothole(self):
        """
        Runs the exact Scenario from Spec Section 35:
        Bus 102 driving on Western Express Highway, encountering a severe pothole.
        """
        print("\n--- [DEMO SCENARIO]: Bus 102 Pothole Encounter on Western Express Highway ---")
        
        # Approaching at 34.1 km/h
        self.telemetry.current_speed = 34.1
        self.telemetry.previous_speed = 34.1

        print("Step 1 & 2: Approaching road segment at 34.1 km/h... Camera observing roadway.")
        self.process_step(lat=19.0755, lon=72.8770, speed_kmh=34.1)
        time.sleep(0.1)

        # Frame 1 of Pothole detection
        print("Step 3: AI detects Pothole ahead (Confidence: 93%). Initial tracking registered.")
        self.process_step(lat=19.0758, lon=72.8774, speed_kmh=26.0, simulated_scenario="POTHOLE_ALERT")
        time.sleep(0.1)

        # Frame 2: Temporal verification
        print("Step 4: Multi-frame persistence tracking verifying object...")
        self.process_step(lat=19.0759, lon=72.8775, speed_kmh=18.5, simulated_scenario="POTHOLE_ALERT")
        time.sleep(0.1)

        # Frame 3: Confirmed event + sharp braking to 12.4 km/h (63.6% reduction)
        print("Step 5-11: Bus slowed down to 12.4 km/h (63.6% drop). Cause: ROAD_DEFECT. Severity: HIGH.")
        confirmed_events = self.process_step(
            lat=19.0760,
            lon=72.8777,
            speed_kmh=12.4,
            simulated_scenario="POTHOLE_ALERT"
        )

        if confirmed_events:
            print("\n[SUCCESS] Emitted Standard JSON Event:")
            import json
            print(json.dumps(confirmed_events[0], indent=2))
        return confirmed_events

if __name__ == "__main__":
    node = MargaDrishtiEdgeNode()
    node.run_demo_scenario_pothole()
