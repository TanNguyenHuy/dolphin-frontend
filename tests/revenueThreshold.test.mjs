import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGlobalStats, getBaleSaleRows } from '../src/logic.js';

test('one billion threshold has capped progress and taxes only the excess', () => {
    for (const [revenue, tax, progress] of [[0, 0, 0], [500000000, 0, 50], [1000000000, 0, 100], [1100000000, 1500000, 100]]) {
        const result = calculateGlobalStats([{ tong_doanh_thu: revenue, realProfit: 0 }]);
        assert.equal(result.taxAmount, tax);
        assert.equal(result.revenueProgress, progress);
    }
});

test('sale details use the same rows as bale totals, including legacy names and empty sales', () => {
    const rows = [{ ten_san_pham: 'SƠ MI 1', so_tien_ban_duoc: 10 }, { ten_san_pham: 'Sơ mi 2' }, { ten_san_pham: 'Thun' }, null];
    assert.deepEqual(getBaleSaleRows('Sơ mi', rows), rows.slice(0, 2));
    assert.deepEqual(getBaleSaleRows('', rows), []);
    assert.deepEqual(getBaleSaleRows('Sơ mi', null), []);
});
