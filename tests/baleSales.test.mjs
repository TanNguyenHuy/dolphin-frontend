import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBaleSales } from '../src/logic.js';

test('sums the product rows belonging to a bale and charges advertising once per row', () => {
    const daily = [
        { ten_san_pham: 'Sơ mi 1', so_luong: 27, so_tien_ban_duoc: 4920000 },
        { ten_san_pham: 'SƠ MI 2', so_luong: 21, so_tien_ban_duoc: '4240000' },
        { ten_san_pham: 'Dài tay 1', so_luong: 50, so_tien_ban_duoc: 7895000 },
    ];
    assert.deepEqual(calculateBaleSales('Sơ mi', daily, 350000), {
        totalRevenue: 9160000, saleCount: 2, advertisingCost: 700000, laundryCost: 0, netRevenue: 8460000,
    });
    assert.equal(daily[0].so_tien_ban_duoc, 4920000);
});

test('unmatched, empty and missing bale records show zero totals', () => {
    const zero = { totalRevenue: 0, saleCount: 0, advertisingCost: 0, laundryCost: 0, netRevenue: 0 };
    assert.deepEqual(calculateBaleSales('Cổ lọ', [{ ten_san_pham: 'Sơ mi 1', so_tien_ban_duoc: 10 }], 350000), zero);
    assert.deepEqual(calculateBaleSales('', [{ ten_san_pham: 'Sơ mi 1' }], 350000), zero);
    assert.deepEqual(calculateBaleSales('Sơ mi', null, 350000), zero);
});

test('advertising follows the existing per-record rule, including unsold rows; negative net revenue remains visible', () => {
    assert.deepEqual(calculateBaleSales('Thun', [{ ten_san_pham: 'Thun 1', so_luong: 0, so_tien_ban_duoc: 0 }], 350000), {
        totalRevenue: 0, saleCount: 1, advertisingCost: 350000, laundryCost: 0, netRevenue: -350000,
    });
    assert.equal(calculateBaleSales('Thun', [{ ten_san_pham: 'Thun 1', so_tien_ban_duoc: 1000 }], 500).advertisingCost, 500);
});
