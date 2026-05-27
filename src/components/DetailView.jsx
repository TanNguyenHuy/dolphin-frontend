import React from 'react';
import { ChevronLeft, Download, Box, Package, Plus, X, Crown, Link as LinkIcon, Pencil, Trash2, RefreshCw, Calendar, Clock } from 'lucide-react';
import { formatCurrency, formatInput, parseInput, formatDateDisplay, getSessionName, AnimatedNumber } from '../utils';

const formatDateTime = (dateString) => {
    try {
        if (!dateString) return '---';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '---';
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        return `${hh}:${mm} ${dd}/${mo}`;
    } catch (e) { return '---'; }
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                
                {/* ---------- CỘT TRÁI: CHI PHÍ VỐN ---------- */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="liquid-glass rounded-[32px] overflow-hidden flex flex-col h-full min-w-0 shadow-sm border border-white/60">
                        <div className="px-5 py-4 border-b border-white/40 flex items-center gap-2 bg-white/20"><Box size={18} className="text-[#1A5B82]" /><h3 className="text-[15px] font-bold text-[#1D1D1F] tracking-tight whitespace-nowrap">Chi phí Vốn</h3></div>
                        <div className="p-5 flex-1 flex flex-col space-y-5 min-w-0">
                            
                            {/* KHỐI TỔNG VỐN NHẬP (ĐÃ ĐỔI THEME VÀNG KEM SANG TRỌNG) */}
                            <div className="bg-gradient-to-br from-[#FFFDE7] to-[#FFECB3] border border-[#FFE0B2] shadow-[0_8px_24px_rgba(255,140,0,0.12)] p-5 rounded-[24px] relative overflow-hidden min-w-0">
                                <div className="absolute right-0 top-0 opacity-[0.12] pointer-events-none"><Package size={100} className="transform translate-x-1/4 -translate-y-1/4 text-[#FFB300]" /></div>
                                <span className="text-[10px] font-bold text-[#E65100] uppercase tracking-widest block mb-1 whitespace-nowrap relative z-10">Tổng Vốn Nhập</span>
                                <div className="font-black text-[#3E2723] text-[28px] md:text-[30px] tabular-nums tracking-tight drop-shadow-sm whitespace-nowrap relative z-10">{formatCurrency((detailData?.so_tien_cua_kien || 0) + (detailData?.so_tien_giat_ui || 0) + detailAutoAdCost)}<span className="text-[14px] text-[#D84315] ml-1 font-semibold">đ</span></div>
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

                    {/* BẢNG CHI TIẾT SẢN PHẨM */}
                    <div className="liquid-glass rounded-[32px] p-3 sm:p-6 md:p-8 min-w-0 shadow-sm border border-white/60">
                        <div className="flex justify-between items-center mb-6 px-2 md:px-0">
                            <h2 className="text-[18px] md:text-[20px] font-bold text-[#1D1D1F] tracking-tight">Chi tiết sản phẩm</h2>
                            <span className="text-[12px] font-bold bg-white/60 border border-gray-200 text-[#1D1D1F] px-3 py-1.5 rounded-full shadow-sm">{(detailData?.daily || []).length}</span>
                        </div>
                        
                        <div className="flex flex-col gap-4 min-w-0">
                            {(enrichedDaily || []).map((row, index) => {
                                if (!row) return null;
                                const isBanGreater = (row.so_luong || 0) > (row.sl_con || 0);
                                const isMVP = row.id === mvpRowId && index !== 0; 
                                
                                return (
                                    <div 
                                        key={row.id || index} 
                                        className={`bg-white hover:bg-gray-50 border shadow-sm rounded-[24px] p-4 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-6 w-full min-w-0 ${isMVP ? 'border-[#FF9500]/40 shadow-[#FF9500]/10' : 'border-gray-200'}`}
                                    >
                                        <div className="flex items-center gap-4 w-full xl:w-[40%] min-w-0">
                                            <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 tabular-nums ${isMVP ? 'bg-[#FF9500]/10 text-[#FF9500]' : 'bg-gray-100 text-gray-700'}`}>
                                                {row.stt || 0}
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <div className="flex items-center gap-2 min-w-0 mb-1">
                                                    {isMVP && <Crown size={14} className="text-[#FF9500] shrink-0" />}
                                                    <h3 className="font-bold text-[#1D1D1F] text-[15px] truncate">{row.ten_san_pham || '---'}</h3>
                                                    {row.link_san_pham && (
                                                        <a href={row.link_san_pham} target="_blank" rel="noopener noreferrer" className="text-[#33A1FD] hover:text-[#26D0CE] bg-blue-50 p-1 rounded-full shrink-0">
                                                            <LinkIcon size={12}/>
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-500">
                                                    <span className="flex items-center gap-1"><Calendar size={10} /> {formatDateDisplay(row.ngay_ban)}</span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="flex items-center gap-1 text-[#1A5B82] bg-blue-50/80 px-1.5 py-0.5 rounded-md border border-blue-100/50 truncate">
                                                        <Clock size={10} /> Cập nhật: {formatDateTime(row.updatedAt || row.ngay_ban)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between gap-2 xl:w-[25%] shrink-0 pl-14 xl:pl-0">
                                            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-2 text-center">
                                                <div className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 whitespace-nowrap">Nhập</div>
                                                <div className="font-bold text-gray-800 text-[14px] tabular-nums">{formatInput(row.sl_nhap || 0)}</div>
                                            </div>
                                            <div className={`flex-1 border rounded-2xl py-2 text-center ${isBanGreater ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-gray-100'}`}>
                                                <div className={`text-[9px] font-bold uppercase mb-0.5 whitespace-nowrap ${isBanGreater ? 'text-teal-700' : 'text-gray-500'}`}>Bán</div>
                                                <div className={`font-bold text-[14px] tabular-nums ${isBanGreater ? 'text-teal-600' : 'text-gray-800'}`}>{formatInput(row.so_luong || 0)}</div>
                                            </div>
                                            <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-2 text-center">
                                                <div className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 whitespace-nowrap">Còn</div>
                                                <div className="font-bold text-gray-800 text-[14px] tabular-nums">{formatInput(row.sl_con || 0)}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-end gap-3 xl:gap-5 w-full xl:w-[35%] pl-14 xl:pl-0 border-t xl:border-none border-gray-100 pt-4 xl:pt-0 mt-2 xl:mt-0 shrink-0">
                                            
                                            <div className="flex flex-row sm:flex-col justify-between sm:justify-center text-left sm:text-right shrink-0">
                                                <div className="flex items-center sm:justify-end gap-2 text-[12px]">
                                                    <span className="text-gray-500 whitespace-nowrap">D.thu</span>
                                                    <span className="font-bold text-gray-800 tabular-nums">+{formatCurrency(row.so_tien_ban_duoc || 0)}</span>
                                                </div>
                                                <div className="flex items-center sm:justify-end gap-2 text-[11px] mt-0.5">
                                                    <span className="text-gray-400 whitespace-nowrap">V.tồn</span>
                                                    <span className="font-medium text-gray-500 tabular-nums">{formatCurrency(row.tien_ton || 0)}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-none border-gray-100 pt-3 sm:pt-0">
                                                <div className="flex flex-col items-start sm:items-end shrink-0 min-w-[80px]">
                                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">Lợi Nhuận</div>
                                                    <div className={`text-[16px] font-black tracking-tight tabular-nums whitespace-nowrap ${parseFloat(row.loi || 0) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>
                                                        {formatCurrency(row.loi || 0)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 sm:border-l border-gray-200 sm:pl-3 ml-4">
                                                    {canEdit && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleStartSync(row); }} 
                                                            disabled={isProcessingEdit || isProcessingDelete} 
                                                            className="p-2 text-[#33A1FD] hover:bg-blue-50 rounded-full transition-colors active:scale-95 shadow-sm sm:shadow-none" 
                                                            title="Cập nhật thay thế"
                                                        >
                                                            <RefreshCw size={14}/>
                                                        </button>
                                                    )}
                                                    {canEdit && <button onClick={(e) => { e.stopPropagation(); handleStartEdit(row); }} disabled={isProcessingEdit || isProcessingDelete} className="p-2 text-gray-400 hover:text-[#33A1FD] hover:bg-gray-50 rounded-full transition-colors active:scale-95 shadow-sm sm:shadow-none"><Pencil size={14}/></button>}
                                                    {canDelete && <button onClick={(e) => { e.stopPropagation(); handleDeleteRow(row.id); }} disabled={isProcessingEdit || isProcessingDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95 shadow-sm sm:shadow-none"><Trash2 size={14}/></button>}
                                                </div>
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
