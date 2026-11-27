import test from 'node:test';
import assert from 'node:assert/strict';
import { getCalendarEvents, validCalendarDate } from '../src/lib/calendarEvents.js';

const has = (events, date, id) => events[date]?.some(event => event.id === id) || false;

test('ISO dates reject invalid and overflowing dates and accept real leap days', () => {
    for (const value of ['', null, 20260101, '2026-2-01', '2026-02-29', '2026-04-31', '0000-01-01', '2026-01-01T00:00:00Z']) assert.equal(validCalendarDate(value), false);
    for (const value of ['2024-02-29', '2026-12-31', '0001-01-01', '9999-12-31']) assert.equal(validCalendarDate(value), true);
});

test('Vietnamese holidays include fixed and correctly converted lunar dates', () => {
    assert.ok(has(getCalendarEvents(2026, 0), '2026-01-01', 'new-year'));
    const tet = getCalendarEvents(2026, 1);
    assert.ok(has(tet, '2026-02-17', 'tet-1'));
    assert.ok(has(tet, '2026-02-18', 'tet-2'));
    assert.ok(has(tet, '2026-02-19', 'tet-3'));
    const april = getCalendarEvents(2026, 3);
    assert.ok(has(april, '2026-04-26', 'hung-kings'));
    assert.ok(has(april, '2026-04-30', 'reunification'));
    assert.ok(has(getCalendarEvents(2026, 4), '2026-05-01', 'labour-day'));
    assert.ok(has(getCalendarEvents(2026, 8), '2026-09-02', 'national-day'));
});

test('Christian observances recalculate correctly for 2026 and 2027', () => {
    for (const [year, friday, easter, ascension, pentecost] of [
        [2026, '04-03', '04-05', '05-14', '05-24'],
        [2027, '03-26', '03-28', '05-06', '05-16'],
    ]) {
        for (const [suffix, id] of [[friday, 'good-friday'], [easter, 'easter'], [ascension, 'ascension'], [pentecost, 'pentecost']]) {
            const date = `${year}-${suffix}`;
            assert.ok(has(getCalendarEvents(year, Number(suffix.slice(0, 2)) - 1), date, id));
        }
        assert.ok(has(getCalendarEvents(year, 9), `${year}-10-31`, 'reformation'));
        assert.ok(has(getCalendarEvents(year, 11), `${year}-12-25`, 'christmas'));
    }
});

test('custom display periods include both endpoints, cross months/years, and keep holiday collisions', () => {
    const custom = [{ title: 'Sinh nhật', startDate: '2026-12-25', endDate: '2027-01-02' }];
    const december = getCalendarEvents(2026, 11, custom);
    assert.equal(december['2026-12-24'], undefined);
    assert.equal(december['2026-12-25'].length, 2);
    assert.equal(december['2026-12-25'][1].kind, 'important');
    assert.equal(december['2026-12-31'][0].title, 'Sinh nhật');
    const january = getCalendarEvents(2027, 0, custom);
    assert.equal(january['2027-01-01'].length, 2);
    assert.equal(january['2027-01-02'][0].title, 'Sinh nhật');
    assert.equal(january['2027-01-03'], undefined);
    assert.ok(Object.keys(january).every(date => date.startsWith('2027-01-')));
});

test('invalid custom events are ignored, IDs are deduplicated, and unsupported lunar years remain safe', () => {
    const record = { id: 'duplicate', title: 'Kỷ niệm', startDate: '2026-12-25', endDate: '2026-12-25' };
    const events = getCalendarEvents(2026, 11, [null, record, record, { title: 'Sai', startDate: '2026-02-30', endDate: '2026-12-31' }, { title: 'Sai', startDate: '2026-12-31', endDate: '2026-01-01' }]);
    assert.equal(events['2026-12-25'].length, 2);
    assert.deepEqual(getCalendarEvents(NaN, 0), {});
    assert.deepEqual(getCalendarEvents(2026, 12), {});
    assert.ok(has(getCalendarEvents(2200, 0), '2200-01-01', 'new-year'));
    assert.ok(has(getCalendarEvents(1199, 11), '1199-12-25', 'christmas'));
});
