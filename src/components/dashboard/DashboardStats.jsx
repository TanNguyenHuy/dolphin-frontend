import { Package, Percent, FileText } from 'lucide-react';
import { formatCurrency } from '../../utils';

export default function DashboardStats({ globalTongCon, globalTongNhap, globalVonTon, taxAmount }) {
    return <section className="inventory-summary reading-panel" aria-label="Kho, vốn và thuế">
        <h2>Kho, vốn và thuế</h2>
        <div className="inventory-values">
            <div><Package size={22} /><span><small>Tồn kho</small><strong>{formatCurrency(globalTongCon)} <em>/ {formatCurrency(globalTongNhap)} sp</em></strong></span></div>
            <div><Percent size={22} /><span><small>Vốn tồn kho</small><strong>{formatCurrency(globalVonTon)} đ</strong></span></div>
            <div><FileText size={22} /><span><small>Ước tính thuế (1,5%)</small><strong>{formatCurrency(taxAmount)} đ</strong></span></div>
        </div>
    </section>;
}
