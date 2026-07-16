import React from 'react';
import { Crown, Link as LinkIcon, Pencil, Trash2, Calendar, Clock } from 'lucide-react';
import { formatCurrency, formatInput, formatDateDisplay } from '../../utils';

const formatDateTime = (dateString) => {
    try {
        if (!dateString) return '---';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '---';
        const hh = String(d.getHours()).padStart(2, '0');
        const mm = String(d.getMinutes()).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        return `${hh}:${mm} ${dd}/${mo}`;
    } catch (e) { return '---'; }
};

export default function TransactionList({
    enrichedDaily, detailData, mvpRowId, canEdit, canDelete,
    isProcessingEdit, isProcessingDelete, handleStartEdit, handleDeleteRow
}) {
    return (
        <div className="liquid-glass bg-white/50 backdrop-blur-xl rounded-[32px] md:rounded-[40px] p-5 sm:p-8 min-w-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80">
            <div className="flex justify-between items-center mb-6 md:mb-8 px-2">
                <h2 className="text-[20px] md:text-[24px] font-black text-[#1D1D1F] tracking-tight">Chi tiết sản phẩm</h2>
                <span className="text-[13px] md:text-[14px] font-bold bg-white/90 border border-gray-200/60 text-[#1D1D1F] px-4 py-1.5 rounded-full shadow-sm">
                    {(detailData?.daily || []).length} mục
                </span>
            </div>
            
            <div className="flex flex-col gap-4 min-w-0">
                {(enrichedDaily || []).map((row, index) => {
                    if (!row) return null;
                    const isBanGreater = (row.so_luong || 0) > (row.sl_con || 0);
                    const isMVP = row.id === mvpRowId && index !== 0; 
                    
                    return (
                        <div 
                            key={row.id || index} 
                            // SỬ DỤNG CSS GRID (LƯỚI) ĐỂ KHÓA CHẶT BỐ CỤC, CHỐNG ĐÈ CHỮ
                            className={`group relative bg-white/70 hover:bg-white backdrop-blur-md rounded-[24px] md:rounded-[28px] p-4 md:p-5 transition-all duration-500 ease-out grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-center w-full min-w-0 overflow-hidden ${isMVP ? 'border-2 border-[#FF9500]/50 shadow-[0_8px_24px_rgba(255,149,0,0.15)]' : 'border border-white/80 hover:shadow-[0_15px_40px_rgba(38,208,206,0.12)] hover:border-[#26D0CE]/30'}`}
                        >
                            {/* Hiệu ứng tia sáng chạy ngang khi Hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#26D0CE]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            {/* CỘT 1: THÔNG TIN (Chiếm 4/12 Grid trên Desktop) */}
                            <div className="lg:col-span-5 xl:col-span-4 flex items-center gap-3 md:gap-4 min-w-0 relative z-10">
                                <div className={`w-11 h-11 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-[14px] md:text-[15px] shrink-0 tabular-nums shadow-sm ${isMVP ? 'bg-gradient-to-br from-[#FF9500] to-[#FFCC00] text-white' : 'bg-gradient-to-br from-gray-100 to-white text-gray-600 border border-gray-200/50'}`}>
                                    {row.stt || 0}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-2 min-w-0 mb-1">
                                        {isMVP && <Crown size={16} className="text-[#FF9500] shrink-0 drop-shadow-sm" />}
                                        <h3 className="font-bold text-[#1D1D1F] text-[15px] md:text-[16px] truncate">{row.ten_san_pham || '---'}</h3>
                                        {row.link_san_pham && (
                                            <a href={row.link_san_pham} target="_blank" rel="noopener noreferrer" className="text-[#33A1FD] hover:text-white hover:bg-[#33A1FD] bg-blue-50/80 p-1.5 rounded-full shrink-0 transition-colors shadow-sm">
                                                <LinkIcon size={12}/>
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[11px] md:text-[12px] font-medium text-gray-500">
                                        <span className="flex items-center gap-1.5 bg-gray-100/50 px-2 py-0.5 rounded-md"><Calendar size={12} className="text-gray-400" /> {formatDateDisplay(row.ngay_ban)}</span>
                                        <span className="flex items-center gap-1.5 text-[#1A5B82] bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100/50">
                                            <Clock size={12} className="text-blue-400" /> Cập nhật: {formatDateTime(row.updatedAt || row.ngay_ban)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* CỘT 2: SỐ LIỆU (Chiếm 3/12 Grid trên Desktop) */}
                            <div className="lg:col-span-3 xl:col-span-3 flex items-center justify-between lg:justify-center gap-2 relative z-10 border-t lg:border-none border-gray-200/60 pt-4 lg:pt-0">
                                <div className="w-[70px] xl:w-[75px] bg-gray-50/80 border border-gray-200/60 rounded-[16px] py-2 md:py-2.5 text-center group-hover:bg-white transition-colors shadow-sm">
                                    <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Nhập</div>
                                    <div className="font-black text-gray-800 text-[14px] md:text-[15px] tabular-nums">{formatInput(row.sl_nhap || 0)}</div>
                                </div>
                                <div className={`w-[70px] xl:w-[75px] border rounded-[16px] py-2 md:py-2.5 text-center transition-colors shadow-sm ${isBanGreater ? 'bg-teal-50/80 border-teal-200/60 group-hover:bg-teal-50' : 'bg-gray-50/80 border-gray-200/60 group-hover:bg-white'}`}>
                                    <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-wider mb-0.5 ${isBanGreater ? 'text-teal-600' : 'text-gray-400'}`}>Bán</div>
                                    <div className={`font-black text-[14px] md:text-[15px] tabular-nums ${isBanGreater ? 'text-teal-700' : 'text-gray-800'}`}>{formatInput(row.so_luong || 0)}</div>
                                </div>
                                <div className="w-[70px] xl:w-[75px] bg-gray-50/80 border border-gray-200/60 rounded-[16px] py-2 md:py-2.5 text-center group-hover:bg-white transition-colors shadow-sm">
                                    <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Còn</div>
                                    <div className="font-black text-gray-800 text-[14px] md:text-[15px] tabular-nums">{formatInput(row.sl_con || 0)}</div>
                                </div>
                            </div>

                            {/* CỘT 3: TÀI CHÍNH & HÀNH ĐỘNG (Chiếm 4/12 Grid trên Desktop) */}
                            <div className="lg:col-span-4 xl:col-span-5 flex items-center justify-between lg:justify-end gap-3 lg:gap-6 relative z-10 border-t lg:border-none border-gray-200/60 pt-4 lg:pt-0">
                                
                                <div className="flex flex-col justify-center text-left lg:text-right shrink-0">
                                    <div className="flex items-center lg:justify-end gap-2 text-[12px] md:text-[13px]">
                                        <span className="text-gray-400 font-bold whitespace-nowrap">D.thu</span>
                                        <span className="font-black text-gray-800 tabular-nums">+{formatCurrency(row.so_tien_ban_duoc || 0)}</span>
                                    </div>
                                    <div className="flex items-center lg:justify-end gap-2 text-[11px] md:text-[12px] mt-0.5">
                                        <span className="text-gray-400 font-bold whitespace-nowrap">V.tồn</span>
                                        <span className="font-bold text-gray-500 tabular-nums">{formatCurrency(row.tien_ton || 0)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 md:gap-4 shrink-0 lg:border-l border-gray-200/60 lg:pl-4">
                                    <div className="flex flex-col items-start lg:items-end min-w-[80px]">
                                        <div className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Lợi Nhuận</div>
                                        <div className={`text-[16px] md:text-[18px] font-black tracking-tight tabular-nums ${parseFloat(row.loi || 0) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>
                                            {formatCurrency(row.loi || 0)}
                                        </div>
                                    </div>

                                    {/* Action Buttons: Kích thước chuẩn 44px */}
                                    <div className="flex items-center gap-1.5 bg-gray-50/80 p-1 rounded-full border border-gray-200/50">
                                        {canEdit && (
                                            <button onClick={(e) => { e.stopPropagation(); handleStartEdit(row); }} disabled={isProcessingEdit || isProcessingDelete} className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-gray-400 hover:text-[#33A1FD] hover:bg-white hover:shadow-sm rounded-full transition-all active:scale-90" title="Sửa bản ghi">
                                                <Pencil size={16} strokeWidth={2.5}/>
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteRow(row.id); }} disabled={isProcessingEdit || isProcessingDelete} className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white hover:shadow-sm rounded-full transition-all active:scale-90" title="Xóa bản ghi">
                                                <Trash2 size={16} strokeWidth={2.5}/>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}