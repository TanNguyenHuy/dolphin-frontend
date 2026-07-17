import React from 'react';
import { Crown, Shield, Award, Gem } from 'lucide-react';

export default function PlanBadge({ plan }) {
    const config = {
        premium: {
            label: 'PREMIUM', 
            icon: Gem,
            // Hạng Cao Thủ (Master) - Tím sẫm & Vệt sáng trắng
            bg: 'bg-[linear-gradient(135deg,#3b0764_0%,#9333ea_35%,#f3e8ff_50%,#9333ea_65%,#3b0764_100%)]',
            border: 'border border-[#d8b4fe]',
            text: 'text-white drop-shadow-[0_2px_1.5px_rgba(0,0,0,0.9)]', // Đổ bóng chữ đen gắt để nổi bật trên nền kim loại
            shadow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.8),0_4px_12px_rgba(147,51,234,0.5)]', // Đổ bóng viền 3D (Sáng trên, Tối dưới)
        },
        '100k': {
            label: 'VVIP', 
            icon: Crown,
            // Hạng Vàng (Gold) - Nâu đồng sẫm & Vệt sáng vàng rực
            bg: 'bg-[linear-gradient(135deg,#451a03_0%,#d97706_35%,#fef08a_50%,#d97706_65%,#451a03_100%)]',
            border: 'border border-[#fde047]',
            text: 'text-white drop-shadow-[0_2px_1.5px_rgba(0,0,0,0.9)]',
            shadow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.8),0_4px_12px_rgba(217,119,6,0.5)]',
        },
        '50k': {
            label: 'VIP', 
            icon: Shield,
            // Hạng Kim Cương (Diamond) - Xanh đen sâu & Vệt sáng băng tuyết
            bg: 'bg-[linear-gradient(135deg,#082f49_0%,#0284c7_35%,#e0f2fe_50%,#0284c7_65%,#082f49_100%)]',
            border: 'border border-[#7dd3fc]',
            text: 'text-white drop-shadow-[0_2px_1.5px_rgba(0,0,0,0.9)]',
            shadow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.8),0_4px_12px_rgba(2,132,199,0.5)]',
        },
        '10k': {
            label: 'CƠ BẢN', 
            icon: Award,
            // Hạng Bạc (Silver) - Xám thép sẫm & Vệt sáng bạc
            bg: 'bg-[linear-gradient(135deg,#111827_0%,#6b7280_35%,#f3f4f6_50%,#6b7280_65%,#111827_100%)]',
            border: 'border border-[#e5e7eb]',
            text: 'text-white drop-shadow-[0_2px_1.5px_rgba(0,0,0,0.9)]',
            shadow: 'shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),inset_0_-2px_4px_rgba(0,0,0,0.8),0_4px_12px_rgba(75,85,99,0.4)]',
        }
    };

    const cfg = config[plan] || config['10k'];
    const Icon = cfg.icon;

    return (
        <div className={`relative inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 min-w-[90px] h-[28px] rounded-full ${cfg.bg} ${cfg.border} ${cfg.shadow} shrink-0 cursor-default overflow-hidden group`}>
            
            {/* Hiệu ứng tia sáng quét ngang như kiếm chém (Shine overlay) khi hover */}
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)] transform -skew-x-[20deg] group-hover:left-[200%] transition-all duration-[1200ms] ease-in-out z-0"></div>
            
            <Icon size={14} strokeWidth={3} className={`${cfg.text} relative z-10`} />
            <span className={`text-[11px] font-black tracking-widest uppercase ${cfg.text} mt-[1px] relative z-10`}>
                {cfg.label}
            </span>
        </div>
    );
}