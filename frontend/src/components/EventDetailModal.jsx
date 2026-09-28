import React, { useState, useEffect } from 'react';
import { X, MapPin, Bus, AlertCircle, ShieldAlert, CheckCircle, ExternalLink, Activity, ArrowDownRight, Clock, Briefcase, ShieldCheck } from 'lucide-react';
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
  const [viewingEvidence, setViewingEvidence] = useState(true);

  // Sync state whenever selected event changes
  useEffect(() => {
    if (event) {
      setSelectedStatus(event.status || 'PENDING_VERIFICATION');
      setAssignedTo(event.assigned_to || '');
      setNotes(event.resolution_notes || '');
    }
  }, [event]);

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  const handleStatusSave = async () => {
    setIsSubmitting(true);
    try {
      await onUpdateStatus(event.event_id, {
        status: selectedStatus,
        assigned_to: assignedTo,
        resolution_notes: notes
      });
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        
        {/* Header matching Spec Section 26 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  EVENT DETAILS — {event.event_id}
                </h2>
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${getSeverityBadge(event.severity)}`}>
                  {event.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                SIH 2026 Problem Statement 26124 | Bharat Electronics Limited
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

        <div className="p-6 space-y-6 text-sm">
          
          {/* Main Attributes Grid (Spec Section 26 layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            
            <div>
              <span className="text-xs text-slate-400 font-medium">Problem:</span>
              <p className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                {event.event_type.replace('_', ' ')}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium">Likely Cause:</span>
              <p className="text-base font-bold text-cyan-400 mt-0.5">
                {event.likely_cause.replace('_', ' ')}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium">Location Corridor:</span>
              <p className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {event.location_name || 'Urban Corridor'}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium">GPS Coordinates:</span>
              <p className="text-sm font-mono text-cyan-300 mt-0.5">
                {event.latitude?.toFixed(6)}° N, {event.longitude?.toFixed(6)}° E
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium">Detected Timestamp:</span>
              <p className="text-xs font-mono text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'N/A'}
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium">Reporting Transit Vehicle:</span>
              <p className="text-sm font-semibold text-slate-200 flex items-center gap-2 mt-0.5">
                <Bus className="w-4 h-4 text-cyan-400" />
                <span>{event.bus_id}</span>
                <span className="text-xs text-slate-400 font-mono">(Route: {event.route_id})</span>
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium">Edge AI Confidence:</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-2.5 rounded-full"
                    style={{ width: `${(event.confidence * 100).toFixed(0)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  {(event.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium">Traffic Density Context:</span>
              <p className="text-sm font-semibold text-slate-200 mt-0.5">
                {event.traffic_density || 'NORMAL'}
              </p>
            </div>

          </div>

          {/* Speed & Deceleration Impact Box (Spec Section 7 & 13) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Transit Telemetry & Slowdown Dynamics
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Previous Speed</span>
                <span className="text-lg font-bold text-slate-200 font-mono">
                  {event.previous_kmh || 34.1} km/h
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Current Speed</span>
                <span className="text-lg font-bold text-cyan-400 font-mono">
                  {event.current_kmh || 12.4} km/h
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-red-900/50">
                <span className="text-[11px] text-red-300 block">Speed Reduction</span>
                <span className="text-lg font-extrabold text-red-400 font-mono flex items-center justify-center gap-1">
                  <ArrowDownRight className="w-4 h-4" />
                  {event.speed_reduction_percent || 63.6}%
                </span>
              </div>
            </div>
            {event.impact_explanation && (
              <p className="mt-3 text-xs text-slate-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800/50">
                <strong className="text-cyan-400">Cause Analysis: </strong>
                {event.impact_explanation}
              </p>
            )}
          </div>

          {/* Evidence Viewer (Spec Section 18 & 26: [View Image] [View Video]) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Edge Camera Evidence Snapshot
              </h4>
              <span className="text-xs text-cyan-400 font-mono">
                {event.camera_id || 'CAM_FRONT'}
              </span>
            </div>
            {imageSrc ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black shadow-inner max-h-72 flex items-center justify-center">
                <img
                  src={imageSrc}
                  alt={`Evidence for ${event.event_id}`}
                  className="w-full h-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/800x450/1e293b/ffffff?text=Camera+Evidence+Snapshot";
                  }}
                />
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400 text-xs">
                No visual snapshot attached.
              </div>
            )}
          </div>

          {/* Authority Action Workflow (Role-Aware) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Authority Action &amp; Department Workflow
              </h4>

              {event.work_order_id && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  Assigned Work Order: {event.work_order_id}
                </span>
              )}
            </div>

            {/* Department-Specific Quick Action Buttons */}
            {isMunicipal && (
              <div className="bg-blue-950/30 border border-blue-800/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-blue-300 block">Municipal Corporation Powers</span>
                  <span className="text-[11px] text-slate-400">Verify detected hazard and dispatch roadwork crew.</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateStatus(event.event_id, { status: 'VERIFIED', resolution_notes: 'Verified by Municipal Road Inspector.' });
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-blue-200 font-semibold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify Defect
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onCreateWorkOrder) onCreateWorkOrder(event);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-lg text-xs shadow-md flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    Create PWD Work Order
                  </button>
                </div>
              </div>
            )}

            {isTraffic && (
              <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-amber-300 block">Traffic Management Command</span>
                  <span className="text-[11px] text-slate-400">Deploy traffic marshals to clear bottleneck corridor.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStatus(event.event_id, { status: 'UNDER_INSPECTION', assigned_to: 'Traffic Patrol Division 4', resolution_notes: 'Traffic marshals deployed on site.' });
                    onClose();
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md flex items-center gap-1 cursor-pointer transition-all"
                >
                  Dispatch Traffic Marshall
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Lifecycle Status:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="AI_DETECTED">AI DETECTED</option>
                  <option value="PENDING_VERIFICATION">PENDING VERIFICATION</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="WORK_ORDER_CREATED">WORK ORDER CREATED</option>
                  <option value="ASSIGNED">ASSIGNED (PWD)</option>
                  <option value="UNDER_INSPECTION">IN PROGRESS / UNDER INSPECTION</option>
                  <option value="COMPLETED">COMPLETED (Repaired)</option>
                  <option value="RESOLVED">VERIFIED &amp; CLOSED</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Assigned Department / Official:</label>
                <input
                  type="text"
                  placeholder="e.g. PWD Zone 3 / BMC Road Repair"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs text-slate-400 block mb-1">Inspection &amp; Action Notes:</label>
                <textarea
                  rows="2"
                  placeholder="Enter field inspection notes or resolution details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStatusSave}
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
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
