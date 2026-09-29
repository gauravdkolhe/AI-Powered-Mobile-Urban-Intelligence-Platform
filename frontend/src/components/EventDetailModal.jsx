import React, { useState, useEffect } from 'react';
import { X, MapPin, Bus, ShieldAlert, CheckCircle, Activity, ArrowDownRight, Clock, Briefcase, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function EventDetailModal({ event, onClose, onUpdateStatus, onCreateWorkOrder }) {
  if (!event) return null;

  const { currentRole, currentUser } = useAuth();
  const isMunicipal = currentRole === 'MUNICIPAL_CORP';
  const isTraffic = currentRole === 'TRAFFIC_DEPT';
  const isPWD = currentRole === 'PWD';

  const [selectedStatus, setSelectedStatus] = useState(event.status || 'PENDING_VERIFICATION');
  const [assignedTo, setAssignedTo] = useState(event.assigned_to || '');
  const [notes, setNotes] = useState(event.resolution_notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setSelectedStatus(event.status || 'PENDING_VERIFICATION');
      setAssignedTo(event.assigned_to || '');
      setNotes(event.resolution_notes || '');
    }
  }, [event]);

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const handleStatusSave = async () => {
    setIsSubmitting(true);
    try {
      await onUpdateStatus(event.event_id, { status: selectedStatus, assigned_to: assignedTo, resolution_notes: notes });
      onClose();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const imageSrc = event.evidence_image_url
    ? (event.evidence_image_url.startsWith('http') ? event.evidence_image_url : `http://127.0.0.1:8000${event.evidence_image_url}`)
    : null;

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl p-2 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 z-10 bg-white">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-gray-900">EVENT — {event.event_id}</h2>
                <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${getSeverityBadge(event.severity)}`}>
                  {event.severity}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">SIH 2026 · Problem Statement 26124 · Bharat Electronics Limited</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm">

          {/* Attributes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            {[
              { label: 'Problem', value: event.event_type.replace('_', ' '), valueClass: 'text-gray-900 font-bold' },
              { label: 'Likely Cause', value: event.likely_cause.replace('_', ' '), valueClass: 'text-blue-600 font-bold' },
              { label: 'Location', value: event.location_name || 'Urban Corridor', valueClass: 'text-gray-800 font-semibold' },
              { label: 'GPS Coordinates', value: `${event.latitude?.toFixed(6)}° N, ${event.longitude?.toFixed(6)}° E`, valueClass: 'text-blue-500 font-mono text-xs' },
              { label: 'Detected At', value: event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A', valueClass: 'text-gray-700 font-mono text-xs' },
              { label: 'Reporting Vehicle', value: `${event.bus_id} · Route ${event.route_id}`, valueClass: 'text-gray-800 font-semibold' },
            ].map(({ label, value, valueClass }) => (
              <div key={label}>
                <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">{label}</span>
                <p className={`text-sm mt-0.5 ${valueClass}`}>{value}</p>
              </div>
            ))}

            {/* Confidence bar */}
            <div>
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Edge AI Confidence</span>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${(event.confidence * 100).toFixed(0)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-emerald-600 font-mono">{(event.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider block">Traffic Density</span>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{event.traffic_density || 'NORMAL'}</p>
            </div>
          </div>

          {/* Telemetry */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              Transit Telemetry & Slowdown Dynamics
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Previous Speed', value: `${event.previous_kmh || 34.1} km/h`, color: 'text-gray-700' },
                { label: 'Current Speed', value: `${event.current_kmh || 12.4} km/h`, color: 'text-blue-600' },
                { label: 'Speed Reduction', value: `${event.speed_reduction_percent || 63.6}%`, color: 'text-red-600' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white p-3 rounded-xl border border-gray-200">
                  <span className="text-[11px] text-gray-400 block">{label}</span>
                  <span className={`text-lg font-bold font-mono ${color}`}>{value}</span>
                </div>
              ))}
            </div>
            {event.impact_explanation && (
              <p className="mt-3 text-xs text-gray-600 bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                <strong className="text-blue-700">Analysis: </strong>{event.impact_explanation}
              </p>
            )}
          </div>

          {/* Evidence */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Edge Camera Evidence</h4>
              <span className="text-xs text-blue-500 font-mono">{event.camera_id || 'CAM_FRONT'}</span>
            </div>
            {imageSrc ? (
              <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm max-h-64 flex items-center justify-center bg-gray-100">
                <img
                  src={imageSrc}
                  alt={`Evidence for ${event.event_id}`}
                  className="w-full h-auto object-contain"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x450/f3f4f6/9ca3af?text=Camera+Evidence+Snapshot"; }}
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 text-gray-400 text-xs">
                No visual snapshot attached.
              </div>
            )}
          </div>

          {/* Authority Workflow */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
              <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Authority Action & Department Workflow</h4>
              {event.work_order_id && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  {event.work_order_id}
                </span>
              )}
            </div>

            {isMunicipal && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-blue-800 block">Municipal Corporation Powers</span>
                  <span className="text-[11px] text-gray-500">Verify detected hazard and dispatch roadwork crew.</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { onUpdateStatus(event.event_id, { status: 'VERIFIED', resolution_notes: 'Verified by Municipal Road Inspector.' }); onClose(); }}
                    className="px-3 py-1.5 bg-white hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify Defect
                  </button>
                  <button
                    onClick={() => { if (onCreateWorkOrder) onCreateWorkOrder(event); onClose(); }}
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Create PWD Work Order
                  </button>
                </div>
              </div>
            )}

            {isTraffic && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-amber-800 block">Traffic Management Command</span>
                  <span className="text-[11px] text-gray-500">Deploy traffic marshals to clear bottleneck corridor.</span>
                </div>
                <button
                  onClick={() => { onUpdateStatus(event.event_id, { status: 'UNDER_INSPECTION', assigned_to: 'Traffic Patrol Division 4', resolution_notes: 'Traffic marshals deployed.' }); onClose(); }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-sm flex items-center gap-1 cursor-pointer transition-all"
                >
                  Dispatch Traffic Marshall
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-gray-500 font-semibold block mb-1.5 uppercase tracking-wider">Lifecycle Status:</label>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-2 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-mono">
                  <option value="AI_DETECTED">AI DETECTED</option>
                  <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="WORK_ORDER_CREATED">WORK ORDER CREATED</option>
                  <option value="ASSIGNED">ASSIGNED (PWD)</option>
                  <option value="UNDER_INSPECTION">UNDER INSPECTION</option>
                  <option value="COMPLETED">COMPLETED (Repaired)</option>
                  <option value="RESOLVED">VERIFIED & CLOSED</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-500 font-semibold block mb-1.5 uppercase tracking-wider">Assigned Department:</label>
                <input
                  type="text"
                  placeholder="e.g. PWD Zone 3 / BMC Road Repair"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-2 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-[11px] text-gray-500 font-semibold block mb-1.5 uppercase tracking-wider">Inspection & Action Notes:</label>
                <textarea
                  rows="2"
                  placeholder="Enter field inspection notes or resolution details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border border-gray-200 text-gray-800 rounded-xl p-2 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusSave}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : 'Update Authority Record'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
