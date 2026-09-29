import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';

// Helper component to center/fly map when focus changes
function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Custom SVG pin generator for events: Strictly color-coded by severity (Green = Low, Yellow = Medium, Red = High/Critical)
function createEventIcon(type, severity) {
  let sevColor = '#10b981'; // Green for LOW / default
  let ringPulse = '';

  const sevUpper = (severity || 'HIGH').toUpperCase();
  if (sevUpper === 'CRITICAL' || sevUpper === 'HIGH') {
    sevColor = '#ef4444'; // Red
    ringPulse = `<div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: #ef4444; opacity: 0.45; animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`;
  } else if (sevUpper === 'MEDIUM') {
    sevColor = '#eab308'; // Yellow / Amber
    ringPulse = `<div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: #eab308; opacity: 0.3; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>`;
  } else {
    sevColor = '#10b981'; // Green (LOW)
    ringPulse = ``;
  }

  // Category Icon glyph inside marker
  let iconGlyph = '⚠️';
  if (type === 'POTHOLE' || type === 'DAMAGED_ROAD') {
    iconGlyph = '🕳️';
  } else if (type === 'CONGESTION' || type === 'TRAFFIC_CONGESTION') {
    iconGlyph = '🚗';
  } else if (type === 'WATERLOGGING') {
    iconGlyph = '🌊';
  } else if (type === 'MISSING_SIGN' || type === 'TRAFFIC_SIGN') {
    iconGlyph = '🛑';
  } else if (type === 'VULNERABLE_PEDESTRIAN' || type === 'PEDESTRIAN') {
    iconGlyph = '🚶';
  } else if (type === 'ACCIDENT' || type === 'HIT_AND_RUN') {
    iconGlyph = '🚨';
  }

  const html = `
    <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${ringPulse}
      <div style="width: 28px; height: 28px; border-radius: 50% 50% 50% 0; background-color: ${sevColor}; transform: rotate(-45deg); border: 2.5px solid #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.45);">
        <span style="transform: rotate(45deg); font-size: 13px; line-height: 1; filter: drop-shadow(0 1px 1px rgba(0,0,0,0.5));">
          ${iconGlyph}
        </span>
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-event-pin',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36]
  });
}

// Custom Bus Transit Logo & Telemetry Icon
function createBusIcon(bus) {
  const html = `
    <div style="position: relative; width: 44px; height: 44px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer;">
      <!-- Active telemetry pulse ring -->
      <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: #0284c7; opacity: 0.35; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      
      <!-- Bus Logo Circle Emblem -->
      <div style="width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #0f172a 0%, #0369a1 100%); border: 2.5px solid #38bdf8; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.6); position: relative;">
        <!-- Directional heading triangle pointer -->
        <div style="position: absolute; top: -5px; width: 0; height: 0; border-left: 4px solid transparent; border-right: 4px solid transparent; border-bottom: 6px solid #38bdf8; transform: rotate(${bus.heading || 0}deg); transform-origin: center 22px;"></div>
        
        <!-- Official Transit Bus Logo SVG -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <!-- Bus body -->
          <rect x="3" y="3" width="18" height="15" rx="3"></rect>
          <!-- Windshield -->
          <path d="M3 9h18"></path>
          <!-- Front headlights / blinkers -->
          <circle cx="7" cy="14" r="1" fill="#38bdf8"></circle>
          <circle cx="17" cy="14" r="1" fill="#38bdf8"></circle>
          <!-- Wheels -->
          <path d="M6 18v2"></path>
          <path d="M18 18v2"></path>
          <!-- Destination route display -->
          <path d="M8 5h8" stroke="#38bdf8" stroke-width="1.5"></path>
        </svg>
      </div>

      <!-- Bus ID & Live Speed Pill -->
      <div style="position: absolute; bottom: -8px; background: #090d16; border: 1.5px solid #38bdf8; border-radius: 5px; padding: 1px 5px; font-size: 9px; font-family: monospace; font-weight: 800; color: #38bdf8; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 3px;">
        <span style="color: #4ade80;">●</span>
        <span>${bus.bus_id}</span>
        <span style="color: #94a3b8;">·</span>
        <span style="color: #f8fafc;">${Math.round(bus.speed_kmh || 0)}k</span>
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-bus-icon',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
}

// Transit Route Track Lines across City Corridors
const TRANSIT_TRACK_LINES = [
  {
    route_id: 'R12',
    name: 'Route R12 · Western Express Highway Trunk Corridor',
    color: '#3b82f6', // Bright Blue
    frequency: 'Every 5 mins',
    fleet: '5 Active Buses (101, 102, 107, 108, 114)',
    coordinates: [
      [19.0550, 72.8420],
      [19.0620, 72.8680],
      [19.0680, 72.8720],
      [19.0760, 72.8777],
      [19.0880, 72.8690],
      [19.0950, 72.8550],
      [19.1020, 72.8600],
      [19.1150, 72.8580]
    ]
  },
  {
    route_id: 'R40',
    name: 'Route R40 · Andheri Metro & Link Road Connector',
    color: '#a855f7', // Purple
    frequency: 'Every 8 mins',
    fleet: '2 Active Buses (105, 121)',
    coordinates: [
      [19.1180, 72.8460],
      [19.1155, 72.8560],
      [19.1136, 72.8697],
      [19.1200, 72.8790],
      [19.1250, 72.8900]
    ]
  },
  {
    route_id: 'R15',
    name: 'Route R15 · Turner Road & Coastal School Zone Corridor',
    color: '#10b981', // Emerald Green
    frequency: 'Every 10 mins',
    fleet: '1 Active Bus (110)',
    coordinates: [
      [19.0550, 72.8350],
      [19.0580, 72.8410],
      [19.0650, 72.8480],
      [19.0720, 72.8550],
      [19.0820, 72.8480]
    ]
  }
];

// Custom Work Order Pin Generator
function createWorkOrderIcon(status) {
  let color = '#3b82f6'; // Blue for ASSIGNED
  if (status === 'IN_PROGRESS') color = '#f59e0b'; // Amber
  if (status === 'COMPLETED') color = '#8b5cf6'; // Purple
  if (status === 'VERIFIED_AND_CLOSED') color = '#10b981'; // Green

  const html = `
    <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
      <div style="width: 28px; height: 28px; border-radius: 8px; background-color: ${color}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 13px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
        🛠️
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-wo-pin',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17]
  });
}

export default function GISMap({
  events = [],
  fleet = [],
  workOrders = [],
  roadConditions = [],
  congestionPoints = [],
  layers = { roadHealth: true, congestion: true, fleet: true, workOrders: true },
  onSelectEvent,
  onSelectWorkOrder
}) {
  const [mapStyle, setMapStyle] = useState('streets');
  const defaultCenter = [19.0760, 72.8777]; // Mumbai Western Express Corridor

  const mapApiKey = import.meta.env.VITE_MAP_API_KEY || '';
  const customTileUrl = import.meta.env.VITE_MAP_TILE_URL;

  // Determine active tile configuration (Default: 100% Free OpenStreetMap - zero API key required, zero watermarks)
  const tileConfig = useMemo(() => {
    if (customTileUrl) {
      return {
        url: customTileUrl,
        attribution: '&copy; Map Provider'
      };
    }
    if (mapStyle === 'satellite') {
      return {
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri'
      };
    }
    if (mapStyle === 'carto' && mapApiKey) {
      return {
        url: `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${mapApiKey}`,
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> | &copy; OpenStreetMap'
      };
    }
    // Default: OpenStreetMap standard tiles (never requires an API key)
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    };
  }, [mapStyle, mapApiKey, customTileUrl]);

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-2xl overflow-hidden border border-slate-800 shadow-2xl isolate z-0">
      {/* Map Basemap Style Switcher (Streets, Satellite, Carto) */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 border border-slate-700/80 p-1 rounded-xl shadow-xl backdrop-blur-md flex items-center gap-1 text-[11px]">
        <button
          onClick={() => setMapStyle('streets')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            mapStyle === 'streets'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="OpenStreetMap Standard (Free, No API Key Required)"
        >
          🗺️ Streets
        </button>
        <button
          onClick={() => setMapStyle('satellite')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            mapStyle === 'satellite'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="High-Resolution Satellite Imagery"
        >
          🛰️ Satellite
        </button>
        {mapApiKey && (
          <button
            onClick={() => setMapStyle('carto')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              mapStyle === 'carto'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏙️ Carto
          </button>
        )}
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        <MapRecenter center={defaultCenter} />

        {/* Dynamic Basemap Tiles (Default: OpenStreetMap - zero API key required) */}
        <TileLayer
          key={tileConfig.url}
          attribution={tileConfig.attribution}
          url={tileConfig.url}
          maxZoom={19}
        />

        {/* 1. Road Condition Corridors Layer (Spec Section 29) */}
        {layers.roadHealth && roadConditions.map((corridor) => {
          let lineColor = '#10b981'; // Green (Healthy)
          if (corridor.condition === 'YELLOW') lineColor = '#eab308';
          if (corridor.condition === 'ORANGE') lineColor = '#f97316';
          if (corridor.condition === 'RED') lineColor = '#ef4444';

          return (
            <Polyline
              key={corridor.corridor_id}
              positions={corridor.coordinates}
              pathOptions={{
                color: lineColor,
                weight: 6,
                opacity: 0.85,
                lineCap: 'round',
                dashArray: corridor.condition === 'RED' ? '8, 8' : null
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <strong className="block text-slate-900 font-bold">{corridor.name}</strong>
                  <span className="text-slate-700 block mt-0.5">{corridor.condition_label}</span>
                  <span className="text-slate-600 block text-[10px] mt-1">Avg Transit Speed: {corridor.avg_speed_kmh} km/h</span>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* 2. Congestion Heatmap Overlays (Spec Section 28) */}
        {layers.congestion && congestionPoints.map((point, idx) => (
          <CircleMarker
            key={`cong-${idx}`}
            center={[point.lat, point.lng]}
            radius={25 * point.intensity}
            pathOptions={{
              fillColor: point.density === 'SEVERE' ? '#ef4444' : '#f97316',
              fillOpacity: 0.35,
              stroke: false
            }}
          />
        ))}

        {/* 3. Transit Route Track Lines Layer */}
        {(layers.tracks !== false) && TRANSIT_TRACK_LINES.map((track) => (
          <React.Fragment key={`track-${track.route_id}`}>
            {/* Ambient glow under-layer */}
            <Polyline
              positions={track.coordinates}
              pathOptions={{
                color: track.color,
                weight: 8,
                opacity: 0.3,
                lineCap: 'round'
              }}
            />
            {/* Main transit corridor track line */}
            <Polyline
              positions={track.coordinates}
              pathOptions={{
                color: track.color,
                weight: 4,
                opacity: 0.95,
                dashArray: '10, 8',
                lineCap: 'round'
              }}
            >
              <Popup>
                <div className="text-xs p-1 font-sans">
                  <div className="font-bold text-slate-900 flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: track.color }}></span>
                      {track.name}
                    </span>
                  </div>
                  <div className="mt-1.5 text-slate-600 text-[11px] space-y-1">
                    <div><strong>Headway Frequency:</strong> {track.frequency}</div>
                    <div><strong>Assigned Fleet:</strong> {track.fleet}</div>
                    <div className="text-[10px] text-blue-600 font-mono mt-1 pt-1 border-t border-slate-100 flex items-center gap-1">
                      <span>🚌</span> Public Transit Priority Smart Corridor
                    </div>
                  </div>
                </div>
              </Popup>
            </Polyline>
          </React.Fragment>
        ))}

        {/* 4. Live Bus Dynamic Trailing Track Lines (Breadcrumb Trail) */}
        {(layers.tracks !== false && layers.fleet) && fleet.map((bus) => {
          const headingRad = (((bus.heading || 180) - 180) * Math.PI) / 180;
          const trailPositions = [
            [bus.latitude + 0.0035 * Math.cos(headingRad), bus.longitude + 0.0035 * Math.sin(headingRad)],
            [bus.latitude + 0.0018 * Math.cos(headingRad), bus.longitude + 0.0018 * Math.sin(headingRad)],
            [bus.latitude, bus.longitude]
          ];
          return (
            <Polyline
              key={`trail-${bus.bus_id}`}
              positions={trailPositions}
              pathOptions={{
                color: '#38bdf8',
                weight: 3,
                opacity: 0.8,
                dashArray: '4, 4'
              }}
            />
          );
        })}

        {/* 5. Detected Problem Markers with Rich Dialogue Box */}
        {events.map((evt) => {
          const isCritical = evt.severity === 'CRITICAL' || evt.severity === 'HIGH';
          const isMedium = evt.severity === 'MEDIUM';
          const severityBadgeClass = isCritical
            ? 'bg-red-500 text-white border-red-600 shadow-sm shadow-red-200'
            : isMedium
            ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm shadow-amber-200'
            : 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-200';

          const imageSrc = evt.evidence_image_url
            ? (evt.evidence_image_url.startsWith('http') ? evt.evidence_image_url : `http://127.0.0.1:8000${evt.evidence_image_url}`)
            : '/uploads/EVT_00182_snapshot.jpg';

          return (
            <Marker
              key={evt.event_id}
              position={[evt.latitude, evt.longitude]}
              icon={createEventIcon(evt.event_type, evt.severity)}
              eventHandlers={{
                click: () => onSelectEvent && onSelectEvent(evt)
              }}
            >
              {/* Detected Problem Dialogue Box */}
              <Popup maxWidth={290} minWidth={260} className="detected-problem-dialogue-box">
                <div className="font-sans text-slate-800 p-0.5 space-y-2">
                  {/* Problem Category & Severity Header */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 tracking-tight">
                      <span className="text-sm">⚠️</span>
                      <span className="truncate">{evt.event_type.replace(/_/g, ' ')}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide border ${severityBadgeClass}`}>
                      {evt.severity}
                    </span>
                  </div>

                  {/* Problem Visual Snapshot */}
                  <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
                    <img
                      src={imageSrc}
                      alt={`Detected Snapshot ${evt.event_id}`}
                      className="w-full h-28 object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => onSelectEvent && onSelectEvent(evt)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://placehold.co/400x240/f1f5f9/64748b?text=Visual+Evidence+Snapshot";
                      }}
                    />
                    <div className="absolute top-1.5 left-1.5 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] font-mono px-1.5 py-0.5 rounded shadow">
                      📷 {evt.camera_id || 'CAM_FRONT'}
                    </div>
                    <div className="absolute bottom-1.5 right-1.5 bg-slate-900/80 backdrop-blur-xs text-emerald-400 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                      AI {(evt.confidence * 100).toFixed(0)}%
                    </div>
                  </div>

                  {/* Location Details */}
                  <div className="bg-slate-50 border border-slate-200/90 rounded-lg p-2 text-[11px] space-y-0.5">
                    <div className="flex items-start gap-1 text-slate-800 font-semibold leading-tight">
                      <span className="text-red-500 shrink-0 text-xs">📍</span>
                      <span className="line-clamp-2">{evt.location_name || 'Urban Corridor'}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono pl-4">
                      {evt.latitude?.toFixed(5)}° N, {evt.longitude?.toFixed(5)}° E
                    </div>
                  </div>

                  {/* Telemetry Dynamics & Cause */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono bg-slate-100 p-1.5 rounded-lg border border-slate-200/50">
                    <div>
                      <span className="text-slate-400 block text-[9px] font-sans">DETECTED BY</span>
                      <span className="font-semibold text-slate-700">{evt.bus_id} ({evt.route_id})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[9px] font-sans">SPEED DROP</span>
                      <span className="font-bold text-red-600">↓{evt.speed_reduction_percent}%</span>
                    </div>
                  </div>

                  {/* Dialogue Action Button */}
                  <button
                    onClick={() => onSelectEvent && onSelectEvent(evt)}
                    className="w-full py-1.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🔍 Open Problem Dialogue &amp; Dossier</span>
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 6. Active Transit Bus Fleet Layer */}
        {layers.fleet && fleet.map((bus) => (
          <Marker
            key={bus.bus_id}
            position={[bus.latitude, bus.longitude]}
            icon={createBusIcon(bus)}
          >
            <Popup>
              <div className="text-xs p-1 font-sans">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>🚌</span> Transit Bus {bus.bus_id}
                  </span>
                  <span className="text-emerald-600 text-[10px] font-bold">ONLINE</span>
                </div>
                <div className="text-slate-700 text-[11px] mt-1">
                  Active Route: <strong>{bus.route_id}</strong>
                </div>
                <div className="text-slate-600 text-[10px] font-mono">
                  Speed: {bus.speed_kmh} km/h • Model: {bus.model}
                </div>
                <div className="text-slate-500 text-[9px] mt-1 font-mono">
                  Edge HW: {bus.hardware_profile}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 7. Assigned Work Orders Layer (PWD & Municipal) */}
        {layers.workOrders && workOrders.map((wo) => (
          <Marker
            key={wo.order_id}
            position={[wo.latitude, wo.longitude]}
            icon={createWorkOrderIcon(wo.status)}
            eventHandlers={{
              click: () => onSelectWorkOrder && onSelectWorkOrder(wo)
            }}
          >
            <Popup>
              <div className="text-xs p-1 max-w-[240px]">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b pb-1 mb-1">
                  <span>🛠️ {wo.order_id}</span>
                  <span className="text-[10px] font-mono text-blue-600">{wo.status.replace(/_/g, ' ')}</span>
                </div>
                <div className="text-slate-800 font-bold text-[11px] mb-1">
                  {wo.title}
                </div>
                <div className="text-slate-600 text-[10px] mb-1">
                  <strong>Assigned:</strong> {wo.assigned_department} ({wo.assigned_zone})
                </div>
                <div className="text-slate-600 text-[10px] font-mono">
                  Deadline: <span className="text-amber-600">{wo.deadline_date || 'Within 48h'}</span>
                </div>
                {onSelectWorkOrder && (
                  <button
                    onClick={() => onSelectWorkOrder(wo)}
                    className="mt-2 w-full text-center py-1 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-[10px] cursor-pointer"
                  >
                    Inspect Work Order
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>

      {/* Map Legend: Severity Colour Coding & Assets */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 border border-slate-800 p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md">
        <span className="font-bold text-slate-300 block mb-1.5 text-[11px] uppercase tracking-wider">
          Problem Severity &amp; Map Legend
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-400/40"></span>
            <span>🔴 High / Critical Severity</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-300/40"></span>
            <span>🟡 Medium Severity</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-400/40"></span>
            <span>🟢 Low Severity</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="text-sky-400">🚌</span>
            <span>Transit Bus (Edge AI)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-200">
            <span className="w-3.5 h-0.5 bg-blue-400 border-b border-dashed border-white"></span>
            <span>══ Route Track Lines</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-200">
            <span>🛠️</span>
            <span>Active Work Order</span>
          </div>
        </div>
      </div>

    </div>
  );
}
