import React, { useState } from 'react';
import { X, Calculator, Plus, Minus } from 'lucide-react';
import { formatInput, parseInput } from '../../utils';

export default function EditRowModal({ editingRow, setEditingRow, handleSaveEdit, isProcessingEdit }) {
    const [deltaQty, setDeltaQty] = useState('');
    const [deltaPrice, setDeltaPrice] = useState('');

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
        
        setDeltaQty(''); 
        setDeltaPrice('');
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all animate-fade-in">
            {/* ĐÃ TĂNG ĐỘ RỘNG TỪ 440px LÊN 520px Ở DÒNG DƯỚI */}
            <div className="bg-white rounded-[28px] w-full max-w-[520px] p-6 md:p-8 shadow-2xl animate-scale-up relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                <button onClick={() => setEditingRow(null)} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors active:scale-95">
                    <X size={16} />
                </button>
                
                <h2 className="text-[22px] md:text-[24px] font-black text-[#1D1D1F] mb-6 tracking-tight">Sửa Bản Ghi</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 pl-1">Ngày Bán</label>
                            <input type="date" className="w-full px-4 py-3 rounded-[14px] border border-gray-200 focus:border-[#26D0CE] outline-none text-[14px] font-semibold text-gray-700 bg-gray-50 hover:bg-white transition-colors" value={editingRow.ngay_ban || ''} onChange={e => setEditingRow({...editingRow, ngay_ban: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 pl-1">Tên Sản Phẩm</label>
                            <input type="text" className="w-full px-4 py-3 rounded-[14px] border border-gray-200 focus:border-[#26D0CE] outline-none text-[14px] font-semibold text-gray-800 bg-gray-50 hover:bg-white transition-colors" value={editingRow.ten_san_pham || ''} onChange={e => setEditingRow({...editingRow, ten_san_pham: e.target.value})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 text-center">SL Nhập</label>
                            <input type="text" className="w-full px-4 py-3 rounded-[14px] border border-gray-200 focus:border-[#33A1FD] outline-none text-[16px] font-black text-[#33A1FD] text-center tabular-nums bg-gray-50 hover:bg-white transition-colors" value={formatInput(editingRow.so_luong_nhap)} onChange={e => setEditingRow({...editingRow, so_luong_nhap: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 text-center">SL Bán</label>
                            <input type="text" className="w-full px-4 py-3 rounded-[14px] border border-gray-200 focus:border-[#1DB2A0] outline-none text-[16px] font-black text-[#1DB2A0] text-center tabular-nums bg-gray-50 hover:bg-white transition-colors" value={formatInput(editingRow.so_luong)} onChange={e => setEditingRow({...editingRow, so_luong: e.target.value})} />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 pl-1">Tổng Doanh Thu</label>
                        <input type="text" className="w-full px-4 py-3 rounded-[14px] border border-gray-200 focus:border-[#26D0CE] outline-none text-[18px] font-black text-gray-800 text-right tabular-nums bg-gray-50 hover:bg-white transition-colors" value={formatInput(editingRow.so_tien_ban_duoc)} onChange={e => setEditingRow({...editingRow, so_tien_ban_duoc: e.target.value})} />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5 pl-1">Link (Tùy chọn)</label>
                        <input type="text" placeholder="https://..." className="w-full px-4 py-3 rounded-[14px] border border-gray-200 focus:border-[#26D0CE] outline-none text-[14px] font-medium text-[#33A1FD] bg-gray-50 hover:bg-white transition-colors" value={editingRow.link_san_pham || ''} onChange={e => setEditingRow({...editingRow, link_san_pham: e.target.value})} />
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-teal-50 border border-blue-100/50 rounded-[20px] p-4 pt-3.5 mt-2 shadow-inner">
                        <label className="flex items-center gap-1.5 text-[10px] font-black text-[#1A5B82] uppercase tracking-widest mb-3">
                            <Calculator size={14}/> Cập nhật tự động (±)
                        </label>
                        {/* Đã điều chỉnh flex-wrap để chống tràn trên các màn hình nhỏ */}
                        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                            <input type="text" placeholder="SL đổi" className="w-[85px] shrink-0 px-2 py-3 rounded-[12px] border border-white bg-white/80 text-center text-[15px] font-bold text-[#1D1D1F] outline-none focus:border-[#26D0CE] focus:bg-white shadow-sm tabular-nums transition-colors" value={formatInput(deltaQty)} onChange={e => setDeltaQty(e.target.value)} />
                            <input type="text" placeholder="Tiền thay đổi" className="flex-1 min-w-[120px] px-3 py-3 rounded-[12px] border border-white bg-white/80 text-right text-[15px] font-bold text-[#1D1D1F] outline-none focus:border-[#26D0CE] focus:bg-white shadow-sm tabular-nums transition-colors" value={formatInput(deltaPrice)} onChange={e => setDeltaPrice(e.target.value)} />
                            
                            <div className="flex gap-1.5 shrink-0">
                                <button onClick={() => applyDelta(true)} type="button" className="w-[46px] h-[46px] flex items-center justify-center bg-gradient-to-tr from-[#1DB2A0] to-[#26D0CE] hover:opacity-90 text-white rounded-[12px] shadow-md active:scale-95 transition-all" title="Cộng thêm">
                                    <Plus size={20} strokeWidth={3}/>
                                </button>
                                <button onClick={() => applyDelta(false)} type="button" className="w-[46px] h-[46px] flex items-center justify-center bg-gradient-to-tr from-[#FF453A] to-[#FF6B22] hover:opacity-90 text-white rounded-[12px] shadow-md active:scale-95 transition-all" title="Trừ bớt">
                                    <Minus size={20} strokeWidth={3}/>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="flex gap-3 mt-7">
                    <button type="button" onClick={() => setEditingRow(null)} className="flex-1 py-3.5 rounded-[16px] font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all">Hủy Bỏ</button>
                    <button type="button" onClick={handleSaveEdit} disabled={isProcessingEdit} className="flex-1 py-3.5 rounded-[16px] font-bold text-white bg-[linear-gradient(135deg,#33A1FD,#26D0CE)] hover:opacity-90 shadow-lg shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center">
                        {isProcessingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}