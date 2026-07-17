import React from 'react';
import { Crown, Shield, Award, Gem } from 'lucide-react';

export default function PlanBadge({ plan }) {
    const config = {
        premium: {
            label: 'PREMIUM', 
            icon: Gem,
            // Thạch anh tím khối
            bg: 'bg-[linear-gradient(135deg,#9333ea_0%,#d8b4fe_45%,#a855f7_65%,#7e22ce_100%)]',
            border: 'border border-purple-300/80',
            // Chữ trắng + Đổ bóng viền màu Tím sậm
            text: 'text-white drop-shadow-[0_1px_2px_rgba(107,33,168,0.9)]', 
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_10px_rgba(168,85,247,0.3)]',
        },
        '100k': {
            label: 'VVIP', 
            icon: Crown,
            // Vàng khối
            bg: 'bg-[linear-gradient(135deg,#d97706_0%,#fde047_45%,#fbbf24_65%,#b45309_100%)]',
            border: 'border border-yellow-300/80',
            // Chữ trắng + Đổ bóng viền màu Cam sậm
            text: 'text-white drop-shadow-[0_1px_2px_rgba(180,83,9,0.9)]',
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_10px_rgba(234,179,8,0.3)]',
        },
        '50k': {
            label: 'VIP', 
            icon: Shield,
            // Xanh Băng khối
            bg: 'bg-[linear-gradient(135deg,#0284c7_0%,#7dd3fc_45%,#38bdf8_65%,#0369a1_100%)]',
            border: 'border border-sky-300/80',
            // Chữ trắng + Đổ bóng viền màu Xanh sậm
            text: 'text-white drop-shadow-[0_1px_2px_rgba(2,132,199,0.9)]',
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_10px_rgba(14,165,233,0.3)]',
        },
        '10k': {
            label: 'CƠ BẢN', 
            icon: Award,
            // Bạc/Thép khối
            bg: 'bg-[linear-gradient(135deg,#475569_0%,#e2e8f0_45%,#94a3b8_65%,#334155_100%)]',
            border: 'border border-slate-300/80',
            // Chữ trắng + Đổ bóng viền màu Xám sậm
            text: 'text-white drop-shadow-[0_1px_2px_rgba(51,65,85,0.9)]',
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_10px_rgba(148,163,184,0.3)]',
        }
    };

    const cfg = config[plan] || config['10k'];
    const Icon = cfg.icon;

    return (
        <div className={`relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-w-[85px] h-[28px] rounded-full ${cfg.bg} ${cfg.border} ${cfg.shadow} shrink-0 cursor-default overflow-hidden group`}>
            
            {/* Tia sáng lướt qua */}
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)] transform -skew-x-[20deg] group-hover:left-[200%] transition-all duration-[1000ms] ease-in-out z-0"></div>
            
            <Icon size={13} strokeWidth={2.5} className={`${cfg.text} relative z-10`} />
            <span className={`text-[10.5px] font-extrabold tracking-[0.06em] uppercase ${cfg.text} mt-[1px] relative z-10`}>
                {cfg.label}
            </span>
        </div>
    );
}