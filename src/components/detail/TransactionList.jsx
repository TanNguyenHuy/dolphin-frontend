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
        <div className="liquid-glass bg-white/40 rounded-[40px] p-4 sm:p-8 md:p-10 min-w-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/60">
            <div className="flex justify-between items-center mb-8 px-2">
                <h2 className="text-[20px] md:text-[24px] font-black text-[#1D1D1F] tracking-tight">Chi tiết sản phẩm</h2>
                <span className="text-[14px] font-bold bg-white/80 backdrop-blur-md border border-gray-200 text-[#1D1D1F] px-4 py-1.5 rounded-full shadow-sm">
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
                            className={`group bg-white/60 hover:bg-white/95 backdrop-blur-sm rounded-[28px] p-5 transition-all duration-300 ease-out flex flex-col xl:flex-row xl:items-center justify-between gap-5 xl:gap-8 w-full min-w-0 ${isMVP ? 'border-2 border-[#FF9500]/40 shadow-[0_8px_24px_rgba(255,149,0,0.12)]' : 'border border-white/80 hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)]'}`}
                        >
                            {/* Khu vực Tên & Link */}
                            <div className="flex items-center gap-4 w-full xl:w-[35%] min-w-0">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-[15px] shrink-0 tabular-nums shadow-sm ${isMVP ? 'bg-gradient-to-br from-[#FF9500] to-[#FFCC00] text-white' : 'bg-gray-100 text-gray-700'}`}>
                                    {row.stt || 0}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-2 min-w-0 mb-1.5">
                                        {isMVP && <Crown size={16} className="text-[#FF9500] shrink-0" />}
                                        <h3 className="font-bold text-[#1D1D1F] text-[16px] truncate">{row.ten_san_pham || '---'}</h3>
                                        {row.link_san_pham && (
                                            <a href={row.link_san_pham} target="_blank" rel="noopener noreferrer" className="text-[#33A1FD] hover:text-white hover:bg-[#33A1FD] bg-blue-50 p-1.5 rounded-full shrink-0 transition-colors">
                                                <LinkIcon size={14}/>
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-gray-500">
                                        <span className="flex items-center gap-1.5"><Calendar size={12} /> {formatDateDisplay(row.ngay_ban)}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                        <span className="flex items-center gap-1.5 text-[#1A5B82] bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100/50">
                                            <Clock size={12} /> Cập nhật: {formatDateTime(row.updatedAt || row.ngay_ban)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Khu vực Data Density: Nhập / Bán / Còn */}
                            <div className="flex justify-between gap-3 xl:w-[30%] shrink-0 pl-16 xl:pl-0">
                                <div className="flex-1 bg-gray-50/80 border border-gray-200/60 rounded-[20px] py-2.5 text-center transition-colors group-hover:bg-gray-100/50">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Nhập</div>
                                    <div className="font-black text-gray-800 text-[15px] tabular-nums">{formatInput(row.sl_nhap || 0)}</div>
                                </div>
                                <div className={`flex-1 border rounded-[20px] py-2.5 text-center transition-colors ${isBanGreater ? 'bg-teal-50/80 border-teal-200/60 group-hover:bg-teal-100/60' : 'bg-gray-50/80 border-gray-200/60 group-hover:bg-gray-100/50'}`}>
                                    <div className={`text-[10px] font-black uppercase tracking-wider mb-0.5 ${isBanGreater ? 'text-teal-600' : 'text-gray-400'}`}>Bán</div>
                                    <div className={`font-black text-[15px] tabular-nums ${isBanGreater ? 'text-teal-700' : 'text-gray-800'}`}>{formatInput(row.so_luong || 0)}</div>
                                </div>
                                <div className="flex-1 bg-gray-50/80 border border-gray-200/60 rounded-[20px] py-2.5 text-center transition-colors group-hover:bg-gray-100/50">
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Còn</div>
                                    <div className="font-black text-gray-800 text-[15px] tabular-nums">{formatInput(row.sl_con || 0)}</div>
                                </div>
                            </div>

                            {/* Khu vực Tiền bạc & Hành động */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-end gap-4 xl:gap-6 w-full xl:w-[35%] pl-16 xl:pl-0 border-t xl:border-none border-gray-200/50 pt-5 xl:pt-0 mt-3 xl:mt-0 shrink-0">
                                
                                <div className="flex flex-row sm:flex-col justify-between sm:justify-center text-left sm:text-right shrink-0">
                                    <div className="flex items-center sm:justify-end gap-2.5 text-[13px]">
                                        <span className="text-gray-400 font-bold whitespace-nowrap">D.thu</span>
                                        <span className="font-black text-gray-800 tabular-nums">+{formatCurrency(row.so_tien_ban_duoc || 0)}</span>
                                    </div>
                                    <div className="flex items-center sm:justify-end gap-2.5 text-[12px] mt-1">
                                        <span className="text-gray-400 font-bold whitespace-nowrap">V.tồn</span>
                                        <span className="font-bold text-gray-500 tabular-nums">{formatCurrency(row.tien_ton || 0)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-3 sm:mt-0 border-t sm:border-none border-gray-200/50 pt-4 sm:pt-0">
                                    <div className="flex flex-col items-start sm:items-end shrink-0 min-w-[90px]">
                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 whitespace-nowrap">Lợi Nhuận</div>
                                        <div className={`text-[18px] font-black tracking-tight tabular-nums whitespace-nowrap ${parseFloat(row.loi || 0) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>
                                            {formatCurrency(row.loi || 0)}
                                        </div>
                                    </div>

                                    {/* Action Buttons: Đảm bảo Touch Target 44px (w-11 h-11) */}
                                    <div className="flex items-center gap-2 sm:border-l border-gray-200/80 sm:pl-4 ml-5">
                                        {canEdit && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleStartEdit(row); }} 
                                                disabled={isProcessingEdit || isProcessingDelete} 
                                                className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-[#33A1FD] hover:bg-blue-50/80 rounded-full transition-all active:scale-90" 
                                                title="Sửa bản ghi"
                                            >
                                                <Pencil size={18} strokeWidth={2.5}/>
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDeleteRow(row.id); }} 
                                                disabled={isProcessingEdit || isProcessingDelete} 
                                                className="w-11 h-11 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50/80 rounded-full transition-all active:scale-90" 
                                                title="Xóa bản ghi"
                                            >
                                                <Trash2 size={18} strokeWidth={2.5}/>
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