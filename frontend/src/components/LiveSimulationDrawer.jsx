import React, { useState } from 'react';
import { X, Play, Zap, CheckCircle, Terminal, AlertOctagon } from 'lucide-react';
import { postEvent, postTelemetry } from '../services/api';

export default function LiveSimulationDrawer({ isOpen, onClose, onEventSimulated }) {
  if (!isOpen) return null;

  const [activeScenario, setActiveScenario] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (msg, data = null) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ time, msg, data }, ...prev.slice(0, 19)]);
  };

  const runPotholeScenario = async () => {
    setIsRunning(true); setActiveScenario('POTHOLE');
    addLog('⚡ [Step 1 & 2]: Bus 102 approaching WEH at 34.1 km/h...');
    await postTelemetry({ bus_id: 'BUS_102', route_id: 'R12', latitude: 19.0755, longitude: 72.8772, heading: 185.0, speed_kmh: 34.1 });
    setTimeout(async () => {
      addLog('⚡ [Step 3 & 4]: Edge AI detects Pothole (93% Conf). Multi-frame verification...');
      setTimeout(async () => {
        const eventId = `EVT_${Math.floor(200 + Math.random() * 800)}`;
        const payload = {
          event_id: eventId, event_type: 'POTHOLE', bus_id: 'BUS_102', route_id: 'R12', camera_id: 'CAM_FRONT',
          timestamp: new Date().toISOString(), location: { latitude: 19.0760, longitude: 72.8777 },
          speed: { current_kmh: 12.4, previous_kmh: 34.1, speed_reduction_percent: 63.6 },
          traffic: { density: 'NORMAL' }, ai: { confidence: 0.93, bbox: [410, 520, 680, 690] },
          severity: 'HIGH', likely_cause: 'ROAD_DEFECT', evidence: { image_available: true, image_path: '/uploads/EVT_00182_snapshot.jpg' },
          impact_explanation: 'Bus decelerated 63.6% to navigate severe pothole (~14.5cm depth).', status: 'PENDING_VERIFICATION',
          metadata: { depth_estimate_cm: 14.5, area_sq_m: 0.42 }
        };
        addLog(`✅ Event generated! Speed drop: 63.6% → Cause: ROAD_DEFECT`, payload);
        try { await postEvent(payload); await postTelemetry({ bus_id: 'BUS_102', route_id: 'R12', latitude: 19.0760, longitude: 72.8777, heading: 185.0, speed_kmh: 12.4 }); if (onEventSimulated) onEventSimulated(); } catch (err) { addLog(`❌ Error: ${err.message}`); }
        setIsRunning(false);
      }, 1000);
    }, 1000);
  };

  const runMultiBusScenario = async () => {
    setIsRunning(true); setActiveScenario('MULTI_BUS');
    addLog('⚡ [Fleet Sim]: Dispatching Bus 101, 107, 114 across WEH defect coordinates...');
    const buses = ['BUS_101', 'BUS_107', 'BUS_114'];
    for (let i = 0; i < buses.length; i++) {
      const bId = buses[i];
      const evtId = `EVT_${Math.floor(200 + Math.random() * 800)}`;
      addLog(`⚡ Sighting logged by ${bId} at WEH defect location...`);
      await postEvent({ event_id: evtId, event_type: 'POTHOLE', bus_id: bId, route_id: 'R12', camera_id: 'CAM_FRONT', timestamp: new Date().toISOString(), location: { latitude: 19.0760 + (i * 0.0001), longitude: 72.8777 - (i * 0.0001) }, speed: { current_kmh: 16.0, previous_kmh: 35.0, speed_reduction_percent: 54.3 }, traffic: { density: 'NORMAL' }, ai: { confidence: 0.91 + i * 0.02 }, severity: 'HIGH', likely_cause: 'ROAD_DEFECT', evidence: { image_available: true, image_path: '/uploads/EVT_00182_snapshot.jpg' }, status: 'CONFIRMED' });
    }
    addLog('✅ Spec §30: 3 independent observations fused into Persistent Defect DEF_0041 (Confidence: 98%)!');
    if (onEventSimulated) onEventSimulated();
    setIsRunning(false);
  };

  const runCongestionScenario = async () => {
    setIsRunning(true); setActiveScenario('CONGESTION');
    addLog('⚡ Bus 105 entering New Link Road corridor...');
    const evtId = `EVT_${Math.floor(200 + Math.random() * 800)}`;
    const payload = { event_id: evtId, event_type: 'CONGESTION', bus_id: 'BUS_105', route_id: 'R40', camera_id: 'CAM_FRONT', timestamp: new Date().toISOString(), location: { latitude: 19.1136, longitude: 72.8697 }, speed: { current_kmh: 8.2, previous_kmh: 32.0, speed_reduction_percent: 74.3 }, traffic: { density: 'SEVERE' }, ai: { confidence: 0.95 }, severity: 'HIGH', likely_cause: 'TRAFFIC_CONGESTION', evidence: { image_available: true, image_path: '/uploads/EVT_00183_snapshot.jpg' }, impact_explanation: 'Dense gridlock: 14 active vehicles in bus path.', status: 'ASSIGNED' };
    await postEvent(payload);
    await postTelemetry({ bus_id: 'BUS_105', route_id: 'R40', latitude: 19.1136, longitude: 72.8697, heading: 90.0, speed_kmh: 8.2 });
    addLog(`✅ Congestion event ${evtId} logged. Corridor flagged on GIS Heatmap.`);
    if (onEventSimulated) onEventSimulated();
    setIsRunning(false);
  };

  const runANPRScenario = async () => {
    setIsRunning(true); setActiveScenario('ANPR');
    addLog('🚨 Spec §32 & 33: Collision at BKC Junction. Vehicle fleeing observed by Bus 108...');
    const evtId = `EVT_${Math.floor(200 + Math.random() * 800)}`;
    const payload = { event_id: evtId, event_type: 'ACCIDENT', bus_id: 'BUS_108', route_id: 'R12', camera_id: 'CAM_FRONT', timestamp: new Date().toISOString(), location: { latitude: 19.0620, longitude: 72.8680 }, speed: { current_kmh: 28.0, previous_kmh: 36.0, speed_reduction_percent: 22.2 }, traffic: { density: 'HIGH' }, ai: { confidence: 0.94 }, severity: 'CRITICAL', likely_cause: 'INCIDENT', evidence: { image_available: true, image_path: '/uploads/EVT_00186_snapshot.jpg' }, impact_explanation: 'Hit-and-run: silver sedan fled. Plate MH12AB1234 extracted.', status: 'UNDER_INSPECTION' };
    await postEvent(payload);
    addLog(`✅ CRITICAL: Plate MH12AB1234 OCR: 94%. Incident dossier logged.`);
    if (onEventSimulated) onEventSimulated();
    setIsRunning(false);
  };

  const scenarios = [
    { key: 'POTHOLE', label: 'Spec #35: Bus 102 Pothole', desc: 'Speed drops 34.1 → 12.4 km/h (63.6%). Cause: ROAD_DEFECT.', fn: runPotholeScenario, color: 'border-red-200 bg-red-50 hover:bg-red-100', labelColor: 'text-red-700', dotColor: 'bg-red-500' },
    { key: 'MULTI_BUS', label: 'Spec #30: Multi-Bus Fleet', desc: 'Buses 101, 107, 114 co-observe defect → Persistent Defect cluster.', fn: runMultiBusScenario, color: 'border-amber-200 bg-amber-50 hover:bg-amber-100', labelColor: 'text-amber-700', dotColor: 'bg-amber-500' },
    { key: 'CONGESTION', label: 'Spec #28: Congestion Jam', desc: 'Bus 105 on Link Road: 14 vehicles in ROI, severe speed reduction.', fn: runCongestionScenario, color: 'border-orange-200 bg-orange-50 hover:bg-orange-100', labelColor: 'text-orange-700', dotColor: 'bg-orange-500' },
    { key: 'ANPR', label: 'Spec #32: ANPR Hit-and-Run', desc: 'Extracts plate MH12AB1234 (94% OCR) from fleeing vehicle.', fn: runANPRScenario, color: 'border-purple-200 bg-purple-50 hover:bg-purple-100', labelColor: 'text-purple-700', dotColor: 'bg-purple-500' },
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-[9998] w-full max-w-xl bg-white border-l border-gray-200 shadow-2xl flex flex-col animate-slideIn">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Live Edge AI & Fleet Simulator</h3>
            <p className="text-xs text-gray-400">Trigger end-to-end SIH demonstration scenarios.</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scenarios */}
      <div className="p-5 border-b border-gray-100 space-y-3">
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Demonstration Scenarios</span>
        <div className="grid grid-cols-2 gap-2.5">
          {scenarios.map((s) => (
            <button
              key={s.key}
              onClick={s.fn}
              disabled={isRunning}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group disabled:opacity-50 ${s.color}`}
            >
              <div className={`flex items-center justify-between font-bold text-xs mb-1.5 ${s.labelColor}`}>
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${s.dotColor}`}></span>
                  {s.label}
                </span>
                <Play className="w-3.5 h-3.5 fill-current group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">{s.desc}</p>
            </button>
          ))}
        </div>
        {isRunning && (
          <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            Scenario running — transmitting event to backend...
          </div>
        )}
      </div>

      {/* Console / Log Terminal */}
      <div className="flex-1 p-5 flex flex-col min-h-0 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-gray-400" />
            Edge Telemetry & Event Stream
          </span>
          <span className="text-[10px] text-gray-400 font-mono">Real-Time Ingestion</span>
        </div>

        <div className="flex-1 overflow-y-auto font-mono text-xs text-gray-700 space-y-2 p-3 bg-white rounded-xl border border-gray-200 shadow-inner">
          {logs.length === 0 ? (
            <div className="text-gray-400 text-center py-12 text-[11px]">
              Console idle. Click any scenario button to trigger an edge event cycle.
            </div>
          ) : (
            logs.map((l, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-2">
                <span className="text-[10px] text-blue-500 mr-2 font-semibold">[{l.time}]</span>
                <span className="text-gray-700">{l.msg}</span>
                {l.data && (
                  <pre className="mt-1.5 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-[10px] text-emerald-700 overflow-x-auto leading-relaxed">
                    {JSON.stringify(l.data, null, 2)}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
