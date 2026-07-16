import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DeleteRowModal({
    showDeleteRowModal, setShowDeleteRowModal, confirmDeleteRow, isProcessingDelete
}) {
    if (!showDeleteRowModal) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all animate-fade-in">
            <div className="liquid-glass bg-white/80 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] p-6 md:p-8 w-full max-w-[400px] text-center shadow-[0_24px_60px_rgba(0,0,0,0.2)] animate-scale-up border border-white relative">
                
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-red-50 to-rose-100 text-rose-500 border border-red-200/50 shadow-inner">
                    <Trash2 size={36} strokeWidth={2.5}/>
                </div>
                
                <h2 className="text-[24px] font-black text-[#1D1D1F] mb-3 tracking-tight">Xóa sản phẩm này?</h2>
                <p className="text-[14px] md:text-[15px] text-gray-500 font-medium mb-8 leading-relaxed px-2">
                    Dữ liệu của sản phẩm sẽ bị xóa hoàn toàn khỏi đợt bán hiện tại và không thể khôi phục.
                </p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowDeleteRowModal(false)} 
                        className="flex-1 h-[52px] rounded-[16px] font-bold text-gray-600 bg-white/60 hover:bg-white border border-gray-200/60 transition-all text-[14px] md:text-[15px] active:scale-95 shadow-sm"
                    >
                        Hủy Bỏ
                    </button>
                    <button 
                        onClick={confirmDeleteRow} 
                        disabled={isProcessingDelete} 
                        className="flex-1 h-[52px] bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-[16px] font-bold hover:opacity-90 shadow-[0_8px_20px_rgba(225,29,72,0.3)] active:scale-95 transition-all text-[14px] md:text-[15px] disabled:opacity-50"
                    >
                        {isProcessingDelete ? 'Đang Xóa...' : 'Xóa Ngay'}
                    </button>
                </div>
            </div>
        </div>
    );
}