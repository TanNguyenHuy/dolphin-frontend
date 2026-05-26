import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Wallet, Pencil, Trash2, ChevronRight, TrendingUp, Package, Percent, ChevronLeft } from 'lucide-react';
import { formatCurrency, formatInput, getSessionName } from '../utils';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

// Custom Tooltip hiển thị kính mờ (Glassmorphism) cực đẹp khi rê chuột
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#1D1D1F]/80 backdrop-blur-xl border border-white/20 p-4 rounded-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.25)] transform transition-all">
                <p className="text-white/60 text-[11px] uppercase tracking-widest mb-1.5 font-bold flex items-center gap-2">
                    <Calendar size={12} /> Đợt {data.name}
                </p>
                <p className={`text-[18px] font-black tracking-tight drop-shadow-md ${data.profit >= 0 ? 'text-[#26D0CE]' : 'text-[#FF453A]'}`}>
                    {formatCurrency(data.profit)} <span className="text-[12px] font-bold opacity-80">VNĐ</span>
                </p>
            </div>
        );
    }
    return null;
};

export default function DashboardView({
    dashboardProfit, globalTongCon, globalTongNhap, globalVonTon, showTax, taxAmount, displayRevenueTr, totalRevenueForTax, 
    safeSessions, enrichedSessions, fetchDetail, isAdmin, canEdit, canDelete, canPay, 
    setSalarySession, setShowSalaryModal, handleStartEditSession, handleDeleteSession
}) {

    const chartDataByYear = useMemo(() => {
        const data = {};
        enrichedSessions.forEach(ss => {
            const dateStr = ss.actual_start_date || ss.start_date;
            if (!dateStr) return;
            const year = new Date(dateStr).getFullYear();
            if (!data[year]) data[year] = [];

            let shortName = ss.name;
            if (!shortName || shortName === 'Thống kê tự động' || shortName.toLowerCase().includes('sale')) {
                 shortName = `${new Date(dateStr).getDate()}/${new Date(dateStr).getMonth() + 1}`;
            }

            data[year].push({
                name: shortName,
                profit: ss.realProfit,
                fullDate: dateStr
            });
        });

        Object.keys(data).forEach(year => {
            data[year].sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));
        });
        return data;
    }, [enrichedSessions]);

    const availableYears = useMemo(() => {
        return Object.keys(chartDataByYear).map(Number).sort((a, b) => b - a);
    }, [chartDataByYear]);

    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0]);
        }
    }, [availableYears, selectedYear]);

    const currentChartData = chartDataByYear[selectedYear] || [];
    const yearlyTotal = currentChartData.reduce((sum, item) => sum + item.profit, 0);

    const handlePrevYear = () => {
        const currentIndex = availableYears.indexOf(selectedYear);
        if (currentIndex < availableYears.length - 1) setSelectedYear(availableYears[currentIndex + 1]);
    };

    const handleNextYear = () => {
        const currentIndex = availableYears.indexOf(selectedYear);
        if (currentIndex > 0) setSelectedYear(availableYears[currentIndex - 1]);
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in-up pb-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                
                {/* ---------- CỘT TRÁI: BIỂU ĐỒ NÂNG CẤP LÀM LẠI ---------- */}
                <div className="lg:col-span-7 bg-gradient-to-br from-[#475569] to-[#1e293b] rounded-[32px] p-5 md:p-8 text-white relative shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-white/10 flex flex-col min-h-[350px] overflow-hidden">
                    
                    {/* Họa tiết lót nền cho sang */}
                    <div className="absolute right-0 bottom-0 opacity-[0.03] transform translate-x-1/4 translate-y-1/4 pointer-events-none">
                        <TrendingUp size={200} strokeWidth={1} />
                    </div>

                    <div className="flex justify-between items-start mb-6 z-10 relative">
                        <div>
                            <h3 className="text-[12px] md:text-[13px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2 mb-1">
                                Lợi nhuận năm {selectedYear}
                            </h3>
                            <div className="text-[32px] md:text-[44px] font-black tracking-tight tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#26D0CE] to-[#33A1FD] leading-none drop-shadow-md">
                                {formatCurrency(yearlyTotal)}<span className="text-[16px] text-white/50 ml-1.5 font-bold">đ</span>
                            </div>
                            <div className="text-[11px] text-white/40 font-semibold mt-2 bg-white/5 inline-block px-2.5 py-1.5 rounded-lg border border-white/5">
                                TỔNG TẤT CẢ (ALL-TIME): <span className="text-white/80">{formatCurrency(dashboardProfit)}đ</span>
                            </div>
                        </div>

                        {/* Nút lật qua lật lại giữa các năm */}
                        {availableYears.length > 1 && (
                            <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 backdrop-blur-md border border-white/10 shadow-inner">
                                <button onClick={handlePrevYear} disabled={selectedYear === availableYears[availableYears.length - 1]} className="p-1.5 hover:bg-white/20 rounded-full disabled:opacity-20 transition-all active:scale-95"><ChevronLeft size={16}/></button>
                                <span className="font-bold text-[13px] w-[40px] text-center tabular-nums text-white drop-shadow-sm">{selectedYear}</span>
                                <button onClick={handleNextYear} disabled={selectedYear === availableYears[0]} className="p-1.5 hover:bg-white/20 rounded-full disabled:opacity-20 transition-all active:scale-95"><ChevronRight size={16}/></button>
                            </div>
                        )}
                    </div>

                    {/* Vùng Vẽ Biểu Đồ (Đã thêm Gradient & Animation) */}
                    <div className="flex-1 w-full mt-4 z-10 relative min-h-[220px]">
                        {currentChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={currentChartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                        {/* Tạo màu Gradient cho cột Xanh (Lời) */}
                                        <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#33A1FD" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="#26D0CE" stopOpacity={0.8}/>
                                        </linearGradient>
                                        {/* Tạo màu Gradient cho cột Đỏ (Lỗ) */}
                                        <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#FF6B60" stopOpacity={1}/>
                                            <stop offset="100%" stopColor="#D70015" stopOpacity={0.8}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.08)" vertical={false} />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} fontWeight="600" tickLine={false} axisLine={false} dy={10} />
                                    
                                    {/* Nền xám nhạt bo tròn khi rê chuột vào cột */}
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.06)', radius: 8 }} />
                                    
                                    {/* Khai báo cột với hiệu ứng Animation mọc lên */}
                                    <Bar dataKey="profit" radius={[8, 8, 8, 8]} maxBarSize={45} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                                        {currentChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? 'url(#colorProfit)' : 'url(#colorLoss)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-white/30 text-[13px] font-medium border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                                <Calendar size={32} className="mb-2 opacity-50" />
                                Chưa có dữ liệu đợt bán nào trong năm {selectedYear}
                            </div>
                        )}
                    </div>
                </div>

                {/* ---------- CỘT PHẢI: KHO & THUẾ ---------- */}
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
                        {/* Hiệu ứng thanh chạy thuế */}
                        <div className="absolute bottom-0 left-0 h-1.5 bg-[#FF3B30] transition-all duration-1000 group-hover:h-2 opacity-80" style={{ width: `${Math.min((totalRevenueForTax / 500000000) * 100, 100)}%` }}></div>
                    </div>
                </div>
            </div>

            {/* DANH SÁCH ĐỢT BÁN */}
            <div className="liquid-glass rounded-[32px] p-3 sm:p-6 md:p-8 border border-white/60 shadow-sm">
                <div className="flex justify-between items-center mb-6 px-2 md:px-0">
                    <h2 className="text-[20px] md:text-[22px] font-bold text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                    <span className="text-[13px] font-bold bg-white/80 border border-gray-200 text-[#1D1D1F] px-3.5 py-1 rounded-full shadow-sm">{enrichedSessions.length}</span>
                </div>

                <div className="flex flex-col gap-4 md:gap-5">
                    {enrichedSessions.map((session, index) => {
                        const isLoss = session.realProfit < 0;
                        return (
                            <div 
                                key={session.id} 
                                onClick={() => fetchDetail(session.id)}
                                className="bg-white/60 hover:bg-white border border-white/80 shadow-sm hover:shadow-md rounded-[24px] p-4 md:p-5 transition-all cursor-pointer flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-6 relative group"
                            >
                                <div className="flex items-center gap-3 md:gap-4 min-w-0 xl:w-[25%] shrink-0">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-[13px] md:text-[14px] bg-white border border-gray-100 shadow-sm text-[#1D1D1F] shrink-0 tabular-nums">
                                        {enrichedSessions.length - index}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-[#1D1D1F] text-[14px] md:text-[15px] truncate flex items-center gap-2 group-hover:text-[#1A5B82] transition-colors">
                                            {getSessionName(session.name, session.actual_start_date, session.actual_end_date)}
                                        </h3>
                                        <div className="flex items-center gap-1.5 text-[11px] md:text-[12px] text-[#5c5c5c] font-medium mt-1">
                                            <Calendar size={12} />
                                            <span>{Math.max(0, Math.ceil((new Date(session.actual_end_date) - new Date(session.actual_start_date)) / (1000 * 60 * 60 * 24)))} ngày</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between xl:justify-center gap-2 md:gap-3 xl:w-[25%] shrink-0 pl-12 md:pl-16 xl:pl-0 w-full xl:w-auto">
                                    <div className="flex-1 xl:flex-none xl:w-[65px] bg-white/70 border border-gray-200/60 rounded-[14px] py-2 text-center shadow-sm">
                                        <div className="text-[9px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Nhập</div>
                                        <div className="font-bold text-[#1D1D1F] text-[13px] md:text-[14px] tabular-nums">{formatInput(session.tong_sl_nhap || 0)}</div>
                                    </div>
                                    <div className="flex-1 xl:flex-none xl:w-[65px] bg-[#1DB2A0]/10 border border-[#1DB2A0]/20 rounded-[14px] py-2 text-center shadow-sm">
                                        <div className="text-[9px] font-bold text-[#1A5B82] uppercase tracking-wider mb-0.5 whitespace-nowrap">Bán</div>
                                        <div className="font-bold text-[#1A5B82] text-[13px] md:text-[14px] tabular-nums">{formatInput(session.tong_sl_ban || 0)}</div>
                                    </div>
                                    <div className="flex-1 xl:flex-none xl:w-[65px] bg-white/70 border border-gray-200/60 rounded-[14px] py-2 text-center shadow-sm">
                                        <div className="text-[9px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Còn</div>
                                        <div className="font-bold text-[#1D1D1F] text-[13px] md:text-[14px] tabular-nums">{formatInput((session.tong_sl_nhap || 0) - (session.tong_sl_ban || 0))}</div>
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center xl:w-[20%] shrink-0 pl-12 md:pl-16 xl:pl-0 w-full xl:w-auto">
                                    <div className="flex items-center justify-between xl:justify-start gap-2 text-[11px] md:text-[12px]">
                                        <span className="text-[#5c5c5c]">Chi phí</span>
                                        <span className="font-bold text-[#1D1D1F] tabular-nums">{formatCurrency((session.so_tien_cua_kien || 0) + (session.so_tien_giat_ui || 0) + session.autoAdCost)}</span>
                                    </div>
                                    <div className="flex items-center justify-between xl:justify-start gap-2 text-[10px] md:text-[11px] mt-1 xl:mt-0.5">
                                        <span className="text-[#8E8E93]">Vốn tồn</span>
                                        <span className="font-medium text-[#5c5c5c] tabular-nums">{formatCurrency(session.tong_tien_ton_computed || 0)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between xl:justify-end gap-4 w-full xl:w-[30%] pl-12 md:pl-16 xl:pl-0 border-t xl:border-none border-gray-200/60 pt-3 xl:pt-0 mt-1 xl:mt-0">
                                    <div className="text-left xl:text-right shrink-0 min-w-[100px]">
                                        <div className="text-[9px] font-bold text-[#5c5c5c] uppercase tracking-widest mb-0.5">Lợi Nhuận</div>
                                        <div className={`text-[15px] md:text-[18px] font-black tabular-nums tracking-tight ${isLoss ? 'text-[#FF453A]' : 'text-[#1DB2A0]'}`}>
                                            {formatCurrency(session.realProfit)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 md:gap-2 shrink-0 xl:border-l border-gray-200/80 xl:pl-3 ml-auto">
                                        {canPay && (
                                            <button onClick={(e) => { e.stopPropagation(); setSalarySession(session); setShowSalaryModal(true); }} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#5c5c5c] bg-white hover:bg-white hover:text-[#1DB2A0] rounded-full transition-all shadow-sm border border-gray-100 hover:scale-105 active:scale-95" title="Phát lương">
                                                <Wallet size={14}/>
                                            </button>
                                        )}
                                        {canEdit && (
                                            <button onClick={(e) => handleStartEditSession(e, session)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#5c5c5c] bg-white hover:bg-white hover:text-[#33A1FD] rounded-full transition-all shadow-sm border border-gray-100 hover:scale-105 active:scale-95" title="Sửa">
                                                <Pencil size={14}/>
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button onClick={(e) => handleDeleteSession(e, session.id)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#5c5c5c] bg-white hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] rounded-full transition-all shadow-sm border border-gray-100 hover:scale-105 active:scale-95" title="Xóa">
                                                <Trash2 size={14}/>
                                            </button>
                                        )}
                                        <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#8E8E93] bg-white rounded-full shadow-sm border border-gray-100 group-hover:text-[#1D1D1F] transition-colors ml-1 hidden sm:flex">
                                            <ChevronRight size={16}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
