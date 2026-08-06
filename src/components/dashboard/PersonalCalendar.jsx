import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Check, X, Calendar as CalIcon, Clock, Settings2 } from 'lucide-react';

// Hàm hỗ trợ format ngày (YYYY-MM-DD) để so sánh chuẩn xác
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
    
    // States cho Modal tạo sự kiện
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        title: '',
        startDate: formatDateStr(new Date()),
        recurring: 'none' // none, daily, weekly, monthly, yearly, custom
    });
    
    // State cho tùy chỉnh lặp lại (Giống iOS)
    const [customConfig, setCustomConfig] = useState({
        frequency: 'daily', // daily, weekly, monthly, yearly
        interval: 1,
        daysOfWeek: [new Date().getDay()] // Mặc định là ngày trong tuần hiện tại
    });

    // Cập nhật LocalStorage và đếm Chấm đỏ mỗi khi sự kiện thay đổi
    useEffect(() => {
        localStorage.setItem('dolphin_personal_events', JSON.stringify(events));
        calculatePendingTasks();
    }, [events]);

    // Lấy thông tin ngày tháng để vẽ Lưới lịch
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

    // ============================================================================
    // BỘ NÃO LOGIC LẶP LẠI (Tích hợp thuật toán Custom Recurring chuẩn Apple)
    // ============================================================================
    const isEventOnDate = (ev, checkDateStr) => {
        const start = new Date(ev.startDate);
        start.setHours(0,0,0,0);
        const check = new Date(checkDateStr);
        check.setHours(0,0,0,0);

        // Nguyên tắc: Không tính các ngày trước mốc tạo sự kiện
        if (check < start) return false;

        // Các mốc lặp cơ bản
        if (ev.recurring === 'none') return check.getTime() === start.getTime();
        if (ev.recurring === 'daily') return true;
        if (ev.recurring === 'weekly') return check.getDay() === start.getDay();
        if (ev.recurring === 'monthly') return check.getDate() === start.getDate();
        if (ev.recurring === 'yearly') return check.getDate() === start.getDate() && check.getMonth() === start.getMonth();

        // Mốc lặp TUỲ CHỈNH (Custom)
        if (ev.recurring === 'custom' && ev.customConfig) {
            const { frequency, interval, daysOfWeek } = ev.customConfig;
            const diffTime = check.getTime() - start.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (frequency === 'daily') {
                return diffDays % interval === 0;
            }
            if (frequency === 'weekly') {
                // Quy về Thứ 2 để tính chênh lệch tuần chuẩn xác
                const startMonday = new Date(start);
                startMonday.setDate(start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1));
                const checkMonday = new Date(check);
                checkMonday.setDate(check.getDate() - (check.getDay() === 0 ? 6 : check.getDay() - 1));
                
                const weekDiff = Math.round((checkMonday - startMonday) / (1000 * 60 * 60 * 24 * 7));

                if (weekDiff % interval === 0) {
                    return daysOfWeek.includes(check.getDay());
                }
                return false;
            }
            if (frequency === 'monthly') {
                const monthDiff = (check.getFullYear() - start.getFullYear()) * 12 + (check.getMonth() - start.getMonth());
                if (monthDiff % interval === 0) {
                    return check.getDate() === start.getDate(); 
                }
                return false;
            }
            if (frequency === 'yearly') {
                const yearDiff = check.getFullYear() - start.getFullYear();
                if (yearDiff % interval === 0) {
                    return check.getMonth() === start.getMonth() && check.getDate() === start.getDate();
                }
                return false;
            }
        }
        return false;
    };

    // Đếm Task chưa hoàn thành cho Chấm đỏ (Tính từ ngày tạo -> hôm nay)
    const calculatePendingTasks = () => {
        let pendingCount = 0;
        const todayDate = new Date(todayStr);

        events.forEach(ev => {
            let loopDate = new Date(ev.startDate);
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

    // Điều hướng lịch
    const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    // Lưu sự kiện
    const handleSaveEvent = (e) => {
        e.preventDefault();
        if (!newEvent.title.trim()) return;
        
        // Cảnh báo nếu chọn Hàng tuần mà không tick thứ nào
        if (newEvent.recurring === 'custom' && customConfig.frequency === 'weekly' && customConfig.daysOfWeek.length === 0) {
            alert("Vui lòng chọn ít nhất một ngày trong tuần!");
            return;
        }

        const eventToSave = {
            id: 'evt_' + Date.now(),
            title: newEvent.title,
            startDate: newEvent.startDate,
            recurring: newEvent.recurring,
            customConfig: newEvent.recurring === 'custom' ? customConfig : null,
            completedDates: [] 
        };
        
        setEvents([...events, eventToSave]);
        setShowModal(false);
        setNewEvent({ title: '', startDate: todayStr, recurring: 'none' });
    };

    // Tick hoàn thành / Bỏ tick
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

    // Xoá chuỗi sự kiện
    const deleteEvent = (eventId) => {
        if(window.confirm("Bạn có chắc muốn xoá toàn bộ chuỗi nhắc nhở này không?")) {
            setEvents(events.filter(ev => ev.id !== eventId));
        }
    }

    // Hiển thị text mô tả cho Custom Recurring
    const getCustomRecurringText = () => {
        const { frequency, interval, daysOfWeek } = customConfig;
        const freqText = frequency === 'daily' ? 'ngày' : frequency === 'weekly' ? 'tuần' : frequency === 'monthly' ? 'tháng' : 'năm';
        
        if (frequency === 'weekly') {
            const dayNames = daysOfWeek.map(d => d === 0 ? 'CN' : `T${d+1}`).join(', ');
            return `Sự kiện sẽ diễn ra mỗi ${interval} tuần vào ${dayNames}.`;
        }
        return `Sự kiện sẽ diễn ra mỗi ${interval} ${freqText}.`;
    };

    // Render Lưới Lịch
    const renderCalendarCells = () => {
        const cells = [];
        
        // Ô trống đầu tháng
        for (let i = 0; i < firstDay; i++) {
            cells.push(<div key={`empty-${i}`} className="bg-transparent border border-transparent p-2 h-36"></div>);
        }

        // Ô ngày thực tế
        for (let day = 1; day <= daysInMonth; day++) {
            const cellDateStr = formatDateStr(new Date(currentYear, currentMonth, day));
            const isToday = cellDateStr === todayStr;

            // 1. Quét sâu vào TẤT CẢ các item trong "Chi tiết sản phẩm" của các đợt bán
            const daySales = [];
            sessions.forEach(s => {
                if (s.daily && Array.isArray(s.daily)) {
                    s.daily.forEach(item => {
                        const itemDateStr = item.ngay_ban ? item.ngay_ban.substring(0, 10) : '';
                        if (itemDateStr === cellDateStr) {
                            daySales.push(item);
                        }
                    });
                }
            });

            // 2. Tìm sự kiện cá nhân (Nhắc nhở)
            const dayPersonalEvents = events.filter(ev => isEventOnDate(ev, cellDateStr));

            cells.push(
                <div key={day} className={`bg-white border border-gray-100 p-2 h-36 flex flex-col overflow-hidden relative transition-all hover:shadow-md group ${isToday ? 'ring-2 ring-[#26D0CE] bg-teal-50/30' : ''}`}>
                    <div className="flex justify-between items-start mb-1 shrink-0">
                        <span className={`text-[15px] font-bold ${isToday ? 'text-white bg-[#26D0CE] w-7 h-7 rounded-full flex items-center justify-center' : 'text-gray-700'}`}>
                            {day}
                        </span>
                        {/* Ngày Âm lịch giả định */}
                        <span className="text-[10px] font-medium text-gray-400 mt-1">
                            {day}/{currentMonth === 0 ? 12 : currentMonth}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 mt-1 pr-1">
                        
                        {/* Render "Chi tiết sản phẩm" đã bán (Các thẻ màu xanh/xám nhẹ) */}
                        {daySales.map((item, idx) => (
                            <div key={`sale-${idx}`} className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-1.5 py-1 rounded-[6px] truncate shadow-sm flex items-center gap-1 shrink-0">
                                <span>🛍️</span> 
                                <span className="truncate flex-1">{item.ten_san_pham}</span>
                                <span className="bg-blue-200/50 px-1 rounded-sm">{item.so_luong || 0}</span>
                            </div>
                        ))}

                        {/* Render "Nhắc việc cá nhân" (Các thẻ Đỏ/Cam) */}
                        {dayPersonalEvents.map((ev) => {
                            const isCompleted = ev.completedDates.includes(cellDateStr);
                            const isPastDue = cellDateStr < todayStr && !isCompleted;

                            return (
                                <div key={`pe-${ev.id}`} className={`group/task flex items-center justify-between text-[11px] font-bold px-1.5 py-1.5 rounded-[6px] shadow-sm transition-all border shrink-0 ${
                                    isCompleted ? 'bg-gray-50 text-gray-400 border-gray-200 line-through' : 
                                    isPastDue ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                                }`}>
                                    <div className="flex items-center gap-1 min-w-0 flex-1 cursor-pointer" onClick={() => deleteEvent(ev.id)} title="Bấm để xoá chuỗi nhắc nhở">
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCompleted ? 'bg-gray-300' : isPastDue ? 'bg-rose-400 animate-pulse' : 'bg-orange-400'}`}></div>
                                        <span className="truncate">{ev.title}</span>
                                    </div>
                                    <button 
                                        onClick={() => toggleComplete(ev.id, cellDateStr)} 
                                        className={`w-4 h-4 rounded-[4px] border flex items-center justify-center flex-shrink-0 transition-colors ml-1 ${isCompleted ? 'bg-gray-300 border-gray-400' : 'bg-white border-orange-300 hover:bg-orange-100'}`}
                                    >
                                        {isCompleted && <Check size={10} className="text-white" strokeWidth={4} />}
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
            
            {/* --- HEADER LỊCH --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex bg-white rounded-[16px] p-1 shadow-sm border border-gray-100">
                        <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600"><ChevronLeft size={20} /></button>
                        <div className="flex items-center px-4 font-black text-[18px] text-[#1A5B82] min-w-[160px] justify-center">
                            Tháng {currentMonth + 1}, {currentYear}
                        </div>
                        <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-600"><ChevronRight size={20} /></button>
                    </div>
                    <button onClick={goToToday} className="hidden md:flex px-4 py-2.5 bg-white border border-gray-200 rounded-[14px] text-[13px] font-bold text-gray-600 hover:text-[#26D0CE] hover:border-[#26D0CE] transition-all shadow-sm items-center gap-2 active:scale-95">
                        <CalIcon size={16} /> Hôm nay
                    </button>
                </div>

                <button onClick={() => setShowModal(true)} className="px-6 py-3 rounded-[16px] bg-gradient-to-r from-orange-400 to-rose-400 text-white font-black text-[14px] shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_10px_25px_rgba(244,63,94,0.4)] active:scale-95 transition-all flex items-center gap-2">
                    <Plus size={18} strokeWidth={3} /> TẠO NHẮC NHỞ
                </button>
            </div>

            {/* --- LƯỚI LỊCH CHÍNH --- */}
            <div className="flex-1 flex flex-col min-h-[600px]">
                <div className="grid grid-cols-7 gap-px mb-2 shrink-0">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, i) => (
                        <div key={day} className={`text-center py-2 font-black text-[13px] tracking-widest uppercase ${i >= 5 ? 'text-rose-500' : 'text-gray-400'}`}>
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-px bg-gray-100/50 rounded-2xl overflow-hidden border border-gray-100 flex-1">
                    {renderCalendarCells()}
                </div>
            </div>

            {/* ========================================================= */}
            {/* MODAL THÊM SỰ KIỆN & TUỲ CHỈNH LẶP LẠI */}
            {/* ========================================================= */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in-up">
                    <div className="bg-white rounded-[32px] w-full max-w-[420px] p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 bg-gray-100 p-2 rounded-full transition-colors"><X size={20}/></button>
                        
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500"><Clock size={22}/></div>
                            <div>
                                <h3 className="text-[20px] font-black text-[#1D1D1F]">Tạo Nhắc Nhở</h3>
                                <p className="text-[12px] text-gray-500 font-bold">Hệ thống sẽ tự động ghim vào lịch</p>
                            </div>
                        </div>

                        <form onSubmit={handleSaveEvent} className="space-y-5">
                            <div>
                                <label className="block text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2">Nội dung công việc</label>
                                <input required type="text" placeholder="VD: Nhập tiền xưởng, Đáo hạn..." className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 py-3.5 text-[15px] font-bold focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                                    value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2">Bắt đầu từ</label>
                                    <input required type="date" className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 py-3.5 text-[14px] font-bold focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-700"
                                        value={newEvent.startDate} onChange={e => setNewEvent({...newEvent, startDate: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-black text-gray-500 uppercase tracking-widest mb-2">Chu kỳ lặp lại</label>
                                    <select className="w-full bg-gray-50 border border-gray-200 rounded-[16px] px-4 py-3.5 text-[14px] font-bold focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition-all text-gray-700 cursor-pointer appearance-none"
                                        value={newEvent.recurring} onChange={e => setNewEvent({...newEvent, recurring: e.target.value})}
                                    >
                                        <option value="none">Chỉ 1 lần</option>
                                        <option value="daily">Hằng ngày</option>
                                        <option value="weekly">Hằng tuần</option>
                                        <option value="monthly">Hằng tháng</option>
                                        <option value="yearly">Hằng năm</option>
                                        <option value="custom">Tùy chỉnh...</option>
                                    </select>
                                </div>
                            </div>

                            {/* KHU VỰC CẤU HÌNH TUỲ CHỈNH (Hiện ra khi chọn "Tùy chỉnh...") */}
                            {newEvent.recurring === 'custom' && (
                                <div className="p-5 bg-orange-50/50 border border-orange-200/50 rounded-[20px] space-y-4 animate-scale-up origin-top">
                                    <div className="flex items-center gap-2 mb-2 text-orange-600 font-black text-[13px] uppercase tracking-widest">
                                        <Settings2 size={16} /> Cấu hình chi tiết
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <label className="text-[13px] font-bold text-gray-600">Tần suất</label>
                                        <select className="bg-white border border-gray-200 rounded-[10px] px-3 py-2 text-[13px] font-bold outline-none focus:border-orange-400"
                                            value={customConfig.frequency} onChange={e => setCustomConfig({...customConfig, frequency: e.target.value})}
                                        >
                                            <option value="daily">Hàng ngày</option>
                                            <option value="weekly">Hàng tuần</option>
                                            <option value="monthly">Hàng tháng</option>
                                            <option value="yearly">Hàng năm</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <label className="text-[13px] font-bold text-gray-600">Mỗi</label>
                                        <div className="flex items-center gap-2">
                                            <input type="number" min="1" max="99" className="w-16 bg-white border border-gray-200 rounded-[10px] px-2 py-2 text-[14px] font-bold outline-none text-center focus:border-orange-400"
                                                value={customConfig.interval} onChange={e => setCustomConfig({...customConfig, interval: parseInt(e.target.value) || 1})}
                                            />
                                            <span className="text-[13px] font-bold text-gray-600 w-10">
                                                {customConfig.frequency === 'daily' ? 'ngày' : customConfig.frequency === 'weekly' ? 'tuần' : customConfig.frequency === 'monthly' ? 'tháng' : 'năm'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Chọn Thứ trong Tuần (Chỉ hiện khi chọn Hàng Tuần) */}
                                    {customConfig.frequency === 'weekly' && (
                                        <div className="pt-2">
                                            <div className="flex flex-wrap justify-between gap-1 mt-2">
                                                {[1,2,3,4,5,6,0].map(day => (
                                                    <button type="button" key={day} 
                                                        className={`w-10 h-10 rounded-full text-[12px] font-black flex items-center justify-center transition-all ${customConfig.daysOfWeek.includes(day) ? 'bg-orange-500 text-white shadow-[0_4px_10px_rgba(249,115,22,0.3)] scale-110' : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-100'}`}
                                                        onClick={() => {
                                                            let newDays = [...customConfig.daysOfWeek];
                                                            if (newDays.includes(day)) { newDays = newDays.filter(d => d !== day); } 
                                                            else { newDays.push(day); }
                                                            setCustomConfig({...customConfig, daysOfWeek: newDays});
                                                        }}
                                                    >
                                                        {day === 0 ? 'CN' : `T${day+1}`}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Dòng chữ mô tả Tùy chỉnh (Giống iOS) */}
                                    <p className="text-[11px] font-bold text-gray-400 pt-2 border-t border-orange-200/50 text-center">
                                        {getCustomRecurringText()}
                                    </p>
                                </div>
                            )}

                            <button type="submit" className="w-full mt-2 py-4 rounded-[16px] bg-gradient-to-r from-orange-400 to-rose-400 text-white font-black text-[15px] tracking-widest shadow-[0_8px_20px_rgba(244,63,94,0.3)] hover:shadow-[0_10px_25px_rgba(244,63,94,0.4)] active:scale-95 transition-all uppercase flex justify-center items-center gap-2">
                                <Check size={20} strokeWidth={3} /> LƯU SỰ KIỆN
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}