/**
 * MargaDrishti (मार्गदृष्टि) - Frontend API Service
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function fetchEvents(filters = {}) {
  const params = new URLSearchParams();
  if (filters.event_type && filters.event_type !== 'ALL') params.append('event_type', filters.event_type);
  if (filters.severity && filters.severity !== 'ALL') params.append('severity', filters.severity);
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.route_id && filters.route_id !== 'ALL') params.append('route_id', filters.route_id);
  if (filters.bus_id && filters.bus_id !== 'ALL') params.append('bus_id', filters.bus_id);

  const res = await fetch(`${API_BASE}/api/events?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

export async function fetchEventDetail(eventId) {
  const res = await fetch(`${API_BASE}/api/events/${eventId}`);
  if (!res.ok) throw new Error(`Failed to fetch event ${eventId}`);
  return res.json();
}

export async function updateEventStatus(eventId, updateData) {
  const res = await fetch(`${API_BASE}/api/events/${eventId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) throw new Error('Failed to update event status');
  return res.json();
}

export async function fetchFleet() {
  const res = await fetch(`${API_BASE}/api/fleet`);
  if (!res.ok) throw new Error('Failed to fetch fleet');
  return res.json();
}

export async function fetchAnalyticsSummary() {
  const res = await fetch(`${API_BASE}/api/analytics/summary`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchRepeatedDefects() {
  const res = await fetch(`${API_BASE}/api/analytics/repeated-defects`);
  if (!res.ok) throw new Error('Failed to fetch repeated defects');
  return res.json();
}

export async function fetchRouteDelays() {
  const res = await fetch(`${API_BASE}/api/analytics/route-delays`);
  if (!res.ok) throw new Error('Failed to fetch route delays');
  return res.json();
}

export async function fetchCongestionHeatmap() {
  const res = await fetch(`${API_BASE}/api/analytics/congestion-heatmap`);
  if (!res.ok) throw new Error('Failed to fetch congestion data');
  return res.json();
}

export async function fetchRoadConditions() {
  const res = await fetch(`${API_BASE}/api/analytics/road-conditions`);
  if (!res.ok) throw new Error('Failed to fetch road conditions');
  return res.json();
}

export async function fetchIncidents() {
  const res = await fetch(`${API_BASE}/api/anpr/incidents`);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function searchPlate(plate) {
  const res = await fetch(`${API_BASE}/api/anpr/search?plate=${encodeURIComponent(plate)}`);
  if (!res.ok) throw new Error('Failed to search plate');
  return res.json();
}

export async function postEvent(payload) {
  const res = await fetch(`${API_BASE}/api/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to post event');
  return res.json();
}

export async function postTelemetry(payload) {
  const res = await fetch(`${API_BASE}/api/fleet/telemetry`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to post telemetry');
  return res.json();
}

// --- Auth & Users API ---
export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/api/auth/users`);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

// --- Work Orders API ---
export async function fetchWorkOrders(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
  if (filters.assigned_department && filters.assigned_department !== 'ALL') params.append('assigned_department', filters.assigned_department);
  if (filters.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);

  const res = await fetch(`${API_BASE}/api/work-orders?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch work orders');
  return res.json();
}

export async function createWorkOrder(payload) {
  const res = await fetch(`${API_BASE}/api/work-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create work order');
  return res.json();
}

export async function updateWorkOrderStatus(orderId, updateData) {
  const res = await fetch(`${API_BASE}/api/work-orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData)
  });
  if (!res.ok) throw new Error('Failed to update work order status');
  return res.json();
}

export async function uploadWorkOrderProof(orderId, proofData) {
  const res = await fetch(`${API_BASE}/api/work-orders/${orderId}/proof`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proofData)
  });
  if (!res.ok) throw new Error('Failed to upload proof');
  return res.json();
}

// --- Bus Management API ---
export async function registerBus(busData) {
  const res = await fetch(`${API_BASE}/api/fleet/buses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(busData)
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to register bus');
  }
  return res.json();
}

