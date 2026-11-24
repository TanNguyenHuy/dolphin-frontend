import React, { useMemo } from 'react';
import { ComposedChart, Line, Area, Bar, ResponsiveContainer, YAxis } from 'recharts';
import QuickPreview from '../QuickPreview';
import { getSessionGroup, rankDailyRevenue } from '../../logic';
import { formatCurrency, getSessionName } from '../../utils';
import { useReducedMotion } from '../motion/motion';
import { useAppearance } from '../appearance/AppearanceContext';

export default function MiniCharts({ sessions }) {
    const appearance = useAppearance();
    const reducedMotion = useReducedMotion();
    const stats = useMemo(() => {
        const result = {
            total: { label: "Tổng Doanh Thu", value: 0, data: [], sessions: [], color: "#33A1FD", bg: "bg-blue-50/50" },
            sale: { label: "Đợt Sale", value: 0, data: [], sessions: [], color: "#F59E0B", bg: "bg-amber-50/50" },
            repost: { label: "Đăng Lại", value: 0, data: [], sessions: [], color: "#10B981", bg: "bg-emerald-50/50" },
            normal: { label: "Bình Thường", value: 0, data: [], sessions: [], color: "#8B5CF6", bg: "bg-purple-50/50" }
        };

        // Lọc từ cũ đến mới để vẽ biểu đồ
        [...sessions].reverse().forEach(s => {
            const rev = Number(s.tong_doanh_thu) || 0;
            result.total.value += rev;
            result.total.data.push({ val: rev });
            result.total.sessions.push(s);
            const group = result[getSessionGroup(s)];
            group.value += rev;
            group.data.push({ val: rev });
            group.sessions.push(s);
        });

        // Đảm bảo Recharts có ít nhất 2 điểm để vẽ đường thẳng nếu dữ liệu quá ít
        Object.values(result).forEach(item => {
            item.rankings = rankDailyRevenue(item.sessions);
            if (item.data.length === 1) item.data.push(item.data[0]);
            if (item.data.length === 0) item.data = [{val: 0}, {val: 0}];
        });

        return Object.values(result);
    }, [sessions]);

    return (
        <div className="overview-cards grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, idx) => (
                <QuickPreview key={idx} label={`Top 3 doanh thu/ngày · ${stat.label}`} triggerClassName="mini-chart-trigger" className={`backdrop-blur-xl border border-white/60 rounded-[24px] p-5 shadow-sm flex flex-col ${stat.bg}`} triggerContent={<>
                    <span className="text-[12px] font-bold text-gray-500 mb-1">{stat.label}</span>
                    <span className="text-[18px] font-black text-[#1D1D1F] mb-4">{formatCurrency(stat.value)}đ</span>
                    <div className="h-[40px] w-full mt-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={stat.data}>
                                <YAxis hide domain={['dataMin', 'dataMax + 10000']} />
                                {appearance.chartType === 'bar' ? <Bar dataKey="val" fill={stat.color} radius={[3, 3, 0, 0]} isAnimationActive={!reducedMotion} animationDuration={650} /> : appearance.chartType === 'area' ? <Area type={appearance.chartCurve} dataKey="val" stroke={stat.color} fill={stat.color} fillOpacity={0.12} strokeWidth={2.5} isAnimationActive={!reducedMotion} animationDuration={650} /> : <Line type={appearance.chartCurve} dataKey="val" stroke={stat.color} strokeWidth={2.5} dot={false} isAnimationActive={!reducedMotion} animationDuration={650} />}

                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </>}>
                    {stat.rankings.length ? <ol className="preview-rows">{stat.rankings.map((session, index) => (
                        <li key={session.id || session._id || index}>
                            <div><strong>{index + 1}. {getSessionName(session.name, session.actual_start_date || session.start_date, session.actual_end_date || session.end_date)}</strong><small>{session.dayCount} ngày · Tổng {formatCurrency(session.tong_doanh_thu)} đ</small></div>
                            <strong>{formatCurrency(session.revenuePerDay)} đ/ngày</strong>
                        </li>
                    ))}</ol> : <p>Chưa có đợt bán trong nhóm này.</p>}
                </QuickPreview>
            ))}
        </div>
    );
}
