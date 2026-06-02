import React from 'react';
import { Fish, Crown, Star, Eye, Clock, Users, Plus, RefreshCw, LogOut } from 'lucide-react';

export default function Header({
    authUser,
    isAdmin,
    canEdit,
    timeLeftDisplay,
    view,
    setView,
    handleCreateAutoSession,
    isProcessingCreate,
    handleLogout
}) {
    return (
        <div className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[96%] max-w-[1600px] z-50 liquid-glass rounded-[32px] px-5 py-3 md:py-3 flex justify-between items-start md:items-center transition-all duration-500 hover:bg-white/70 shadow-sm border border-white/60">
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
                
                {authUser?.plan === 'premium' || authUser?.role === 'admin' ? (
                    <div className="mt-2 md:ml-14 w-[95px] h-[26px] inline-flex items-center justify-center gap-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md bg-[linear-gradient(110deg,rgba(216,180,254,0.6)_0%,rgba(255,255,255,0.9)_25%,rgba(192,132,252,0.5)_50%,rgba(168,85,247,0.5)_100%)] border border-white/80 shadow-[inset_0_1px_2px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(147,51,234,0.4),0_4px_12px_rgba(168,85,247,0.4)] text-purple-900">
                        <Crown size={12}/> PREMIUM
                    </div>
                ) : (
                    <div className={`mt-2 md:ml-14 w-[95px] h-[26px] inline-flex items-center justify-center gap-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all backdrop-blur-md border border-white/80 ${
                        authUser?.plan === '100k' ? 'bg-[linear-gradient(110deg,rgba(253,230,138,0.7)_0%,rgba(255,255,255,0.9)_25%,rgba(251,191,36,0.5)_50%,rgba(217,119,6,0.5)_100%)] shadow-[inset_0_1px_2px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(217,119,6,0.4),0_4px_12px_rgba(245,158,11,0.4)] text-amber-900' : 
                        authUser?.plan === '50k' ? 'bg-[linear-gradient(110deg,rgba(241,245,249,0.8)_0%,rgba(255,255,255,1)_25%,rgba(203,213,225,0.5)_50%,rgba(148,163,184,0.5)_100%)] shadow-[inset_0_1px_2px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(148,163,184,0.4),0_4px_12px_rgba(148,163,184,0.3)] text-slate-800' : 
                        'bg-[linear-gradient(110deg,rgba(254,215,170,0.6)_0%,rgba(255,255,255,0.9)_25%,rgba(251,146,60,0.5)_50%,rgba(234,88,12,0.4)_100%)] shadow-[inset_0_1px_2px_rgba(255,255,255,1),inset_0_-2px_4px_rgba(234,88,12,0.4),0_4px_12px_rgba(249,115,22,0.3)] text-orange-900'
                    }`}>
                        {authUser?.plan === '100k' ? <><Crown size={12}/> VVIP</> : authUser?.plan === '50k' ? <><Star size={12}/> VIP</> : <><Eye size={12}/> CƠ BẢN</>}
                    </div>
                )}
                
                {authUser?.role !== 'admin' && authUser?.plan !== 'premium' && authUser?.planExpiry && (
                    <div className={`mt-2 md:ml-14 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm transition-all ${timeLeftDisplay.includes('giây') || timeLeftDisplay.includes('phút') ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                        <Clock size={12} /> Hạn dùng: {timeLeftDisplay}
                    </div>
                )}
            </div>
            
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0 self-center mt-2 md:mt-0">
                {view === 'DASHBOARD' && (
                    <>
                        {isAdmin && (
                            <button onClick={() => setView('USERS')} title="Quản lý Người dùng" className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-white/30 border border-white/40 text-[#1DB2A0] rounded-full hover:bg-white/60 transition-all shadow-sm active:scale-95">
                                <Users size={16} className="md:w-[18px] md:h-[18px]"/>
                            </button>
                        )}
                        {canEdit && (
                            <button onClick={handleCreateAutoSession} disabled={isProcessingCreate} className="w-9 h-9 md:w-auto md:px-5 md:py-3.5 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white font-semibold rounded-full hover:opacity-90 transition-all shadow-md flex items-center justify-center md:justify-start gap-2 text-[14px] disabled:opacity-50 active:scale-95 border border-white/20">
                                {isProcessingCreate ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} className="md:w-[18px] md:h-[18px]" strokeWidth={2.5}/>}
                                <span className="hidden md:inline">Tạo Thống Kê</span>
                            </button>
                        )}
                    </>
                )}
                <button onClick={handleLogout} title="Đăng xuất" className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF3B30] rounded-full hover:bg-[#FF3B30]/20 transition-all shadow-sm active:scale-95 shrink-0">
                    <LogOut size={16} className="md:w-[18px] md:h-[18px]"/>
                </button>
            </div>
        </div>
    );
}