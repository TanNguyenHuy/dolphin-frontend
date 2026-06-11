import React, { useState } from 'react';
import { X, Calculator, Plus, Minus } from 'lucide-react';
import { formatInput, parseInput } from '../../utils';

export default function EditRowModal({ editingRow, setEditingRow, handleSaveEdit, isProcessingEdit }) {
    const [deltaQty, setDeltaQty] = useState('');
    const [deltaPrice, setDeltaPrice] = useState('');

    if (!editingRow) return null;

    // Hàm xử lý cộng/trừ nhanh
    const applyDelta = (isAdd) => {
        const q = parseInput(deltaQty) || 0;
        const p = parseInput(deltaPrice) || 0;
        if (q === 0 && p === 0) return;

        setEditingRow(prev => {
            const currentNhap = parseInput(prev.so_luong_nhap) || 0;
            const currentBan = parseInput(prev.so_luong) || 0;
            const currentTien = parseInput(prev.so_tien_ban_duoc) || 0;

            return {
                ...prev,
                // Tự động cộng/trừ cả SL Nhập và SL Bán để tồn kho không bị lệch
                so_luong_nhap: isAdd ? currentNhap + q : Math.max(0, currentNhap - q),
                so_luong: isAdd ? currentBan + q : Math.max(0, currentBan - q),
                so_tien_ban_duoc: isAdd ? currentTien + p : Math.max(0, currentTien - p)
            };
        });
        
        // Reset ô nhập nhanh sau khi bấm
        setDeltaQty(''); 
        setDeltaPrice('');
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all animate-fade-in">
            <div className="bg-white rounded-[24px] w-full max-w-[420px] p-6 shadow-2xl animate-scale-up relative">
                <button onClick={() => setEditingRow(null)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors">
                    <X size={16} />
                </button>
                
                <h2 className="text-[22px] font-black text-gray-800 mb-6">Sửa Bản Ghi</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1 pl-1">Ngày Bán</label>
                        <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#26D0CE] outline-none text-[14px] font-semibold text-gray-700 bg-gray-50/50" value={editingRow.ngay_ban || ''} onChange={e => setEditingRow({...editingRow, ngay_ban: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1 pl-1">Tên Sản Phẩm</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#26D0CE] outline-none text-[14px] font-semibold text-gray-700" value={editingRow.ten_san_pham || ''} onChange={e => setEditingRow({...editingRow, ten_san_pham: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1 text-center">SL Nhập</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#33A1FD] outline-none text-[15px] font-bold text-[#33A1FD] text-center tabular-nums" value={formatInput(editingRow.so_luong_nhap)} onChange={e => setEditingRow({...editingRow, so_luong_nhap: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1 text-center">SL Bán</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1DB2A0] outline-none text-[15px] font-bold text-[#1DB2A0] text-center tabular-nums" value={formatInput(editingRow.so_luong)} onChange={e => setEditingRow({...editingRow, so_luong: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1 pl-1">Tổng Doanh Thu</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#26D0CE] outline-none text-[16px] font-black text-gray-800 text-right tabular-nums" value={formatInput(editingRow.so_tien_ban_duoc)} onChange={e => setEditingRow({...editingRow, so_tien_ban_duoc: e.target.value})} />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1 pl-1">Link (Tùy chọn)</label>
                        <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#26D0CE] outline-none text-[14px] font-medium text-[#33A1FD]" value={editingRow.link_san_pham || ''} onChange={e => setEditingRow({...editingRow, link_san_pham: e.target.value})} />
                    </div>

                    {/* ---------- CÔNG CỤ CỘNG TRỪ NHANH ---------- */}
                    <div className="bg-[#f8fafc] border border-slate-200 rounded-2xl p-4 mt-2 shadow-sm">
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                            <Calculator size={14}/> Cập nhật tự động (±)
                        </label>
                        <div className="flex items-center gap-2">
                            <input type="text" placeholder="SL đổi" className="w-[70px] px-3 py-2.5 rounded-[12px] border border-slate-300 text-center text-[14px] font-bold text-[#1D1D1F] outline-none focus:border-[#26D0CE] tabular-nums" value={formatInput(deltaQty)} onChange={e => setDeltaQty(e.target.value)} />
                            <input type="text" placeholder="Tiền thay đổi" className="flex-1 px-3 py-2.5 rounded-[12px] border border-slate-300 text-right text-[14px] font-bold text-[#1D1D1F] outline-none focus:border-[#26D0CE] tabular-nums" value={formatInput(deltaPrice)} onChange={e => setDeltaPrice(e.target.value)} />
                            
                            <div className="flex gap-1.5 shrink-0 ml-1">
                                <button onClick={() => applyDelta(true)} type="button" className="w-10 h-10 flex items-center justify-center bg-[#1DB2A0] hover:bg-teal-600 text-white rounded-[12px] shadow-sm active:scale-95 transition-all" title="Cộng thêm">
                                    <Plus size={18} strokeWidth={3}/>
                                </button>
                                <button onClick={() => applyDelta(false)} type="button" className="w-10 h-10 flex items-center justify-center bg-[#FF453A] hover:bg-red-600 text-white rounded-[12px] shadow-sm active:scale-95 transition-all" title="Trừ bớt">
                                    <Minus size={18} strokeWidth={3}/>
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* ------------------------------------------- */}

                </div>

                <div className="flex gap-3 mt-6">
                    <button type="button" onClick={() => setEditingRow(null)} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy</button>
                    <button type="button" onClick={handleSaveEdit} disabled={isProcessingEdit} className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] hover:opacity-90 shadow-md active:scale-95 transition-all flex items-center justify-center">
                        {isProcessingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}