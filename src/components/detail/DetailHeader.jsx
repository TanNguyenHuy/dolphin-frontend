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
        <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/60 pb-4">
                <button onClick={handleBack} className="flex items-center gap-1.5 text-[#1A5B82] hover:text-[#0B3B60] transition-colors font-semibold text-[15px] active:opacity-70 bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm">
                    <ChevronLeft size={18} strokeWidth={2.5}/> Trở về
                </button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button onClick={handleExport} className="w-full sm:w-auto px-4 py-2 liquid-glass text-[#1D1D1F] font-semibold rounded-full shadow-sm hover:bg-white/50 transition-all text-[13px] flex items-center justify-center gap-2 active:opacity-70">
                        <Download size={14}/> Xuất Excel
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="min-w-0 flex-1">
                    <h2 className="text-[28px] md:text-[36px] font-black text-[#1D1D1F] tracking-tight leading-tight drop-shadow-sm break-words whitespace-normal">
                        {getSessionName(detailData?.name, actualStartDate, actualEndDate)}
                    </h2>
                    <p className="text-[13px] text-[#5c5c5c] font-medium mt-1 tabular-nums whitespace-nowrap">
                        Thời gian hoạt động: {calculateDaysDiff(actualStartDate, actualEndDate)} ngày
                    </p>
                </div>
                
                <div className="flex flex-col md:items-end liquid-glass p-4 rounded-[20px] w-full md:w-auto min-w-[240px] shrink-0 relative overflow-hidden">
                    {isTargetReached && <div className="absolute inset-0 bg-[#1DB2A0]/10 animate-pulse-slow"></div>}
                    <div className="relative z-10 text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 flex items-center gap-1 whitespace-nowrap">
                        {isTargetReached ? 'MỤC TIÊU: ĐÃ ĐẠT MỐC 🎉' : 'MỤC TIÊU LEO RANK'}
                    </div>
                    <div className="relative z-10 flex items-baseline w-full">
                        <span className={`text-[32px] md:text-[40px] font-black tracking-tight tabular-nums drop-shadow-sm whitespace-nowrap block ${parseFloat(detailProfit) >= 0 ? (isTargetReached ? 'text-[#1DB2A0] drop-shadow-[0_0_10px_rgba(29,178,160,0.5)]' : 'text-[#1DB2A0]') : 'text-[#FF453A]'}`}>
                            <AnimatedNumber value={detailProfit} />
                        </span>
                    </div>
                    <div className="relative z-10 flex justify-between items-center w-full mt-1 mb-1 text-[10px] font-bold text-[#5c5c5c]">
                        <span>Tiến độ</span>
                        <span>Đích: {formatCurrency(dynamicTarget)}đ</span>
                    </div>
                    <div className="relative z-10 w-full md:w-48 h-2 bg-white/40 border border-white/50 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                </div>
            </div>
        </>
    );
}