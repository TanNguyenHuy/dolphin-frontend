import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SmartCalendar({ sessions }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Tạo tập hợp các ngày có hoạt động bán hàng (Format: YYYY-MM-DD)
    const activeDates = new Set();
    sessions?.forEach(session => {
        if (!session.actual_start_date || !session.actual_end_date) return;
        let start = new Date(session.actual_start_date);
        let end = new Date(session.actual_end_date);
        
        // Quét từ ngày bắt đầu đến ngày kết thúc của đợt bán
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            activeDates.add(d.toISOString().split('T')[0]);
        }
    });

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    // Điều chỉnh ngày đầu tuần là Thứ 2 (thay vì Chủ Nhật)
    const startingDay = firstDay === 0 ? 6 : firstDay - 1; 

    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    return (
        <div className="bg-white/90 backdrop-blur-xl border border-white/60 rounded-[32px] p-6 shadow-sm flex flex-col h-full">
            {/* Header Lịch */}
            <div className="flex justify-between items-center mb-6 px-2">
                <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:scale-95 text-gray-500">
                    <ChevronLeft size={20} strokeWidth={2.5} />
                </button>
                <h3 className="text-[16px] font-black text-[#1D1D1F]">
                    {monthNames[month]} {year}
                </h3>
                <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors active:scale-95 text-gray-500">
                    <ChevronRight size={20} strokeWidth={2.5} />
                </button>
            </div>

            {/* Tên các thứ */}
            <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                {dayNames.map(day => (
                    <div key={day} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{day}</div>
                ))}
            </div>

            {/* Lưới ngày */}
            <div className="grid grid-cols-7 gap-y-3 gap-x-1 text-center">
                {/* Ô trống đầu tháng */}
                {[...Array(startingDay)].map((_, i) => (
                    <div key={`empty-${i}`} className="h-8"></div>
                ))}
                
                {/* Các ngày trong tháng */}
                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const isActive = activeDates.has(dateString);
                    const isToday = new Date().toISOString().split('T')[0] === dateString;

                    return (
                        <div key={day} className="flex justify-center items-center h-8 relative">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-bold z-10 transition-all cursor-default
                                ${isActive ? 'bg-[#33A1FD] text-white shadow-[0_4px_10px_rgba(51,161,253,0.4)]' : 
                                 isToday ? 'bg-gray-100 text-[#1D1D1F]' : 'text-gray-600 hover:bg-gray-50'}
                            `}>
                                {day}
                            </span>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-auto pt-6">
                <button className="w-full bg-[#33A1FD] hover:bg-[#208bea] text-white font-bold py-3.5 rounded-[16px] text-[13px] transition-all active:scale-95 shadow-[0_4px_12px_rgba(51,161,253,0.3)]">
                    Xem báo cáo tháng
                </button>
            </div>
        </div>
    );
}