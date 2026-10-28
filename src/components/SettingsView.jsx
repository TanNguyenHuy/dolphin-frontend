import { useState, useId } from 'react';
import { ArrowLeft, Settings, Store, Palette, MessageCircle, Save, RotateCcw, Type, ChartNoAxesCombined, CalendarDays, PanelsTopLeft, ChevronDown } from 'lucide-react';
import { DEFAULT_SETTINGS, THEMES, FONTS, FONT_SIZES, appearanceVariables } from '../settings';

function Toggle({ checked, onChange, title, description }) {
    return <label className="setting-toggle"><span><strong>{title}</strong><small>{description}</small></span><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} /></label>;
}

function Select({ label, value, options, onChange, description }) {
    const descriptionId = useId();
    return <label className="setting-field"><span>{label}</span><select aria-label={label} aria-describedby={description ? descriptionId : undefined} value={value} onChange={event => onChange(event.target.value)}>{options.map(option => <option key={option.value} value={option.value}>{option.name}</option>)}</select>{description && <small id={descriptionId}>{description}</small>}</label>;
}

function Section({ id, icon: Icon, title, children }) {
    return <section id={id} className="settings-section" aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}><Icon size={21} />{title}</h2>{children}</section>;
}

function Preview({ draft }) {
    const [expanded, setExpanded] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1100px)').matches);
    const theme = THEMES.find(item => item.value === draft.theme);
    const curve = draft.chartCurve === 'step' ? 'M5 65 H25 V45 H50 V55 H75 V20 H100 V30 H125 V10' : draft.chartCurve === 'linear' ? 'M5 65 L25 45 L50 55 L75 20 L100 30 L125 10' : 'M5 65 Q20 35 35 45 T65 35 T95 25 T125 10';
    return <aside className="appearance-preview" aria-label="Xem trước giao diện" style={appearanceVariables(draft)}>
        <button type="button" className="preview-title" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}><span className="preview-dot" />Xem trước<ChevronDown size={16} /></button>
        {expanded && <><div className={`preview-canvas preview-layout-${draft.layout} preview-density-${draft.density}`}>
            <div className="preview-store">{draft.storeName || 'Dolphin'}</div>
            <div className="preview-metric"><small>Doanh thu minh họa</small><strong>12.500.000 đ</strong><span>24 sản phẩm đã bán</span></div>
            <div className="preview-chart"><svg viewBox="0 0 130 80" role="img" aria-label={`Biểu đồ ${draft.chartType}`}>
                {[20, 40, 60].map(y => <path key={y} d={`M0 ${y} H130`} stroke="#e2e8f0" strokeDasharray="3 3" />)}
                {draft.chartType === 'bar' ? [25, 45, 35, 60, 50, 70].map((height, index) => <rect key={index} x={index * 22 + 2} y={80 - height} width="12" height={height} rx="3" fill={theme.accent} />) : <><path d={draft.chartType === 'area' ? `${curve} L125 80 L5 80 Z` : curve} fill={draft.chartType === 'area' ? theme.soft : 'none'} stroke={theme.accent} strokeWidth="3" /></>}
            </svg></div>
            <div className="preview-calendar">{draft.calendarView === 'agenda' ? <><p>28/10 · Giao hàng</p><p>29/10 · Kiểm kho</p></> : [26, 27, 28, 29, 30, 31, 1].map(day => <span className={day === 28 ? 'is-selected' : ''} key={day}>{day}{draft.showLunar && <small>{day === 28 ? '19' : '·'}</small>}</span>)}</div>
        </div>
        <p>Minh họa bằng dữ liệu mẫu. Bấm Lưu cài đặt để áp dụng cho toàn ứng dụng.</p></>}
    </aside>;
}

export default function SettingsView({ settings, onSave, onBack }) {
    const [draft, setDraft] = useState({ ...settings });
    const [feedback, setFeedback] = useState(null);
    const dirty = JSON.stringify(draft) !== JSON.stringify(settings);
    const update = (field, value) => { setDraft(previous => ({ ...previous, [field]: value })); setFeedback(null); };
    const save = event => {
        event.preventDefault();
        if (!draft.storeName.trim()) { setFeedback({ error: true, message: 'Vui lòng nhập tên cửa hàng.' }); return; }
        try {
            const saved = onSave(draft);
            setDraft(saved);
            setFeedback({ error: false, message: 'Đã lưu cài đặt trên trình duyệt này.' });
        } catch { setFeedback({ error: true, message: 'Không thể lưu cài đặt. Kiểm tra quyền lưu dữ liệu của trình duyệt rồi thử lại.' }); }
    };
    const options = pairs => pairs.map(([value, name]) => ({ value, name }));
    return <div className="settings-page animate-fade-in-up">
        <button type="button" onClick={onBack} className="settings-back"><ArrowLeft size={18} />Về thống kê</button>
        <header className="settings-heading"><h1><Settings size={28} />Cài đặt</h1><p>Tạo không gian làm việc dễ đọc theo cách của bạn. Tùy chọn được lưu riêng theo tài khoản trên trình duyệt này.</p></header>
        <form onSubmit={save}>
            <div className="settings-columns">
                <div className="settings-fields">
                    <Section id="settings-type" icon={Type} title="Chữ và khả năng đọc">
                        <div className="settings-field-grid"><Select label="Phông chữ" value={draft.fontFamily} options={FONTS} onChange={value => update('fontFamily', value)} description="Dùng phông có sẵn trên thiết bị, hỗ trợ tiếng Việt." /><Select label="Cỡ chữ" value={draft.fontSize} options={FONT_SIZES} onChange={value => update('fontSize', value)} description="Áp dụng cho nội dung, biểu mẫu và số liệu." /></div>
                    </Section>
                    <Section id="settings-colors" icon={Palette} title="Màu giao diện">
                        <fieldset><legend className="sr-only">Chọn bảng màu</legend><div className="theme-options">{THEMES.map(theme => <label key={theme.value} className={`theme-option ${draft.theme === theme.value ? 'is-selected' : ''}`}><span className="theme-swatch" style={{ background: `linear-gradient(135deg, ${theme.from}, ${theme.to})` }}><i style={{ background: theme.accent }} /></span><span><input type="radio" name="theme" value={theme.value} checked={draft.theme === theme.value} onChange={() => update('theme', theme.value)} />{theme.name}</span></label>)}</div></fieldset>
                    </Section>
                    <Section id="settings-charts" icon={ChartNoAxesCombined} title="Biểu đồ">
                        <div className="settings-field-grid"><Select label="Kiểu biểu đồ" value={draft.chartType} options={options([['area', 'Miền'], ['line', 'Đường'], ['bar', 'Cột']])} onChange={value => update('chartType', value)} /><Select label="Đường nối dữ liệu" value={draft.chartCurve} options={options([['monotone', 'Đường cong mềm'], ['linear', 'Đường thẳng'], ['step', 'Bậc thang']])} onChange={value => update('chartCurve', value)} description="Áp dụng cho biểu đồ miền và đường; biểu đồ cột giữ nguyên." /></div>
                    </Section>
                    <Section id="settings-calendar" icon={CalendarDays} title="Lịch">
                        <div className="settings-field-grid"><Select label="Cách hiển thị lịch" value={draft.calendarView} options={options([['month', 'Lưới tháng'], ['agenda', 'Danh sách theo ngày']])} onChange={value => update('calendarView', value)} description="Danh sách giúp đọc nội dung dài trên điện thoại." /><Select label="Hình dạng ô ngày" value={draft.calendarShape} options={options([['circle', 'Tròn'], ['rounded', 'Bo góc'], ['square', 'Vuông']])} onChange={value => update('calendarShape', value)} /></div>
                        <Toggle title="Hiển thị âm lịch" description="Hiện ngày âm bên cạnh ngày dương trên lịch." checked={draft.showLunar} onChange={value => update('showLunar', value)} />
                    </Section>
                    <Section id="settings-layout" icon={PanelsTopLeft} title="Bố cục và khoảng cách">
                        <div className="settings-field-grid"><Select label="Bố cục trang tổng quan" value={draft.layout} options={options([['balanced', 'Cân đối · hai cột'], ['wide', 'Rộng · biểu đồ toàn chiều ngang'], ['focused', 'Tập trung · ưu tiên số liệu và đợt bán']])} onChange={value => update('layout', value)} description="Điện thoại luôn tự xếp một cột. Bố cục Tập trung ẩn lịch tổng quan và bảng xếp hạng; lịch cá nhân vẫn ở thanh bên." /><Select label="Mật độ nội dung" value={draft.density} options={options([['comfortable', 'Thoáng · dễ đọc'], ['compact', 'Gọn · nhiều thông tin']])} onChange={value => update('density', value)} /></div>
                    </Section>
                    <Section id="settings-store" icon={Store} title="Thông tin cửa hàng">
                        <div className="settings-field-grid"><label className="setting-field"><span>Tên cửa hàng</span><input required maxLength={60} value={draft.storeName} onChange={event => update('storeName', event.target.value)} /></label><label className="setting-field"><span>Số điện thoại liên hệ</span><input type="tel" maxLength={30} autoComplete="tel" placeholder="Không bắt buộc" value={draft.contactPhone} onChange={event => update('contactPhone', event.target.value)} /></label></div>
                    </Section>
                    <Section id="settings-interaction" icon={MessageCircle} title="Chuyển động và trò chuyện">
                        <Toggle title="Giảm chuyển động" description="Giảm chuyển cảnh, biểu đồ động và pháo hoa." checked={draft.reduceMotion} onChange={value => update('reduceMotion', value)} />
                        <Toggle title="Hiển thị khung chat" description="Bật hoặc ẩn nút trò chuyện ở góc màn hình." checked={draft.showChat} onChange={value => update('showChat', value)} />
                    </Section>
                </div>
                <Preview draft={draft} />
            </div>
            <footer className="settings-actions"><div role="status" aria-live="polite" className={feedback?.error ? 'text-red-700' : 'text-gray-600'}>{feedback?.message || (dirty ? 'Có thay đổi chưa lưu.' : 'Cài đặt đã được lưu.')}</div><div><button type="button" onClick={() => { setDraft({ ...DEFAULT_SETTINGS }); setFeedback(null); }} className="settings-reset"><RotateCcw size={17} />Mặc định</button><button type="submit" disabled={!dirty} className="settings-save"><Save size={17} />Lưu cài đặt</button></div></footer>
        </form>
    </div>;
}
