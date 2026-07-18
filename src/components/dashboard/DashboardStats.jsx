import React from 'react';
import { formatCurrency } from '../../utils';
import { Package, Percent, FileText } from 'lucide-react';

export default function DashboardStats({ globalTongCon, globalTongNhap, globalVonTon, taxAmount }) {
    // Tính phần trăm đã bán
    const sellProgress = globalTongNhap > 0 ? ((globalTongNhap - globalTongCon) / globalTongNhap) * 100 : 0;

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 lg:p-8 shadow-sm flex flex-col gap-8 h-full">
            <h3 className="text-[18px] font-black text-[#1D1D1F]">Kho, Vốn & Thuế</h3>
            
            {/* Tiến độ Kho */}
            <div>
                <div className="flex justify-between items-end mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 shadow-inner">
                            <Package size={20} />
                        </div>
                        <div>
                            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Tồn kho</div>
                            <div className="text-[22px] font-black text-[#1D1D1F] leading-none">{globalTongCon} <span className="text-[12px] font-bold text-gray-400">sp</span></div>
                        </div>
                    </div>
                    <span className="text-[16px] font-black text-blue-500">{sellProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner p-[2px]">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(sellProgress, 100)}%` }}></div>
                </div>
                <div className="text-[12px] font-bold text-gray-400 mt-2 text-right">Tổng nhập: {globalTongNhap}</div>
            </div>

            <div className="w-full h-[1px] bg-gray-100"></div>

            {/* Vốn Tồn */}
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shadow-inner">
                    <Percent size={24} />
                </div>
                <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Vốn Tồn Kho</div>
                    <div className="text-[20px] font-black text-[#1D1D1F]">{formatCurrency(globalVonTon)}đ</div>
                </div>
            </div>

            {/* Thuế */}
            <div className="flex items-center gap-4 mt-auto pt-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shadow-inner">
                    <FileText size={24} />
                </div>
                <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ước tính Thuế (1.5%)</div>
                    <div className="text-[20px] font-black text-[#1D1D1F]">{formatCurrency(taxAmount)}đ</div>
                </div>
            </div>
        </div>
    );
}