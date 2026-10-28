import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, normalizeSettings, settingsKey, readSettings, writeSettings, THEMES, FONTS, FONT_SIZES, appearanceVariables } from '../src/settings.js';

test('invalid saved values fall back to safe defaults', () => {
    assert.deepEqual(normalizeSettings({ theme: 'unknown', showChat: 'false', reduceMotion: null }), DEFAULT_SETTINGS);
    assert.equal(normalizeSettings({ storeName: '  Cửa hàng A  ' }).storeName, 'Cửa hàng A');
});

test('settings persist across reloads and remain separate for each account', () => {
    const values = new Map();
    const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    const first = settingsKey({ _id: 'a' });
    const second = settingsKey({ _id: 'b' });
    writeSettings(first, { ...DEFAULT_SETTINGS, storeName: 'Cửa hàng A', theme: 'mint', showChat: false }, storage);
    assert.equal(readSettings(first, storage).storeName, 'Cửa hàng A');
    assert.equal(readSettings(first, storage).theme, 'mint');
    assert.equal(readSettings(first, storage).showChat, false);
    assert.deepEqual(readSettings(second, storage), DEFAULT_SETTINGS);
    writeSettings(first, DEFAULT_SETTINGS, storage);
    assert.deepEqual(readSettings(first, storage), DEFAULT_SETTINGS);
});

test('corrupt or blocked storage does not break startup, failed saves are reported', () => {
    assert.deepEqual(readSettings('a', { getItem: () => '{broken' }), DEFAULT_SETTINGS);
    const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
    assert.deepEqual(readSettings('a', blocked), DEFAULT_SETTINGS);
    assert.throws(() => writeSettings('a', DEFAULT_SETTINGS, blocked), /blocked/);
    assert.throws(() => writeSettings(null, DEFAULT_SETTINGS, blocked), /tài khoản/);
});

test('existing saved settings migrate to readable appearance defaults without losing preferences', () => {
    const migrated = normalizeSettings({ storeName: 'Cửa hàng cũ', theme: 'mint', showChat: false });
    assert.equal(migrated.storeName, 'Cửa hàng cũ');
    assert.equal(migrated.theme, 'mint');
    assert.equal(migrated.showChat, false);
    assert.equal(migrated.fontSize, 'normal');
    assert.equal(migrated.calendarView, 'month');
    assert.equal(migrated.layout, 'balanced');
});

test('unsupported appearance settings fall back instead of leaking values into CSS', () => {
    const invalid = Object.fromEntries(['fontFamily', 'fontSize', 'chartType', 'chartCurve', 'calendarView', 'calendarShape', 'layout', 'density', 'showLunar'].map(key => [key, 'invalid; color:red']));
    assert.deepEqual(normalizeSettings(invalid), DEFAULT_SETTINGS);
    assert.equal(appearanceVariables(invalid)['--text-scale'], '1');
});

test('all color, font and size choices survive persistence and provide valid style variables', () => {
    const values = new Map();
    const storage = { getItem: key => values.get(key), setItem: (key, value) => values.set(key, value) };
    for (const theme of THEMES) for (const font of FONTS) for (const size of FONT_SIZES) {
        const choice = { ...DEFAULT_SETTINGS, theme: theme.value, fontFamily: font.value, fontSize: size.value, chartType: 'bar', chartCurve: 'step', calendarView: 'agenda', calendarShape: 'square', showLunar: false, layout: 'wide', density: 'compact' };
        writeSettings('account', choice, storage);
        const saved = readSettings('account', storage);
        assert.deepEqual(saved, choice);
        const css = appearanceVariables(saved);
        assert.equal(css['--accent'], theme.accent);
        assert.equal(css['--app-font'], font.family);
        assert.equal(css['--text-scale'], String(size.scale));
        assert.equal(css['--day-radius'], '4px');
    }
});
