import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

export default function ConfirmModal({ confirmModal, setConfirmModal }) {
    if (!confirmModal.show) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all animate-fade-in">
            <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-[400px] animate-scale-up text-center shadow-2xl border border-white">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${confirmModal.isDanger ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-indigo-50 text-indigo-500 border border-indigo-100'}`}>
                    {confirmModal.isDanger ? <AlertCircle size={32}/> : <HelpCircle size={32}/>}
                </div>
                <h2 className="text-[22px] font-black text-gray-800 mb-2">{confirmModal.title}</h2>
                <p className="text-[14px] text-gray-500 font-medium mb-8 leading-relaxed">{confirmModal.message}</p>
                <div className="flex gap-3">
                    <button onClick={() => setConfirmModal({ show: false })} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy Bỏ</button>
                    <button onClick={confirmModal.onConfirm} className={`flex-1 py-3.5 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all ${confirmModal.isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90'}`}>
                        Xác Nhận
                    </button>
                </div>
            </div>
        </div>
    );
}