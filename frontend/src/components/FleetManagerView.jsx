import React, { useState } from 'react';
import { Bus, Cpu, Plus, Activity, CheckCircle2 } from 'lucide-react';
import { registerBus } from '../services/api';

export default function FleetManagerView({ fleet = [], events = [], onRefreshFleet }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [busId, setBusId] = useState('');
  const [routeId, setRouteId] = useState('R12');
  const [model, setModel] = useState('Tata Starbus EV Ultra');
  const [hardware, setHardware] = useState('NVIDIA Jetson Orin Nano');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fleetEvents = events.slice(0, 8);

  const handleAddBus = async (e) => {
    e.preventDefault();
    if (!busId.trim()) return;
    setIsSubmitting(true);
    try {
      await registerBus({
        bus_id: busId.trim().toUpperCase(),
        route_id: routeId,
        model,
        hardware_profile: hardware,
        latitude: 19.0760 + (Math.random() - 0.5) * 0.04,
        longitude: 72.8777 + (Math.random() - 0.5) * 0.04,
        heading: 180.0,
        speed_kmh: 32.0
      });
      setIsAddModalOpen(false);
      setBusId('');
      if (onRefreshFleet) onRefreshFleet();
    } catch (err) {
      alert('Error registering bus: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <Bus className="w-5 h-5" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-gray-900">Public Transport Fleet</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-100">
                {fleet.length} Connected Units
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Monitor onboard Edge AI telemetry, GPS routing, vehicle health, and detected corridor events.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Register New Bus
        </button>
      </div>

      {/* KPI ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Fleet', value: `${fleet.length} Buses`, sub: '100% telemetry online', subColor: 'text-emerald-600', valColor: 'text-sky-700' },
          { label: 'Edge Hardware', value: 'Jetson + Coral', sub: 'Hybrid deployment', subColor: 'text-gray-400', valColor: 'text-gray-800' },
          { label: 'Avg Velocity', value: '26.4 km/h', sub: 'Corridor slowdowns flagged', subColor: 'text-amber-600', valColor: 'text-gray-800' },
          { label: 'Events Detected', value: events.length, sub: 'Logged by fleet sensors', subColor: 'text-gray-400', valColor: 'text-amber-600' },
        ].map((item) => (
          <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <span className="text-[11px] text-gray-400 uppercase font-semibold block">{item.label}</span>
            <span className={`text-xl font-black font-mono block mt-0.5 ${item.valColor}`}>{item.value}</span>
            <span className={`text-[10px] block mt-0.5 ${item.subColor}`}>{item.sub}</span>
          </div>
        ))}
      </div>

      {/* Bus Grid */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-sky-500" />
          Onboard Sensing Nodes Registry
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {fleet.map((b) => (
            <div
              key={b.bus_id}
              className="bg-gray-50 border border-gray-200 hover:border-sky-300 hover:bg-sky-50 rounded-xl p-4 transition-all space-y-2.5 cursor-default"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-gray-900 font-mono">{b.bus_id}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-semibold">
                    {b.route_id}
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full status-online" title="ONLINE"></span>
              </div>

              <div className="text-xs text-gray-600 font-medium truncate">{b.model}</div>

              <div className="text-[11px] text-gray-500 flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="truncate">{b.hardware_profile}</span>
              </div>

              <div className="pt-2 border-t border-gray-200 grid grid-cols-2 text-[11px] text-gray-500 font-mono">
                <div>Speed: <strong className="text-sky-700">{Math.round(b.speed_kmh || 0)} km/h</strong></div>
                <div className="text-right">Hdg: <strong className="text-gray-700">{Math.round(b.heading || 0)}°</strong></div>
              </div>

              <div className="text-[10px] text-gray-400 font-mono truncate">
                {b.latitude?.toFixed(4)}, {b.longitude?.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500" />
          Recent Edge Events Flagged by Fleet
        </h3>
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Event ID', 'Observing Bus', 'Problem Type', 'Speed Drop', 'Location', 'Status'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fleetEvents.map((e) => (
                <tr key={e.event_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2.5 font-mono font-bold text-blue-600">{e.event_id}</td>
                  <td className="px-3 py-2.5 font-mono text-gray-700">{e.bus_id} ({e.route_id})</td>
                  <td className="px-3 py-2.5 font-medium text-gray-800">{e.event_type.replace('_', ' ')}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-red-500">-{e.speed_reduction_percent}%</td>
                  <td className="px-3 py-2.5 text-gray-500 truncate max-w-xs">{e.location_name}</td>
                  <td className="px-3 py-2.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600">{e.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bus Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
                  <Bus className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-gray-900">Register Bus in Fleet</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">✕</button>
            </div>

            <form onSubmit={handleAddBus} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-600 font-semibold mb-1.5">Bus Identifier / Number:</label>
                <input type="text" required placeholder="e.g. BUS_135" value={busId}
                  onChange={(e) => setBusId(e.target.value)} className={`${inputClass} uppercase font-mono`} />
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-semibold mb-1.5">Assigned Transit Route:</label>
                <select value={routeId} onChange={(e) => setRouteId(e.target.value)} className={inputClass}>
                  <option value="R12">Route R12 (Bandra - Andheri WEH)</option>
                  <option value="R40">Route R40 (Andheri - Link Road)</option>
                  <option value="R15">Route R15 (BKC - Bandra Terminus)</option>
                  <option value="R22">Route R22 (Sion - Ghatkopar EEH)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-semibold mb-1.5">Vehicle Model:</label>
                <select value={model} onChange={(e) => setModel(e.target.value)} className={inputClass}>
                  <option value="Tata Starbus EV Ultra">Tata Starbus EV Ultra (12m Electric)</option>
                  <option value="Ashok Leyland Switch EiV">Ashok Leyland Switch EiV 12</option>
                  <option value="Olectra Greentech e-Bus">Olectra Greentech K9 Electric</option>
                  <option value="JBM ECO-LIFE e-Bus">JBM ECO-LIFE 12m AC</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 font-semibold mb-1.5">Edge Hardware Compute Tier:</label>
                <select value={hardware} onChange={(e) => setHardware(e.target.value)} className={inputClass}>
                  <option value="NVIDIA Jetson AGX Orin">Tier A: NVIDIA Jetson AGX Orin (High Performance)</option>
                  <option value="NVIDIA Jetson Orin Nano">Tier A: NVIDIA Jetson Orin Nano (Standard)</option>
                  <option value="Raspberry Pi 5 + Coral TPU">Tier B: Raspberry Pi 5 + Google Coral TPU (Budget)</option>
                </select>
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Registering...' : 'Register Bus'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
