import React, { useState } from 'react';
import { Search, Edit2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export function OrdersTable({ data }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter logic
  const filteredData = data.filter(order => {
    const matchesSearch =
      (order.order_id && order.order_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.sku && order.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.status && order.status.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'SHIPPED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'BLOCKED': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getTierLabel = (tier) => {
    switch (tier) {
      case 3: return 'PREMIUM';
      case 2: return 'VIP';
      default: return 'STD';
    }
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 3: return 'text-purple-600 bg-purple-50 border-purple-100';
      case 2: return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      default: return 'text-slate-500 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-100 shadow-[0_2px_20px_rgb(0,0,0,0.02)] bg-white">
      <div className="p-4 border-b border-slate-100 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search Orders..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="SHIPPED">Shipped</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>
      <table className="w-full text-sm text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
            <th className="py-4 px-6 font-semibold w-32">Order ID</th>
            <th className="py-4 px-6 font-semibold w-24">Date</th>
            <th className="py-4 px-6 font-semibold">Product</th>
            <th className="py-4 px-6 font-semibold text-center w-20">Tier</th>
            <th className="py-4 px-6 font-semibold text-right w-24">Qty</th>
            <th className="py-4 px-6 font-semibold text-right w-32">Total Price</th>
            <th className="py-4 px-6 font-semibold w-32">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {filteredData.map((order) => (
            <tr key={order.order_id} className="hover:bg-slate-50/80 transition-colors group">
              <td className="py-4 px-6 font-medium text-slate-900">{order.order_id}</td>
              <td className="py-4 px-6 text-slate-500 font-mono text-xs">{order.order_date}</td>
              <td className="py-4 px-6">
                <div className="font-medium text-slate-900">{order.product_name || order.sku}</div>
                <div className="text-xs text-slate-500">{order.sku}</div>
              </td>
              <td className="py-4 px-6 text-center">
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getTierColor(order.customer_tier)}`}>
                  {getTierLabel(order.customer_tier)}
                </span>
              </td>
              <td className="py-4 px-6 text-slate-900 font-bold text-right">{order.qty_requested}</td>
              <td className="py-4 px-6 text-slate-900 font-bold text-right">
                ₹{order.total_amount?.toLocaleString('en-IN') || '0.00'}
              </td>
              <td className="py-4 px-6">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                  {order.status === 'SHIPPED' && <CheckCircle2 size={12} />}
                  {order.status === 'PENDING' && <Clock size={12} />}
                  {order.status === 'BLOCKED' && <AlertCircle size={12} />}
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan="6" className="py-8 text-center text-slate-400 italic">
                No orders found matching "{searchTerm}"
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
