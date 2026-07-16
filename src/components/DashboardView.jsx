import React from 'react';
import DashboardChart from './dashboard/DashboardChart';
import DashboardStats from './dashboard/DashboardStats';
import SessionCard from './dashboard/SessionCard';

export default function DashboardView({
    activeTab, // Biến này nhận lệnh từ các nút bấm trên Header
    dashboardProfit, globalTongCon, globalTongNhap, globalVonTon, showTax, taxAmount, displayRevenueTr, totalRevenueForTax, 
    safeSessions, enrichedSessions, fetchDetail, isAdmin, canEdit, canDelete, canPay, 
    setSalarySession, setShowSalaryModal, handleStartEditSession, handleDeleteSession
}) {
    return (
        <div className="animate-fade-in-up pb-10">
            
            {/* TAB 1: HIỂN THỊ BIỂU ĐỒ LỢI NHUẬN */}
            {activeTab === 'CHART' && (
                <div className="max-w-6xl mx-auto w-full transition-all animate-scale-up">
                    <DashboardChart 
                        enrichedSessions={enrichedSessions} 
                        dashboardProfit={dashboardProfit} 
                    />
                </div>
            )}

            {/* TAB 2: HIỂN THỊ KHO, VỐN & THUẾ */}
            {activeTab === 'STATS' && (
                <div className="max-w-4xl mx-auto w-full transition-all animate-scale-up">
                    <DashboardStats 
                        globalTongCon={globalTongCon} 
                        globalTongNhap={globalTongNhap} 
                        globalVonTon={globalVonTon} 
                        displayRevenueTr={displayRevenueTr} 
                        taxAmount={taxAmount} 
                        totalRevenueForTax={totalRevenueForTax} 
                    />
                </div>
            )}

            {/* TAB 3: HIỂN THỊ DANH SÁCH ĐỢT BÁN */}
            {activeTab === 'LIST' && (
                <div className="liquid-glass rounded-[32px] p-3 sm:p-6 md:p-8 border border-white/60 shadow-sm transition-all animate-scale-up">
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
            )}

        </div>
    );
}