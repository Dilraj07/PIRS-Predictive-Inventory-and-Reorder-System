import React from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function TrolleyAnimation({ currentOrder }) {
    const { t } = useLanguage();

    if (!currentOrder) return null;

    return (
        <div className="relative bg-gradient-to-r from-sky-50 to-indigo-50 rounded-2xl p-8 mb-6 overflow-hidden border border-sky-100">
            {/* Title */}
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{t('liveShipmentProcessing')}</h3>
                <p className="text-sm text-slate-500">{t('visualizingFifo')}</p>
            </div>

            {/* Zones */}
            <div className="relative h-32 mb-4">
                {/* Zone Labels */}
                <div className="absolute top-0 left-0 right-0 flex justify-between px-4 mb-2">
                    <div className="text-center">
                        <div className="w-24 h-24 bg-white rounded-xl border-2 border-emerald-200 flex items-center justify-center mb-2 shadow-sm">
                            <Package className="text-emerald-600" size={32} />
                        </div>
                        <p className="text-xs font-bold text-emerald-700">{t('warehouse')}</p>
                    </div>
                    <div className="text-center">
                        <div className="w-24 h-24 bg-white rounded-xl border-2 border-amber-200 flex items-center justify-center mb-2 shadow-sm">
                            <Package className="text-amber-600" size={32} />
                        </div>
                        <p className="text-xs font-bold text-amber-700">{t('packing')}</p>
                    </div>
                    <div className="text-center">
                        <div className="w-24 h-24 bg-white rounded-xl border-2 border-sky-200 flex items-center justify-center mb-2 shadow-sm">
                            <Package className="text-sky-600" size={32} />
                        </div>
                        <p className="text-xs font-bold text-sky-700">{t('dispatch')}</p>
                    </div>
                </div>

                {/* Animated Trolley */}
                <div className="absolute top-8 left-0 w-full">
                    <div className="trolley-container">
                        <div className="bg-white rounded-xl shadow-lg border-2 border-indigo-300 p-3 inline-flex items-center gap-3 relative">
                            {/* Trolley Icon */}
                            <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md">
                                <ShoppingCart size={24} />
                            </div>
                            {/* Order Info */}
                            <div className="pr-2">
                                <p className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                                    {currentOrder.customer}
                                </p>
                                <p className="text-[10px] text-slate-500 font-mono">
                                    #{currentOrder.order_id}
                                </p>
                            </div>
                            {/* Wheels */}
                            <div className="absolute -bottom-2 left-4 flex gap-8">
                                <div className="w-3 h-3 bg-slate-700 rounded-full border-2 border-white shadow-sm"></div>
                                <div className="w-3 h-3 bg-slate-700 rounded-full border-2 border-white shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Track/Path */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 rounded-full">
                    <div className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-sky-400 rounded-full animate-pulse"></div>
                </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-500 mb-1">{t('currentlyProcessing')}</p>
                        <p className="font-bold text-slate-900">{currentOrder.item}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">{t('orderId')}</p>
                        <p className="font-mono text-sm font-bold text-indigo-600">#{currentOrder.order_id}</p>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style jsx>{`
        @keyframes trolleyMove {
          0% {
            transform: translateX(0);
          }
          33% {
            transform: translateX(calc(50% - 100px));
          }
          66% {
            transform: translateX(calc(100% - 200px));
          }
          100% {
            transform: translateX(0);
          }
        }

        .trolley-container {
          animation: trolleyMove 6s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>
        </div>
    );
}
