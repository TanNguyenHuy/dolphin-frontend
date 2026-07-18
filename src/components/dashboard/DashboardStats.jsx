import React from 'react';
import { formatCurrency } from '../../utils';
import { Package, Percent, FileText } from 'lucide-react';

export default function DashboardStats({ globalTongCon, globalTongNhap, globalVonTon, taxAmount }) {
    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 lg:p-8 shadow-sm flex flex-col justify-center gap-8 h-full">
            <h3 className="text-[18px] font-black text-[#1D1D1F] mb-2">Kho, Vốn & Thuế</h3>
            
            {/* Tồn kho */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-inner shrink-0">
                    <Package size={22} strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tồn kho</div>
                    <div className="text-[20px] font-black text-[#1D1D1F] leading-none">
                        {globalTongCon} <span className="text-[12px] font-bold text-gray-400">/ {globalTongNhap} sp</span>
                    </div>
                </div>
            </div>

            <div className="w-full h-[1px] bg-gray-100"></div>

            {/* Vốn Tồn */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shadow-inner shrink-0">
                    <Percent size={22} strokeWidth={2.5} />
                </div>
                <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vốn Tồn Kho</div>
                    <div className="text-[20px] font-black text-[#1D1D1F]">{formatCurrency(globalVonTon)}đ</div>
                </div>
            </div>

            {/* Thêm một đường phân cách nữa để bố cục cân đối */}
            <div className="w-full h-[1px] bg-gray-100"></div>

            {/* Thuế */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-inner shrink-0">
                    <FileText size={22} strokeWidth={2.5} />
                </div>
                <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ước tính Thuế (1.5%)</div>
                    <div className="text-[20px] font-black text-[#1D1D1F]">{formatCurrency(taxAmount)}đ</div>
                </div>
            </div>
        </div>
    );
}