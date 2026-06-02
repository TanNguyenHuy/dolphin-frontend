import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function BlockModal({ blockModal }) {
    if (!blockModal.show) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-[400px] text-center shadow-2xl animate-scale-up border border-white">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 bg-red-50 text-red-500 border border-red-100">
                    <AlertTriangle size={32}/>
                </div>
                <h2 className="text-[22px] font-black text-gray-800 mb-2">Quyền Truy Cập Bị Chặn</h2>
                <p className="text-[14px] text-gray-500 font-medium mb-8 leading-relaxed">{blockModal.message}</p>
                <button 
                    onClick={() => { 
                        localStorage.removeItem('authUser'); 
                        sessionStorage.removeItem('authUser'); 
                        window.location.reload(); 
                    }} 
                    className="w-full py-3.5 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg active:scale-95 transition-all"
                >
                    Đã Hiểu và Đăng Xuất
                </button>
            </div>
        </div>
    );
}