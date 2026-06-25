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
        <div className="liquid-glass rounded-[32px] p-3 sm:p-6 md:p-8 min-w-0 shadow-sm border border-white/60">
            <div className="flex justify-between items-center mb-6 px-2 md:px-0">
                <h2 className="text-[18px] md:text-[20px] font-bold text-[#1D1D1F] tracking-tight">Chi tiết sản phẩm</h2>
                <span className="text-[12px] font-bold bg-white/60 border border-gray-200 text-[#1D1D1F] px-3 py-1.5 rounded-full shadow-sm">{(detailData?.daily || []).length}</span>
            </div>
            
            <div className="flex flex-col gap-4 min-w-0">
                {(enrichedDaily || []).map((row, index) => {
                    if (!row) return null;
                    const isBanGreater = (row.so_luong || 0) > (row.sl_con || 0);
                    const isMVP = row.id === mvpRowId && index !== 0; 
                    
                    return (
                        <div 
                            key={row.id || index} 
                            className={`bg-white hover:bg-gray-50 border shadow-sm rounded-[24px] p-4 transition-all flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-6 w-full min-w-0 ${isMVP ? 'border-[#FF9500]/40 shadow-[#FF9500]/10' : 'border-gray-200'}`}
                        >
                            <div className="flex items-center gap-4 w-full xl:w-[40%] min-w-0">
                                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 tabular-nums ${isMVP ? 'bg-[#FF9500]/10 text-[#FF9500]' : 'bg-gray-100 text-gray-700'}`}>
                                    {row.stt || 0}
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <div className="flex items-center gap-2 min-w-0 mb-1">
                                        {isMVP && <Crown size={14} className="text-[#FF9500] shrink-0" />}
                                        <h3 className="font-bold text-[#1D1D1F] text-[15px] truncate">{row.ten_san_pham || '---'}</h3>
                                        {row.link_san_pham && (
                                            <a href={row.link_san_pham} target="_blank" rel="noopener noreferrer" className="text-[#33A1FD] hover:text-[#26D0CE] bg-blue-50 p-1 rounded-full shrink-0">
                                                <LinkIcon size={12}/>
                                            </a>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-gray-500">
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {formatDateDisplay(row.ngay_ban)}</span>
                                        <span className="text-gray-300">|</span>
                                        <span className="flex items-center gap-1 text-[#1A5B82] bg-blue-50/80 px-1.5 py-0.5 rounded-md border border-blue-100/50 truncate">
                                            <Clock size={10} /> Cập nhật: {formatDateTime(row.updatedAt || row.ngay_ban)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between gap-2 xl:w-[25%] shrink-0 pl-14 xl:pl-0">
                                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-2 text-center">
                                    <div className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 whitespace-nowrap">Nhập</div>
                                    <div className="font-bold text-gray-800 text-[14px] tabular-nums">{formatInput(row.sl_nhap || 0)}</div>
                                </div>
                                <div className={`flex-1 border rounded-2xl py-2 text-center ${isBanGreater ? 'bg-teal-50 border-teal-100' : 'bg-gray-50 border-gray-100'}`}>
                                    <div className={`text-[9px] font-bold uppercase mb-0.5 whitespace-nowrap ${isBanGreater ? 'text-teal-700' : 'text-gray-500'}`}>Bán</div>
                                    <div className={`font-bold text-[14px] tabular-nums ${isBanGreater ? 'text-teal-600' : 'text-gray-800'}`}>{formatInput(row.so_luong || 0)}</div>
                                </div>
                                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-2 text-center">
                                    <div className="text-[9px] font-bold text-gray-500 uppercase mb-0.5 whitespace-nowrap">Còn</div>
                                    <div className="font-bold text-gray-800 text-[14px] tabular-nums">{formatInput(row.sl_con || 0)}</div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between xl:justify-end gap-3 xl:gap-5 w-full xl:w-[35%] pl-14 xl:pl-0 border-t xl:border-none border-gray-100 pt-4 xl:pt-0 mt-2 xl:mt-0 shrink-0">
                                
                                <div className="flex flex-row sm:flex-col justify-between sm:justify-center text-left sm:text-right shrink-0">
                                    <div className="flex items-center sm:justify-end gap-2 text-[12px]">
                                        <span className="text-gray-500 whitespace-nowrap">D.thu</span>
                                        <span className="font-bold text-gray-800 tabular-nums">+{formatCurrency(row.so_tien_ban_duoc || 0)}</span>
                                    </div>
                                    <div className="flex items-center sm:justify-end gap-2 text-[11px] mt-0.5">
                                        <span className="text-gray-400 whitespace-nowrap">V.tồn</span>
                                        <span className="font-medium text-gray-500 tabular-nums">{formatCurrency(row.tien_ton || 0)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-none border-gray-100 pt-3 sm:pt-0">
                                    <div className="flex flex-col items-start sm:items-end shrink-0 min-w-[80px]">
                                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5 whitespace-nowrap">Lợi Nhuận</div>
                                        <div className={`text-[16px] font-black tracking-tight tabular-nums whitespace-nowrap ${parseFloat(row.loi || 0) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>
                                            {formatCurrency(row.loi || 0)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 sm:border-l border-gray-200 sm:pl-3 ml-4">
                                        {canEdit && <button onClick={(e) => { e.stopPropagation(); handleStartEdit(row); }} disabled={isProcessingEdit || isProcessingDelete} className="p-2 text-gray-400 hover:text-[#33A1FD] hover:bg-gray-50 rounded-full transition-colors active:scale-95 shadow-sm sm:shadow-none" title="Sửa bản ghi"><Pencil size={14}/></button>}
                                        {canDelete && <button onClick={(e) => { e.stopPropagation(); handleDeleteRow(row.id); }} disabled={isProcessingEdit || isProcessingDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95 shadow-sm sm:shadow-none" title="Xóa bản ghi"><Trash2 size={14}/></button>}
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