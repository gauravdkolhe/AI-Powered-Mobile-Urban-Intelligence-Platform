"""
MargaDrishti (मार्गदृष्टि) - Local Buffer & Offline Storage
Spec Section 19: Provides fault-tolerant offline persistence and auto-synchronization
when network connectivity drops and recovers.
"""

import sqlite3
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Dict, Any, Optional
from .config import LOCAL_BUFFER_DB

class LocalOfflineBuffer:
    def __init__(self, db_path: Path = LOCAL_BUFFER_DB):
        self.db_path = str(db_path)
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS buffered_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_id TEXT UNIQUE NOT NULL,
                    payload_json TEXT NOT NULL,
                    evidence_path TEXT,
                    is_synced INTEGER DEFAULT 0,
                    retry_count INTEGER DEFAULT 0,
                    created_at TEXT NOT NULL,
                    synced_at TEXT
                )
            """)
            conn.commit()

    def store_event(self, event_data: Dict[str, Any], evidence_path: Optional[str] = None) -> bool:
        """Stores a generated JSON event in the offline buffer."""
        event_id = event_data["event_id"]
        payload_str = json.dumps(event_data)
        now_str = datetime.now(timezone.utc).isoformat()

        try:
            with self._get_connection() as conn:
                conn.execute(
                    """
                    INSERT OR REPLACE INTO buffered_events 
                    (event_id, payload_json, evidence_path, is_synced, created_at)
                    VALUES (?, ?, ?, 0, ?)
                    """,
                    (event_id, payload_str, evidence_path, now_str)
                )
                conn.commit()
            return True
        except Exception as e:
            print(f"[LocalBuffer] Failed to store event {event_id}: {e}")
            return False

    def get_pending_events(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves unsynced events ordered by creation time."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, event_id, payload_json, evidence_path, retry_count
                FROM buffered_events
                WHERE is_synced = 0
                ORDER BY id ASC
                LIMIT ?
                """,
                (limit,)
            )
            rows = cursor.fetchall()
            
            results = []
            for r in rows:
                results.append({
                    "id": r["id"],
                    "event_id": r["event_id"],
                    "payload": json.loads(r["payload_json"]),
                    "evidence_path": r["evidence_path"],
                    "retry_count": r["retry_count"]
                })
            return results

    def mark_as_synced(self, event_id: str):
        """Marks an event as successfully synced to cloud."""
        now_str = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            conn.execute(
                """
                UPDATE buffered_events
                SET is_synced = 1, synced_at = ?
                WHERE event_id = ?
                """,
                (now_str, event_id)
            )
            conn.commit()

    def increment_retry(self, event_id: str):
        """Increments failed upload retry counter."""
        with self._get_connection() as conn:
            conn.execute(
                "UPDATE buffered_events SET retry_count = retry_count + 1 WHERE event_id = ?",
                (event_id,)
            )
            conn.commit()

    def get_buffer_stats(self) -> Dict[str, int]:
        """Returns count of pending vs synced events."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM buffered_events WHERE is_synced = 0")
            pending = cursor.fetchone()[0]
            cursor.execute("SELECT COUNT(*) FROM buffered_events WHERE is_synced = 1")
            synced = cursor.fetchone()[0]
            return {"pending_sync": pending, "synced": synced}
