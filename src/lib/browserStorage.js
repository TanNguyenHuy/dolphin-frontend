export function readAuthUser(storage = globalThis) {
    for (const name of ['sessionStorage', 'localStorage']) {
        try {
            const raw = storage[name]?.getItem('authUser');
            const user = raw ? JSON.parse(raw) : null;
            if (user && typeof user === 'object' && !Array.isArray(user)) return user;
        } catch {
            // Try the other storage when data is corrupt or browser access is blocked.
        }
    }
    return null;
}

export function readStoredText(key, fallback = '') {
    try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

export function writeStoredText(key, value) {
    try { localStorage.setItem(key, value); return true; } catch { return false; }
}
