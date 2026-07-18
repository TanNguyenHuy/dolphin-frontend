import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils';
import { Trophy, ArrowRight } from 'lucide-react';

export default function TopMVP({ sessions }) {
    const topSessions = useMemo(() => {
        // Lấy mốc thời gian 15 ngày qua
        const now = new Date();
        const fifteenDaysAgo = new Date(now.getTime() - (15 * 24 * 60 * 60 * 1000));

        // Lọc các đợt bán có hoạt động trong 15 ngày qua
        let recentSessions = sessions.filter(s => {
            if (!s.actual_end_date) return false;
            return new Date(s.actual_end_date) >= fifteenDaysAgo;
        });

        // Nếu 15 ngày qua chưa bán gì, lấy tạm 3 đợt gần nhất để bảng không bị trống
        if (recentSessions.length === 0) {
            recentSessions = [...sessions];
        }

        // Sắp xếp theo Doanh thu và lấy Top 3
        const sorted = [...recentSessions].sort((a, b) => (b.tong_doanh_thu || 0) - (a.tong_doanh_thu || 0)).slice(0, 3);
        
        // Tính tổng doanh thu của Top 3 để ra % (Tỷ trọng)
        const totalTopRevenue = sorted.reduce((sum, s) => sum + (s.tong_doanh_thu || 0), 0);

        return sorted.map(s => ({
            ...s,
            percent: totalTopRevenue > 0 ? Math.round(((s.tong_doanh_thu || 0) / totalTopRevenue) * 100) : 0
        }));
    }, [sessions]);

    const rankColors = ["bg-[#FFD700]/20 text-[#D4AF37]", "bg-gray-200/50 text-gray-500", "bg-[#CD7F32]/20 text-[#A0522D]"];

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 lg:p-8 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-[18px] font-black text-[#1D1D1F] flex items-center gap-2">
                    Top Đợt Bán <span className="text-[12px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">(15 ngày qua)</span>
                </h3>
            </div>

            {/* Header Bảng (Tên - SL Bán - Doanh thu) */}
            <div className="grid grid-cols-12 gap-4 text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">
                <div className="col-span-6">Tên đợt bán</div>
                <div className="col-span-2 text-center">SL Bán</div>
                <div className="col-span-4 text-right">Doanh thu</div>
            </div>

            {/* Danh sách Top 3 */}
            <div className="flex flex-col gap-2">
                {topSessions.length === 0 ? (
                    <div className="text-center text-gray-400 text-[13px] font-bold py-4">Chưa có dữ liệu đợt bán</div>
                ) : (
                    topSessions.map((session, index) => (
                        <div key={session.id} className="grid grid-cols-12 gap-4 items-center p-2 hover:bg-gray-50 rounded-[16px] transition-colors group">
                            <div className="col-span-6 flex items-center gap-3 overflow-hidden">
                                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center font-black text-[14px] shrink-0 ${rankColors[index] || "bg-blue-50 text-blue-500"}`}>
                                    #{index + 1}
                                </div>
                                <div className="truncate">
                                    <div className="text-[14px] font-black text-[#1D1D1F] truncate pr-2">{session.name}</div>
                                    <div className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5 mt-0.5">
                                        Tỷ trọng: {session.percent}%
                                    </div>
                                </div>
                            </div>
                            
                            <div className="col-span-2 text-center font-black text-gray-600">
                                {session.tong_sl_ban || 0}
                            </div>
                            
                            <div className="col-span-4 flex items-center justify-end gap-2">
                                <span className="font-black text-[#1D1D1F] text-[14px]">{formatCurrency(session.tong_doanh_thu || 0)}đ</span>
                                <button className="w-7 h-7 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#33A1FD] hover:text-white shrink-0">
                                    <ArrowRight size={14} strokeWidth={3} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}