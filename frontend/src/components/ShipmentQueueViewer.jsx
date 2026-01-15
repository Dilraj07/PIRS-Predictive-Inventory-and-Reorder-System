import React, { useState, useEffect } from 'react';
import { Package, Truck, AlertTriangle, CheckCircle, Clock, Zap, MapPin, XCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

export function ShipmentQueueViewer() {
  const [data, setData] = useState({ priority_queue: [], pick_list: [], blocked_orders: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/shipping/dashboard');
      setData(response.data);
      setError(null); // Clear error on success
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch shipping data", err);
      setError("Failed to connect to backend server. Please ensure the API is running (uvicorn api:app).");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading Triage Board...</div>;

  if (error) return (
    <div className="flex flex-col items-center justify-center h-screen p-8 text-center text-rose-500 bg-rose-50/50">
      <AlertCircle size={48} className="mb-4 text-rose-400" />
      <h3 className="text-xl font-bold text-rose-700">Connection Error</h3>
      <p className="max-w-md mt-2 text-rose-600">{error}</p>
      <button
        onClick={() => { setLoading(true); fetchData(); }}
        className="mt-6 px-6 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 font-bold transition-colors"
      >
        Retry Connection
      </button>
    </div>
  );

  // Filter Categories
  const expressLane = data.priority_queue.filter(order => order.days_remaining < 7 && order.stock_available);
  const shortageAlert = data.priority_queue.filter(order => !order.stock_available);
  const standardQueue = data.priority_queue.filter(order => order.days_remaining >= 7 && order.stock_available);

  // Action Handlers
  const handleDispatch = async (orderId) => {
    try {
      await axios.post(`http://127.0.0.1:8000/api/orders/${orderId}/dispatch`);
      // Refresh data immediately
      fetchData();
    } catch (err) {
      alert("Failed to dispatch: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="p-6 space-y-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Truck className="text-sky-500" /> Shipment Triage Board
          </h2>
          <p className="text-slate-500 text-sm">Scenario-Based Workflow: Express vs Shortage vs Standard</p>
        </div>
        <div className="flex gap-4">
          {/* Add aggregated stats here if needed */}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">

        {/* Zone 1: Express Lane (High Priority & Ready) */}
        <div className="col-span-12 lg:col-span-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-emerald-100 bg-emerald-100/50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-emerald-800 flex items-center gap-2">
              <Zap size={18} fill="currentColor" /> Express Lane
            </h3>
            <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
              {expressLane.length} Ready
            </span>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {expressLane.map(order => (
              <div key={order.order_id} className="bg-white p-4 rounded-xl border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-800 text-lg">{order.order_id}</span>
                  {order.tier > 1 && <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">VIP</span>}
                </div>
                <div className="text-sm font-medium text-slate-700 mb-1">{order.item_name}</div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-rose-600 font-bold text-xs flex items-center gap-1">
                    <Clock size={12} /> Due in {order.days_remaining}d
                  </span>
                  <span className="text-emerald-600 font-bold text-xs flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                    <CheckCircle size={12} /> Stock Reserved ({order.qty}/{order.qty})
                  </span>
                </div>
                <button
                  onClick={() => handleDispatch(order.order_id)}
                  className="w-full mt-4 bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-emerald-200 shadow-lg text-sm active:scale-95 transform"
                >
                  DISPATCH NOW
                </button>
              </div>
            ))}
            {expressLane.length === 0 && <div className="text-center text-slate-400 italic text-sm mt-10">No urgent orders ready.</div>}
          </div>
        </div>

        {/* Zone 2: Shortage Alert (Problem Orders) */}
        <div className="col-span-12 lg:col-span-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-amber-100 bg-amber-100/50 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-amber-800 flex items-center gap-2">
              <AlertTriangle size={18} fill="currentColor" /> Shortage Alert
            </h3>
            <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
              {shortageAlert.length} Blocked
            </span>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {shortageAlert.map(order => (
              <div key={order.order_id} className="bg-white p-4 rounded-xl border-l-4 border-amber-500 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-800">{order.order_id}</span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                    Shortage
                  </span>
                </div>
                <div className="text-sm text-slate-600 mb-3">{order.item_name}</div>

                {/* Stock Gap Visual */}
                <div className="bg-slate-100 rounded-lg p-2 mb-3">
                  <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                    <span>Stock: {order.current_stock}</span>
                    <span className="text-rose-600">Missing: {order.qty - order.current_stock}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full"
                      style={{ width: `${(order.current_stock / order.qty) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-white border border-slate-200 text-slate-600 font-bold py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors">
                    Wait
                  </button>
                  <button className="bg-amber-100 text-amber-800 font-bold py-1.5 rounded-lg text-xs hover:bg-amber-200 transition-colors border border-amber-200">
                    Ship Partial ({order.current_stock})
                  </button>
                </div>
              </div>
            ))}
            {shortageAlert.length === 0 && <div className="text-center text-slate-400 italic text-sm mt-10">No stock shortages!</div>}
          </div>
        </div>

        {/* Zone 3: Standard Queue */}
        <div className="col-span-12 lg:col-span-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-100 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-slate-700 flex items-center gap-2">
              <Clock size={18} /> Standard Queue
            </h3>
            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
              {standardQueue.length} Pending
            </span>
          </div>
          <div className="p-4 space-y-2 overflow-y-auto flex-1">
            {standardQueue.map(order => (
              <div key={order.order_id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center opacity-80 hover:opacity-100 transition-opacity">
                <div>
                  <div className="font-bold text-slate-700 text-sm">{order.order_id}</div>
                  <div className="text-xs text-slate-500">{order.item_name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-slate-400">Qty: {order.qty}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">Ready</div>
                </div>
              </div>
            ))}
            {standardQueue.length === 0 && <div className="text-center text-slate-400 italic text-sm mt-10">Queue is empty.</div>}
          </div>
        </div>

      </div>
    </div>
  );
}
