import React, { useState, useEffect } from 'react';
import {
  X, MapPin, Bus, ShieldAlert, CheckCircle, Activity, ArrowDownRight,
  Clock, Briefcase, ShieldCheck, Camera
} from 'lucide-react';
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

  // Safe normalized fields to ensure it never crashes on any event payload structure
  const eventId = event.event_id || 'EVT_ALERT';
  const eventType = (event.event_type || 'POTHOLE').replace(/_/g, ' ');
  const likelyCause = (event.likely_cause || 'ROAD_DEFECT').replace(/_/g, ' ');
  const severity = ((event.severity) || 'HIGH').toUpperCase();
  const lat = typeof event.latitude === 'number' ? event.latitude : (event.location?.latitude ?? 19.0760);
  const lon = typeof event.longitude === 'number' ? event.longitude : (event.location?.longitude ?? 72.8777);
  const confidence = event.confidence != null ? event.confidence : (event.ai?.confidence ?? 0.93);
  const currentSpeed = event.current_kmh != null ? event.current_kmh : (event.speed?.current_kmh ?? 12.4);
  const previousSpeed = event.previous_kmh != null ? event.previous_kmh : (event.speed?.previous_kmh ?? 34.1);
  const speedReduction = event.speed_reduction_percent != null ? event.speed_reduction_percent : (event.speed?.speed_reduction_percent ?? 63.6);
  const locationName = event.location_name || 'Western Express Highway Corridor';
  const busId = event.bus_id || 'BUS_102';
  const routeId = event.route_id || 'R12';
  const rawImg = event.evidence_image_url || event.evidence?.image_path || '/uploads/EVT_00182_snapshot.jpg';
  const imageSrc = rawImg.startsWith('http') ? rawImg : `http://127.0.0.1:8000${rawImg}`;

  const getSeverityBadge = (sev) => {
    const s = (sev || 'HIGH').toUpperCase();
    switch (s) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-red-500 text-white border-red-600 shadow-sm shadow-red-200';
      case 'MEDIUM':
        return 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm shadow-amber-200';
      case 'LOW':
        return 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-200';
      default:
        return 'bg-blue-500 text-white border-blue-600';
    }
  };

  const handleStatusSave = async () => {
    setIsSubmitting(true);
    try {
      await onUpdateStatus(eventId, { status: selectedStatus, assigned_to: assignedTo, resolution_notes: notes });
      onClose();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCoordinates = () => {
    const coordStr = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
    navigator.clipboard?.writeText(coordStr);
    alert(`GPS Coordinates copied to clipboard: ${coordStr}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 z-10 bg-white">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-gray-900">DETECTED PROBLEM DOSSIER — {eventId}</h2>
                <span className={`px-2.5 py-0.5 text-[11px] font-black tracking-wide rounded-full border ${getSeverityBadge(severity)}`}>
                  {severity} SEVERITY
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">SIH 2026 · Problem Statement 26124 · MargaDrishti Urban Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-sm">

          {/* 4 Core Pillars: Category, Severity, Location, Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Pillar 1: Problem Category & Classification */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-blue-100 p-4 rounded-2xl space-y-2">
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">
                1. Problem Category &amp; Defect
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl">
                  {event.event_type === 'POTHOLE' || event.event_type === 'DAMAGED_ROAD' ? '🕳️' :
                   event.event_type === 'CONGESTION' ? '🚗' :
                   event.event_type === 'WATERLOGGING' ? '🌊' :
                   event.event_type === 'VULNERABLE_PEDESTRIAN' ? '🚶' : '🚨'}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                    {eventType}
                  </h3>
                  <span className="text-xs text-blue-600 font-semibold">
                    Likely Cause: {likelyCause}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-blue-100/60 flex items-center justify-between text-xs text-gray-600">
                <span>Edge AI Confidence:</span>
                <span className="font-bold text-emerald-600 font-mono">{(confidence * 100).toFixed(0)}% Confirmed</span>
              </div>
            </div>

            {/* Pillar 2: Severity Assessment (Green / Yellow / Red) */}
            <div className={`p-4 rounded-2xl border space-y-2 ${
              severity === 'CRITICAL' || severity === 'HIGH'
                ? 'bg-red-50/70 border-red-200 text-red-950'
                : severity === 'MEDIUM'
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-80">
                2. Problem Severity &amp; Slowdown Impact
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getSeverityBadge(severity)}`}>
                    {severity} SEVERITY
                  </span>
                  <p className="text-xs font-medium mt-1">
                    {severity === 'CRITICAL' || severity === 'HIGH' ? 'Immediate civic intervention required' :
                     severity === 'MEDIUM' ? 'Scheduled maintenance priority' : 'Minor surface irregularity'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-red-600">
                    ↓{speedReduction}%
                  </span>
                  <span className="text-[10px] text-gray-500 block uppercase">Speed Drop</span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200/60 text-xs flex items-center justify-between font-mono text-gray-600">
                <span>Transit Impact:</span>
                <span>{previousSpeed} km/h → <strong className="text-blue-600">{currentSpeed} km/h</strong></span>
              </div>
            </div>

            {/* Pillar 3: Location Details */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  3. Exact Location &amp; Corridor
                </span>
                <button
                  onClick={copyCoordinates}
                  className="text-[10px] font-mono text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 cursor-pointer"
                >
                  📋 Copy GPS
                </button>
              </div>
              <p className="text-sm font-bold text-gray-800 leading-snug">
                {locationName}
              </p>
              <div className="bg-white p-2 rounded-xl border border-gray-200 text-xs font-mono text-blue-600 flex items-center justify-between">
                <span>GPS: {lat.toFixed(6)}° N, {lon.toFixed(6)}° E</span>
                <span className="text-gray-400 text-[10px]">Bus: {busId} ({routeId})</span>
              </div>
            </div>

            {/* Pillar 4: Detection Snapshot */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-blue-500" />
                  4. Edge Camera Visual Snapshot
                </span>
                <span className="text-[10px] font-mono text-gray-500">{event.camera_id || 'CAM_FRONT'}</span>
              </div>
              <div className="rounded-xl overflow-hidden border border-gray-300 relative bg-black shadow-inner max-h-44 flex items-center justify-center">
                <img
                  src={imageSrc}
                  alt={`Evidence Snapshot for ${eventId}`}
                  className="w-full h-40 object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x450/f3f4f6/9ca3af?text=Camera+Evidence+Snapshot"; }}
                />
                <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                  {event.timestamp ? new Date(event.timestamp).toLocaleTimeString() : 'Live Stream'}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  AI Conf: {(confidence * 100).toFixed(0)}%
                </div>
              </div>
            </div>

          </div>

          {/* Analysis Explanation */}
          {event.impact_explanation && (
            <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-gray-700">
              <strong className="text-blue-800">Diagnostic Analysis: </strong>{event.impact_explanation}
            </div>
          )}

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
