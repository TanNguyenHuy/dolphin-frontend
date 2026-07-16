import React from 'react';
import { Package, Percent, AlertCircle, TrendingUp, Layers } from 'lucide-react';
import { formatCurrency, formatInput } from '../../utils';

export default function DashboardStats({ globalTongCon, globalTongNhap, globalVonTon, displayRevenueTr, taxAmount, totalRevenueForTax }) {
    const taxThreshold = 500000000; // 500 triệu
    const taxPercent = Math.min((totalRevenueForTax / taxThreshold) * 100, 100);
    const isWarning = taxPercent > 80;

    return (
        <div className="flex flex-col gap-6 md:gap-8 h-full">
            {/* Chèn một chút CSS xịn xò cho hiệu ứng ánh sáng lướt */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(200%); }
                }
                .animate-shimmer {
                    animation: shimmer 2.5s infinite;
                }
            `}</style>

            {/* CARD 1: KHO & VỐN (Xanh Dương Sâu Thẳm) */}
            <div className="relative overflow-hidden rounded-[36px] p-8 md:p-10 bg-gradient-to-br from-[#F0F9FF] to-[#E3F2FD] border border-[#BBDEFB] shadow-[0_20px_50px_rgba(33,150,243,0.12)] group hover:shadow-[0_20px_50px_rgba(33,150,243,0.22)] hover:-translate-y-1 transition-all duration-500 min-h-[260px] flex flex-col justify-between">
                {/* Logo chìm */}
                <div className="absolute -right-6 -bottom-6 opacity-[0.04] group-hover:scale-110 group-hover:opacity-[0.07] transition-all duration-700 pointer-events-none text-[#1976D2]">
                    <Layers size={220} strokeWidth={1} />
                </div>
                
                <div className="relative z-10 flex justify-between items-start mb-6">
                    <h3 className="text-[13px] md:text-[15px] font-black text-[#1565C0] uppercase tracking-widest flex items-center gap-2.5 bg-blue-500/10 px-4 py-2.5 rounded-full border border-blue-500/20">
                        <Package size={18} strokeWidth={2.5} /> KHO & VỐN
                    </h3>
                    <div className="text-[12px] md:text-[14px] font-bold text-[#1976D2] bg-white/70 px-4 py-2 rounded-[14px] shadow-sm border border-blue-100 backdrop-blur-sm">
                        {formatInput(globalTongCon)} / {formatInput(globalTongNhap)} <span className="text-gray-500 font-medium ml-1">món</span>
                    </div>
                </div>

                <div className="relative z-10 mt-auto">
                    <div className="text-[14px] md:text-[16px] font-bold text-gray-500 mb-2">Tổng vốn tồn kho:</div>
                    <div className="text-[44px] md:text-[56px] font-black tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#0D47A1] to-[#1976D2] leading-none drop-shadow-sm">
                        {formatCurrency(globalVonTon)}<span className="text-[22px] md:text-[26px] text-[#1976D2]/60 ml-2 font-bold">đ</span>
                    </div>
                </div>
            </div>

            {/* CARD 2: ƯỚC TÍNH THUẾ (Đỏ/Hồng Nổi Bật) */}
            <div className="relative overflow-hidden rounded-[36px] p-8 md:p-10 bg-gradient-to-br from-[#FFF5F5] to-[#FFE4E6] border border-[#FECDD3] shadow-[0_20px_50px_rgba(225,29,72,0.1)] group hover:shadow-[0_20px_50px_rgba(225,29,72,0.2)] hover:-translate-y-1 transition-all duration-500 min-h-[260px] flex flex-col justify-between">
                {/* Logo chìm */}
                <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.06] transition-all duration-700 pointer-events-none text-[#E11D48]">
                    <Percent size={250} strokeWidth={1} />
                </div>

                <div className="relative z-10 flex justify-between items-start mb-6">
                    <h3 className="text-[13px] md:text-[15px] font-black text-[#E11D48] uppercase tracking-widest flex items-center gap-2.5 bg-rose-500/10 px-4 py-2.5 rounded-full border border-rose-500/20">
                        <AlertCircle size={18} strokeWidth={2.5} /> ƯỚC TÍNH THUẾ
                    </h3>
                    <div className="text-[12px] md:text-[14px] font-bold text-[#BE123C] bg-white/70 px-4 py-2 rounded-[14px] shadow-sm border border-rose-100 backdrop-blur-sm flex items-center gap-1.5">
                        <TrendingUp size={14} /> {displayRevenueTr} / 500Tr
                    </div>
                </div>

                <div className="relative z-10 mt-auto space-y-6">
                    <div>
                        <div className="text-[44px] md:text-[56px] font-black tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#BE123C] to-[#E11D48] leading-none drop-shadow-sm">
                            {formatCurrency(taxAmount)}<span className="text-[22px] md:text-[26px] text-[#E11D48]/60 ml-2 font-bold">đ</span>
                        </div>
                    </div>
                    
                    {/* Thanh Tiến Độ (Progress Bar) Siêu Mượt */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between text-[13px] md:text-[14px] font-bold text-gray-500">
                            <span>Tiến độ hạn mức (1.5%)</span>
                            <span className={isWarning ? 'text-[#E11D48] animate-pulse font-black' : 'text-gray-600 font-black'}>
                                {taxPercent.toFixed(1)}%
                            </span>
                        </div>
                        <div className="h-5 md:h-6 bg-white/60 rounded-full overflow-hidden border border-rose-200 shadow-inner p-[3px]">
                            <div 
                                className={`h-full rounded-full shadow-sm relative overflow-hidden transition-all duration-1000 ease-out ${isWarning ? 'bg-gradient-to-r from-[#FB7185] to-[#E11D48]' : 'bg-gradient-to-r from-[#FDA4AF] to-[#FB7185]'}`}
                                style={{ width: `${taxPercent}%` }}
                            >
                                {/* Ánh sáng chạy lướt qua */}
                                <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}