import React, { useState, useEffect, useMemo } from 'react';

export const API_URL = 'https://dolphin-backend-dkev.onrender.com/api';
export const AD_COST_PER_SALE = 350000; 

export const formatCurrency = (val) => { const num = Number(val); return isNaN(num) ? "0" : new Intl.NumberFormat('vi-VN', { style: 'decimal', maximumFractionDigits: 0 }).format(Math.round(num)); };
export const formatInput = (val) => { if (val === null || val === undefined) return ""; const num = val.toString().replace(/,/g, ""); return (isNaN(num) || num === "") ? "" : Number(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
export const parseInput = (val) => { if (!val) return 0; const parsed = parseFloat(val.toString().replace(/,/g, "")); return isNaN(parsed) ? 0 : parsed; };
export const formatDateDisplay = (dateStr) => { if(!dateStr || typeof dateStr !== 'string') return "..."; const parts = dateStr.split('-'); if (parts.length !== 3) return dateStr; return `${parts[2]}/${parts[1]}/${parts[0]}`; };
export const getTodayString = () => { try { return new Date().toISOString().split('T')[0]; } catch { return "2026-01-01"; } };

export const getSessionName = (name, start, end) => {
    const safeName = String(name || '').trim();
    if (!safeName || safeName === 'Thống kê tự động' || safeName.startsWith('Thống kê từ') || safeName.startsWith('Thống kê ngày') || safeName.includes('➔')) {
        const sStr = formatDateDisplay(start); const eStr = formatDateDisplay(end);
        if (sStr === eStr) return `Ngày ${sStr}`;
        if (sStr.slice(-4) === eStr.slice(-4) && sStr.slice(-4) !== "...") return `${sStr.slice(0, 5)} ➔ ${eStr}`;
        return `${sStr} ➔ ${eStr}`;
    }
    return safeName; 
};

export const Confetti = () => {
    const pieces = useMemo(() => Array.from({ length: 120 }).map((_, i) => ({
        id: i, left: `${Math.random() * 100}%`, width: `${Math.random() * 8 + 6}px`, height: `${Math.random() * 14 + 8}px`,
        bg: ['#26D0CE', '#33A1FD', '#FF3B30', '#FF9500', '#1DB2A0', '#FF2D55'][Math.floor(Math.random() * 6)],
        dur: `${Math.random() * 3 + 2}s`, del: `${Math.random() * 1.5}s`, rot: `${Math.random() * 360}deg`
    })), []);
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
            <style>{`@keyframes confettiFall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(var(--rot)); opacity: 0; } }`}</style>
            {pieces.map(p => (<div key={p.id} className="absolute top-[-10%]" style={{ left: p.left, width: p.width, height: p.height, backgroundColor: p.bg, '--rot': p.rot, animation: `confettiFall ${p.dur} linear ${p.del} forwards` }} />))}
        </div>
    );
};

export const AnimatedNumber = ({ value, className = '' }) => {
    const [displayValue, setDisplayValue] = useState(Number(value) || 0);
    useEffect(() => {
        const end = Math.round(Number(value) || 0); if (isNaN(end)) return;
        let start = displayValue; if (start === end) return;
        const duration = 800; const startTime = performance.now(); let animationFrame;
        const update = (currentTime) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setDisplayValue(Math.round(start + (end - start) * (1 - Math.pow(1 - progress, 4))));
            if (progress < 1) animationFrame = requestAnimationFrame(update); else setDisplayValue(end);
        };
        animationFrame = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationFrame);
    }, [value]);
    return <span className={`tabular-nums tracking-tight ${className}`}>{formatCurrency(displayValue)}</span>;
};