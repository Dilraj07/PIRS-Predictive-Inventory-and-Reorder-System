import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, LogOut, HelpCircle, Truck } from 'lucide-react';

export function Sidebar({ activeTab, onTabChange }) {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'inventory', icon: Package, label: 'Inventory' },
    { id: 'shipments', icon: Truck, label: 'Orders' }, // Mapped to Orders
    { id: 'reports', icon: BarChart3, label: 'Reporting' },

  ];

  return (
    <div className="w-64 bg-[#1e293b] text-white h-screen fixed left-0 top-0 flex flex-col font-sans z-50">

      {/* AI Core Animation (Top) */}
      <div className="pt-10 pb-8 flex flex-col items-center">
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Outer Rotating Gradient (The 'Descent') */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_deg,#0ea5e9_180deg,transparent_360deg)] animate-[spin_4s_linear_infinite] opacity-50 blur-md"></div>
          <div className="absolute inset-2 rounded-full bg-[conic-gradient(from_180deg,transparent_0_deg,#6366f1_180deg,transparent_360deg)] animate-[spin_3s_linear_infinite_reverse] opacity-60"></div>

          {/* Inner Core */}
          <div className="absolute inset-3 rounded-full bg-slate-900 z-10 flex items-center justify-center border border-slate-700/50 shadow-inner">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 opacity-20 animate-pulse absolute"></div>
            <div className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8] z-20"></div>
          </div>

          {/* Orbits */}
          <div className="absolute inset-0 rounded-full border border-slate-700/30 animate-[spin_10s_linear_infinite]"></div>
          <div className="absolute inset-4 rounded-full border border-slate-700/30 animate-[spin_8s_linear_infinite_reverse]"></div>
        </div>
        <p className="mt-4 text-[10px] font-mono text-sky-500/80 tracking-[0.2em] uppercase animate-pulse">Optimizing</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 relative">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="relative">
              {/* The clickable button */}
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-4 px-8 py-4 transition-all relative z-10 ${isActive
                  ? 'text-slate-800 bg-[#F1F5F9]' // Active: Matches App background
                  : 'text-slate-400 hover:text-white'
                  }`}
                style={{
                  // Rounded active tab like the image
                  borderTopLeftRadius: isActive ? '30px' : '0',
                  borderBottomLeftRadius: isActive ? '30px' : '0',
                  marginLeft: isActive ? '16px' : '0', // Indent effect
                  width: isActive ? 'calc(100% - 16px)' : '100%',
                }}
              >
                <item.icon size={20} className={isActive ? 'text-sky-600' : 'text-slate-400'} />
                <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </button>

              {/* Curve Hack for Top Corner */}
              {isActive && (
                <div className="absolute right-0 -top-5 w-5 h-5 bg-[#F1F5F9] z-0">
                  <div className="w-full h-full bg-[#1e293b] rounded-br-[20px]"></div>
                </div>
              )}
              {/* Curve Hack for Bottom Corner */}
              {isActive && (
                <div className="absolute right-0 -bottom-5 w-5 h-5 bg-[#F1F5F9] z-0">
                  <div className="w-full h-full bg-[#1e293b] rounded-tr-[20px]"></div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-8">
        <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
