import React, { useState } from 'react';
import { Bus, Cpu, Plus, Activity, MapPin, Gauge, Shield, CheckCircle2, RefreshCw } from 'lucide-react';
import { registerBus } from '../services/api';

export default function FleetManagerView({ fleet = [], events = [], onRefreshFleet }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [busId, setBusId] = useState('');
  const [routeId, setRouteId] = useState('R12');
  const [model, setModel] = useState('Tata Starbus EV Ultra');
  const [hardware, setHardware] = useState('NVIDIA Jetson Orin Nano');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter events logged by this fleet
  const fleetEvents = events.slice(0, 8);

  const handleAddBus = async (e) => {
    e.preventDefault();
    if (!busId.trim()) return;
    setIsSubmitting(true);
    try {
      await registerBus({
        bus_id: busId.trim().toUpperCase(),
        route_id: routeId,
        model: model,
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

  return (
    <div className="bg-[#131b26] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <span className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Bus className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Public Transport Fleet Management
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                {fleet.length} Connected Sensing Units
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fleet operations console: monitor onboard Edge AI telemetry, GPS routing, vehicle health, and detected corridor events.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Bus</span>
        </button>
      </div>

      {/* Fleet KPI Summary Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 uppercase font-medium block">Active Fleet</span>
          <span className="text-2xl font-black text-cyan-400 font-mono">{fleet.length} Buses</span>
          <span className="text-[10px] text-emerald-400 block mt-0.5">100% telemetry online</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 uppercase font-medium block">Edge Hardware Tiers</span>
          <span className="text-lg font-bold text-white font-mono">Jetson + Coral TPU</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Hybrid deployment architecture</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 uppercase font-medium block">Avg Fleet Velocity</span>
          <span className="text-2xl font-black text-white font-mono">26.4 km/h</span>
          <span className="text-[10px] text-amber-400 block mt-0.5">Corridor slowdowns flagged</span>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-[11px] text-slate-400 uppercase font-medium block">Events Detected</span>
          <span className="text-2xl font-black text-amber-400 font-mono">{events.length}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Logged by fleet sensors</span>
        </div>
      </div>

      {/* Active Buses Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Onboard Sensing Nodes Registry
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {fleet.map((b) => (
            <div
              key={b.bus_id}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 shadow-md transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-black text-white font-mono">{b.bus_id}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {b.route_id}
                  </span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="ONLINE"></span>
              </div>

              <div className="text-xs text-slate-300 font-medium truncate">{b.model}</div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
                <Cpu className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{b.hardware_profile}</span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 text-[11px] text-slate-400 font-mono">
                <div>
                  Speed: <strong className="text-cyan-300">{Math.round(b.speed_kmh || 0)} km/h</strong>
                </div>
                <div className="text-right">
                  Heading: <strong className="text-slate-300">{Math.round(b.heading || 0)}°</strong>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono truncate">
                Lat: {b.latitude?.toFixed(4)} | Lon: {b.longitude?.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events Logged by Fleet */}
      <div>
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          Recent Edge Events Flagged by Fleet
        </h3>

        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
              <tr>
                <th className="p-3">EVENT ID</th>
                <th className="p-3">OBSERVING BUS</th>
                <th className="p-3">PROBLEM TYPE</th>
                <th className="p-3">SPEED DROP</th>
                <th className="p-3">LOCATION</th>
                <th className="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {fleetEvents.map((e) => (
                <tr key={e.event_id} className="hover:bg-slate-900/50">
                  <td className="p-3 font-mono font-bold text-cyan-400">{e.event_id}</td>
                  <td className="p-3 font-mono text-slate-200">{e.bus_id} ({e.route_id})</td>
                  <td className="p-3 font-medium">{e.event_type.replace('_', ' ')}</td>
                  <td className="p-3 font-mono text-red-400">-{e.speed_reduction_percent}%</td>
                  <td className="p-3 truncate max-w-xs text-slate-400">{e.location_name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bus Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-cyan-500/50 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Bus className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-white">Register Bus in Fleet</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBus} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bus Identifier / Number:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BUS_135"
                  value={busId}
                  onChange={(e) => setBusId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-xs focus:outline-none focus:border-cyan-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Assigned Transit Route:</label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="R12">Route R12 (Bandra - Andheri WEH)</option>
                  <option value="R40">Route R40 (Andheri - Link Road)</option>
                  <option value="R15">Route R15 (BKC - Bandra Terminus)</option>
                  <option value="R22">Route R22 (Sion - Ghatkopar EEH)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vehicle Model:</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="Tata Starbus EV Ultra">Tata Starbus EV Ultra (12m Electric)</option>
                  <option value="Ashok Leyland Switch EiV">Ashok Leyland Switch EiV 12</option>
                  <option value="Olectra Greentech e-Bus">Olectra Greentech K9 Electric</option>
                  <option value="JBM ECO-LIFE e-Bus">JBM ECO-LIFE 12m AC</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Edge Hardware Compute Tier:</label>
                <select
                  value={hardware}
                  onChange={(e) => setHardware(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="NVIDIA Jetson AGX Orin">Tier A: NVIDIA Jetson AGX Orin (High Performance)</option>
                  <option value="NVIDIA Jetson Orin Nano">Tier A: NVIDIA Jetson Orin Nano (Standard)</option>
                  <option value="Raspberry Pi 5 + Coral TPU">Tier B: Raspberry Pi 5 + Google Coral TPU (Budget)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
                >
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
