import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sidebar } from './components/Sidebar';
import { Card } from './components/Card';
import { InventoryTable } from './components/InventoryTable';
import { ShipmentQueueViewer } from './components/ShipmentQueueViewer';
import { OrdersTable } from './components/OrdersTable';
import { Modal } from './components/Modal';
import { AddProductForm } from './components/AddProductForm';
import { ArchitectureView } from './components/ArchitectureView';
import GetStarted from './pages/GetStarted';
import { AlertCircle, CheckCircle2, TrendingUp, Package, RefreshCw, ShoppingCart, Plus, Search, Info } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';

import { AnimatePresence, motion } from 'framer-motion';

// ... (imports remain)


// Configure Axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
});

function App() {
  const { t } = useLanguage();
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [priority, setPriority] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [sumRes, priRes, invRes, audRes, ordRes] = await Promise.all([
        api.get('/dashboard/summary'),
        api.get('/priority/top'),
        api.get('/inventory/stability'),
        api.get('/audit/next'),
        api.get('/orders/history') // Assuming this endpoint exists now or use empty
      ]);

      setSummary(sumRes.data);
      setPriority(priRes.data);
      setInventory(invRes.data);
      setAudit(audRes.data.audit_sequence);
      setOrders(ordRes.data); // Mocked or real
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data", error);
      // Even if data fails, we might want to stop loading to show UI
      setLoading(false);
    }
  };

  useEffect(() => {
    // Start fetching data immediately
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleProductAdded = () => {
    setIsModalOpen(false);
    fetchData();
  };

  // Custom Loading Screen only for invalid initial state, 
  // but since we have Intro, we can load data BEHIND the intro.
  // We won't block render with "Loading..." text anymore if Intro is up.
  // But for safety:
  if (loading && !showIntro) return <div className="h-screen flex items-center justify-center bg-slate-50 text-slate-400 font-medium">{t('loading')}</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{t('inventoryManagement')}</h2>
                <p className="text-slate-500 text-sm">{t('sortedByStability')}</p>
              </div>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 shadow-sm transition-all">
                <Plus size={16} /> {t('addProduct')}
              </button>
            </div>
            <Card title={t('rawDataView')}>
              <InventoryTable data={inventory} onUpdate={fetchData} />
            </Card>
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Customer Orders</h2>
                <p className="text-slate-500 text-sm">Real-time Order History</p>
              </div>
            </div>
            <Card title={null}>
              <OrdersTable data={orders} />
            </Card>
          </div>
        );
      case 'shipments':
        return (
          <div className="space-y-6">
            <ShipmentQueueViewer />
          </div>
        );
      case 'reports':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{t('systemReports')}</h2>
              <p className="text-slate-500 text-sm">{t('auditSchedules')}</p>
            </div>
            <Card title={t('auditRotation')}>
              <div className="relative pl-6 border-l-2 border-slate-100 space-y-6 my-2">
                {audit.slice(0, 5).map((sku, i) => (
                  <div key={i} className="relative">
                    <span className={`absolute -left-[29px] w-4 h-4 rounded-full border-2 border-white box-content ${i === 0 ? 'bg-sky-500 ring-4 ring-sky-50' : 'bg-slate-200'}`}></span>
                    <p className={`text-sm ${i === 0 ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>{t('auditShelf')}: <span className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded ml-1">{sku}</span></p>
                    {i === 0 && <p className="text-xs text-sky-600 mt-1 font-medium bg-sky-50 inline-block px-2 py-0.5 rounded-full">{t('pendingInspection')}</p>}
                  </div>
                ))}
              </div>
            </Card>
            <ArchitectureView />
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-8">
            {/* Dashboard Hero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Priority Alert (Min-Heap Visualization) */}
              {/* Priority Alert (Min-Heap Visualization) */}
              <div className={`md:col-span-2 relative overflow-hidden p-6 rounded-[2rem] shadow-sm border transition-all ${priority?.days_remaining < 7 ? 'bg-rose-50/80 border-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.15)] backdrop-blur-md' : 'bg-white border-slate-200'
                } flex items-center justify-between group`}>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${priority?.days_remaining < 7 ? 'bg-white text-rose-600 border border-rose-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                      {priority?.days_remaining < 7 ? <AlertCircle size={12} /> : <CheckCircle2 size={12} />}
                      {priority?.days_remaining < 7 ? t('priorityHeapRoot') : t('systemHealthy')}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-1">{priority?.name || "Unknown Product"}</h2>
                  <p className="text-slate-500 text-sm">{t('forecastedStockout')}: <strong className={priority?.days_remaining < 7 ? "text-rose-600" : "text-slate-700"}>{Math.round(priority?.days_remaining)} {t('daysRemaining')}</strong></p>
                </div>
                <div className={`text-right px-6 py-4 rounded-2xl border ${priority?.days_remaining < 7 ? 'bg-white/80 border-rose-100' : 'bg-slate-50 border-slate-100'}`}>
                  <span className="block text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">{t('stock')}</span>
                  <span className="text-4xl font-bold text-slate-900 tracking-tight">{priority?.current_stock}</span>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="space-y-4">
                <Card className="flex-row items-center gap-4 py-4" title={null} action={null}>
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 mb-auto">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('skusTracked')}</p>
                    <p className="text-xl font-bold text-slate-900 mt-0.5">{summary?.total_sku_count}</p>
                  </div>
                </Card>
                <Card className="flex-row items-center gap-4 py-4" title={null} action={null}>
                  <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 mb-auto">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('criticalAlerts')}</p>
                    <p className="text-xl font-bold text-slate-900 mt-0.5">{summary?.critical_stock_alert}</p>
                  </div>
                </Card>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-sky-50 border border-sky-100 rounded-xl p-6 flex gap-4">
              <Info className="text-sky-600 shrink-0" size={24} />
              <div>
                <h3 className="text-sky-900 font-bold mb-1">{t('systemArchitecture')}</h3>
                <p className="text-sky-800/80 text-sm leading-relaxed">
                  {t('systemArchitectureDesc')}
                </p>
              </div>
            </div>
            <div className="flex justify-between items-center mt-8 mb-4">
              <h3 className="text-xl font-bold text-slate-900">{t('quickInventoryManagement')}</h3>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-700 shadow-sm transition-all">
                <Plus size={16} /> {t('addProduct')}
              </button>
            </div>

            {/* Quick Inventory Table */}
            <Card title={t('recentInventoryItems')}>
              <div className="max-h-96 overflow-y-auto">
                <InventoryTable data={inventory} onUpdate={fetchData} />
              </div>
            </Card>

          </div>

        );
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden font-sans bg-[#F1F5F9]">
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            initial={{ y: 0 }}
            exit={{ y: '-100vh', transition: { duration: 0.8, ease: "easeInOut" } }}
            className="fixed inset-0 z-[100] bg-white"
          >
            <GetStarted onStart={() => setShowIntro(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex bg-[#F1F5F9] min-h-screen">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="ml-72 flex-1 p-8 overflow-y-auto h-screen">
          <header className="flex justify-between items-center mb-8">
            {/* Dynamic Header based on active tab could go here, but kept simple for now */}
          </header>

          {renderContent()}

          {/* Modal */}
          <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addNewProduct')}>
            <AddProductForm onSuccess={handleProductAdded} onCancel={() => setIsModalOpen(false)} />
          </Modal>

        </main>
      </div>
    </div>
  );
}

export default App;
