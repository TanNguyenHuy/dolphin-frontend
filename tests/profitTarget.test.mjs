import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDetailStats, calculateProfitTarget } from '../src/logic.js';

test('target uses the highest actual profit across sale types and completion states', () => {
    const sessions = [
        { id: 'normal', name: 'Đợt thường', realProfit: 30000000, is_completed: true },
        { id: 'sale', name: 'Sale', realProfit: '45000000', is_completed: false },
        { id: 'repost', name: 'Đăng lại', realProfit: 20000000, projected15d: 999000000 },
    ];
    const result = calculateProfitTarget(sessions, { id: 'current' }, 6345000);
    assert.equal(result.dynamicTarget, 45000000);
    assert.equal(result.targetSession.id, 'sale');
    assert.equal(result.isTargetReached, false);
    assert.ok(Math.abs(result.progressPercent - 14.1) < 1e-9);
});

test('live detail overrides the stale cached profit of the current session', () => {
    const sessions = [{ id: 'current', realProfit: 100000000 }, { id: 'other', realProfit: 50000000 }];
    assert.equal(calculateProfitTarget(sessions, { _id: 'current' }, 1000000).dynamicTarget, 50000000);
    const record = calculateProfitTarget(sessions, { id: 'current', name: 'Kỷ lục mới' }, 60000000);
    assert.equal(record.dynamicTarget, 60000000);
    assert.equal(record.targetSession.name, 'Kỷ lục mới');
    assert.equal(record.isTargetReached, true);
    assert.equal(record.progressPercent, 100);
    assert.equal(sessions[0].realProfit, 100000000, 'cached data is not mutated');
});

test('losses, missing records, invalid profits and ties have stable progress', () => {
    assert.equal(calculateProfitTarget([{ realProfit: 100 }], { id: 'current' }, -10).progressPercent, 0);
    const empty = calculateProfitTarget([{ realProfit: -50 }, { realProfit: NaN }, { realProfit: Infinity }], { id: 'current' }, -100);
    assert.equal(empty.dynamicTarget, 0);
    assert.equal(empty.targetSession, null);
    assert.equal(empty.isTargetReached, false);
    assert.equal(empty.progressPercent, 0);
    assert.equal(calculateProfitTarget([{ id: 'other', realProfit: 100 }], { id: 'current' }, 100).isTargetReached, true);
    assert.equal(calculateProfitTarget().dynamicTarget, 0);
});

test('profit is computed after capital, laundry and advertising before it becomes the benchmark', () => {
    const detail = { id: 'current', so_tien_cua_kien: 1000000, computed: { tong_doanh_thu: 7735000 }, daily: [{ ngay_ban: '2026-10-28' }] };
    const { detailProfit } = calculateDetailStats(detail, [], 350000);
    assert.equal(detailProfit, 6345000);
    assert.equal(calculateProfitTarget([], detail, detailProfit).dynamicTarget, 6345000);
});
