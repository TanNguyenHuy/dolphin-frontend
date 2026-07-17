import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar, Package, TrendingUp, DollarSign, Activity } from 'lucide-react';
import DashboardChart from './dashboard/DashboardChart';
import DashboardStats from './dashboard/DashboardStats';
import SessionCard from './dashboard/SessionCard';
import { formatCurrency, formatDateDisplay } from '../utils';

// CẢM BIẾN HIỂN THỊ
const ScrollReveal = ({ children, delay = 0 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
                observer.unobserve(domRef.current);
            }
        }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
        
        if (domRef.current) observer.observe(domRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div 
            ref={domRef} 
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
            {children}
        </div>
    );
};

export default function DashboardView({
    dashboardProfit, globalTongCon, globalTongNhap, globalVonTon, showTax, taxAmount, displayRevenueTr, totalRevenueForTax, 
    safeSessions, enrichedSessions, fetchDetail, isAdmin, canEdit, canDelete, canPay, 
    setSalarySession, setShowSalaryModal, handleStartEditSession, handleDeleteSession
}) {
    const [visibleCount, setVisibleCount] = useState(6);
    const visibleSessions = enrichedSessions.slice(0, visibleCount);
    const hasMore = visibleCount < enrichedSessions.length;

    // ==========================================
    // STATE: QUẢN LÝ QUICK VIEW (BẢNG XEM NHANH)
    // ==========================================
    const [quickViewData, setQuickViewData] = useState(null);
    const [isHoveringList, setIsHoveringList] = useState(false);
    const hoverTimeoutRef = useRef(null);

    const handleMouseEnterRow = (session) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setQuickViewData(session);
        setIsHoveringList(true);
    };

    const handleMouseLeaveList = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHoveringList(false);
        }, 150); // Độ trễ nhỏ để không bị giật nháy khi lướt giữa các dòng
    };

    return (
        <div className="space-y-16 md:space-y-24 animate-fade-in-up pb-24 max-w-[1400px] mx-auto pt-6 relative">
            
            {/* TRẠM 1: LỢI NHUẬN */}
            <div id="section-loi-nhuan" className="scroll-mt-[120px] w-full">
                <ScrollReveal delay={0}>
                    <DashboardChart enrichedSessions={enrichedSessions.filter(s => s.is_completed === true)} dashboardProfit={dashboardProfit} />
                </ScrollReveal>
            </div>

            {/* TRẠM 2: KHO & THUẾ */}
            <div id="section-kho-thue" className="scroll-mt-[120px] w-full">
                <ScrollReveal delay={150}>
                    <DashboardStats 
                        globalTongCon={globalTongCon} globalTongNhap={globalTongNhap} globalVonTon={globalVonTon} 
                        displayRevenueTr={displayRevenueTr} taxAmount={taxAmount} totalRevenueForTax={totalRevenueForTax} 
                    />
                </ScrollReveal>
            </div>

            {/* TRẠM 3: DANH SÁCH ĐỢT BÁN */}
            <div id="section-danh-sach" className="scroll-mt-[120px] w-full">
                <ScrollReveal delay={150}>
                    <div 
                        className="liquid-glass rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-10 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden bg-white/40 xl:w-[70%]"
                        onMouseLeave={handleMouseLeaveList} // Bắt sự kiện khi chuột rời khỏi toàn bộ danh sách
                    >
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-teal-200/30 to-emerald-100/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3"></div>
                        
                        <div className="flex justify-between items-center mb-8 px-2 md:px-0 relative z-10">
                            <h2 className="text-[22px] md:text-[28px] font-black text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                            <span className="text-[13px] md:text-[14px] font-bold bg-white/80 backdrop-blur-md border border-gray-200 text-[#1D1D1F] px-4 py-1.5 rounded-full shadow-sm">
                                Tổng: {enrichedSessions.length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 relative z-10">
                            {visibleSessions.map((session, index) => (
                                <div 
                                    key={session.id} 
                                    className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-[24px]"
                                    onMouseEnter={() => handleMouseEnterRow(session)} // Bắt sự kiện khi rê chuột vào từng đợt
                                >
                                    <SessionCard session={session} index={index} totalCount={enrichedSessions.length} fetchDetail={fetchDetail} canPay={canPay} canEdit={canEdit} canDelete={canDelete} setSalarySession={setSalarySession} setShowSalaryModal={setShowSalaryModal} handleStartEditSession={handleStartEditSession} handleDeleteSession={handleDeleteSession} />
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-10 flex justify-center relative z-10">
                                <button onClick={() => setVisibleCount(prev => prev + 6)} className="group flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-8 py-3.5 rounded-[20px] font-bold text-[14px] shadow-sm hover:shadow-md hover:border-teal-300 hover:text-teal-600 transition-all active:scale-95">
                                    Xem thêm <ChevronDown size={18} className="group-hover:translate-y-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                </ScrollReveal>
            </div>

            {/* ========================================================= */}
            {/* BẢNG XEM NHANH (QUICK VIEW PANEL) TRÔI NỔI BÊN PHẢI MÀN HÌNH */}
            {/* ========================================================= */}
            <div 
                className={`hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 w-[340px] z-50 transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none 
                ${isHoveringList ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[150%]'}`}
            >
                {quickViewData && (
                    <div className="liquid-glass bg-white/70 backdrop-blur-2xl border border-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] rounded-[32px] p-6 overflow-hidden relative transform transition-transform duration-300 scale-100">
                        {/* Hiệu ứng trang trí góc */}
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-300/40 to-teal-300/20 rounded-full blur-2xl"></div>

                        {/* Tiêu đề */}
                        <h3 className="text-[20px] font-black text-[#1D1D1F] leading-tight mb-1 pr-4">
                            {quickViewData.name || 'Đợt bán'}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-500 mb-6">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDateDisplay(quickViewData.actual_start_date)} ➔ {formatDateDisplay(quickViewData.actual_end_date)}
                        </div>

                        {/* Thanh Tiến độ Bán hàng */}
                        <div className="mb-6">
                            <div className="flex justify-between text-[11px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                <span>Tiến độ xuất kho</span>
                                <span className="text-[#1A5B82]">
                                    {quickViewData.tong_sl_nhap > 0 ? Math.round((quickViewData.tong_sl_ban / quickViewData.tong_sl_nhap) * 100) : 0}%
                                </span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-200/60 rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className="h-full bg-gradient-to-r from-blue-400 to-teal-400 rounded-full transition-all duration-700 ease-out"
                                    style={{ width: `${quickViewData.tong_sl_nhap > 0 ? Math.min((quickViewData.tong_sl_ban / quickViewData.tong_sl_nhap) * 100, 100) : 0}%` }}
                                ></div>
                            </div>
                        </div>

                        {/* Khối Chỉ số cơ bản */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-white/50 border border-white/60 p-3 rounded-[16px] shadow-sm flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">Đã nhập</span>
                                <span className="text-[18px] font-black text-[#1D1D1F]">{quickViewData.tong_sl_nhap || 0}</span>
                            </div>
                            <div className="bg-white/50 border border-white/60 p-3 rounded-[16px] shadow-sm flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase mb-1">Đã bán</span>
                                <span className="text-[18px] font-black text-[#00695C]">{quickViewData.tong_sl_ban || 0}</span>
                            </div>
                        </div>

                        {/* Khối Tài chính */}
                        <div className="space-y-3 pt-4 border-t border-gray-200/50">
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="font-bold text-gray-500 flex items-center gap-1.5"><TrendingUp size={14} className="text-blue-500"/> Doanh thu</span>
                                <span className="font-black text-[#1D1D1F]">{formatCurrency(quickViewData.tong_doanh_thu || 0)}đ</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px]">
                                <span className="font-bold text-gray-500 flex items-center gap-1.5"><Package size={14} className="text-orange-500"/> Chi phí vốn</span>
                                <span className="font-black text-orange-600">{formatCurrency((quickViewData.so_tien_cua_kien || 0) + (quickViewData.computedGiatUi || 0))}đ</span>
                            </div>
                            <div className="flex justify-between items-center pt-3 mt-1 border-t border-gray-200/50">
                                <span className="font-bold text-gray-500 flex items-center gap-1.5"><Activity size={14} className="text-teal-500"/> Lợi nhuận</span>
                                <span className={`text-[18px] font-black ${quickViewData.realProfit >= 0 ? 'text-[#1DB2A0]' : 'text-red-500'}`}>
                                    {formatCurrency(quickViewData.realProfit || 0)}đ
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}