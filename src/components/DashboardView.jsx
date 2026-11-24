import React, { useState, useMemo, memo } from 'react';
import { ChevronDown, Calendar, Package, TrendingUp, Activity, Box, ShoppingBag } from 'lucide-react';
import DashboardChart from './dashboard/DashboardChart';
import MiniCharts from './dashboard/MiniCharts';
import DashboardStats from './dashboard/DashboardStats';
import SessionCard from './dashboard/SessionCard';
import TopMVP from './dashboard/TopMVP';
import SmartCalendar from './dashboard/SmartCalendar';
import { formatCurrency, formatDateDisplay, AD_COST_PER_SALE } from '../utils';
import { calculateDetailStats } from '../logic';
import ScrollReveal from './motion/ScrollReveal';

export default memo(function DashboardView({
    globalTongCon, globalTongNhap, globalVonTon, taxAmount,
    enrichedSessions, fetchDetail, canEdit, canDelete, canPay,
    setSalarySession, setShowSalaryModal, handleStartEditSession, handleDeleteSession
}) {
    const [visibleCount, setVisibleCount] = useState(6);

    const safeEnrichedSessions = enrichedSessions || [];
    const visibleSessions = safeEnrichedSessions.slice(0, visibleCount);
    const hasMore = visibleCount < safeEnrichedSessions.length;
    const completedSessions = useMemo(() => (enrichedSessions || []).filter(s => s.is_completed === true), [enrichedSessions]);

    const [quickViewData, setQuickViewData] = useState(null);
    const quickViewDetails = useMemo(() => {
        if (!quickViewData) return [];
        const stats = calculateDetailStats(quickViewData.detail, quickViewData.bales, AD_COST_PER_SALE);
        return [...stats.enrichedDaily].sort((a, b) => Number(b.so_tien_ban_duoc || 0) - Number(a.so_tien_ban_duoc || 0));
    }, [quickViewData]);
    const handleMouseEnterRow = session => setQuickViewData(session);

    return (
        <div className="dashboard-page space-y-6 lg:space-y-8 animate-fade-in-up pb-24 max-w-[1400px] mx-auto pt-4 md:pt-8 relative">
            <header className="dashboard-heading">
                <div><h1>Tổng quan kinh doanh</h1><p>Theo dõi doanh thu, tồn kho và các đợt bán trong một không gian.</p></div>
                <span className="workspace-badge">{safeEnrichedSessions.length} đợt bán</span>
            </header>

            <ScrollReveal><MiniCharts sessions={completedSessions} /></ScrollReveal>
            <div className="dashboard-grid">
                <div className="dashboard-chart"><ScrollReveal><DashboardChart enrichedSessions={completedSessions} /></ScrollReveal></div>
                <div className="dashboard-inventory"><ScrollReveal delay={50}><DashboardStats globalTongCon={globalTongCon} globalTongNhap={globalTongNhap} globalVonTon={globalVonTon} taxAmount={taxAmount} /></ScrollReveal></div>
                <div className="dashboard-calendar"><ScrollReveal delay={100}><SmartCalendar sessions={safeEnrichedSessions} /></ScrollReveal></div>
            </div>

            <div id="section-danh-sach" className="scroll-mt-[120px] w-full pt-6">
                <ScrollReveal delay={300}>
                    <div className="session-list-layout">
                        <div className="session-list-panel liquid-glass rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-10 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden bg-white/40">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-teal-200/30 to-emerald-100/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3"></div>

                            <div className="flex justify-between items-center mb-8 px-2 md:px-0 relative z-10">
                                <h2 className="text-[22px] md:text-[28px] font-black text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                                <span className="text-[13px] md:text-[14px] font-bold bg-white/80 backdrop-blur-md border border-gray-200 text-[#1D1D1F] px-4 py-1.5 rounded-full shadow-sm">Tổng: {safeEnrichedSessions.length}</span>
                            </div>

                            <div className="flex flex-col gap-4 relative z-10">
                                {visibleSessions.length === 0 && <div className="empty-state"><ShoppingBag size={32} /><h3>Chưa có đợt bán nào</h3><p>{canEdit ? 'Bấm Tạo thống kê trên thanh bên để bắt đầu.' : 'Các đợt bán sẽ xuất hiện tại đây khi được tạo.'}</p></div>}
                                {visibleSessions.map((session, index) => (
                                    <div key={session.id} onFocus={() => handleMouseEnterRow(session)} className="session-row transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-[24px]" onMouseEnter={() => handleMouseEnterRow(session)}>
                                        <SessionCard session={session} index={index} totalCount={safeEnrichedSessions.length} fetchDetail={fetchDetail} canPay={canPay} canEdit={canEdit} canDelete={canDelete} setSalarySession={setSalarySession} setShowSalaryModal={setShowSalaryModal} handleStartEditSession={handleStartEditSession} handleDeleteSession={handleDeleteSession} />
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
                        <aside className="session-quick-preview" aria-label="Xem nhanh đợt bán">
                            <h2 className="quick-preview-heading">Xem nhanh</h2>
                            <div className="quick-preview-content">
                                {!quickViewData && <p className="quick-preview-placeholder">Rê chuột hoặc chọn một đợt bán bằng bàn phím để xem thông tin tại đây.</p>}

                                {quickViewData && (
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-white/95 backdrop-blur-3xl rounded-[24px] p-4 border border-white/60 shrink-0">
                                            <h3 className="text-[17px] font-black text-[#1D1D1F] leading-tight mb-1 truncate">{quickViewData.name || 'Đợt bán'}</h3>
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                                                <Calendar size={13} />{formatDateDisplay(quickViewData.actual_start_date)} ➔ {formatDateDisplay(quickViewData.actual_end_date)}
                                            </div>
                                        </div>
                                        <div className="bg-white/95 backdrop-blur-3xl rounded-[24px] p-4 border border-white/60 relative overflow-hidden shrink-0">
                                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl"></div>
                                            <div className="flex items-center gap-2 text-[#1D1D1F] font-black text-[14px] mb-3"><Box size={16} className="text-blue-500"/> Cấu trúc Vốn</div>
                                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 rounded-[16px] p-3 mb-3 relative overflow-hidden">
                                                <Package size={64} strokeWidth={1} className="absolute -right-4 -bottom-4 text-amber-500/10" />
                                                <div className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1 relative z-10">Tổng vốn nhập kho</div>
                                                <div className="text-[20px] font-black text-[#663C00] relative z-10 leading-none">{formatCurrency((quickViewData.so_tien_cua_kien || 0) + (quickViewData.computedGiatUi || 0))} <span className="text-[13px] opacity-70">đ</span></div>
                                            </div>
                                            <div className="space-y-2 text-[11px] font-bold">
                                                <div className="flex justify-between items-center text-gray-500 border-b border-gray-100 pb-1.5"><span className="uppercase text-[8px] tracking-wider">Phí giặt ủi (Auto 4%)</span><span className="text-[#1D1D1F]">{formatCurrency(quickViewData.computedGiatUi || 0)}</span></div>
                                                <div className="flex justify-between items-center text-gray-500"><span>Tổng Hàng Nhập</span><span className="text-[#1D1D1F] text-[12px]">{quickViewData.tong_sl_nhap || 0}</span></div>
                                                <div className="flex justify-between items-center text-gray-500"><span>Tổng Đã Bán</span><span className="text-teal-600 text-[12px]">{quickViewData.tong_sl_ban || 0}</span></div>
                                                <div className="flex justify-between items-center text-gray-500 pt-1.5 border-t border-gray-100"><span>Phí Quảng cáo (Auto)</span><span className="text-[#1D1D1F]">{formatCurrency(quickViewData.autoAdCost || 0)}</span></div>
                                            </div>
                                        </div>
                                        <div className="bg-white/95 backdrop-blur-3xl rounded-[24px] p-4 border border-white/60 flex flex-col shrink-0">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-1.5 font-black text-[13px] text-[#1D1D1F]"><ShoppingBag size={14} className="text-teal-500"/> Top Doanh Thu</div>
                                                <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-lg">{quickViewDetails.length} mục</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                {quickViewDetails.length === 0 ? (
                                                    <div className="flex items-center justify-center py-4 text-[10px] font-bold text-gray-400">Chưa có sản phẩm nào</div>
                                                ) : (
                                                    <>
                                                        {quickViewDetails.slice(0, 4).map((item, idx) => (
                                                            <div key={idx} className="bg-white border border-gray-100 rounded-[12px] p-2 shadow-sm">
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <div className="font-black text-[11px] text-[#1D1D1F] truncate pr-2 flex-1"><span className="text-gray-400 mr-1">#{idx + 1}</span> {item.ten_san_pham}</div>
                                                                    <div className={`text-[10px] font-black shrink-0 ${item.loi >= 0 ? 'text-[#1DB2A0]' : 'text-rose-500'}`}>{item.loi >= 0 ? '+' : ''}{formatCurrency(item.loi)}đ</div>
                                                                </div>
                                                                <div className="flex justify-between items-center text-[9px] font-bold text-gray-500">
                                                                    <div className="flex gap-1"><span className="bg-gray-50 px-1 rounded border border-gray-100">N:{item.sl_nhap}</span><span className="bg-teal-50 text-teal-600 px-1 rounded border border-teal-100">B:{item.so_luong || 0}</span></div>
                                                                    <div className="text-blue-600">Thu: {formatCurrency(item.so_tien_ban_duoc || 0)}</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {quickViewDetails.length > 4 && <div className="text-center text-[9px] font-bold text-gray-400 mt-1">+ {quickViewDetails.length - 4} sản phẩm khác...</div>}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-white/95 backdrop-blur-3xl rounded-[24px] p-4 border border-white/60 shrink-0">
                                            <div className="flex justify-between items-center mb-3"><span className="font-black text-[13px] text-[#1D1D1F]">Hiệu suất</span><span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-lg">Gọn</span></div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-[11px] bg-gray-50/50 p-1.5 rounded-[10px]"><span className="font-bold text-gray-500 flex items-center gap-1"><TrendingUp size={12} className="text-blue-500"/> Doanh thu</span><span className="font-black text-[#1D1D1F]">{formatCurrency(quickViewData.tong_doanh_thu || 0)}đ</span></div>
                                                <div className="flex justify-between items-center text-[11px] bg-gray-50/50 p-1.5 rounded-[10px]"><span className="font-bold text-gray-400 flex items-center gap-1"><Package size={12} className="text-gray-400"/> Vốn tồn</span><span className="font-bold text-gray-500">{formatCurrency(quickViewData.tong_tien_ton_computed || 0)}đ</span></div>
                                                <div className="flex justify-between items-center pt-2 px-1 border-t border-gray-100"><span className="font-black text-gray-600 uppercase tracking-widest text-[9px] flex items-center gap-1"><Activity size={12} className={quickViewData.realProfit >= 0 ? 'text-teal-500' : 'text-rose-500'}/> LỢI NHUẬN</span><span className={`text-[16px] font-black ${quickViewData.realProfit >= 0 ? 'text-[#1DB2A0]' : 'text-rose-600'}`}>{formatCurrency(quickViewData.realProfit || 0)}đ</span></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>

                    </div>
                </ScrollReveal>
            </div>

            <details className="dashboard-rankings reading-panel"><summary>So sánh hiệu suất các đợt bán</summary><TopMVP sessions={completedSessions} /></details>
        </div>
    );
});
