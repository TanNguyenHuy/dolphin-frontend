import React from 'react';
import { ChevronLeft, Download, Box, Package, Plus, X, Crown, Link as LinkIcon, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { formatCurrency, formatInput, parseInput, formatDateDisplay, getSessionName, AnimatedNumber } from '../utils';

const formatDateTime = (dateString) => {
    if (!dateString) return 'Chưa rõ';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'Chưa rõ';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${hh}:${mm} - ${dd}/${mo}/${yyyy}`;
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
            {/* Thanh điều hướng */}
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

            {/* Thông tin Tổng quan Đợt bán */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
                <div className="min-w-0 flex-1">
                    <h2 className="text-[28px] md:text-[36px] font-black text-[#1D1D1F] tracking-tight leading-tight drop-shadow-sm break-words whitespace-normal">{getSessionName(detailData?.name, actualStartDate, actualEndDate)}</h2>
                    <p className="text-[13px] text-[#5c5c5c] font-medium mt-1 tabular-nums whitespace-nowrap">Thời gian hoạt động: {calculateDaysDiff(actualStartDate, actualEndDate)} ngày</p>
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

            {/* Khung Vốn & Khung Sản Phẩm */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                
                {/* ---------- CỘT TRÁI: CHI PHÍ VỐN ---------- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="liquid-glass rounded-[32px] overflow-hidden flex flex-col h-full min-w-0 shadow-sm border border-white/60">
                        <div className="px-5 py-4 border-b border-white/40 flex items-center gap-2 bg-white/20"><Box size={18} className="text-[#1A5B82]" /><h3 className="text-[15px] font-bold text-[#1D1D1F] tracking-tight whitespace-nowrap">Chi phí Vốn</h3></div>
                        <div className="p-5 flex-1 flex flex-col space-y-5 min-w-0">
                            <div className="liquid-glass-dark p-5 rounded-[20px] relative overflow-hidden min-w-0">
                                <div className="absolute right-0 top-0 opacity-10"><Package size={80} className="transform translate-x-1/4 -translate-y-1/4" /></div>
                                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest block mb-1 whitespace-nowrap">Tổng Vốn Nhập</span>
                                <div className="font-black text-white text-[28px] md:text-[30px] tabular-nums tracking-tight drop-shadow-sm whitespace-nowrap">{formatCurrency((detailData?.so_tien_cua_kien || 0) + (detailData?.so_tien_giat_ui || 0) + detailAutoAdCost)}<span className="text-[14px] text-white/70 ml-1 font-semibold">đ</span></div>
                            </div>
                            
                            {canEdit && (
                                <form onSubmit={handleAddBale} className="bg-white/40 p-4 rounded-[20px] space-y-3 shadow-sm border border-white/60 backdrop-blur-md">
                                    <input required placeholder="Tên lô hàng..." className="w-full min-w-0 liquid-input rounded-[14px] px-3 py-2.5 text-[14px] font-semibold text-[#1D1D1F] focus:border-[#26D0CE] outline-none transition-all" value={baleName} onChange={e=>setBaleName(e.target.value)} />
                                    <div className="flex gap-2 w-full">
                                        <input required placeholder="Giá (VNĐ)" className="flex-1 min-w-0 liquid-input rounded-[14px] px-3 py-2.5 text-[14px] font-semibold text-[#1D1D1F] text-right focus:border-[#26D0CE] outline-none transition-all tabular-nums" value={formatInput(baleCost)} onChange={e => setBaleCost(e.target.value)} />
                                        <input required placeholder="SL" className="w-[65px] shrink-0 liquid-input rounded-[14px] px-2 py-2.5 text-[14px] font-bold text-[#33A1FD] text-center focus:border-[#26D0CE] outline-none transition-all tabular-nums" value={formatInput(baleQty)} onChange={e => setBaleQty(e.target.value)} />
                                    </div>
                                    <button type="submit" className="w-full min-w-0 bg-white/80 text-[#1A5B82] border border-white shadow-sm py-2.5 rounded-[14px] text-[13px] font-bold hover:bg-white transition-colors active:opacity-70 mt-1 whitespace-nowrap">Thêm Vốn Nhập</button>
                                </form>
                            )}

                            {(importedBales || []).length > 0 && (
                                <div className="space-y-2">
                                    {(importedBales || []).map(b => {
                                        if (!b) return null;
                                        return (
                                        <div key={b.id} className="p-3.5 bg-white/60 hover:bg-white transition-colors border border-white/80 rounded-[20px] flex items-center justify-between group shadow-sm min-w-0">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="text-[13px] font-bold text-[#1D1D1F] truncate">{b.name || ''}</div>
                                                <div className="text-[11px] text-[#5c5c5c] mt-0.5 font-medium truncate">SL: <span className="font-semibold text-[#1D1D1F]">{b.qty || 0}</span> • TB: {formatCurrency((b.cost || 0) / (b.qty || 1))}</div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="font-bold text-[#1D1D1F] text-[14px] tabular-nums whitespace-nowrap">{formatCurrency(b.cost || 0)}</span>
                                                {canDelete && <button type="button" onClick={() => handleDeleteBale(b.id)} className="text-[#8E8E93] hover:text-[#FF3B30] transition-colors bg-white hover:bg-[#FF3B30]/10 p-1.5 rounded-full border border-gray-100 shadow-sm"><X size={12}/></button>}
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            )}

                            <div className="mt-auto space-y-4 pt-4 border-t border-white/50 min-w-0">
                                <div className="min-w-0">
                                    <label className="text-[11px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1.5 block pl-1 whitespace-nowrap">Chi phí Giặt ủi / Khác</label>
                                    <input disabled={!canEdit} className="w-full min-w-0 liquid-input rounded-[16px] px-4 py-3 font-bold text-right text-[#1D1D1F] text-[18px] focus:border-[#33A1FD] outline-none transition-all tabular-nums shadow-sm disabled:opacity-70 disabled:cursor-not-allowed border-white/60 bg-white/50" value={formatInput(detailData?.so_tien_giat_ui || 0)} onFocus={e => e.target.select()} onChange={e => updateSessionField('so_tien_giat_ui', parseInput(e.target.value))} />
                                </div>
                                <div className="bg-white/40 border border-white/60 p-4 rounded-[20px] space-y-2.5 text-[13px] backdrop-blur-md min-w-0 shadow-sm">
                                    <div className="flex justify-between gap-2 text-[#5c5c5c]"><span className="whitespace-nowrap">Tổng Hàng Nhập</span><span className="font-bold text-[#1D1D1F] tabular-nums shrink-0 whitespace-nowrap">{formatInput(detailData?.computed?.tong_sl_nhap || 0)}</span></div>
                                    <div className="flex justify-between gap-2 text-[#5c5c5c]"><span className="whitespace-nowrap">Tổng Đã Bán</span><span className="font-bold text-[#1DB2A0] tabular-nums shrink-0 whitespace-nowrap">{formatInput(detailData?.computed?.tong_sl_ban || 0)}</span></div>
                                    <div className="flex justify-between gap-2 text-[#5c5c5c]"><span className="whitespace-nowrap">Tồn Kho</span><span className="font-bold text-[#1D1D1F] tabular-nums shrink-0 whitespace-nowrap">{formatInput((detailData?.computed?.tong_sl_nhap || 0) - (detailData?.computed?.tong_sl_ban || 0))}</span></div>
                                    <div className="flex justify-between gap-2 text-[#5c5c5c] pt-2.5 border-t border-white/50 mt-1">
                                        <span className="whitespace-nowrap">Quảng cáo (Auto)</span>
                                        <span className="font-bold text-[#1D1D1F] tabular-nums shrink-0 whitespace-nowrap">{formatCurrency(detailAutoAdCost)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ---------- CỘT PHẢI: TẠO MỚI & DANH SÁCH SP ---------- */}
                <div className="lg:col-span-8 flex flex-col h-auto gap-6 md:gap-8 min-w-0">
                    
                    {/* FORM GHI NHẬN GIAO DỊCH (Làm Thẻ rời) */}
                    {canEdit && (
                        <form onSubmit={handleAddItem} className="liquid-glass p-5 md:p-6 rounded-[32px] min-w-0 shadow-sm border border-white/60">
                            <div className="flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-white/60 border border-white/80 rounded-full flex items-center justify-center text-[#1A5B82] shadow-sm shrink-0"><Plus size={16} strokeWidth={2.5}/></div><h3 className="text-[16px] font-bold text-[#1D1D1F] tracking-tight truncate">Ghi nhận giao dịch mới</h3></div>
                            <div className="grid grid-cols-2 md:grid-cols-12 gap-3 items-end">
                                <div className="col-span-2 md:col-span-2 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block pl-1 whitespace-nowrap">Ngày</label><input type="date" required className="w-full min-w-0 px-3 py-3 text-[14px] font-semibold liquid-input rounded-[14px] focus:border-[#26D0CE] outline-none transition-all text-[#1D1D1F] bg-white/60" value={newItem.ngay_ban} onChange={e => setNewItem({...newItem, ngay_ban: e.target.value})}/></div>
                                <div className="col-span-2 md:col-span-3 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block pl-1 whitespace-nowrap">Sản Phẩm</label><input required className="w-full min-w-0 px-3 py-3 text-[14px] font-semibold liquid-input rounded-[14px] focus:border-[#26D0CE] outline-none transition-all text-[#1D1D1F] bg-white/60" placeholder="VD: Sơ mi..." value={newItem.ten_san_pham} onChange={e => setNewItem({...newItem, ten_san_pham: e.target.value})}/></div>
                                <div className="col-span-2 md:col-span-2 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block pl-1 whitespace-nowrap">Link</label><input className="w-full min-w-0 px-3 py-3 text-[14px] font-medium liquid-input rounded-[14px] focus:border-[#26D0CE] outline-none transition-all text-[#1A5B82] bg-white/60" placeholder="Opt..." value={newItem.link_san_pham} onChange={e => setNewItem({...newItem, link_san_pham: e.target.value})}/></div>
                                <div className="col-span-1 md:col-span-1 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block text-center whitespace-nowrap">Nhập</label><input required className="w-full min-w-0 px-1 py-3 text-[14px] font-bold text-[#1A5B82] liquid-input rounded-[14px] text-center focus:border-[#26D0CE] outline-none transition-all tabular-nums bg-white/60" placeholder="0" value={formatInput(newItem.so_luong_nhap)} onChange={e => setNewItem({...newItem, so_luong_nhap: e.target.value})}/></div>
                                <div className="col-span-1 md:col-span-1 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block text-center whitespace-nowrap">Bán</label><input required className="w-full min-w-0 px-1 py-3 text-[14px] font-bold text-[#1DB2A0] liquid-input rounded-[14px] text-center focus:border-[#1DB2A0] outline-none transition-all tabular-nums bg-white/60" placeholder="0" value={formatInput(newItem.so_luong)} onChange={e => setNewItem({...newItem, so_luong: e.target.value})}/></div>
                                <div className="col-span-2 md:col-span-2 min-w-0"><label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block text-right pr-1 whitespace-nowrap">Tổng thu</label><input required className="w-full min-w-0 px-3 py-3 text-[15px] font-bold liquid-input rounded-[14px] text-right focus:border-[#26D0CE] outline-none transition-all text-[#1D1D1F] tabular-nums bg-white/60" placeholder="0" value={formatInput(newItem.so_tien_ban_duoc)} onChange={e => setNewItem({...newItem, so_tien_ban_duoc: e.target.value})}/></div>
                                <div className="col-span-2 md:col-span-1 min-w-0"><button type="submit" disabled={isProcessingAdd} className="w-full min-w-0 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white py-3 rounded-[14px] font-bold hover:opacity-90 transition-colors flex items-center justify-center disabled:opacity-50 h-[46px] shadow-md active:opacity-70"><Plus size={18} strokeWidth={2.5}/></button></div>
                            </div>
                        </form>
                    )}

                    {/* DANH SÁCH CHI TIẾT SẢN PHẨM (ĐÃ CHIA THÀNH CARD RỜI) */}
                    <div className="liquid-glass rounded-[32px] p-3 sm:p-6 md:p-8 min-w-0 shadow-sm border border-white/60">
                        <div className="flex justify-between items-center mb-6 px-2 md:px-0">
                            <h2 className="text-[18px] md:text-[20px] font-bold text-[#1D1D1F] tracking-tight">Chi tiết sản phẩm</h2>
                            <span className="text-[12px] font-bold bg-white/60 border border-white/80 text-[#1D1D1F] px-3 py-1.5 rounded-full shadow-sm">{(detailData?.daily || []).length}</span>
                        </div>
                        
                        {/* ĐỔI DIVIDE-Y THÀNH GAP-4 ĐỂ TÁCH RỜI */}
                        <div className="flex flex-col gap-4 md:gap-5 min-w-0">
                            {(enrichedDaily || []).map((row, index) => {
                                if (!row) return null;
                                const isBanGreater = (row.so_luong || 0) > (row.sl_con || 0);
                                const isMVP = row.id === mvpRowId && index !== 0; // Top 1 doanh thu (Không tính dòng đầu tiên)
                                
                                return (
                                    <div 
                                        key={row.id || index} 
                                        className={`bg-white/60 hover:bg-white border shadow-sm hover:shadow-md rounded-[24px] p-4 md:p-5 transition-all flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 xl:gap-6 w-full min-w-0 ${isMVP ? 'border-[#FF9500]/40 bg-[#FF9500]/5' : 'border-white/80'}`}
                                    >
                                        
                                        {/* NHÓM 1: Cột STT, Tên SP, Giờ Cập nhật */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 xl:w-[42%] min-w-0">
                                            
                                            {/* STT + Tên SP */}
                                            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                                                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center font-bold text-[13px] md:text-[14px] border shadow-sm shrink-0 tabular-nums ${isMVP ? 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20' : 'bg-white text-[#1D1D1F] border-gray-100'}`}>
                                                    {row.stt || 0}
                                                </div>
                                                <div className="min-w-0 flex-1 pr-2">
                                                    <div className="flex items-center gap-1.5 mb-0.5">
                                                        {isMVP && <Crown size={14} className="text-[#FF9500] shrink-0" />}
                                                        <h3 className="font-bold text-[#1D1D1F] text-[14px] md:text-[15px] leading-snug truncate group-hover:text-[#1A5B82] transition-colors">{row.ten_san_pham || ''}</h3>
                                                        {row.link_san_pham && <a href={row.link_san_pham} target="_blank" rel="noopener noreferrer" className="text-[#1A5B82] bg-white/50 border border-white/60 shadow-sm p-1 rounded-full hover:bg-white transition-colors shrink-0"><LinkIcon size={10}/></a>}
                                                    </div>
                                                    <div className="text-[11px] md:text-[12px] text-[#5c5c5c] font-medium tabular-nums whitespace-nowrap">{formatDateDisplay(row.ngay_ban)}</div>
                                                </div>
                                            </div>
                                            
                                            {/* Giờ cập nhật */}
                                            <div className="flex flex-col sm:items-end pl-12 md:pl-14 sm:pl-0 shrink-0">
                                                <p className="text-[9px] md:text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1">Cập nhật lần cuối</p>
                                                <div className="text-[11px] md:text-[12px] font-semibold text-[#1A5B82] bg-white/70 px-2.5 py-1 md:py-1.5 rounded-[10px] border border-gray-200/60 shadow-sm inline-block whitespace-nowrap">
                                                    {row.updatedAt ? formatDateTime(row.updatedAt) : formatDateTime(row.ngay_ban)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* NHÓM 2: Cột Nhập / Bán / Còn */}
                                        <div className="flex justify-between xl:justify-center gap-2 md:gap-3 shrink-0 xl:w-[26%] pl-12 md:pl-14 sm:pl-0 w-full xl:w-auto">
                                            <div className="flex-1 xl:flex-none xl:w-[65px] bg-white/70 border border-gray-200/60 rounded-[14px] py-2 text-center shadow-sm">
                                                <div className="text-[9px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Nhập</div>
                                                <div className="font-bold text-[#1D1D1F] text-[13px] md:text-[14px] tabular-nums">{formatInput(row.sl_nhap || 0)}</div>
                                            </div>
                                            <div className={`flex-1 xl:flex-none xl:w-[65px] rounded-[14px] py-2 text-center shadow-sm border ${isBanGreater ? 'bg-[#1DB2A0]/10 border-[#1DB2A0]/20' : 'bg-white/70 border-gray-200/60'}`}>
                                                <div className={`text-[9px] font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#5c5c5c]'}`}>Bán</div>
                                                <div className={`font-bold text-[13px] md:text-[14px] tabular-nums ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#1D1D1F]'}`}>{formatInput(row.so_luong || 0)}</div>
                                            </div>
                                            <div className="flex-1 xl:flex-none xl:w-[65px] bg-white/70 border border-gray-200/60 rounded-[14px] py-2 text-center shadow-sm">
                                                <div className="text-[9px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Còn</div>
                                                <div className="font-bold text-[#1D1D1F] text-[13px] md:text-[14px] tabular-nums">{formatInput(row.sl_con || 0)}</div>
                                            </div>
                                        </div>

                                        {/* NHÓM 3: Cột Doanh Thu, Lợi Nhuận, Cụm Nút Thao Tác */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-end gap-4 shrink-0 xl:w-[32%] pl-12 md:pl-14 sm:pl-0 border-t sm:border-none border-gray-200/60 pt-3 sm:pt-0 mt-1 sm:mt-0 w-full xl:w-auto">
                                            
                                            {/* Doanh thu + Vốn tồn */}
                                            <div className="flex flex-row sm:flex-col justify-between sm:justify-center gap-1 sm:gap-0.5 sm:text-right shrink-0 sm:min-w-[120px]">
                                                <div className="flex items-center sm:justify-end gap-2 text-[11px] md:text-[12px]">
                                                    <span className="text-[#5c5c5c] whitespace-nowrap">D.thu</span> 
                                                    <span className="font-bold text-[#1D1D1F] tabular-nums">+{formatCurrency(row.so_tien_ban_duoc || 0)}</span>
                                                </div>
                                                <div className="flex items-center sm:justify-end gap-2 text-[10px] md:text-[11px]">
                                                    <span className="text-[#8E8E93] whitespace-nowrap">V.tồn</span> 
                                                    <span className="font-medium text-[#5c5c5c] tabular-nums">{formatCurrency(row.tien_ton || 0)}</span>
                                                </div>
                                            </div>

                                            {/* Lợi nhuận + Nút bấm */}
                                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-none border-gray-200/60 pt-2 sm:pt-0">
                                                <div className="text-left sm:text-right shrink-0 min-w-[90px] xl:min-w-[100px]">
                                                    <div className="text-[9px] font-bold text-[#5c5c5c] uppercase tracking-widest mb-0.5 whitespace-nowrap">Lợi Nhuận</div>
                                                    <div className={`text-[15px] md:text-[16px] font-black tabular-nums tracking-tight whitespace-nowrap ${parseFloat(row.loi || 0) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>
                                                        {formatCurrency(row.loi || 0)}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center gap-1.5 md:gap-2 shrink-0 sm:border-l border-gray-200/80 sm:pl-3 ml-auto">
                                                    {canEdit && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleStartSync(row); }} 
                                                            disabled={isProcessingEdit || isProcessingDelete} 
                                                            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#1A5B82] bg-white hover:bg-[#1DB2A0] hover:text-white rounded-full transition-all shadow-sm border border-gray-100 hover:scale-105 active:scale-95" 
                                                            title="Cập nhật thay thế từ Tool IG"
                                                        >
                                                            <RefreshCw size={14}/>
                                                        </button>
                                                    )}
                                                    {canEdit && <button onClick={(e) => { e.stopPropagation(); handleStartEdit(row); }} disabled={isProcessingEdit || isProcessingDelete} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#5c5c5c] bg-white hover:bg-white hover:text-[#33A1FD] rounded-full transition-all shadow-sm border border-gray-100 hover:scale-105 active:scale-95"><Pencil size={14}/></button>}
                                                    {canDelete && <button onClick={(e) => { e.stopPropagation(); handleDeleteRow(row.id); }} disabled={isProcessingEdit || isProcessingDelete} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#5c5c5c] bg-white hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] rounded-full transition-all shadow-sm border border-gray-100 hover:scale-105 active:scale-95"><Trash2 size={14}/></button>}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
