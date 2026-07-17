import React, { useState } from 'react';
import { ChevronLeft, Download, Check, AlertCircle } from 'lucide-react'; 
import { formatCurrency, getSessionName, AnimatedNumber } from '../../utils';

export default function DetailHeader({
    detailData, handleBack, handleExport, actualStartDate, actualEndDate, 
    isTargetReached, detailProfit, dynamicTarget, progressPercent,
    canEdit, updateSessionField
}) {
    // STATE: Quản lý hộp thoại xác nhận xịn xò
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null });

    const calculateDaysDiff = (start, end) => { 
        if (!start || !end) return 0; 
        const d1 = new Date(start); const d2 = new Date(end); 
        if (isNaN(d1) || isNaN(d2)) return 0;
        return Math.max(0, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))); 
    };

    const handleConfirmAction = () => {
        // action === 'complete' -> true (Chốt sổ) | 'reopen' -> false (Mở lại)
        updateSessionField('is_completed', confirmModal.action === 'complete');
        setConfirmModal({ isOpen: false, action: null });
    };

    return (
        <div className="flex flex-col gap-6 md:gap-8">
            {/* HỘP THOẠI XÁC NHẬN (CUSTOM MODAL PRO MAX) */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Lớp nền mờ */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setConfirmModal({ isOpen: false, action: null })}></div>
                    
                    {/* Nội dung hộp thoại */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-[28px] p-6 md:p-8 w-full max-w-sm relative z-10 animate-scale-up shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-white">
                        <div className="flex flex-col items-center text-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-inner ${confirmModal.action === 'complete' ? 'bg-teal-50 text-teal-500 border border-teal-100' : 'bg-orange-50 text-orange-500 border border-orange-100'}`}>
                                {confirmModal.action === 'complete' ? <Check size={32} strokeWidth={3} /> : <AlertCircle size={32} strokeWidth={3} />}
                            </div>
                            
                            <div>
                                <h3 className="text-[20px] font-black text-[#1D1D1F] mb-2 tracking-tight">
                                    {confirmModal.action === 'complete' ? 'Chốt sổ đợt bán này?' : 'Mở lại đợt bán?'}
                                </h3>
                                <p className="text-[14px] text-gray-500 font-medium px-2">
                                    {confirmModal.action === 'complete' 
                                        ? 'Lợi nhuận của đợt này sẽ được ghi nhận chính thức lên biểu đồ tổng ở Dashboard.' 
                                        : 'Dữ liệu đợt này sẽ tạm thời ẩn khỏi biểu đồ tổng cho đến khi bạn chốt sổ lại.'}
                                </p>
                            </div>
                            
                            <div className="flex w-full gap-3 mt-4">
                                <button 
                                    onClick={() => setConfirmModal({ isOpen: false, action: null })}
                                    className="flex-1 h-12 bg-gray-100 text-gray-600 font-bold rounded-[16px] hover:bg-gray-200 transition-colors active:scale-95"
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    onClick={handleConfirmAction}
                                    className={`flex-1 h-12 text-white font-bold rounded-[16px] shadow-sm hover:opacity-90 transition-all active:scale-95 ${confirmModal.action === 'complete' ? 'bg-gradient-to-r from-[#1DB2A0] to-[#26D0CE] shadow-[0_4px_12px_rgba(29,178,160,0.3)]' : 'bg-gradient-to-r from-orange-500 to-rose-500 shadow-[0_4px_12px_rgba(249,115,22,0.3)]'}`}
                                >
                                    Xác nhận
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Thanh công cụ */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/40 pb-6">
                <button 
                    onClick={handleBack} 
                    className="group h-11 flex items-center gap-2 text-[#1A5B82] hover:text-[#0B3B60] font-bold text-[15px] bg-white/40 hover:bg-white/80 backdrop-blur-md px-5 rounded-full border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
                >
                    <ChevronLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" /> 
                    Trở về
                </button>
                
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                    {/* NÚT KÍCH HOẠT HỘP THOẠI */}
                    {canEdit && (
                        !detailData?.is_completed ? (
                            <button 
                                onClick={() => setConfirmModal({ isOpen: true, action: 'complete' })}
                                className="w-full sm:w-auto h-11 px-6 bg-gradient-to-r from-[#1DB2A0] to-[#26D0CE] text-white font-bold rounded-full shadow-[0_4px_12px_rgba(29,178,160,0.3)] hover:shadow-md transition-all duration-300 text-[14px] flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Check size={18} strokeWidth={3}/> CHỐT SỔ ĐỢT NÀY
                            </button>
                        ) : (
                            <button 
                                onClick={() => setConfirmModal({ isOpen: true, action: 'reopen' })}
                                className="w-full sm:w-auto h-11 px-6 bg-teal-50 text-teal-600 border border-teal-200 font-bold rounded-full shadow-sm hover:bg-teal-100 transition-all duration-300 text-[14px] flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Check size={18} strokeWidth={3}/> ĐÃ CHỐT SỔ
                            </button>
                        )
                    )}

                    {/* Nút Xuất Excel */}
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
                
                {/* Thẻ Lợi Nhuận */}
                <div className={`relative liquid-glass p-6 rounded-[32px] w-full lg:w-auto min-w-[300px] shrink-0 overflow-hidden transition-all duration-500 border ${isTargetReached ? 'border-[#1DB2A0]/40 shadow-[0_10px_40px_rgba(29,178,160,0.15)]' : 'border-white/60 shadow-lg'}`}>
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
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}