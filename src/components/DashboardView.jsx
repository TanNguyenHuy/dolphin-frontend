import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import DashboardChart from './dashboard/DashboardChart';
import DashboardStats from './dashboard/DashboardStats';
import SessionCard from './dashboard/SessionCard';

// Component Cảm Biến: Lướt tới đâu, trồi lên tới đó
const ScrollReveal = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef();

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setIsVisible(true);
                observer.unobserve(domRef.current);
            }
        }, { threshold: 0.1 });
        if (domRef.current) observer.observe(domRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={domRef} className={`transition-all duration-[1200ms] ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-24'}`}>
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

    return (
        <div className="space-y-16 md:space-y-24 animate-fade-in-up pb-24">
            
            {/* TRẠM 1 */}
            <div id="section-loi-nhuan" className="scroll-mt-[130px] w-full max-w-6xl mx-auto">
                <ScrollReveal>
                    <DashboardChart enrichedSessions={enrichedSessions} dashboardProfit={dashboardProfit} />
                </ScrollReveal>
            </div>

            {/* TRẠM 2 */}
            <div id="section-kho-thue" className="scroll-mt-[130px] w-full max-w-[1400px] mx-auto">
                <ScrollReveal>
                    <DashboardStats 
                        globalTongCon={globalTongCon} globalTongNhap={globalTongNhap} globalVonTon={globalVonTon} 
                        displayRevenueTr={displayRevenueTr} taxAmount={taxAmount} totalRevenueForTax={totalRevenueForTax} 
                    />
                </ScrollReveal>
            </div>

            {/* TRẠM 3 */}
            <div id="section-danh-sach" className="scroll-mt-[130px] w-full max-w-[1400px] mx-auto">
                <ScrollReveal>
                    <div className="liquid-glass rounded-[32px] md:rounded-[40px] p-5 sm:p-8 md:p-12 border border-white/60 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-200/20 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="flex justify-between items-center mb-8 px-2 md:px-0 relative z-10">
                            <h2 className="text-[24px] md:text-[28px] font-black text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                            <span className="text-[14px] font-bold bg-white border border-gray-200 text-[#1D1D1F] px-4 py-1.5 rounded-full shadow-sm">Tổng: {enrichedSessions.length}</span>
                        </div>

                        <div className="flex flex-col gap-4 relative z-10">
                            {visibleSessions.map((session, index) => (
                                <SessionCard key={session.id} session={session} index={index} totalCount={enrichedSessions.length} fetchDetail={fetchDetail} canPay={canPay} canEdit={canEdit} canDelete={canDelete} setSalarySession={setSalarySession} setShowSalaryModal={setShowSalaryModal} handleStartEditSession={handleStartEditSession} handleDeleteSession={handleDeleteSession} />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-8 flex justify-center relative z-10">
                                <button onClick={() => setVisibleCount(prev => prev + 6)} className="group flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3.5 rounded-[20px] font-bold text-[14px] shadow-[0_8px_16px_rgba(20,184,166,0.25)] hover:shadow-[0_12px_24px_rgba(20,184,166,0.35)] hover:-translate-y-1 transition-all active:scale-95">
                                    Xem thêm <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                                </button>
                            </div>
                        )}
                    </div>
                </ScrollReveal>
            </div>
        </div>
    );
}