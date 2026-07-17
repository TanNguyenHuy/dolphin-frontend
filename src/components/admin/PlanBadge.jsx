import React from 'react';
import { Crown, Shield, Award, Gem } from 'lucide-react';

export default function PlanBadge({ plan }) {
    const config = {
        premium: {
            label: 'PREMIUM', 
            icon: Gem,
            // Hợp kim Tím (Titanium Purple) - Sáng, thanh tao
            bg: 'bg-[linear-gradient(135deg,#a855f7_0%,#e9d5ff_40%,#ffffff_50%,#e9d5ff_60%,#a855f7_100%)]',
            border: 'border border-purple-300',
            // Chữ màu sẫm + Bóng trắng = Hiệu ứng khắc chìm (Letterpress)
            text: 'text-purple-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]', 
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_4px_10px_rgba(168,85,247,0.2)]',
        },
        '100k': {
            label: 'VVIP', 
            icon: Crown,
            // Vàng Champagne (Champagne Gold) - Lấp lánh, không bị nâu sậm
            bg: 'bg-[linear-gradient(135deg,#eab308_0%,#fef08a_40%,#ffffff_50%,#fef08a_60%,#eab308_100%)]',
            border: 'border border-yellow-300',
            text: 'text-yellow-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]',
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_4px_10px_rgba(234,179,8,0.2)]',
        },
        '50k': {
            label: 'VIP', 
            icon: Shield,
            // Xanh Băng Bạc (Ice Blue Titanium) - Cực kỳ tinh khiết
            bg: 'bg-[linear-gradient(135deg,#0ea5e9_0%,#bae6fd_40%,#ffffff_50%,#bae6fd_60%,#0ea5e9_100%)]',
            border: 'border border-sky-300',
            text: 'text-sky-950 drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]',
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_4px_10px_rgba(14,165,233,0.2)]',
        },
        '10k': {
            label: 'CƠ BẢN', 
            icon: Award,
            // Bạc Nguyên Khối (Solid Silver)
            bg: 'bg-[linear-gradient(135deg,#94a3b8_0%,#e2e8f0_40%,#ffffff_50%,#e2e8f0_60%,#94a3b8_100%)]',
            border: 'border border-slate-300',
            text: 'text-slate-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.7)]',
            shadow: 'shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_4px_10px_rgba(148,163,184,0.2)]',
        }
    };

    const cfg = config[plan] || config['10k'];
    const Icon = cfg.icon;

    return (
        <div className={`relative inline-flex items-center justify-center gap-1.5 px-3 py-1.5 min-w-[85px] h-[28px] rounded-full ${cfg.bg} ${cfg.border} ${cfg.shadow} shrink-0 cursor-default overflow-hidden group`}>
            
            {/* Tia sáng quét ngang (Shine overlay) nhẹ nhàng, tinh tế hơn */}
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)] transform -skew-x-[20deg] group-hover:left-[200%] transition-all duration-[1000ms] ease-in-out z-0"></div>
            
            <Icon size={13} strokeWidth={2.5} className={`${cfg.text} relative z-10`} />
            <span className={`text-[10px] font-extrabold tracking-[0.08em] uppercase ${cfg.text} mt-[1px] relative z-10`}>
                {cfg.label}
            </span>
        </div>
    );
}