import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#FFFDF7]/95 backdrop-blur-xl border border-[#FFE0B2] p-4 rounded-[20px] shadow-[0_10px_30px_rgba(230,81,0,0.15)] transform transition-all min-w-[200px]">
                <p className="text-[#D84315] text-[11px] uppercase tracking-widest mb-3 font-bold flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5"><Calendar size={12} /> ĐỢT {data.name}</span>
                    <span className="bg-[#FFE0B2]/50 px-2 py-0.5 rounded-md">{data.days} ngày</span>
                </p>
                <div className="space-y-2">
                    <div className="flex justify-between items-center gap-4 text-[13px] font-semibold text-gray-600">
                        <span>Thực tế nhận:</span>
                        <span className={data.actualProfit >= 0 ? 'text-[#059669]' : 'text-[#E11D48]'}>
                            {formatCurrency(data.actualProfit)} đ
                        </span>
                    </div>
                    <div className="flex justify-between items-center gap-4 text-[14px] font-black border-t border-[#FFE0B2]/50 pt-2 text-[#E65100]">
                        <span>Hiệu suất 15 ngày:</span>
                        <span>{formatCurrency(data.profit15Days)} đ</span>
                    </div>
                </div>
            </div>
        );
    }
    return null;
};

export default function DashboardChart({ enrichedSessions, dashboardProfit }) {
    const chartDataByYear = useMemo(() => {
        const data = {};
        enrichedSessions.forEach(ss => {
            const dateStr = ss.actual_start_date || ss.start_date;
            if (!dateStr) return;
            
            const shortName = ss.name || '';
            const nameLower = shortName.toLowerCase();

            // 1. LỌC ĐÚNG: Chỉ ẩn hoàn toàn "sale" và "đăng lại"
            if (nameLower.includes('sale') || nameLower.includes('đăng lại')) {
                return; 
            }

            const year = new Date(dateStr).getFullYear();
            if (!data[year]) data[year] = [];

            // 2. HIỂN THỊ ĐẸP: Đổi "Thống kê tự động" thành ngày/tháng
            let displayName = shortName;
            if (!displayName || nameLower === 'thống kê tự động') {
                const d = new Date(dateStr);
                displayName = `${d.getDate()}/${d.getMonth() + 1}`;
            }

            // 3. TÍNH CHUẨN HÓA 15 NGÀY (Cộng thêm backup tự tính ngày nếu DB thiếu)
            let soNgayThucTe = ss.so_ngay;
            if (!soNgayThucTe || soNgayThucTe <= 0) {
                const end = ss.actual_end_date || ss.end_date || new Date().toISOString();
                const start = ss.actual_start_date || ss.start_date;
                soNgayThucTe = Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
            }
            
            const tiLe = 15 / soNgayThucTe;
            const loiNhuan15Ngay = ss.realProfit * tiLe;

            data[year].push({
                name: displayName,
                profit15Days: Math.round(loiNhuan15Ngay), // Vẽ chiều cao
                actualProfit: ss.realProfit,              // Hiển thị và cộng tổng
                days: soNgayThucTe,
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
    
    // Tính tổng lợi nhuận thực tế (không phải số chuẩn hóa) để sổ sách khớp 100%
    const yearlyTotal = currentChartData.reduce((sum, item) => sum + item.actualProfit, 0);

    const handlePrevYear = () => {
        const currentIndex = availableYears.indexOf(selectedYear);
        if (currentIndex < availableYears.length - 1) setSelectedYear(availableYears[currentIndex + 1]);
    };

    const handleNextYear = () => {
        const currentIndex = availableYears.indexOf(selectedYear);
        if (currentIndex > 0) setSelectedYear(availableYears[currentIndex - 1]);
    };

    return (
        <div className="lg:col-span-7 bg-gradient-to-br from-[#FFFCF5] to-[#FFF3E0] rounded-[32px] p-5 md:p-8 text-[#3E2723] relative shadow-[0_12px_40px_rgba(255,140,0,0.12)] border border-[#FFE0B2] flex flex-col min-h-[350px] overflow-hidden hover:shadow-[0_12px_40px_rgba(255,140,0,0.2)] transition-shadow duration-500">
            <div className="absolute right-0 bottom-0 opacity-[0.06] transform translate-x-1/4 translate-y-1/4 pointer-events-none text-[#E65100]">
                <TrendingUp size={240} strokeWidth={1} />
            </div>

            <div className="flex justify-between items-start mb-6 z-10 relative">
                <div>
                    <h3 className="text-[12px] md:text-[13px] font-bold text-[#E65100]/80 uppercase tracking-widest flex items-center gap-2 mb-1">
                        Lợi nhuận năm {selectedYear}
                    </h3>
                    <div className="text-[32px] md:text-[44px] font-black tracking-tight tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#FF8F00] to-[#E65100] leading-none drop-shadow-sm">
                        {formatCurrency(yearlyTotal)}<span className="text-[16px] text-[#E65100]/60 ml-1.5 font-bold">đ</span>
                    </div>
                    <div className="text-[11px] font-semibold mt-2 bg-[#FFE0B2]/50 text-[#D84315] inline-block px-3 py-1.5 rounded-lg border border-[#FFCC80] shadow-sm">
                        TỔNG TẤT CẢ (ALL-TIME): <span className="font-bold">{formatCurrency(dashboardProfit)}đ</span>
                    </div>
                </div>

                {availableYears.length > 1 && (
                    <div className="flex items-center gap-1 bg-white/60 rounded-full p-1 border border-[#FFE0B2] shadow-inner backdrop-blur-sm">
                        <button onClick={handlePrevYear} disabled={selectedYear === availableYears[availableYears.length - 1]} className="p-1.5 hover:bg-white rounded-full disabled:opacity-30 transition-all active:scale-95 shadow-sm text-[#D84315]"><ChevronLeft size={16}/></button>
                        <span className="font-bold text-[13px] w-[40px] text-center tabular-nums text-[#D84315]">{selectedYear}</span>
                        <button onClick={handleNextYear} disabled={selectedYear === availableYears[0]} className="p-1.5 hover:bg-white rounded-full disabled:opacity-30 transition-all active:scale-95 shadow-sm text-[#D84315]"><ChevronRight size={16}/></button>
                    </div>
                )}
            </div>

            <div className="flex-1 w-full mt-4 z-10 relative min-h-[220px]">
                {currentChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={currentChartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#10B981" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#34D399" stopOpacity={0.8}/>
                                </linearGradient>
                                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#EF4444" stopOpacity={1}/>
                                    <stop offset="100%" stopColor="#F87171" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(230,81,0,0.08)" vertical={false} />
                            <XAxis dataKey="name" stroke="#8D6E63" fontSize={11} fontWeight="700" tickLine={false} axisLine={false} dy={10} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,140,0,0.05)', radius: 8 }} />
                            
                            <Bar dataKey="profit15Days" radius={[8, 8, 8, 8]} maxBarSize={45} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                                {currentChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.actualProfit >= 0 ? 'url(#colorProfit)' : 'url(#colorLoss)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-[#BCAAA4] text-[13px] font-medium border-2 border-dashed border-[#FFE0B2] rounded-2xl bg-white/40">
                        <Calendar size={32} className="mb-2 opacity-50 text-[#FFB300]" />
                        Chưa có dữ liệu đợt bán chuẩn nào trong năm {selectedYear}
                    </div>
                )}
            </div>
        </div>
    );
}