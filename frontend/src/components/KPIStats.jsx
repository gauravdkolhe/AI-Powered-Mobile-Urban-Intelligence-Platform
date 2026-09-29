import React from 'react';
import { AlertTriangle, Bus, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';

const KPICard = ({ icon: Icon, iconBg, iconColor, label, value, valueColor, subLabel, subValue, subColor, borderColor }) => (
  <div className={`bg-white rounded-2xl p-4 shadow-sm border ${borderColor || 'border-gray-200'} flex flex-col gap-2 card-hover`}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
      <span className={`p-2 rounded-xl ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </span>
    </div>
    <div className="flex items-baseline gap-2">
      <span className={`text-3xl font-black ${valueColor || 'text-gray-900'} leading-none`}>{value}</span>
      <span className="text-xs text-gray-400">{subLabel}</span>
    </div>
    {subValue && (
      <p className={`text-[11px] font-medium ${subColor || 'text-gray-400'}`}>{subValue}</p>
    )}
  </div>
);

export default function KPIStats({ summary, totalEventsCount }) {
  const kpis = summary?.kpis || {
    total_events: totalEventsCount || 8,
    critical_events: 3,
    resolved_events: 1,
    active_buses: 8,
    persistent_defects: 1
  };

  const breakdown = summary?.breakdown || {
    potholes: 4,
    congestion: 1,
    waterlogging: 1,
    pedestrian_risk: 1
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

      <KPICard
        icon={Cpu}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        label="Road Events"
        value={kpis.total_events}
        subLabel="detected"
        subValue={`${breakdown.potholes} Potholes · ${breakdown.congestion} Congestion`}
        subColor="text-gray-500"
        borderColor="border-gray-200"
      />

      <KPICard
        icon={AlertTriangle}
        iconBg="bg-red-50"
        iconColor="text-red-500"
        label="High / Critical"
        value={kpis.critical_events}
        valueColor="text-red-500"
        subLabel="urgent"
        subValue="Speed reduction > 50%"
        subColor="text-red-400"
        borderColor="border-red-100"
      />

      <KPICard
        icon={Bus}
        iconBg="bg-sky-50"
        iconColor="text-sky-600"
        label="Active Fleet"
        value={kpis.active_buses}
        valueColor="text-sky-600"
        subLabel="buses sensing"
        subValue="Jetson & Pi5 + Coral TPU"
        subColor="text-gray-400"
        borderColor="border-sky-100"
      />

      <KPICard
        icon={ShieldAlert}
        iconBg="bg-amber-50"
        iconColor="text-amber-500"
        label="Fleet Confirmed"
        value={kpis.persistent_defects}
        valueColor="text-amber-600"
        subLabel="multi-bus"
        subValue="4 independent bus sightings"
        subColor="text-amber-500"
        borderColor="border-amber-100"
      />

      <KPICard
        icon={CheckCircle2}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
        label="Resolved Issues"
        value={kpis.resolved_events}
        valueColor="text-emerald-600"
        subLabel="rectified"
        subValue="Authority workflow complete"
        subColor="text-emerald-500"
        borderColor="border-emerald-100"
      />

    </div>
  );
}
