import { Plus } from 'lucide-react';
import { formatInput } from '../../utils';

export default function TransactionForm({ canEdit, handleAddItem, newItem, setNewItem, isProcessingAdd }) {
    if (!canEdit) return null;

    return (
        <form id="transaction-form" onSubmit={handleAddItem} className="transaction-form liquid-glass">
            <h3>Ghi nhận giao dịch mới</h3>
            <div className="transaction-fields">
                <label>Ngày giao dịch
                    <input type="date" required disabled={isProcessingAdd} value={newItem.ngay_ban}
                        onChange={event => setNewItem(previous => ({ ...previous, ngay_ban: event.target.value }))} />
                </label>
                <label className="transaction-name">Sản phẩm
                    <input required placeholder="VD: Sơ mi" value={newItem.ten_san_pham}
                        onChange={event => setNewItem(previous => ({ ...previous, ten_san_pham: event.target.value }))} />
                </label>
                <label>Nhập
                    <input inputMode="numeric" placeholder="0" value={formatInput(newItem.so_luong_nhap)}
                        onChange={event => setNewItem(previous => ({ ...previous, so_luong_nhap: event.target.value }))} />
                </label>
                <label>Bán
                    <input inputMode="numeric" placeholder="0" value={formatInput(newItem.so_luong)}
                        onChange={event => setNewItem(previous => ({ ...previous, so_luong: event.target.value }))} />
                </label>
                <label>Tổng thu
                    <input inputMode="numeric" placeholder="0" value={formatInput(newItem.so_tien_ban_duoc)}
                        onChange={event => setNewItem(previous => ({ ...previous, so_tien_ban_duoc: event.target.value }))} />
                </label>
                <button type="submit" disabled={isProcessingAdd}>
                    <Plus size={16} aria-hidden="true" />{isProcessingAdd ? 'Đang lưu…' : 'Ghi nhận'}
                </button>
            </div>
        </form>
    );
}
