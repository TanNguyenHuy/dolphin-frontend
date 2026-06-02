import React from 'react';
import { Plus } from 'lucide-react';
import { formatInput } from '../../utils';

export default function TransactionForm({
    canEdit, handleAddItem, newItem, setNewItem, isProcessingAdd
}) {
    if (!canEdit) return null;

    return (
        <form onSubmit={handleAddItem} className="liquid-glass p-5 md:p-6 rounded-[32px] min-w-0 shadow-sm border border-white/60">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-white/60 border border-white/80 rounded-full flex items-center justify-center text-[#1A5B82] shadow-sm shrink-0">
                    <Plus size={16} strokeWidth={2.5}/>
                </div>
                <h3 className="text-[16px] font-bold text-[#1D1D1F] tracking-tight truncate">Ghi nhận giao dịch mới</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-12 gap-3 items-end">
                <div className="col-span-2 md:col-span-2 min-w-0">
                    <label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block pl-1 whitespace-nowrap">Ngày</label>
                    <input type="date" required className="w-full min-w-0 px-3 py-3 text-[14px] font-semibold liquid-input rounded-[14px] focus:border-[#26D0CE] outline-none transition-all text-[#1D1D1F] bg-white/60" value={newItem.ngay_ban} onChange={e => setNewItem({...newItem, ngay_ban: e.target.value})}/>
                </div>
                <div className="col-span-2 md:col-span-3 min-w-0">
                    <label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block pl-1 whitespace-nowrap">Sản Phẩm</label>
                    <input required className="w-full min-w-0 px-3 py-3 text-[14px] font-semibold liquid-input rounded-[14px] focus:border-[#26D0CE] outline-none transition-all text-[#1D1D1F] bg-white/60" placeholder="VD: Sơ mi..." value={newItem.ten_san_pham} onChange={e => setNewItem({...newItem, ten_san_pham: e.target.value})}/>
                </div>
                <div className="col-span-2 md:col-span-2 min-w-0">
                    <label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block pl-1 whitespace-nowrap">Link</label>
                    <input className="w-full min-w-0 px-3 py-3 text-[14px] font-medium liquid-input rounded-[14px] focus:border-[#26D0CE] outline-none transition-all text-[#1A5B82] bg-white/60" placeholder="Opt..." value={newItem.link_san_pham} onChange={e => setNewItem({...newItem, link_san_pham: e.target.value})}/>
                </div>
                <div className="col-span-1 md:col-span-1 min-w-0">
                    <label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block text-center whitespace-nowrap">Nhập</label>
                    <input required className="w-full min-w-0 px-1 py-3 text-[14px] font-bold text-[#1A5B82] liquid-input rounded-[14px] text-center focus:border-[#26D0CE] outline-none transition-all tabular-nums bg-white/60" placeholder="0" value={formatInput(newItem.so_luong_nhap)} onChange={e => setNewItem({...newItem, so_luong_nhap: e.target.value})}/>
                </div>
                <div className="col-span-1 md:col-span-1 min-w-0">
                    <label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block text-center whitespace-nowrap">Bán</label>
                    <input required className="w-full min-w-0 px-1 py-3 text-[14px] font-bold text-[#1DB2A0] liquid-input rounded-[14px] text-center focus:border-[#1DB2A0] outline-none transition-all tabular-nums bg-white/60" placeholder="0" value={formatInput(newItem.so_luong)} onChange={e => setNewItem({...newItem, so_luong: e.target.value})}/>
                </div>
                <div className="col-span-2 md:col-span-2 min-w-0">
                    <label className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block text-right pr-1 whitespace-nowrap">Tổng thu</label>
                    <input required className="w-full min-w-0 px-3 py-3 text-[15px] font-bold liquid-input rounded-[14px] text-right focus:border-[#26D0CE] outline-none transition-all text-[#1D1D1F] tabular-nums bg-white/60" placeholder="0" value={formatInput(newItem.so_tien_ban_duoc)} onChange={e => setNewItem({...newItem, so_tien_ban_duoc: e.target.value})}/>
                </div>
                <div className="col-span-2 md:col-span-1 min-w-0">
                    <button type="submit" disabled={isProcessingAdd} className="w-full min-w-0 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white py-3 rounded-[14px] font-bold hover:opacity-90 transition-colors flex items-center justify-center disabled:opacity-50 h-[46px] shadow-md active:opacity-70">
                        <Plus size={18} strokeWidth={2.5}/>
                    </button>
                </div>
            </div>
        </form>
    );
}