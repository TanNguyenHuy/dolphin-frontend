import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readAuthUser } from '../src/lib/browserStorage.js';
import { buildSessionSummary } from '../src/lib/sessionSummary.js';
import { calculateDetailStats } from '../src/logic.js';

test('corrupt session storage falls back to a valid remembered account', () => {
    assert.deepEqual(readAuthUser({ sessionStorage: { getItem: () => '{broken' }, localStorage: { getItem: () => '{"id":"remembered"}' } }), { id: 'remembered' });
    assert.equal(readAuthUser({ sessionStorage: { getItem: () => '[]' }, localStorage: { getItem: () => 'false' } }), null);
    const blocked = { get sessionStorage() { throw new Error('blocked'); }, get localStorage() { throw new Error('blocked'); } };
    assert.equal(readAuthUser(blocked), null);
});

test('today uses the local date around midnight in Bangkok', () => {
    const moduleUrl = new URL('../src/lib/dates.js', import.meta.url).href;
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', `import { getTodayString } from ${JSON.stringify(moduleUrl)}; console.log(getTodayString(new Date('2026-10-27T18:30:00Z')))`], { encoding: 'utf8', env: { ...process.env, TZ: 'Asia/Bangkok' } });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), '2026-10-28');
});

test('session summaries normalize numeric strings and retain accurate cached detail previews', () => {
    const session = { id: 's1', name: 'Đợt bán', so_tien_cua_kien: 1000000 };
    const detail = { ...session, daily: [
        { id: 'r1', ngay_ban: '2026-10-01', ten_san_pham: 'Áo thun', so_luong_nhap: '10', so_luong: '4', so_tien_ban_duoc: '800000' },
        { id: 'r2', ngay_ban: '2026-10-02', ten_san_pham: 'Áo thun', so_luong_nhap: '0', so_luong: '1', so_tien_ban_duoc: '200000' },
    ], computed: { tong_doanh_thu: 1000000, trung_binh: 100000 } };
    const bales = [{ name: 'Áo', qty: '10', cost: '1000000' }];
    const summary = buildSessionSummary(session, detail, bales, 350000);
    assert.equal(summary.tong_sl_nhap, 10);
    assert.equal(summary.tong_sl_ban, 5);
    assert.equal(summary.tong_doanh_thu, 1000000);
    assert.equal(summary.tong_tien_ton_computed, 500000);
    assert.equal(summary.avgPrice, 100000);
    assert.equal(summary.quang_cao, 700000);
    assert.equal(summary.actual_end_date, '2026-10-02');
    assert.equal(session.tong_sl_nhap, undefined, 'source data must not be mutated');
    assert.equal(calculateDetailStats(summary.detail, summary.bales, 350000).detailProfit, -740000);
});

test('empty bale names do not match every product and corrupt daily collections are safe', () => {
    const summary = buildSessionSummary({ so_tien_cua_kien: 100 }, { daily: [{ so_luong_nhap: 10, so_luong: 5, ten_san_pham: 'Áo' }] }, [{ name: '', cost: 9999, qty: 1 }], 1);
    assert.equal(summary.tong_tien_ton_computed, 50);
    assert.equal(buildSessionSummary({}, { daily: {} }, null, 1).tong_sl_nhap, 0);
});
