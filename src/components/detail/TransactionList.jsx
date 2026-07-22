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
    isProcessingEdit, isProcessingDelete, handleStartEdit, handleDeleteRow,
    importedBales // ĐÃ THÊM PROP NÀY ĐỂ TÍNH GIÁ TRUNG BÌNH CHÍNH XÁC
}) {
    // TÍNH LẠI GIÁ TRUNG BÌNH Ở ĐÂY ĐỂ DÙNG CHO CÔNG THỨC BÊN DƯỚI
    const tongTienKien = (importedBales || []).reduce((acc, b) => acc + (Number(b.cost) || 0), 0) || (detailData?.so_tien_cua_kien || 0);
    const tongSlKien = (importedBales || []).reduce((acc, b) => acc + (Number(b.qty) || 0), 0) || (detailData?.computed?.tong_sl_nhap || 1);
    const avgPrice = tongSlKien > 0 ? tongTienKien / tongSlKien : 0;

    return (
        <div className="liquid-glass bg-white/50 backdrop-blur-xl rounded-[32px] md:rounded-[40px] p-4 sm:p-8 min-w-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80">
            <div className="flex justify-between items-center mb-6 md:mb-8 px-2">
                <h2 className="text-[18px] md:text-[24px] font-black text-[#1D1D1F] tracking-tight">Chi tiết sản phẩm</h2>
                <span className="text-[12px] md:text-[14px] font-bold bg-white/90 border border-gray-200/60 text-[#1D1D1F] px-4 py-1.5 rounded-full shadow-sm">
                    {(detailData?.daily || []).length} mục
                </span>
            </div>
            
            <div className="flex flex-col gap-4 min-w-0">
                {(enrichedDaily || []).map((row, index) => {
                    if (!row) return null;
                    const isBanGreater = (row.so_luong || 0) > (row.sl_con || 0);
                    const isMVP = row.id === mvpRowId && index !== 0; 
                    
                    // CÔNG THỨC LỜI TRUNG BÌNH MỚI: Doanh thu - (SL Nhập * Giá TB + 350.000)
                    const loiTrungBinh = (row.so_tien_ban_duoc || 0) - ((row.sl_nhap || 0) * avgPrice + 350000);
                    
                    return (
                        <div 
                            key={row.id || index} 
                            className={`group relative bg-white/70 hover:bg-white backdrop-blur-md rounded-[20px] md:rounded-[28px] p-4 transition-all duration-500 ease-out flex flex-col xl:flex-row xl:flex-wrap items-start xl:items-center justify-between gap-4 xl:gap-5 w-full min-w-0 overflow-hidden ${isMVP ? 'border-2 border-[#FF9500]/50 shadow-[0_8px_24px_rgba(255,149,0,0.15)]' : 'border border-white/80 hover:shadow-[0_15px_40px_rgba(38,208,206,0.12)] hover:border-[#26D0CE]/30'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#26D0CE]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                            {/* KHỐI TRÁI: Thông tin SP */}
                            <div className="flex items-center gap-3 w-full xl:w-auto xl:flex-1 min-w-[200px] relative z-10">
                                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center font-black text-[13px] md:text-[14px] shrink-0 tabular-nums shadow-sm ${isMVP ? 'bg-gradient-to-br from-[#FF9500] to-[#FFCC00] text-white' : 'bg-gradient-to-br from-gray-100 to-white text-gray-600 border border-gray-200/50'}`}>
                                    {row.stt || 0}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-2 min-w-0 mb-1">
                                        {isMVP && <Crown size={14} className="text-[#FF9500] shrink-0 drop-shadow-sm" />}
                                        <h3 className="font-bold text-[#1D1D1F] text-[14px] md:text-[15px] truncate">{row.ten_san_pham || '---'}</h3>
                                        {row.link_san_pham && (
                                            <a href={row.link_san_pham} target="_blank" rel="noopener noreferrer" className="text-[#33A1FD] hover:text-white hover:bg-[#33A1FD] bg-blue-50/80 p-1.5 rounded-full shrink-0 transition-colors shadow-sm">
                                                <LinkIcon size={12}/>
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-[11px] font-medium text-gray-500">
                                        <span className="flex items-center gap-1 bg-gray-100/50 px-2 py-0.5 rounded-md"><Calendar size={10} className="text-gray-400" /> {formatDateDisplay(row.ngay_ban)}</span>
                                        <span className="flex items-center gap-1 text-[#1A5B82] bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100/50">
                                            <Clock size={10} className="text-blue-400" /> {formatDateTime(row.updatedAt || row.ngay_ban)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* KHỐI PHẢI: Số liệu & Tài chính */}
                            <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-between xl:justify-end gap-4 w-full xl:w-auto border-t xl:border-none border-gray-200/60 pt-3 xl:pt-0 relative z-10 shrink-0">
                                
                                {/* 2.1 Các ô Nhập Bán Còn */}
                                <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                                    <div className="w-[55px] md:w-[65px] bg-gray-50/80 border border-gray-200/60 rounded-[14px] py-1.5 text-center group-hover:bg-white transition-colors shadow-sm">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Nhập</div>
                                        <div className="font-black text-gray-800 text-[13px] md:text-[14px] tabular-nums">{formatInput(row.sl_nhap || 0)}</div>
                                    </div>
                                    <div className={`w-[55px] md:w-[65px] border rounded-[14px] py-1.5 text-center transition-colors shadow-sm ${isBanGreater ? 'bg-teal-50/80 border-teal-200/60 group-hover:bg-teal-50' : 'bg-gray-50/80 border-gray-200/60 group-hover:bg-white'}`}>
                                        <div className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${isBanGreater ? 'text-teal-600' : 'text-gray-400'}`}>Bán</div>
                                        <div className={`font-black text-[13px] md:text-[14px] tabular-nums ${isBanGreater ? 'text-teal-700' : 'text-gray-800'}`}>{formatInput(row.so_luong || 0)}</div>
                                    </div>
                                    <div className="w-[55px] md:w-[65px] bg-gray-50/80 border border-gray-200/60 rounded-[14px] py-1.5 text-center group-hover:bg-white transition-colors shadow-sm">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Còn</div>
                                        <div className="font-black text-gray-800 text-[13px] md:text-[14px] tabular-nums">{formatInput(row.sl_con || 0)}</div>
                                    </div>
                                </div>

                                {/* 2.2 Tài chính & Nút bấm */}
                                <div className="flex flex-wrap xs:flex-nowrap items-center justify-between sm:justify-end gap-3 md:gap-5 w-full sm:w-auto shrink-0 pl-0 sm:border-l border-gray-200/60 sm:pl-4 mt-2 sm:mt-0">
                                    
                                    <div className="flex flex-col justify-center text-left sm:text-right shrink-0">
                                        <div className="flex items-center sm:justify-end gap-1.5 text-[11px] md:text-[12px]">
                                            <span className="text-gray-400 font-bold whitespace-nowrap">D.thu</span>
                                            <span className="font-black text-gray-800 tabular-nums">+{formatCurrency(row.so_tien_ban_duoc || 0)}</span>
                                        </div>
                                        <div className="flex items-center sm:justify-end gap-1.5 text-[10px] md:text-[11px] mt-0.5">
                                            <span className="text-gray-400 font-bold whitespace-nowrap">V.tồn</span>
                                            <span className="font-bold text-gray-500 tabular-nums">{formatCurrency(row.tien_ton || 0)}</span>
                                        </div>
                                        
                                        {/* HIỂN THỊ LỜI TRUNG BÌNH */}
                                        <div className="flex items-center sm:justify-end gap-1.5 text-[10px] md:text-[11px] mt-1 bg-gray-50/80 px-2 py-0.5 rounded border border-gray-100 shadow-sm w-fit sm:ml-auto">
                                            <span className="text-gray-500 font-bold whitespace-nowrap">Lời TB</span>
                                            <span className={`font-black tabular-nums ${loiTrungBinh >= 0 ? "text-teal-600" : "text-rose-600"}`}>
                                                {loiTrungBinh >= 0 ? "+" : ""}{formatCurrency(loiTrungBinh)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex flex-col items-start sm:items-end min-w-[70px]">
                                            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Lợi Nhuận</div>
                                            <div className={`text-[15px] md:text-[16px] font-black tracking-tight tabular-nums ${parseFloat(row.loi || 0) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>
                                                {formatCurrency(row.loi || 0)}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 bg-gray-50/80 p-1 rounded-full border border-gray-200/50">
                                            {canEdit && (
                                                <button onClick={(e) => { e.stopPropagation(); handleStartEdit(row); }} disabled={isProcessingEdit || isProcessingDelete} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-gray-400 hover:text-[#33A1FD] hover:bg-white hover:shadow-sm rounded-full transition-all active:scale-90" title="Sửa bản ghi">
                                                    <Pencil size={14} strokeWidth={2.5}/>
                                                </button>
                                            )}
                                            {canDelete && (
                                                <button onClick={(e) => { e.stopPropagation(); handleDeleteRow(row.id); }} disabled={isProcessingEdit || isProcessingDelete} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white hover:shadow-sm rounded-full transition-all active:scale-90" title="Xóa bản ghi">
                                                    <Trash2 size={14} strokeWidth={2.5}/>
                                                </button>
                                            )}
                                        </div>
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