"""
MargaDrishti (मार्गदृष्टि) - Evidence Assets Generator
Generates realistic sample road defect, congestion, waterlogging, and ANPR evidence images
with bounding boxes, telemetry overlays, and metadata stamps for demonstration.
"""

from pathlib import Path
import os

PROJECT_ROOT = Path(__file__).resolve().parent.parent
UPLOADS_DIR = PROJECT_ROOT / "backend" / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# SVG templates that render as high-fidelity dashcam snapshots with detection overlays
EVIDENCE_TEMPLATES = {
    "EVT_00182_snapshot.jpg": {
        "title": "POTHOLE ON WESTERN EXPRESS HIGHWAY",
        "bg_color": "#2c3e50",
        "road_color": "#1a1f24",
        "hazard_type": "POTHOLE",
        "hazard_box": (380, 240, 240, 140),
        "box_color": "#e74c3c",
        "telemetry": "BUS_102 | R12 | 12.4 km/h (Drop 63.6%) | 19.0760 N, 72.8777 E",
        "conf": "AI Conf: 93% | Cause: ROAD_DEFECT",
        "details": "Depth: ~14.5cm | Area: 0.42m²"
    },
    "EVT_00183_snapshot.jpg": {
        "title": "SEVERE CONGESTION - LINK ROAD CORRIDOR",
        "bg_color": "#2c3e50",
        "road_color": "#232b32",
        "hazard_type": "CONGESTION",
        "hazard_box": (180, 180, 520, 220),
        "box_color": "#e67e22",
        "telemetry": "BUS_105 | R40 | 8.2 km/h (Drop 74.3%) | 19.1136 N, 72.8697 E",
        "conf": "AI Conf: 95% | Cause: TRAFFIC_CONGESTION",
        "details": "14 Vehicles in ROI | Density: SEVERE"
    },
    "EVT_00184_snapshot.jpg": {
        "title": "WATERLOGGING UNDERPASS - SV ROAD",
        "bg_color": "#1f3a52",
        "road_color": "#1b3347",
        "hazard_type": "WATERLOGGING",
        "hazard_box": (200, 230, 480, 160),
        "box_color": "#f1c40f",
        "telemetry": "BUS_107 | R12 | 14.1 km/h (Drop 55.9%) | 19.0882 N, 72.8421 E",
        "conf": "AI Conf: 88% | Cause: WATERLOGGING",
        "details": "Surface Spread: 68% | Submersion Risk: MEDIUM"
    },
    "EVT_00185_snapshot.jpg": {
        "title": "SCHOOL ZONE PEDESTRIAN CROSSING HAZARD",
        "bg_color": "#2c3e50",
        "road_color": "#1e2328",
        "hazard_type": "VULNERABLE_PEDESTRIAN",
        "hazard_box": (320, 190, 180, 220),
        "box_color": "#9b59b6",
        "telemetry": "BUS_110 | R15 | 16.0 km/h (Drop 48.4%) | 19.0550 N, 72.8350 E",
        "conf": "AI Conf: 91% | Cause: PEDESTRIAN_ACTIVITY",
        "details": "Children Crossing | Missing Zebra Markings"
    },
    "EVT_00186_snapshot.jpg": {
        "title": "ANPR SUSPECTED HIT-AND-RUN INCIDENT",
        "bg_color": "#1e1e28",
        "road_color": "#161620",
        "hazard_type": "ANPR_ACCIDENT",
        "hazard_box": (280, 170, 360, 230),
        "box_color": "#e74c3c",
        "telemetry": "BUS_108 | R12 | 19.0620 N, 72.8680 E | 14:38:12 UTC",
        "conf": "ANPR OCR: 94% | Reg: MH12AB1234",
        "details": "Vehicle: Silver Sedan | Status: Fleeing Scene"
    }
}

def generate_svg_asset(filename: str, spec: dict):
    x, y, w, h = spec["hazard_box"]
    svg_content = f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 500" width="880" height="500">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#141e30"/>
      <stop offset="100%" stop-color="#243b55"/>
    </linearGradient>
    <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2c343c"/>
      <stop offset="100%" stop-color="#12161a"/>
    </linearGradient>
  </defs>

  <!-- Sky and Environment -->
  <rect width="880" height="240" fill="url(#skyGrad)"/>
  <rect y="240" width="880" height="260" fill="url(#roadGrad)"/>

  <!-- Road Perspective Lines -->
  <polygon points="440,240 440,240 0,500 880,500" fill="#1b2126" opacity="0.6"/>
  <line x1="440" y1="240" x2="440" y2="500" stroke="#f1c40f" stroke-width="4" stroke-dasharray="25,20" opacity="0.7"/>
  <line x1="440" y1="240" x2="160" y2="500" stroke="#ffffff" stroke-width="3" opacity="0.4"/>
  <line x1="440" y1="240" x2="720" y2="500" stroke="#ffffff" stroke-width="3" opacity="0.4"/>

  <!-- Simulated Hazard Object Representation -->
  <ellipse cx="{x + w//2}" cy="{y + h//2}" rx="{w//2 - 10}" ry="{h//2 - 15}" fill="#080b0e" opacity="0.85"/>

  <!-- AI Bounding Box Overlay -->
  <rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{spec['box_color']}" fill-opacity="0.15" stroke="{spec['box_color']}" stroke-width="3" stroke-dasharray="10,5"/>
  
  <!-- Bounding Box Corner Reticles -->
  <path d="M {x} {y+20} L {x} {y} L {x+20} {y}  M {x+w-20} {y} L {x+w} {y} L {x+w} {y+20}  M {x} {y+h-20} L {x} {y+h} L {x+20} {y+h}  M {x+w-20} {y+h} L {x+w} {y+h} L {x+w} {y+h-20}" stroke="{spec['box_color']}" stroke-width="4" fill="none"/>

  <!-- Detection Tag Label -->
  <rect x="{x}" y="{max(10, y - 28)}" width="{max(160, len(spec['hazard_type']) * 14)}" height="26" fill="{spec['box_color']}" rx="4"/>
  <text x="{x + 8}" y="{max(28, y - 10)}" fill="#ffffff" font-family="monospace" font-size="13" font-weight="bold">{spec['hazard_type']}</text>

  <!-- Top Dashcam HUD Bar -->
  <rect width="880" height="42" fill="#000000" fill-opacity="0.75"/>
  <circle cx="25" cy="21" r="7" fill="#e74c3c"/>
  <text x="40" y="26" fill="#ffffff" font-family="monospace" font-size="14" font-weight="bold">MARGADRISHTI ON-BOARD EDGE AI CAM | LIVE</text>
  <text x="860" y="26" fill="#00ffcc" font-family="monospace" font-size="13" text-anchor="end">{spec['conf']}</text>

  <!-- Bottom Telemetry HUD Bar -->
  <rect y="450" width="880" height="50" fill="#000000" fill-opacity="0.85"/>
  <text x="20" y="472" fill="#00e5ff" font-family="monospace" font-size="13" font-weight="bold">{spec['telemetry']}</text>
  <text x="20" y="490" fill="#f39c12" font-family="monospace" font-size="12">{spec['details']}</text>
  <text x="860" y="482" fill="#aaaaaa" font-family="monospace" font-size="12" text-anchor="end">SIH 2026 PS 26124 | BEL</text>
</svg>"""
    return svg_content

def generate_all_assets():
    for fname, spec in EVIDENCE_TEMPLATES.items():
        svg_filename = fname.replace(".jpg", ".svg")
        target_path = UPLOADS_DIR / svg_filename
        svg_data = generate_svg_asset(svg_filename, spec)
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(svg_data)
        print(f"[Asset Generator] Created {target_path.name}")
        
        # Also write .jpg named file containing the SVG for transparent browser rendering
        jpg_named_path = UPLOADS_DIR / fname
        with open(jpg_named_path, "w", encoding="utf-8") as f:
            f.write(svg_data)
        print(f"[Asset Generator] Created {jpg_named_path.name}")

if __name__ == "__main__":
    generate_all_assets()
