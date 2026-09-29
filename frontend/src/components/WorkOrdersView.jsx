import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  Camera,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Plus,
  Eye
} from 'lucide-react';
import { fetchWorkOrders, updateWorkOrderStatus, uploadWorkOrderProof } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  ASSIGNED: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  IN_PROGRESS: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  COMPLETED: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  VERIFIED_AND_CLOSED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

export default function WorkOrdersView({ onSelectLocation }) {
  const { currentRole, currentUser } = useAuth();
  const isPWD = currentRole === 'PWD';
  const isMunicipal = currentRole === 'MUNICIPAL_CORP';

  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState('/uploads/EVT_00182_repaired.jpg');
  const [repairNotes, setRepairNotes] = useState('Hot-mix asphalt patch compacted and leveled. Curing complete.');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (isPWD) filters.assigned_department = 'PWD';
      const data = await fetchWorkOrders(filters);
      setWorkOrders(data);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, [statusFilter, currentRole]);

  const handleStartWork = async (orderId) => {
    try {
      await updateWorkOrderStatus(orderId, { status: 'IN_PROGRESS', repair_notes: 'PWD repair crew deployed on site.' });
      loadOrders();
    } catch (err) { alert('Error starting work: ' + err.message); }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmittingProof(true);
    try {
      await uploadWorkOrderProof(selectedOrder.order_id, { evidence_after_url: proofUrl, repair_notes: repairNotes });
      setIsProofModalOpen(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (err) { alert('Error submitting proof: ' + err.message); }
    finally { setIsSubmittingProof(false); }
  };

  const handleVerifyAndClose = async (orderId) => {
    try {
      await updateWorkOrderStatus(orderId, {
        status: 'VERIFIED_AND_CLOSED',
        verification_notes: `Field repair approved by ${currentUser?.name || 'Municipal Officer'}. Quality check passed.`
      });
      loadOrders();
    } catch (err) { alert('Error closing work order: ' + err.message); }
  };

  const getStatusStyle = (status) => STATUS_CONFIG[status] || { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', dot: 'bg-gray-400' };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Briefcase className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900">
                  {isPWD ? 'PWD Maintenance Works' : 'Work Order Governance'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  {isPWD ? 'Execution Mode' : 'Oversight & Verification'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {isPWD
                  ? 'Active work orders assigned to PWD for road defect patching and field repairs.'
                  : 'Municipal command hub for assigning road defect orders to PWD and verifying completion.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 shadow-sm"
            >
              <option value="ALL">All Work Orders</option>
              <option value="ASSIGNED">Assigned (Pending PWD)</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed (Awaiting Sign-off)</option>
              <option value="VERIFIED_AND_CLOSED">Verified & Closed</option>
            </select>

            <button
              onClick={loadOrders}
              className="p-2 bg-white hover:bg-gray-50 text-gray-500 hover:text-blue-600 rounded-xl border border-gray-200 transition-all shadow-sm cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Lifecycle ribbon */}
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-600 flex flex-wrap items-center gap-2 shadow-sm">
        <span className="text-gray-400 font-semibold text-[11px] uppercase tracking-wider">Lifecycle:</span>
        {[
          { label: '1. AI Detected', color: 'bg-gray-100 text-gray-600' },
          { label: '2. Municipal Verified', color: 'bg-gray-100 text-gray-600' },
          { label: '3. PWD Assigned', color: 'bg-blue-50 text-blue-700 border border-blue-200' },
          { label: '4. In Progress', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
          { label: '5. Completed + Proof', color: 'bg-purple-50 text-purple-700 border border-purple-200' },
          { label: '6. Verified & Closed', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold' },
        ].map((step, i, arr) => (
          <React.Fragment key={step.label}>
            <span className={`px-2.5 py-1 rounded-lg font-medium text-[11px] ${step.color}`}>{step.label}</span>
            {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300 shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {workOrders.length === 0 ? (
          <div className="col-span-2 text-center py-20 text-gray-400 text-sm bg-white rounded-2xl border border-gray-200">
            No work orders found in current filter.
          </div>
        ) : (
          workOrders.map((order) => {
            const beforeImg = order.evidence_before_url
              ? (order.evidence_before_url.startsWith('http') ? order.evidence_before_url : `http://127.0.0.1:8000${order.evidence_before_url}`)
              : null;
            const afterImg = order.evidence_after_url
              ? (order.evidence_after_url.startsWith('http') ? order.evidence_after_url : `http://127.0.0.1:8000${order.evidence_after_url}`)
              : null;

            const s = getStatusStyle(order.status);

            return (
              <div key={order.order_id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm card-hover flex flex-col justify-between space-y-4">

                {/* Top */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {order.order_id}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 uppercase tracking-wide">
                        {order.problem_type}
                      </span>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${s.bg} ${s.text} ${s.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} ${order.status === 'IN_PROGRESS' ? 'animate-pulse' : ''}`}></span>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 mb-3">{order.title}</h3>

                  {/* Location + Zone */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 block uppercase font-semibold mb-0.5">Location</span>
                      <span className="text-xs font-semibold text-gray-800 block truncate">{order.location_name}</span>
                      <span className="text-[10px] text-blue-500 font-mono">
                        {order.latitude?.toFixed(5)}° N, {order.longitude?.toFixed(5)}° E
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-[10px] text-gray-400 block uppercase font-semibold mb-0.5">Assigned Zone</span>
                      <span className="text-xs font-semibold text-gray-800 block truncate">{order.assigned_zone}</span>
                      <span className="text-[10px] text-amber-600 font-medium">Target: {order.deadline_date || 'Within 48h'}</span>
                    </div>
                  </div>

                  {/* Evidence */}
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block mb-2">
                      Visual Evidence Comparison
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video">
                        {beforeImg ? (
                          <img src={beforeImg} alt="Before" className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x225/f3f4f6/9ca3af?text=Before+Snapshot"; }} />
                        ) : (
                          <div className="p-3 text-gray-400 text-[10px] text-center h-full flex items-center justify-center">No image</div>
                        )}
                        <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">BEFORE</span>
                      </div>
                      <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 aspect-video">
                        {afterImg ? (
                          <img src={afterImg} alt="After" className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x225/f3f4f6/9ca3af?text=PWD+Proof"; }} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-[11px] font-medium">
                            Awaiting PWD Proof
                          </div>
                        )}
                        {afterImg && (
                          <span className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">AFTER</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {(order.repair_notes || order.verification_notes) && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-[11px] text-gray-600">
                      {order.repair_notes && (
                        <div><strong className="text-blue-600">Repair Notes:</strong> {order.repair_notes}</div>
                      )}
                      {order.verification_notes && (
                        <div className="mt-1"><strong className="text-emerald-600">Verification:</strong> {order.verification_notes}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-400">
                    Priority: <strong className={order.priority === 'EMERGENCY' ? 'text-red-600' : 'text-amber-600'}>{order.priority}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    {isPWD && order.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleStartWork(order.order_id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all text-xs shadow-sm cursor-pointer"
                      >
                        Start Field Repair
                      </button>
                    )}
                    {isPWD && order.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => { setSelectedOrder(order); setIsProofModalOpen(true); }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-all text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Upload Proof
                      </button>
                    )}
                    {isMunicipal && order.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleVerifyAndClose(order.order_id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-all text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verify & Close
                      </button>
                    )}
                    {order.status === 'VERIFIED_AND_CLOSED' && (
                      <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        Certified & Closed
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* PWD Upload Proof Modal */}
      {isProofModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">

            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Camera className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Upload Completion Proof</h3>
                  <p className="text-xs text-gray-400">{selectedOrder.order_id} — {selectedOrder.title}</p>
                </div>
              </div>
              <button onClick={() => setIsProofModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">Repaired Site Photo URL:</label>
                <input
                  type="text" required value={proofUrl} onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 font-mono text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <span className="block text-gray-500 mb-1.5">Proof Image Preview:</span>
                <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video">
                  <img
                    src={proofUrl.startsWith('http') ? proofUrl : `http://127.0.0.1:8000${proofUrl}`}
                    alt="Proof Preview" className="w-full h-full object-cover"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/600x340/f3f4f6/9ca3af?text=Preview"; }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1.5">PWD Repair & Compaction Notes:</label>
                <textarea rows="3" required value={repairNotes} onChange={(e) => setRepairNotes(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-gray-800 text-xs focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                </textarea>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsProofModalOpen(false)}
                  className="px-4 py-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingProof}
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer text-xs transition-colors">
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmittingProof ? 'Submitting...' : 'Submit Proof & Mark Completed'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
