export const DEFAULT_SETTINGS = Object.freeze({
    storeName: 'Dolphin_97ers',
    contactPhone: '',
    theme: 'ocean',
    showChat: true,
    reduceMotion: false,
});

export function settingsKey(user) {
    const identity = user?._id || user?.id || user?.email;
    return identity ? `dolphin:settings:v1:${encodeURIComponent(String(identity))}` : null;
}

export function normalizeSettings(value) {
    const source = value && typeof value === 'object' ? value : {};
    return {
        storeName: typeof source.storeName === 'string' && source.storeName.trim()
            ? source.storeName.trim().slice(0, 60) : DEFAULT_SETTINGS.storeName,
        contactPhone: typeof source.contactPhone === 'string' ? source.contactPhone.trim().slice(0, 30) : '',
        theme: ['ocean', 'mint', 'neutral'].includes(source.theme) ? source.theme : DEFAULT_SETTINGS.theme,
        showChat: typeof source.showChat === 'boolean' ? source.showChat : DEFAULT_SETTINGS.showChat,
        reduceMotion: typeof source.reduceMotion === 'boolean' ? source.reduceMotion : DEFAULT_SETTINGS.reduceMotion,
    };
}

export function readSettings(key, storage) {
    if (!key) return { ...DEFAULT_SETTINGS };
    try {
        return normalizeSettings(JSON.parse((storage || window.localStorage).getItem(key)));
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
}

export function writeSettings(key, value, storage = window.localStorage) {
    if (!key) throw new Error('Không xác định được tài khoản để lưu cài đặt.');
    const settings = normalizeSettings(value);
    storage.setItem(key, JSON.stringify(settings));
    return settings;
}
