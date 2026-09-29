import React, { useState } from 'react';
import { ShieldAlert, Search, Camera, AlertTriangle, Car, Clock, MapPin } from 'lucide-react';

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
    <div className="space-y-4">

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <ShieldAlert className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-gray-900">ANPR & Incident Investigation Dossier</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              High-priority safety lead tracking, license plate OCR, and chain of evidence collection.
            </p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Plate (e.g. MH12AB1234)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-gray-200 text-gray-800 rounded-xl px-3 py-2 pl-9 text-xs font-mono uppercase focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 w-60 shadow-sm transition-all"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {isSearching ? 'Searching...' : 'Search Plate'}
          </button>
          {searchResults !== null && (
            <button
              type="button"
              onClick={() => { setSearchResults(null); setSearchQuery(''); }}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 font-medium transition-colors"
            >
              Reset
            </button>
          )}
        </form>
      </div>

      {/* Legal notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-xs text-gray-700 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-900 block mb-0.5">Evidence & Probable Lead Framing:</strong>
          <p className="text-gray-600 leading-relaxed">
            MargaDrishti does not treat an edge AI detection as a legally established conclusion. All flagged events are framed as <strong className="text-purple-700">"AI-Generated Suspected Leads"</strong> with associated confidence ratings, vehicle crop snapshots, and GPS timestamps for verification by law enforcement authorities.
          </p>
        </div>
      </div>

      {/* Incidents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {displayList.length === 0 ? (
          <div className="col-span-2 text-center py-20 text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">
            No incident leads found matching query.
          </div>
        ) : (
          displayList.map((inc) => (
            <div
              key={inc.incident_id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm card-hover space-y-4"
            >
              {/* Incident header */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-lg border border-purple-200">
                  {inc.incident_id} · {inc.incident_type}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {inc.status}
                </span>
              </div>

              {/* Vehicle plate */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold mb-1">Vehicle Registration</span>
                  <div className="text-2xl font-black text-amber-600 font-mono tracking-widest">{inc.license_plate}</div>
                  <span className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-1">
                    <Car className="w-3.5 h-3.5 text-sky-500" />
                    {inc.vehicle_type}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 block uppercase font-semibold mb-1">OCR Confidence</span>
                  <span className="text-2xl font-extrabold text-emerald-600 font-mono">{(inc.ocr_confidence * 100).toFixed(0)}%</span>
                  <span className="text-[10px] text-emerald-600 block">High Confidence</span>
                </div>
              </div>

              {/* Geo/time */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block mb-0.5 uppercase font-semibold">Location</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    {inc.location_name}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono block mt-0.5">{inc.latitude}° N, {inc.longitude}° E</span>
                </div>
                <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block mb-0.5 uppercase font-semibold">Timestamp & Source</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                    {inc.timestamp ? new Date(inc.timestamp).toLocaleTimeString() : 'Recent'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono block mt-0.5">Bus: {inc.reporting_bus_id}</span>
                </div>
              </div>

              {/* Evidence image */}
              <div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-sky-500" />
                  Visual Chain of Evidence
                </span>
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <img
                    src={inc.evidence_snapshot_url ? `http://127.0.0.1:8000${inc.evidence_snapshot_url}` : "/uploads/EVT_00186_snapshot.jpg"}
                    alt={`ANPR for ${inc.license_plate}`}
                    className="w-full h-auto object-contain max-h-52"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x450/f3f4f6/9ca3af?text=ANPR+Evidence+Snapshot"; }}
                  />
                </div>
              </div>

              {/* Notes */}
              {inc.notes && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-100 leading-relaxed">
                  <strong className="text-gray-800">Investigator Notes: </strong>{inc.notes}
                </div>
              )}

              {/* Action footer */}
              <div className="pt-2 flex items-center justify-between border-t border-gray-100 text-xs">
                <span className="text-purple-600 font-medium">Restricted Access Data</span>
                <button
                  onClick={() => alert(`Case Dossier #${inc.incident_id} escalated to Traffic Police Department.`)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm text-xs"
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
