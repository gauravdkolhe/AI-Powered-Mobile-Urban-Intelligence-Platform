import React from 'react';
import { Eye, Radio, Shield, MapPin, Zap, Activity, Briefcase, Bus, ChevronDown, Check } from 'lucide-react';
import { useAuth, DEPARTMENT_METADATA } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, openSimulator, wsStatus, eventCount }) {
  const { currentUser, currentRole, switchRole } = useAuth();
  const meta = DEPARTMENT_METADATA[currentRole] || DEPARTMENT_METADATA.MUNICIPAL_CORP;

  return (
    <header className="bg-[#111827] border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3 shadow-lg">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Left: Brand & Department Identity */}
        <div className="flex items-center space-x-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-bold text-xl shrink-0">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                MargaDrishti <span className="text-cyan-400 font-normal text-sm font-serif">मार्गदृष्टि</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Seeing Roads. Understanding Cities. — AI-Powered Mobile Urban Intelligence Platform
            </p>
          </div>
        </div>

        {/* Center: Department Switcher + Role-Specific Nav Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Department Quick Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold px-2 flex items-center gap-1">
              <span>Department:</span>
            </span>

            <button
              onClick={() => { switchRole('TRANSPORT_OPERATOR'); setActiveTab('FLEET_OVERVIEW'); }}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold ${
                currentRole === 'TRANSPORT_OPERATOR'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Public Transport Operator (Buses & Fleet)"
            >
              <span>🚌</span>
              <span className="hidden sm:inline">Transport Fleet</span>
            </button>

            <button
              onClick={() => { switchRole('TRAFFIC_DEPT'); setActiveTab('MAP'); }}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold ${
                currentRole === 'TRAFFIC_DEPT'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Traffic Management Department"
            >
              <span>🚦</span>
              <span className="hidden sm:inline">Traffic Dept</span>
            </button>

            <button
              onClick={() => { switchRole('MUNICIPAL_CORP'); setActiveTab('MAP'); }}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold ${
                currentRole === 'MUNICIPAL_CORP'
                  ? 'bg-blue-500 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Municipal Corporation (Potholes & Civic Issues)"
            >
              <span>🏙️</span>
              <span className="hidden sm:inline">Municipal Corp</span>
            </button>

            <button
              onClick={() => { switchRole('PWD'); setActiveTab('WORK_ORDERS'); }}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold ${
                currentRole === 'PWD'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title="Public Works Department (Assigned Roadwork)"
            >
              <span>🛣️</span>
              <span className="hidden sm:inline">PWD Repairs</span>
            </button>
          </div>

          {/* Department-Tailored Navigation Tabs */}
          <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-medium">
            
            {/* Common or Role-Specific Map */}
            <button
              onClick={() => setActiveTab('MAP')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'MAP'
                  ? 'bg-slate-800 text-cyan-300 font-bold shadow border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              {currentRole === 'TRAFFIC_DEPT' ? 'Traffic Flow Map' :
               currentRole === 'PWD' ? 'Work Sites Map' :
               currentRole === 'TRANSPORT_OPERATOR' ? 'Fleet Transit Map' :
               'Civic Hazards Map'}
            </button>

            {/* Transport Operator specific */}
            {currentRole === 'TRANSPORT_OPERATOR' && (
              <button
                onClick={() => setActiveTab('FLEET_OVERVIEW')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'FLEET_OVERVIEW'
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Bus className="w-3.5 h-3.5 text-cyan-400" />
                Buses &amp; Telemetry
              </button>
            )}

            {/* Work Orders Hub (Municipal & PWD) */}
            {(currentRole === 'MUNICIPAL_CORP' || currentRole === 'PWD') && (
              <button
                onClick={() => setActiveTab('WORK_ORDERS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'WORK_ORDERS'
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                {currentRole === 'PWD' ? 'Assigned Work Orders' : 'Work Orders & PWD Dispatch'}
              </button>
            )}

            {/* Municipal: Multi-Bus Confirmed Repeated Defects */}
            {currentRole === 'MUNICIPAL_CORP' && (
              <button
                onClick={() => setActiveTab('REPEATED_DEFECTS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'REPEATED_DEFECTS'
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Fleet Verified Defects
              </button>
            )}

            {/* Traffic: Route Delays */}
            {currentRole === 'TRAFFIC_DEPT' && (
              <button
                onClick={() => setActiveTab('ROUTE_DELAYS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'ROUTE_DELAYS'
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                Route Delay Analysis
              </button>
            )}

            {/* Traffic & Operator: ANPR & Incident Leads */}
            {(currentRole === 'TRAFFIC_DEPT' || currentRole === 'TRANSPORT_OPERATOR') && (
              <button
                onClick={() => setActiveTab('ANPR')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'ANPR'
                    ? 'bg-slate-800 text-cyan-300 font-bold shadow border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-400" />
                ANPR &amp; Incident Leads
              </button>
            )}

          </div>

        </div>

        {/* Right: Active Officer Badge & Simulator */}
        <div className="flex items-center space-x-3">
          
          {/* Officer Profile Badge */}
          <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-700"
            />
            <div className="text-left leading-tight hidden lg:block">
              <span className="text-xs font-bold text-white block truncate max-w-[140px]">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-cyan-400 font-mono block truncate max-w-[140px]">
                {meta.shortName}
              </span>
            </div>
          </div>

          <button
            onClick={openSimulator}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            <span>Edge Simulator</span>
          </button>
        </div>

      </div>
    </header>
  );
}
