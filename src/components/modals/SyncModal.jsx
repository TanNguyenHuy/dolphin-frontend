import React from 'react';
import { X, RefreshCw } from 'lucide-react';
import { formatInput } from '../../utils';

export default function SyncModal({
    syncRow,
    setSyncRow,
    syncText,
    setSyncText,
    syncManualQty,
    setSyncManualQty,
    syncManualRev,
    setSyncManualRev,
    handleConfirmSync,
    isProcessingEdit
}) {
    if (!syncRow) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-[420px] animate-scale-up relative shadow-2xl border border-white">
                <button 
                    onClick={() => {
                        setSyncRow(null); 
                        setSyncText(''); 
                        setSyncManualQty(''); 
                        setSyncManualRev('');
                    }} 
                    className="absolute top-5 right-5 text-gray-500 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors active:scale-95"
                >
                    <X size={20}/>
                </button>
                
                <div className="mb-4">
                    <h2 className="text-[22px] font-bold text-[#1D1D1F] tracking-tight flex items-center gap-2">
                        <RefreshCw className="text-[#1DB2A0]"/> Cập nhật từ IG
                    </h2>
                    <p className="text-[13px] text-[#5c5c5c] mt-1">
                        Cập nhật thay thế cho: <strong className="text-[#1A5B82]">{syncRow.ten_san_pham}</strong>
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <textarea 
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#26D0CE] focus:bg-white rounded-[16px] text-[12px] font-mono text-[#1D1D1F] outline-none transition-all resize-none h-[80px] custom-scrollbar placeholder-gray-400"
                            placeholder="Dán mã JSON hoặc copy dòng chữ 'Đã quét: X món...' từ Tool vào đây."
                            value={syncText}
                            onChange={e => setSyncText(e.target.value)}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 w-full border-t border-gray-100 pt-4">
                        <div>
                            <label className="text-[11px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block pl-1">SL Bán Mới</label>
                            <input 
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-[16px] font-bold text-[#1DB2A0] text-center tabular-nums outline-none transition-all focus:border-[#1DB2A0] focus:bg-white" 
                                value={formatInput(syncManualQty)} 
                                onChange={e => setSyncManualQty(e.target.value)} 
                                placeholder="0" 
                            />
                        </div>
                        <div>
                            <label className="text-[11px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1 block pl-1">Tổng thu Mới</label>
                            <input 
                                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-[16px] text-[16px] font-bold text-[#33A1FD] text-right tabular-nums outline-none transition-all tracking-tight focus:border-[#33A1FD] focus:bg-white" 
                                value={formatInput(syncManualRev)} 
                                onChange={e => setSyncManualRev(e.target.value)} 
                                placeholder="0" 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 flex gap-3">
                    <button 
                        onClick={() => {
                            setSyncRow(null); 
                            setSyncText(''); 
                            setSyncManualQty(''); 
                            setSyncManualRev('');
                        }} 
                        className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-[14px]"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={handleConfirmSync} 
                        disabled={isProcessingEdit || (!syncManualQty && !syncManualRev)} 
                        className="flex-1 bg-gradient-to-r from-[#1DB2A0] to-[#159a8a] text-white py-3.5 rounded-2xl font-bold hover:opacity-90 transition-all disabled:opacity-50 text-[14px] shadow-lg active:scale-95"
                    >
                        {isProcessingEdit ? 'Đang lưu...' : 'Cập nhật'}
                    </button>
                </div>
            </div>
        </div>
    );
}