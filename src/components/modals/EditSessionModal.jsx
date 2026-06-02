import React from 'react';
import { X } from 'lucide-react';
import { formatInput } from '../../utils';

export default function EditSessionModal({
    editingSession,
    setEditingSession,
    handleSaveSession
}) {
    if (!editingSession) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-[400px] animate-scale-up relative shadow-2xl border border-white">
                <button onClick={() => setEditingSession(null)} className="absolute top-5 right-5 text-gray-500 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors active:scale-95">
                    <X size={20}/>
                </button>
                <div className="mb-6"><h2 className="text-[24px] font-bold text-[#1D1D1F] tracking-tight">Thiết lập đợt bán</h2></div>
                <div className="space-y-4">
                    <div>
                        <label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Tên hiển thị (Tùy chọn)</label>
                        <input type="text" className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-[15px] font-medium text-[#1D1D1F] outline-none transition-all focus:border-[#26D0CE] focus:bg-white" value={editingSession.name === 'Thống kê tự động' ? '' : editingSession.name} placeholder="Để trống hệ thống sẽ lấy Ngày" onChange={e => setEditingSession({...editingSession, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Chi phí Nhập Kiện</label>
                        <input className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-[17px] font-bold text-[#1D1D1F] text-right tabular-nums outline-none transition-all tracking-tight focus:border-[#26D0CE] focus:bg-white" value={formatInput(editingSession.so_tien_cua_kien)} onChange={e => setEditingSession({...editingSession, so_tien_cua_kien: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="text-[12px] font-semibold text-[#5c5c5c] mb-1.5 ml-1 block">Chi phí khác (Giặt ủi... Tự động 4%)</label>
                        <input disabled className="w-full px-4 py-3.5 bg-gray-100 border border-gray-200 rounded-[16px] text-[17px] font-bold text-[#1D1D1F] text-right tabular-nums outline-none cursor-not-allowed opacity-70" value={formatInput(Math.round((editingSession.so_tien_cua_kien || 0) * 0.04))} readOnly />
                    </div>
                </div>
                <div className="mt-8 flex gap-3">
                    <button onClick={() => setEditingSession(null)} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-[15px]">Hủy</button>
                    <button onClick={handleSaveSession} className="flex-1 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white py-3.5 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg text-[15px] active:scale-95">Cập nhật</button>
                </div>
            </div>
        </div>
    );
}