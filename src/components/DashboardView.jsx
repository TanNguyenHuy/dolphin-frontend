import React from 'react';
import { Calendar, Package, Percent, BarChart3, ChevronRight, Wallet, Pencil, Trash2, Crown, Link as LinkIcon } from 'lucide-react';
import { formatCurrency, formatInput, getSessionName, AnimatedNumber, formatDateDisplay } from '../utils';

export default function DashboardView({ 
    dashboardProfit, globalTongCon, globalTongNhap, globalVonTon, showTax, taxAmount, displayRevenueTr, 
    totalRevenueForTax, 
    safeSessions, enrichedSessions, fetchDetail, isAdmin, canEdit, canDelete, 
    setSalarySession, setShowSalaryModal, handleStartEditSession, handleDeleteSession 
}) {
    
    const calculateDaysDiff = (start, end) => { 
        if (!start || !end) return 0; 
        const d1 = new Date(start); const d2 = new Date(end); 
        if (isNaN(d1) || isNaN(d2)) return 0;
        return Math.max(0, Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24))); 
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fade-in-up">
            
            {/* THỐNG KÊ TỔNG QUAN (Giữ nguyên) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                <div className="lg:col-span-7 liquid-glass-dark p-6 md:p-8 rounded-[32px] relative overflow-hidden flex flex-col justify-between min-h-[180px] transition-transform duration-300 hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><BarChart3 size={120} strokeWidth={1} /></div>
                    <div className="relative z-10 flex items-center gap-2 mb-2"><h2 className="text-[13px] font-semibold uppercase tracking-widest text-white/70">Lợi Nhuận Ròng</h2></div>
                    <div className="relative z-10 mt-auto w-full min-w-0">
                        <div className={`text-4xl md:text-[50px] font-bold tracking-tight mb-0.5 drop-shadow-sm whitespace-nowrap ${dashboardProfit >= 0 ? 'text-white' : 'text-[#FF453A]'}`}><AnimatedNumber value={dashboardProfit} /></div>
                        <div className="text-[12px] text-[#81E4DA] font-semibold tracking-wider drop-shadow-sm mt-1">VIỆT NAM ĐỒNG</div>
                    </div>
                </div>
                
                <div className="lg:col-span-5 grid grid-rows-2 gap-4 md:gap-6">
                    <div className="liquid-glass p-5 md:p-6 rounded-[28px] flex flex-col justify-between group hover:shadow-[0_24px_48px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 hover:bg-white/30 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 shrink-0"><div className="w-8 h-8 bg-white/40 rounded-full flex items-center justify-center border border-white/50"><Package size={15} className="text-[#1A5B82]"/></div><h2 className="text-[11px] font-bold text-[#1D1D1F] uppercase tracking-wider whitespace-nowrap">Kho & Vốn</h2></div>
                            <div className="text-right pl-2"><div className="text-[12px] font-bold text-[#1D1D1F] tabular-nums whitespace-nowrap">{formatInput(globalTongCon)} <span className="text-[10px] text-[#5c5c5c] font-medium">/ {formatInput(globalTongNhap)}</span></div></div>
                        </div>
                        <div className="mt-auto flex justify-between items-end w-full min-w-0"><div className="text-[22px] md:text-[24px] font-bold text-[#1D1D1F] tabular-nums tracking-tight whitespace-nowrap">{formatCurrency(globalVonTon)}<span className="text-[13px] text-[#5c5c5c] ml-1 font-semibold">đ</span></div></div>
                    </div>
                    <div className="liquid-glass p-5 md:p-6 rounded-[28px] flex flex-col justify-between group hover:shadow-[0_24px_48px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 hover:bg-white/30 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2 shrink-0"><div className="w-8 h-8 bg-white/40 rounded-full flex items-center justify-center border border-white/50"><Percent size={15} className="text-[#FF3B30]"/></div><h2 className="text-[11px] font-bold text-[#1D1D1F] uppercase tracking-wider whitespace-nowrap">Ước Tính Thuế</h2></div>
                            <div className="text-right text-[11px] font-semibold text-[#5c5c5c] tabular-nums whitespace-nowrap pl-2">{displayRevenueTr} <span className="text-[#5c5c5c]">/ 500M</span></div>
                        </div>
                        <div className="mt-auto w-full min-w-0">
                            <div className="text-[22px] md:text-[24px] font-bold text-[#1D1D1F] tabular-nums tracking-tight whitespace-nowrap">{showTax ? <AnimatedNumber value={taxAmount} /> : "0"}<span className="text-[13px] text-[#5c5c5c] ml-1 font-semibold">đ</span></div>
                            <div className="w-full h-1.5 bg-white/40 rounded-full mt-2.5 overflow-hidden border border-white/50"><div className="h-full bg-gradient-to-r from-[#FF3B30] to-[#FF2D55] rounded-full" style={{width: `${Math.min((totalRevenueForTax/500000000)*100, 100)}%`}}></div></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* DANH SÁCH ĐỢT BÁN */}
            <div className="liquid-glass rounded-[32px] overflow-hidden min-w-0">
                <div className="px-5 md:px-6 py-4 border-b border-white/30 flex justify-between items-center bg-white/10">
                    <h2 className="text-[17px] md:text-[18px] font-bold text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                    <span className="text-[12px] font-bold bg-white/40 text-[#1D1D1F] border border-white/40 px-2.5 py-0.5 rounded-full">{safeSessions.length}</span>
                </div>
                
                {/* LỚP BỌC MỚI ĐÃ ĐƯỢC XÓA BỎ ÉP BUỘC min-w-[850px] GÂY LỖI */}
                <div className="flex flex-col divide-y divide-white/30 w-full overflow-x-auto custom-scrollbar">
                    <div className="w-full">
                        {enrichedSessions.map((ss, index) => {
                            if (!ss) return null;
                            const sl_con = (ss.tong_sl_nhap || 0) - (ss.tong_sl_ban || 0);
                            const isBanGreater = (ss.tong_sl_ban || 0) > sl_con;
                            let displayVonTon = ss.tong_tien_ton_computed || 0;
                            const sessionName = getSessionName(ss.name, ss.actual_start_date, ss.actual_end_date);
                            
                            return (
                                <div key={ss.id || index} onClick={() => fetchDetail(ss.id)} className="p-4 md:p-5 hover:bg-white/20 transition-colors duration-300 w-full cursor-pointer">
                                    
                                    {/* ========================================= */}
                                    {/* 1. GIAO DIỆN MÁY TÍNH (Giữ nguyên siêu đẹp) */}
                                    {/* ========================================= */}
                                    <div className="hidden lg:flex items-center justify-between w-full min-w-[850px]">
                                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] bg-white/40 border border-white/50 text-[#1D1D1F] tabular-nums shrink-0 shadow-sm">{safeSessions.length - index}</div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 mb-0.5"><h3 className="font-bold text-[#1D1D1F] text-[13px] leading-snug truncate group-hover:text-[#1A5B82] transition-colors">{sessionName}</h3></div>
                                                <div className="text-[11px] text-[#5c5c5c] font-medium tabular-nums flex items-center gap-1"><Calendar size={11}/> {calculateDaysDiff(ss.actual_start_date, ss.actual_end_date)} ngày</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-center gap-2 shrink-0">
                                            <div className="w-[60px] bg-white/20 border border-white/30 rounded-[14px] py-1.5 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Nhập</div><div className="font-bold text-[#1D1D1F] text-[13px] tabular-nums">{formatInput(ss.tong_sl_nhap || 0)}</div></div>
                                            <div className={`w-[60px] rounded-[14px] py-1.5 text-center shadow-sm border shrink-0 ${isBanGreater ? 'bg-[#1DB2A0]/15 border-[#1DB2A0]/30' : 'bg-white/20 border-white/30'}`}><div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#5c5c5c]'}`}>Bán</div><div className={`font-bold text-[13px] tabular-nums ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#1D1D1F]'}`}>{formatInput(ss.tong_sl_ban || 0)}</div></div>
                                            <div className="w-[60px] bg-white/20 border border-white/30 rounded-[14px] py-1.5 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Còn</div><div className="font-bold text-[#1D1D1F] text-[13px] tabular-nums">{formatInput(sl_con)}</div></div>
                                        </div>

                                        <div className="flex items-center justify-end gap-3 shrink-0 w-auto pl-2">
                                            <div className="text-right space-y-0.5 hidden xl:block shrink-0 pr-1 min-w-[130px]">
                                                <div className="flex justify-end gap-2 text-[11px]"><span className="text-[#5c5c5c] whitespace-nowrap">Chi phí</span> <span className="font-bold text-[#1D1D1F] tabular-nums">{formatCurrency((ss.so_tien_cua_kien || 0) + (ss.so_tien_giat_ui || 0) + ss.quang_cao)}</span></div>
                                                <div className="flex justify-end gap-2 text-[10px] text-[#5c5c5c]"><span className="whitespace-nowrap">Vốn tồn</span> <span className="font-medium tabular-nums">{formatCurrency(displayVonTon)}</span></div>
                                            </div>
                                            <div className="text-right shrink-0 min-w-[110px]">
                                                <div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-widest mb-0.5 whitespace-nowrap">Lợi Nhuận</div>
                                                <div className={`text-[16px] font-black tabular-nums tracking-tight whitespace-nowrap ${parseFloat(ss.realProfit) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>{formatCurrency(ss.realProfit)}</div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-white/40 ml-1">
                                                {isAdmin && <button onClick={(e) => { e.stopPropagation(); setSalarySession(ss); setShowSalaryModal(true); }} className="p-2 text-[#5c5c5c] bg-white/40 hover:bg-white hover:text-[#1DB2A0] rounded-full transition-colors shadow-sm" title="Phát lương (30%)"><Wallet size={14}/></button>}
                                                {canEdit && <button onClick={(e) => handleStartEditSession(e, ss)} className="p-2 text-[#5c5c5c] bg-white/40 hover:bg-white hover:text-[#33A1FD] rounded-full transition-colors shadow-sm"><Pencil size={14}/></button>}
                                                {canDelete && <button onClick={(e) => handleDeleteSession(e, ss.id)} className="p-2 text-[#5c5c5c] bg-white/40 hover:bg-white hover:text-[#FF3B30] rounded-full transition-colors shadow-sm"><Trash2 size={14}/></button>}
                                                <ChevronRight size={18} className="text-[#8E8E93] ml-1 hidden xl:block" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* ========================================= */}
                                    {/* 2. GIAO DIỆN ĐIỆN THOẠI (Xếp 3 tầng chuẩn App) */}
                                    {/* ========================================= */}
                                    <div className="flex flex-col gap-4 w-full lg:hidden">
                                        
                                        {/* TẦNG 1: Tên & Thời gian */}
                                        <div className="flex items-start gap-3 w-full">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] bg-white/60 border border-white/50 text-[#1D1D1F] shrink-0 shadow-sm">
                                                {safeSessions.length - index}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-[#1D1D1F] text-[16px] leading-snug break-words">
                                                    {sessionName} {index === 0 && <span className="inline-block w-2 h-2 mb-0.5 ml-1 bg-[#1DB2A0] rounded-full shadow-[0_0_8px_rgba(29,178,160,0.6)]"></span>}
                                                </h3>
                                                <div className="text-[12px] text-[#5c5c5c] mt-1 flex items-center gap-1 font-medium">
                                                    <Calendar size={12}/> {calculateDaysDiff(ss.actual_start_date, ss.actual_end_date)} ngày
                                                </div>
                                            </div>
                                        </div>

                                        {/* TẦNG 2: Khu vực hiển thị Nhập - Bán - Còn */}
                                        <div className="bg-white/40 border border-white/50 rounded-[16px] p-3 flex justify-between items-center shadow-sm w-full">
                                            <div className="text-center flex-1 border-r border-white/50">
                                                <div className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1">Nhập</div>
                                                <div className="font-bold text-[#1D1D1F] text-[14px] tabular-nums">{formatInput(ss.tong_sl_nhap || 0)}</div>
                                            </div>
                                            <div className="text-center flex-1 border-r border-white/50">
                                                <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#5c5c5c]'}`}>Bán</div>
                                                <div className={`font-bold text-[14px] tabular-nums ${isBanGreater ? 'text-[#1A5B82] bg-[#1A5B82]/10 rounded-full px-3 inline-block' : 'text-[#1D1D1F]'}`}>{formatInput(ss.tong_sl_ban || 0)}</div>
                                            </div>
                                            <div className="text-center flex-1">
                                                <div className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-1">Còn</div>
                                                <div className="font-bold text-[#1D1D1F] text-[14px] tabular-nums">{formatInput(sl_con)}</div>
                                            </div>
                                        </div>

                                        {/* TẦNG 3: Chi phí, Lợi nhuận và Các Nút Action */}
                                        <div className="flex justify-between items-end w-full">
                                            <div>
                                                <div className="text-[11px] text-[#5c5c5c] mb-1">Chi phí: <span className="font-semibold text-[#1D1D1F]">{formatCurrency((ss.so_tien_cua_kien || 0) + (ss.so_tien_giat_ui || 0) + ss.quang_cao)}đ</span></div>
                                                <div className="text-[11px] text-[#5c5c5c] mb-2">Vốn tồn: <span className="font-semibold text-[#1D1D1F]">{formatCurrency(displayVonTon)}đ</span></div>
                                                
                                                <div className="text-[10px] font-bold text-[#5c5c5c] uppercase tracking-widest mb-0.5">Lợi Nhuận</div>
                                                <div className={`text-[18px] font-black tracking-tight tabular-nums ${parseFloat(ss.realProfit) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>
                                                    {formatCurrency(ss.realProfit)}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {isAdmin && <button onClick={(e) => { e.stopPropagation(); setSalarySession(ss); setShowSalaryModal(true); }} className="w-9 h-9 flex items-center justify-center text-[#5c5c5c] bg-white hover:text-[#1DB2A0] rounded-full shadow-sm border border-gray-100"><Wallet size={14}/></button>}
                                                {canEdit && <button onClick={(e) => handleStartEditSession(e, ss)} className="w-9 h-9 flex items-center justify-center text-[#5c5c5c] bg-white hover:text-[#33A1FD] rounded-full shadow-sm border border-gray-100"><Pencil size={14}/></button>}
                                                {canDelete && <button onClick={(e) => handleDeleteSession(e, ss.id)} className="w-9 h-9 flex items-center justify-center text-[#5c5c5c] bg-white hover:text-[#FF3B30] rounded-full shadow-sm border border-gray-100"><Trash2 size={14}/></button>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
