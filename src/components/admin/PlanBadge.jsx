import React from 'react';
import { Crown, Shield, Award, Gem } from 'lucide-react';

export default function PlanBadge({ plan }) {
    const config = {
        premium: {
            label: 'PREMIUM', 
            icon: Gem,
            bg: 'bg-[linear-gradient(180deg,#d8b4fe_0%,#a855f7_45%,#7e22ce_100%)]',
            text: 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]',
            border: 'border-purple-300/50',
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_4px_12px_rgba(147,51,234,0.4)]',
        },
        '100k': {
            label: 'VVIP', 
            icon: Crown,
            bg: 'bg-[linear-gradient(180deg,#fef08a_0%,#eab308_45%,#b45309_100%)]',
            text: 'text-yellow-950 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]',
            border: 'border-yellow-200/60',
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_4px_12px_rgba(217,119,6,0.4)]',
        },
        '50k': {
            label: 'VIP', 
            icon: Shield,
            bg: 'bg-[linear-gradient(180deg,#67e8f9_0%,#06b6d4_45%,#0369a1_100%)]',
            text: 'text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]',
            border: 'border-cyan-200/50',
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_4px_12px_rgba(8,145,178,0.4)]',
        },
        '10k': {
            label: 'CƠ BẢN', 
            icon: Award,
            bg: 'bg-[linear-gradient(180deg,#f3f4f6_0%,#9ca3af_45%,#4b5563_100%)]',
            text: 'text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]',
            border: 'border-gray-200/50',
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_4px_12px_rgba(75,85,99,0.3)]',
        }
    };

    // Mặc định lấy gói 10k nếu không có hoặc sai tên
    const cfg = config[plan] || config['10k'];
    const Icon = cfg.icon;

    return (
        <div className={`inline-flex items-center justify-center gap-1.5 px-3.5 h-[28px] rounded-full ${cfg.bg} ${cfg.border} border ${cfg.shadow} shrink-0 cursor-default hover:scale-105 transition-transform duration-300`}>
            <Icon size={13} strokeWidth={3} className={`${cfg.text}`} />
            <span className={`text-[11px] font-black tracking-widest uppercase ${cfg.text} mt-[1px]`}>
                {cfg.label}
            </span>
        </div>
    );
}