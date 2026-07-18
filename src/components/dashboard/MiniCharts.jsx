import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { formatCurrency } from '../../utils';

export default function MiniCharts({ sessions }) {
    const stats = useMemo(() => {
        const result = {
            total: { label: "Tổng Doanh Thu", value: 0, data: [], color: "#33A1FD", bg: "bg-blue-50/50" },
            sale: { label: "Đợt Sale", value: 0, data: [], color: "#F59E0B", bg: "bg-amber-50/50" },
            repost: { label: "Đăng Lại", value: 0, data: [], color: "#10B981", bg: "bg-emerald-50/50" },
            normal: { label: "Bình Thường", value: 0, data: [], color: "#8B5CF6", bg: "bg-purple-50/50" }
        };

        // Lọc từ cũ đến mới để vẽ biểu đồ
        [...sessions].reverse().forEach(s => {
            const name = (s.name || "").toLowerCase();
            const rev = s.tong_doanh_thu || 0;
            
            result.total.value += rev;
            result.total.data.push({ val: rev });

            if (name.includes('sale')) {
                result.sale.value += rev;
                result.sale.data.push({ val: rev });
            } else if (name.includes('đăng lại')) {
                result.repost.value += rev;
                result.repost.data.push({ val: rev });
            } else {
                result.normal.value += rev;
                result.normal.data.push({ val: rev });
            }
        });

        // Đảm bảo Recharts có ít nhất 2 điểm để vẽ đường thẳng nếu dữ liệu quá ít
        Object.values(result).forEach(item => {
            if (item.data.length === 1) item.data.push(item.data[0]);
            if (item.data.length === 0) item.data = [{val: 0}, {val: 0}];
        });

        return Object.values(result);
    }, [sessions]);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, idx) => (
                <div key={idx} className={`backdrop-blur-xl border border-white/60 rounded-[24px] p-5 shadow-sm flex flex-col ${stat.bg}`}>
                    <span className="text-[12px] font-bold text-gray-500 mb-1">{stat.label}</span>
                    <span className="text-[18px] font-black text-[#1D1D1F] mb-4">{formatCurrency(stat.value)}đ</span>
                    <div className="h-[40px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stat.data}>
                                <YAxis hide domain={['dataMin', 'dataMax + 10000']} />
                                <Line type="monotone" dataKey="val" stroke={stat.color} strokeWidth={2.5} dot={false} isAnimationActive={true} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            ))}
        </div>
    );
}