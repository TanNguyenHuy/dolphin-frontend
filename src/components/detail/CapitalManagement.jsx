import React from 'react';
import { Box, Package, X } from 'lucide-react';
import { formatCurrency, formatInput } from '../../utils';

export default function CapitalManagement({
    detailData, detailAutoAdCost, canEdit, canDelete, handleAddBale,
    baleName, setBaleName, baleCost, setBaleCost, baleQty, setBaleQty,
    importedBales, handleDeleteBale
}) {
    // TÍNH TOÁN THEO ĐÚNG CÔNG THỨC: (Tổng tiền 1 + ... + n) / (Số lượng 1 + ... + n)
    const tongTienKien = (importedBales || []).reduce((acc, b) => acc + (Number(b.cost) || 0), 0);
    const tongSlKien = (importedBales || []).reduce((acc, b) => acc + (Number(b.qty) || 0), 0);
    const avgPrice = tongSlKien > 0 ? tongTienKien / tongSlKien : 0;
    
    // Tính tổng vốn nhập kho (Bao gồm cả phí giặt ủi và ads)
    const totalCapital = (detailData?.so_tien_cua_kien || 0) + (detailData?.so_tien_giat_ui || 0) + (detailAutoAdCost || 0);

    return (
        <div className="liquid-glass bg-white/50 backdrop-blur-xl rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col h-full min-w-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80">
            {/* Header của Khối */}
            <div className="px-6 py-5 border-b border-white/60 flex items-center gap-3 bg-white/40">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm">
                    <Box size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-[16px] md:text-[18px] font-black text-[#1D1D1F] tracking-tight whitespace-nowrap">Cấu trúc Vốn</h3>
            </div>
            
            <div className="p-5 md:p-8 flex-1 flex flex-col space-y-6 min-w-0">
                
                {/* Thẻ Tổng Vốn (Điểm nhấn Pro Max) */}
                <div className="bg-gradient-to-br from-[#FFFDE7] to-[#FFECB3] border border-[#FFE0B2] shadow-[0_12px_30px_rgba(255,140,0,0.15)] p-6 md:p-8 rounded-[28px] relative overflow-hidden min-w-0 group hover:shadow-[0_16px_40px_rgba(255,140,0,0.25)] transition-all duration-500">
                    <div className="absolute right-0 top-0 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-700 pointer-events-none">
                        <Package size={140} className="transform translate-x-1/4 -translate-y-1/4 text-[#FFB300]" />
                    </div>
                    <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest block mb-2 whitespace-nowrap relative z-10">Tổng Vốn Nhập Kho</span>
                    <div className="font-black text-[#3E2723] text-[36px] md:text-[44px] tabular-nums tracking-tighter drop-shadow-sm whitespace-nowrap relative z-10 leading-none">
                        {formatCurrency(totalCapital)}
                        <span className="text-[20px] text-orange-600/70 ml-1.5 font-bold">đ</span>
                    </div>
                    
                    {/* DÒNG HIỂN THỊ GIÁ TRUNG BÌNH SẢN PHẨM */}
                    <div className="mt-3 pt-3 border-t border-orange-200/50 flex justify-between items-center relative z-10">
                        <span className="text-[11px] font-bold text-orange-700/80 uppercase tracking-wide">Giá TB / Sản phẩm</span>
                        <span className="text-[15px] font-black text-[#663C00]">
                            {formatCurrency(avgPrice)} <span className="text-[11px] opacity-70">đ</span>
                        </span>
                    </div>
                </div>
                
                {/* Form thêm lô hàng */}
                {canEdit && (
                    <form onSubmit={handleAddBale} className="bg-white/60 p-4 md:p-5 rounded-[24px] space-y-4 border border-white/80 shadow-sm backdrop-blur-md">
                        <input required placeholder="Tên lô hàng (VD: Lô Áo Thun)..." className="w-full min-w-0 bg-white/70 border border-white/80 rounded-[16px] px-4 py-3.5 text-[14px] font-bold text-[#1D1D1F] focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 outline-none transition-all placeholder:text-gray-400 placeholder:font-medium shadow-sm hover:bg-white/90" 
                            value={baleName || ''} 
                            onChange={e => setBaleName ? setBaleName(e.target.value) : alert("Lỗi")} />
                        <div className="flex gap-3 w-full">
                            <input required placeholder="Giá vốn (VNĐ)" className="flex-1 min-w-0 bg-white/70 border border-white/80 rounded-[16px] px-4 py-3.5 text-[14px] font-bold text-[#1D1D1F] text-right focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 outline-none transition-all tabular-nums placeholder:text-gray-400 placeholder:font-medium shadow-sm hover:bg-white/90" 
                                value={formatInput(baleCost) || ''} 
                                onChange={e => setBaleCost ? setBaleCost(e.target.value) : alert("Lỗi")} />
                            <input required placeholder="SL" className="w-[80px] shrink-0 bg-white/70 border border-white/80 rounded-[16px] px-2 py-3.5 text-[15px] font-black text-[#33A1FD] text-center focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 outline-none transition-all tabular-nums placeholder:text-blue-300 placeholder:font-medium shadow-sm hover:bg-white/90" 
                                value={formatInput(baleQty) || ''} 
                                onChange={e => setBaleQty ? setBaleQty(e.target.value) : alert("Lỗi")} />
                        </div>
                        <button type="submit" className="w-full min-w-0 bg-white/80 text-[#1A5B82] border border-gray-200/50 shadow-sm py-3.5 rounded-[16px] text-[14px] font-bold hover:bg-white hover:border-[#26D0CE] hover:text-[#26D0CE] hover:shadow-md transition-all active:scale-95 whitespace-nowrap">Ghi nhận kiện hàng</button>
                    </form>
                )}

                {/* Danh sách lô hàng */}
                {(importedBales || []).length > 0 ? (
                    <div className="space-y-3">
                        {(importedBales || []).map(b => {
                            if (!b) return null;
                            return (
                            <div key={b._id} className="p-4 bg-white/70 hover:bg-white transition-all duration-300 border border-white/80 rounded-[20px] flex items-center justify-between group shadow-sm hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] min-w-0">
                                <div className="flex-1 min-w-0 pr-3">
                                    <div className="text-[14px] font-bold text-[#1D1D1F] truncate group-hover:text-[#1A5B82] transition-colors">{b.name || ''}</div>
                                    <div className="text-[12px] text-gray-500 mt-1 font-medium truncate flex items-center gap-1.5">
                                        SL: <span className="font-bold text-gray-800">{b.qty || 0}</span> 
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span> 
                                        TB: {formatCurrency((b.cost || 0) / (b.qty || 1))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className="font-black text-[#1D1D1F] text-[15px] tabular-nums whitespace-nowrap">{formatCurrency(b.cost || 0)}</span>
                                    {canDelete && <button type="button" onClick={() => { handleDeleteBale ? handleDeleteBale(b._id) : alert("Lỗi"); }} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-red-500 bg-white border border-gray-100 shadow-sm hover:bg-red-50 rounded-full transition-all active:scale-90"><X size={14} strokeWidth={3}/></button>}
                                </div>
                            </div>
                        )})}
                    </div>
                ) : (
                    <div className="text-center p-6 bg-white/40 border border-dashed border-gray-300/60 rounded-[24px] text-[13px] font-medium text-gray-400">Chưa có kiện hàng nào được ghi nhận</div>
                )}

                {/* Thông số phụ */}
                <div className="mt-auto space-y-5 pt-6 border-t border-white/50 min-w-0 relative z-10">
                    <div className="min-w-0">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block pl-1">Phí Giặt ủi & Phụ phí (Auto 4%)</label>
                        <input 
                            disabled readOnly 
                            className="w-full min-w-0 bg-white/40 border border-white/60 rounded-[20px] px-5 py-4 font-black text-right text-gray-600 text-[20px] outline-none tabular-nums shadow-inner cursor-not-allowed" 
                            value={formatInput(detailData?.so_tien_giat_ui || 0)} 
                        />
                    </div>
                    
                    <div className="bg-white/60 border border-white/80 p-5 rounded-[24px] space-y-3.5 text-[13px] md:text-[14px] backdrop-blur-md shadow-sm min-w-0">
                        <div className="flex justify-between items-center gap-2 text-gray-500 font-bold"><span>Tổng Hàng Nhập</span><span className="font-black text-gray-800 tabular-nums">{formatInput(detailData?.computed?.tong_sl_nhap || 0)}</span></div>
                        <div className="flex justify-between items-center gap-2 text-gray-500 font-bold"><span>Tổng Đã Bán</span><span className="font-black text-[#1DB2A0] tabular-nums">{formatInput(detailData?.computed?.tong_sl_ban || 0)}</span></div>
                        <div className="flex justify-between items-center gap-2 text-gray-500 font-bold"><span>Tồn Kho Hiện Tại</span><span className="font-black text-orange-600 tabular-nums">{formatInput((detailData?.computed?.tong_sl_nhap || 0) - (detailData?.computed?.tong_sl_ban || 0))}</span></div>
                        <div className="flex justify-between items-center gap-2 text-gray-500 font-bold pt-3.5 border-t border-gray-200/50 mt-2">
                            <span>Phí Quảng cáo (Auto)</span>
                            <span className="font-black text-gray-800 tabular-nums">{formatCurrency(detailAutoAdCost)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}