import React, { useState } from 'react';
import { X, Play, Zap, CheckCircle, Terminal, Bus, AlertOctagon, Car, Activity } from 'lucide-react';
import { postEvent, postTelemetry } from '../services/api';

export default function LiveSimulationDrawer({ isOpen, onClose, onEventSimulated }) {
  if (!isOpen) return null;

  const [activeScenario, setActiveScenario] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addLog = (msg, data = null) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [
      { time, msg, data },
      ...prev.slice(0, 19)
    ]);
  };

  // Scenario 1: Spec Section 35 Bus 102 Pothole Encounter
  const runPotholeScenario = async () => {
    setIsRunning(true);
    setActiveScenario('POTHOLE');
    addLog('⚡ [Step 1 & 2]: Bus 102 approaching Western Express Highway at 34.1 km/h...');

    await postTelemetry({
      bus_id: 'BUS_102',
      route_id: 'R12',
      latitude: 19.0755,
      longitude: 72.8772,
      heading: 185.0,
      speed_kmh: 34.1
    });

    setTimeout(async () => {
      addLog('⚡ [Step 3 & 4]: Modular Edge AI detects Pothole Ahead (93% Conf). Multi-frame verification confirming persistence...');
      
      setTimeout(async () => {
        const eventId = `EVT_${Math.floor(200 + Math.random() * 800)}`;
        const payload = {
          event_id: eventId,
          event_type: 'POTHOLE',
          bus_id: 'BUS_102',
          route_id: 'R12',
          camera_id: 'CAM_FRONT',
          timestamp: new Date().toISOString(),
          location: {
            latitude: 19.0760,
            longitude: 72.8777
          },
          speed: {
            current_kmh: 12.4,
            previous_kmh: 34.1,
            speed_reduction_percent: 63.6
          },
          traffic: {
            density: 'NORMAL'
          },
          ai: {
            confidence: 0.93,
            bbox: [410, 520, 680, 690]
          },
          severity: 'HIGH',
          likely_cause: 'ROAD_DEFECT',
          evidence: {
            image_available: true,
            video_available: false,
            image_path: '/uploads/EVT_00182_snapshot.jpg'
          },
          impact_explanation: 'Bus decelerated by 63.6% to navigate severe pothole defect (~14.5cm depth).',
          status: 'PENDING_VERIFICATION',
          metadata: { depth_estimate_cm: 14.5, area_sq_m: 0.42 }
        };

        addLog(`⚡ [Step 5-11]: Event generated & transmitted! Speed drop: 63.6% -> Likely Cause: ROAD_DEFECT`, payload);
        
        try {
          await postEvent(payload);
          await postTelemetry({
            bus_id: 'BUS_102',
            route_id: 'R12',
            latitude: 19.0760,
            longitude: 72.8777,
            heading: 185.0,
            speed_kmh: 12.4
          });
          if (onEventSimulated) onEventSimulated();
        } catch (err) {
          addLog(`❌ Error transmitting: ${err.message}`);
        }
        setIsRunning(false);
      }, 1000);
    }, 1000);
  };

  // Scenario 2: Spec Section 30 Multi-Bus Confirmation
  const runMultiBusScenario = async () => {
    setIsRunning(true);
    setActiveScenario('MULTI_BUS');
    addLog('⚡ [Fleet Simulation]: Dispatching Bus 101, 107, 114 across Western Express Highway coordinate (19.0760, 72.8777)...');

    const buses = ['BUS_101', 'BUS_107', 'BUS_114'];
    for (let i = 0; i < buses.length; i++) {
      const bId = buses[i];
      const evtId = `EVT_${Math.floor(200 + Math.random() * 800)}`;
      addLog(`⚡ Sighting logged by ${bId} at WEH defect location...`);

      await postEvent({
        event_id: evtId,
        event_type: 'POTHOLE',
        bus_id: bId,
        route_id: 'R12',
        camera_id: 'CAM_FRONT',
        timestamp: new Date().toISOString(),
        location: { latitude: 19.0760 + (i * 0.0001), longitude: 72.8777 - (i * 0.0001) },
        speed: { current_kmh: 16.0, previous_kmh: 35.0, speed_reduction_percent: 54.3 },
        traffic: { density: 'NORMAL' },
        ai: { confidence: 0.91 + i * 0.02 },
        severity: 'HIGH',
        likely_cause: 'ROAD_DEFECT',
        evidence: { image_available: true, image_path: '/uploads/EVT_00182_snapshot.jpg' },
        status: 'CONFIRMED'
      });
    }

    addLog('✅ [Spec Section 30 Confirmed]: Cloud analytics fused 3 independent observations into Persistent Defect DEF_0041 (Confidence: 98%)!');
    if (onEventSimulated) onEventSimulated();
    setIsRunning(false);
  };

  // Scenario 3: Congestion
  const runCongestionScenario = async () => {
    setIsRunning(true);
    setActiveScenario('CONGESTION');
    addLog('⚡ [Scenario]: Bus 105 entering New Link Road Corridor...');

    const evtId = `EVT_${Math.floor(200 + Math.random() * 800)}`;
    const payload = {
      event_id: evtId,
      event_type: 'CONGESTION',
      bus_id: 'BUS_105',
      route_id: 'R40',
      camera_id: 'CAM_FRONT',
      timestamp: new Date().toISOString(),
      location: { latitude: 19.1136, longitude: 72.8697 },
      speed: { current_kmh: 8.2, previous_kmh: 32.0, speed_reduction_percent: 74.3 },
      traffic: { density: 'SEVERE' },
      ai: { confidence: 0.95 },
      severity: 'HIGH',
      likely_cause: 'TRAFFIC_CONGESTION',
      evidence: { image_available: true, image_path: '/uploads/EVT_00183_snapshot.jpg' },
      impact_explanation: 'Dense gridlock detected; 14 active vehicles in bus path, severe slowdown.',
      status: 'ASSIGNED'
    };

    await postEvent(payload);
    await postTelemetry({
      bus_id: 'BUS_105',
      route_id: 'R40',
      latitude: 19.1136,
      longitude: 72.8697,
      heading: 90.0,
      speed_kmh: 8.2
    });

    addLog(`✅ Congestion event ${evtId} logged. Corridor flagged on GIS Heatmap.`);
    if (onEventSimulated) onEventSimulated();
    setIsRunning(false);
  };

  // Scenario 4: ANPR Hit-and-Run Incident
  const runANPRScenario = async () => {
    setIsRunning(true);
    setActiveScenario('ANPR');
    addLog('⚡ [Spec Section 32 & 33]: Collision detected at BKC Junction. Vehicle fleeing observed by Bus 108...');

    const evtId = `EVT_${Math.floor(200 + Math.random() * 800)}`;
    const payload = {
      event_id: evtId,
      event_type: 'ACCIDENT',
      bus_id: 'BUS_108',
      route_id: 'R12',
      camera_id: 'CAM_FRONT',
      timestamp: new Date().toISOString(),
      location: { latitude: 19.0620, longitude: 72.8680 },
      speed: { current_kmh: 28.0, previous_kmh: 36.0, speed_reduction_percent: 22.2 },
      traffic: { density: 'HIGH' },
      ai: { confidence: 0.94 },
      severity: 'CRITICAL',
      likely_cause: 'INCIDENT',
      evidence: { image_available: true, image_path: '/uploads/EVT_00186_snapshot.jpg' },
      impact_explanation: 'Suspected hit-and-run incident observed; silver sedan fled scene. Registration MH12AB1234 extracted.',
      status: 'UNDER_INSPECTION'
    };

    await postEvent(payload);
    addLog(`🚨 CRITICAL: High-priority incident alert created. Plate MH12AB1234 OCR: 94%. Dossier logged.`);
    if (onEventSimulated) onEventSimulated();
    setIsRunning(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-[9998] w-full max-w-xl bg-[#0f172a] border-l border-slate-700 shadow-2xl flex flex-col animate-slideIn">
      
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center space-x-3">
          <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Live Edge AI &amp; Fleet Simulator Console
            </h3>
            <p className="text-xs text-slate-400">
              Interactive test console to trigger end-to-end SIH demonstration scenarios.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive Trigger Buttons */}
      <div className="p-6 border-b border-slate-800 space-y-3">
        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Trigger Demonstration Scenarios
        </span>

        <div className="grid grid-cols-2 gap-2.5">
          
          <button
            onClick={runPotholeScenario}
            disabled={isRunning}
            className="p-3 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-red-400 font-bold text-xs mb-1">
              <span>Spec #35: Bus 102 Pothole</span>
              <Play className="w-3.5 h-3.5 fill-red-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Speed drops from 34.1 to 12.4 km/h (63.6%). Cause: ROAD_DEFECT.
            </p>
          </button>

          <button
            onClick={runMultiBusScenario}
            disabled={isRunning}
            className="p-3 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-amber-400 font-bold text-xs mb-1">
              <span>Spec #30: Multi-Bus Fleet</span>
              <Play className="w-3.5 h-3.5 fill-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Buses 101, 107, 114 co-observe defect; auto-cluster into Persistent Defect.
            </p>
          </button>

          <button
            onClick={runCongestionScenario}
            disabled={isRunning}
            className="p-3 rounded-xl bg-orange-950/40 hover:bg-orange-900/50 border border-orange-800/60 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-orange-400 font-bold text-xs mb-1">
              <span>Spec #28: Congestion Jam</span>
              <Play className="w-3.5 h-3.5 fill-orange-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Bus 105 on Link Road: 14 vehicles in ROI, severe speed reduction.
            </p>
          </button>

          <button
            onClick={runANPRScenario}
            disabled={isRunning}
            className="p-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-800/60 text-left transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-purple-400 font-bold text-xs mb-1">
              <span>Spec #32: ANPR Hit-and-Run</span>
              <Play className="w-3.5 h-3.5 fill-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Extracts plate MH12AB1234 (94% OCR) from fleeing vehicle.
            </p>
          </button>

        </div>
      </div>

      {/* Live Edge JSON & Stream Logs Terminal */}
      <div className="flex-1 p-6 flex flex-col min-h-0 bg-slate-950">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5 font-bold">
            <Terminal className="w-4 h-4" />
            ON-BUS EDGE TELEMETRY &amp; JSON EVENT STREAM
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Real-Time Ingestion</span>
        </div>

        <div className="flex-1 overflow-y-auto font-mono text-xs text-slate-300 space-y-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
          {logs.length === 0 ? (
            <div className="text-slate-600 text-center py-16">
              Console idle. Click any scenario button above to trigger an edge event cycle.
            </div>
          ) : (
            logs.map((l, idx) => (
              <div key={idx} className="border-b border-slate-800/60 pb-2">
                <span className="text-[10px] text-cyan-500 mr-2">[{l.time}]</span>
                <span className="text-slate-200">{l.msg}</span>
                {l.data && (
                  <pre className="mt-1 p-2 bg-black/70 rounded border border-slate-800 text-[10px] text-emerald-400 overflow-x-auto">
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
