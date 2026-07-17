import React from 'react';
import { Fish, Crown, Clock, Users, Plus, RefreshCw, LogOut, TrendingUp, Package, List } from 'lucide-react';
import PlanBadge from './admin/PlanBadge'; // Nhớ kiểm tra đúng đường dẫn đến file PlanBadge nhé!

export default function Header({
    authUser, isAdmin, canEdit, timeLeftDisplay, view, setView,
    handleCreateAutoSession, isProcessingCreate, handleLogout
}) {
    // Động cơ cuộn trang mềm mại (Custom Easing Scroll)
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (!element) return;
        
        const targetPosition = element.getBoundingClientRect().top + window.scrollY - 110;
        const startPosition = window.scrollY;
        const distance = targetPosition - startPosition;
        const duration = 1200; // Thời gian lướt 1.2 giây (rất êm)
        let start = null;

        // Hàm toán học tạo gia tốc lướt mềm mại
        const easeInOutQuart = (time, begin, change, duration) => {
            if ((time /= duration / 2) < 1) return change / 2 * time * time * time * time + begin;
            return -change / 2 * ((time -= 2) * time * time * time - 2) + begin;
        };

        const animation = (currentTime) => {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const run = easeInOutQuart(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            if (timeElapsed < duration) requestAnimationFrame(animation);
        };
        requestAnimationFrame(animation);
    };

    return (
        <div className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[96%] max-w-[1600px] z-50 liquid-glass rounded-[32px] px-5 py-3 md:py-3 flex flex-col md:flex-row justify-between items-start md:items-center transition-all duration-500 hover:bg-white/70 shadow-sm border border-white/60 gap-4 md:gap-0">
            <div className="flex flex-col">
                <a href="https://www.instagram.com/dolphin_97ers/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group active:opacity-60 transition-opacity min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/60 backdrop-blur-md rounded-full shadow-sm flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105 border border-white/50">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='block'}} />
                        <Fish size={18} className="text-[#33A1FD] hidden" />
                    </div>
                    <div className="min-w-0 pr-2 pt-1">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-[17px] md:text-[20px] font-bold text-[#1D1D1F] tracking-tight leading-tight truncate">{authUser.name}</h1>
                            {isAdmin && <Crown size={14} className="text-[#FF9500] shrink-0" title="Quản trị viên"/>}
                        </div>
                        <p className="text-[10px] md:text-[11px] font-semibold text-[#5c5c5c] tracking-wide truncate">
                            {isAdmin ? 'Quản trị viên' : (canEdit ? 'Có quyền chỉnh sửa' : 'Chỉ xem')}
                        </p>
                    </div>
                </a>
                
                {/* HUY HIỆU KIM LOẠI LẮP VÀO ĐÂY */}
                <div className="mt-3 md:mt-2 md:ml-[60px] flex items-center shrink-0">
                    <div className="transform scale-110 md:scale-125 origin-left hover:scale-[1.15] md:hover:scale-[1.3] transition-transform duration-300">
                        <PlanBadge plan={isAdmin ? 'premium' : authUser?.plan} />
                    </div>
                </div>
            </div>

            {view === 'DASHBOARD' && (
                <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full md:w-auto pb-2 md:pb-0">
                    <button onClick={() => scrollToSection('section-loi-nhuan')} className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] text-[13px] font-black whitespace-nowrap transition-all active:scale-95 shadow-sm border bg-white/80 border-[#FFE0B2] text-[#E65100] hover:bg-white hover:-translate-y-0.5"><TrendingUp size={16} strokeWidth={2.5} /> Lợi Nhuận</button>
                    <button onClick={() => scrollToSection('section-kho-thue')} className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] text-[13px] font-black whitespace-nowrap transition-all active:scale-95 shadow-sm border bg-white/80 border-blue-200 text-[#1A5B82] hover:bg-white hover:-translate-y-0.5"><Package size={16} strokeWidth={2.5} /> Kho, Vốn & Thuế</button>
                    <button onClick={() => scrollToSection('section-danh-sach')} className="flex items-center gap-2 px-4 py-2.5 rounded-[16px] text-[13px] font-black whitespace-nowrap transition-all active:scale-95 shadow-sm border bg-white/80 border-teal-200 text-[#00695C] hover:bg-white hover:-translate-y-0.5"><List size={16} strokeWidth={2.5} /> Đợt Bán</button>
                </div>
            )}
            
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0 self-end md:self-center">
                {view === 'DASHBOARD' && (
                    <>
                        {isAdmin && <button onClick={() => setView('USERS')} className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-white/30 border border-white/40 text-[#1DB2A0] rounded-full hover:bg-white/60 transition-all shadow-sm active:scale-95"><Users size={16} className="md:w-[18px] md:h-[18px]"/></button>}
                        {canEdit && (
                            <button onClick={handleCreateAutoSession} disabled={isProcessingCreate} className="w-9 h-9 md:w-auto md:px-5 md:py-3.5 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white font-semibold rounded-full hover:opacity-90 transition-all shadow-md flex items-center justify-center md:justify-start gap-2 text-[14px] active:scale-95">
                                {isProcessingCreate ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} strokeWidth={2.5}/>}
                                <span className="hidden md:inline">Tạo Thống Kê</span>
                            </button>
                        )}
                    </>
                )}
                <button onClick={handleLogout} className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] rounded-full hover:bg-[#FF3B30]/20 transition-all shadow-sm active:scale-95"><LogOut size={16}/></button>
            </div>
        </div>
    );
}