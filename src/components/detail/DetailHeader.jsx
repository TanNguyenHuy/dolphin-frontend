import React from 'react';
import { ChevronLeft, Download } from 'lucide-react';
import { formatCurrency, getSessionName, AnimatedNumber } from '../../utils';

export default function DetailHeader({
    detailData, handleBack, handleExport, actualStartDate, actualEndDate, 
    isTargetReached, detailProfit, dynamicTarget, progressPercent
}) {
    const calculateDaysDiff = (start, end) => { 
        if (!start || !end) return 0; 
        const d1 = new Date(start); const d2 = new Date(end); 
        if (isNaN(d1) || isNaN(d2)) return 0;
        return Math.max(0, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))); 
    };

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            {/* Thanh công cụ: Nút bấm chuẩn Touch Target >= 44px */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/40 pb-6">
                <button 
                    onClick={handleBack} 
                    className="group h-11 flex items-center gap-2 text-[#1A5B82] hover:text-[#0B3B60] font-bold text-[15px] bg-white/40 hover:bg-white/80 backdrop-blur-md px-5 rounded-full border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
                >
                    <ChevronLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" /> 
                    Trở về
                </button>
                <div className="w-full sm:w-auto">
                    <button 
                        onClick={handleExport} 
                        className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-white/60 to-white/40 hover:from-white/80 hover:to-white/60 text-[#1D1D1F] font-bold rounded-full border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 text-[14px] flex items-center justify-center gap-2 active:scale-95"
                    >
                        <Download size={18} strokeWidth={2.5}/> Xuất Excel báo cáo
                    </button>
                </div>
            </div>

            {/* Thông tin Tổng quan & Thẻ Mục tiêu */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-2 md:px-4">
                <div className="min-w-0 flex-1 space-y-2">
                    <h2 className="text-[32px] md:text-[44px] font-black text-[#1D1D1F] tracking-tight leading-tight drop-shadow-sm break-words">
                        {getSessionName(detailData?.name, actualStartDate, actualEndDate)}
                    </h2>
                    <div className="inline-flex items-center bg-white/50 backdrop-blur-sm border border-white/60 px-4 py-1.5 rounded-full text-[14px] text-gray-700 font-bold tabular-nums shadow-sm">
                        Hoạt động: <span className="text-[#1A5B82] ml-1.5">{calculateDaysDiff(actualStartDate, actualEndDate)} ngày</span>
                    </div>
                </div>
                
                {/* Thẻ Lợi Nhuận Glassmorphism chuẩn */}
                <div className={`relative liquid-glass p-6 rounded-[32px] w-full lg:w-auto min-w-[300px] shrink-0 overflow-hidden transition-all duration-500 border ${isTargetReached ? 'border-[#1DB2A0]/40 shadow-[0_10px_40px_rgba(29,178,160,0.15)]' : 'border-white/60 shadow-lg'}`}>
                    {/* Hiệu ứng chớp sáng khi đạt mục tiêu */}
                    {isTargetReached && <div className="absolute inset-0 bg-gradient-to-tr from-[#1DB2A0]/10 to-transparent animate-pulse-slow"></div>}
                    
                    <div className="relative z-10 text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2 whitespace-nowrap">
                        {isTargetReached ? '🏆 MỤC TIÊU: ĐÃ ĐẠT MỐC' : '📈 MỤC TIÊU LEO RANK'}
                    </div>
                    
                    <div className="relative z-10 flex items-baseline w-full mb-4">
                        <span className={`text-[40px] md:text-[48px] font-black tracking-tighter tabular-nums drop-shadow-sm block leading-none ${parseFloat(detailProfit) >= 0 ? (isTargetReached ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#1DB2A0] to-[#128C7E]' : 'text-[#1DB2A0]') : 'text-[#FF453A]'}`}>
                            <AnimatedNumber value={detailProfit} />
                        </span>
                        <span className="text-[20px] font-bold ml-1.5 opacity-60">đ</span>
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-center w-full mb-2 text-[12px] font-bold text-gray-500">
                            <span>Tiến độ</span>
                            <span className="text-[#1D1D1F]">Đích: {formatCurrency(dynamicTarget)}đ</span>
                        </div>
                        <div className="w-full h-3 bg-gray-200/50 border border-gray-300/30 rounded-full overflow-hidden shadow-inner p-[2px]">
                            <div 
                                className="h-full bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] rounded-full transition-all duration-1000 ease-out relative" 
                                style={{ width: `${progressPercent}%` }}
                            >
                                {/* Tia sáng lướt qua Progress Bar */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}