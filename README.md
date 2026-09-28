# MargaDrishti (मार्गदृष्टि) — AI-Powered Mobile Urban Intelligence Platform

> **"Seeing Roads. Understanding Cities."**  
> **Smart India Hackathon 2026** | **Problem Statement ID: 26124**  
> **Organization:** Bharat Electronics Limited (BEL) | **Theme:** Smart Automation | **Category:** Software

---

## 🌟 Executive Overview

**MargaDrishti** converts public transport bus fleets into an intelligent, mobile, distributed urban sensing grid. Instead of relying on expensive stationary CCTVs with blind spots or streaming bandwidth-heavy raw video to the cloud, MargaDrishti:
1. **Performs Edge AI Inference locally on buses** (NVIDIA Jetson or Raspberry Pi 5 + Google Coral TPU).
2. **Detects & Tracks Road Hazards & Anomalies**: Potholes, damaged road surfaces, waterlogging, missing traffic signs, vulnerable pedestrian risks, and vehicle incidents.
3. **Fuses AI Detections with GPS & Telemetry Speed Dynamics** to answer the fundamental question:
   > *"The bus slowed down — why?"*
4. **Validates Events Across Frames** to eliminate transient false positives.
5. **Transmits Lightweight Standardized JSON Events** (~1.8 KB) with selective snapshot evidence over HTTPS/MQTT, buffering offline during connectivity blackouts.
6. **Aggregates Fleet Intelligence in a Central Authority GIS Dashboard**: Multi-bus repeated defect confirmation, route delay cause attribution, congestion heatmaps, ANPR hit-and-run dossiers, and actionable road maintenance workflows.

---

## 📐 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PUBLIC TRANSPORT BUS                     │
│  Cameras (Front/Multi) • GPS Module • Onboard Telemetry     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────┐
│                   ON-BUS EDGE AI COMPUTER                   │
│   Tier A: NVIDIA Jetson OR Tier B: RPi 5 + Google Coral TPU │
│  • Adaptive Frame Preprocessing (FPS / ROI)                 │
│  • Multi-Task AI Inference (Defects, Traffic, Pedestrians)   │
│  • Centroid / ByteTrack Multi-Object Tracking               │
│  • Multi-Frame Verification (Temporal Persistence)          │
│  • Context & Slowdown Cause Engine (Deceleration Delta)     │
│  • Standardized JSON Event Generator (Spec Section 17)      │
│  • Local Offline Buffer (SQLite Queue & Auto-Sync)          │
└──────────────────────────────┬──────────────────────────────┘
                               │ (4G / 5G / Wi-Fi Sync)
                               ↓
┌─────────────────────────────────────────────────────────────┐
│              CENTRAL CLOUD PLATFORM (FastAPI)               │
│  • Real-Time Event Ingestion & WebSocket Broadcast          │
│  • Spatial DB (PostgreSQL + PostGIS / SQLite Spatial)       │
│  • Multi-Bus Repeated Defect Aggregation (Spec Section 30)  │
│  • Route Delay & Bottleneck Analysis (Spec Section 31)       │
│  • ANPR & Hit-and-Run Incident Lead Dossier (Spec #32 & 33) │
│  • Authority Lifecycle State Machine (Spec Section 34)      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ↓
┌─────────────────────────────────────────────────────────────┐
│           CENTRAL GIS AUTHORITY DASHBOARD (React)           │
│  • Role-Based Access Control (RBAC) with 4 Department Roles │
│  • Work Order System: Municipal Dispatch -> PWD Execution   │
│  • Interactive Leaflet Map with Color-Coded Pins & Heatmap  │
│  • Live Transit Bus Fleet Location & Speed Tracking         │
│  • Event Detail Modal with Evidence Snapshot (Spec #26)     │
│  • Repeated Multi-Bus Defect Confirmation Inspector         │
│  • Segment Delay Cause Attribution Breakdown                │
│  • Interactive Live Demo Simulator Console                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 👥 Role-Based Access Control (RBAC) & Multi-Agency Operations

MargaDrishti serves as a **unified multi-agency platform** where transport, civic, police, and engineering authorities collaborate seamlessly through dedicated, role-tailored workspaces:

| Department Role | Icon | Responsible Entity | Key Capabilities |
| :--- | :---: | :--- | :--- |
| **Public Transport Operator** | 🚌 | BEST / MSRTC / DTC | Fleet oversight, live GPS bus telemetry, vehicle health, route assignments, onboard AI edge events, and bus registration. |
| **Traffic Management Department** | 🚦 | Traffic Police Control Center | Live congestion heatmaps, bottleneck analysis, delay causes, ANPR hit-and-run dossiers, and traffic marshal dispatch. |
| **Municipal Corporation** | 🏙️ | BMC / Municipal Road Cell | Civic hazard verification (potholes, waterlogging), work order creation, PWD task dispatching, repair photo review, and final closure sign-off. |
| **Public Works Department (PWD)** | 🛣️ | PWD Road Maintenance Divisions | Work order execution inbox, GPS defect coordinates, before-repair AI snapshots, repair status updates, and post-repair proof photo submission. |

### 🔄 End-to-End Defect-to-Repair Lifecycle
```
[AI DETECTED]
      │
      ▼
[PENDING VERIFICATION] (Fleet multi-bus confirmation)
      │
      ▼
[VERIFIED BY MUNICIPALITY] (Dr. Sneha Patil confirms hazard)
      │
      ▼
[WORK ORDER CREATED & ASSIGNED] (Dispatched to PWD Western Division)
      │
      ▼
[IN PROGRESS] (Er. Rajesh Kulkarni starts asphalt milling / paving)
      │
      ▼
[COMPLETED] (PWD uploads post-repair photo proof & inspection notes)
      │
      ▼
[VERIFIED & CLOSED] (Municipal Road Inspector signs off & closes order)
```

---

## 🚀 Quickstart & Setup Guide

### 1. Backend Server (FastAPI)
```bash
# Navigate to project root
cd "c:\Study Material\AI-Powered Mobile Urban Intelligence Platform"

# Install Python requirements
pip install -r requirements.txt

# Start the Cloud Platform
python -m backend.main
```
*Cloud backend will run at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.*

---

### 2. Authority GIS Web Dashboard (React + Vite)
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Open your browser at `http://localhost:5173`.*

---

### 3. Edge Demonstration & Fleet Simulator
You can test the end-to-end edge pipeline either via the **interactive web console** or via command-line:

#### Option A: Web Console (Recommended)
Click the **"⚡ Edge Simulator"** button in the top-right of the web dashboard to trigger:
- **Spec #35 Bus 102 Pothole Encounter**: Watch the bus brake from 34.1 to 12.4 km/h (63.6% drop), generate JSON, transmit to cloud, and drop a 🔴 pin on the map.
- **Spec #30 Multi-Bus Defect Confirmation**: Watch Buses 101, 107, 114 co-observe the defect and auto-cluster into a Persistent Road Defect.
- **Spec #28 Congestion Jam**: Watch Bus 105 encounter 14 vehicles on Link Road with severe slowdown.
- **Spec #32 ANPR Hit-and-Run**: Watch license plate `MH 12 AB 1234` extracted with 94% OCR confidence.

#### Option B: Standalone Edge Daemon
```bash
python -m edge.run_edge
```

---

## 📋 Standard JSON Event Schema (Spec Section 17)

Every verified edge detection emits a lightweight JSON packet:
```json
{
  "event_id": "EVT_00182",
  "event_type": "POTHOLE",
  "bus_id": "BUS_102",
  "route_id": "R12",
  "camera_id": "CAM_FRONT",
  "timestamp": "2026-09-10T14:25:42",
  "location": {
    "latitude": 19.0760,
    "longitude": 72.8777
  },
  "speed": {
    "current_kmh": 12.4,
    "previous_kmh": 34.1,
    "speed_reduction_percent": 63.6
  },
  "traffic": {
    "density": "NORMAL"
  },
  "ai": {
    "confidence": 0.93
  },
  "severity": "HIGH",
  "likely_cause": "ROAD_DEFECT",
  "evidence": {
    "image_available": true,
    "video_available": false
  }
}
```

---

## 🏆 Key Innovations

1. **Fleet-As-A-Sensor**: Collective intelligence from hundreds of buses replaces thousands of expensive static cameras.
2. **Context & Cause Engine**: Answers *"Why did the bus slow down?"* by fusing telemetry deceleration with detected visual anomalies.
3. **99.98% Bandwidth Reduction**: Eliminates cloud video streaming by doing inference locally on Jetson/Coral TPU and transmitting lightweight JSON.
4. **Resilient Offline-First Architecture**: Stores events in on-disk SQLite queues during cellular dead zones and synchronizes automatically on reconnection.
5. **Multi-Bus Cross-Verification**: Spatially correlates independent bus observations to confirm permanent infrastructure defects and prioritize municipal repair crews.
6. **Role based Login**: The centralize platform for Problem identification, Management, and Problem Solving by collaborating various Departments Simantenously.

---

## 📄 License & Attribution
Developed Gaurav Deepakrao Kolhe
