export const THEMES = [
    { value: 'ocean', name: 'Xanh biển', from: '#eaf5ff', to: '#c4e5f4', accent: '#0874b9', soft: '#e7f3fe', strong: '#145378' },
    { value: 'mint', name: 'Bạc hà', from: '#edfdf7', to: '#c6e9dc', accent: '#087f70', soft: '#e5f7ef', strong: '#135d50' },
    { value: 'lavender', name: 'Tím oải hương', from: '#f4f0ff', to: '#ded5f5', accent: '#7551b8', soft: '#f0eaff', strong: '#583886' },
    { value: 'rose', name: 'Hồng phấn', from: '#fff3f5', to: '#f3d5df', accent: '#b43e68', soft: '#fceaf0', strong: '#8b3052' },
    { value: 'amber', name: 'Vàng mật ong', from: '#fffaf0', to: '#f3e1ba', accent: '#956018', soft: '#fff3da', strong: '#704914' },
    { value: 'forest', name: 'Xanh lá', from: '#f1f8ec', to: '#d3e6c5', accent: '#48752c', soft: '#edf5e4', strong: '#365823' },
    { value: 'slate', name: 'Xanh đá', from: '#eef3f8', to: '#d2dce9', accent: '#526b91', soft: '#e9eff7', strong: '#344a69' },
    { value: 'neutral', name: 'Trung tính', from: '#fafafa', to: '#e5e7eb', accent: '#526071', soft: '#eef0f4', strong: '#374151' },
];
export const FONTS = [
    { value: 'system', name: 'Hiện đại', family: '"Segoe UI", Arial, sans-serif' },
    { value: 'rounded', name: 'Mềm mại', family: '"Trebuchet MS", "Segoe UI", sans-serif' },
    { value: 'serif', name: 'Thanh lịch', family: 'Georgia, "Times New Roman", serif' },
    { value: 'mono', name: 'Đơn cách', family: 'Consolas, "Courier New", monospace' },
];
export const FONT_SIZES = [
    { value: 'small', name: 'Nhỏ', scale: 0.95 },
    { value: 'normal', name: 'Tiêu chuẩn', scale: 1 },
    { value: 'large', name: 'Lớn', scale: 1.15 },
    { value: 'extra', name: 'Rất lớn', scale: 1.3 },
];

export const DEFAULT_SETTINGS = Object.freeze({
    storeName: 'Dolphin_97ers',
    contactPhone: '',
    theme: 'ocean',
    showChat: true,
    reduceMotion: false,
    fontFamily: 'system',
    fontSize: 'normal',
    chartType: 'area',
    chartCurve: 'monotone',
    calendarView: 'month',
    calendarShape: 'rounded',
    showLunar: true,
    layout: 'balanced',
    density: 'comfortable',
});

const choice = (value, options, fallback) => options.includes(value) ? value : fallback;

export function appearanceVariables(settings) {
    const safe = normalizeSettings(settings);
    const theme = THEMES.find(item => item.value === safe.theme);
    return {
        '--app-font': FONTS.find(item => item.value === safe.fontFamily).family,
        '--text-scale': String(FONT_SIZES.find(item => item.value === safe.fontSize).scale),
        '--accent': theme.accent,
        '--accent-soft': theme.soft,
        '--accent-strong': theme.strong,
        '--page-from': theme.from,
        '--page-to': theme.to,
        '--day-radius': { circle: '50%', rounded: '12px', square: '4px' }[safe.calendarShape],
    };
}

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
        theme: choice(source.theme, THEMES.map(item => item.value), DEFAULT_SETTINGS.theme),
        showChat: typeof source.showChat === 'boolean' ? source.showChat : DEFAULT_SETTINGS.showChat,
        reduceMotion: typeof source.reduceMotion === 'boolean' ? source.reduceMotion : DEFAULT_SETTINGS.reduceMotion,
        fontFamily: choice(source.fontFamily, FONTS.map(item => item.value), DEFAULT_SETTINGS.fontFamily),
        fontSize: choice(source.fontSize, FONT_SIZES.map(item => item.value), DEFAULT_SETTINGS.fontSize),
        chartType: choice(source.chartType, ['area', 'line', 'bar'], DEFAULT_SETTINGS.chartType),
        chartCurve: choice(source.chartCurve, ['monotone', 'linear', 'step'], DEFAULT_SETTINGS.chartCurve),
        calendarView: choice(source.calendarView, ['month', 'agenda'], DEFAULT_SETTINGS.calendarView),
        calendarShape: choice(source.calendarShape, ['circle', 'rounded', 'square'], DEFAULT_SETTINGS.calendarShape),
        showLunar: typeof source.showLunar === 'boolean' ? source.showLunar : DEFAULT_SETTINGS.showLunar,
        layout: choice(source.layout, ['balanced', 'wide', 'focused'], DEFAULT_SETTINGS.layout),
        density: choice(source.density, ['comfortable', 'compact'], DEFAULT_SETTINGS.density),
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
