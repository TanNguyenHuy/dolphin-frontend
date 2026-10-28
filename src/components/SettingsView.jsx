import { useState } from 'react';
import { ArrowLeft, Settings, Store, Palette, MessageCircle, Save, RotateCcw } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../settings';

const themes = [
    { value: 'ocean', name: 'Xanh biển', color: 'linear-gradient(135deg, #e0f2fe, #87ceeb)' },
    { value: 'mint', name: 'Xanh bạc hà', color: 'linear-gradient(135deg, #e6faf5, #98dccb)' },
    { value: 'neutral', name: 'Trung tính', color: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' },
];

function Toggle({ checked, onChange, title, description }) {
    return (
        <label className="flex items-center justify-between gap-4 py-4 cursor-pointer">
            <span><span className="block font-bold text-gray-800">{title}</span><span className="block text-sm text-gray-500 mt-1">{description}</span></span>
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-5 h-5 shrink-0 accent-[#168b83]" />
        </label>
    );
}

export default function SettingsView({ settings, onSave, onBack }) {
    const [draft, setDraft] = useState({ ...settings });
    const [feedback, setFeedback] = useState(null);
    const dirty = JSON.stringify(draft) !== JSON.stringify(settings);
    const update = (field, value) => { setDraft(prev => ({ ...prev, [field]: value })); setFeedback(null); };
    const save = (event) => {
        event.preventDefault();
        if (!draft.storeName.trim()) { setFeedback({ error: true, message: 'Vui lòng nhập tên cửa hàng.' }); return; }
        try {
            const saved = onSave(draft);
            setDraft(saved);
            setFeedback({ error: false, message: 'Đã lưu cài đặt trên trình duyệt này.' });
        } catch {
            setFeedback({ error: true, message: 'Không thể lưu cài đặt. Hãy kiểm tra quyền lưu dữ liệu của trình duyệt và thử lại.' });
        }
    };
    const card = 'bg-white/90 border border-white rounded-[28px] p-5 sm:p-8 shadow-sm';
    return (
        <div className="max-w-4xl mx-auto py-3 sm:py-6">
            <button type="button" onClick={onBack} className="flex items-center gap-2 text-[#1A5B82] font-bold mb-6 px-4 py-3 rounded-full bg-white/80 hover:bg-white"><ArrowLeft size={18} /> Về thống kê</button>
            <div className="flex items-center gap-3 mb-3"><Settings size={30} className="text-[#168b83]" /><h1 className="text-3xl font-black">Cài đặt</h1></div>
            <p className="text-gray-600 mb-7">Tùy chỉnh Dolphin theo cách bạn làm việc. Cài đặt chỉ áp dụng cho tài khoản hiện tại trên trình duyệt này.</p>
            <form onSubmit={save} className="space-y-5">
                <section className={card} aria-labelledby="store-settings-title">
                    <h2 id="store-settings-title" className="font-black text-lg flex items-center gap-2 mb-5"><Store size={21} className="text-[#168b83]" /> Thông tin cửa hàng</h2>
                    <div className="grid sm:grid-cols-2 gap-5">
                        <label className="block text-sm font-bold text-gray-700">Tên cửa hàng
                            <input required maxLength={60} value={draft.storeName} onChange={e => update('storeName', e.target.value)} className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                            <span className="block mt-2 font-normal text-gray-500">Hiển thị ở đầu thanh bên.</span>
                        </label>
                        <label className="block text-sm font-bold text-gray-700">Số điện thoại liên hệ
                            <input type="tel" maxLength={30} autoComplete="tel" placeholder="Chưa có số liên hệ" value={draft.contactPhone} onChange={e => update('contactPhone', e.target.value)} className="mt-2 w-full border border-gray-200 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500" />
                            <span className="block mt-2 font-normal text-gray-500">Không bắt buộc. Hiển thị dưới tên cửa hàng.</span>
                        </label>
                    </div>
                </section>
                <section className={card} aria-labelledby="appearance-settings-title">
                    <h2 id="appearance-settings-title" className="font-black text-lg flex items-center gap-2 mb-5"><Palette size={21} className="text-[#168b83]" /> Giao diện</h2>
                    <fieldset><legend className="text-sm font-bold text-gray-700 mb-3">Màu nền</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {themes.map(theme => (
                                <label key={theme.value} className={`cursor-pointer rounded-2xl border-2 p-3 ${draft.theme === theme.value ? 'border-teal-600 bg-teal-50' : 'border-gray-200'}`}>
                                    <span className="block h-16 rounded-xl mb-3" style={{ background: theme.color }} />
                                    <span className="flex items-center gap-2 font-bold text-sm"><input type="radio" name="theme" value={theme.value} checked={draft.theme === theme.value} onChange={() => update('theme', theme.value)} className="accent-[#168b83]" />{theme.name}</span>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                    <div className="mt-4 border-t border-gray-100"><Toggle checked={draft.reduceMotion} onChange={value => update('reduceMotion', value)} title="Giảm chuyển động" description="Giảm hiệu ứng chuyển cảnh, nền động và pháo hoa." /></div>
                </section>
                <section className={card} aria-labelledby="chat-settings-title">
                    <h2 id="chat-settings-title" className="font-black text-lg flex items-center gap-2"><MessageCircle size={21} className="text-[#168b83]" /> Trò chuyện</h2>
                    <Toggle checked={draft.showChat} onChange={value => update('showChat', value)} title="Hiển thị khung chat" description="Bật hoặc ẩn nút trò chuyện ở góc màn hình." />
                </section>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <button type="button" onClick={() => { setDraft({ ...DEFAULT_SETTINGS }); setFeedback(null); }} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-gray-600 font-bold hover:bg-gray-50"><RotateCcw size={18} /> Đặt về mặc định</button>
                    <button type="submit" disabled={!dirty} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#168b83] text-white font-bold hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed"><Save size={18} /> Lưu cài đặt</button>
                </div>
                <p role="status" aria-live="polite" className={`min-h-6 text-sm ${feedback?.error ? 'text-red-700' : 'text-teal-800'}`}>{feedback?.message || (dirty ? 'Có thay đổi chưa lưu. Bấm Lưu cài đặt để áp dụng.' : '')}</p>
            </form>
        </div>
    );
}
