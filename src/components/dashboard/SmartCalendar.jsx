import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SolarDate } from 'lunar-date-vn';
import { formatCurrency, getTodayString } from '../../utils';
import { useAppearance } from '../appearance/AppearanceContext';

function lunarLabel(year, month, day) {
    try {
        const lunar = new SolarDate(new Date(year, month, day)).toLunarDate();
        return lunar.day === 1 ? `${lunar.day}/${lunar.month}` : String(lunar.day);
    } catch { return ''; }
}

export default function SmartCalendar({ sessions = [] }) {
    const appearance = useAppearance();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState(appearance.calendarView);
    const [selectedDate, setSelectedDate] = useState(null);
    const [preview, setPreview] = useState(null);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = getTodayString();
    const dailyData = useMemo(() => {
        const grouped = {};
        for (const session of sessions) for (const item of session.daily || []) {
            const date = String(item.ngay_ban || '').slice(0, 10);
            if (date) (grouped[date] ||= []).push(item);
        }
        return grouped;
    }, [sessions]);
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
    const activeDates = Object.keys(dailyData).filter(date => date.startsWith(monthPrefix)).sort();
    const days = new Date(year, month + 1, 0).getDate();
    const offset = (new Date(year, month, 1).getDay() + 6) % 7;
    const previewItems = view === 'month' && preview?.date.startsWith(monthPrefix) ? dailyData[preview.date] : null;
    const showPreview = (date, button) => {
        const rect = button.getBoundingClientRect();
        const below = rect.top < window.innerHeight - rect.bottom;
        const width = Math.min(280, window.innerWidth - 16);
        setPreview({
            date,
            style: {
                width,
                left: Math.max(8, Math.min(rect.left + (rect.width - width) / 2, window.innerWidth - width - 8)),
                ...(below ? { top: rect.bottom + 8 } : { bottom: window.innerHeight - rect.top + 8 }),
                maxHeight: (below ? window.innerHeight - rect.bottom : rect.top) - 16,
            },
        });
    };
    useEffect(() => {
        if (!preview) return;
        const dismiss = () => setPreview(null);
        const handleKeyDown = event => { if (event.key === 'Escape') dismiss(); };
        window.addEventListener('scroll', dismiss, true);
        window.addEventListener('resize', dismiss);
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('scroll', dismiss, true);
            window.removeEventListener('resize', dismiss);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [preview]);
    const navigate = offset => { setCurrentDate(new Date(year, month + offset, 1)); setSelectedDate(null); setPreview(null); };
    return <section className="smart-calendar reading-panel" aria-label="Lịch bán hàng">
        <div className="calendar-toolbar"><button type="button" aria-label="Tháng trước" onClick={() => navigate(-1)}><ChevronLeft size={20} /></button><h2>Tháng {month + 1} {year}</h2><button type="button" aria-label="Tháng sau" onClick={() => navigate(1)}><ChevronRight size={20} /></button></div>
        <div className="calendar-view-switch" role="group" aria-label="Cách xem lịch bán hàng"><button type="button" aria-pressed={view === 'month'} onClick={() => setView('month')}>Tháng</button><button type="button" aria-pressed={view === 'agenda'} onClick={() => { setView('agenda'); setPreview(null); }}>Danh sách</button></div>
        {view === 'month' ? <div className="smart-month-grid">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => <span className="calendar-weekday" key={day}>{day}</span>)}
            {Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} />)}
            {Array.from({ length: days }, (_, index) => {
                const day = index + 1;
                const date = monthPrefix + String(day).padStart(2, '0');
                const active = Boolean(dailyData[date]);
                return <button type="button" key={day} className={`calendar-day ${active ? 'has-sales' : ''} ${date === today ? 'is-today' : ''}`} aria-label={`${day}/${month + 1}/${year}${active ? `, ${dailyData[date].length} giao dịch` : ''}`} aria-pressed={selectedDate === date} aria-current={date === today ? 'date' : undefined} aria-describedby={previewItems && preview.date === date ? 'calendar-sale-preview' : undefined}
                    onPointerEnter={event => { if (active && event.pointerType === 'mouse') showPreview(date, event.currentTarget); }}
                    onPointerLeave={() => setPreview(null)}
                    onFocus={event => { if (active && event.currentTarget.matches(':focus-visible')) showPreview(date, event.currentTarget); }}
                    onBlur={() => setPreview(null)}
                    onClick={() => { setSelectedDate(date); setPreview(null); }}><span>{day}</span>{appearance.showLunar && <small>{lunarLabel(year, month, day)}</small>}</button>;
            })}
        </div> : <div className="calendar-agenda">{activeDates.length ? activeDates.map(date => <button type="button" className="agenda-sale" aria-pressed={selectedDate === date} key={date} onClick={() => setSelectedDate(date)}><span><strong>{Number(date.slice(-2))}/{month + 1}</strong><small>{dailyData[date].length} giao dịch</small></span><strong>{formatCurrency(dailyData[date].reduce((sum, item) => sum + (Number(item.so_tien_ban_duoc) || 0), 0))} đ</strong></button>) : <p className="calendar-empty">Chưa có giao dịch trong tháng này.</p>}</div>}
        {previewItems && createPortal(
            <div id="calendar-sale-preview" role="tooltip" className="calendar-sale-preview animate-fade-in" style={preview.style}>
                <header><strong>Ngày {Number(preview.date.slice(-2))}/{month + 1}</strong><span>{previewItems.length} giao dịch</span></header>
                <ul>{previewItems.slice(0, 5).map((item, index) => (
                    <li key={item.id || index}>
                        <span>{item.ten_san_pham || 'Sản phẩm'}<small>Bán: {item.so_luong || 0} / Nhập: {item.so_luong_nhap || 0}</small></span>
                        <strong>{formatCurrency(item.so_tien_ban_duoc)} đ</strong>
                    </li>
                ))}</ul>
                {previewItems.length > 5 && <p>+{previewItems.length - 5} giao dịch khác</p>}
            </div>, document.body)}
        {selectedDate && <div className="calendar-day-detail" aria-live="polite"><h3>Ngày {Number(selectedDate.slice(-2))}/{month + 1}/{year}</h3>{dailyData[selectedDate]?.length ? <ul>{dailyData[selectedDate].map((item, index) => <li key={item.id || index}><span>{item.ten_san_pham || 'Sản phẩm'}</span><strong>{formatCurrency(item.so_tien_ban_duoc)} đ</strong></li>)}</ul> : <p>Chưa có giao dịch.</p>}</div>}
        <button type="button" className="calendar-today" onClick={() => { setCurrentDate(new Date()); setSelectedDate(today); setPreview(null); }}>Về tháng hiện tại</button>
    </section>;
}
