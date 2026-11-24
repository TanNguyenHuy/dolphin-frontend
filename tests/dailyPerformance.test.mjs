import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateProfitTarget, getSessionDays, rankDailyRevenue } from '../src/logic.js';

test('profit target uses inclusive daily averages rather than total profit', () => {
    const slow = { id: 'slow', name: 'Thường dài ngày', actual_start_date: '2026-11-01', actual_end_date: '2026-11-10', realProfit: 10000000 };
    const fast = { id: 'fast', name: 'Thường ngắn ngày', actual_start_date: '2026-11-01', actual_end_date: '2026-11-02', realProfit: 4000000 };
    const current = { id: 'live', daily: [{ ngay_ban: '2026-11-01' }, { ngay_ban: '2026-11-04' }] };
    const result = calculateProfitTarget([slow, fast, { name: 'Sale', realProfit: 999999999 }], current, 6000000);
    assert.equal(result.targetSession.id, 'fast');
    assert.equal(result.dynamicTarget, 2000000);
    assert.equal(result.dailyProfit, 1500000);
    assert.equal(result.progressPercent, 75);
    assert.equal(result.isTargetReached, false);
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
