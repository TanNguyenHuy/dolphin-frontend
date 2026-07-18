import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils';

export default function SmartCalendar({ sessions }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState(null);

    const dailyDataByDate = useMemo(() => {
        const map = {};
        sessions?.forEach(session => {
            if (session.daily && Array.isArray(session.daily)) {
                session.daily.forEach(item => {
                    if (!item.ngay_ban) return;
                    const d = new Date(item.ngay_ban);
                    const dStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                    
                    if (!map[dStr]) map[dStr] = [];
                    map[dStr].push(item);
                });
            }
        });
        return map;
    }, [sessions]);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const startingDay = firstDay === 0 ? 6 : firstDay - 1; 

    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    // Hàm xử lý nhảy về tháng hiện tại
    const handleJumpToToday = () => {
        setCurrentDate(new Date());
    };

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 shadow-sm flex flex-col h-full relative z-10">
            <div className="flex justify-between items-center mb-6 px-2">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:scale-95 text-gray-500">
                    <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <h3 className="text-[16px] font-black text-[#1D1D1F]">
                    {monthNames[month]} {year}
                </h3>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:scale-95 text-gray-500">
                    <ChevronRight size={20} strokeWidth={2.5} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                {dayNames.map(day => <div key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
                {[...Array(startingDay)].map((_, i) => <div key={`empty-${i}`} className="h-8"></div>)}
                
                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayData = dailyDataByDate[dateString];
                    const isActive = !!dayData; 
                    const isToday = new Date().toISOString().split('T')[0] === dateString;

                    return (
                        <div 
                            key={day} 
                            className="flex justify-center items-center h-8 relative"
                            onMouseEnter={() => isActive && setHoveredDate(dateString)}
                            onMouseLeave={() => setHoveredDate(null)}
                        >
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-bold z-10 transition-all cursor-default
                                ${isActive ? 'bg-[#33A1FD] text-white shadow-[0_4px_10px_rgba(51,161,253,0.4)] hover:bg-[#208bea] hover:scale-110' : 
                                 isToday ? 'bg-gray-100 text-[#1D1D1F]' : 'text-gray-600 hover:bg-gray-50'}
                            `}>
                                {day}
                            </span>

                            {hoveredDate === dateString && isActive && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[260px] bg-white/95 backdrop-blur-xl border border-gray-200 rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[150] p-4 pointer-events-none animate-fade-in-up">
                                    <div className="text-[12px] font-black text-[#1D1D1F] mb-3 border-b border-gray-100 pb-2 flex justify-between items-center">
                                        <span>Ngày {day}/{month+1}/{year}</span>
                                        <span className="bg-teal-50 text-teal-600 px-2 py-0.5 rounded-full text-[10px]">{dayData.length} đơn</span>
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        {dayData.slice(0, 5).map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-[11px]">
                                                <div className="flex-1 pr-2 truncate font-bold text-gray-700">
                                                    {item.ten_san_pham}
                                                </div>
                                                <div className="flex flex-col items-end shrink-0">
                                                    <span className="text-[#1DB2A0] font-black">{formatCurrency(item.so_tien_ban_duoc || 0)}đ</span>
                                                    <span className="text-[9px] text-gray-400 font-bold">Bán: {item.so_luong || 0} / Nhập: {item.so_luong_nhap || 0}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {dayData.length > 5 && (
                                            <div className="text-center text-[10px] font-bold text-gray-400 mt-1 italic">
                                                ... và {dayData.length - 5} mặt hàng khác
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-auto pt-6">
                <button 
                    onClick={handleJumpToToday}
                    className="w-full bg-[#33A1FD] hover:bg-[#208bea] text-white font-bold py-3.5 rounded-[16px] text-[13px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(51,161,253,0.3)]"
                >
                    Trở về tháng hiện tại
                </button>
            </div>
        </div>
    );
}