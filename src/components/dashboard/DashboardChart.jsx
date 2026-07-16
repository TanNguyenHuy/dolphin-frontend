import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { formatCurrency } from '../../utils';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white/95 backdrop-blur-xl border border-orange-100 p-5 rounded-[24px] shadow-[0_10px_40px_rgba(230,81,0,0.12)] transform transition-all min-w-[240px]">
                <p className="text-orange-700 text-[11px] uppercase tracking-widest mb-3 font-black flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> ĐỢT {data.name}</span>
                    <span className="bg-orange-50 px-2.5 py-1 rounded-lg">{data.days} ngày</span>
                </p>
                <div className="space-y-3">
                    <div className="flex justify-between items-center gap-5 text-[13px] font-medium text-gray-500">
                        <span>Thực tế nhận:</span><span className={data.actualProfit >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{formatCurrency(data.actualProfit)} đ</span>
                    </div>
                    <div className="flex justify-between items-center gap-5 text-[15px] font-black border-t border-orange-100/50 pt-3 text-orange-600">
                        <span>Hiệu suất 15 ngày:</span><span className={data.profit15Days >= 0 ? 'text-orange-600' : 'text-rose-600'}>{data.days > 4 ? `${formatCurrency(data.profit15Days)} đ` : 'Chờ ổn định'}</span>
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

    return (
        <div className="bg-gradient-to-br from-[#FFFCF5] to-[#FFF3E0] rounded-[32px] md:rounded-[40px] p-6 md:p-10 text-[#3E2723] relative shadow-[0_12px_40px_rgba(255,140,0,0.08)] border border-[#FFE0B2]/60 overflow-hidden">
            
            {/* Hiệu ứng Orbs tinh tế */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-300/10 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-300/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 z-10 relative gap-4">
                <div>
                    <h3 className="text-[13px] md:text-[14px] font-black text-orange-600/80 uppercase tracking-widest flex items-center gap-2 mb-2">Lợi nhuận năm {selectedYear}</h3>
                    <div className="text-[40px] md:text-[52px] font-black tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 leading-none drop-shadow-sm">
                        {formatCurrency(yearlyTotal)}<span className="text-[20px] md:text-[24px] text-orange-500/60 ml-1.5 font-bold">đ</span>
                    </div>
                    <div className="text-[12px] md:text-[13px] font-bold mt-3 bg-white/60 text-orange-700 inline-block px-4 py-2 rounded-[14px] border border-orange-200/50 shadow-sm backdrop-blur-sm">
                        TỔNG TẤT CẢ (ALL-TIME): <span className="font-black">{formatCurrency(dashboardProfit)}đ</span>
                    </div>
                </div>

                {availableYears.length > 1 && (
                    <div className="flex items-center gap-1.5 bg-white/70 rounded-full p-1.5 border border-orange-100 shadow-sm backdrop-blur-md">
                        <button onClick={() => { const idx = availableYears.indexOf(selectedYear); if (idx < availableYears.length - 1) setSelectedYear(availableYears[idx + 1]); }} disabled={selectedYear === availableYears[availableYears.length - 1]} className="p-2 hover:bg-white rounded-full disabled:opacity-30 transition-all active:scale-95 text-orange-600"><ChevronLeft size={18}/></button>
                        <span className="font-black text-[14px] w-[45px] text-center tabular-nums text-orange-600">{selectedYear}</span>
                        <button onClick={() => { const idx = availableYears.indexOf(selectedYear); if (idx > 0) setSelectedYear(availableYears[idx - 1]); }} disabled={selectedYear === availableYears[0]} className="p-2 hover:bg-white rounded-full disabled:opacity-30 transition-all active:scale-95 text-orange-600"><ChevronRight size={18}/></button>
                    </div>
                )}
            </div>

            {/* FIX: Chiều cao cứng 380px để biểu đồ vẽ được */}
            <div className="w-full z-10 relative" style={{ height: '380px' }}>
                {currentChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={currentChartData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#10B981" stopOpacity={1}/><stop offset="100%" stopColor="#34D399" stopOpacity={0.8}/></linearGradient>
                                <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#EF4444" stopOpacity={1}/><stop offset="100%" stopColor="#F87171" stopOpacity={0.8}/></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 4" stroke="rgba(230,81,0,0.05)" vertical={false} />
                            <XAxis dataKey="name" stroke="#A1A1AA" fontSize={11} fontWeight="700" tickLine={false} axisLine={false} dy={12} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,140,0,0.04)', radius: 12 }} />
                            <Bar dataKey="profit15Days" radius={[8, 8, 8, 8]} maxBarSize={48} isAnimationActive={true} animationDuration={1000} animationEasing="ease-out">
                                {currentChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.profit15Days >= 0 ? 'url(#colorProfit)' : 'url(#colorLoss)'} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-orange-300 text-[14px] font-semibold border-2 border-dashed border-orange-200/60 rounded-[24px] bg-white/40">
                        <Calendar size={32} className="mb-3 opacity-50" /> Chưa có dữ liệu
                    </div>
                )}
            </div>
        </div>
    );
}