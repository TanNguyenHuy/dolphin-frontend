import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import DashboardChart from './dashboard/DashboardChart';
import DashboardStats from './dashboard/DashboardStats';
import SessionCard from './dashboard/SessionCard';

export default function DashboardView({
    dashboardProfit, globalTongCon, globalTongNhap, globalVonTon, showTax, taxAmount, displayRevenueTr, totalRevenueForTax, 
    safeSessions, enrichedSessions, fetchDetail, isAdmin, canEdit, canDelete, canPay, 
    setSalarySession, setShowSalaryModal, handleStartEditSession, handleDeleteSession
}) {
    const [visibleCount, setVisibleCount] = useState(6);
    const visibleSessions = enrichedSessions.slice(0, visibleCount);
    const hasMore = visibleCount < enrichedSessions.length;
    const handleLoadMore = () => setVisibleCount(prev => prev + 6);

    return (
        <div className="space-y-12 md:space-y-24 animate-fade-in-up pb-20">
            
            {/* TRẠM 1: LỢI NHUẬN (FULL MÀN HÌNH - CỐ ĐỊNH CHIỀU CAO CHỐNG SẬP) */}
            <div id="section-loi-nhuan" className="w-full flex flex-col justify-center min-h-[calc(100vh-140px)] scroll-mt-[130px]">
                <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col h-[70vh] min-h-[500px]">
                    <DashboardChart enrichedSessions={enrichedSessions} dashboardProfit={dashboardProfit} />
                </div>
            </div>

            {/* TRẠM 2: KHO, VỐN & THUẾ (FULL MÀN HÌNH) */}
            <div id="section-kho-thue" className="w-full flex flex-col justify-center min-h-[calc(100vh-140px)] scroll-mt-[130px]">
                <div className="max-w-[1600px] w-full mx-auto flex-1 flex flex-col h-[70vh] min-h-[500px]">
                    <DashboardStats 
                        globalTongCon={globalTongCon} globalTongNhap={globalTongNhap} globalVonTon={globalVonTon} 
                        displayRevenueTr={displayRevenueTr} taxAmount={taxAmount} totalRevenueForTax={totalRevenueForTax} 
                    />
                </div>
            </div>

            {/* TRẠM 3: DANH SÁCH ĐỢT BÁN */}
            <div id="section-danh-sach" className="w-full min-h-[calc(100vh-140px)] scroll-mt-[130px] flex flex-col">
                <div className="max-w-[1600px] w-full mx-auto liquid-glass rounded-[32px] md:rounded-[48px] p-4 sm:p-6 md:p-10 border border-white/60 shadow-xl flex-1 flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-200/20 rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="flex justify-between items-center mb-8 px-2 md:px-0 relative z-10">
                        <h2 className="text-[24px] md:text-[32px] font-black text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                        <span className="text-[14px] md:text-[16px] font-bold bg-white border border-gray-200 text-[#1D1D1F] px-5 py-2 rounded-full shadow-sm">
                            Tổng: {enrichedSessions.length}
                        </span>
                    </div>

                    <div className="flex flex-col gap-4 md:gap-5 relative z-10">
                        {visibleSessions.map((session, index) => (
                            <SessionCard 
                                key={session.id} session={session} index={index} totalCount={enrichedSessions.length}
                                fetchDetail={fetchDetail} canPay={canPay} canEdit={canEdit} canDelete={canDelete}
                                setSalarySession={setSalarySession} setShowSalaryModal={setShowSalaryModal}
                                handleStartEditSession={handleStartEditSession} handleDeleteSession={handleDeleteSession}
                            />
                        ))}
                    </div>

                    {/* NÚT XEM THÊM (CHỈ CHỮ "XEM THÊM") */}
                    {hasMore && (
                        <div className="mt-10 flex justify-center relative z-10 pb-4">
                            <button 
                                onClick={handleLoadMore}
                                className="group flex items-center gap-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-8 py-3.5 rounded-[20px] font-bold text-[15px] shadow-[0_10px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_15px_30px_rgba(20,184,166,0.4)] hover:-translate-y-1 transition-all active:scale-95"
                            >
                                Xem thêm <ChevronDown size={20} className="group-hover:translate-y-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}