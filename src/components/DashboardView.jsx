import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Calendar, Package, TrendingUp, Activity, Box, ShoppingBag } from 'lucide-react';
import DashboardChart from './dashboard/DashboardChart';
import SmartCalendar from './dashboard/SmartCalendar';
import MiniCharts from './dashboard/MiniCharts';
import DashboardStats from './dashboard/DashboardStats';
import SessionCard from './dashboard/SessionCard';
import TopMVP from './dashboard/TopMVP';
import { formatCurrency, formatDateDisplay, API_URL, AD_COST_PER_SALE } from '../utils';
import { calculateDetailStats } from '../logic';
import axios from 'axios';

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
    
    // Tấm khiên an toàn (chống lỗi crash khi dữ liệu chưa tải kịp)
    const safeEnrichedSessions = enrichedSessions || []; 
    
    const visibleSessions = safeEnrichedSessions.slice(0, visibleCount);
    const hasMore = visibleCount < safeEnrichedSessions.length;
    const completedSessions = safeEnrichedSessions.filter(s => s.is_completed === true);

    // =========================================================
    // STATE: QUICK VIEW (BẢNG XEM NHANH BÊN PHẢI)
    // =========================================================
    const [quickViewData, setQuickViewData] = useState(null);
    const [quickViewDetails, setQuickViewDetails] = useState([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [isHoveringList, setIsHoveringList] = useState(false);
    
    const hoverTimeoutRef = useRef(null);
    const hoveredSessionIdRef = useRef(null);

    const handleMouseEnterRow = async (session) => {
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        setQuickViewData(session);
        setIsHoveringList(true);

        if (hoveredSessionIdRef.current !== session.id) {
            hoveredSessionIdRef.current = session.id;
            setQuickViewDetails([]);
            setIsLoadingDetails(true);

            try {
                const [detailRes, balesRes] = await Promise.all([
                    axios.get(`${API_URL}/data/${session.id}`),
                    axios.get(`${API_URL}/bales/${session.id}`).catch(() => ({data: []}))
                ]);
                
                if (hoveredSessionIdRef.current === session.id) {
                    const detailData = { daily: Array.isArray(detailRes.data?.daily) ? detailRes.data.daily : [] };
                    const balesData = Array.isArray(balesRes.data) ? balesRes.data : [];
                    const dStats = calculateDetailStats(detailData, balesData, AD_COST_PER_SALE);
                    const rawDetails = dStats.enrichedDaily || [];
                    const sortedByRevenue = [...rawDetails].sort((a, b) => (Number(b.so_tien_ban_duoc) || 0) - (Number(a.so_tien_ban_duoc) || 0));
                    setQuickViewDetails(sortedByRevenue);
                    setIsLoadingDetails(false);
                }
            } catch (err) {
                if (hoveredSessionIdRef.current === session.id) setIsLoadingDetails(false);
            }
        }
    };

    const handleMouseLeaveList = () => {
        hoverTimeoutRef.current = setTimeout(() => setIsHoveringList(false), 150);
    };

    return (
        // ĐÃ ÉP GỌN: space-y-10 -> space-y-6, pt-6 -> pt-3
        <div className="space-y-6 animate-fade-in-up pb-24 max-w-[1400px] mx-auto pt-3 relative">
            
            {/* GRID BỐ CỤC CHÍNH */}
            {/* ĐÃ ÉP GỌN: gap-8 -> gap-5 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-5">
                
                {/* CỘT TRÁI (8 phần) */}
                {/* ĐÃ ÉP GỌN: space-y-8 -> space-y-5 */}
                <div className="lg:col-span-8 space-y-5 flex flex-col">
                    {/* ĐÃ ÉP GỌN CHIỀU CAO: h-[400px] -> h-[330px] */}
                    <div className="h-[330px]">
                        <ScrollReveal delay={0}>
                            <DashboardChart enrichedSessions={completedSessions} dashboardProfit={dashboardProfit} />
                        </ScrollReveal>
                    </div>
                    
                    {/* BƯỚC 3: MINI CHARTS */}
                    <div>
                        <ScrollReveal delay={100}>
                            <MiniCharts sessions={completedSessions} />
                        </ScrollReveal>
                    </div>

                    {/* BƯỚC 5: TOP ĐỢT BÁN (MVP) */}
                    <div className="flex-1">
                        <ScrollReveal delay={150}>
                            <TopMVP sessions={completedSessions} />
                        </ScrollReveal>
                    </div>
                </div>

                {/* CỘT PHẢI (4 phần) */}
                {/* ĐÃ ÉP GỌN: space-y-8 -> space-y-5 */}
                <div className="lg:col-span-4 space-y-5 flex flex-col">
                    {/* ĐÃ ÉP GỌN CHIỀU CAO: h-[400px] -> h-[330px] */}
                    <div className="h-[330px]">
                        <ScrollReveal delay={200}>
                            <SmartCalendar sessions={completedSessions} />
                        </ScrollReveal>
                    </div>
                    
                    {/* BƯỚC 4: THỐNG KÊ KHO VỐN DỌC */}
                    <div className="flex-1">
                        <ScrollReveal delay={300}>
                            <DashboardStats globalTongCon={globalTongCon} globalTongNhap={globalTongNhap} globalVonTon={globalVonTon} taxAmount={taxAmount} />
                        </ScrollReveal>
                    </div>
                </div>
            </div>

            {/* DANH SÁCH ĐỢT BÁN */}
            <div id="section-danh-sach" className="scroll-mt-[120px] w-full pt-6">
                <ScrollReveal delay={300}>
                    <div 
                        className="liquid-glass rounded-[32px] md:rounded-[40px] p-6 sm:p-8 md:p-10 border border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden bg-white/40"
                        onMouseLeave={handleMouseLeaveList} 
                    >
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-teal-200/30 to-emerald-100/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/3 translate-x-1/3"></div>
                        <div className="flex justify-between items-center mb-8 px-2 md:px-0 relative z-10">
                            <h2 className="text-[22px] md:text-[28px] font-black text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                            <span className="text-[13px] md:text-[14px] font-bold bg-white/80 backdrop-blur-md border border-gray-200 text-[#1D1D1F] px-4 py-1.5 rounded-full shadow-sm">Tổng: {safeEnrichedSessions.length}</span>
                        </div>
                        <div className="flex flex-col gap-4 relative z-10">
                            {visibleSessions.map((session, index) => (
                                <div 
                                    key={session.id} 
                                    className="transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-[24px]"
                                    onMouseEnter={() => handleMouseEnterRow(session)}
                                >
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
                </ScrollReveal>
            </div>

            {/* BẢNG XEM NHANH (QUICK VIEW) */}
            <div className={`hidden xl:block fixed right-6 top-1/2 -translate-y-1/2 w-[370px] z-[100] transition-all duration-[600ms] cubic-bezier(0.16, 1, 0.3, 1) pointer-events-none ${isHoveringList ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[120%] blur-sm'}`}>
                {quickViewData && (
                    <div className="flex flex-col gap-3 drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] max-h-[90vh]">
                        <div className="bg-white/95 backdrop-blur-3xl rounded-[24px] p-4 border border-white/60 shrink-0">
                            <h3 className="text-[17px] font-black text-[#1D1D1F] leading-tight mb-1 truncate">{quickViewData.name || 'Đợt bán'}</h3>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                                <Calendar size={13} />{formatDateDisplay(quickViewData.actual_start_date)} ➔ {formatDateDisplay(quickViewData.actual_end_date)}
                            </div>
                        </div>
                        <div className="bg-white/95 backdrop-blur-3xl rounded-[24px] p-5 border border-white/60 relative overflow-hidden shrink-0">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100/50 rounded-full blur-2xl"></div>
                            <div className="flex items-center gap-2 text-[#1D1D1F] font-black text-[14px] mb-3"><Box size={16} className="text-blue-500"/> Cấu trúc Vốn</div>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100/50 rounded-[16px] p-3 mb-3 relative overflow-hidden">
                                <Package size={64} strokeWidth={1} className="absolute -right-4 -bottom-4 text-amber-500/10" />
                                <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 relative z-10">Tổng vốn nhập kho</div>
                                <div className="text-[24px] font-black text-[#663C00] relative z-10 leading-none">{formatCurrency((quickViewData.so_tien_cua_kien || 0) + (quickViewData.computedGiatUi || 0))} <span className="text-[15px] opacity-70">đ</span></div>
                            </div>
                            <div className="space-y-2 text-[12px] font-bold">
                                <div className="flex justify-between items-center text-gray-500 border-b border-gray-100 pb-1.5"><span className="uppercase text-[9px] tracking-wider">Phí giặt ủi (Auto 4%)</span><span className="text-[#1D1D1F]">{formatCurrency(quickViewData.computedGiatUi || 0)}</span></div>
                                <div className="flex justify-between items-center text-gray-500"><span>Tổng Hàng Nhập</span><span className="text-[#1D1D1F] text-[13px]">{quickViewData.tong_sl_nhap || 0}</span></div>
                                <div className="flex justify-between items-center text-gray-500"><span>Tổng Đã Bán</span><span className="text-teal-600 text-[13px]">{quickViewData.tong_sl_ban || 0}</span></div>
                                <div className="flex justify-between items-center text-gray-500 pt-1.5 border-t border-gray-100"><span>Phí Quảng cáo (Auto)</span><span className="text-[#1D1D1F]">{formatCurrency(quickViewData.autoAdCost || 0)}</span></div>
                            </div>
                        </div>
                        <div className="bg-white/95 backdrop-blur-3xl rounded-[24px] p-5 border border-white/60 flex flex-col shrink-0">
                            <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center gap-2 font-black text-[14px] text-[#1D1D1F]"><ShoppingBag size={15} className="text-teal-500"/> Top Doanh Thu</div>
                                <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">{quickViewDetails.length} mục</span>
                            </div>
                            <div className="flex flex-col gap-2">
                                {isLoadingDetails ? (
                                    <div className="flex flex-col items-center justify-center py-4 gap-2"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-500"></div><span className="text-[10px] text-gray-400 font-bold">Đang tải xếp hạng...</span></div>
                                ) : quickViewDetails.length === 0 ? (
                                    <div className="flex items-center justify-center py-4 text-[11px] font-bold text-gray-400">Chưa có sản phẩm nào</div>
                                ) : (
                                    <>
                                        {quickViewDetails.slice(0, 4).map((item, idx) => (
                                            <div key={idx} className="bg-white border border-gray-100 rounded-[16px] p-2.5 shadow-sm">
                                                <div className="flex justify-between items-start mb-1.5">
                                                    <div className="font-black text-[12px] text-[#1D1D1F] truncate pr-2 flex-1"><span className="text-gray-400 mr-1">#{idx + 1}</span> {item.ten_san_pham}</div>
                                                    <div className={`text-[11px] font-black shrink-0 ${item.loi >= 0 ? 'text-[#1DB2A0]' : 'text-rose-500'}`}>{item.loi >= 0 ? '+' : ''}{formatCurrency(item.loi)}đ</div>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                                                    <div className="flex gap-1"><span className="bg-gray-50 px-1 rounded border border-gray-100">N: {item.sl_nhap}</span><span className="bg-teal-50 text-teal-600 px-1 rounded border border-teal-100">B: {item.so_luong || 0}</span><span className="bg-orange-50 text-orange-600 px-1 rounded border border-orange-100">C: {item.sl_con}</span></div>
                                                    <div className="text-blue-600">Doanh thu: {formatCurrency(item.so_tien_ban_duoc || 0)}đ</div>
                                                </div>
                                            </div>
                                        ))}
                                        {quickViewDetails.length > 4 && <div className="text-center text-[10px] font-bold text-gray-400 mt-1">+ {quickViewDetails.length - 4} sản phẩm khác...</div>}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="bg-white/95 backdrop-blur-3xl rounded-[24px] p-5 border border-white/60 shrink-0">
                            <div className="flex justify-between items-center mb-3"><span className="font-black text-[14px] text-[#1D1D1F]">Tổng kết Hiệu suất</span><span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">Gọn</span></div>
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center text-[12px] bg-gray-50/50 p-2 rounded-[12px]"><span className="font-bold text-gray-500 flex items-center gap-1.5"><TrendingUp size={13} className="text-blue-500"/> Doanh thu</span><span className="font-black text-[#1D1D1F]">{formatCurrency(quickViewData.tong_doanh_thu || 0)}đ</span></div>
                                <div className="flex justify-between items-center text-[12px] bg-gray-50/50 p-2 rounded-[12px]"><span className="font-bold text-gray-400 flex items-center gap-1.5"><Package size={13} className="text-gray-400"/> Ước tính Vốn tồn</span><span className="font-bold text-gray-500">{formatCurrency(quickViewData.tong_tien_ton_computed || 0)}đ</span></div>
                                <div className="flex justify-between items-center pt-2.5 px-1 border-t border-gray-100"><span className="font-black text-gray-600 uppercase tracking-widest text-[10px] flex items-center gap-1.5"><Activity size={13} className={quickViewData.realProfit >= 0 ? 'text-teal-500' : 'text-rose-500'}/> LỢI NHUẬN</span><span className={`text-[18px] font-black ${quickViewData.realProfit >= 0 ? 'text-[#1DB2A0]' : 'text-rose-600'}`}>{formatCurrency(quickViewData.realProfit || 0)}đ</span></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}