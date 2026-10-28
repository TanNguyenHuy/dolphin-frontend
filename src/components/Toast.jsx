import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function Toast({ toast }) {
    return (
        <div role={toast.type === 'error' ? 'alert' : 'status'} aria-hidden={!toast.show} className={`fixed top-5 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-md z-[9999] transition-all duration-200 ease-out pointer-events-none ${toast.show ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'}`}>
            <div className={`flex items-center gap-3 px-5 py-4 rounded-[20px] shadow-xl border ${toast.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-600'}`}>
                {toast.type === 'success' ? <CheckCircle2 size={24} className="shrink-0"/> : <AlertCircle size={24} className="shrink-0"/>}
                <p className="font-bold text-[14px] break-words">{toast.message}</p>
            </div>
        </div>
    );
}
