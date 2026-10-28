import { useEffect, useRef } from 'react';
import { useReducedMotion } from './motion';

export default function ScrollReveal({ children, delay = 0 }) {
    const elementRef = useRef(null);
    const reduced = useReducedMotion();
    useEffect(() => {
        const element = elementRef.current;
        if (reduced || !('IntersectionObserver' in window)) return;
        // Visible by default: missing JS/observer support never leaves content hidden.
        element.dataset.reveal = 'pending';
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                element.dataset.reveal = 'visible';
                observer.disconnect();
            }
        }, { threshold: 0.05 });
        observer.observe(element);
        return () => { observer.disconnect(); delete element.dataset.reveal; };
    }, [reduced]);
    return <div ref={elementRef} className="scroll-reveal h-full" style={{ '--reveal-delay': `${Math.min(delay, 180)}ms` }}>{children}</div>;
}
