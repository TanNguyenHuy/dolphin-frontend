import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency, getSessionName } from '../../utils';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';

export default function DashboardChart({ enrichedSessions }) {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // THUẬT TOÁN QUY ĐỔI 15 NGÀY (Giống hệt TopMVP)
    const calculate15DayProfit = (s) => {
        if (!s.actual_start_date || !s.actual_end_date) return 0;
        const d1 = new Date(s.actual_start_date);
        const d2 = new Date(s.actual_end_date);
        
        const days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
        const dailyProfit = (s.realProfit || 0) / days;
        return dailyProfit * 15;
    };

    const chartData = useMemo(() => {
        const filtered = enrichedSessions.filter(s => {
            if (!s.actual_start_date) return false;
            const isRightYear = new Date(s.actual_start_date).getFullYear() === selectedYear;
            
            const nameLower = (s.name || '').toLowerCase();
            const isSpecial = nameLower.includes('sale') || nameLower.includes('đăng lại');
            
            return isRightYear && !isSpecial;
        });

        return filtered.reverse().map(s => {
            const projected15d = calculate15DayProfit(s);
            return {
                name: new Date(s.actual_start_date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
                profit15d: projected15d, // Dùng để vẽ các đỉnh cao/thấp trên biểu đồ
                realProfit: s.realProfit || 0, // Dùng để hiển thị tham khảo
                fullName: getSessionName(s.name, s.actual_start_date, s.actual_end_date)
            };
        });
    }, [enrichedSessions, selectedYear]);

    // Tổng trên Header vẫn hiển thị Tiền Thực Tế để không bị ảo
    const chartTotalRealProfit = chartData.reduce((sum, item) => sum + item.realProfit, 0);

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 md:p-8 shadow-sm w-full h-full flex flex-col">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 shrink-0">
                <div>
                    <h2 className="text-[20px] font-black text-[#1D1D1F] flex items-center gap-2">
                        Phân tích Lợi nhuận <TrendingUp size={18} className="text-[#33A1FD]" />
                    </h2>
                    <div className="text-[12px] font-bold text-gray-500 mt-1">
                        Tổng đợt thường (Thực tế): <span className="text-[#1D1D1F] text-[14px]">{formatCurrency(chartTotalRealProfit)}đ</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-full p-1 shadow-inner shrink-0">
                    <button onClick={() => setSelectedYear(y => y - 1)} className="p-1.5 hover:bg-white rounded-full transition-all text-gray-500 hover:shadow-sm active:scale-95">
                        <ChevronLeft size={16} strokeWidth={3} />
                    </button>
                    <span className="text-[13px] font-black text-[#1D1D1F] w-[50px] text-center">{selectedYear}</span>
                    <button onClick={() => setSelectedYear(y => y + 1)} className="p-1.5 hover:bg-white rounded-full transition-all text-gray-500 hover:shadow-sm active:scale-95">
                        <ChevronRight size={16} strokeWidth={3} />
                    </button>
                </div>
            </div>

            {/* VÙNG BIỂU ĐỒ (Đã đổi thành flex-1 min-h-0 để tự động fit chiều cao, chống tràn) */}
            <div className="flex-1 w-full min-h-0 relative">
                {chartData.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-bold text-[13px]">
                        Chưa có dữ liệu đợt bán bình thường trong năm {selectedYear}
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        {/* ĐÃ SỬA: margin bottom: 20 để chữ ngày tháng hiển thị đầy đủ, không bị cắt đứt */}
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                            <defs>
                                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#33A1FD" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#33A1FD" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 'bold'}} 
                                dy={15} 
                            />
                            <YAxis hide={true} domain={['dataMin - 1000000', 'auto']} />
                            
                            {/* TOOLTIP HIỂN THỊ CẢ 2 THÔNG SỐ */}
                            <Tooltip 
                                cursor={{stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4'}}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-[#1D1D1F] text-white p-3.5 rounded-[16px] shadow-lg border border-gray-700 min-w-[150px]">
                                                <p className="text-[11px] font-bold text-gray-400 uppercase mb-2 border-b border-gray-700 pb-1.5">{data.fullName}</p>
                                                
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex justify-between items-center gap-4">
                                                        <span className="text-[10px] text-gray-400 font-bold">Chuẩn 15N:</span>
                                                        <span className={`text-[14px] font-black ${data.profit15d >= 0 ? 'text-[#33A1FD]' : 'text-rose-400'}`}>
                                                            {formatCurrency(data.profit15d)}đ
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between items-center gap-4">
                                                        <span className="text-[10px] text-gray-400 font-bold">Thực tế:</span>
                                                        <span className={`text-[12px] font-black ${data.realProfit >= 0 ? 'text-[#1DB2A0]' : 'text-rose-400'}`}>
                                                            {formatCurrency(data.realProfit)}đ
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {/* Chuyển dataKey sang profit15d để vẽ đường */}
                            <Area type="monotone" dataKey="profit15d" stroke="#33A1FD" strokeWidth={4} fillOpacity={1} fill="url(#colorProfit)" activeDot={{ r: 6, strokeWidth: 0, fill: '#1D1D1F' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}