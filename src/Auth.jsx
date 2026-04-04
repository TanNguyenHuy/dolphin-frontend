import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, LogIn, UserPlus, ArrowLeft, Eye, EyeOff, RefreshCw, Fish } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const endpoint = isLogin ? '/login' : '/register';
        
        try {
            const res = await axios.post(`${API_URL}${endpoint}`, formData);
            if (res.data.user) {
                // Đăng ký hay Đăng nhập thành công đều đẩy thẳng vào trang chủ
                onLoginSuccess(res.data.user, true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Đã có lỗi xảy ra từ máy chủ!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F0F8FA] font-sans">
            <div className="w-full max-w-[440px] bg-white/70 backdrop-blur-2xl rounded-[40px] p-8 md:p-10 shadow-2xl border border-white/50 animate-scale-up">
                
                {/* LOGO & TITLE */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#33A1FD] to-[#26D0CE] rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <Fish size={32} className="text-white" />
                    </div>
                    <h1 className="text-[28px] font-black text-[#1D1D1F] tracking-tight">
                        {isLogin ? 'Mừng Trở Lại!' : 'Tạo Tài Khoản'}
                    </h1>
                    <p className="text-[14px] text-[#86868B] font-medium mt-1 text-center">
                        {isLogin ? 'Dolphin_97ers Financial Workspace' : 'Tài khoản đầu tiên sẽ là Admin'}
                    </p>
                </div>

                {/* THÔNG BÁO LỖI */}
                {error && (
                    <div className="mb-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-2xl text-[#FF3B30] text-[13px] font-bold text-center animate-pulse-slow">
                        {error}
                    </div>
                )}

                {/* FORM NHẬP LIỆU */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* TRƯỜNG TÊN (Chỉ hiện khi Đăng ký) */}
                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                            <input
                                required
                                type="text"
                                placeholder="Tên của bạn"
                                className="w-full pl-12 pr-4 py-4 bg-white/50 border border-[#d2d2d7] rounded-2xl outline-none focus:border-[#33A1FD] focus:ring-4 focus:ring-[#33A1FD]/10 transition-all text-[15px] font-medium"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    )}

                    {/* TRƯỜNG EMAIL */}
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                        <input
                            required
                            type="email"
                            placeholder="Email đăng nhập"
                            className="w-full pl-12 pr-4 py-4 bg-white/50 border border-[#d2d2d7] rounded-2xl outline-none focus:border-[#33A1FD] focus:ring-4 focus:ring-[#33A1FD]/10 transition-all text-[15px] font-medium"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    {/* TRƯỜNG MẬT KHẨU */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                        <input
                            required
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mật khẩu"
                            className="w-full pl-12 pr-12 py-4 bg-white/50 border border-[#d2d2d7] rounded-2xl outline-none focus:border-[#33A1FD] focus:ring-4 focus:ring-[#33A1FD]/10 transition-all text-[15px] font-medium"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B] hover:text-[#1D1D1F] transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* NÚT SUBMIT CHÍNH */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white rounded-2xl font-bold text-[16px] shadow-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <RefreshCw size={22} className="animate-spin" />
                        ) : (
                            isLogin ? <><LogIn size={20} /> ĐĂNG NHẬP</> : <><UserPlus size={20} /> ĐĂNG KÝ NGAY</>
                        )}
                    </button>
                </form>

                {/* NÚT CHUYỂN ĐỔI ĐĂNG NHẬP / ĐĂNG KÝ */}
                <div className="mt-8 text-center">
                    <button
                        type="button"
                        onClick={() => { setIsLogin(!isLogin); setError(''); }}
                        className="text-[14px] font-semibold text-[#33A1FD] hover:underline flex items-center justify-center gap-2 mx-auto transition-colors"
                    >
                        {isLogin ? 'Chưa có tài khoản? Tạo mới ngay' : <><ArrowLeft size={16} /> Quay lại đăng nhập</>}
                    </button>
                </div>
                
            </div>
        </div>
    );
}
