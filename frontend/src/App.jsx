import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import KPIStats from './components/KPIStats';
import FilterBar from './components/FilterBar';
import GISMap from './components/GISMap';
import EventDetailModal from './components/EventDetailModal';
import CreateWorkOrderModal from './components/CreateWorkOrderModal';
import WorkOrdersView from './components/WorkOrdersView';
import FleetManagerView from './components/FleetManagerView';
import RepeatedDefectsView from './components/RepeatedDefectsView';
import RouteDelayView from './components/RouteDelayView';
import ANPRView from './components/ANPRView';
import LiveSimulationDrawer from './components/LiveSimulationDrawer';
import { AuthProvider, useAuth } from './context/AuthContext';

import {
  fetchEvents,
  fetchFleet,
  fetchAnalyticsSummary,
  fetchRepeatedDefects,
  fetchRouteDelays,
  fetchCongestionHeatmap,
  fetchRoadConditions,
  fetchIncidents,
  fetchWorkOrders,
  searchPlate,
  updateEventStatus
} from './services/api';
import { createWebSocketConnection } from './services/websocket';

function MainDashboard() {
  const { currentRole } = useAuth();

  const [activeTab, setActiveTab] = useState('MAP');
  const [events, setEvents] = useState([]);
  const [fleet, setFleet] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [roadConditions, setRoadConditions] = useState([]);
  const [congestionPoints, setCongestionPoints] = useState([]);
  const [summary, setSummary] = useState(null);
  const [repeatedDefects, setRepeatedDefects] = useState([]);
  const [routeSegments, setRouteSegments] = useState([]);
  const [incidents, setIncidents] = useState([]);

  const [filters, setFilters] = useState({
    event_type: 'ALL',
    severity: 'ALL',
    status: 'ALL',
    route_id: 'ALL',
    bus_id: 'ALL'
  });

  const [layers, setLayers] = useState({
    roadHealth: true,
    tracks: true,
    congestion: true,
    fleet: true,
    workOrders: true
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [creatingWorkOrderEvent, setCreatingWorkOrderEvent] = useState(null);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [wsStatus, setWsStatus] = useState('DISCONNECTED');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [
        eventsData,
        fleetData,
        workOrdersData,
        summaryData,
        defectsData,
        delaysData,
        congestionData,
        conditionsData,
        incidentsData
      ] = await Promise.all([
        fetchEvents(filters),
        fetchFleet(),
        fetchWorkOrders(),
        fetchAnalyticsSummary(),
        fetchRepeatedDefects(),
        fetchRouteDelays(),
        fetchCongestionHeatmap(),
        fetchRoadConditions(),
        fetchIncidents()
      ]);

      setEvents(eventsData);
      setFleet(fleetData);
      setWorkOrders(workOrdersData);
      setSummary(summaryData);
      setRepeatedDefects(defectsData);
      setRouteSegments(delaysData);
      setCongestionPoints(congestionData);
      setRoadConditions(conditionsData);
      setIncidents(incidentsData);
    } catch (err) {
      console.error('[MargaDrishti] Error loading platform data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const ws = createWebSocketConnection(
      (msg) => {
        if (msg.type === 'NEW_EVENT') {
          setEvents(prev => [msg.data, ...prev]);
          fetchAnalyticsSummary().then(setSummary).catch(console.error);
          fetchRepeatedDefects().then(setRepeatedDefects).catch(console.error);
          fetchRouteDelays().then(setRouteSegments).catch(console.error);
        } else if (msg.type === 'FLEET_TELEMETRY') {
          setFleet(prev => {
            const idx = prev.findIndex(b => b.bus_id === msg.data.bus_id);
            if (idx !== -1) {
              const updated = [...prev];
              updated[idx] = { ...updated[idx], ...msg.data };
              return updated;
            } else {
              return [...prev, msg.data];
            }
          });
        } else if (msg.type === 'EVENT_STATUS_UPDATED') {
          setEvents(prev => prev.map(e => e.event_id === msg.data.event_id ? { ...e, status: msg.data.status } : e));
          fetchAnalyticsSummary().then(setSummary).catch(console.error);
        } else if (msg.type === 'WORK_ORDER_CREATED' || msg.type === 'WORK_ORDER_STATUS_CHANGED' || msg.type === 'WORK_ORDER_PROOF_SUBMITTED') {
          fetchWorkOrders().then(setWorkOrders).catch(console.error);
          fetchEvents(filters).then(setEvents).catch(console.error);
        } else if (msg.type === 'NEW_BUS_REGISTERED') {
          fetchFleet().then(setFleet).catch(console.error);
        }
      },
      (status) => {
        setWsStatus(status);
      }
    );

    return () => ws.close();
  }, [filters]);

  const handleStatusUpdate = async (eventId, updateData) => {
    const res = await updateEventStatus(eventId, updateData);
    setEvents(prev => prev.map(e => e.event_id === eventId ? { ...e, status: res.new_status } : e));
    fetchAnalyticsSummary().then(setSummary).catch(console.error);
    return res;
  };

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#1a2332] flex flex-col font-sans">

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSimulator={() => setIsSimulatorOpen(true)}
        wsStatus={wsStatus}
        eventCount={events.length}
      />

      <main className="flex-1 px-4 lg:px-6 py-5 max-w-[1700px] w-full mx-auto space-y-4">

        <KPIStats summary={summary} totalEventsCount={events.length} />

        {activeTab === 'MAP' && (
          <div className="space-y-4">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              layers={layers}
              setLayers={setLayers}
              onRefresh={loadAllData}
              isRefreshing={isRefreshing}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

              {/* GIS Map */}
              <div className="lg:col-span-3 h-[640px] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <GISMap
                  events={events}
                  fleet={fleet}
                  workOrders={workOrders}
                  roadConditions={roadConditions}
                  congestionPoints={congestionPoints}
                  layers={layers}
                  onSelectEvent={(evt) => setSelectedEvent(evt)}
                  onSelectWorkOrder={(wo) => setActiveTab('WORK_ORDERS')}
                />
              </div>

              {/* Events Feed Sidebar */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col h-[640px] shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                    Live Events Feed
                  </span>
                  <span className="text-xs font-semibold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    {events.length} Active
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-0.5">
                  {events.length === 0 ? (
                    <div className="text-gray-400 text-xs text-center py-12">
                      No events match current filter.
                    </div>
                  ) : (
                    events.map((evt) => (
                      <div
                        key={evt.event_id}
                        onClick={() => setSelectedEvent(evt)}
                        className="p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-xl cursor-pointer transition-all text-xs space-y-1.5 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 group-hover:text-blue-700">
                            {evt.event_type.replace('_', ' ')}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            evt.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                            evt.severity === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {evt.severity}
                          </span>
                        </div>

                        <div className="text-[11px] text-gray-500 truncate">
                          {evt.location_name || 'Urban Corridor'}
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-gray-200 text-[10px] text-gray-400 font-mono">
                          <span>{evt.bus_id} · {evt.route_id}</span>
                          <span className="text-red-500 font-semibold">↓{evt.speed_reduction_percent}%</span>
                        </div>

                        {evt.work_order_id && (
                          <div className="pt-1 text-[10px] text-blue-500 font-medium">
                            🛠 {evt.work_order_id} Dispatched
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'WORK_ORDERS' && (
          <WorkOrdersView
            onSelectLocation={(loc) => {
              setActiveTab('MAP');
            }}
          />
        )}

        {activeTab === 'FLEET_OVERVIEW' && (
          <FleetManagerView
            fleet={fleet}
            events={events}
            onRefreshFleet={loadAllData}
          />
        )}

        {activeTab === 'REPEATED_DEFECTS' && (
          <RepeatedDefectsView
            defects={repeatedDefects}
            onSelectDefect={(d) => console.log(d)}
          />
        )}

        {activeTab === 'ROUTE_DELAYS' && (
          <RouteDelayView segments={routeSegments} />
        )}

        {activeTab === 'ANPR' && (
          <ANPRView
            incidents={incidents}
            onSearchPlate={searchPlate}
          />
        )}

      </main>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onUpdateStatus={handleStatusUpdate}
        onCreateWorkOrder={(evt) => setCreatingWorkOrderEvent(evt)}
      />

      {creatingWorkOrderEvent && (
        <CreateWorkOrderModal
          event={creatingWorkOrderEvent}
          onClose={() => setCreatingWorkOrderEvent(null)}
          onCreated={(newWo) => {
            loadAllData();
            setActiveTab('WORK_ORDERS');
          }}
        />
      )}

      <LiveSimulationDrawer
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onEventSimulated={loadAllData}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainDashboard />
    </AuthProvider>
  );
}
