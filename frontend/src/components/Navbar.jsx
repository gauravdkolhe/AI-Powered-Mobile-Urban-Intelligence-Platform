import React from 'react';
import { Eye, Radio, Shield, MapPin, Zap, Activity, Briefcase, Bus, Wifi, WifiOff } from 'lucide-react';
import { useAuth, DEPARTMENT_METADATA } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, openSimulator, wsStatus, eventCount }) {
  const { currentUser, currentRole, switchRole } = useAuth();
  const meta = DEPARTMENT_METADATA[currentRole] || DEPARTMENT_METADATA.MUNICIPAL_CORP;

  const deptButtons = [
    {
      role: 'TRANSPORT_OPERATOR',
      label: 'Transport Fleet',
      emoji: '🚌',
      tab: 'FLEET_OVERVIEW',
      activeClass: 'bg-blue-600 text-white shadow-sm shadow-blue-200',
    },
    {
      role: 'TRAFFIC_DEPT',
      label: 'Traffic Dept',
      emoji: '🚦',
      tab: 'MAP',
      activeClass: 'bg-amber-500 text-white shadow-sm shadow-amber-200',
    },
    {
      role: 'MUNICIPAL_CORP',
      label: 'Municipal Corp',
      emoji: '🏙️',
      tab: 'MAP',
      activeClass: 'bg-indigo-600 text-white shadow-sm shadow-indigo-200',
    },
    {
      role: 'PWD',
      label: 'PWD Repairs',
      emoji: '🛣️',
      tab: 'WORK_ORDERS',
      activeClass: 'bg-emerald-600 text-white shadow-sm shadow-emerald-200',
    },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-4 lg:px-6 shadow-sm">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-0 py-0">

        {/* Top row */}
        <div className="flex items-center justify-between py-3 gap-4 w-full xl:w-auto xl:py-0 xl:h-16">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-gray-900 leading-none tracking-tight flex items-center gap-1.5">
                MargaDrishti
                <span className="text-blue-600 font-normal text-sm font-serif">मार्गदृष्टि</span>
              </h1>
              <p className="text-[11px] text-gray-400 leading-none mt-0.5">AI-Powered Mobile Urban Intelligence</p>
            </div>
          </div>

          {/* Right side: profile + simulator */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={openSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs rounded-lg shadow-sm transition-all"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              Simulate
            </button>
          </div>
        </div>

        {/* Center nav area */}
        <div className="flex flex-wrap items-center gap-2 pb-2 xl:pb-0 xl:h-16 xl:py-0">

          {/* Department switcher */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 gap-0.5">
            <span className="text-[10px] text-gray-400 font-semibold px-1.5">Dept:</span>
            {deptButtons.map((d) => (
              <button
                key={d.role}
                onClick={() => { switchRole(d.role); setActiveTab(d.tab); }}
                title={d.label}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                  currentRole === d.role
                    ? d.activeClass
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <span>{d.emoji}</span>
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            ))}
          </div>

          {/* Navigation tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 gap-0.5 text-xs font-medium">

            <button
              onClick={() => setActiveTab('MAP')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'MAP'
                  ? 'bg-white text-blue-700 font-semibold shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              {currentRole === 'TRAFFIC_DEPT' ? 'Traffic Map' :
               currentRole === 'PWD' ? 'Work Sites Map' :
               currentRole === 'TRANSPORT_OPERATOR' ? 'Fleet Map' :
               'Hazards Map'}
            </button>

            {currentRole === 'TRANSPORT_OPERATOR' && (
              <button
                onClick={() => setActiveTab('FLEET_OVERVIEW')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'FLEET_OVERVIEW'
                    ? 'bg-white text-blue-700 font-semibold shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <Bus className="w-3.5 h-3.5" />
                Fleet &amp; Telemetry
              </button>
            )}

            {(currentRole === 'MUNICIPAL_CORP' || currentRole === 'PWD') && (
              <button
                onClick={() => setActiveTab('WORK_ORDERS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'WORK_ORDERS'
                    ? 'bg-white text-blue-700 font-semibold shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Work Orders
              </button>
            )}

            {currentRole === 'MUNICIPAL_CORP' && (
              <button
                onClick={() => setActiveTab('REPEATED_DEFECTS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'REPEATED_DEFECTS'
                    ? 'bg-white text-blue-700 font-semibold shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                Fleet Defects
              </button>
            )}

            {currentRole === 'TRAFFIC_DEPT' && (
              <button
                onClick={() => setActiveTab('ROUTE_DELAYS')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'ROUTE_DELAYS'
                    ? 'bg-white text-blue-700 font-semibold shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                Route Delays
              </button>
            )}

            {(currentRole === 'TRAFFIC_DEPT' || currentRole === 'TRANSPORT_OPERATOR') && (
              <button
                onClick={() => setActiveTab('ANPR')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'ANPR'
                    ? 'bg-white text-blue-700 font-semibold shadow-sm border border-gray-200'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                ANPR &amp; Incidents
              </button>
            )}

          </div>
        </div>

        {/* Right side (desktop) */}
        <div className="hidden xl:flex items-center gap-3 h-16">

          {/* WS status */}
          <div className={`flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${
            wsStatus === 'CONNECTED'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            {wsStatus === 'CONNECTED'
              ? <Wifi className="w-3 h-3" />
              : <WifiOff className="w-3 h-3" />
            }
            {wsStatus === 'CONNECTED' ? 'Live' : 'Offline'}
          </div>

          {/* Officer profile */}
          <div className="flex items-center gap-2.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl">
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="leading-tight">
              <span className="text-xs font-bold text-gray-800 block truncate max-w-[130px]">
                {currentUser?.name}
              </span>
              <span className="text-[10px] text-blue-600 font-medium block truncate max-w-[130px]">
                {meta.shortName}
              </span>
            </div>
          </div>

          <button
            onClick={openSimulator}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs rounded-xl shadow-sm shadow-amber-200 transition-all shrink-0"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            Edge Simulator
          </button>
        </div>

      </div>
    </header>
  );
}
