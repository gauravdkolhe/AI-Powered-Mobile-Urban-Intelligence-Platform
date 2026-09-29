import React, { useState } from 'react';
import { X, Briefcase, CheckCircle2 } from 'lucide-react';
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
        title,
        problem_type: event.event_type,
        location_name: event.location_name || 'Urban Transit Corridor',
        latitude: event.latitude,
        longitude: event.longitude,
        severity: event.severity,
        priority,
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

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all";

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Briefcase className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                Create PWD Work Order
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  Municipal Action
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Dispatches verified defect {event.event_id} to Public Works Department for execution.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          <div>
            <label className="block text-xs text-gray-600 font-semibold mb-1.5 uppercase tracking-wider">Work Order Title:</label>
            <input
              type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5 font-medium">Assigned Department:</label>
              <input
                type="text" disabled value="Public Works Department (PWD)"
                className={`${inputClass} bg-gray-100 text-gray-400 cursor-not-allowed`}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold">PWD Division / Zone:</label>
              <select value={zone} onChange={(e) => setZone(e.target.value)} className={inputClass}>
                <option value="PWD Zone 3 - Western Corridor">PWD Zone 3 - Western Corridor (Bandra - Santacruz)</option>
                <option value="PWD Zone 2 - Drainage Maintenance">PWD Zone 2 - Central Drainage & Underpasses</option>
                <option value="PWD Zone 1 - Island City Division">PWD Zone 1 - Island City Division</option>
                <option value="PWD Zone 4 - Andheri Division">PWD Zone 4 - Andheri & Link Road Division</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold">Execution Priority:</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
                <option value="EMERGENCY">🚨 Emergency (Immediate Cordon & Repair)</option>
                <option value="HIGH">⚡ High Priority (&lt; 24h)</option>
                <option value="NORMAL">Standard Priority (&lt; 72h)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1.5 font-semibold">Target Completion Deadline:</label>
              <select value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass}>
                <option value="Today, 18:00 IST">Today, 18:00 IST</option>
                <option value="Within 24 Hours">Within 24 Hours</option>
                <option value="Within 48 Hours">Within 48 Hours</option>
                <option value="Weekend Maintenance Window">Weekend Maintenance Window</option>
              </select>
            </div>
          </div>

          {/* Location box */}
          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-blue-400 block uppercase font-semibold mb-0.5">Repair Site</span>
              <span className="text-blue-700 font-mono font-bold">
                {event.latitude?.toFixed(6)}° N, {event.longitude?.toFixed(6)}° E
              </span>
              <span className="text-blue-600 block mt-0.5">{event.location_name}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-blue-400 block uppercase font-semibold mb-0.5">Event ID</span>
              <span className="text-amber-600 font-mono font-bold">{event.event_id}</span>
              <span className="text-blue-500 block mt-0.5">Speed drop: {event.speed_reduction_percent}%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 font-semibold mb-1.5">Field Instructions for PWD Crew:</label>
            <textarea
              rows="3" value={notes} onChange={(e) => setNotes(e.target.value)}
              className={`${inputClass} resize-none`}
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
            <button
              type="button" onClick={onClose}
              className="px-4 py-2 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isSubmitting}
              className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer text-xs transition-all"
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
