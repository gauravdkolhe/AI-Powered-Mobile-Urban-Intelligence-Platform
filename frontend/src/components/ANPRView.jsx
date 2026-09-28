import React, { useState } from 'react';
import { ShieldAlert, Search, Camera, CheckCircle, AlertTriangle, Car, Clock, MapPin, FileText } from 'lucide-react';

export default function ANPRView({ incidents = [], onSearchPlate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await onSearchPlate(searchQuery.trim());
      setSearchResults(res);
    } catch (err) {
      alert('Search failed: ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const displayList = searchResults !== null ? searchResults : incidents;

  return (
    <div className="bg-[#131b26] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <ShieldAlert className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                ANPR &amp; Incident Investigation Dossier
              </h2>
              <p className="text-xs text-slate-400">
                Spec Section 32 &amp; 33 — High-priority safety lead tracking, license plate OCR, and chain of evidence collection.
              </p>
            </div>
          </div>
        </div>

        {/* License Plate Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Plate (e.g. MH12AB1234)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 pl-9 text-xs font-mono uppercase focus:outline-none focus:border-cyan-500 w-64"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            {isSearching ? 'Searching...' : 'Search Plate'}
          </button>
          {searchResults !== null && (
            <button
              type="button"
              onClick={() => { setSearchResults(null); setSearchQuery(''); }}
              className="text-xs text-slate-400 hover:text-white px-2"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Compliance / Legal Notice Callout */}
      <div className="bg-purple-950/20 border border-purple-900/50 rounded-xl p-4 text-xs text-purple-200/90 leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">Evidence &amp; Probable Lead Framing (Spec Section 33):</strong>
          <p className="mt-0.5 text-purple-300/80">
            MargaDrishti does not treat an edge AI detection as a legally established conclusion. All flagged events are framed as <strong>"AI-Generated Suspected Leads"</strong> with associated confidence ratings, vehicle crop snapshots, and GPS timestamps for verification by law enforcement authorities.
          </p>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayList.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
            No incident leads found matching query.
          </div>
        ) : (
          displayList.map((inc) => (
            <div
              key={inc.incident_id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4"
            >
              {/* Incident Header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/20">
                  {inc.incident_id} • {inc.incident_type}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {inc.status}
                </span>
              </div>

              {/* Vehicle & Plate Card */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Extracted Vehicle Registration</span>
                  <div className="text-2xl font-black text-amber-400 font-mono tracking-widest mt-1">
                    {inc.license_plate}
                  </div>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1 mt-1">
                    <Car className="w-3.5 h-3.5 text-cyan-400" />
                    Vehicle Type: {inc.vehicle_type}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">OCR Confidence</span>
                  <span className="text-xl font-extrabold text-emerald-400 font-mono">
                    {(inc.ocr_confidence * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] text-emerald-500 block">High Confidence</span>
                </div>
              </div>

              {/* Geographic and Temporal Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Incident Location</span>
                  <span className="font-medium text-slate-200 mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {inc.location_name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    {inc.latitude}° N, {inc.longitude}° E
                  </span>
                </div>

                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <span className="text-[10px] text-slate-400 block">Timestamp &amp; Source</span>
                  <span className="font-medium text-slate-200 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    {inc.timestamp ? new Date(inc.timestamp).toLocaleTimeString() : 'Recent'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">
                    Witness Bus: {inc.reporting_bus_id}
                  </span>
                </div>
              </div>

              {/* Chain of Evidence Snapshot */}
              <div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Visual Chain of Evidence:
                </span>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-black">
                  <img
                    src={inc.evidence_snapshot_url ? `http://127.0.0.1:8000${inc.evidence_snapshot_url}` : "/uploads/EVT_00186_snapshot.jpg"}
                    alt={`ANPR for ${inc.license_plate}`}
                    className="w-full h-auto object-contain max-h-56"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/800x450/1e293b/ffffff?text=ANPR+Evidence+Snapshot";
                    }}
                  />
                </div>
              </div>

              {/* Notes */}
              {inc.notes && (
                <div className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/70 font-sans leading-relaxed">
                  <strong className="text-slate-300">Investigator Notes: </strong>
                  {inc.notes}
                </div>
              )}

              {/* Authority Escalation Action */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                <span className="text-purple-300 font-mono">Restricted Access Data</span>
                <button
                  onClick={() => alert(`Case Dossier #${inc.incident_id} escalated to Traffic Police Department.`)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all cursor-pointer"
                >
                  Escalate to Police Control Room
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
