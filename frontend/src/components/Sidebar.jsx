import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, HelpCircle, Truck, ClipboardList } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';

export function Sidebar({ activeTab, onTabChange }) {
  const { t } = useLanguage();

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { id: 'inventory', icon: Package, label: t('inventory') },
    { id: 'orders', icon: ClipboardList, label: 'Orders' }, // TODO: Add translation later
    { id: 'shipments', icon: Truck, label: t('shipments') },
    { id: 'reports', icon: BarChart3, label: t('reporting') },
  ];

  return (
    <div className="fixed left-4 top-4 bottom-4 w-64 bg-[#f8fafc] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-50 overflow-hidden border border-slate-100 flex flex-col">

      {/* Header / Logo Area */}
      <div className="h-24 flex items-center shrink-0 pl-6">
        <div className="w-16 h-16 flex items-center justify-center shrink-0">
          <img
            src="/logo.png"
            alt="Saaman Logo"
            className="w-full h-full object-contain mix-blend-multiply opacity-90"
          />
        </div>
        <div className="ml-1">
          <h1 className="font-bold text-2xl text-slate-900 tracking-tight leading-none">
            {t('appName')}
          </h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">Predictive System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center h-14 rounded-[24px] transition-all relative group overflow-hidden ${isActive
                ? 'bg-white text-slate-900 shadow-sm border border-slate-100/50'
                : 'text-slate-500 hover:bg-white/50 hover:text-slate-900'
                }`}
            >
              <div className="w-14 h-14 flex items-center justify-center shrink-0">
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'} />
              </div>

              <span className={`text-base font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-900'}`}>
                {item.label}
              </span>

              {/* Active Indicator (Pill Shape) */}
              {/* Active Indicator (Pill Shape) - REMOVED */}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-5 shrink-0 space-y-3 mb-2">
        {/* Language Selector */}
        <LanguageSelector />


      </div>

    </div>
  );
}
