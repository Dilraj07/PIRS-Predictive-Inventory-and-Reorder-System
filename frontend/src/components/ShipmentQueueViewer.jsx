import React, { useEffect, useState } from 'react';
import { Truck, Package, Clock, ArrowRight, MapPin } from 'lucide-react';
import { Card } from './Card';
import axios from 'axios';
import { TrolleyAnimation } from './TrolleyAnimation';

export function ShipmentQueueViewer() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/shipping/queue');
      setQueue(res.data);
      setLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Outbound Logistics</h2>
          <p className="text-slate-500 text-sm mt-1">Real-time FIFO Processing Queue</p>
        </div>
        <div className="flex items-center gap-2 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-100">
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
          <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">Live Stream</span>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
            <Package size={28} />
          </div>
          <h3 className="text-slate-900 font-semibold mb-1">Logistics Queue Idle</h3>
          <p className="text-slate-500 text-sm max-w-xs mx-auto">Systems operational. Waiting for new order creation signals.</p>
        </div>
      ) : (
        <>
          {/* Trolley Animation */}
          <TrolleyAnimation currentOrder={queue[0]} />

          <div className="relative pl-8 border-l-2 border-slate-200 space-y-8">
            {/* Head of Queue (Active) */}
            <div className="relative">
              <div className="absolute -left-[41px] top-4 w-6 h-6 rounded-full bg-sky-500 border-4 border-white shadow-lg shadow-sky-500/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>

              <div className="bg-white rounded-xl border border-sky-100 shadow-[0_4px_20px_-10px_rgba(14,165,233,0.15)] p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-sky-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm z-10">
                  PROCESSING
                </div>
                {/* Background decoration */}
                <div className="absolute right-0 bottom-0 opacity-5 transform translate-x-4 translate-y-4">
                  <Truck size={100} />
                </div>

                <div className="flex items-start gap-4 relative z-0">
                  <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 border border-sky-100">
                    <Truck size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{queue[0].customer}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                        #{queue[0].order_id}
                      </span>
                      <span className="text-sm text-slate-600 font-medium">{queue[0].item}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 text-xs text-sky-600 font-medium">
                      <MapPin size={12} />
                      <span>Dispatching from Zone A</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Queued Items */}
            {queue.slice(1).map((order, idx) => (
              <div key={idx} className="relative opacity-60 hover:opacity-100 transition-opacity">
                <div className="absolute -left-[37px] top-4 w-4 h-4 rounded-full bg-slate-200 border-2 border-white"></div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-mono text-sm font-bold border border-slate-100">
                    {idx + 2}
                  </div>
                  <div>
                    <p className="text-slate-900 font-semibold text-sm">{order.customer}</p>
                    <p className="text-slate-500 text-xs mt-0.5">#{order.order_id} • {order.item}</p>
                  </div>
                  <div className="ml-auto text-xs text-slate-400 flex items-center gap-1 bg-slate-50 px-2 py-1 rounded">
                    <Clock size={12} />
                    Waiting
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
