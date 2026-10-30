import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateLaundryCosts, calculateBaleSales } from '../src/logic.js';

test('allocates the existing laundry bill by each bale capital without multiplying by sale count', () => {
    const bales = [{ cost: 12000000 }, { cost: 8750000 }, { cost: 6000000 }];
    assert.deepEqual(allocateLaundryCosts(bales, 1070000), [480000, 350000, 240000]);
    const result = calculateBaleSales('Sơ mi', [
        { ten_san_pham: 'Sơ mi 1', so_tien_ban_duoc: 4920000 },
        { ten_san_pham: 'Sơ mi 2', so_tien_ban_duoc: 4240000 },
    ], 350000, 480000);
    assert.equal(result.laundryCost, 480000);
    assert.equal(result.netRevenue, 7980000);
});

test('rounding reconciles to the existing bill exactly and supports adjusted bills', () => {
    assert.deepEqual(allocateLaundryCosts([{ cost: 1 }, { cost: 1 }, { cost: 1 }], 2), [1, 1, 0]);
    assert.deepEqual(allocateLaundryCosts([{ cost: 100 }, { cost: 300 }], 13), [3, 10]);
    const amounts = allocateLaundryCosts([{ cost: 18785800 }, { cost: 15668560 }, { cost: 12000000 }], 1858174);
    assert.equal(amounts.reduce((sum, amount) => sum + amount, 0), 1858174);
    assert.ok(amounts.every(Number.isInteger));
});

test('empty, zero and invalid costs do not create phantom or non-finite charges', () => {
    assert.deepEqual(allocateLaundryCosts([], 500), []);
    assert.deepEqual(allocateLaundryCosts([{ cost: 0 }, { cost: -1 }], 500), [0, 0]);
    assert.deepEqual(allocateLaundryCosts([{ cost: 100 }], 0), [0]);
    assert.deepEqual(allocateLaundryCosts([{ cost: Infinity }, { cost: 100 }], 40), [0, 40]);
    assert.deepEqual(allocateLaundryCosts([{ cost: 100 }], NaN), [0]);
    assert.equal(calculateBaleSales('Cổ lọ', [], 350000, 350000).netRevenue, -350000);
});
