import React from 'react';
import { Plus } from 'lucide-react';
import { formatInput } from '../../utils';

export default function TransactionForm({
    canEdit, handleAddItem, newItem, setNewItem, isProcessingAdd
}) {
    if (!canEdit) return null;

    return (
        <form onSubmit={handleAddItem} className="liquid-glass bg-white/40 p-6 md:p-8 rounded-[32px] md:rounded-[40px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-[#33A1FD] to-[#26D0CE] rounded-full flex items-center justify-center text-white shadow-sm shrink-0">
                    <Plus size={18} strokeWidth={2.5}/>
                </div>
                <h3 className="text-[18px] md:text-[20px] font-black text-[#1D1D1F] tracking-tight truncate">Ghi nhận giao dịch mới</h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-12 gap-4 items-end">
                <div className="col-span-2 md:col-span-2 min-w-0">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block pl-1">Ngày</label>
                    <input type="date" required className="w-full min-w-0 px-4 py-3.5 text-[14px] font-bold bg-white/80 border border-white/80 rounded-[16px] focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 outline-none transition-all text-[#1D1D1F] shadow-sm" value={newItem.ngay_ban} onChange={e => setNewItem({...newItem, ngay_ban: e.target.value})}/>
                </div>
                <div className="col-span-2 md:col-span-3 min-w-0">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block pl-1">Sản Phẩm</label>
                    <input required className="w-full min-w-0 px-4 py-3.5 text-[14px] font-bold bg-white/80 border border-white/80 rounded-[16px] focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 outline-none transition-all text-[#1D1D1F] shadow-sm placeholder:font-medium placeholder:text-gray-400" placeholder="VD: Sơ mi..." value={newItem.ten_san_pham} onChange={e => setNewItem({...newItem, ten_san_pham: e.target.value})}/>
                </div>
                <div className="col-span-2 md:col-span-2 min-w-0">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block pl-1">Link (Opt)</label>
                    <input className="w-full min-w-0 px-4 py-3.5 text-[14px] font-bold bg-white/80 border border-white/80 rounded-[16px] focus:bg-white focus:border-[#33A1FD] focus:ring-4 focus:ring-[#33A1FD]/20 outline-none transition-all text-[#33A1FD] shadow-sm placeholder:font-medium placeholder:text-blue-300" placeholder="https..." value={newItem.link_san_pham} onChange={e => setNewItem({...newItem, link_san_pham: e.target.value})}/>
                </div>
                <div className="col-span-1 md:col-span-1 min-w-0">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block text-center">Nhập</label>
                    <input required className="w-full min-w-0 px-2 py-3.5 text-[15px] font-black text-[#1A5B82] bg-white/80 border border-white/80 rounded-[16px] text-center focus:bg-white focus:border-[#1A5B82] focus:ring-4 focus:ring-[#1A5B82]/20 outline-none transition-all tabular-nums shadow-sm placeholder:text-gray-400" placeholder="0" value={formatInput(newItem.so_luong_nhap)} onChange={e => setNewItem({...newItem, so_luong_nhap: e.target.value})}/>
                </div>
                <div className="col-span-1 md:col-span-1 min-w-0">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block text-center">Bán</label>
                    <input required className="w-full min-w-0 px-2 py-3.5 text-[15px] font-black text-[#1DB2A0] bg-white/80 border border-white/80 rounded-[16px] text-center focus:bg-white focus:border-[#1DB2A0] focus:ring-4 focus:ring-[#1DB2A0]/20 outline-none transition-all tabular-nums shadow-sm placeholder:text-gray-400" placeholder="0" value={formatInput(newItem.so_luong)} onChange={e => setNewItem({...newItem, so_luong: e.target.value})}/>
                </div>
                <div className="col-span-2 md:col-span-2 min-w-0">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block text-right pr-2">Tổng thu</label>
                    <input required className="w-full min-w-0 px-4 py-3.5 text-[16px] font-black bg-white/80 border border-white/80 rounded-[16px] text-right focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 outline-none transition-all text-[#1D1D1F] tabular-nums shadow-sm placeholder:text-gray-400" placeholder="0" value={formatInput(newItem.so_tien_ban_duoc)} onChange={e => setNewItem({...newItem, so_tien_ban_duoc: e.target.value})}/>
                </div>
                <div className="col-span-2 md:col-span-1 min-w-0">
                    <button type="submit" disabled={isProcessingAdd} className="w-full min-w-0 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white rounded-[16px] font-bold hover:opacity-90 hover:shadow-[0_8px_20px_rgba(38,208,206,0.3)] transition-all flex items-center justify-center disabled:opacity-50 h-[52px] shadow-md active:scale-95">
                        <Plus size={20} strokeWidth={2.5}/>
                    </button>
                </div>
            </div>
        </form>
    );
}