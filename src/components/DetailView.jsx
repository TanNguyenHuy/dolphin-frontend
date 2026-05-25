import React from 'react';
import { ChevronLeft, Download, Box, Package, Plus, X, Crown, Link as LinkIcon, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { formatCurrency, formatInput, formatDateDisplay, getSessionName, AnimatedNumber } from '../utils';

const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    return `${hh}:${mm} ${dd}/${mo}`;
};

export default function DetailView({
    detailData, handleBack, handleExport, actualStartDate, actualEndDate, isTargetReached, detailProfit, 
    dynamicTarget, progressPercent, detailAutoAdCost, canEdit, canDelete, 
    handleAddBale, baleName, setBaleName, baleCost, setBaleCost, baleQty, setBaleQty, 
    importedBales, handleDeleteBale, updateSessionField, handleAddItem, newItem, setNewItem, 
    isProcessingAdd, enrichedDaily, mvpRowId, handleStartEdit, handleDeleteRow, isProcessingEdit, isProcessingDelete,
    handleStartSync
}) {
    const calculateDaysDiff = (start, end) => { 
        if (!start || !end) return 0; 
        const d1 = new Date(start); const d2 = new Date(end); 
        if (isNaN(d1) || isNaN(d2)) return 0;
        return Math.max(0, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))); 
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in-up pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/60 pb-4">
                <button onClick={handleBack} className="flex items-center gap-1.5 text-[#1A5B82] hover:text-[#0B3B60] transition-colors font-semibold text-[15px] active:opacity-70 bg-white/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/40 shadow-sm">
                    <ChevronLeft size={18} strokeWidth={2.5}/> Trở về
                </button>
                <button onClick={handleExport} className="w-full sm:w-auto px-4 py-2 liquid-glass text-[#1D1D1F] font-semibold rounded-full shadow-sm hover:bg-white/50 transition-all text-[13px] flex items-center justify-center gap-2 active:opacity-70">
                    <Download size={14}/> Xuất Excel
                </button>
            </div>

            {/* Thông tin chính */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="min-w-0 flex-1">
                    <h2 className="text-[28px] md:text-[36px] font-black text-[#1D1D1F] tracking-tight leading-tight break-words">{getSessionName(detailData?.name, actualStartDate, actualEndDate)}</h2>
                    <p className="text-[13px] text-[#5c5c5c] font-medium mt-1">Hoạt động: {calculateDaysDiff(actualStartDate, actualEndDate)} ngày</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Cột trái giữ nguyên */}
                <div className="lg:col-span-4 space-y-6">
                    {/* ... (phần vốn giữ nguyên) ... */}
                </div>

                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="liquid-glass rounded-[32px] p-4 md:p-6 shadow-sm border border-white/60">
                        <h2 className="text-[18px] font-bold text-[#1D1D1F] mb-6 px-2">Chi tiết sản phẩm</h2>
                        <div className="flex flex-col gap-4">
                            {(enrichedDaily || []).map((row, index) => {
                                return (
                                    <div key={row.id || index} className={`p-4 rounded-[20px] bg-white/60 border border-white/80 shadow-sm flex flex-col xl:flex-row items-center gap-3 ${row.id === mvpRowId ? 'border-[#FF9500]/40' : ''}`}>
                                        {/* STT & Tên SP */}
                                        <div className="flex items-center gap-3 w-full xl:w-[30%] min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center font-bold text-[12px]">{row.stt}</div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-[#1D1D1F] text-[14px] truncate">{row.ten_san_pham}</h3>
                                                <div className="text-[10px] text-[#5c5c5c]">{formatDateDisplay(row.ngay_ban)}</div>
                                            </div>
                                        </div>

                                        {/* Thời gian cập nhật thu gọn */}
                                        <div className="w-full xl:w-[15%] text-left xl:text-center text-[10px] text-[#1A5B82] font-semibold bg-blue-50 px-2 py-1 rounded">
                                            {formatDateTime(row.updatedAt || row.ngay_ban)}
                                        </div>

                                        {/* Số lượng */}
                                        <div className="flex w-full xl:w-[25%] justify-between xl:justify-center gap-2">
                                            <span className="text-[11px] text-[#5c5c5c]">Nhập: <strong className="text-[#1D1D1F]">{row.sl_nhap}</strong></span>
                                            <span className="text-[11px] text-[#5c5c5c]">Bán: <strong className="text-[#1DB2A0]">{row.so_luong}</strong></span>
                                            <span className="text-[11px] text-[#5c5c5c]">Còn: <strong className="text-[#1D1D1F]">{row.sl_con}</strong></span>
                                        </div>

                                        {/* Lợi nhuận & Nút */}
                                        <div className="flex w-full xl:w-[30%] justify-between items-center">
                                            <div className="text-[14px] font-black text-[#1DB2A0]">{formatCurrency(row.loi)}</div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleStartSync(row)} className="p-2 bg-white rounded-full"><RefreshCw size={14}/></button>
                                                <button onClick={() => handleStartEdit(row)} className="p-2 bg-white rounded-full"><Pencil size={14}/></button>
                                                <button onClick={() => handleDeleteRow(row.id)} className="p-2 bg-white rounded-full text-red-500"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
