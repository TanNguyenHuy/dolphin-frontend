import React from 'react';
import { Calendar, Wallet, Pencil, Trash2, ChevronRight, Tag } from 'lucide-react';
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
            className="bg-white/60 hover:bg-white border border-white/80 shadow-sm hover:shadow-md rounded-[24px] p-4 md:p-5 transition-all cursor-pointer flex flex-col xl:flex-row xl:items-center justify-between gap-4 relative group"
        >
            {/* 1. KHỐI TRÁI: STT & Tên Đợt Bán (ĐÃ SỬA LẠI ĐỂ CHỮ XUỐNG DÒNG, KHÔNG BỊ CẮT) */}
            <div className="flex items-center gap-3 md:gap-4 min-w-[200px] lg:min-w-[250px] flex-1">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-[13px] md:text-[14px] bg-white border border-gray-100 shadow-sm text-[#1D1D1F] shrink-0 tabular-nums">
                    {totalCount - index}
                </div>
                <div className="min-w-0 pr-2 md:pr-4 flex-1">
                    {/* Bỏ truncate, thay bằng line-clamp-2, giảm size chữ một chút và cho phép rớt dòng */}
                    <h3 className="font-bold text-[#1D1D1F] text-[13px] md:text-[14px] leading-snug line-clamp-2 break-words group-hover:text-[#1A5B82] transition-colors">
                        {getSessionName(session.name, session.actual_start_date, session.actual_end_date)}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] md:text-[12px] text-gray-500 font-medium mt-1">
                        <Calendar size={12} />
                        <span>{Math.max(0, Math.ceil((new Date(session.actual_end_date) - new Date(session.actual_start_date)) / (1000 * 60 * 60 * 24)))} ngày</span>
                    </div>
                </div>
            </div>

            {/* KHỐI PHẢI: Wrapper chứa tất cả số liệu */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 xl:gap-8 shrink-0 w-full xl:w-auto pl-12 md:pl-[60px] xl:pl-0">
                
                {/* Khu vực Nhập - Bán - Còn */}
                <div className="flex gap-2 shrink-0">
                    <div className="w-[60px] bg-white/70 border border-gray-200/60 rounded-[12px] py-1.5 text-center shadow-sm">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Nhập</div>
                        <div className="font-black text-gray-700 text-[13px] tabular-nums">{formatInput(session.tong_sl_nhap || 0)}</div>
                    </div>
                    <div className="w-[60px] bg-teal-50/40 border border-teal-100/60 rounded-[12px] py-1.5 text-center shadow-sm">
                        <div className="text-[9px] font-black text-teal-600 uppercase tracking-wider mb-0.5">Bán</div>
                        <div className="font-black text-teal-700 text-[13px] tabular-nums">{formatInput(session.tong_sl_ban || 0)}</div>
                    </div>
                    <div className="w-[60px] bg-white/70 border border-gray-200/60 rounded-[12px] py-1.5 text-center shadow-sm">
                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Còn</div>
                        <div className="font-black text-gray-700 text-[13px] tabular-nums">{formatInput((session.tong_sl_nhap || 0) - (session.tong_sl_ban || 0))}</div>
                    </div>
                </div>

                {/* Khu vực Chi Phí */}
                <div className="flex flex-col gap-1.5 shrink-0 xl:border-l xl:border-gray-200/60 xl:pl-6 min-w-[145px]">
                    <div className="flex justify-between items-center gap-3 text-[12px]">
                        <span className="text-gray-500 font-bold">Chi phí</span>
                        <span className="font-black text-[#1D1D1F] tabular-nums">{formatCurrency((session.so_tien_cua_kien || 0) + (session.so_tien_giat_ui || 0) + session.autoAdCost)}<span className="text-[10px] text-gray-400 ml-0.5">đ</span></span>
                    </div>
                    <div className="flex justify-between items-center gap-3 text-[11px]">
                        <span className="text-gray-400 font-bold">Vốn tồn</span>
                        <span className="font-bold text-gray-500 tabular-nums">{formatCurrency(session.tong_tien_ton_computed || 0)}<span className="text-[9px] text-gray-400 ml-0.5">đ</span></span>
                    </div>
                    <div className="flex justify-between items-center gap-3 text-[11px] mt-0.5 pt-1.5 border-t border-gray-100">
                        <span className="text-orange-500 font-bold flex items-center gap-1"><Tag size={10}/> Giá TB</span>
                        <span className="font-black text-orange-500 tabular-nums">{formatCurrency(session.avgPrice || 0)}<span className="text-[9px] text-orange-400 ml-0.5">đ</span></span>
                    </div>
                </div>

                {/* Khu vực Lợi Nhuận & Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-5 xl:border-l xl:border-gray-200/60 xl:pl-6 pt-3 md:pt-0 border-t border-gray-100 md:border-none w-full md:w-auto mt-2 md:mt-0">
                    
                    <div className="text-left md:text-right shrink-0 min-w-[110px]">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Lợi Nhuận</div>
                        <div className={`text-[16px] md:text-[20px] font-black tabular-nums tracking-tight ${isLoss ? 'text-rose-500' : 'text-[#1DB2A0]'}`}>
                            {formatCurrency(session.realProfit)}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 md:gap-2 shrink-0 bg-gray-50/80 p-1.5 rounded-full border border-gray-200/50">
                        {canPay && (
                            <button onClick={(e) => { e.stopPropagation(); setSalarySession(session); setShowSalaryModal(true); }} className="w-8 h-8 flex items-center justify-center text-gray-400 bg-white hover:text-teal-600 rounded-full transition-all shadow-sm border border-gray-200/60 hover:border-teal-200 active:scale-95" title="Phát lương">
                                <Wallet size={14} strokeWidth={2.5}/>
                            </button>
                        )}
                        {canEdit && (
                            <button onClick={(e) => handleStartEditSession(e, session)} className="w-8 h-8 flex items-center justify-center text-gray-400 bg-white hover:text-blue-500 rounded-full transition-all shadow-sm border border-gray-200/60 hover:border-blue-200 active:scale-95" title="Sửa">
                                <Pencil size={14} strokeWidth={2.5}/>
                            </button>
                        )}
                        {canDelete && (
                            <button onClick={(e) => handleDeleteSession(e, session.id)} className="w-8 h-8 flex items-center justify-center text-gray-400 bg-white hover:bg-rose-50 hover:text-rose-500 rounded-full transition-all shadow-sm border border-gray-200/60 hover:border-rose-200 active:scale-95" title="Xóa">
                                <Trash2 size={14} strokeWidth={2.5}/>
                            </button>
                        )}
                        <div className="w-8 h-8 flex items-center justify-center text-gray-300 group-hover:text-gray-600 transition-colors hidden sm:flex">
                            <ChevronRight size={18}/>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}