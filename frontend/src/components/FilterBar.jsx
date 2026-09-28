import React from 'react';
import { Filter, Layers, RefreshCw } from 'lucide-react';

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
    <div className="bg-[#131b26] border border-slate-800 rounded-xl p-3 mb-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs shadow-md">
      
      {/* Filtering Selectors */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex items-center text-slate-400 font-semibold gap-1 mr-1">
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filters:</span>
        </div>

        {/* Event Type Filter */}
        <select
          value={filters.event_type}
          onChange={(e) => handleChange('event_type', e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Event Types</option>
          <option value="POTHOLE">🔴 Potholes & Defects</option>
          <option value="CONGESTION">🟠 Congestion / Jams</option>
          <option value="WATERLOGGING">🟡 Waterlogging</option>
          <option value="VULNERABLE_PEDESTRIAN">🟣 Pedestrian Risk</option>
          <option value="ACCIDENT">🚨 Accidents & Incidents</option>
        </select>

        {/* Severity Filter */}
        <select
          value={filters.severity}
          onChange={(e) => handleChange('severity', e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING_VERIFICATION">Pending Verification</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="UNDER_INSPECTION">Under Inspection</option>
          <option value="CONFIRMED">Confirmed by Fleet</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        {/* Route Filter */}
        <select
          value={filters.route_id}
          onChange={(e) => handleChange('route_id', e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Routes</option>
          <option value="R12">Route R12 (Bandra - Andheri WEH)</option>
          <option value="R40">Route R40 (Andheri - Link Rd)</option>
          <option value="R15">Route R15 (BKC - Bandra)</option>
        </select>

        {/* Bus Filter */}
        <select
          value={filters.bus_id}
          onChange={(e) => handleChange('bus_id', e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500"
        >
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

      {/* Layer Toggles & Refresh */}
      <div className="flex items-center gap-2 self-end md:self-center">
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 gap-1 text-[11px]">
          <span className="text-slate-400 flex items-center gap-1 px-1 font-semibold">
            <Layers className="w-3 h-3 text-cyan-400" />
            Layers:
          </span>

          <button
            onClick={() => toggleLayer('roadHealth')}
            className={`px-2 py-1 rounded transition-colors ${
              layers.roadHealth ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Road Health
          </button>

          <button
            onClick={() => toggleLayer('congestion')}
            className={`px-2 py-1 rounded transition-colors ${
              layers.congestion ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Congestion
          </button>

          <button
            onClick={() => toggleLayer('fleet')}
            className={`px-2 py-1 rounded transition-colors ${
              layers.fleet ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Buses
          </button>

          <button
            onClick={() => toggleLayer('workOrders')}
            className={`px-2 py-1 rounded transition-colors ${
              layers.workOrders ? 'bg-indigo-500/20 text-indigo-300 font-semibold' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Work Orders
          </button>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-all cursor-pointer"
          title="Refresh Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

    </div>
  );
}
