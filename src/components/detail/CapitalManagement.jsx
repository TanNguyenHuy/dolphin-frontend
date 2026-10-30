import React, { useEffect, useRef, useState } from 'react';
import { Box, Package, X, Pencil } from 'lucide-react';
import { formatCurrency, formatInput, parseInput, AD_COST_PER_SALE } from '../../utils';
import { calculateBaleSales, allocateLaundryCosts } from '../../logic';

export default function CapitalManagement({
    detailData, detailAutoAdCost, canEdit, canDelete, handleAddBale,
    baleName, setBaleName, baleCost, setBaleCost, baleQty, setBaleQty,
    importedBales, handleDeleteBale, handleUpdateBale
}) {
    const [editingBale, setEditingBale] = useState(null);
    const [savingBale, setSavingBale] = useState(false);
    const [editError, setEditError] = useState('');
    const editTrigger = useRef(null);
    useEffect(() => { if (!editingBale) editTrigger.current?.focus(); }, [editingBale]);
    const saveBale = async (event, minimumQty) => {
        event.preventDefault();
        if (!canEdit || !editingBale || savingBale) return;
        const cost = parseInput(editingBale.cost);
        const qty = parseInput(editingBale.qty);
        if (!Number.isSafeInteger(cost) || cost <= 0 || !Number.isSafeInteger(qty) || qty <= 0) {
            setEditError('Giá vốn và số lượng phải là số nguyên lớn hơn 0.'); return;
        }
        if (qty < minimumQty) { setEditError(`Lô đã phân bổ ${minimumQty} sản phẩm. Số lượng nhập không được nhỏ hơn ${minimumQty}.`); return; }
        setSavingBale(true);
        setEditError('');
        try {
            await handleUpdateBale(editingBale.id, { cost, qty });
            setEditingBale(null);
        } catch (error) {
            setEditError(error.response?.data?.error || error.message || 'Không lưu được lô hàng. Vui lòng thử lại.');
        } finally { setSavingBale(false); }
    };
    // TÍNH TOÁN THEO ĐÚNG CÔNG THỨC: (Tổng tiền 1 + ... + n) / (Số lượng 1 + ... + n)
    const tongTienKien = (importedBales || []).reduce((acc, b) => acc + (Number(b.cost) || 0), 0);
    const tongSlKien = (importedBales || []).reduce((acc, b) => acc + (Number(b.qty) || 0), 0);
    const totalLaundryCost = Number(detailData?.so_tien_giat_ui ?? Math.round(tongTienKien * 0.04)) || 0;
    const laundryCosts = allocateLaundryCosts(importedBales || [], totalLaundryCost);
    const avgPrice = tongSlKien > 0 ? tongTienKien / tongSlKien : 0;

    // Tính tổng vốn nhập kho (Bao gồm cả phí giặt ủi và ads)
    const totalCapital = (detailData?.so_tien_cua_kien || 0) + (detailData?.so_tien_giat_ui || 0) + (detailAutoAdCost || 0);

    return (
        <div className="capital-panel liquid-glass bg-white/50 backdrop-blur-xl rounded-[32px] md:rounded-[40px] overflow-hidden flex flex-col h-full min-w-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/80">
            {/* Header của Khối */}
            <div className="px-6 py-5 border-b border-white/60 flex items-center gap-3 bg-white/40">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shadow-sm">
                    <Box size={16} strokeWidth={2.5} />
                </div>
                <h3 className="text-[16px] md:text-[18px] font-black text-[#1D1D1F] tracking-tight whitespace-nowrap">Cấu trúc Vốn</h3>
            </div>

            <div className="p-5 md:p-8 flex-1 flex flex-col space-y-6 min-w-0">

                {/* Thẻ Tổng Vốn (Điểm nhấn Pro Max) */}
                <div className="bg-gradient-to-br from-[#FFFDE7] to-[#FFECB3] border border-[#FFE0B2] shadow-[0_12px_30px_rgba(255,140,0,0.15)] p-6 md:p-8 rounded-[28px] relative overflow-hidden min-w-0 group hover:shadow-[0_16px_40px_rgba(255,140,0,0.25)] transition-all duration-500">
                    <div className="absolute right-0 top-0 opacity-[0.08] group-hover:scale-110 group-hover:opacity-[0.15] transition-all duration-700 pointer-events-none">
                        <Package size={140} className="transform translate-x-1/4 -translate-y-1/4 text-[#FFB300]" />
                    </div>
                    <span className="text-[11px] font-black text-orange-600 uppercase tracking-widest block mb-2 whitespace-nowrap relative z-10">Tổng Vốn Nhập Kho</span>
                    <div className="font-black text-[#3E2723] text-[36px] md:text-[44px] tabular-nums tracking-tighter drop-shadow-sm whitespace-nowrap relative z-10 leading-none">
                        {formatCurrency(totalCapital)}
                        <span className="text-[20px] text-orange-600/70 ml-1.5 font-bold">đ</span>
                    </div>

                    {/* DÒNG HIỂN THỊ GIÁ TRUNG BÌNH SẢN PHẨM */}
                    <div className="mt-3 pt-3 border-t border-orange-200/50 flex justify-between items-center relative z-10">
                        <span className="text-[11px] font-bold text-orange-700/80 uppercase tracking-wide">Giá TB / Sản phẩm</span>
                        <span className="text-[15px] font-black text-[#663C00]">
                            {formatCurrency(avgPrice)} <span className="text-[11px] opacity-70">đ</span>
                        </span>
                    </div>
                </div>

                {/* Form thêm lô hàng */}
                {canEdit && (
                    <form onSubmit={handleAddBale} className="bale-create-form">
                        <label htmlFor="bale-name">Tên lô hàng</label>
                        <input id="bale-name" required placeholder="VD: Sơ mi, Dài tay…" value={baleName || ''} onChange={event => setBaleName(event.target.value)} />
                        <div className="bale-create-fields">
                            <label>Giá vốn lô (VNĐ)<input required inputMode="numeric" placeholder="0" value={formatInput(baleCost) || ''} onChange={event => setBaleCost(event.target.value)} /></label>
                            <label>Số lượng<input required inputMode="numeric" placeholder="0" value={formatInput(baleQty) || ''} onChange={event => setBaleQty(event.target.value)} /></label>
                        </div>
                        <button type="submit">Ghi nhận kiện hàng</button>
                    </form>
                )}

                <div className="bale-section-heading"><h3>Các lô hàng</h3><span>{(importedBales || []).length} lô</span></div>
                <p className="bale-allocation-note">Giặt ủi phân bổ theo giá vốn, tính một lần cho mỗi lô.</p>
                {(importedBales || []).length > 0 ? (
                    <div className="bale-list" role="list" aria-label="Danh sách lô hàng">
                        {(importedBales || []).map((bale, index) => {
                            if (!bale) return null;
                            const originalQty = Number(bale.qty) || 0;
                            const totalDeducted = (detailData?.daily || []).reduce((sum, row) =>
                                String(row.ten_san_pham || '').toLowerCase().includes(String(bale.name || '').toLowerCase())
                                    ? sum + (Number(row.so_luong_nhap) || 0) : sum, 0);
                            const remainingQty = originalQty - totalDeducted;
                            const { totalRevenue, saleCount, advertisingCost, laundryCost, netRevenue } = calculateBaleSales(bale.name, detailData?.daily, AD_COST_PER_SALE, laundryCosts[index]);
                            const titleId = `bale-title-${bale._id || index}`;
                            return (
                                <article key={bale._id} role="listitem" className="bale-card" aria-labelledby={titleId} style={{ '--card-delay': `${Math.min(index * 40, 160)}ms` }}>
                                    <header className="bale-card-heading">
                                        <div className="bale-card-identity"><span className="bale-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><div><p>Lô hàng</p><h4 id={titleId}>{bale.name || 'Chưa đặt tên'}</h4></div></div>
                                        <div className="bale-card-actions">
                                            {canEdit && <button type="button" className="bale-edit" disabled={savingBale || Boolean(editingBale)} aria-label={`Chỉnh sửa lô ${bale.name || ''}`} onClick={event => { editTrigger.current = event.currentTarget; setEditError(''); setEditingBale({ id: String(bale._id), qty: String(bale.qty || ''), cost: String(bale.cost || '') }); }}><Pencil size={16} aria-hidden="true" /><span>Sửa</span></button>}
                                            {canDelete && <button type="button" className="bale-delete" disabled={savingBale || Boolean(editingBale)} aria-label={`Xóa lô ${bale.name || ''}`} onClick={() => handleDeleteBale(bale._id)}><X size={18} aria-hidden="true" /></button>}
                                        </div>
                                    </header>
                                    {canEdit && editingBale?.id === String(bale._id) && <form className="bale-edit-form" aria-label={`Chỉnh sửa lô ${bale.name}`} onSubmit={event => saveBale(event, totalDeducted)} aria-busy={savingBale}>
                                        <label>Số lượng nhập<input autoFocus required inputMode="numeric" disabled={savingBale} value={formatInput(editingBale.qty)} onChange={event => setEditingBale(previous => ({ ...previous, qty: event.target.value }))} /></label>
                                        <label>Giá vốn lô (VNĐ)<input required inputMode="numeric" disabled={savingBale} value={formatInput(editingBale.cost)} onChange={event => setEditingBale(previous => ({ ...previous, cost: event.target.value }))} /></label>
                                        <p>Đã phân bổ {formatInput(totalDeducted)} sản phẩm. Lưu sẽ cập nhật tổng giá vốn và phí giặt ủi 4% của đợt.</p>
                                        {editError && <p role="alert" className="bale-edit-error">{editError}</p>}
                                        <div><button type="button" disabled={savingBale} onClick={() => { setEditingBale(null); setEditError(''); }}>Hủy</button><button type="submit" disabled={savingBale}>{savingBale ? 'Đang lưu…' : 'Lưu thay đổi'}</button></div>
                                    </form>}
                                    <div className="bale-card-stock"><span>SL gốc<strong>{formatInput(originalQty)}</strong></span><span>Đã lấy ra<strong>{formatInput(totalDeducted)}</strong></span><span>Còn kho<strong className={remainingQty < 0 ? 'is-negative' : ''}>{formatInput(remainingQty)}</strong></span></div>
                                    <dl className="bale-capital-values"><div><dt>Giá vốn lô</dt><dd>{formatCurrency(bale.cost || 0)} đ</dd></div><div><dt>Giá vốn / sản phẩm</dt><dd>{formatCurrency((bale.cost || 0) / (bale.qty || 1))} đ</dd></div></dl>
                                    <dl className="bale-sales-summary" aria-label={`Thống kê bán hàng ${bale.name || ''}`}>
                                        <div className="bale-revenue"><dt>Tổng doanh thu</dt><dd><strong>{formatCurrency(totalRevenue)} đ</strong></dd></div>
                                        <div><dt>Số lần bán</dt><dd><strong>{formatInput(saleCount)} lần</strong></dd></div>
                                        <div className="bale-expense"><dt>Tiền quảng cáo</dt><dd><strong>{formatCurrency(advertisingCost)} đ</strong><small>{formatCurrency(AD_COST_PER_SALE)}đ/lần ghi nhận</small></dd></div>
                                        <div className="bale-expense"><dt>Chi phí giặt ủi</dt><dd><strong>{formatCurrency(laundryCost)} đ</strong><small>Phân bổ theo giá vốn</small></dd></div>
                                        <div className={`bale-net ${netRevenue < 0 ? 'is-negative' : ''}`}><dt>Doanh thu thực</dt><dd><strong>{formatCurrency(netRevenue)} đ</strong><small>Đã trừ quảng cáo + giặt ủi. Chưa trừ giá vốn.</small></dd></div>
                                    </dl>
                                </article>
                            );
                        })}
                    </div>
                ) : <div className="empty-state"><Package size={28} aria-hidden="true" /><p>Chưa có lô hàng. Ghi nhận kiện hàng đầu tiên để theo dõi vốn và doanh thu.</p></div>}

                {/* Thông số phụ */}
                <div className="mt-auto space-y-5 pt-6 border-t border-white/50 min-w-0 relative z-10">
                    <div className="min-w-0">
                        <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 block pl-1">Phí Giặt ủi & Phụ phí (Auto 4%)</label>
                        <input
                            disabled readOnly
                            className="w-full min-w-0 bg-white/40 border border-white/60 rounded-[20px] px-5 py-4 font-black text-right text-gray-600 text-[20px] outline-none tabular-nums shadow-inner cursor-not-allowed"
                            value={formatInput(totalLaundryCost)}
                        />
                    </div>

                    <div className="bg-white/60 border border-white/80 p-5 rounded-[24px] space-y-3.5 text-[13px] md:text-[14px] backdrop-blur-md shadow-sm min-w-0">
                        <div className="flex justify-between items-center gap-2 text-gray-500 font-bold"><span>Tổng Hàng Nhập</span><span className="font-black text-gray-800 tabular-nums">{formatInput(detailData?.computed?.tong_sl_nhap || 0)}</span></div>
                        <div className="flex justify-between items-center gap-2 text-gray-500 font-bold"><span>Tổng Đã Bán</span><span className="font-black text-[#1DB2A0] tabular-nums">{formatInput(detailData?.computed?.tong_sl_ban || 0)}</span></div>
                        <div className="flex justify-between items-center gap-2 text-gray-500 font-bold"><span>Tồn Kho Hiện Tại</span><span className="font-black text-orange-600 tabular-nums">{formatInput((detailData?.computed?.tong_sl_nhap || 0) - (detailData?.computed?.tong_sl_ban || 0))}</span></div>
                        <div className="flex justify-between items-center gap-2 text-gray-500 font-bold pt-3.5 border-t border-gray-200/50 mt-2">
                            <span>Phí Quảng cáo (Auto)</span>
                            <span className="font-black text-gray-800 tabular-nums">{formatCurrency(detailAutoAdCost)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
