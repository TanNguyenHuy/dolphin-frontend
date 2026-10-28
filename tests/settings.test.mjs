import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SETTINGS, normalizeSettings, settingsKey, readSettings, writeSettings } from '../src/settings.js';

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
