import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, X, Calendar as CalIcon, Repeat, Clock } from 'lucide-react';

// Hàm hỗ trợ format ngày (YYYY-MM-DD)
const formatDateStr = (date) => {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};

export default function PersonalCalendar({ sessions = [], onUpdatePendingCount }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState(() => {
        const saved = localStorage.getItem('dolphin_personal_events');
        return saved ? JSON.parse(saved) : [];
    });
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        startDate: formatDateStr(new Date()),
        recurring: 'none' // none, daily, weekly, monthly, yearly
    });

    // Cập nhật LocalStorage mỗi khi events thay đổi
    useEffect(() => {
        localStorage.setItem('dolphin_personal_events', JSON.stringify(events));
        calculatePendingTasks();
    }, [events]);

    // Lấy thông tin ngày tháng
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Đổi Chủ Nhật (0) về cuối tuần, Thứ 2 là ngày đầu tuần
    };

    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const todayStr = formatDateStr(new Date());

    // LOGIC: Kiểm tra 1 sự kiện có xuất hiện vào ngày (checkDate) hay không (Chỉ hướng về tương lai)
    const isEventOnDate = (ev, checkDateStr) => {
        const start = new Date(ev.startDate);
        start.setHours(0,0,0,0);
        const check = new Date(checkDateStr);
        check.setHours(0,0,0,0);

        if (check < start) return false; // Không tính quá khứ trước mốc tạo

        if (ev.recurring === 'none') return check.getTime() === start.getTime();
        if (ev.recurring === 'daily') return true;
        if (ev.recurring === 'weekly') return check.getDay() === start.getDay();
        if (ev.recurring === 'monthly') return check.getDate() === start.getDate();
        if (ev.recurring === 'yearly') return check.getDate() === start.getDate() && check.getMonth() === start.getMonth();
        return false;
    };

    // LOGIC: Tính toán chấm đỏ (Các task từ lúc tạo đến HÔM NAY chưa check hoàn thành)
    const calculatePendingTasks = () => {
        let pendingCount = 0;
        const todayDate = new Date(todayStr);

        events.forEach(ev => {
            let loopDate = new Date(ev.startDate);
            // Quét từ ngày bắt đầu sự kiện đến hôm nay
            while (loopDate <= todayDate) {
                const dateStr = formatDateStr(loopDate);
                if (isEventOnDate(ev, dateStr)) {
                    if (!ev.completedDates.includes(dateStr)) {
                        pendingCount++;
                    }
                }
                loopDate.setDate(loopDate.getDate() + 1);
            }
        });
        
        if (onUpdatePendingCount) onUpdatePendingCount(pendingCount);
    };

    // Chuyển tháng
    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Lưu sự kiện mới
    const handleSaveEvent = (e) => {
        e.preventDefault();
        if (!newEvent.title.trim()) return;
        const eventToSave = {
            id: 'evt_' + Date.now(),
            title: newEvent.title,
            startDate: newEvent.startDate,
            recurring: newEvent.recurring,
            completedDates: [] // Mảng lưu các ngày (YYYY-MM-DD) đã bấm Hoàn thành
        };
        setEvents([...events, eventToSave]);
        setShowModal(false);
        setNewEvent({ title: '', startDate: todayStr, recurring: 'none' });
    };

    // Tick hoàn thành sự kiện
    const toggleComplete = (eventId, dateStr) => {
        setEvents(events.map(ev => {
            if (ev.id === eventId) {
                const isDone = ev.completedDates.includes(dateStr);
                const updatedDates = isDone 
                    ? ev.completedDates.filter(d => d !== dateStr) 
                    : [...ev.completedDates, dateStr];
                return { ...ev, completedDates: updatedDates };
            }
            return ev;
        }));
    };

    // Xoá sự kiện hoàn toàn khỏi hệ thống
    const deleteEvent = (eventId) => {
        if(window.confirm("Bạn có chắc muốn xoá chuỗi sự kiện này không?")) {
            setEvents(events.filter(ev => ev.id !== eventId));
        }
    }

    // Render các ô Lịch
    const renderCalendarCells = () => {
        const cells = [];
        
        // Ô trống đầu tháng
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="bg-transparent border border-transparent p-2 h-32"></div>);
        }

        // Các ngày trong tháng
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDateStr = formatDateStr(new Date(currentYear, currentMonth, day));
            const isToday = cellDateStr === todayStr;

            // 1. Tìm các Đợt Bán Hàng (Dải màu xanh)
            const daySessions = sessions.filter(s => {
                const start = s.actual_start_date;
                const end = s.actual_end_date;
                return cellDateStr >= start && cellDateStr <= end;
            });

            // 2. Tìm các Sự kiện Cá nhân (Dải màu Đỏ/Cam)
            const dayPersonalEvents = events.filter(ev => isEventOnDate(ev, cellDateStr));

            cells.push(
                <div key={day} className={`bg-white border border-gray-100 p-2 h-32 flex flex-col overflow-hidden relative transition-all hover:shadow-md group ${isToday ? 'ring-2 ring-[#26D0CE] bg-teal-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-[15px] font-bold ${isToday ? 'text-white bg-[#26D0CE] w-7 h-7 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>
                            {day}
                        </span>
                        {/* Ngày Âm lịch (Giả lập đơn giản: lấy ngày dương lùi 1 tháng) */}
                        <span className="text-[10px] font-medium text-gray-400 mt-1">
                            {day}/{currentMonth === 0 ? 12 : currentMonth}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 mt-1 pr-1">
                        {/* Render Đợt Bán Hàng */}
                        {daySessions.map((s, idx) => (
                            <div key={`ses-${s.id}-${idx}`} className="bg-[#1A5B82] text-white text-[10px] font-bold px-2 py-1 rounded-md truncate shadow-sm">
                                📈 {s.name}
                            </div>
                        ))}

                        {/* Render Nhắc Việc Cá Nhân */}
                        {dayPersonalEvents.map((ev) => {
                            const isCompleted = ev.completedDates.includes(cellDateStr);
                            const isPastDue = cellDateStr < todayStr && !isCompleted;

                            return (
                                <div key={`pe-${ev.id}`} className={`group/task flex items-center justify-between text-[11px] font-bold px-2 py-1.5 rounded-md shadow-sm transition-all border ${
                                    isCompleted ? 'bg-gray-100 text-gray-400 border-gray-200 line-through' : 
                                    isPastDue ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                                }`}>
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1 cursor-pointer" onClick={() => deleteEvent(ev.id)} title="Bấm để xoá chuỗi sự kiện này">
                                        <span className="truncate">{ev.title}</span>
                                    </div>
                                    <button 
                                        onClick={() => toggleComplete(ev.id, cellDateStr)} 
                                        className={`w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0 transition-colors ${isCompleted ? 'bg-gray-300 border-gray-400' : 'bg-white border-orange-300 hover:bg-orange-100'}`}
                                    >
                                        {isCompleted && <Check size={12} className="text-white" strokeWidth={3} />}
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            );
        }

        return cells;
    };

    return (
        <div className="w-full h-full liquid-glass rounded-[32px] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60 bg-white/60 flex flex-col relative animate-fade-in-up">
            
            {/* Header Lịch */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex bg-white rounded-full p-1 shadow-sm border border-gray-100">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"><ChevronLeft size={20} /></button>
                        <div className="flex items-center px-4 font-black text-[18px] text-[#1A5B82] min-w-[160px] justify-center">
                            Tháng {currentMonth + 1}, {currentYear}
                        </div>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"><ChevronRight size={20} /></button>
                    </div>
                    <button onClick={goToToday} className="px-4 py-2.5 bg-white border border-gray-200 rounded-full text-[13px] font-bold text-gray-600 hover:text-[#26D0CE] hover:border-[#26D0CE] transition-all shadow-sm flex items-center gap-2">
                        <CalIcon size={16} /> Hôm nay
                    </button>
                </div>

                {/* NÚT THÊM SỰ KIỆN */}
                <button onClick={() => setShowModal(true)} className="px-6 py-3 rounded-full bg-gradient-to-r from-orange-400 to-rose-400 text-white font-black text-[14px] shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_10px_25px_rgba(244,63,94,0.4)] active:scale-95 transition-all flex items-center gap-2">
                    <Plus size={18} strokeWidth={3} /> THÊM NHẮC NHỞ
                </button>
            </div>

            {/* Bảng Lịch */}
            <div className="flex-1 flex flex-col min-h-[600px]">
                {/* Ngày trong tuần */}
                <div className="grid grid-cols-7 gap-px mb-2">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
                        <div key={day} className={`text-center py-2 font-black text-[13px] tracking-widest uppercase ${i >= 5 ? 'text-rose-500' : 'text-gray-400'}`}>
                            {day}
                        </div>
                    ))}
                </div>
                {/* Lưới ngày */}
                <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                    {renderCalendarCells()}
                </div>
            </div>

            {/* MODAL THÊM SỰ KIỆN */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in-up">
                    <div className="bg-white rounded-[32px] w-full max-w-[420px] p-8 shadow-2xl relative">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"><X size={24}/></button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500"><Clock size={24}/></div>
                            <div>
                                <h3 className="text-[20px] font-black text-[#1D1D1F]">Tạo Nhắc Nhở</h3>
                                <p className="text-[12px] text-gray-500 font-bold">Hệ thống sẽ tự động ghim vào lịch</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveEvent} className="space-y-5">
                            <div>
                                <label className="block text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2">Nội dung công việc</label>
                                <input required type="text" placeholder="VD: Nhập tiền xưởng, Đáo hạn ngân hàng..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-[15px] font-bold focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                                    value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2">Ngày bắt đầu</label>
                                    <input required type="date" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-[14px] font-bold focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-700"
                                        value={newEvent.startDate} onChange={e => setNewEvent({...newEvent, startDate: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2">Chu kỳ Lặp lại</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-[14px] font-bold focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-700 cursor-pointer appearance-none"
                                        value={newEvent.recurring} onChange={e => setNewEvent({...newEvent, recurring: e.target.value})}
                                    >
                                        <option value="none">Chỉ 1 lần</option>
                                        <option value="daily">Hằng ngày</option>
                                        <option value="weekly">Hằng tuần</option>
                                        <option value="monthly">Hằng tháng</option>
                                        <option value="yearly">Hằng năm</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" className="w-full mt-4 py-4 rounded-[20px] bg-gradient-to-r from-orange-400 to-rose-400 text-white font-black text-[15px] tracking-widest shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_10px_25px_rgba(244,63,94,0.4)] active:scale-95 transition-all uppercase flex justify-center items-center gap-2">
                                <Check size={20} strokeWidth={3} /> LƯU SỰ KIỆN
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}