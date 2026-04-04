import React from 'react';
import { Calendar, Package, Percent, BarChart3, ChevronRight, Wallet, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatInput, getSessionName, AnimatedNumber } from '../utils';

export default function DashboardView({ 
    dashboardProfit, globalTongCon, globalTongNhap, globalVonTon, showTax, taxAmount, displayRevenueTr, 
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

            <div className="liquid-glass rounded-[32px] overflow-hidden min-w-0">
                <div className="px-5 md:px-6 py-4 border-b border-white/30 flex justify-between items-center bg-white/10">
                    <h2 className="text-[17px] md:text-[18px] font-bold text-[#1D1D1F] tracking-tight">Danh sách đợt bán</h2>
                    <span className="text-[12px] font-bold bg-white/40 text-[#1D1D1F] border border-white/40 px-2.5 py-0.5 rounded-full">{safeSessions.length}</span>
                </div>
                <div className="flex flex-col divide-y divide-white/30 w-full min-w-0 overflow-x-auto custom-scrollbar">
                    <div className="min-w-[850px]">
                        {enrichedSessions.map((ss, index) => {
                            if (!ss) return null;
                            const sl_con = (ss.tong_sl_nhap || 0) - (ss.tong_sl_ban || 0);
                            const isBanGreater = (ss.tong_sl_ban || 0) > sl_con;
                            let displayVonTon = ss.tong_tien_ton_computed || 0;
                            const sessionName = getSessionName(ss.name, ss.actual_start_date, ss.actual_end_date);
                            return (
                                <div key={ss.id || index} onClick={() => fetchDetail(ss.id)} className="p-4 md:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 cursor-pointer bg-transparent hover:bg-white/20 transition-colors duration-300 w-full min-w-0">
                                    
                                    <div className="hidden lg:flex items-center w-full min-w-0">
                                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[13px] bg-white/40 border border-white/50 text-[#1D1D1F] tabular-nums shrink-0 shadow-sm">{safeSessions.length - index}</div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 mb-0.5"><h3 className="font-bold text-[#1D1D1F] text-[13px] leading-snug truncate group-hover:text-[#1A5B82] transition-colors">{sessionName}</h3></div>
                                                <div className="text-[11px] text-[#5c5c5c] font-medium tabular-nums flex items-center gap-1"><Calendar size={11}/> {calculateDaysDiff(ss.actual_start_date, ss.actual_end_date)} ngày</div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-center gap-2 shrink-0">
                                            <div className="w-[60px] bg-white/20 border border-white/30 rounded-[14px] py-1.5 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Nhập</div><div className="font-bold text-[#1D1D1F] text-[13px] tabular-nums">{ss.tong_sl_nhap || 0}</div></div>
                                            <div className={`w-[60px] rounded-[14px] py-1.5 text-center shadow-sm border shrink-0 ${isBanGreater ? 'bg-[#1DB2A0]/15 border-[#1DB2A0]/30' : 'bg-white/20 border-white/30'}`}><div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#5c5c5c]'}`}>Bán</div><div className={`font-bold text-[13px] tabular-nums ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#1D1D1F]'}`}>{ss.tong_sl_ban || 0}</div></div>
                                            <div className="w-[60px] bg-white/20 border border-white/30 rounded-[14px] py-1.5 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Còn</div><div className="font-bold text-[#1D1D1F] text-[13px] tabular-nums">{sl_con}</div></div>
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
                                                {canEdit && <button onClick={(e) => handleStartEditSession(e, ss)} className="p-2 text-[#5c5c5c] bg-white/40 hover:bg-white rounded-full transition-colors shadow-sm"><Pencil size={14}/></button>}
                                                {canDelete && <button onClick={(e) => handleDeleteSession(e, ss.id)} className="p-2 text-[#5c5c5c] bg-white/40 hover:bg-white hover:text-[#FF3B30] rounded-full transition-colors shadow-sm"><Trash2 size={14}/></button>}
                                                <ChevronRight size={18} className="text-[#8E8E93] ml-1 hidden xl:block" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3.5 w-full lg:hidden min-w-0">
                                        <div className="flex items-start gap-3 w-full min-w-0">
                                            <div className="w-10 h-10 mt-0.5 rounded-full flex items-center justify-center font-bold text-[14px] bg-white/40 border border-white/50 text-[#1D1D1F] tabular-nums shrink-0 shadow-sm">{safeSessions.length - index}</div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 mb-1"><h3 className="font-bold text-[#1D1D1F] text-[15px] leading-snug break-words whitespace-normal group-hover:text-[#1A5B82] transition-colors">{sessionName}</h3></div>
                                                <div className="text-[12px] text-[#5c5c5c] font-medium tabular-nums flex items-center gap-1 mb-1.5"><Calendar size={12}/> {calculateDaysDiff(ss.actual_start_date, ss.actual_end_date)} ngày</div>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#5c5c5c]">
                                                    <span>C.phí: <strong className="text-[#1D1D1F]">{formatCurrency((ss.so_tien_cua_kien || 0) + (ss.so_tien_giat_ui || 0) + ss.quang_cao)}</strong></span>
                                                    <span>V.tồn: <strong className="text-[#1D1D1F]">{formatCurrency(displayVonTon)}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-white/20 pt-3 min-w-0">
                                            <div className="flex gap-1.5 shrink-0">
                                                <div className="w-[42px] bg-white/20 border border-white/30 rounded-[10px] py-1 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Nhập</div><div className="font-bold text-[#1D1D1F] text-[11px] tabular-nums">{ss.tong_sl_nhap || 0}</div></div>
                                                <div className={`w-[42px] rounded-[10px] py-1 text-center shadow-sm border shrink-0 ${isBanGreater ? 'bg-[#1DB2A0]/15 border-[#1DB2A0]/30' : 'bg-white/20 border-white/30'}`}><div className={`text-[8px] font-bold uppercase tracking-wider mb-0.5 whitespace-nowrap ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#5c5c5c]'}`}>Bán</div><div className={`font-bold text-[11px] tabular-nums ${isBanGreater ? 'text-[#1A5B82]' : 'text-[#1D1D1F]'}`}>{ss.tong_sl_ban || 0}</div></div>
                                                <div className="w-[42px] bg-white/20 border border-white/30 rounded-[10px] py-1 text-center shadow-sm shrink-0"><div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Còn</div><div className="font-bold text-[#1D1D1F] text-[11px] tabular-nums">{sl_con}</div></div>
                                            </div>
                                            <div className="text-right shrink-1 min-w-0 flex-1 px-1.5">
                                                <div className="text-[8px] font-bold text-[#5c5c5c] uppercase tracking-widest mb-0.5 whitespace-nowrap">Lợi Nhuận</div>
                                                <div className={`text-[14px] sm:text-[15px] font-black tabular-nums tracking-tighter whitespace-nowrap ${parseFloat(ss.realProfit) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>{formatCurrency(ss.realProfit)}</div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0 pl-1 border-l border-white/40 ml-1">
                                                {isAdmin && <button onClick={(e) => { e.stopPropagation(); setSalarySession(ss); setShowSalaryModal(true); }} className="p-1.5 text-[#5c5c5c] bg-white/30 hover:bg-white hover:text-[#1DB2A0] rounded-full transition-colors shadow-sm"><Wallet size={12}/></button>}
                                                {canEdit && <button onClick={(e) => handleStartEditSession(e, ss)} className="p-1.5 text-[#5c5c5c] bg-white/30 hover:bg-white rounded-full transition-colors shadow-sm"><Pencil size={12}/></button>}
                                                {canDelete && <button onClick={(e) => handleDeleteSession(e, ss.id)} className="p-1.5 text-[#5c5c5c] bg-white/30 hover:bg-white hover:text-[#FF3B30] rounded-full transition-colors shadow-sm"><Trash2 size={12}/></button>}
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