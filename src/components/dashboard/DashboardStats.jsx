import { Package, Percent, FileText } from 'lucide-react';
import { REVENUE_THRESHOLD } from '../../logic';
import { formatCurrency } from '../../utils';

export default function DashboardStats({ globalTongCon, globalTongNhap, globalVonTon, taxAmount, totalRevenueForTax, revenueProgress }) {
    return <section className="inventory-summary reading-panel" aria-label="Kho, vốn và thuế">
        <h2>Kho, vốn và thuế</h2>
        <div className="inventory-values">
            <div><Package size={22} /><span><small>Tồn kho</small><strong>{formatCurrency(globalTongCon)} <em>/ {formatCurrency(globalTongNhap)} sp</em></strong></span></div>
            <div><Percent size={22} /><span><small>Vốn tồn kho</small><strong>{formatCurrency(globalVonTon)} đ</strong></span></div>
            <div><FileText size={22} /><span><small>Ước tính thuế (1,5%)</small><strong>{formatCurrency(taxAmount)} đ</strong></span></div>
        </div>
        <div className="revenue-threshold">
            <div><span>Doanh thu / ngưỡng 1 tỷ</span><strong>{formatCurrency(totalRevenueForTax)} / {formatCurrency(REVENUE_THRESHOLD)} đ</strong></div>
            <progress aria-label="Doanh thu so với ngưỡng 1 tỷ" max="100" value={revenueProgress} />
            <p>{revenueProgress.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}% ngưỡng · {totalRevenueForTax >= REVENUE_THRESHOLD ? 'Đã đạt ngưỡng' : `Còn ${formatCurrency(REVENUE_THRESHOLD - totalRevenueForTax)} đ`}</p>
        </div>
    </section>;
}
