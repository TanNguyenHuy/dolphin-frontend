import React from 'react';
import { Package, Percent, AlertCircle, TrendingUp, Layers } from 'lucide-react';
import { formatCurrency, formatInput } from '../../utils';

export default function DashboardStats({ globalTongCon, globalTongNhap, globalVonTon, displayRevenueTr, taxAmount, totalRevenueForTax }) {
    const taxThreshold = 500000000;
    const taxPercent = Math.min((totalRevenueForTax / taxThreshold) * 100, 100);
    const isWarning = taxPercent > 80;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 w-full">
            <style>{`
                @keyframes shine { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
                .animate-shine { background: linear-gradient(120deg, transparent 20%, rgba(255,255,255,0.6) 50%, transparent 80%); background-size: 200% auto; animation: shine 3s linear infinite; }
            `}</style>

            {/* CARD 1: KHO & VỐN */}
            <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] p-6 md:p-10 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] border border-blue-100 shadow-[0_8px_30px_rgba(33,150,243,0.08)] group hover:shadow-[0_12px_40px_rgba(33,150,243,0.15)] hover:-translate-y-1 transition-all duration-300 min-h-[280px] flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/20 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-105 group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none text-blue-600"><Layers size={220} strokeWidth={1} /></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start mb-6 gap-3">
                    <h3 className="text-[13px] md:text-[14px] font-black text-blue-700 uppercase tracking-widest flex items-center gap-2.5 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20"><Package size={18} strokeWidth={2.5} /> KHO & VỐN</h3>
                    <div className="text-[13px] font-bold text-blue-700 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-xl shadow-sm border border-blue-100">
                        {formatInput(globalTongCon)} / {formatInput(globalTongNhap)} <span className="text-gray-500 font-medium ml-1">món</span>
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <div className="text-[14px] font-semibold text-blue-900/50 mb-1">Tổng vốn tồn kho:</div>
                    <div className="text-[40px] md:text-[48px] font-black tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-cyan-600 leading-none">
                        {formatCurrency(globalVonTon)}<span className="text-[20px] text-blue-600/50 ml-1.5 font-bold">đ</span>
                    </div>
                </div>
            </div>

            {/* CARD 2: ƯỚC TÍNH THUẾ */}
            <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] p-6 md:p-10 bg-gradient-to-br from-[#FFF5F5] to-[#FFE4E6] border border-rose-100 shadow-[0_8px_30px_rgba(225,29,72,0.08)] group hover:shadow-[0_12px_40px_rgba(225,29,72,0.15)] hover:-translate-y-1 transition-all duration-300 min-h-[280px] flex flex-col justify-between">
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-300/20 rounded-full blur-[80px] pointer-events-none"></div>
                <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-105 group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none text-rose-600"><Percent size={220} strokeWidth={1} /></div>

                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start mb-6 gap-3">
                    <h3 className="text-[13px] md:text-[14px] font-black text-rose-700 uppercase tracking-widest flex items-center gap-2.5 bg-rose-500/10 px-4 py-2 rounded-full border border-rose-500/20"><AlertCircle size={18} strokeWidth={2.5} /> ƯỚC TÍNH THUẾ</h3>
                    <div className="text-[13px] font-bold text-rose-700 bg-white/70 backdrop-blur-md px-4 py-1.5 rounded-xl shadow-sm border border-rose-100 flex items-center gap-1.5">
                        <TrendingUp size={14} /> {displayRevenueTr} / 500Tr
                    </div>
                </div>

                <div className="relative z-10 mt-auto space-y-5">
                    <div>
                        <div className="text-[40px] md:text-[48px] font-black tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-pink-500 leading-none">
                            {formatCurrency(taxAmount)}<span className="text-[20px] text-rose-500/50 ml-1.5 font-bold">đ</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2.5">
                        <div className="flex justify-between text-[13px] font-bold text-rose-900/50">
                            <span>Tiến độ hạn mức (1.5%)</span>
                            <span className={isWarning ? 'text-rose-600 animate-pulse font-black' : 'text-rose-700 font-black'}>{taxPercent.toFixed(1)}%</span>
                        </div>
                        <div className="h-4 bg-white/60 rounded-full overflow-hidden border border-rose-200/50 shadow-inner p-[2px]">
                            <div className={`h-full rounded-full shadow-sm relative overflow-hidden transition-all duration-1000 ease-out ${isWarning ? 'bg-gradient-to-r from-rose-400 to-red-600' : 'bg-gradient-to-r from-pink-300 to-rose-400'}`} style={{ width: `${taxPercent}%` }}>
                                <div className="absolute inset-0 animate-shine"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}