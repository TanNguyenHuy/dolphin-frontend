import React, { useMemo } from 'react';
import { formatCurrency } from '../../utils';
import { Target, Zap } from 'lucide-react';

export default function TopMVP({ sessions }) {
    const { normalTop, specialTop } = useMemo(() => {
        // Thuật toán: Quy đổi lợi nhuận về chuẩn 15 ngày
        const calculate15DayProfit = (s) => {
            if (!s.actual_start_date || !s.actual_end_date) return 0;
            const d1 = new Date(s.actual_start_date);
            const d2 = new Date(s.actual_end_date);
            
            // Tính số ngày chạy (cộng 1 để tính cả ngày bắt đầu và kết thúc)
            const days = Math.max(1, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1);
            
            const dailyProfit = (s.realProfit || 0) / days;
            return dailyProfit * 15;
        };

        const processed = sessions.map(s => ({
            ...s,
            projected15d: calculate15DayProfit(s)
        }));

        const normal = [];
        const special = [];

        // Phân loại nhóm
        processed.forEach(s => {
            const nameLower = (s.name || '').toLowerCase();
            if (nameLower.includes('sale') || nameLower.includes('đăng lại')) {
                special.push(s);
            } else {
                normal.push(s);
            }
        });

        // Sắp xếp giảm dần theo lợi nhuận 15 ngày
        normal.sort((a, b) => b.projected15d - a.projected15d);
        special.sort((a, b) => b.projected15d - a.projected15d);

        return {
            normalTop: normal.slice(0, 3), 
            specialTop: special.slice(0, 3)
        };
    }, [sessions]);

    const rankColors = ["bg-[#FFD700]/20 text-[#D4AF37]", "bg-gray-200/50 text-gray-500", "bg-[#CD7F32]/20 text-[#A0522D]"];

    const renderList = (list, title, icon) => (
        <div className="flex-1 bg-gray-50/50 rounded-[24px] p-5 border border-gray-100 flex flex-col">
            <h4 className="text-[15px] font-black text-[#1D1D1F] mb-4 flex items-center gap-2">
                {icon} {title}
            </h4>
            <div className="flex flex-col gap-3 flex-1">
                {list.length === 0 ? (
                    <div className="text-center text-gray-400 text-[12px] font-bold py-8 h-full flex items-center justify-center">Chưa có dữ liệu</div>
                ) : (
                    list.map((session, index) => (
                        <div key={session.id} className="flex items-center gap-3 bg-white p-3 rounded-[16px] shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                            <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center font-black text-[12px] shrink-0 ${rankColors[index] || "bg-blue-50 text-blue-500"}`}>
                                #{index + 1}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="text-[13px] font-black text-[#1D1D1F] truncate pr-2">{session.name}</div>
                                <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                                    Thực tế: <span className={session.realProfit >= 0 ? "text-[#1DB2A0]" : "text-rose-500"}>{formatCurrency(session.realProfit || 0)}đ</span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end shrink-0 pl-2 border-l border-gray-100">
                                <div className="text-[9px] font-bold text-gray-400 uppercase">Ước tính 15 ngày</div>
                                <div className={`text-[14px] font-black ${session.projected15d >= 0 ? "text-[#33A1FD]" : "text-rose-500"}`}>
                                    {session.projected15d >= 0 ? '+' : ''}{formatCurrency(session.projected15d)}đ
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 lg:p-8 shadow-sm h-full flex flex-col">
            <div className="mb-6">
                <h3 className="text-[18px] font-black text-[#1D1D1F] flex items-center gap-2">
                    Bảng Xếp Hạng Đợt Bán
                </h3>
                <p className="text-[12px] font-bold text-gray-400 mt-1">Hiệu suất được quy đổi về <span className="text-[#33A1FD] font-black">tiêu chuẩn 15 ngày</span> để so sánh công bằng</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 flex-1">
                {renderList(normalTop, "Đợt Bình Thường", <Target size={18} className="text-[#33A1FD]" />)}
                {renderList(specialTop, "Đợt Sale / Đăng Lại", <Zap size={18} className="text-[#F59E0B]" />)}
            </div>
        </div>
    );
}