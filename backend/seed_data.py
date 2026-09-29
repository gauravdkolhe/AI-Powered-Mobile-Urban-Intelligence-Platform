"""
MargaDrishti (मार्गदृष्टि) - Database Seeder
Populates initial fleet buses, realistic corridor events, multi-bus repeated defects,
route delay segments, and ANPR incident leads.
"""

from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from .models import Event, Bus, PersistentDefect, RouteSegment, IncidentLead, User, WorkOrder
from .analytics.defect_cluster import cluster_and_update_persistent_defects
from .analytics.delay_analyzer import analyze_segment_delays

def _seed_buses_and_events(db: Session):
    # 1. Fleet of Public Transport Buses
    buses_data = [
        {"bus_id": "BUS_102", "route_id": "R12", "model": "Tata Starbus EV Ultra", "hardware_profile": "NVIDIA Jetson AGX Orin", "status": "ONLINE", "lat": 19.0760, "lon": 72.8777, "speed": 12.4, "heading": 185.0},
        {"bus_id": "BUS_101", "route_id": "R12", "model": "Ashok Leyland Switch EiV", "hardware_profile": "NVIDIA Jetson Orin Nano", "status": "ONLINE", "lat": 19.0620, "lon": 72.8680, "speed": 34.0, "heading": 190.0},
        {"bus_id": "BUS_107", "route_id": "R12", "model": "Tata Starbus EV Ultra", "hardware_profile": "Raspberry Pi 5 + Coral TPU", "status": "ONLINE", "lat": 19.0882, "lon": 72.8421, "speed": 14.1, "heading": 175.0},
        {"bus_id": "BUS_114", "route_id": "R12", "model": "Olectra Greentech e-Bus", "hardware_profile": "Raspberry Pi 5 + Coral TPU", "status": "ONLINE", "lat": 19.0950, "lon": 72.8550, "speed": 31.5, "heading": 180.0},
        {"bus_id": "BUS_105", "route_id": "R40", "model": "Tata Starbus EV", "hardware_profile": "NVIDIA Jetson Orin Nano", "status": "ONLINE", "lat": 19.1136, "lon": 72.8697, "speed": 8.2, "heading": 90.0},
        {"bus_id": "BUS_108", "route_id": "R12", "model": "Ashok Leyland Switch EiV", "hardware_profile": "NVIDIA Jetson AGX Orin", "status": "ONLINE", "lat": 19.0620, "lon": 72.8680, "speed": 28.0, "heading": 180.0},
        {"bus_id": "BUS_110", "route_id": "R15", "model": "Tata Ultra 9/9m Electric", "hardware_profile": "Raspberry Pi 5 + Coral TPU", "status": "ONLINE", "lat": 19.0550, "lon": 72.8350, "speed": 16.0, "heading": 210.0},
        {"bus_id": "BUS_121", "route_id": "R12", "model": "JBM ECO-LIFE e-Bus", "hardware_profile": "NVIDIA Jetson Orin Nano", "status": "BUFFERING", "lat": 19.1020, "lon": 72.8850, "speed": 29.0, "heading": 180.0}
    ]

    for b in buses_data:
        bus = Bus(
            bus_id=b["bus_id"],
            route_id=b["route_id"],
            model=b["model"],
            hardware_profile=b["hardware_profile"],
            status=b["status"],
            latitude=b["lat"],
            longitude=b["lon"],
            heading=b["heading"],
            speed_kmh=b["speed"],
            last_ping=datetime.now(timezone.utc)
        )
        db.add(bus)

    # 2. Verified Events & Multi-Bus Observations
    now = datetime.now(timezone.utc)
    events_data = [
        # Spec Section 30: Multi-bus pothole observations at Western Express Highway (19.0760, 72.8777)
        {
            "event_id": "EVT_00171",
            "event_type": "POTHOLE",
            "bus_id": "BUS_101",
            "route_id": "R12",
            "timestamp": (now - timedelta(hours=4, minutes=20)).isoformat(),
            "lat": 19.0759, "lon": 72.8776,
            "location_name": "Western Express Highway (Santacruz Flyover Northbound)",
            "curr_spd": 22.0, "prev_spd": 38.0, "drop": 42.1,
            "density": "NORMAL", "conf": 0.89, "sev": "HIGH", "cause": "ROAD_DEFECT",
            "explanation": "Bus 101 decelerated to navigate newly emerging pothole on lane 2.",
            "img": "/uploads/EVT_00182_snapshot.jpg", "status": "CONFIRMED"
        },
        {
            "event_id": "EVT_00175",
            "event_type": "POTHOLE",
            "bus_id": "BUS_107",
            "route_id": "R12",
            "timestamp": (now - timedelta(hours=2, minutes=45)).isoformat(),
            "lat": 19.0761, "lon": 72.8778,
            "location_name": "Western Express Highway (Santacruz Flyover Northbound)",
            "curr_spd": 18.2, "prev_spd": 35.0, "drop": 48.0,
            "density": "NORMAL", "conf": 0.91, "sev": "HIGH", "cause": "ROAD_DEFECT",
            "explanation": "Bus 107 confirmed worsening asphalt crater with rapid braking.",
            "img": "/uploads/EVT_00182_snapshot.jpg", "status": "CONFIRMED"
        },
        {
            "event_id": "EVT_00179",
            "event_type": "POTHOLE",
            "bus_id": "BUS_114",
            "route_id": "R12",
            "timestamp": (now - timedelta(hours=1, minutes=10)).isoformat(),
            "lat": 19.0760, "lon": 72.8777,
            "location_name": "Western Express Highway (Santacruz Flyover Northbound)",
            "curr_spd": 15.0, "prev_spd": 34.0, "drop": 55.8,
            "density": "NORMAL", "conf": 0.92, "sev": "HIGH", "cause": "ROAD_DEFECT",
            "explanation": "Bus 114 observed expanding defect depth.",
            "img": "/uploads/EVT_00182_snapshot.jpg", "status": "CONFIRMED"
        },
        # Spec Section 17 & 35 Primary Event
        {
            "event_id": "EVT_00182",
            "event_type": "POTHOLE",
            "bus_id": "BUS_102",
            "route_id": "R12",
            "timestamp": now.isoformat(),
            "lat": 19.0760, "lon": 72.8777,
            "location_name": "Western Express Highway (Santacruz Flyover Northbound)",
            "curr_spd": 12.4, "prev_spd": 34.1, "drop": 63.6,
            "density": "NORMAL", "conf": 0.93, "sev": "HIGH", "cause": "ROAD_DEFECT",
            "explanation": "Bus decelerated by 63.6% to navigate severe pothole defect (~14.5cm depth).",
            "img": "/uploads/EVT_00182_snapshot.jpg", "status": "PENDING_VERIFICATION"
        },
        # Congestion Event (Spec #28)
        {
            "event_id": "EVT_00183",
            "event_type": "CONGESTION",
            "bus_id": "BUS_105",
            "route_id": "R40",
            "timestamp": (now - timedelta(minutes=18)).isoformat(),
            "lat": 19.1136, "lon": 72.8697,
            "location_name": "New Link Road Corridor (Andheri West Junction)",
            "curr_spd": 8.2, "prev_spd": 32.0, "drop": 74.3,
            "density": "SEVERE", "conf": 0.95, "sev": "HIGH", "cause": "TRAFFIC_CONGESTION",
            "explanation": "Dense gridlock detected; 14 active vehicles in bus path, severe slowdown.",
            "img": "/uploads/EVT_00183_snapshot.jpg", "status": "ASSIGNED"
        },
        # Waterlogging Event
        {
            "event_id": "EVT_00184",
            "event_type": "WATERLOGGING",
            "bus_id": "BUS_107",
            "route_id": "R12",
            "timestamp": (now - timedelta(minutes=45)).isoformat(),
            "lat": 19.0882, "lon": 72.8421,
            "location_name": "SV Road Underpass (Milan Subway Approach)",
            "curr_spd": 14.1, "prev_spd": 32.0, "drop": 55.9,
            "density": "NORMAL", "conf": 0.88, "sev": "MEDIUM", "cause": "WATERLOGGING",
            "explanation": "Surface water accumulation (68% lane coverage) causing hydroplaning risk.",
            "img": "/uploads/EVT_00184_snapshot.jpg", "status": "UNDER_INSPECTION"
        },
        # Vulnerable Pedestrian Event
        {
            "event_id": "EVT_00185",
            "event_type": "VULNERABLE_PEDESTRIAN",
            "bus_id": "BUS_110",
            "route_id": "R15",
            "timestamp": (now - timedelta(minutes=5)).isoformat(),
            "lat": 19.0550, "lon": 72.8350,
            "location_name": "Turner Road School Crossing Zone",
            "curr_spd": 16.0, "prev_spd": 31.0, "drop": 48.4,
            "density": "LOW", "conf": 0.91, "sev": "CRITICAL", "cause": "PEDESTRIAN_ACTIVITY",
            "explanation": "School children crossing roadway without visible zebra crossing markings.",
            "img": "/uploads/EVT_00185_snapshot.jpg", "status": "PENDING_VERIFICATION"
        },
        # ANPR Hit-and-Run Incident Lead (Spec #32 & 33)
        {
            "event_id": "EVT_00186",
            "event_type": "ACCIDENT",
            "bus_id": "BUS_108",
            "route_id": "R12",
            "timestamp": (now - timedelta(minutes=12)).isoformat(),
            "lat": 19.0620, "lon": 72.8680,
            "location_name": "Bandra-Kurla Complex (BKC) Connector Junction",
            "curr_spd": 28.0, "prev_spd": 36.0, "drop": 22.2,
            "density": "HIGH", "conf": 0.94, "sev": "CRITICAL", "cause": "INCIDENT",
            "explanation": "Suspected hit-and-run incident observed; silver sedan fled scene. Registration MH12AB1234 extracted.",
            "img": "/uploads/EVT_00186_snapshot.jpg", "status": "UNDER_INSPECTION"
        }
    ]

    for e in events_data:
        evt = Event(
            event_id=e["event_id"],
            event_type=e["event_type"],
            bus_id=e["bus_id"],
            route_id=e["route_id"],
            camera_id="CAM_FRONT",
            timestamp=e["timestamp"],
            latitude=e["lat"],
            longitude=e["lon"],
            location_name=e["location_name"],
            current_kmh=e["curr_spd"],
            previous_kmh=e["prev_spd"],
            speed_reduction_percent=e["drop"],
            traffic_density=e["density"],
            confidence=e["conf"],
            severity=e["sev"],
            likely_cause=e["cause"],
            impact_explanation=e["explanation"],
            image_available=True,
            video_available=False,
            evidence_image_url=e["img"],
            status=e["status"]
        )
        db.add(evt)

    # 3. Route Delay Segments (Spec Section 31)
    # Route R12: Segment A -> B (Normal 4 min, Current 4.2 min)
    # Segment B -> C (Normal 5 min, Current 11 min ⚠️ Abnormal delay due to pothole)
    # Segment C -> D (Normal 6 min, Current 6.1 min)
    segments = [
        RouteSegment(
            route_id="R12",
            segment_name="Segment A -> B (Bandra Terminus to Kalanagar)",
            start_lat=19.0550, start_lon=72.8420,
            end_lat=19.0620, end_lon=72.8680,
            normal_duration_min=4.0,
            current_duration_min=4.2,
            is_delayed=False,
            likely_cause="NORMAL_FLOW"
        ),
        RouteSegment(
            route_id="R12",
            segment_name="Segment B -> C (Kalanagar to Santacruz Flyover)",
            start_lat=19.0620, start_lon=72.8680,
            end_lat=19.0760, end_lon=72.8777,
            normal_duration_min=5.0,
            current_duration_min=11.0,  # ⚠️ 11 min vs 5 min normal!
            is_delayed=True,
            likely_cause="ROAD_DEFECT",
            correlated_event_id="EVT_00182"
        ),
        RouteSegment(
            route_id="R12",
            segment_name="Segment C -> D (Santacruz Flyover to Vile Parle)",
            start_lat=19.0760, start_lon=72.8777,
            end_lat=19.0950, end_lon=72.8550,
            normal_duration_min=6.0,
            current_duration_min=6.1,
            is_delayed=False,
            likely_cause="NORMAL_FLOW"
        ),
        RouteSegment(
            route_id="R40",
            segment_name="Segment X -> Y (Andheri Metro to Link Road)",
            start_lat=19.1180, start_lon=72.8460,
            end_lat=19.1136, end_lon=72.8697,
            normal_duration_min=7.0,
            current_duration_min=18.5,
            is_delayed=True,
            likely_cause="TRAFFIC_CONGESTION",
            correlated_event_id="EVT_00183"
        )
    ]
    for seg in segments:
        db.add(seg)

def _seed_incident_leads(db: Session, now=None):
    if now is None:
        now = datetime.now(timezone.utc)
    incidents_data = [
        {
            "incident_id": "INC_0089",
            "incident_type": "SUSPECTED_HIT_AND_RUN",
            "vehicle_type": "Sedan (Silver Honda City)",
            "license_plate": "MH12AB1234",
            "ocr_confidence": 0.96,
            "lat": 19.0620, "lon": 72.8680,
            "location_name": "Bandra-Kurla Complex (BKC) Connector Junction",
            "timestamp": (now - timedelta(minutes=12)).isoformat(),
            "bus_id": "BUS_108",
            "status": "UNDER_INVESTIGATION",
            "reason": "Suspected Hit-and-Run collision with two-wheeler; vehicle fled westbound onto BKC Connector ramp.",
            "img": "/uploads/EVT_00186_snapshot.jpg",
            "notes": "Vehicle collided with stationary two-wheeler and fled westbound. ANPR extracted plate with 96% OCR confidence. CCTV forensic trail initiated."
        },
        {
            "incident_id": "INC_0090",
            "incident_type": "BRTS_LANE_VIOLATION",
            "vehicle_type": "SUV (Black Mahindra Scorpio-N)",
            "license_plate": "MH02CZ9821",
            "ocr_confidence": 0.98,
            "lat": 19.0760, "lon": 72.8777,
            "location_name": "Western Express Highway (Santacruz Flyover Northbound)",
            "timestamp": (now - timedelta(minutes=24)).isoformat(),
            "bus_id": "BUS_102",
            "status": "E_CHALLAN_ISSUED",
            "reason": "Unauthorized intrusion into dedicated Bus Rapid Transit (BRTS) corridor causing transit delay of 8 mins.",
            "img": "/uploads/EVT_00183_snapshot.jpg",
            "notes": "Vehicle entered designated bus priority corridor during peak transit hours, obstructing Bus 102 headway."
        },
        {
            "incident_id": "INC_0091",
            "incident_type": "OVER_SPEEDING_SCHOOL_ZONE",
            "vehicle_type": "Commercial Truck (Tata 407 LPT)",
            "license_plate": "MH04ER5543",
            "ocr_confidence": 0.95,
            "lat": 19.0550, "lon": 72.8350,
            "location_name": "Turner Road School Crossing Zone",
            "timestamp": (now - timedelta(minutes=35)).isoformat(),
            "bus_id": "BUS_110",
            "status": "POLICE_DISPATCHED",
            "reason": "Dangerous over-speeding at 64 km/h in designated 25 km/h school crossing zone during morning student dispersal.",
            "img": "/uploads/EVT_00185_snapshot.jpg",
            "notes": "Radar-assisted edge camera clocked vehicle at 64 km/h in restricted speed school zone. Pedestrian hazard flag raised."
        },
        {
            "incident_id": "INC_0092",
            "incident_type": "RED_LIGHT_JUMP",
            "vehicle_type": "Hatchback (White Maruti Swift)",
            "license_plate": "MH01BK7720",
            "ocr_confidence": 0.94,
            "lat": 19.0882, "lon": 72.8421,
            "location_name": "SV Road Underpass (Milan Subway Approach)",
            "timestamp": (now - timedelta(minutes=48)).isoformat(),
            "bus_id": "BUS_107",
            "status": "E_CHALLAN_ISSUED",
            "reason": "Signal jumping through active intersection 3.4 seconds into red phase, creating high collision risk.",
            "img": "/uploads/EVT_00184_snapshot.jpg",
            "notes": "Automated junction optical sensor confirmed vehicle crossing stop line 3.4s after amber-to-red transition."
        },
        {
            "incident_id": "INC_0093",
            "incident_type": "WRONG_WAY_DRIVING",
            "vehicle_type": "Delivery Van (Mahindra Bolero Maxi Truck)",
            "license_plate": "MH47AQ3109",
            "ocr_confidence": 0.97,
            "lat": 19.1136, "lon": 72.8697,
            "location_name": "New Link Road Corridor (Andheri West Junction)",
            "timestamp": (now - timedelta(minutes=55)).isoformat(),
            "bus_id": "BUS_105",
            "status": "UNDER_INVESTIGATION",
            "reason": "High-risk wrong-way navigation against oncoming traffic descending one-way elevated flyover ramp.",
            "img": "/uploads/EVT_00182_snapshot.jpg",
            "notes": "Bus 105 forward camera recorded delivery truck driving northbound on one-way southbound flyover exit."
        },
        {
            "incident_id": "INC_0094",
            "incident_type": "STOLEN_VEHICLE_ALERT",
            "vehicle_type": "Coupe (Blue BMW 3 Series)",
            "license_plate": "DL08CA4419",
            "ocr_confidence": 0.99,
            "lat": 19.0645, "lon": 72.8590,
            "location_name": "Kalanagar Junction Western Corridor",
            "timestamp": (now - timedelta(hours=1, minutes=15)).isoformat(),
            "bus_id": "BUS_101",
            "status": "CRITICAL_ALARM_DISPATCHED",
            "reason": "Automated ANPR match with NCRB National Stolen Vehicle Registry hot-list (FIR #412/2026 registered at Delhi Crime Branch).",
            "img": "/uploads/EVT_00186_snapshot.jpg",
            "notes": "Instant match with inter-state stolen vehicle database. Highway patrol intercept units notified with live geo-coordinates."
        },
        {
            "incident_id": "INC_0095",
            "incident_type": "EXPIRED_FITNESS_POLLUTION",
            "vehicle_type": "Auto-Rickshaw (Bajaj RE Compact)",
            "license_plate": "MH03DZ1988",
            "ocr_confidence": 0.92,
            "lat": 19.0990, "lon": 72.8520,
            "location_name": "Vile Parle Station East Arterial",
            "timestamp": (now - timedelta(hours=2, minutes=5)).isoformat(),
            "bus_id": "BUS_114",
            "status": "PENDING_INSPECTION",
            "reason": "Commercial passenger carrier operating with expired fitness certificate (>8 months overdue) and heavy particulate smoke emission.",
            "img": "/uploads/EVT_00185_snapshot.jpg",
            "notes": "Vahan RTO database lookup indicated expired fitness and PUC. Visual exhaust smoke density exceeded permissible BS-VI limits."
        }
    ]

    for inc in incidents_data:
        lead = IncidentLead(
            incident_id=inc["incident_id"],
            incident_type=inc["incident_type"],
            vehicle_type=inc["vehicle_type"],
            license_plate=inc["license_plate"],
            ocr_confidence=inc["ocr_confidence"],
            latitude=inc["lat"],
            longitude=inc["lon"],
            location_name=inc["location_name"],
            timestamp=inc["timestamp"],
            reporting_bus_id=inc["bus_id"],
            status=inc["status"],
            reason=inc["reason"],
            evidence_snapshot_url=inc["img"],
            notes=inc["notes"]
        )
        db.add(lead)

def seed_database(db: Session):
    # Check if buses and events are already seeded
    if db.query(Bus).count() == 0:
        print("[Seeder] Initializing MargaDrishti database with realistic urban transit data...")
        _seed_buses_and_events(db)
        _seed_incident_leads(db)
    elif db.query(IncidentLead).count() < 5:
        print("[Seeder] Updating Incident Leads with demo detected vehicles & reasons...")
        db.query(IncidentLead).delete()
        _seed_incident_leads(db)
        db.commit()

    # 5. Department Users & Officers (RBAC Model)
    if db.query(User).count() == 0:
        users_data = [
            {
                "user_id": "usr_operator",
                "name": "Amit Deshmukh",
                "email": "amit.deshmukh@transport.gov.in",
                "department": "Public Transport Authority (BEST / MSRTC)",
                "role": "TRANSPORT_OPERATOR",
                "zone": "Central Fleet HQ & Depots",
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80"
            },
            {
                "user_id": "usr_traffic",
                "name": "Inspector R. Shinde",
                "email": "r.shinde@trafficpolice.gov.in",
                "department": "Traffic Police Command & Control Center",
                "role": "TRAFFIC_DEPT",
                "zone": "Metropolitan Traffic Control Division",
                "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80"
            },
            {
                "user_id": "usr_municipal",
                "name": "Dr. Sneha Patil",
                "email": "sneha.patil@mcgm.gov.in",
                "department": "Municipal Corporation (BMC - Road Infrastructure)",
                "role": "MUNICIPAL_CORP",
                "zone": "Ward H-West & Western Corridors",
                "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80"
            },
            {
                "user_id": "usr_pwd",
                "name": "Er. Rajesh Kulkarni",
                "email": "rajesh.kulkarni@pwd.gov.in",
                "department": "Public Works Department (PWD)",
                "role": "PWD",
                "zone": "PWD Western Division - Zone 3 Maintenance",
                "avatar": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80"
            }
        ]

        for u in users_data:
            user = User(
                user_id=u["user_id"],
                name=u["name"],
                email=u["email"],
                department=u["department"],
                role=u["role"],
                zone=u["zone"],
                avatar=u["avatar"]
            )
            db.add(user)

    # 6. Initial Work Orders (Spec Section 5: Detection -> Municipal Verify -> Assign PWD -> Repair -> Closure)
    if db.query(WorkOrder).count() == 0:
        work_orders_data = [
        {
            "order_id": "WO_1042",
            "event_id": "EVT_00182",
            "title": "Asphalt Repair & Pothole Patching — Western Express Highway",
            "problem_type": "POTHOLE",
            "location_name": "Western Express Highway (Santacruz Flyover Northbound)",
            "lat": 19.0760, "lon": 72.8777,
            "severity": "HIGH",
            "priority": "HIGH",
            "assigned_dept": "PWD",
            "assigned_zone": "PWD Zone 3 - Western Corridor",
            "created_by_dept": "Brihanmumbai Municipal Corporation (BMC)",
            "created_by_user": "Dr. Sneha Patil (BMC Ward H-West)",
            "deadline": "Today, 18:00 IST",
            "status": "IN_PROGRESS",
            "evidence_before": "/uploads/EVT_00182_snapshot.jpg",
            "evidence_after": None,
            "repair_notes": "Hot-mix asphalt crew dispatched with roller compaction unit. Traffic lane 2 cordoned off.",
            "verification_notes": None
        },
        {
            "order_id": "WO_1041",
            "event_id": "EVT_00184",
            "title": "Subway De-silting & Pump Activation — SV Road Milan Subway",
            "problem_type": "WATERLOGGING",
            "location_name": "SV Road Underpass (Milan Subway Approach)",
            "lat": 19.0882, "lon": 72.8421,
            "severity": "MEDIUM",
            "priority": "HIGH",
            "assigned_dept": "PWD",
            "assigned_zone": "PWD Zone 2 - Drainage Maintenance",
            "created_by_dept": "Brihanmumbai Municipal Corporation (BMC)",
            "created_by_user": "Dr. Sneha Patil (BMC Ward H-West)",
            "deadline": "Within 24 Hours",
            "status": "COMPLETED",
            "evidence_before": "/uploads/EVT_00184_snapshot.jpg",
            "evidence_after": "/uploads/EVT_00182_repaired.jpg",
            "repair_notes": "High-capacity diesel submersible pump deployed. Silt chambers cleared; roadway dry and fully reopened.",
            "verification_notes": "Awaiting final Municipal Corporation sign-off."
        },
        {
            "order_id": "WO_1040",
            "event_id": None,
            "title": "Surface Milling & Re-carpeting — Link Road Junction",
            "problem_type": "DAMAGED_ROAD",
            "location_name": "New Link Road (Andheri West Junction)",
            "lat": 19.1136, "lon": 72.8697,
            "severity": "MEDIUM",
            "priority": "NORMAL",
            "assigned_dept": "PWD",
            "assigned_zone": "PWD Zone 4 - Andheri Division",
            "created_by_dept": "Brihanmumbai Municipal Corporation (BMC)",
            "created_by_user": "BMC Central Road Cell",
            "deadline": "Completed 12 Sep 2026",
            "status": "VERIFIED_AND_CLOSED",
            "evidence_before": "/uploads/EVT_00183_snapshot.jpg",
            "evidence_after": "/uploads/EVT_00182_repaired.jpg",
            "repair_notes": "Continuous re-carpeting executed over 180 meters.",
            "verification_notes": "Inspection passed by Municipal Road Inspector. Quality certificate issued."
        }
    ]

        for wo in work_orders_data:
            order = WorkOrder(
                order_id=wo["order_id"],
                event_id=wo["event_id"],
                title=wo["title"],
                problem_type=wo["problem_type"],
                location_name=wo["location_name"],
                latitude=wo["lat"],
                longitude=wo["lon"],
                severity=wo["severity"],
                priority=wo["priority"],
                assigned_department=wo["assigned_dept"],
                assigned_zone=wo["assigned_zone"],
                created_by_department=wo["created_by_dept"],
                created_by_user=wo["created_by_user"],
                deadline_date=wo["deadline"],
                status=wo["status"],
                evidence_before_url=wo["evidence_before"],
                evidence_after_url=wo["evidence_after"],
                repair_notes=wo["repair_notes"],
                verification_notes=wo["verification_notes"],
                created_at=datetime.now(timezone.utc) - timedelta(days=1 if wo["status"] != "IN_PROGRESS" else 0)
            )
            db.add(order)

    db.commit()

    # Run initial analytics passes to build persistent defect clusters and delay attributions
    cluster_and_update_persistent_defects(db)
    analyze_segment_delays(db)

    print("[Seeder] MargaDrishti database with RBAC & Work Orders seeded successfully!")
