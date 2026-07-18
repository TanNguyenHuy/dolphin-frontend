import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import DashboardChart from './dashboard/DashboardChart';
import SmartCalendar from './dashboard/SmartCalendar';
import DashboardStats from './dashboard/DashboardStats';
import SessionCard from './dashboard/SessionCard';

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
            className={`transition-all duration-[1000ms] cubic-bezier(0.16, 1, 0.3, 1) h-full ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
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

    // Lọc các đợt đã chốt sổ cho biểu đồ và lịch
    const completedSessions = enrichedSessions.filter(s => s.is_completed === true);

    return (
        <div className="space-y-10 animate-fade-in-up pb-24 max-w-[1400px] mx-auto pt-6">
            
            {/* GRID BỐ CỤC CHÍNH (Cột 8 - Cột 4) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                
                {/* CỘT TRÁI (Main Area - Chiếm 8 phần): BIỂU ĐỒ & CHỈ SỐ */}
                <div className="lg:col-span-8 space-y-6 lg:space-y-8 flex flex-col">
                    <div className="h-[400px]">
                        <ScrollReveal delay={0}>
                            <DashboardChart enrichedSessions={completedSessions} dashboardProfit={dashboardProfit} />
                        </ScrollReveal>
                    </div>

                    {/* BƯỚC 3 & 5 (Sẽ làm tiếp ở các thẻ phân loại & Top 3) - Tạm để DashboardStats ở đây */}
                    <div className="flex-1">
                        <ScrollReveal delay={150}>
                            <DashboardStats 
                                globalTongCon={globalTongCon} globalTongNhap={globalTongNhap} globalVonTon={globalVonTon} 
                                displayRevenueTr={displayRevenueTr} taxAmount={taxAmount} totalRevenueForTax={totalRevenueForTax} 
                            />
                        </ScrollReveal>
                    </div>
                </div>

                {/* CỘT PHẢI (Sidebar - Chiếm 4 phần): LỊCH */}
                <div className="lg:col-span-4 space-y-6 lg:space-y-8 flex flex-col">
                    <div className="h-[400px]">
                        <ScrollReveal delay={200}>
                            <SmartCalendar sessions={completedSessions} />
                        </ScrollReveal>
                    </div>
                    
                    {/* BƯỚC 4 (Sẽ làm tiếp Widget Cấu Trúc Vốn Dọc ở đây) */}
                </div>
            </div>

            {/* DANH SÁCH ĐỢT BÁN (Giữ nguyên Full-width bên dưới Lưới chính) */}
            <div id="section-danh-sach" className="scroll-mt-[120px] w-full pt-8">
                <ScrollReveal delay={300}>
                    <div className="liquid-glass rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-10 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden bg-white/40">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-teal-200/30 to-emerald-100/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3"></div>
                        
                        <div className="flex justify-between items-center mb-8 px-2 md:px-0 relative z-10">
                            <h2 className="text-[22px] md:text-[28px] font-black text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                            <span className="text-[13px] md:text-[14px] font-bold bg-white/80 backdrop-blur-md border border-gray-200 text-[#1D1D1F] px-4 py-1.5 rounded-full shadow-sm">
                                Tổng: {enrichedSessions.length}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 relative z-10">
                            {visibleSessions.map((session, index) => (
                                <div key={session.id} className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-[24px]">
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
        </div>
    );
}