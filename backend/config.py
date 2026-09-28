"""
MargaDrishti (मार्गदृष्टि) - Backend Configuration
FastAPI, Database Settings, CORS, and Upload Paths.
"""

from pathlib import Path
import os

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
UPLOADS_DIR = BACKEND_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Database URL: defaults to SQLite for instant local zero-dependency run,
# or accepts postgresql://user:pass@host/dbname from env
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BACKEND_DIR}/margadrishti.db")

# Security & CORS
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

SECRET_KEY = os.getenv("SECRET_KEY", "margadrishti-sih2026-bel-secure-key")
