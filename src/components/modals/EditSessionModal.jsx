import React from 'react';
import { X, Settings2 } from 'lucide-react';
import { formatInput } from '../../utils';

export default function EditSessionModal({
    editingSession, setEditingSession, handleSaveSession
}) {
    if (!editingSession) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all">
            <div className="liquid-glass bg-white/80 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] p-6 md:p-8 w-full max-w-[420px] animate-scale-up relative shadow-[0_24px_60px_rgba(0,0,0,0.2)] border border-white">
                <button onClick={() => setEditingSession(null)} className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center text-gray-500 bg-white/50 hover:bg-white hover:text-rose-500 border border-gray-100 rounded-full transition-all active:scale-90 shadow-sm">
                    <X size={20} strokeWidth={2.5}/>
                </button>
                
                <div className="mb-6 md:mb-8 pr-8">
                    <h2 className="text-[22px] md:text-[24px] font-black text-[#1D1D1F] tracking-tight flex items-center gap-2.5">
                        <Settings2 className="text-[#33A1FD]" size={24} strokeWidth={2.5}/> Cấu hình Đợt bán
                    </h2>
                </div>
                
                <div className="space-y-5">
                    <div>
                        <label className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block pl-1">Tên hiển thị (Tùy chọn)</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3.5 bg-white/50 border border-gray-200/60 rounded-[16px] text-[15px] font-bold text-[#1D1D1F] outline-none transition-all focus:border-[#26D0CE] focus:bg-white focus:ring-4 focus:ring-[#26D0CE]/20 shadow-sm placeholder:text-gray-400 placeholder:font-medium" 
                            value={editingSession.name === 'Thống kê tự động' ? '' : editingSession.name} 
                            placeholder="Để trống hệ thống sẽ lấy Ngày" 
                            onChange={e => setEditingSession({...editingSession, name: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block pl-1">Chi phí Nhập Kiện Khởi Điểm</label>
                        <input 
                            className="w-full px-4 py-3.5 bg-white/50 border border-gray-200/60 rounded-[16px] text-[18px] font-black text-[#1D1D1F] text-right tabular-nums outline-none transition-all focus:border-[#26D0CE] focus:bg-white focus:ring-4 focus:ring-[#26D0CE]/20 shadow-sm placeholder:text-gray-300" 
                            value={formatInput(editingSession.so_tien_cua_kien)} 
                            onChange={e => setEditingSession({...editingSession, so_tien_cua_kien: e.target.value})} 
                        />
                    </div>
                    
                    <div className="pt-2">
                        <label className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block pl-1">Chi phí khác (Giặt ủi... Auto 4%)</label>
                        <input 
                            disabled 
                            className="w-full px-4 py-3.5 bg-gray-100/50 border border-gray-200/50 rounded-[16px] text-[18px] font-black text-gray-400 text-right tabular-nums outline-none cursor-not-allowed shadow-inner" 
                            value={formatInput(Math.round((editingSession.so_tien_cua_kien || 0) * 0.04))} 
                            readOnly 
                        />
                    </div>
                </div>

                <div className="mt-8 flex gap-3">
                    <button onClick={() => setEditingSession(null)} className="flex-1 h-[52px] rounded-[16px] font-bold text-gray-600 bg-white/60 hover:bg-white border border-gray-200/60 transition-all text-[14px] md:text-[15px] active:scale-95 shadow-sm">
                        Hủy
                    </button>
                    <button onClick={handleSaveSession} className="flex-1 h-[52px] bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white rounded-[16px] font-bold hover:opacity-90 transition-all shadow-[0_8px_20px_rgba(38,208,206,0.3)] text-[14px] md:text-[15px] active:scale-95">
                        Lưu Cấu Hình
                    </button>
                </div>
            </div>
        </div>
    );
}