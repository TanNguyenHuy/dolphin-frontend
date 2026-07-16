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
                @keyframes shimmer-fast { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
                .animate-shimmer-fast { animation: shimmer-fast 2s infinite; }
                @keyframes float-box { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                .anim-float { animation: float-box 5s ease-in-out infinite; }
            `}</style>

            {/* CARD 1: KHO & VỐN */}
            <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] p-8 md:p-10 bg-gradient-to-br from-[#F0F9FF] to-[#E3F2FD] border border-[#BBDEFB] shadow-[0_15px_40px_rgba(33,150,243,0.1)] hover:shadow-[0_20px_50px_rgba(33,150,243,0.2)] hover:-translate-y-1 transition-all duration-500 group flex flex-col justify-between min-h-[320px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-300/30 rounded-full blur-[80px] anim-float pointer-events-none"></div>
                <div className="absolute -right-8 -bottom-8 opacity-[0.04] group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-700 pointer-events-none text-[#1976D2]"><Layers size={250} strokeWidth={1} /></div>
                
                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start mb-6 gap-3">
                    <h3 className="text-[15px] md:text-[16px] font-black text-[#1565C0] uppercase tracking-widest flex items-center gap-2.5 bg-blue-500/10 px-5 py-2.5 rounded-full border border-blue-500/20"><Package size={20} strokeWidth={2.5} /> KHO & VỐN</h3>
                    <div className="text-[13px] md:text-[15px] font-bold text-[#1976D2] bg-white/80 px-4 py-2 rounded-[16px] shadow-sm border border-blue-100 backdrop-blur-sm">
                        {formatInput(globalTongCon)} / {formatInput(globalTongNhap)} <span className="text-gray-500 font-medium ml-1">món</span>
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <div className="text-[15px] md:text-[16px] font-bold text-gray-500 mb-2">Tổng vốn tồn kho:</div>
                    <div className="text-[48px] md:text-[56px] font-black tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#0D47A1] to-[#1976D2] leading-none drop-shadow-sm">
                        {formatCurrency(globalVonTon)}<span className="text-[24px] text-[#1976D2]/60 ml-2 font-bold">đ</span>
                    </div>
                </div>
            </div>

            {/* CARD 2: ƯỚC TÍNH THUẾ */}
            <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] p-8 md:p-10 bg-gradient-to-br from-[#FFF5F5] to-[#FFE4E6] border border-[#FECDD3] shadow-[0_15px_40px_rgba(225,29,72,0.1)] hover:shadow-[0_20px_50px_rgba(225,29,72,0.2)] hover:-translate-y-1 transition-all duration-500 group flex flex-col justify-between min-h-[320px]">
                <div className="absolute top-10 left-10 w-64 h-64 bg-rose-300/30 rounded-full blur-[80px] anim-float pointer-events-none" style={{ animationDelay: '1s' }}></div>
                <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700 pointer-events-none text-[#E11D48]"><Percent size={250} strokeWidth={1} /></div>

                <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start mb-6 gap-3">
                    <h3 className="text-[15px] md:text-[16px] font-black text-[#E11D48] uppercase tracking-widest flex items-center gap-2.5 bg-rose-500/10 px-5 py-2.5 rounded-full border border-rose-500/20"><AlertCircle size={20} strokeWidth={2.5} /> ƯỚC TÍNH THUẾ</h3>
                    <div className="text-[13px] md:text-[15px] font-bold text-[#BE123C] bg-white/80 px-4 py-2 rounded-[16px] shadow-sm border border-rose-100 backdrop-blur-sm flex items-center gap-1.5">
                        <TrendingUp size={14} /> {displayRevenueTr} / 500Tr
                    </div>
                </div>

                <div className="relative z-10 mt-auto space-y-6">
                    <div>
                        <div className="text-[48px] md:text-[56px] font-black tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#BE123C] to-[#E11D48] leading-none drop-shadow-sm">
                            {formatCurrency(taxAmount)}<span className="text-[24px] text-[#E11D48]/60 ml-2 font-bold">đ</span>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between text-[14px] md:text-[15px] font-bold text-gray-500">
                            <span>Tiến độ hạn mức (1.5%)</span>
                            <span className={isWarning ? 'text-[#E11D48] animate-pulse font-black' : 'text-gray-700 font-black'}>{taxPercent.toFixed(1)}%</span>
                        </div>
                        <div className="h-5 md:h-6 bg-white/60 rounded-full overflow-hidden border border-rose-200 shadow-inner p-[3px]">
                            <div className={`h-full rounded-full shadow-sm relative overflow-hidden transition-all duration-1000 ease-out ${isWarning ? 'bg-gradient-to-r from-[#FB7185] to-[#E11D48]' : 'bg-gradient-to-r from-[#FDA4AF] to-[#FB7185]'}`} style={{ width: `${taxPercent}%` }}>
                                <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer-fast"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}