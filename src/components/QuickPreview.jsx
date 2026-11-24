import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function QuickPreview({ label, triggerContent, children, className = '', triggerClassName = '' }) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState({});
    const trigger = useRef(null);
    const panel = useRef(null);
    const timer = useRef(null);
    const suppressFocus = useRef(false);
    const id = useId();
    const cancelClose = () => clearTimeout(timer.current);
    const close = () => {
        setOpen(false);
        if (panel.current?.contains(document.activeElement)) {
            suppressFocus.current = true;
            trigger.current?.focus();
            suppressFocus.current = false;
        }
    };
    const leave = event => {
        if (event.pointerType === 'mouse') {
            cancelClose();
            timer.current = setTimeout(() => setOpen(false), 150);
        }
    };

    useLayoutEffect(() => {
        if (!open) return;
        const rect = trigger.current.getBoundingClientRect();
        const width = Math.min(360, window.innerWidth - 24);
        const below = window.innerHeight - rect.bottom >= rect.top;
        const height = Math.min(360, Math.max(80, (below ? window.innerHeight - rect.bottom : rect.top) - 20));
        setPosition({
            width, maxHeight: height,
            left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
            ...(below ? { top: rect.bottom + 8 } : { bottom: window.innerHeight - rect.top + 8 }),
        });
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const outside = event => {
            if (!trigger.current?.contains(event.target) && !panel.current?.contains(event.target)) setOpen(false);
        };
        const key = event => { if (event.key === 'Escape') close(); };
        const moved = event => { if (!panel.current?.contains(event.target)) setOpen(false); };
        window.addEventListener('pointerdown', outside);
        window.addEventListener('keydown', key);
        window.addEventListener('scroll', moved, true);
        window.addEventListener('resize', moved);
        return () => {
            window.removeEventListener('pointerdown', outside);
            window.removeEventListener('keydown', key);
            window.removeEventListener('scroll', moved, true);
            window.removeEventListener('resize', moved);
        };
    }, [open]);
    useEffect(() => () => clearTimeout(timer.current), []);

    const blur = () => requestAnimationFrame(() => {
        if (!trigger.current?.contains(document.activeElement) && !panel.current?.contains(document.activeElement)) setOpen(false);
    });
    return <div className={className}
        onPointerEnter={event => { cancelClose(); if (event.pointerType === 'mouse') setOpen(true); }}
        onPointerLeave={leave}>
        <button ref={trigger} type="button" className={triggerClassName} aria-label={label}
            aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined}
            onFocus={event => { if (!suppressFocus.current && event.currentTarget.matches(':focus-visible')) setOpen(true); }}
            onBlur={blur} onClick={() => { cancelClose(); setOpen(value => !value); }}>
            {triggerContent}
        </button>
        {open && createPortal(<section ref={panel} id={id} role="dialog" aria-label={label}
            className="floating-preview" style={position} onPointerEnter={cancelClose} onPointerLeave={leave} onBlur={blur}>
            <header><strong>{label}</strong><button type="button" aria-label="Đóng xem nhanh" onClick={close}><X size={16} aria-hidden="true" /></button></header>
            {children}
        </section>, document.body)}
    </div>;
}
