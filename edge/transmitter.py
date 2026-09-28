"""
MargaDrishti (मार्गदृष्टि) - Cloud Transmitter
Spec Section 20: Sends structured JSON events and evidence snapshots to Cloud API / MQTT.
Handles network failures gracefully by failing over to the Local Offline Buffer.
"""

import json
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from .config import CLOUD_API_URL
from .local_buffer import LocalOfflineBuffer

class CloudTransmitter:
    def __init__(self, cloud_url: str = CLOUD_API_URL, local_buffer: Optional[LocalOfflineBuffer] = None):
        self.cloud_url = cloud_url.rstrip("/")
        self.events_endpoint = f"{self.cloud_url}/api/events"
        self.telemetry_endpoint = f"{self.cloud_url}/api/fleet/telemetry"
        self.local_buffer = local_buffer or LocalOfflineBuffer()

    def transmit_event(self, event_payload: Dict[str, Any], evidence_path: Optional[str] = None) -> bool:
        """
        Attempts to transmit event to cloud. If offline, stores safely in local buffer.
        """
        # Always store in buffer first for audit & resilience
        self.local_buffer.store_event(event_payload, evidence_path)

        success = self._post_json(self.events_endpoint, event_payload)
        if success:
            self.local_buffer.mark_as_synced(event_payload["event_id"])
            print(f"[Transmitter] Event {event_payload['event_id']} transmitted to cloud.")
            return True
        else:
            self.local_buffer.increment_retry(event_payload["event_id"])
            print(f"[Transmitter] Network unavailable. Event {event_payload['event_id']} preserved in local buffer.")
            return False

    def send_telemetry_ping(self, bus_id: str, route_id: str, telemetry: Dict[str, Any]) -> bool:
        """
        Sends lightweight periodic telemetry ping for live bus tracking on the GIS dashboard.
        """
        payload = {
            "bus_id": bus_id,
            "route_id": route_id,
            "latitude": telemetry["location"]["latitude"],
            "longitude": telemetry["location"]["longitude"],
            "heading": telemetry["location"]["heading"],
            "speed_kmh": telemetry["speed"]["current_kmh"],
            "timestamp": telemetry["timestamp"]
        }
        return self._post_json(self.telemetry_endpoint, payload)

    def sync_pending_buffer(self) -> int:
        """
        Re-syncs pending offline events once connectivity is re-established.
        Returns number of successfully synced events.
        """
        pending = self.local_buffer.get_pending_events(limit=20)
        synced_count = 0

        for item in pending:
            payload = item["payload"]
            if self._post_json(self.events_endpoint, payload):
                self.local_buffer.mark_as_synced(item["event_id"])
                synced_count += 1
            else:
                self.local_buffer.increment_retry(item["event_id"])
                break  # Still offline, pause sync loop

        return synced_count

    def _post_json(self, url: str, data: Dict[str, Any], timeout: float = 3.0) -> bool:
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(data).encode("utf-8"),
                headers={"Content-Type": "application/json", "User-Agent": "MargaDrishti-Edge/1.0"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=timeout) as response:
                return response.status in [200, 201]
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError):
            return False
