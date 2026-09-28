import React, { useState } from 'react';
import { X, Briefcase, MapPin, AlertTriangle, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { createWorkOrder } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function CreateWorkOrderModal({ event, onClose, onCreated }) {
  if (!event) return null;

  const { currentUser } = useAuth();

  const [title, setTitle] = useState(`Repair & Rectification — ${event.event_type.replace('_', ' ')}`);
  const [priority, setPriority] = useState(event.severity === 'CRITICAL' ? 'EMERGENCY' : 'HIGH');
  const [zone, setZone] = useState('PWD Zone 3 - Western Corridor');
  const [deadline, setDeadline] = useState('Within 24 Hours');
  const [notes, setNotes] = useState(
    `Field roadwork required at ${event.location_name || 'Corridor'}. AI confidence ${(event.confidence * 100).toFixed(0)}%. Compaction and surface level test required.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        event_id: event.event_id,
        title: title,
        problem_type: event.event_type,
        location_name: event.location_name || 'Urban Transit Corridor',
        latitude: event.latitude,
        longitude: event.longitude,
        severity: event.severity,
        priority: priority,
        assigned_department: 'PWD',
        assigned_zone: zone,
        deadline_date: deadline,
        evidence_before_url: event.evidence_image_url || '/uploads/EVT_00182_snapshot.jpg',
        repair_notes: notes
      };

      const newOrder = await createWorkOrder(payload);
      if (onCreated) onCreated(newOrder);
      onClose();
    } catch (err) {
      alert('Failed to create work order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#111827] border border-blue-600/50 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Briefcase className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                CREATE PWD WORK ORDER
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  Municipal Action
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Dispatches verified defect {event.event_id} to Public Works Department (PWD) for execution.
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Work Order Title:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Assigned Department:</label>
              <input
                type="text"
                disabled
                value="Public Works Department (PWD)"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-slate-300 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Assign PWD Division / Zone:</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="PWD Zone 3 - Western Corridor">PWD Zone 3 - Western Corridor (Bandra - Santacruz)</option>
                <option value="PWD Zone 2 - Drainage Maintenance">PWD Zone 2 - Central Drainage &amp; Underpasses</option>
                <option value="PWD Zone 1 - Island City Division">PWD Zone 1 - Island City Division</option>
                <option value="PWD Zone 4 - Andheri Division">PWD Zone 4 - Andheri &amp; Link Road Division</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Execution Priority:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="EMERGENCY">🚨 Emergency (Immediate Cordon &amp; Repair)</option>
                <option value="HIGH">⚡ High Priority (&lt; 24h)</option>
                <option value="NORMAL">Standard Priority (&lt; 72h)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 mb-1 font-medium">Target Completion Deadline:</label>
              <select
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Today, 18:00 IST">Today, 18:00 IST</option>
                <option value="Within 24 Hours">Within 24 Hours</option>
                <option value="Within 48 Hours">Within 48 Hours</option>
                <option value="Weekend Maintenance Window">Weekend Maintenance Window</option>
              </select>
            </div>

          </div>

          {/* Location Summary Box */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Repair Site Coordinates</span>
              <span className="text-cyan-300 font-mono font-bold">
                {event.latitude?.toFixed(6)}° N, {event.longitude?.toFixed(6)}° E
              </span>
              <span className="text-slate-400 block text-[11px] mt-0.5">{event.location_name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block uppercase font-medium">Originating Event</span>
              <span className="text-amber-400 font-mono font-bold">{event.event_id}</span>
              <span className="text-slate-400 block text-[10px]">Speed drop: {event.speed_reduction_percent}%</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Field Instructions for PWD Crew:</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 font-bold text-slate-950 bg-blue-400 hover:bg-blue-300 rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Dispatching...' : 'Dispatch Work Order to PWD'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
