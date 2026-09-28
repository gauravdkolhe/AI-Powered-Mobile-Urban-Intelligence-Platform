import React from 'react';
import { AlertTriangle, Bus, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

export default function KPIStats({ summary, totalEventsCount }) {
  const kpis = summary?.kpis || {
    total_events: totalEventsCount || 8,
    critical_events: 3,
    resolved_events: 1,
    active_buses: 8,
    persistent_defects: 1
  };

  const breakdown = summary?.breakdown || {
    potholes: 4,
    congestion: 1,
    waterlogging: 1,
    pedestrian_risk: 1
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
      
      {/* Total Events */}
      <div className="bg-[#131b26] border border-slate-800/80 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Road Events</span>
          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <Cpu className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-2xl font-black text-white">{kpis.total_events}</span>
          <span className="text-[11px] text-slate-400 font-mono">detected</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-2">
          <span className="text-red-400 font-semibold">{breakdown.potholes} Potholes</span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">{breakdown.congestion} Congestion</span>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="bg-[#131b26] border border-red-900/40 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-red-300 uppercase tracking-wider">High / Critical</span>
          <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-2xl font-black text-red-400">{kpis.critical_events}</span>
          <span className="text-[11px] text-red-300 font-mono">urgent attention</span>
        </div>
        <div className="mt-2 text-[10px] text-red-300/80">
          Impact: Transit speed reduction &gt; 50%
        </div>
      </div>

      {/* Active Fleet Sensing Nodes */}
      <div className="bg-[#131b26] border border-slate-800/80 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Bus Fleet</span>
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Bus className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-2xl font-black text-cyan-400">{kpis.active_buses}</span>
          <span className="text-[11px] text-slate-400 font-mono">buses sensing</span>
        </div>
        <div className="mt-2 text-[10px] text-slate-400">
          Edge Nodes: Jetson &amp; Pi5+Coral TPU
        </div>
      </div>

      {/* Multi-Bus Confirmed Defects */}
      <div className="bg-[#131b26] border border-amber-900/40 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-amber-300 uppercase tracking-wider">Fleet Confirmed</span>
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-2xl font-black text-amber-400">{kpis.persistent_defects}</span>
          <span className="text-[11px] text-amber-300 font-mono">multi-bus defects</span>
        </div>
        <div className="mt-2 text-[10px] text-amber-300/80">
          4 Independent bus sightings (WEH)
        </div>
      </div>

      {/* Resolved / Closed Workflows */}
      <div className="bg-[#131b26] border border-emerald-900/40 rounded-xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-emerald-300 uppercase tracking-wider">Resolved Issues</span>
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-1 flex items-baseline space-x-2">
          <span className="text-2xl font-black text-emerald-400">{kpis.resolved_events}</span>
          <span className="text-[11px] text-emerald-300 font-mono">rectified</span>
        </div>
        <div className="mt-2 text-[10px] text-emerald-300/80">
          Authority inspection workflow active
        </div>
      </div>

    </div>
  );
}
