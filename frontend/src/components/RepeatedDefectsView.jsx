import React from 'react';
import { ShieldAlert, CheckCircle, Bus, Clock, MapPin, Layers, TrendingUp } from 'lucide-react';

export default function RepeatedDefectsView({ defects = [], onSelectDefect }) {
  return (
    <div className="bg-[#131b26] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Multi-Bus Repeated Event Confirmation
              </h2>
              <p className="text-xs text-slate-400">
                Spec Section 30 — Collective fleet verification turns isolated detections into high-confidence persistent infrastructure records.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Fleet Verification Confidence Boost:</span>
          <span className="font-bold text-emerald-400 font-mono">+10% to +15%</span>
        </div>
      </div>

      {/* Fleet Principle Explanation Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
        <Layers className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Why Fleet Sensing Outperforms Single Stationary Cameras:</strong>
          <p className="mt-1 text-slate-400">
            A single bus observes one road once. Hundreds of buses traversing city routes continuously re-observe identical locations throughout the day. When Bus 101, Bus 107, and Bus 114 independently log a pothole at the same coordinates, MargaDrishti auto-correlates them into a single <strong>Persistent Road Defect</strong> with multi-bus validation, eliminating single-camera false positives.
          </p>
        </div>
      </div>

      {/* Defect Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defects.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 text-sm">
            No persistent defects aggregated yet.
          </div>
        ) : (
          defects.map((d) => {
            const busList = (d.observed_by_buses || '').split(',').map(b => b.trim()).filter(Boolean);
            
            return (
              <div
                key={d.defect_id}
                className="bg-slate-900/90 border border-amber-900/40 hover:border-amber-500/60 rounded-xl p-5 transition-all shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                      {d.defect_id} • {d.defect_type}
                    </span>
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Confidence: {(d.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">
                    {d.location_name || 'Western Express Highway Corridor'}
                  </h3>

                  <p className="text-xs text-slate-400 flex items-center gap-1 font-mono mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {d.latitude?.toFixed(6)}° N, {d.longitude?.toFixed(6)}° E
                  </p>

                  {/* Multi-Bus Sightings Breakdown */}
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800/80 mb-4">
                    <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Bus className="w-3.5 h-3.5 text-cyan-400" />
                        Observed by {d.observation_count} Public Buses:
                      </span>
                      <span className="text-[10px] text-slate-500">Fleet Correlated</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {busList.map((bus, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded text-[11px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60"
                        >
                          {bus}
                        </span>
                      ))}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 grid grid-cols-2 text-[11px] text-slate-400 font-mono">
                      <div>
                        First detected: <span className="text-slate-200">{d.first_detected ? new Date(d.first_detected).toLocaleTimeString() : '10:05'}</span>
                      </div>
                      <div className="text-right">
                        Last detected: <span className="text-slate-200">{d.last_detected ? new Date(d.last_detected).toLocaleTimeString() : '15:32'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                  <span className="text-amber-300 font-medium">Status: {d.status}</span>
                  <span className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 text-xs font-semibold">
                    Priority Road Maintenance
                  </span>
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
