import React, { useState } from 'react';
import { Crown, Link as LinkIcon, Pencil, Trash2, Calendar, Clock, TrendingUp, FileText, X, Save, CheckCircle2, XCircle } from 'lucide-react';
import { formatCurrency, formatInput, formatDateDisplay, API_URL } from '../../utils';
import axios from 'axios';

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

// Thuật toán Vừa phân tách, vừa sắp xếp từ A-Z
const splitRawData = (text) => {
    if (!text) return { avail: [], sold: [] };
    const blocks = text.split(/(?=(?:^|\n)\s*Số\s+(?:\d+|cuối))/i);
    const avail = [];
    const sold = [];
    
    blocks.forEach(b => {
        const trimmed = b.trim();
        if (!trimmed) return;
        if (trimmed.includes('❌hết❌')) {
            sold.push(trimmed);
        } else {
            avail.push(trimmed);
        }
    });

    const sorter = (a, b) => {
        const getVal = (str) => {
            const match = str.match(/^Số\s*(\d+)/i);
            if (match) return parseInt(match[1], 10);
            if (/^Số\s*cuối/i.test(str)) return Infinity;
            return -1; 
        };
        return getVal(a) - getVal(b);
    };
    
    return { avail: avail.sort(sorter), sold: sold.sort(sorter) };
};

export default function TransactionList({
    enrichedDaily, detailData, mvpRowId, canEdit, canDelete,
    isProcessingEdit, isProcessingDelete, handleStartEdit, handleDeleteRow,
    importedBales
}) {
    const tongTienKien = (importedBales || []).reduce((acc, b) => acc + (Number(b.cost) || 0), 0) || (detailData?.so_tien_cua_kien || 0);
    const tongSlKien = (importedBales || []).reduce((acc, b) => acc + (Number(b.qty) || 0), 0) || (detailData?.computed?.tong_sl_nhap || 1);
    const avgPrice = tongSlKien > 0 ? tongTienKien / tongSlKien : 0;

    const tongLoiTrungBinh = (enrichedDaily || []).reduce((total, row) => {
        if (!row) return total;
        const loiTrungBinh = (row.so_tien_ban_duoc || 0) - ((row.sl_nhap || 0) * avgPrice + 350000);
        return total + loiTrungBinh;
    }, 0);

    const [rawModal, setRawModal] = useState({ isOpen: false, rowData: null, textAvail: '', textSold: '' });
    const [isSavingRaw, setIsSavingRaw] = useState(false);

    const handleOpenRawModal = (e, row) => {
        e.stopPropagation();
        const { avail, sold } = splitRawData(row.hidden_raw_data || '');
        setRawModal({
            isOpen: true,
            rowData: row,
            textAvail: avail.join('\n\n'),
            textSold: sold.join('\n\n')
        });
    };

    const handleSaveRawData = async () => {
        if (!rawModal.rowData) return;
        setIsSavingRaw(true);
        try {
            const combinedText = [rawModal.textAvail, rawModal.textSold].filter(t => t.trim() !== '').join('\n\n');
            await axios.put(`${API_URL}/daily/${rawModal.rowData.id}`, { 
                ...rawModal.rowData, 
                hidden_raw_data: combinedText 
            });
            rawModal.rowData.hidden_raw_data = combinedText; 
            setRawModal({ isOpen: false, rowData: null, textAvail: '', textSold: '' });
        } catch (error) {
            console.error("Lỗi khi lưu dữ liệu:", error);
            alert("Có lỗi xảy ra khi lưu dữ liệu thô!");
        } finally {
            setIsSavingRaw(false);
        }
    };

    const handleSmartPaste = (e) => {
        e.preventDefault(); 
        const pastedText = e.clipboardData.getData('text');
        if (!pastedText) return;

        const target = e.target;
        const start = target.selectionStart;
        const end = target.selectionEnd;
        const isAvailBox = target.name === 'avail';
        
        const currentText = isAvailBox ? rawModal.textAvail : rawModal.textSold;
        const textBefore = currentText.substring(0, start);
        const textAfter = currentText.substring(end);
        
        const newBoxText = textBefore + '\n\n' + pastedText + '\n\n' + textAfter;
        const combinedEverything = isAvailBox ? (newBoxText + '\n\n' + rawModal.textSold) : (rawModal.textAvail + '\n\n' + newBoxText);
        const { avail, sold } = splitRawData(combinedEverything);

        setRawModal(prev => ({ ...prev, textAvail: avail.join('\n\n'), textSold: sold.join('\n\n') }));
    };

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
                    const loiTrungBinh = (row.so_tien_ban_duoc || 0) - ((row.sl_nhap || 0) * avgPrice + 350000);
                    
                    return (
                        <div 
                            key={row.id || index} 
                            className={`group relative bg-white/70 hover:bg-white backdrop-blur-md rounded-[20px] md:rounded-[28px] p-4 transition-all duration-500 ease-out flex flex-col xl:flex-row xl:items-center justify-between gap-4 xl:gap-5 w-full min-w-0 overflow-hidden ${isMVP ? 'border-2 border-[#FF9500]/50 shadow-[0_8px_24px_rgba(255,149,0,0.15)]' : 'border border-white/80 hover:shadow-[0_15px_40px_rgba(38,208,206,0.12)] hover:border-[#26D0CE]/30'}`}
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

                            {/* KHỐI PHẢI: Số liệu & Tài chính đã được chốt cứng width để thẳng cột */}
                            <div className="flex flex-row flex-wrap lg:flex-nowrap items-center justify-between xl:justify-end gap-4 w-full xl:w-auto border-t xl:border-none border-gray-200/60 pt-3 xl:pt-0 relative z-10 shrink-0">
                                
                                {/* 1. Khối Nhập/Bán/Còn */}
                                <div className="flex items-center justify-between sm:justify-start gap-1.5 md:gap-2 w-full sm:w-auto shrink-0">
                                    <div className="flex-1 sm:flex-none w-[55px] md:w-[65px] bg-gray-50/80 border border-gray-200/60 rounded-[14px] py-1.5 text-center group-hover:bg-white transition-colors shadow-sm">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Nhập</div>
                                        <div className="font-black text-gray-800 text-[13px] md:text-[14px] tabular-nums">{formatInput(row.sl_nhap || 0)}</div>
                                    </div>
                                    <div className={`flex-1 sm:flex-none w-[55px] md:w-[65px] border rounded-[14px] py-1.5 text-center transition-colors shadow-sm ${isBanGreater ? 'bg-teal-50/80 border-teal-200/60 group-hover:bg-teal-50' : 'bg-gray-50/80 border-gray-200/60 group-hover:bg-white'}`}>
                                        <div className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${isBanGreater ? 'text-teal-600' : 'text-gray-400'}`}>Bán</div>
                                        <div className={`font-black text-[13px] md:text-[14px] tabular-nums ${isBanGreater ? 'text-teal-700' : 'text-gray-800'}`}>{formatInput(row.so_luong || 0)}</div>
                                    </div>
                                    <div className="flex-1 sm:flex-none w-[55px] md:w-[65px] bg-gray-50/80 border border-gray-200/60 rounded-[14px] py-1.5 text-center group-hover:bg-white transition-colors shadow-sm">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-wider mb-0.5">Còn</div>
                                        <div className="font-black text-gray-800 text-[13px] md:text-[14px] tabular-nums">{formatInput(row.sl_con || 0)}</div>
                                    </div>
                                </div>

                                {/* Vùng gom Tài chính & Nút bấm - Sử dụng flex rời để thẳng cột */}
                                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between sm:justify-end gap-4 md:gap-5 w-full sm:w-auto shrink-0 pl-0 sm:border-l border-gray-200/60 sm:pl-4 md:pl-5 mt-2 sm:mt-0">
                                    
                                    {/* 2. Khối D.thu / V.tồn / Lời TB (Cột cố định min 120px) */}
                                    <div className="flex flex-col justify-center text-left sm:text-right min-w-[120px] shrink-0">
                                        <div className="flex items-center sm:justify-end gap-1.5 text-[11px] md:text-[12px]">
                                            <span className="text-gray-400 font-bold whitespace-nowrap">D.thu</span>
                                            <span className="font-black text-gray-800 tabular-nums">+{formatCurrency(row.so_tien_ban_duoc || 0)}</span>
                                        </div>
                                        <div className="flex items-center sm:justify-end gap-1.5 text-[10px] md:text-[11px] mt-0.5">
                                            <span className="text-gray-400 font-bold whitespace-nowrap">V.tồn</span>
                                            <span className="font-bold text-gray-500 tabular-nums">{formatCurrency(row.tien_ton || 0)}</span>
                                        </div>
                                        <div className="flex items-center sm:justify-end gap-1.5 text-[10px] md:text-[11px] mt-1 bg-gray-50/80 px-2 py-0.5 rounded border border-gray-100 shadow-sm w-fit sm:ml-auto">
                                            <span className="text-gray-500 font-bold whitespace-nowrap">Lời TB</span>
                                            <span className={`font-black tabular-nums ${loiTrungBinh >= 0 ? "text-teal-600" : "text-rose-600"}`}>
                                                {loiTrungBinh >= 0 ? "+" : ""}{formatCurrency(loiTrungBinh)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 3. Khối Lợi Nhuận (Cột cố định min 110px để không bao giờ bị ép) */}
                                    <div className="flex flex-col items-start sm:items-end min-w-[110px] shrink-0">
                                        <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Lợi Nhuận</div>
                                        <div className={`text-[15px] md:text-[16px] font-black tracking-tight tabular-nums ${parseFloat(row.loi || 0) >= 0 ? 'text-[#1DB2A0]' : 'text-[#FF453A]'}`}>
                                            {formatCurrency(row.loi || 0)}
                                        </div>
                                    </div>

                                    {/* 4. Khối Nút Bấm (Đứng độc lập để không chèn ép các khối khác) */}
                                    <div className="flex items-center gap-1.5 bg-gray-50/80 p-1.5 rounded-full border border-gray-200/50 shrink-0">
                                        {canEdit && (
                                            <button onClick={(e) => handleOpenRawModal(e, row)} disabled={isProcessingEdit || isProcessingDelete} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-gray-400 hover:text-indigo-500 hover:bg-white hover:shadow-sm rounded-full transition-all active:scale-90" title="Kho dữ liệu Instagram">
                                                <FileText size={14} strokeWidth={2.5}/>
                                            </button>
                                        )}
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
                    );
                })}
            </div>

            {/* KHỐI TỔNG LỜI TRUNG BÌNH */}
            {(enrichedDaily || []).length > 0 && (
                <div className="mt-6 pt-2">
                    <div className="bg-gradient-to-r from-gray-50/80 to-white border border-gray-200/60 rounded-[20px] p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0">
                                <TrendingUp size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="text-[14px] md:text-[15px] font-black text-gray-700 uppercase tracking-wider">Tổng Lời Trung Bình</h3>
                                <p className="text-[12px] text-gray-500 font-medium mt-0.5">Cộng dồn tất cả các lần bán</p>
                            </div>
                        </div>
                        <div className={`text-[24px] md:text-[32px] font-black tracking-tighter tabular-nums drop-shadow-sm whitespace-nowrap ${tongLoiTrungBinh >= 0 ? 'text-[#1DB2A0]' : 'text-rose-600'}`}>
                            {tongLoiTrungBinh >= 0 ? "+" : ""}{formatCurrency(tongLoiTrungBinh)}
                            <span className="text-[16px] opacity-70 ml-1.5">đ</span>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL NHẬP DỮ LIỆU THÔ IG */}
            {rawModal.isOpen && (
                <div 
                    className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-8 bg-black/50 backdrop-blur-sm"
                    onClick={() => setRawModal({ isOpen: false, rowData: null, textAvail: '', textSold: '' })}
                >
                    <div 
                        className="bg-white rounded-[28px] w-full max-w-[1200px] h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-scale-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-5 md:p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
                            <div className="flex items-center gap-3 md:gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                    <FileText size={22} strokeWidth={2.5}/>
                                </div>
                                <div>
                                    <h3 className="text-[18px] md:text-[20px] font-black text-gray-800 leading-tight">
                                        Dữ liệu Instagram - {rawModal.rowData?.ten_san_pham || 'Sản phẩm'}
                                    </h3>
                                    <p className="text-[13px] text-gray-500 font-medium mt-0.5">Dán Text từ Bookmarklet V7.0 vào, hệ thống sẽ tự động phân loại và sắp xếp!</p>
                                </div>
                            </div>
                            <button onClick={() => setRawModal({ isOpen: false, rowData: null, textAvail: '', textSold: '' })} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-700 rounded-full transition-colors bg-white shadow-sm border border-gray-100">
                                <X size={20} strokeWidth={2.5}/>
                            </button>
                        </div>
                        
                        <div className="flex-1 flex flex-col lg:flex-row gap-5 md:gap-6 p-5 md:p-6 bg-white overflow-hidden">
                            <div className="flex-1 flex flex-col h-full overflow-hidden bg-emerald-50/30 rounded-[20px] border border-emerald-100/60 shadow-inner">
                                <div className="px-5 py-3.5 bg-emerald-100/50 border-b border-emerald-100 flex items-center gap-2">
                                    <CheckCircle2 size={18} className="text-emerald-600" strokeWidth={2.5} />
                                    <span className="font-black text-emerald-800 text-[14px] uppercase tracking-wide">🛒 Còn hàng</span>
                                </div>
                                <textarea 
                                    name="avail"
                                    className="flex-1 w-full bg-transparent p-5 text-[14px] font-medium text-gray-700 focus:bg-white focus:ring-4 focus:ring-emerald-100/50 outline-none transition-all resize-none leading-relaxed"
                                    placeholder="Danh sách sản phẩm còn hàng..."
                                    value={rawModal.textAvail}
                                    onChange={(e) => setRawModal({...rawModal, textAvail: e.target.value})}
                                    onPaste={handleSmartPaste}
                                ></textarea>
                            </div>

                            <div className="flex-1 flex flex-col h-full overflow-hidden bg-rose-50/30 rounded-[20px] border border-rose-100/60 shadow-inner">
                                <div className="px-5 py-3.5 bg-rose-100/50 border-b border-rose-100 flex items-center gap-2">
                                    <XCircle size={18} className="text-rose-600" strokeWidth={2.5} />
                                    <span className="font-black text-rose-800 text-[14px] uppercase tracking-wide">❌ Đã bán</span>
                                </div>
                                <textarea 
                                    name="sold"
                                    className="flex-1 w-full bg-transparent p-5 text-[14px] font-medium text-gray-700 focus:bg-white focus:ring-4 focus:ring-rose-100/50 outline-none transition-all resize-none leading-relaxed"
                                    placeholder="Danh sách sản phẩm đã bán..."
                                    value={rawModal.textSold}
                                    onChange={(e) => setRawModal({...rawModal, textSold: e.target.value})}
                                    onPaste={handleSmartPaste}
                                ></textarea>
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4 shrink-0">
                            <button 
                                onClick={() => setRawModal({ isOpen: false, rowData: null, textAvail: '', textSold: '' })}
                                className="px-8 py-3 rounded-[16px] font-bold text-[14px] text-gray-600 bg-white hover:bg-gray-100 border border-gray-200 transition-colors shadow-sm"
                            >
                                Đóng
                            </button>
                            <button 
                                onClick={handleSaveRawData}
                                disabled={isSavingRaw}
                                className="px-8 py-3 rounded-[16px] font-bold text-[14px] text-white bg-indigo-600 hover:bg-indigo-700 shadow-[0_8px_20px_rgba(79,70,229,0.25)] transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                            >
                                {isSavingRaw ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Save size={18} strokeWidth={2.5} />
                                )}
                                Lưu thay đổi
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}