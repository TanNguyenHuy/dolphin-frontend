import React, { useMemo } from 'react';
import { formatCurrency, getSessionName } from '../../utils';
import { Target, Zap } from 'lucide-react';

export default function TopMVP({ sessions }) {
    const { normalTop, specialTop } = useMemo(() => {
        const calculate15DayProfit = (s) => {
            if (!s.actual_start_date || !s.actual_end_date) return 0;
            const d1 = new Date(s.actual_start_date);
            const d2 = new Date(s.actual_end_date);
            
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

        processed.forEach(s => {
            const nameLower = (s.name || '').toLowerCase();
            if (nameLower.includes('sale') || nameLower.includes('đăng lại')) {
                special.push(s);
            } else {
                normal.push(s);
            }
        });

        normal.sort((a, b) => b.projected15d - a.projected15d);
        special.sort((a, b) => b.projected15d - a.projected15d);

        return {
            normalTop: normal.slice(0, 3), 
            specialTop: special.slice(0, 3)
        };
    }, [sessions]);

    const rankColors = ["bg-[#FFD700]/20 text-[#D4AF37]", "bg-gray-200/50 text-gray-500", "bg-[#CD7F32]/20 text-[#A0522D]"];

    const renderList = (list, title, icon) => (
        <div className="flex-1 bg-gray-50/50 rounded-[24px] p-4 md:p-5 border border-gray-100 flex flex-col">
            <h4 className="text-[14px] md:text-[15px] font-black text-[#1D1D1F] mb-4 flex items-center gap-2">
                {icon} {title}
            </h4>
            <div className="flex flex-col gap-3 flex-1">
                {list.length === 0 ? (
                    <div className="text-center text-gray-400 text-[12px] font-bold py-8 h-full flex items-center justify-center">Chưa có dữ liệu</div>
                ) : (
                    list.map((session, index) => (
                        <div key={session.id} className="flex items-center gap-2 md:gap-3 bg-white p-2.5 md:p-3 rounded-[16px] shadow-sm border border-gray-50 hover:shadow-md transition-shadow">
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-[10px] flex items-center justify-center font-black text-[11px] md:text-[12px] shrink-0 ${rankColors[index] || "bg-blue-50 text-blue-500"}`}>
                                #{index + 1}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="text-[12px] md:text-[13px] font-black text-[#1D1D1F] truncate pr-1 md:pr-2">
                                    {getSessionName(session.name, session.actual_start_date, session.actual_end_date)}
                                </div>
                                <div className="text-[9px] md:text-[10px] font-bold text-gray-400 mt-0.5">
                                    Ước tính 15N: <span className={session.projected15d >= 0 ? "text-[#33A1FD]" : "text-rose-500"}>
                                        {session.projected15d >= 0 ? '+' : ''}{formatCurrency(session.projected15d)}đ
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end shrink-0 pl-2 border-l border-gray-100">
                                <div className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase">Thực tế</div>
                                <div className={`text-[12px] md:text-[14px] font-black ${session.realProfit >= 0 ? "text-[#1DB2A0]" : "text-rose-500"}`}>
                                    {session.realProfit >= 0 ? '+' : ''}{formatCurrency(session.realProfit || 0)}đ
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] p-5 md:p-6 lg:p-8 shadow-sm h-full flex flex-col">
            <div className="mb-5 md:mb-6">
                <h3 className="text-[16px] md:text-[18px] font-black text-[#1D1D1F] flex items-center gap-2">
                    Bảng Xếp Hạng Đợt Bán
                </h3>
                <p className="text-[11px] md:text-[12px] font-bold text-gray-400 mt-1">
                    Hiệu suất quy đổi về <span className="text-[#33A1FD] font-black">tiêu chuẩn 15 ngày</span> để xếp hạng, hiển thị <span className="text-[#1DB2A0] font-black">Lợi nhuận Thực tế</span>
                </p>
            </div>

            <div className="flex flex-col xl:flex-row gap-4 md:gap-6 flex-1">
                {renderList(normalTop, "Đợt Bình Thường", <Target size={16} className="text-[#33A1FD] md:w-[18px] md:h-[18px]" />)}
                {renderList(specialTop, "Đợt Sale / Đăng Lại", <Zap size={16} className="text-[#F59E0B] md:w-[18px] md:h-[18px]" />)}
            </div>
        </div>
    );
}