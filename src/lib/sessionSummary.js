import { getTodayString } from './dates.js';

const number = value => Number(value) || 0;

export function buildSessionSummary(session, detail, bales, adCost) {
    const daily = Array.isArray(detail?.daily) ? detail.daily : [];
    const safeBales = Array.isArray(bales) ? bales : [];
    const totals = daily.reduce((sum, row) => ({
        imported: sum.imported + number(row.so_luong_nhap),
        sold: sum.sold + number(row.so_luong),
        revenue: sum.revenue + number(row.so_tien_ban_duoc),
    }), { imported: 0, sold: 0, revenue: 0 });
    const baleCost = safeBales.reduce((sum, bale) => sum + number(bale.cost), 0);
    const baleQuantity = safeBales.reduce((sum, bale) => sum + number(bale.qty), 0);
    const sortedBales = safeBales.filter(bale => String(bale.name || '').trim())
        .slice().sort((a, b) => b.name.length - a.name.length);
    const average = totals.imported > 0 ? number(session.so_tien_cua_kien) / totals.imported : 0;
    const inventory = daily.reduce((sum, row) => {
        const bale = sortedBales.find(item => String(row.ten_san_pham || '').toLowerCase().includes(item.name.toLowerCase()));
        const unitCost = bale ? number(bale.cost) / (number(bale.qty) || 1) : average;
        return sum + Math.round((number(row.so_luong_nhap) - number(row.so_luong)) * unitCost);
    }, 0);
    const dates = daily.map(row => new Date(row.ngay_ban).getTime()).filter(Number.isFinite);
    const start = dates.length ? new Date(Math.min(...dates)).toISOString().slice(0, 10) : session.start_date || getTodayString();
    const end = dates.length ? new Date(Math.max(...dates)).toISOString().slice(0, 10) : session.end_date || start;
    return {
        ...session,
        daily,
        detail,
        bales: safeBales,
        tong_sl_nhap: totals.imported,
        tong_sl_ban: totals.sold,
        tong_doanh_thu: totals.revenue,
        quang_cao: daily.length * adCost,
        avgPrice: baleQuantity > 0 ? Math.round(baleCost / baleQuantity) : 0,
        tong_tien_ton_computed: inventory,
        actual_start_date: start,
        actual_end_date: end,
    };
}
