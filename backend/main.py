"""
MargaDrishti (मार्गदृष्टि) - Central Cloud Platform
SIH 2026 Problem Statement 26124 | Bharat Electronics Limited (BEL)
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from .config import ALLOWED_ORIGINS, UPLOADS_DIR
from .database import engine, Base, SessionLocal
from .seed_data import seed_database
from .websocket.manager import manager
from .api import events, fleet, analytics, anpr, auth, work_orders

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and seed data
    print("[MargaDrishti Cloud] Initializing database schema...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    print("[MargaDrishti Cloud] Central Platform Online.")
    yield
    print("[MargaDrishti Cloud] Shutting down...")

app = FastAPI(
    title="MargaDrishti (मार्गदृष्टि) Cloud Platform",
    description="Centralized Urban Intelligence & Fleet Telemetry Backend with RBAC & Work Orders",
    version="1.1.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount evidence snapshots directory
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Register API Routers
app.include_router(auth.router)
app.include_router(work_orders.router)
app.include_router(events.router)
app.include_router(fleet.router)
app.include_router(analytics.router)
app.include_router(anpr.router)

# WebSocket Real-Time Channel
@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep-alive receive
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def root():
    return {
        "platform": "MargaDrishti (मार्गदृष्टि)",
        "tagline": "Seeing Roads. Understanding Cities.",
        "hackathon": "Smart India Hackathon 2026",
        "problem_statement_id": "26124",
        "organization": "Bharat Electronics Limited (BEL)",
        "status": "OPERATIONAL",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
