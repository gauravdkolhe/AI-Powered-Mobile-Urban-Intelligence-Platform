import React from 'react';
import { Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export default function RouteDelayView({ segments = [] }) {
  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-orange-50 text-orange-500 border border-orange-100">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Route Delay & Bottleneck Analysis</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Learning typical travel times and correlating abnormal delays with vision hazard context.
            </p>
          </div>
        </div>
        <div className="text-xs font-mono text-gray-500 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
          Corridor: <strong className="text-blue-600">Route R12 (Bandra - Andheri WEH)</strong>
        </div>
      </div>

      {/* Attribution chain */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm">
        <strong className="text-xs text-gray-600 font-semibold block mb-2">Contextual Delay Attribution Chain:</strong>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-gray-600">
          {[
            'Abnormal Segment Delay',
            'Spatial Proximity Query',
            'Correlate Verified AI Hazard',
          ].map((step, i) => (
            <React.Fragment key={step}>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 font-medium">{step}</span>
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
            </React.Fragment>
          ))}
          <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold">Probable Slowdown Cause</span>
        </div>
      </div>

      {/* Segments */}
      <div className="space-y-3">
        {segments.length === 0 ? (
          <div className="text-center py-20 text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">
            No route segments loaded.
          </div>
        ) : (
          segments.map((seg) => {
            const isDelayed = seg.is_delayed;
            const delta = (seg.current_duration_min - seg.normal_duration_min).toFixed(1);

            return (
              <div
                key={seg.segment_id}
                className={`p-5 rounded-2xl border transition-all shadow-sm ${
                  isDelayed
                    ? 'bg-red-50 border-red-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    {isDelayed ? (
                      <span className="p-2 rounded-xl bg-red-100 text-red-500">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                        <CheckCircle className="w-4 h-4" />
                      </span>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{seg.segment_name}</h4>
                      <span className="text-xs text-gray-400 font-mono">Route: {seg.route_id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-center">
                      <span className="text-[10px] text-gray-400 block">Baseline</span>
                      <span className="font-bold text-gray-700 text-sm">{seg.normal_duration_min} min</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300" />
                    <div className="text-center">
                      <span className="text-[10px] text-gray-400 block">Current</span>
                      <span className={`font-bold text-base ${isDelayed ? 'text-red-600' : 'text-emerald-600'}`}>
                        {seg.current_duration_min} min
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                  <div>
                    {isDelayed ? (
                      <span className="text-red-600 font-semibold flex items-center gap-2 flex-wrap">
                        <span>⚠ Abnormal Delay: +{delta} min over baseline</span>
                        <span className="text-blue-600 font-bold">
                          Likely Cause: {seg.likely_cause?.replace('_', ' ')}
                        </span>
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-medium">
                        ✓ Operating normally (+{delta} min within tolerance)
                      </span>
                    )}
                  </div>

                  {seg.explanation && (
                    <span className="text-gray-500 text-[11px] bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
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
