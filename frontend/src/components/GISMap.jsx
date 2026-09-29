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

// Custom SVG pin generator for events matching Spec Section 25
function createEventIcon(type, severity) {
  let color = '#ef4444'; // Red default (pothole)
  let iconText = 'P';

  if (type === 'POTHOLE' || type === 'DAMAGED_ROAD') {
    color = '#ef4444';
    iconText = 'P';
  } else if (type === 'CONGESTION' || type === 'TRAFFIC_CONGESTION') {
    color = '#f97316';
    iconText = 'C';
  } else if (type === 'WATERLOGGING') {
    color = '#eab308';
    iconText = 'W';
  } else if (type === 'MISSING_SIGN' || type === 'TRAFFIC_SIGN') {
    color = '#3b82f6';
    iconText = 'S';
  } else if (type === 'VULNERABLE_PEDESTRIAN' || type === 'PEDESTRIAN') {
    color = '#a855f7';
    iconText = '🚶';
  } else if (type === 'ACCIDENT' || type === 'HIT_AND_RUN') {
    color = '#dc2626';
    iconText = '🚨';
  }

  const isCritical = severity === 'CRITICAL' || severity === 'HIGH';

  const html = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      ${isCritical ? `<div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background-color: ${color}; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
      <div style="width: 26px; height: 26px; border-radius: 50%; background-color: ${color}; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
        ${iconText}
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-event-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

// Custom Bus Icon with heading and speed badge
function createBusIcon(bus) {
  const html = `
    <div style="position: relative; width: 38px; height: 38px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
      <div style="width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg, #0284c7, #0369a1); border: 2px solid #38bdf8; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4); transform: rotate(${bus.heading || 0}deg);">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"></path>
          <path d="M15 6v6"></path>
          <path d="M2 12h19.6"></path>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.6-.2-1.2-.6-1.6L18 8.6c-.5-.5-1.2-.8-2-.8H8c-.8 0-1.5.3-2 .8L2.6 12.4c-.4.4-.6 1-.6 1.6 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
          <circle cx="7" cy="18" r="2"></circle>
          <circle cx="17" cy="18" r="2"></circle>
        </svg>
      </div>
      <div style="position: absolute; bottom: -8px; background: #0f172a; border: 1px solid #38bdf8; border-radius: 4px; padding: 1px 4px; font-size: 9px; font-family: monospace; font-weight: bold; color: #38bdf8; white-space: nowrap;">
        ${bus.bus_id} • ${Math.round(bus.speed_kmh || 0)}km/h
      </div>
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-bus-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19]
  });
}

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

        {/* 3. Event Markers (Spec Section 25) */}
        {events.map((evt) => (
          <Marker
            key={evt.event_id}
            position={[evt.latitude, evt.longitude]}
            icon={createEventIcon(evt.event_type, evt.severity)}
            eventHandlers={{
              click: () => onSelectEvent(evt)
            }}
          >
            <Popup>
              <div className="text-xs p-1 max-w-[220px]">
                <div className="flex items-center justify-between font-bold text-slate-900 border-b pb-1 mb-1">
                  <span>{evt.event_type.replace('_', ' ')}</span>
                  <span className="text-[10px] font-mono text-red-600">{evt.severity}</span>
                </div>
                <div className="text-slate-700 text-[11px] mb-1">
                  <strong>Likely Cause:</strong> {evt.likely_cause.replace('_', ' ')}
                </div>
                <div className="text-slate-600 text-[10px]">
                  Bus {evt.bus_id} (Route {evt.route_id})
                </div>
                <div className="text-slate-600 text-[10px] font-mono">
                  Speed drop: {evt.speed_reduction_percent}%
                </div>
                <button
                  onClick={() => onSelectEvent(evt)}
                  className="mt-2 w-full text-center py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-bold text-[10px] cursor-pointer"
                >
                  View Details &amp; Evidence
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 4. Active Transit Bus Fleet Layer */}
        {layers.fleet && fleet.map((bus) => (
          <Marker
            key={bus.bus_id}
            position={[bus.latitude, bus.longitude]}
            icon={createBusIcon(bus)}
          >
            <Popup>
              <div className="text-xs p-1 font-sans">
                <div className="font-bold text-slate-900 flex items-center justify-between">
                  <span>Transit Bus {bus.bus_id}</span>
                  <span className="text-emerald-600 text-[10px]">ONLINE</span>
                </div>
                <div className="text-slate-700 text-[11px] mt-1">
                  Route: <strong>{bus.route_id}</strong>
                </div>
                <div className="text-slate-600 text-[10px]">
                  Speed: {bus.speed_kmh} km/h • Model: {bus.model}
                </div>
                <div className="text-slate-500 text-[9px] mt-1">
                  Edge HW: {bus.hardware_profile}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 5. Assigned Work Orders Layer (PWD & Municipal) */}
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

      {/* Map Legend (Spec Section 25) */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/95 border border-slate-800 p-2.5 rounded-xl shadow-xl text-xs backdrop-blur-md">
        <span className="font-bold text-slate-300 block mb-1 text-[11px] uppercase tracking-wider">
          Map Legend
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>🔴 Road Defect</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>🟠 Congestion</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
            <span>🟡 Waterlogging</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>🔵 Signs</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>🟣 Incident / ANPR</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>🛠️ Work Order</span>
          </div>
        </div>
      </div>

    </div>
  );
}
