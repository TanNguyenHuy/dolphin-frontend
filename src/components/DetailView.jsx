import React from 'react';
import DashboardChart from './dashboard/DashboardChart';
import DashboardStats from './dashboard/DashboardStats';
import SessionCard from './dashboard/SessionCard';

export default function DashboardView({
    dashboardProfit, globalTongCon, globalTongNhap, globalVonTon, showTax, taxAmount, displayRevenueTr, totalRevenueForTax, 
    safeSessions, enrichedSessions, fetchDetail, isAdmin, canEdit, canDelete, canPay, 
    setSalarySession, setShowSalaryModal, handleStartEditSession, handleDeleteSession
}) {
    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in-up pb-10">
            
            {/* TRẠM DỪNG 1: LỢI NHUẬN */}
            <div id="section-loi-nhuan" className="max-w-6xl mx-auto w-full">
                <DashboardChart 
                    enrichedSessions={enrichedSessions} 
                    dashboardProfit={dashboardProfit} 
                />
            </div>

            {/* TRẠM DỪNG 2: KHO, VỐN & THUẾ */}
            <div id="section-kho-thue" className="max-w-4xl mx-auto w-full pt-4">
                <DashboardStats 
                    globalTongCon={globalTongCon} 
                    globalTongNhap={globalTongNhap} 
                    globalVonTon={globalVonTon} 
                    displayRevenueTr={displayRevenueTr} 
                    taxAmount={taxAmount} 
                    totalRevenueForTax={totalRevenueForTax} 
                />
            </div>

            {/* TRẠM DỪNG 3: DANH SÁCH ĐỢT BÁN */}
            <div id="section-danh-sach" className="liquid-glass rounded-[32px] p-3 sm:p-6 md:p-8 border border-white/60 shadow-sm pt-4">
                <div className="flex justify-between items-center mb-6 px-2 md:px-0">
                    <h2 className="text-[20px] md:text-[22px] font-bold text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                    <span className="text-[13px] font-bold bg-white/80 border border-gray-200 text-[#1D1D1F] px-3.5 py-1 rounded-full shadow-sm">
                        {enrichedSessions.length}
                    </span>
                </div>

                <div className="flex flex-col gap-4 md:gap-5">
                    {enrichedSessions.map((session, index) => (
                        <SessionCard 
                            key={session.id}
                            session={session}
                            index={index}
                            totalCount={enrichedSessions.length}
                            fetchDetail={fetchDetail}
                            canPay={canPay}
                            canEdit={canEdit}
                            canDelete={canDelete}
                            setSalarySession={setSalarySession}
                            setShowSalaryModal={setShowSalaryModal}
                            handleStartEditSession={handleStartEditSession}
                            handleDeleteSession={handleDeleteSession}
                        />
                    ))}
                </div>
            </div>

        </div>
    );
}