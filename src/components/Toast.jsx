import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ toast }) {
    return (
        <div className={`fixed top-5 right-5 z-[9999] transition-all duration-500 ease-in-out ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'}`}>
            <div className={`flex items-center gap-3 px-6 py-4 rounded-[20px] shadow-2xl border ${toast.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-600'}`}>
                {toast.type === 'success' ? <CheckCircle2 size={24}/> : <AlertCircle size={24}/>}
                <p className="font-bold text-[14px] tracking-wide">{toast.message}</p>
            </div>
        </div>
    );
}