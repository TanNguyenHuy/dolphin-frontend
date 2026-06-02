import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteSessionModal({
    showDeleteModal,
    setShowDeleteModal,
    confirmDeleteSession
}) {
    if (!showDeleteModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all animate-fade-in">
            <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-[360px] text-center shadow-2xl animate-scale-up border border-white">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 bg-red-50 text-red-500 border border-red-100">
                    <AlertTriangle size={32}/>
                </div>
                <h2 className="text-[22px] font-black text-gray-800 mb-2">Xóa đợt thống kê?</h2>
                <p className="text-[14px] text-gray-500 font-medium mb-8 leading-relaxed">
                    Hành động này sẽ xóa <strong className="text-red-500">vĩnh viễn</strong> toàn bộ dữ liệu của đợt bán này và không thể khôi phục.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowDeleteModal(false)} 
                        className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Hủy Bỏ
                    </button>
                    <button 
                        onClick={confirmDeleteSession} 
                        className="flex-1 py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg active:scale-95 transition-all"
                    >
                        Xóa Ngay
                    </button>
                </div>
            </div>
        </div>
    );
}