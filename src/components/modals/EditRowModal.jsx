import React, { useState } from 'react';
import { X, Calculator, Plus, Minus, RefreshCcw } from 'lucide-react';
import { formatInput, parseInput } from '../../utils';
import { parseIGSyncText } from '../../logic';

export default function EditRowModal({ editingRow, setEditingRow, handleSaveEdit, isProcessingEdit }) {
    const [deltaQty, setDeltaQty] = useState('');
    const [deltaPrice, setDeltaPrice] = useState('');
    const [syncText, setSyncText] = useState('');

    if (!editingRow) return null;

    const applyDelta = (isAdd) => {
        const q = parseInput(deltaQty) || 0;
        const p = parseInput(deltaPrice) || 0;
        if (q === 0 && p === 0) return;

        setEditingRow(prev => {
            const currentBan = parseInput(prev.so_luong) || 0;
            const currentTien = parseInput(prev.so_tien_ban_duoc) || 0;
            return {
                ...prev,
                so_luong: isAdd ? currentBan + q : Math.max(0, currentBan - q),
                so_tien_ban_duoc: isAdd ? currentTien + p : Math.max(0, currentTien - p)
            };
        });
        setDeltaQty(''); setDeltaPrice('');
    };

    const handlePasteSync = (e) => {
        const text = e.target.value; setSyncText(text);
        if (!text.trim()) return;
        try {
            const { q, r } = parseIGSyncText(text);
            if (q > 0 || r > 0) {
                setEditingRow(prev => ({ ...prev, so_luong: q > 0 ? q : prev.so_luong, so_tien_ban_duoc: r > 0 ? r : prev.so_tien_ban_duoc }));
            }
        } catch (err) {}
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
            <div className="liquid-glass bg-white/80 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] w-full max-w-[540px] p-6 md:p-8 shadow-[0_24px_60px_rgba(0,0,0,0.2)] animate-scale-up relative max-h-[90vh] overflow-y-auto custom-scrollbar border border-white">
                
                <button onClick={() => setEditingRow(null)} className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center bg-white/50 hover:bg-white border border-gray-100 text-gray-500 hover:text-rose-500 rounded-full transition-all active:scale-90 shadow-sm">
                    <X size={20} strokeWidth={2.5} />
                </button>
                
                <h2 className="text-[22px] md:text-[26px] font-black text-[#1D1D1F] mb-6 tracking-tight">Sửa Bản Ghi</h2>

                <div className="space-y-4 md:space-y-5">
                    {/* Khu vực Đồng bộ IG thả nổi (Floating Zone) */}
                    <div className="bg-gradient-to-br from-teal-50/50 to-emerald-50/50 border border-teal-200/50 rounded-[24px] p-4 md:p-5 shadow-inner">
                        <label className="flex items-center gap-2 text-[11px] font-black text-[#1DB2A0] uppercase tracking-widest mb-3">
                            <RefreshCcw size={16} strokeWidth={2.5}/> Cập nhật nhanh từ mã IG
                        </label>
                        <textarea 
                            className="w-full h-[60px] px-4 py-3 rounded-[16px] border border-white/60 bg-white/60 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 outline-none text-[13px] font-medium text-gray-700 custom-scrollbar resize-none transition-all shadow-sm placeholder:text-teal-700/30" 
                            placeholder="Dán mã JSON copy từ Tool vào đây. Số liệu sẽ tự động nhảy!" 
                            value={syncText} onChange={handlePasteSync} 
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5 pl-1">Ngày Bán</label>
                            <input type="date" className="w-full px-4 py-3.5 rounded-[16px] border border-white/60 bg-white/50 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 outline-none text-[14px] font-bold text-gray-700 transition-all shadow-sm" value={editingRow.ngay_ban || ''} onChange={e => setEditingRow({...editingRow, ngay_ban: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5 pl-1">Tên Sản Phẩm</label>
                            <input type="text" className="w-full px-4 py-3.5 rounded-[16px] border border-white/60 bg-white/50 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 outline-none text-[14px] font-bold text-gray-800 transition-all shadow-sm" value={editingRow.ten_san_pham || ''} onChange={e => setEditingRow({...editingRow, ten_san_pham: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5 text-center">SL Nhập</label>
                            <input type="text" className="w-full px-4 py-3.5 rounded-[16px] border border-white/60 bg-white/50 focus:bg-white focus:border-[#33A1FD] focus:ring-4 focus:ring-[#33A1FD]/20 outline-none text-[18px] font-black text-[#33A1FD] text-center tabular-nums transition-all shadow-sm" value={formatInput(editingRow.so_luong_nhap)} onChange={e => setEditingRow({...editingRow, so_luong_nhap: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5 text-center">SL Bán</label>
                            <input type="text" className="w-full px-4 py-3.5 rounded-[16px] border border-white/60 bg-white/50 focus:bg-white focus:border-[#1DB2A0] focus:ring-4 focus:ring-[#1DB2A0]/20 outline-none text-[18px] font-black text-[#1DB2A0] text-center tabular-nums transition-all shadow-sm" value={formatInput(editingRow.so_luong)} onChange={e => setEditingRow({...editingRow, so_luong: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5 pl-1">Tổng Doanh Thu</label>
                        <input type="text" className="w-full px-4 py-3.5 rounded-[16px] border border-white/60 bg-white/50 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 outline-none text-[20px] font-black text-gray-800 text-right tabular-nums transition-all shadow-sm" value={formatInput(editingRow.so_tien_ban_duoc)} onChange={e => setEditingRow({...editingRow, so_tien_ban_duoc: e.target.value})} />
                    </div>

                    <div>
                        <label className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-1.5 pl-1">Link (Tùy chọn)</label>
                        <input type="text" placeholder="https://..." className="w-full px-4 py-3.5 rounded-[16px] border border-white/60 bg-white/50 focus:bg-white focus:border-[#33A1FD] focus:ring-4 focus:ring-[#33A1FD]/20 outline-none text-[14px] font-bold text-[#33A1FD] transition-all shadow-sm placeholder:text-blue-200" value={editingRow.link_san_pham || ''} onChange={e => setEditingRow({...editingRow, link_san_pham: e.target.value})} />
                    </div>

                    {/* Khu vực Máy tính mini */}
                    <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-200/40 rounded-[24px] p-4 md:p-5 mt-2 shadow-inner">
                        <label className="flex items-center gap-2 text-[11px] font-black text-[#1A5B82] uppercase tracking-widest mb-3">
                            <Calculator size={16} strokeWidth={2.5}/> Điều chỉnh thủ công (±)
                        </label>
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                            <input type="text" placeholder="SL đổi" className="w-[85px] shrink-0 px-3 py-3.5 rounded-[14px] border border-white/80 bg-white/70 text-center text-[15px] font-black text-[#1D1D1F] outline-none focus:border-[#26D0CE] focus:bg-white focus:ring-4 focus:ring-[#26D0CE]/20 shadow-sm tabular-nums transition-all" value={formatInput(deltaQty)} onChange={e => setDeltaQty(e.target.value)} />
                            <input type="text" placeholder="Tiền thay đổi" className="flex-1 min-w-[120px] px-4 py-3.5 rounded-[14px] border border-white/80 bg-white/70 text-right text-[15px] font-black text-[#1D1D1F] outline-none focus:border-[#26D0CE] focus:bg-white focus:ring-4 focus:ring-[#26D0CE]/20 shadow-sm tabular-nums transition-all" value={formatInput(deltaPrice)} onChange={e => setDeltaPrice(e.target.value)} />
                            
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => applyDelta(true)} type="button" className="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-[#1DB2A0] to-[#26D0CE] hover:opacity-90 text-white rounded-[14px] shadow-[0_8px_16px_rgba(29,178,160,0.3)] active:scale-90 transition-all" title="Cộng thêm">
                                    <Plus size={20} strokeWidth={3}/>
                                </button>
                                <button onClick={() => applyDelta(false)} type="button" className="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-[#FF453A] to-[#FF6B22] hover:opacity-90 text-white rounded-[14px] shadow-[0_8px_16px_rgba(255,69,58,0.3)] active:scale-90 transition-all" title="Trừ bớt">
                                    <Minus size={20} strokeWidth={3}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button type="button" onClick={() => setEditingRow(null)} className="flex-1 h-[52px] rounded-[16px] font-bold text-gray-600 bg-white/60 hover:bg-white border border-gray-200/60 active:scale-95 transition-all text-[14px] md:text-[15px] shadow-sm">Hủy Bỏ</button>
                    <button type="button" onClick={handleSaveEdit} disabled={isProcessingEdit} className="flex-1 h-[52px] rounded-[16px] font-bold text-white bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] hover:opacity-90 shadow-[0_8px_20px_rgba(38,208,206,0.3)] active:scale-95 transition-all flex items-center justify-center text-[14px] md:text-[15px]">
                        {isProcessingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}