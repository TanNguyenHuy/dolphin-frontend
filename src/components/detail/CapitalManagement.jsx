import React from 'react';
import { Box, Package, X } from 'lucide-react';
import { formatCurrency, formatInput } from '../../utils';

export default function CapitalManagement({
    detailData, detailAutoAdCost, canEdit, canDelete, handleAddBale,
    baleName, setBaleName, baleCost, setBaleCost, baleQty, setBaleQty,
    importedBales, handleDeleteBale
}) {
    return (
        <div className="lg:col-span-4 space-y-6">
            <div className="liquid-glass rounded-[32px] overflow-hidden flex flex-col h-full min-w-0 shadow-sm border border-white/60">
                <div className="px-5 py-4 border-b border-white/40 flex items-center gap-2 bg-white/20">
                    <Box size={18} className="text-[#1A5B82]" />
                    <h3 className="text-[15px] font-bold text-[#1D1D1F] tracking-tight whitespace-nowrap">Chi phí Vốn</h3>
                </div>
                <div className="p-5 flex-1 flex flex-col space-y-5 min-w-0">
                    
                    <div className="bg-gradient-to-br from-[#FFFDE7] to-[#FFECB3] border border-[#FFE0B2] shadow-[0_8px_24px_rgba(255,140,0,0.12)] p-5 rounded-[24px] relative overflow-hidden min-w-0">
                        <div className="absolute right-0 top-0 opacity-[0.12] pointer-events-none"><Package size={100} className="transform translate-x-1/4 -translate-y-1/4 text-[#FFB300]" /></div>
                        <span className="text-[10px] font-bold text-[#E65100] uppercase tracking-widest block mb-1 whitespace-nowrap relative z-10">Tổng Vốn Nhập</span>
                        <div className="font-black text-[#3E2723] text-[28px] md:text-[30px] tabular-nums tracking-tight drop-shadow-sm whitespace-nowrap relative z-10">
                            {formatCurrency((detailData?.so_tien_cua_kien || 0) + (detailData?.so_tien_giat_ui || 0) + detailAutoAdCost)}
                            <span className="text-[14px] text-[#D84315] ml-1 font-semibold">đ</span>
                        </div>
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
                                <div key={b._id} className="p-3.5 bg-white/60 hover:bg-white transition-colors border border-white/80 rounded-[20px] flex items-center justify-between group shadow-sm min-w-0">
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="text-[13px] font-bold text-[#1D1D1F] truncate">{b.name || ''}</div>
                                        <div className="text-[11px] text-[#5c5c5c] mt-0.5 font-medium truncate">SL: <span className="font-semibold text-[#1D1D1F]">{b.qty || 0}</span> • TB: {formatCurrency((b.cost || 0) / (b.qty || 1))}</div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="font-bold text-[#1D1D1F] text-[14px] tabular-nums whitespace-nowrap">{formatCurrency(b.cost || 0)}</span>
                                        {canDelete && <button type="button" onClick={() => console.log("CHI TIẾT KIỆN HÀNG LÀ:", b)} className="text-[#8E8E93] hover:text-[#FF3B30] transition-colors bg-white hover:bg-[#FF3B30]/10 p-1.5 rounded-full border border-gray-100 shadow-sm"><X size={12}/></button>}
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}

                    <div className="mt-auto space-y-4 pt-4 border-t border-white/50 min-w-0">
                        <div className="min-w-0">
                            <label className="text-[11px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1.5 block pl-1 whitespace-nowrap">Chi phí Giặt ủi / Khác (Auto 4%)</label>
                            <input 
                                disabled readOnly 
                                className="w-full min-w-0 liquid-input rounded-[16px] px-4 py-3 font-bold text-right text-[#1D1D1F] text-[18px] outline-none transition-all tabular-nums shadow-sm opacity-60 cursor-not-allowed border-white/60 bg-gray-100/50" 
                                value={formatInput(detailData?.so_tien_giat_ui || 0)} 
                                title="Chi phí này được hệ thống tự động tính bằng 4% tiền vốn nhập"
                            />
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
    );
}