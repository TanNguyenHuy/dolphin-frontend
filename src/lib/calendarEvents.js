import { SolarDate } from 'lunar-date-vn';

export function validCalendarDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith('0000')) return false;
    const time = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

function easterDate(year) {
    // Gregorian computus: https://aa.usno.navy.mil/faq/easter
    const golden = year % 19;
    const century = Math.floor(year / 100);
    const yearInCentury = year % 100;
    const solarCorrection = Math.floor(century / 4);
    const lunarCorrection = Math.floor((century - Math.floor((century + 8) / 25) + 1) / 3);
    const epact = (19 * golden + century - solarCorrection - lunarCorrection + 15) % 30;
    const weekdayCorrection = (32 + 2 * (century % 4) + 2 * Math.floor(yearInCentury / 4) - epact - yearInCentury % 4) % 7;
    const exception = Math.floor((golden + 11 * epact + 22 * weekdayCorrection) / 451);
    const position = epact + weekdayCorrection - 7 * exception + 114;
    return `${String(year).padStart(4, '0')}-${String(Math.floor(position / 31)).padStart(2, '0')}-${String(position % 31 + 1).padStart(2, '0')}`;
}

export function getCalendarEvents(year, month, importantDates = []) {
    const grouped = {};
    if (!Number.isInteger(year) || year < 1 || year > 9999 || !Number.isInteger(month) || month < 0 || month > 11) return grouped;
    const prefix = `${String(year).padStart(4, '0')}-${String(month + 1).padStart(2, '0')}-`;
    const add = (date, id, title, kind = 'holiday') => {
        if (!date.startsWith(prefix)) return;
        const events = grouped[date] ||= [];
        if (!events.some(event => event.id === id)) events.push({ id, title, kind });
    };
    const fixed = [
        ['01-01', 'new-year', 'Tết Dương lịch'],
        ['04-30', 'reunification', 'Ngày Giải phóng miền Nam'],
        ['05-01', 'labour-day', 'Ngày Quốc tế Lao động'],
        ['09-02', 'national-day', 'Quốc khánh'],
        ['10-31', 'reformation', 'Ngày Cải chánh Tin Lành'],
        ['12-25', 'christmas', 'Lễ Giáng sinh'],
    ];
    fixed.forEach(([date, id, title]) => add(`${String(year).padStart(4, '0')}-${date}`, id, title));
    const easter = Date.parse(`${easterDate(year)}T00:00:00Z`);
    for (const [offset, id, title] of [
        [-2, 'good-friday', 'Lễ Thương khó'],
        [0, 'easter', 'Lễ Phục sinh'],
        [39, 'ascension', 'Lễ Thăng thiên'],
        [49, 'pentecost', 'Lễ Đức Thánh Linh giáng lâm'],
    ]) add(new Date(easter + offset * 86400000).toISOString().slice(0, 10), id, title);

    for (let day = 1; day <= 31; day++) {
        const date = prefix + String(day).padStart(2, '0');
        if (!validCalendarDate(date)) continue;
        // The installed lunar calendar supports 1200–2199; fixed/custom dates work outside that range.
        if (year >= 1200 && year <= 2199 && date >= '1200-01-31') {
            const lunar = new SolarDate(new Date(year, month, day, 12)).toLunarDate()?.get();
            if (lunar && !lunar.leap_month) {
                if (lunar.month === 1 && lunar.day <= 3) add(date, `tet-${lunar.day}`, `Tết Nguyên đán · Mùng ${lunar.day}`);
                if (lunar.month === 3 && lunar.day === 10) add(date, 'hung-kings', 'Giỗ Tổ Hùng Vương');
                if (lunar.month === 8 && lunar.day === 15) add(date, 'mid-autumn', 'Tết Trung thu');
            }
        }
        (Array.isArray(importantDates) ? importantDates : []).forEach((event, index) => {
            if (!event || typeof event.title !== 'string' || !event.title.trim() || !validCalendarDate(event.startDate) || !validCalendarDate(event.endDate)) return;
            if (event.startDate <= date && date <= event.endDate) add(date, `important-${event.id || index}`, event.title.trim(), 'important');
        });
    }
    return grouped;
}
