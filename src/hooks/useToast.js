import { useCallback, useEffect, useRef, useState } from 'react';

const HIDDEN_TOAST = { show: false, message: '', type: 'success' };

export default function useToast() {
    const [toast, setToast] = useState(HIDDEN_TOAST);
    const timeout = useRef(null);
    useEffect(() => () => clearTimeout(timeout.current), []);
    const showToast = useCallback((message, type = 'success') => {
        clearTimeout(timeout.current);
        setToast({ show: true, message, type });
        timeout.current = setTimeout(() => setToast(HIDDEN_TOAST), 3500);
    }, []);
    return { toast, showToast };
}
