import React from 'react';
import { Filter, Layers, RefreshCw } from 'lucide-react';

const selectClass = "bg-white text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm";

export default function FilterBar({
  filters,
  setFilters,
  layers,
  setLayers,
  onRefresh,
  isRefreshing
}) {
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-sm">

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mr-1">
          <Filter className="w-3.5 h-3.5 text-blue-500" />
          Filters
        </div>

        <select value={filters.event_type} onChange={(e) => handleChange('event_type', e.target.value)} className={selectClass}>
          <option value="ALL">All Event Types</option>
          <option value="POTHOLE">Potholes & Defects</option>
          <option value="CONGESTION">Congestion / Jams</option>
          <option value="WATERLOGGING">Waterlogging</option>
          <option value="VULNERABLE_PEDESTRIAN">Pedestrian Risk</option>
          <option value="ACCIDENT">Accidents & Incidents</option>
        </select>

        <select value={filters.severity} onChange={(e) => handleChange('severity', e.target.value)} className={selectClass}>
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <select value={filters.status} onChange={(e) => handleChange('status', e.target.value)} className={selectClass}>
          <option value="ALL">All Statuses</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="UNDER_INSPECTION">Under Inspection</option>
          <option value="CONFIRMED">Confirmed by Fleet</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <select value={filters.route_id} onChange={(e) => handleChange('route_id', e.target.value)} className={selectClass}>
          <option value="ALL">All Routes</option>
          <option value="R12">R12 (Bandra - Andheri WEH)</option>
          <option value="R40">R40 (Andheri - Link Rd)</option>
          <option value="R15">R15 (BKC - Bandra)</option>
        </select>

        <select value={filters.bus_id} onChange={(e) => handleChange('bus_id', e.target.value)} className={selectClass}>
          <option value="ALL">All Buses</option>
          <option value="BUS_102">BUS 102 (Jetson - WEH)</option>
          <option value="BUS_101">BUS 101 (Jetson)</option>
          <option value="BUS_105">BUS 105 (Jetson - Link Rd)</option>
          <option value="BUS_107">BUS 107 (Pi5 + Coral TPU)</option>
          <option value="BUS_108">BUS 108 (Jetson - BKC)</option>
          <option value="BUS_110">BUS 110 (Pi5 + Coral TPU)</option>
          <option value="BUS_114">BUS 114 (Pi5 + Coral TPU)</option>
        </select>
      </div>

      {/* Layer Toggles + Refresh */}
      <div className="flex items-center gap-2 self-end md:self-center">
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-1 gap-0.5 text-[11px]">
          <span className="text-gray-400 font-semibold px-1.5 flex items-center gap-1">
            <Layers className="w-3 h-3 text-blue-500" />
            Layers
          </span>

          {[
            { key: 'roadHealth', label: 'Road Health', active: 'bg-blue-100 text-blue-700 font-semibold' },
            { key: 'congestion', label: 'Congestion', active: 'bg-amber-100 text-amber-700 font-semibold' },
            { key: 'fleet', label: 'Buses', active: 'bg-sky-100 text-sky-700 font-semibold' },
            { key: 'workOrders', label: 'Work Orders', active: 'bg-indigo-100 text-indigo-700 font-semibold' },
          ].map(({ key, label, active }) => (
            <button
              key={key}
              onClick={() => toggleLayer(key)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                layers[key] ? active : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          className="p-2 bg-white hover:bg-gray-50 text-gray-500 hover:text-blue-600 rounded-lg border border-gray-200 transition-all shadow-sm cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
        </button>
      </div>

    </div>
  );
}
