import React from 'react';
import { Package, Percent } from 'lucide-react';
import { formatCurrency, formatInput } from '../../utils';

export default function DashboardStats({
    globalTongCon, globalTongNhap, globalVonTon, displayRevenueTr, taxAmount, totalRevenueForTax
}) {
    return (
        <div className="lg:col-span-5 flex flex-col gap-4 md:gap-6">
            <div className="liquid-glass rounded-[28px] p-6 md:p-8 flex-1 flex flex-col justify-center border border-white/60 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#5c5c5c] uppercase tracking-wider"><Package size={16}/> Kho & Vốn</div>
                    <div className="text-[11px] font-bold text-[#8E8E93] bg-white/80 px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm">{formatInput(globalTongCon)} / {formatInput(globalTongNhap)}</div>
                </div>
                <div className="text-[24px] md:text-[28px] font-black text-[#1D1D1F] tabular-nums tracking-tight">
                    {formatCurrency(globalVonTon)} <span className="text-[14px] text-[#8E8E93] font-semibold">đ</span>
                </div>
            </div>

            <div className="liquid-glass rounded-[28px] p-6 md:p-8 flex-1 flex flex-col justify-center relative overflow-hidden border border-white/60 shadow-sm hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#FF3B30] uppercase tracking-wider"><Percent size={16}/> Ước tính thuế</div>
                    <div className="text-[11px] font-bold text-[#8E8E93] bg-white/80 px-2.5 py-1 rounded-lg tabular-nums border border-gray-200 shadow-sm">{displayRevenueTr} / 500M</div>
                </div>
                <div className="text-[24px] md:text-[28px] font-black text-[#1D1D1F] tabular-nums tracking-tight relative z-10">
                    {formatCurrency(taxAmount)} <span className="text-[14px] text-[#8E8E93] font-semibold">đ</span>
                </div>
                <div className="absolute bottom-0 left-0 h-1.5 bg-[#FF3B30] transition-all duration-1000 group-hover:h-2 opacity-80" style={{ width: `${Math.min((totalRevenueForTax / 500000000) * 100, 100)}%` }}></div>
            </div>
        </div>
    );
}