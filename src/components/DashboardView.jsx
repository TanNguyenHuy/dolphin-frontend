import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar, Package, TrendingUp, Activity, Box } from 'lucide-react';
import DashboardChart from './dashboard/DashboardChart';
import DashboardStats from './dashboard/DashboardStats';
import SessionCard from './dashboard/SessionCard';
import { formatCurrency, formatDateDisplay } from '../../utils';

// CẢM BIẾN HIỂN THỊ CỰC MƯỢT
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

    // STATE: QUẢN LÝ QUICK VIEW (BẢNG XEM NHANH)
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
        }, 150);
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

            {/* TRẠM 3: DANH SÁCH ĐỢT BÁN (Đã trả lại Full Width) */}
            <div id="section-danh-sach" className="scroll-mt-[120px] w-full relative">
                <ScrollReveal delay={150}>
                    <div 
                        className="liquid-glass rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-10 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden bg-white/40 w-full"
                        onMouseLeave={handleMouseLeaveList} 
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
                                    onMouseEnter={() => handleMouseEnterRow(session)} 
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
            {/* BẢNG XEM NHANH (QUICK VIEW) - CHUẨN UI CẤU TRÚC VỐN */}
            {/* Pointer-events-none giúp click xuyên qua bảng khi nó đè lên nút Sửa/Xóa */}
            {/* ========================================================= */}
            <div 
                className={`hidden xl:block fixed right-8 top-1/2 -translate-y-1/2 w-[360px] z-[100] transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none 
                ${isHoveringList ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[120%] blur-sm'}`}
            >
                {quickViewData && (
                    <div className="flex flex-col gap-4 drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]">
                        
                        {/* TIÊU ĐỀ ĐỢT BÁN */}
                        <div className="bg-white/90 backdrop-blur-2xl rounded-[24px] p-5 border border-white/60">
                            <h3 className="text-[18px] font-black text-[#1D1D1F] leading-tight mb-1 truncate">
                                {quickViewData.name || 'Đợt bán'}
                            </h3>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                                <Calendar size={13} />
                                {formatDateDisplay(quickViewData.actual_start_date)} ➔ {formatDateDisplay(quickViewData.actual_end_date)}
                            </div>
                        </div>

                        {/* THẺ 1: CẤU TRÚC VỐN (Màu vàng nhạt như ảnh gửi) */}
                        <div className="bg-white/90 backdrop-blur-2xl rounded-[24px] p-5 border border-white/60 relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl"></div>
                            
                            <div className="flex items-center gap-2 text-[#1D1D1F] font-black text-[15px] mb-4">
                                <Box size={16} className="text-blue-500"/> Cấu trúc Vốn
                            </div>

                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 rounded-[20px] p-4 mb-4 relative overflow-hidden">
                                <Package size={64} strokeWidth={1} className="absolute -right-4 -bottom-4 text-amber-500/10" />
                                <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 relative z-10">Tổng vốn nhập kho</div>
                                <div className="text-[26px] font-black text-[#663C00] relative z-10 leading-none">
                                    {formatCurrency((quickViewData.so_tien_cua_kien || 0) + (quickViewData.computedGiatUi || 0))} <span className="text-[16px] opacity-70">đ</span>
                                </div>
                            </div>

                            <div className="space-y-3 text-[13px] font-bold">
                                <div className="flex justify-between items-center text-gray-500 border-b border-gray-100 pb-2">
                                    <span className="uppercase text-[10px] tracking-wider">Phí giặt ủi (Auto 4%)</span>
                                    <span className="text-[#1D1D1F]">{formatCurrency(quickViewData.computedGiatUi || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Tổng Hàng Nhập</span>
                                    <span className="text-[#1D1D1F] text-[14px]">{quickViewData.tong_sl_nhap || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Tổng Đã Bán</span>
                                    <span className="text-teal-600 text-[14px]">{quickViewData.tong_sl_ban || 0}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <span>Tồn Kho Hiện Tại</span>
                                    <span className="text-orange-600 text-[14px] font-black">{(quickViewData.tong_sl_nhap || 0) - (quickViewData.tong_sl_ban || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-gray-500 pt-2 border-t border-gray-100">
                                    <span>Phí Quảng cáo (Auto)</span>
                                    <span className="text-[#1D1D1F]">{formatCurrency(quickViewData.autoAdCost || 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* THẺ 2: CHI TIẾT SẢN PHẨM & LỢI NHUẬN */}
                        <div className="bg-white/90 backdrop-blur-2xl rounded-[24px] p-5 border border-white/60">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-black text-[15px] text-[#1D1D1F]">Tổng kết Hiệu suất</span>
                                <span className="text-[11px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">Gọn</span>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[13px] bg-gray-50/50 p-2.5 rounded-[12px]">
                                    <span className="font-bold text-gray-500 flex items-center gap-1.5"><TrendingUp size={14} className="text-blue-500"/> Doanh thu</span>
                                    <span className="font-black text-[#1D1D1F]">{formatCurrency(quickViewData.tong_doanh_thu || 0)}đ</span>
                                </div>
                                <div className="flex justify-between items-center text-[13px] bg-gray-50/50 p-2.5 rounded-[12px]">
                                    <span className="font-bold text-gray-400 flex items-center gap-1.5"><Package size={14} className="text-gray-400"/> Ước tính Vốn tồn</span>
                                    <span className="font-bold text-gray-500">{formatCurrency(quickViewData.tong_tien_ton_computed || 0)}đ</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 px-1">
                                    <span className="font-black text-gray-600 uppercase tracking-widest text-[11px] flex items-center gap-1.5"><Activity size={14} className={quickViewData.realProfit >= 0 ? 'text-teal-500' : 'text-rose-500'}/> LỢI NHUẬN</span>
                                    <span className={`text-[20px] font-black ${quickViewData.realProfit >= 0 ? 'text-[#1DB2A0]' : 'text-rose-600'}`}>
                                        {formatCurrency(quickViewData.realProfit || 0)}đ
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

        </div>
    );
}