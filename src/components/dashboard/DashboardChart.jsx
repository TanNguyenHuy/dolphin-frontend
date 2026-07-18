import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../utils';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

export default function DashboardChart({ enrichedSessions }) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // Thuật toán lọc: Đúng năm và KHÔNG chứa chữ Sale/Đăng lại
    const chartData = useMemo(() => {
        const filtered = enrichedSessions.filter(s => {
            if (!s.actual_start_date) return false;
            const isRightYear = new Date(s.actual_start_date).getFullYear() === selectedYear;
            
            const nameLower = (s.name || '').toLowerCase();
            const isSpecial = nameLower.includes('sale') || nameLower.includes('đăng lại');
            
            return isRightYear && !isSpecial;
        });

        return filtered.reverse().map(s => ({
            name: new Date(s.actual_start_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
            profit: s.realProfit || 0,
            fullName: s.name
        }));
    }, [enrichedSessions, selectedYear]);

    // Tính tổng lợi nhuận của các đợt đang hiển thị trên biểu đồ
    const chartTotalProfit = chartData.reduce((sum, item) => sum + item.profit, 0);

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-sm w-full h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-[20px] font-black text-[#1D1D1F] flex items-center gap-2">
                        Phân tích Lợi nhuận <TrendingUp size={18} className="text-[#33A1FD]" />
                    </h2>
                    <div className="text-[12px] font-bold text-gray-500 mt-1">Lợi nhuận đợt thường ({selectedYear}): <span className="text-[#1D1D1F] text-[14px]">{formatCurrency(chartTotalProfit)}đ</span></div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-full p-1 shadow-inner">
                    <button onClick={() => setSelectedYear(y => y - 1)} className="p-1.5 hover:bg-white rounded-full transition-all text-gray-500 hover:shadow-sm active:scale-95">
                        <ChevronLeft size={16} strokeWidth={3} />
                    </button>
                    <span className="text-[13px] font-black text-[#1D1D1F] w-[50px] text-center">{selectedYear}</span>
                    <button onClick={() => setSelectedYear(y => y + 1)} className="p-1.5 hover:bg-white rounded-full transition-all text-gray-500 hover:shadow-sm active:scale-95">
                        <ChevronRight size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>

            <div className="h-[280px] w-full mt-auto">
                {chartData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400 font-bold text-[13px]">Chưa có dữ liệu đợt bán bình thường trong năm {selectedYear}</div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#33A1FD" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#33A1FD" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                            <YAxis hide={true} domain={['dataMin - 1000000', 'auto']} />
                            <Tooltip 
                                cursor={{stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4'}}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-[#1D1D1F] text-white p-3 rounded-[16px] shadow-lg border border-gray-700">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">{payload[0].payload.fullName}</p>
                                                <p className="text-[14px] font-black text-[#33A1FD]">{formatCurrency(payload[0].value)}đ</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Area type="monotone" dataKey="profit" stroke="#33A1FD" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" activeDot={{ r: 6, strokeWidth: 0, fill: '#1D1D1F' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}