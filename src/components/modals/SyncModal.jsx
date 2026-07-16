import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import { formatInput } from '../../utils';

export default function SyncModal({
    syncRow, setSyncRow, syncText, setSyncText,
    syncManualQty, setSyncManualQty, syncManualRev, setSyncManualRev,
    handleConfirmSync, isProcessingEdit
}) {
    if (!syncRow) return null;

    return (
        // Màn chiếu tối 60% + Kính mờ
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
            <div className="liquid-glass bg-white/80 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] p-6 md:p-8 w-full max-w-[420px] animate-scale-up relative shadow-[0_24px_60px_rgba(0,0,0,0.2)] border border-white">
                
                {/* Nút X chuẩn Touch Target 44px */}
                <button 
                    onClick={() => { setSyncRow(null); setSyncText(''); setSyncManualQty(''); setSyncManualRev(''); }} 
                    className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center text-gray-500 bg-white/50 hover:bg-white hover:text-rose-500 rounded-full transition-all shadow-sm active:scale-90 border border-gray-100"
                >
                    <X size={20} strokeWidth={2.5}/>
                </button>
                
                <div className="mb-6 pr-8">
                    <h2 className="text-[22px] md:text-[24px] font-black text-[#1D1D1F] tracking-tight flex items-center gap-2.5 mb-2">
                        <RefreshCw className="text-[#1DB2A0]" size={24} strokeWidth={2.5}/> Cập nhật từ IG
                    </h2>
                    <p className="text-[13px] md:text-[14px] text-gray-500 font-medium leading-relaxed">
                        Cập nhật số liệu cho: <strong className="text-[#1A5B82] bg-blue-50 px-2 py-0.5 rounded-md">{syncRow.ten_san_pham}</strong>
                    </p>
                </div>

                <div className="space-y-5">
                    <div>
                        <textarea 
                            className="w-full px-4 py-4 bg-white/50 border border-gray-200/60 focus:border-[#26D0CE] focus:bg-white focus:ring-4 focus:ring-[#26D0CE]/20 rounded-[20px] text-[13px] font-mono text-[#1D1D1F] outline-none transition-all resize-none h-[90px] custom-scrollbar placeholder:text-gray-400 shadow-inner"
                            placeholder="Dán mã JSON hoặc copy dòng chữ 'Đã quét: X món...' từ Tool vào đây."
                            value={syncText} onChange={e => setSyncText(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 w-full border-t border-gray-200/50 pt-5">
                        <div>
                            <label className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block pl-1">SL Bán Mới</label>
                            <input 
                                className="w-full px-4 py-3.5 bg-white/50 border border-gray-200/60 rounded-[16px] text-[18px] font-black text-[#1DB2A0] text-center tabular-nums outline-none transition-all focus:border-[#1DB2A0] focus:bg-white focus:ring-4 focus:ring-[#1DB2A0]/20 shadow-sm" 
                                value={formatInput(syncManualQty)} onChange={e => setSyncManualQty(e.target.value)} placeholder="0" 
                            />
                        </div>
                        <div>
                            <label className="text-[10px] md:text-[11px] font-black text-gray-500 uppercase tracking-widest mb-1.5 block pl-1">Tổng thu Mới</label>
                            <input 
                                className="w-full px-4 py-3.5 bg-white/50 border border-gray-200/60 rounded-[16px] text-[18px] font-black text-[#33A1FD] text-right tabular-nums outline-none transition-all focus:border-[#33A1FD] focus:bg-white focus:ring-4 focus:ring-[#33A1FD]/20 shadow-sm" 
                                value={formatInput(syncManualRev)} onChange={e => setSyncManualRev(e.target.value)} placeholder="0" 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 flex gap-3">
                    <button 
                        onClick={() => { setSyncRow(null); setSyncText(''); setSyncManualQty(''); setSyncManualRev(''); }} 
                        className="flex-1 h-[52px] rounded-[16px] font-bold text-gray-600 bg-white/60 hover:bg-white border border-gray-200/60 transition-all text-[14px] md:text-[15px] active:scale-95 shadow-sm"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleConfirmSync} 
                        disabled={isProcessingEdit || (!syncManualQty && !syncManualRev)} 
                        className="flex-1 h-[52px] bg-gradient-to-r from-[#1DB2A0] to-[#159a8a] text-white rounded-[16px] font-bold hover:opacity-90 transition-all disabled:opacity-50 text-[14px] md:text-[15px] shadow-[0_8px_20px_rgba(29,178,160,0.3)] active:scale-95"
                    >
                        {isProcessingEdit ? 'Đang lưu...' : 'Cập nhật'}
                    </button>
                </div>
            </div>
        </div>
    );
}