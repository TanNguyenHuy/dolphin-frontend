import React from 'react';
import { Fish, Crown, Users, Plus, RefreshCw, LogOut } from 'lucide-react';
import PlanBadge from './admin/PlanBadge'; 
import MiniCharts from './dashboard/MiniCharts';

export default function Header({
    authUser, isAdmin, canEdit, timeLeftDisplay, view, setView,
    handleCreateAutoSession, isProcessingCreate, handleLogout
}) {
    return (
        <>
            {/* KHỐI ĐỆM TÀNG HÌNH: Đẩy nội dung bên dưới xuống để không bị che mất */}
            <div className="h-[95px] md:h-[80px] w-full shrink-0 pointer-events-none"></div>

            <div className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[96%] max-w-[1600px] z-50 liquid-glass rounded-[32px] px-5 py-3 md:py-3 flex flex-col md:flex-row justify-between items-start md:items-center transition-all duration-500 shadow-sm border border-white/60 gap-4 md:gap-0">
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
                    
                    <div className="mt-3 md:mt-2 md:ml-[60px] flex items-center shrink-0">
                        <div className="transform scale-110 md:scale-125 origin-left hover:scale-[1.15] md:hover:scale-[1.3] transition-transform duration-300">
                            <PlanBadge plan={isAdmin ? 'premium' : authUser?.plan} />
                        </div>
                    </div>
                </div>
                
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
        </>
    );
}