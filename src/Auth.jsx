import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock, Check, Crown, Star, Eye, ShieldCheck } from 'lucide-react';
import { API_URL } from './utils';

const PricingCard = ({ title, price, period, features, color, selected, onSelect, icon: Icon }) => (
    <div 
        onClick={onSelect}
        className={`relative flex-1 p-5 rounded-[24px] cursor-pointer transition-all duration-500 border-2 flex flex-col ${
            selected 
            ? `bg-white shadow-[0_20px_40px_rgba(0,0,0,0.1)] border-transparent scale-105 z-10` 
            : 'bg-white/40 border-white/60 hover:bg-white/60 border-dashed'
        }`}
    >
        {selected && (
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                <Check size={16} strokeWidth={3} />
            </div>
        )}
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${selected ? 'bg-gradient-to-br from-[#33A1FD] to-[#26D0CE] text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
            <Icon size={24} />
        </div>
        <h3 className={`font-bold text-[16px] ${selected ? 'text-[#1D1D1F]' : 'text-gray-500'}`}>{title}</h3>
        <div className="my-3">
            <span className="text-[28px] font-black tracking-tight">{price}</span>
            <span className="text-gray-400 text-[13px] ml-1">/ {period}</span>
        </div>
        <ul className="space-y-2.5 mt-2 flex-1">
            {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-[12px] font-medium text-gray-600">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center ${f.included ? 'text-[#1DB2A0]' : 'text-gray-300'}`}>
                        {f.included ? <Check size={12} strokeWidth={3} /> : <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />}
                    </div>
                    <span className={f.included ? 'text-gray-800' : 'text-gray-400'}>{f.text}</span>
                </li>
            ))}
        </ul>
    </div>
);

export default function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [plan, setPlan] = useState('monthly'); // monthly, half-year, yearly
    const [formData, setSetFormData] = useState({ name: '', email: '', password: '', rememberMe: true });
    const [loading, setLoading] = useState(false);

    const plans = [
        { id: 'monthly', title: 'Cơ Bản', price: '10k', period: 'Tháng', icon: Eye, features: [{ text: 'Xem tổng quan', included: true }, { text: 'Xem chi tiết lô', included: false }, { text: 'Tính toán vốn', included: false }] },
        { id: 'half-year', title: 'Tiêu Chuẩn', price: '50k', period: '6 Tháng', icon: Star, features: [{ text: 'Xem tổng quan', included: true }, { text: 'Xem chi tiết lô', included: true }, { text: 'Hỗ trợ 24/7', included: true }] },
        { id: 'yearly', title: 'V.I.P', price: '100k', period: 'Năm', icon: Crown, features: [{ text: 'Xem chi tiết lô', included: true }, { text: 'Xuất File Excel', included: true }, { text: 'Ưu tiên tính năng', included: true }] }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = isLogin ? '/login' : '/register';
            const payload = isLogin ? { email: formData.email, password: formData.password } : { ...formData, plan };
            const res = await axios.post(`${API_URL}${endpoint}`, payload);
            onLoginSuccess(res.data, formData.rememberMe);
        } catch (err) {
            alert(err.response?.data?.error || "Có lỗi xảy ra!");
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E0F7FA] p-4 font-sans">
            <div className={`bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)] rounded-[40px] flex overflow-hidden transition-all duration-700 ${!isLogin ? 'max-w-[1100px] w-full' : 'max-w-[850px] w-full'}`}>
                
                {/* Panel Trái */}
                <div className={`hidden md:flex flex-col justify-center items-center p-12 text-white transition-all duration-700 bg-gradient-to-br from-[#33A1FD] to-[#26D0CE] ${!isLogin ? 'w-[35%]' : 'w-1/2'}`}>
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[30px] flex items-center justify-center mb-8 shadow-xl">
                        <Crown size={40} />
                    </div>
                    <h1 className="text-[32px] font-black mb-4 text-center leading-tight">
                        {isLogin ? 'Mừng Trở Lại!' : 'Bắt Đầu Kinh Doanh!'}
                    </h1>
                    <p className="text-white/80 text-center text-[15px] leading-relaxed mb-8">
                        {isLogin ? 'Đăng nhập ngay để theo dõi dòng tiền và kho hàng của bạn.' : 'Chọn một gói dịch vụ phù hợp để tối ưu hóa việc quản lý.'}
                    </p>
                    <button onClick={() => setIsLogin(!isLogin)} className="px-10 py-3.5 border-2 border-white/50 rounded-full font-bold hover:bg-white hover:text-[#33A1FD] transition-all active:scale-95">
                        {isLogin ? 'TẠO TÀI KHOẢN' : 'ĐĂNG NHẬP NGAY'}
                    </button>
                </div>

                {/* Form Đăng ký / Đăng nhập */}
                <div className={`p-8 md:p-12 transition-all duration-700 ${!isLogin ? 'w-[65%]' : 'w-1/2'}`}>
                    <form onSubmit={handleSubmit} className="h-full flex flex-col">
                        <h2 className="text-[28px] font-black text-[#1D1D1F] mb-2">{isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}</h2>
                        <p className="text-gray-400 text-[14px] mb-8">Vui lòng nhập thông tin của bạn bên dưới</p>

                        <div className="space-y-4 mb-8">
                            {!isLogin && (
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input required className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-[18px] outline-none focus:border-[#33A1FD] transition-all" placeholder="Tên hiển thị" value={formData.name} onChange={e => setSetFormData({...formData, name: e.target.value})} />
                                </div>
                            )}
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="email" required className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-[18px] outline-none focus:border-[#33A1FD] transition-all" placeholder="Email" value={formData.email} onChange={e => setSetFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="password" required className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-[18px] outline-none focus:border-[#33A1FD] transition-all" placeholder="Mật khẩu" value={formData.password} onChange={e => setSetFormData({...formData, password: e.target.value})} />
                            </div>
                        </div>

                        {!isLogin && (
                            <div className="mb-8 animate-fade-in">
                                <label className="text-[13px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">Chọn gói dịch vụ:</label>
                                <div className="flex gap-3">
                                    {plans.map(p => (
                                        <PricingCard 
                                            key={p.id} 
                                            {...p} 
                                            selected={plan === p.id} 
                                            onSelect={() => setPlan(p.id)} 
                                        />
                                    ))}
                                </div>
                                <p className="text-[11px] text-gray-400 mt-4 italic text-center">* Liên hệ Admin để nhận mã kích hoạt hoặc thanh toán qua MoMo sau khi đăng ký.</p>
                            </div>
                        )}

                        <button disabled={loading} className="w-full py-4 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white rounded-[20px] font-black text-[16px] shadow-lg hover:opacity-90 transition-all active:scale-95 disabled:opacity-50">
                            {loading ? 'ĐANG XỬ LÝ...' : (isLogin ? 'ĐĂNG NHẬP' : 'HOÀN TẤT ĐĂNG KÝ')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
