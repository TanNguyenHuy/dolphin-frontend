import React from 'react';
import { X } from 'lucide-react';

export default function BillModal({ selectedBill, setSelectedBill }) {
    if (!selectedBill) return null;

    return (
        <div className="fixed inset-0 z-[999] bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in">
            <button onClick={() => setSelectedBill(null)} className="absolute top-10 right-10 text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all"><X size={30}/></button>
            <img src={selectedBill} className="max-w-full max-h-[85vh] object-contain border-4 border-white rounded-[24px] shadow-2xl" alt="Bill" />
        </div>
    );
}