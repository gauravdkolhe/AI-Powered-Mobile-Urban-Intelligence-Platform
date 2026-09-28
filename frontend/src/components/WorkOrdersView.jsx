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
  Filter,
  Eye
} from 'lucide-react';
import { fetchWorkOrders, updateWorkOrderStatus, uploadWorkOrderProof } from '../services/api';
import { useAuth } from '../context/AuthContext';

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
      // If PWD, filter to PWD assigned
      if (isPWD) filters.assigned_department = 'PWD';

      const data = await fetchWorkOrders(filters);
      setWorkOrders(data);
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, currentRole]);

  const handleStartWork = async (orderId) => {
    try {
      await updateWorkOrderStatus(orderId, {
        status: 'IN_PROGRESS',
        repair_notes: 'PWD repair crew deployed on site.'
      });
      loadOrders();
    } catch (err) {
      alert('Error starting work: ' + err.message);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setIsSubmittingProof(true);
    try {
      await uploadWorkOrderProof(selectedOrder.order_id, {
        evidence_after_url: proofUrl,
        repair_notes: repairNotes
      });
      setIsProofModalOpen(false);
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      alert('Error submitting proof: ' + err.message);
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const handleVerifyAndClose = async (orderId) => {
    try {
      await updateWorkOrderStatus(orderId, {
        status: 'VERIFIED_AND_CLOSED',
        verification_notes: `Field repair inspection approved by ${currentUser?.name || 'Municipal Officer'}. Quality check passed.`
      });
      loadOrders();
    } catch (err) {
      alert('Error closing work order: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'IN_PROGRESS':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse';
      case 'COMPLETED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'VERIFIED_AND_CLOSED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="bg-[#131b26] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Briefcase className="w-6 h-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {isPWD ? 'PWD Assigned Maintenance Works' : 'Municipal Work Order Governance'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-900 text-cyan-400 border border-slate-700">
                  {isPWD ? 'Execution Mode' : 'Oversight & Verification Mode'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {isPWD
                  ? 'Active work orders assigned to PWD for road defect patching, drainage de-silting, and field repairs.'
                  : 'Municipal Corporation command hub for assigning civic road defect orders to PWD and verifying completion.'}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Work Orders</option>
            <option value="ASSIGNED">Assigned (Pending PWD)</option>
            <option value="IN_PROGRESS">In Progress (Field Work)</option>
            <option value="COMPLETED">Completed (Awaiting Sign-off)</option>
            <option value="VERIFIED_AND_CLOSED">Verified &amp; Closed</option>
          </select>

          <button
            onClick={loadOrders}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-all cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Lifecycle Flow Ribbon */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2 font-mono">
        <span className="text-slate-400 font-sans font-semibold">Standard Lifecycle:</span>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">1. AI Detected</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">2. Municipal Verified</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800">3. PWD Assigned</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800">4. In Progress</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800">5. Completed + Proof</span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 font-bold">6. Verified &amp; Closed</span>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {workOrders.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-slate-500 text-xs">
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

            return (
              <div
                key={order.order_id}
                className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800/60">
                        {order.order_id}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase bg-slate-800 text-slate-300 font-mono">
                        {order.problem_type}
                      </span>
                    </div>

                    <span className={`text-[11px] font-bold font-mono px-2.5 py-0.5 rounded border ${getStatusBadge(order.status)}`}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white mb-1.5">{order.title}</h3>

                  {/* Location & Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 mb-3 font-sans">
                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Location</span>
                      <span className="font-semibold text-slate-200 block truncate">{order.location_name}</span>
                      <span className="text-[10px] text-cyan-300 font-mono">
                        {order.latitude?.toFixed(6)}° N, {order.longitude?.toFixed(6)}° E
                      </span>
                    </div>

                    <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Assigned Zone</span>
                      <span className="font-semibold text-slate-200 block truncate">{order.assigned_zone}</span>
                      <span className="text-[10px] text-amber-400 font-mono">Target: {order.deadline_date || 'Within 48h'}</span>
                    </div>
                  </div>

                  {/* Visual Evidence Showcase: Before vs After */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                      Visual Evidence Comparison:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      
                      {/* Before Snapshot */}
                      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex flex-col justify-end">
                        {beforeImg ? (
                          <img
                            src={beforeImg}
                            alt="Before repair"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/400x225/1e293b/ffffff?text=AI+Before+Snapshot";
                            }}
                          />
                        ) : (
                          <div className="p-3 text-slate-500 text-[10px] text-center">No image</div>
                        )}
                        <span className="absolute top-1 left-1 bg-red-900/80 text-red-200 text-[9px] font-mono px-1.5 py-0.5 rounded">
                          BEFORE (AI Detected)
                        </span>
                      </div>

                      {/* After Snapshot */}
                      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex flex-col justify-end">
                        {afterImg ? (
                          <img
                            src={afterImg}
                            alt="After repair"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://placehold.co/400x225/1e293b/ffffff?text=PWD+Completion+Proof";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-[11px] bg-slate-950 font-mono">
                            [Awaiting PWD Proof]
                          </div>
                        )}
                        {afterImg && (
                          <span className="absolute top-1 left-1 bg-emerald-900/80 text-emerald-200 text-[9px] font-mono px-1.5 py-0.5 rounded">
                            AFTER (PWD Proof)
                          </span>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Notes snippet */}
                  {(order.repair_notes || order.verification_notes) && (
                    <div className="mt-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300">
                      {order.repair_notes && (
                        <div><strong className="text-cyan-400">Repair Notes:</strong> {order.repair_notes}</div>
                      )}
                      {order.verification_notes && (
                        <div className="mt-1"><strong className="text-emerald-400">Verification:</strong> {order.verification_notes}</div>
                      )}
                    </div>
                  )}

                </div>

                {/* Role-Specific Action Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Priority: <strong className={order.priority === 'EMERGENCY' ? 'text-red-400' : 'text-amber-400'}>{order.priority}</strong>
                  </span>

                  <div className="flex items-center space-x-2">
                    
                    {/* PWD Actions */}
                    {isPWD && order.status === 'ASSIGNED' && (
                      <button
                        onClick={() => handleStartWork(order.order_id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all cursor-pointer text-xs flex items-center gap-1"
                      >
                        Start Field Repair
                      </button>
                    )}

                    {isPWD && order.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsProofModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-md transition-all cursor-pointer text-xs flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Upload Completion Proof
                      </button>
                    )}

                    {/* Municipal Actions */}
                    {isMunicipal && order.status === 'COMPLETED' && (
                      <button
                        onClick={() => handleVerifyAndClose(order.order_id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg shadow-md transition-all cursor-pointer text-xs flex items-center gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verify Proof &amp; Close
                      </button>
                    )}

                    {order.status === 'VERIFIED_AND_CLOSED' && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-4 h-4" />
                        Work Certified &amp; Closed
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#111827] border border-emerald-600/50 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Camera className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Upload Completion Proof</h3>
                  <p className="text-xs text-slate-400">{selectedOrder.order_id} — {selectedOrder.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsProofModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitProof} className="p-6 space-y-4 text-xs">
              
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Repaired Site Photo URL:
                </label>
                <input
                  type="text"
                  required
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Preloaded with PWD post-repair compaction verified snapshot.
                </span>
              </div>

              {/* Photo Preview */}
              <div>
                <span className="block text-slate-400 mb-1">Proof Image Preview:</span>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-black aspect-video flex items-center justify-center">
                  <img
                    src={proofUrl.startsWith('http') ? proofUrl : `http://127.0.0.1:8000${proofUrl}`}
                    alt="Proof Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/600x340/1e293b/ffffff?text=Preview+Image";
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  PWD Repair &amp; Compaction Certification Notes:
                </label>
                <textarea
                  rows="3"
                  required
                  value={repairNotes}
                  onChange={(e) => setRepairNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProofModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProof}
                  className="px-5 py-2 font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                >
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
