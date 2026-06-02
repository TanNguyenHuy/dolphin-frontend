import React from 'react';
import { X } from 'lucide-react';
import { formatInput } from '../../utils';

export default function EditRowModal({
    editingRow,
    setEditingRow,
    handleSaveEdit,
    isProcessingEdit
}) {
    if (!editingRow) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-[420px] animate-scale-up relative shadow-2xl border border-white">
                <button onClick={() => setEditingRow(null)} className="absolute top-5 right-5 text-gray-500 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors active:scale-95">
                    <X size={20}/>
                </button>
                <div className="mb-6"><h2 className="text-[24px] font-bold text-[#1D1D1F] tracking-tight">Sửa Bản Ghi</h2></div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Ngày Bán</label>
                        <input type="date" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-[15px] font-medium text-[#1D1D1F] outline-none transition-all focus:border-[#26D0CE] focus:bg-white" value={editingRow.ngay_ban} onChange={e => setEditingRow({...editingRow, ngay_ban: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Tên Sản Phẩm</label>
                        <input type="text" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-[15px] font-medium text-[#1D1D1F] outline-none transition-all focus:border-[#26D0CE] focus:bg-white" value={editingRow.ten_san_pham} onChange={e => setEditingRow({...editingRow, ten_san_pham: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <div>
                            <label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">SL Nhập</label>
                            <input className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-[15px] font-bold text-[#33A1FD] text-center tabular-nums outline-none transition-all focus:border-[#33A1FD] focus:bg-white" value={formatInput(editingRow.so_luong_nhap)} onChange={e => setEditingRow({...editingRow, so_luong_nhap: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">SL Bán</label>
                            <input className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-[15px] font-bold text-[#1DB2A0] text-center tabular-nums outline-none transition-all focus:border-[#1DB2A0] focus:bg-white" value={formatInput(editingRow.so_luong)} onChange={e => setEditingRow({...editingRow, so_luong: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Tổng Doanh Thu</label>
                        <input className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-[17px] font-bold text-[#1D1D1F] text-right tabular-nums outline-none transition-all tracking-tight focus:border-[#26D0CE] focus:bg-white" value={formatInput(editingRow.so_tien_ban_duoc)} onChange={e => setEditingRow({...editingRow, so_tien_ban_duoc: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Link (Tùy chọn)</label>
                        <input type="text" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-[15px] font-medium text-[#33A1FD] outline-none transition-all focus:border-[#33A1FD] focus:bg-white" value={editingRow.link_san_pham || ''} onChange={e => setEditingRow({...editingRow, link_san_pham: e.target.value})} />
                    </div>
                </div>
                <div className="mt-8 flex gap-3">
                    <button onClick={() => setEditingRow(null)} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-[15px]">Hủy</button>
                    <button onClick={handleSaveEdit} disabled={isProcessingEdit} className="flex-1 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white py-3.5 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 text-[15px] shadow-lg active:scale-95">
                        {isProcessingEdit ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}