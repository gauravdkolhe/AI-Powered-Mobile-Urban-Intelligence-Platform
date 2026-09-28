"""
MargaDrishti (मार्गदृष्टि) - Real-Time WebSocket Connection Manager
Broadcasts live events and telemetry updates to connected GIS dashboard clients.
"""

from fastapi import WebSocket
from typing import List, Dict, Any
import json
import asyncio

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WebSocket] Client connected. Active clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WebSocket] Client disconnected. Remaining: {len(self.active_connections)}")

    async def broadcast(self, message_type: str, data: Dict[str, Any]):
        """Broadcasts a typed message to all connected dashboard websockets."""
        if not self.active_connections:
            return

        payload = {
            "type": message_type,
            "data": data
        }
        text = json.dumps(payload)
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(text)
            except Exception:
                disconnected.append(connection)

        for dead in disconnected:
            if dead in self.active_connections:
                self.active_connections.remove(dead)

manager = ConnectionManager()
