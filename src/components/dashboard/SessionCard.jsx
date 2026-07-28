import React from 'react';
import { Calendar, Wallet, Pencil, Trash2, ChevronRight } from 'lucide-react';
import { formatCurrency, formatInput, getSessionName } from '../../utils';

export default function SessionCard({
    session, index, totalCount, fetchDetail,
    canPay, canEdit, canDelete,
    setSalarySession, setShowSalaryModal, handleStartEditSession, handleDeleteSession
}) {
    const isLoss = session.realProfit < 0;

    return (
        <div 
            onClick={() => fetchDetail(session.id)}
            className="bg-white/60 hover:bg-white border border-white/80 shadow-sm hover:shadow-md rounded-[24px] p-4 md:p-5 transition-all cursor-pointer flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-6 relative group"
        >
            <div className="flex items-center gap-3 md:gap-4 min-w-0 xl:w-[25%] shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-[13px] md:text-[14px] bg-white border border-gray-100 shadow-sm text-[#1D1D1F] shrink-0 tabular-nums">
                    {totalCount - index}
                </div>
                <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-[#1D1D1F] text-[14px] md:text-[15px] truncate flex items-center gap-2 group-hover:text-[#1A5B82] transition-colors">
                        {getSessionName(session.name, session.actual_start_date, session.actual_end_date)}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] md:text-[12px] text-[#5c5c5c] font-medium mt-1">
                        <Calendar size={12} />
                        <span>{Math.max(0, Math.ceil((new Date(session.actual_end_date) - new Date(session.actual_start_date)) / (1000 * 60 * 60 * 24)))} ngày</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between xl:justify-center gap-2 md:gap-3 xl:w-[25%] shrink-0 pl-12 md:pl-16 xl:pl-0 w-full xl:w-auto">
                <div className="flex-1 xl:flex-none xl:w-[65px] bg-white/70 border border-gray-200/60 rounded-[14px] py-2 text-center shadow-sm">
                    <div className="text-[9px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Nhập</div>
                    <div className="font-bold text-[#1D1D1F] text-[13px] md:text-[14px] tabular-nums">{formatInput(session.tong_sl_nhap || 0)}</div>
                </div>
                <div className="flex-1 xl:flex-none xl:w-[65px] bg-[#1DB2A0]/10 border border-[#1DB2A0]/20 rounded-[14px] py-2 text-center shadow-sm">
                    <div className="text-[9px] font-bold text-[#1A5B82] uppercase tracking-wider mb-0.5 whitespace-nowrap">Bán</div>
                    <div className="font-bold text-[#1A5B82] text-[13px] md:text-[14px] tabular-nums">{formatInput(session.tong_sl_ban || 0)}</div>
                </div>
                <div className="flex-1 xl:flex-none xl:w-[65px] bg-white/70 border border-gray-200/60 rounded-[14px] py-2 text-center shadow-sm">
                    <div className="text-[9px] font-bold text-[#5c5c5c] uppercase tracking-wider mb-0.5 whitespace-nowrap">Còn</div>
                    <div className="font-bold text-[#1D1D1F] text-[13px] md:text-[14px] tabular-nums">{formatInput((session.tong_sl_nhap || 0) - (session.tong_sl_ban || 0))}</div>
                </div>
            </div>

            <div className="flex flex-col justify-center xl:w-[20%] shrink-0 pl-12 md:pl-16 xl:pl-0 w-full xl:w-auto">
                <div className="flex items-center justify-between xl:justify-start gap-2 text-[11px] md:text-[12px]">
                    <span className="text-[#5c5c5c]">Chi phí</span>
                    <span className="font-bold text-[#1D1D1F] tabular-nums">{formatCurrency((session.so_tien_cua_kien || 0) + (session.so_tien_giat_ui || 0) + session.autoAdCost)}</span>
                </div>
                <div className="flex items-center justify-between xl:justify-start gap-2 text-[10px] md:text-[11px] mt-1 xl:mt-0.5">
                    <span className="text-[#8E8E93]">Vốn tồn</span>
                    <span className="font-medium text-[#5c5c5c] tabular-nums">{formatCurrency(session.tong_tien_ton_computed || 0)}</span>
                </div>
            </div>

            <div className="flex items-center justify-between xl:justify-end gap-4 w-full xl:w-[30%] pl-12 md:pl-16 xl:pl-0 border-t xl:border-none border-gray-200/60 pt-3 xl:pt-0 mt-1 xl:mt-0">
                <div className="text-left xl:text-right shrink-0 min-w-[100px]">
                    <div className="text-[9px] font-bold text-[#5c5c5c] uppercase tracking-widest mb-0.5">Lợi Nhuận</div>
                    <div className={`text-[15px] md:text-[18px] font-black tabular-nums tracking-tight ${isLoss ? 'text-[#FF453A]' : 'text-[#1DB2A0]'}`}>
                        {formatCurrency(session.realProfit)}
                    </div>
                </div>

                <div className="flex items-center gap-1.5 md:gap-2 shrink-0 xl:border-l border-gray-200/80 xl:pl-3 ml-auto">
                    {canPay && (
                        <button onClick={(e) => { e.stopPropagation(); setSalarySession(session); setShowSalaryModal(true); }} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#5c5c5c] bg-white hover:bg-white hover:text-[#1DB2A0] rounded-full transition-all shadow-sm border border-gray-100 hover:scale-105 active:scale-95" title="Phát lương">
                            <Wallet size={14}/>
                        </button>
                    )}
                    {canEdit && (
                        <button onClick={(e) => handleStartEditSession(e, session)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#5c5c5c] bg-white hover:bg-white hover:text-[#33A1FD] rounded-full transition-all shadow-sm border border-gray-100 hover:scale-105 active:scale-95" title="Sửa">
                            <Pencil size={14}/>
                        </button>
                    )}
                    {canDelete && (
                        <button onClick={(e) => handleDeleteSession(e, session.id)} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#5c5c5c] bg-white hover:bg-[#FF3B30]/10 hover:text-[#FF3B30] rounded-full transition-all shadow-sm border border-gray-100 hover:scale-105 active:scale-95" title="Xóa">
                            <Trash2 size={14}/>
                        </button>
                    )}
                    <div className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#8E8E93] bg-white rounded-full shadow-sm border border-gray-100 group-hover:text-[#1D1D1F] transition-colors ml-1 hidden sm:flex">
                        <ChevronRight size={16}/>
                    </div>
                </div>
            </div>
        </div>
    );
}