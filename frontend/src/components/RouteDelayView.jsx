import React from 'react';
import { Clock, AlertTriangle, CheckCircle, ArrowRight, Activity, HelpCircle } from 'lucide-react';

export default function RouteDelayView({ segments = [] }) {
  return (
    <div className="bg-[#131b26] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <Clock className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Route Delay &amp; Bottleneck Analysis
              </h2>
              <p className="text-xs text-slate-400">
                Spec Section 31 — Learning typical travel times and correlating abnormal delays with vision hazard context.
              </p>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          Selected Transit Corridor: <strong className="text-cyan-400">Route R12 (Bandra - Andheri WEH)</strong>
        </div>
      </div>

      {/* Logic Workflow Display */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-300">
        <strong className="text-white block mb-2">Contextual Delay Attribution Chain:</strong>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400">
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-200">Abnormal Segment Delay</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-200">Spatial Proximity Query</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="px-2 py-1 rounded bg-slate-800 text-slate-200">Correlate Verified AI Hazard</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
          <span className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">Probable Slowdown Cause</span>
        </div>
      </div>

      {/* Segments List (Spec Section 31 layout) */}
      <div className="space-y-4">
        {segments.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No route segments loaded.
          </div>
        ) : (
          segments.map((seg) => {
            const isDelayed = seg.is_delayed;
            const delta = (seg.current_duration_min - seg.normal_duration_min).toFixed(1);

            return (
              <div
                key={seg.segment_id}
                className={`p-5 rounded-xl border transition-all ${
                  isDelayed
                    ? 'bg-red-950/20 border-red-800/60 shadow-lg shadow-red-950/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center space-x-3">
                    {isDelayed ? (
                      <span className="p-2 rounded-lg bg-red-500/20 text-red-400 animate-pulse">
                        <AlertTriangle className="w-5 h-5" />
                      </span>
                    ) : (
                      <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <CheckCircle className="w-5 h-5" />
                      </span>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {seg.segment_name}
                      </h4>
                      <span className="text-xs text-slate-400 font-mono">
                        Route: {seg.route_id}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">Baseline Normal</span>
                      <span className="font-bold text-slate-200 text-sm">
                        {seg.normal_duration_min} min
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-500" />

                    <div className="text-center">
                      <span className="text-[10px] text-slate-400 block">Current Duration</span>
                      <span className={`font-bold text-base ${isDelayed ? 'text-red-400' : 'text-emerald-400'}`}>
                        {seg.current_duration_min} min {isDelayed && '⚠️'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delay & Probable Cause Bar */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <div>
                    {isDelayed ? (
                      <span className="text-red-300 font-semibold flex items-center gap-1.5">
                        <span>Abnormal Delay: +{delta} min over baseline</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-bold">
                          Likely Cause: {seg.likely_cause?.replace('_', ' ')}
                        </span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium">
                        Operating normally within baseline tolerance (+{delta} min).
                      </span>
                    )}
                  </div>

                  {seg.explanation && (
                    <span className="text-slate-400 text-[11px] bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                      {seg.explanation}
                    </span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
