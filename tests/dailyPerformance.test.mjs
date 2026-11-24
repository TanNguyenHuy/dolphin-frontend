import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDetailStats, getSessionDays, rankDailyRevenue } from '../src/logic.js';

test('total profit deducts capital, laundry and advertising without dividing by days', () => {
    const detail = { so_tien_cua_kien: 1000000, computed: { tong_doanh_thu: 7735000 }, daily: [{ ngay_ban: '2026-11-01' }, { ngay_ban: '2026-11-10' }] };
    assert.equal(calculateDetailStats(detail, [], 350000).detailProfit, 5995000);
});

test('date spans use live transactions and support one-day, legacy and invalid dates', () => {
    assert.equal(getSessionDays({ daily: [{ ngay_ban: '2026-11-01' }, { ngay_ban: '2026-11-03' }], actual_end_date: '2026-12-01' }), 3);
    assert.equal(getSessionDays({ start_date: '2026-11-01', end_date: '2026-11-01' }), 1);
    assert.equal(getSessionDays({ start_date: 'invalid' }), 1);
    assert.equal(getSessionDays({ start_date: '2026-11-10', end_date: '2026-11-01' }), 1);
    assert.equal(getSessionDays({ daily: [{ ngay_ban: null }] }), 1);
});

test('top three rank revenue per day and leave source records untouched', () => {
    const sessions = [
        { id: 'long', tong_doanh_thu: 1000, start_date: '2026-11-01', end_date: '2026-11-10' },
        { id: 'short', tong_doanh_thu: '500', start_date: '2026-11-01', end_date: '2026-11-02' },
        { id: 'day', tong_doanh_thu: 300, start_date: '2026-11-01' },
        { id: 'low', tong_doanh_thu: 5, start_date: '2026-11-01' },
    ];
    assert.deepEqual(rankDailyRevenue(sessions).map(session => session.id), ['day', 'short', 'long']);
    assert.equal(sessions[0].revenuePerDay, undefined);
});
