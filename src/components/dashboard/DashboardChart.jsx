import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-[#FFFDF7]/95 backdrop-blur-xl border border-[#FFE0B2] p-5 rounded-[24px] shadow-[0_10px_30px_rgba(230,81,0,0.15)] transform transition-all min-w-[240px]">
                <p className="text-[#D84315] text-[12px] uppercase tracking-widest mb-3 font-black flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><Calendar size={14} /> ĐỢT {data.name}</span>
                    <span className="bg-[#FFE0B2]/50 px-2.5 py-1 rounded-lg">{data.days} ngày</span>
                </p>
                <div className="space-y-2">
                    <div className="flex justify-between items-center gap-5 text-[13px] font-semibold text-gray-600">
                        <span>Thực tế nhận:</span><span className={data.actualProfit >= 0 ? 'text-[#059669]' : 'text-[#E11D48]'}>{formatCurrency(data.actualProfit)} đ</span>
                    </div>
                    <div className="flex justify-between items-center gap-5 text-[15px] font-black border-t border-[#FFE0B2]/50 pt-2 text-[#E65100]">
                        <span>Hiệu suất 15 ngày:</span><span className={data.profit15Days >= 0 ? 'text-[#E65100]' : 'text-[#E11D48]'}>{data.days > 4 ? `${formatCurrency(data.profit15Days)} đ` : 'Chờ ổn định'}</span>
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
            if (nameLower.includes('sale') || nameLower.includes('đăng lại')) return; 

            const year = new Date(dateStr).getFullYear();
            if (!data[year]) data[year] = [];

            let displayName = shortName;
            if (!displayName || nameLower === 'thống kê tự động') {
                const d = new Date(dateStr);
                displayName = `${d.getDate()}/${d.getMonth() + 1}`;
            }

            let soNgayThucTe = ss.so_ngay;
            if (!soNgayThucTe || soNgayThucTe <= 0) {
                const end = ss.actual_end_date || ss.end_date || new Date().toISOString();
                const start = ss.actual_start_date || ss.start_date || new Date().toISOString();
                soNgayThucTe = Math.max(1, Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)));
            }
            
            let loiNhuan15Ngay = Number(ss.realProfit) || 0;
            if (soNgayThucTe > 4) {
                const tiLe = 15 / soNgayThucTe;
                loiNhuan15Ngay = (Number(ss.realProfit) || 0) * tiLe;
            }

            data[year].push({ name: displayName, profit15Days: Math.round(loiNhuan15Ngay), actualProfit: Number(ss.realProfit) || 0, days: soNgayThucTe, fullDate: dateStr });
        });
        Object.keys(data).forEach(year => { data[year].sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate)); });
        return data;
    }, [enrichedSessions]);

    const availableYears = useMemo(() => Object.keys(chartDataByYear).map(Number).sort((a, b) => b - a), [chartDataByYear]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    useEffect(() => { if (availableYears.length > 0 && !availableYears.includes(selectedYear)) setSelectedYear(availableYears[0]); }, [availableYears, selectedYear]);

    const currentChartData = chartDataByYear[selectedYear] || [];
    const yearlyTotal = currentChartData.reduce((sum, item) => sum + item.actualProfit, 0);

    const handlePrevYear = () => { const idx = availableYears.indexOf(selectedYear); if (idx < availableYears.length - 1) setSelectedYear(availableYears[idx + 1]); };
    const handleNextYear = () => { const idx = availableYears.indexOf(selectedYear); if (idx > 0) setSelectedYear(availableYears[idx - 1]); };

    return (
        <div className="bg-gradient-to-br from-[#FFFCF5] to-[#FFF3E0] rounded-[36px] p-6 md:p-10 text-[#3E2723] relative shadow-[0_20px_50px_rgba(255,140,0,0.1)] border border-[#FFE0B2] flex flex-col group overflow-hidden">
            <style>{`
                @keyframes float-c { 0%, 100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-15px) scale(1.03); } }
                .blob-c1 { animation: float-c 7s ease-in-out infinite; }
            `}</style>
            <div className="absolute top-10 left-10 w-64 h-64 bg-[#FFB74D]/20 rounded-full blur-[70px] blob-c1 pointer-events-none"></div>
            
            <div className="absolute right-0 bottom-0 opacity-[0.04] group-hover:scale-105 group-hover:opacity-[0.06] transition-all duration-700 transform translate-x-1/4 translate-y-1/4 pointer-events-none text-[#E65100]">
                <TrendingUp size={300} strokeWidth={1} />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 z-10 relative gap-4">
                <div>
                    <h3 className="text-[14px] font-black text-[#E65100]/80 uppercase tracking-widest flex items-center gap-2 mb-1">Lợi nhuận năm {selectedYear}</h3>
                    <div className="text-[44px] md:text-[56px] font-black tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-[#FF8F00] to-[#E65100] leading-none drop-shadow-sm">
                        {formatCurrency(yearlyTotal)}<span className="text-[20px] md:text-[24px] text-[#E65100]/60 ml-1.5 font-bold">đ</span>
                    </div>
                    <div className="text-[12px] md:text-[14px] font-bold mt-3 bg-[#FFE0B2]/60 text-[#D84315] inline-block px-3.5 py-1.5 rounded-xl border border-[#FFCC80] shadow-sm backdrop-blur-sm">
                        TỔNG TẤT CẢ (ALL-TIME): <span className="font-black">{formatCurrency(dashboardProfit)}đ</span>
                    </div>
                </div>

                {availableYears.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-white/70 rounded-full p-1.5 border border-[#FFE0B2] shadow-inner backdrop-blur-md">
                        <button onClick={handlePrevYear} disabled={selectedYear === availableYears[availableYears.length - 1]} className="p-2 hover:bg-white rounded-full disabled:opacity-30 transition-all active:scale-95 text-[#D84315]"><ChevronLeft size={18}/></button>
                        <span className="font-black text-[15px] w-[45px] text-center tabular-nums text-[#D84315]">{selectedYear}</span>
                        <button onClick={handleNextYear} disabled={selectedYear === availableYears[0]} className="p-2 hover:bg-white rounded-full disabled:opacity-30 transition-all active:scale-95 text-[#D84315]"><ChevronRight size={18}/></button>
                    </div>
                )}
            </div>

            {/* FIX: Chiều cao cứng 400px giúp biểu đồ không bao giờ tàng hình */}
            <div className="w-full z-10 relative" style={{ height: '400px' }}>
                {currentChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={currentChartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={1}/><stop offset="100%" stopColor="#34D399" stopOpacity={0.8}/></linearGradient>
                                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={1}/><stop offset="100%" stopColor="#F87171" stopOpacity={0.8}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="6 6" stroke="rgba(230,81,0,0.06)" vertical={false} />
                            <XAxis dataKey="name" stroke="#8D6E63" fontSize={12} fontWeight="800" tickLine={false} axisLine={false} dy={12} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,140,0,0.04)', radius: 10 }} />
                            <Bar dataKey="profit15Days" radius={[10, 10, 10, 10]} maxBarSize={50} isAnimationActive={true} animationDuration={1200} animationEasing="ease-out">
                                {currentChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.profit15Days >= 0 ? 'url(#colorProfit)' : 'url(#colorLoss)'} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-[#BCAAA4] text-[14px] font-semibold border-4 border-dashed border-[#FFE0B2]/60 rounded-3xl bg-white/40">
                        <Calendar size={40} className="mb-3 opacity-50 text-[#FFB300]" /> Chưa có dữ liệu
                    </div>
                )}
            </div>
        </div>
    );
}