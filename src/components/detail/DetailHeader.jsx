import React, { useState } from 'react';
import { ChevronLeft, Download, Check, AlertCircle } from 'lucide-react';
import { getSessionName, AnimatedNumber } from '../../utils';

export default function DetailHeader({
    detailData, handleBack, handleExport, actualStartDate, actualEndDate,
    detailProfit,
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
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/40 pb-6">
                <button
                    onClick={handleBack}
                    className="group h-11 flex items-center gap-2 text-[#1A5B82] hover:text-[#0B3B60] font-bold text-[15px] bg-white/40 hover:bg-white/80 backdrop-blur-md px-5 rounded-full border border-white/60 shadow-sm hover:shadow-md transition-all duration-300 active:scale-95"
                >
                    <ChevronLeft size={20} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
                    Trở về
                </button>

                <div className="min-w-0 sm:flex-1 sm:text-center">
                    <h2 className="break-words text-xl md:text-2xl font-black leading-tight tracking-tight text-[#1D1D1F]">
                        {getSessionName(detailData?.name, actualStartDate, actualEndDate)}
                    </h2>
                    <p className="mt-1 text-xs font-semibold text-slate-600">Hoạt động: {calculateDaysDiff(actualStartDate, actualEndDate)} ngày</p>
                </div>

                <div className="w-full xl:w-auto flex flex-wrap items-center gap-2">
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

            <div className="flex justify-end">
                <section aria-label="Tổng lợi nhuận đợt bán" className="session-profit liquid-glass p-5 rounded-[24px] w-full lg:w-auto border border-white/60 shadow-sm">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tổng lợi nhuận</h3>
                    <div className="flex flex-wrap items-baseline gap-1.5">
                        <strong className={`text-[32px] md:text-[40px] font-black tracking-tight tabular-nums break-words ${detailProfit >= 0 ? 'text-teal-700' : 'text-rose-600'}`}>
                            <AnimatedNumber value={detailProfit} />
                        </strong>
                        <span className="text-sm font-bold text-gray-500">đ</span>
                    </div>
                </section>
            </div>
        </div>
    );
}
