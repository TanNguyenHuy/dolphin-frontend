import React from 'react';
import { TrendingUp, Package, List } from 'lucide-react';
import DashboardChart from './dashboard/DashboardChart';
import DashboardStats from './dashboard/DashboardStats';
import SessionCard from './dashboard/SessionCard';

export default function DashboardView({
    dashboardProfit, globalTongCon, globalTongNhap, globalVonTon, showTax, taxAmount, displayRevenueTr, totalRevenueForTax, 
    safeSessions, enrichedSessions, fetchDetail, isAdmin, canEdit, canDelete, canPay, 
    setSalarySession, setShowSalaryModal, handleStartEditSession, handleDeleteSession
}) {
    // Hàm xử lý cuộn mượt đến các phân vùng
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            // Tính toán vị trí và trừ hao 120px để không bị thanh Header và Menu che khuất
            const y = element.getBoundingClientRect().top + window.scrollY - 120;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in-up pb-10 relative">
            
            {/* THANH MENU ĐIỀU HƯỚNG NỔI (STICKY) */}
            <div className="sticky top-[70px] md:top-[85px] z-[40] flex items-center justify-start md:justify-center gap-2.5 md:gap-4 overflow-x-auto custom-scrollbar pb-3 pt-2 px-1 -mx-1 md:mx-0">
                <button 
                    onClick={() => scrollToSection('section-loi-nhuan')} 
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md border border-[#FFE0B2] shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-[16px] text-[13px] font-black text-[#E65100] whitespace-nowrap transition-all active:scale-95"
                >
                    <TrendingUp size={16} strokeWidth={2.5} /> Lợi Nhuận
                </button>
                
                <button 
                    onClick={() => scrollToSection('section-kho-thue')} 
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md border border-blue-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-[16px] text-[13px] font-black text-[#1A5B82] whitespace-nowrap transition-all active:scale-95"
                >
                    <Package size={16} strokeWidth={2.5} /> Kho, Vốn & Thuế
                </button>
                
                <button 
                    onClick={() => scrollToSection('section-danh-sach')} 
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/90 backdrop-blur-md border border-teal-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 rounded-[16px] text-[13px] font-black text-[#1DB2A0] whitespace-nowrap transition-all active:scale-95"
                >
                    <List size={16} strokeWidth={2.5} /> Đợt Bán
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 relative">
                {/* TRẠM DỪNG: LỢI NHUẬN */}
                <div className="lg:col-span-7 relative">
                    <div id="section-loi-nhuan" className="absolute -top-32"></div>
                    <DashboardChart 
                        enrichedSessions={enrichedSessions} 
                        dashboardProfit={dashboardProfit} 
                    />
                </div>
                
                {/* TRẠM DỪNG: KHO & THUẾ */}
                <div className="lg:col-span-5 relative">
                    <div id="section-kho-thue" className="absolute -top-32"></div>
                    <DashboardStats 
                        globalTongCon={globalTongCon} 
                        globalTongNhap={globalTongNhap} 
                        globalVonTon={globalVonTon} 
                        displayRevenueTr={displayRevenueTr} 
                        taxAmount={taxAmount} 
                        totalRevenueForTax={totalRevenueForTax} 
                    />
                </div>
            </div>

            {/* TRẠM DỪNG: DANH SÁCH */}
            <div className="relative">
                <div id="section-danh-sach" className="absolute -top-32"></div>
                <div className="liquid-glass rounded-[32px] p-3 sm:p-6 md:p-8 border border-white/60 shadow-sm">
                    <div className="flex justify-between items-center mb-6 px-2 md:px-0">
                        <h2 className="text-[20px] md:text-[22px] font-bold text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                        <span className="text-[13px] font-bold bg-white/80 border border-gray-200 text-[#1D1D1F] px-3.5 py-1 rounded-full shadow-sm">{enrichedSessions.length}</span>
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
            
        </div>
    );
}