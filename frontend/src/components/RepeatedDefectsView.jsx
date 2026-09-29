import React from 'react';
import { ShieldAlert, Bus, MapPin, Layers, TrendingUp } from 'lucide-react';

export default function RepeatedDefectsView({ defects = [], onSelectDefect }) {
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Multi-Bus Repeated Event Confirmation</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Collective fleet verification turns isolated detections into high-confidence persistent infrastructure records.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span className="text-gray-600">Fleet Confidence Boost:</span>
          <span className="font-bold text-emerald-700 font-mono">+10% to +15%</span>
        </div>
      </div>

      {/* Explainer */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-gray-700 leading-relaxed flex items-start gap-3">
        <Layers className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-900 block mb-1">Why Fleet Sensing Outperforms Single Stationary Cameras</strong>
          <p className="text-gray-600">
            A single bus observes one road once. Hundreds of buses traversing city routes continuously re-observe identical locations. When Bus 101, Bus 107, and Bus 114 independently log a pothole at the same coordinates, MargaDrishti auto-correlates them into a single <strong className="text-gray-800">Persistent Road Defect</strong> with multi-bus validation, eliminating single-camera false positives.
          </p>
        </div>
      </div>

      {/* Defect Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defects.length === 0 ? (
          <div className="col-span-2 text-center py-20 text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">
            No persistent defects aggregated yet.
          </div>
        ) : (
          defects.map((d) => {
            const busList = (d.observed_by_buses || '').split(',').map(b => b.trim()).filter(Boolean);

            return (
              <div
                key={d.defect_id}
                onClick={() => onSelectDefect && onSelectDefect(d)}
                className="bg-white border border-amber-200 hover:border-amber-400 rounded-2xl p-5 transition-all shadow-sm card-hover flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                      {d.defect_id} · {d.defect_type}
                    </span>
                    <span className="text-xs font-bold font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {(d.confidence * 100).toFixed(0)}% Confidence
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {d.location_name || 'Western Express Highway Corridor'}
                  </h3>

                  <p className="text-xs text-gray-400 flex items-center gap-1 font-mono mb-4">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {d.latitude?.toFixed(6)}° N, {d.longitude?.toFixed(6)}° E
                  </p>

                  {/* Multi-bus sightings */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4">
                    <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Bus className="w-3.5 h-3.5 text-sky-500" />
                        Observed by {d.observation_count} Public Buses:
                      </span>
                      <span className="text-[10px] text-gray-400">Fleet Correlated</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {busList.map((bus, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                          {bus}
                        </span>
                      ))}
                    </div>
                    <div className="mt-3 pt-2 border-t border-gray-200 grid grid-cols-2 text-[11px] text-gray-500 font-mono">
                      <div>First: <span className="text-gray-700">{d.first_detected ? new Date(d.first_detected).toLocaleTimeString() : '10:05'}</span></div>
                      <div className="text-right">Last: <span className="text-gray-700">{d.last_detected ? new Date(d.last_detected).toLocaleTimeString() : '15:32'}</span></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                  <span className="text-amber-700 font-semibold">Status: {d.status}</span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                    Priority Maintenance
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
