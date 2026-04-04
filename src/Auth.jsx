import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, LogIn, UserPlus, ArrowLeft, Eye, EyeOff, RefreshCw, Fish, KeyRound } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess }) {
    const [isLogin, setIsLogin] = useState(true);
    const [step, setStep] = useState(1); // Bước 1: Điền TT, Bước 2: Nhập OTP
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // XỬ LÝ GỬI MÃ OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError(''); setSuccessMsg(''); setIsLoading(true);
        try {
            const res = await axios.post(`${API_URL}/send-otp`, { email: formData.email, type: 'register' });
            setSuccessMsg(res.data.message);
            setStep(2); // Chuyển sang giao diện nhập OTP
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi gửi mail!');
        } finally {
            setIsLoading(false);
        }
    };

    // XỬ LÝ ĐĂNG NHẬP HOẶC HOÀN TẤT ĐĂNG KÝ
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccessMsg(''); setIsLoading(true);

        try {
            if (isLogin) {
                // ĐĂNG NHẬP
                const res = await axios.post(`${API_URL}/login`, { email: formData.email, password: formData.password });
                if (res.data.user) onLoginSuccess(res.data.user, true);
            } else {
                // HOÀN TẤT ĐĂNG KÝ BẰNG MÃ OTP
                const res = await axios.post(`${API_URL}/register`, formData);
                if (res.data.user) onLoginSuccess(res.data.user, true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Sai thông tin!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F0F8FA] font-sans">
            <div className="w-full max-w-[440px] bg-white/70 backdrop-blur-2xl rounded-[40px] p-8 md:p-10 shadow-2xl border border-white/50 animate-scale-up">
                
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#33A1FD] to-[#26D0CE] rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <Fish size={32} className="text-white" />
                    </div>
                    <h1 className="text-[28px] font-black text-[#1D1D1F] tracking-tight">
                        {isLogin ? 'Mừng Trở Lại!' : (step === 1 ? 'Tạo Tài Khoản' : 'Nhập Mã OTP')}
                    </h1>
                    <p className="text-[14px] text-[#86868B] font-medium mt-1 text-center">
                        {isLogin ? 'Dolphin_97ers Workspace' : (step === 1 ? 'Nhập thông tin bên dưới' : `Mã 6 số đã được gửi tới ${formData.email}`)}
                    </p>
                </div>

                {error && <div className="mb-6 p-4 bg-[#FF3B30]/10 border border-[#FF3B30]/20 rounded-2xl text-[#FF3B30] text-[13px] font-bold text-center">{error}</div>}
                {successMsg && <div className="mb-6 p-4 bg-[#1DB2A0]/10 border border-[#1DB2A0]/20 rounded-2xl text-[#1DB2A0] text-[13px] font-bold text-center">{successMsg}</div>}

                <form onSubmit={!isLogin && step === 1 ? handleSendOTP : handleSubmit} className="space-y-4">
                    
                    {/* BƯỚC 1: NHẬP THÔNG TIN */}
                    {step === 1 && (
                        <>
                            {!isLogin && (
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                                    <input required type="text" placeholder="Tên của bạn" className="w-full pl-12 pr-4 py-4 bg-white/50 border border-[#d2d2d7] rounded-2xl outline-none focus:border-[#33A1FD] transition-all text-[15px]" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                            )}

                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                                <input required type="email" placeholder="Email" className="w-full pl-12 pr-4 py-4 bg-white/50 border border-[#d2d2d7] rounded-2xl outline-none focus:border-[#33A1FD] transition-all text-[15px]" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>

                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                                <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" className="w-full pl-12 pr-12 py-4 bg-white/50 border border-[#d2d2d7] rounded-2xl outline-none focus:border-[#33A1FD] transition-all text-[15px]" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B]">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                            </div>
                        </>
                    )}

                    {/* BƯỚC 2: NHẬP OTP MỚI HIỆN Ô NÀY */}
                    {!isLogin && step === 2 && (
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868B]" size={20} />
                            <input required type="text" placeholder="Nhập 6 số OTP" className="w-full pl-12 pr-4 py-4 bg-[#33A1FD]/5 border border-[#33A1FD]/30 rounded-2xl outline-none focus:border-[#33A1FD] text-center font-bold text-[18px] tracking-[0.5em] text-[#1D1D1F]" value={formData.otp} onChange={e => setFormData({ ...formData, otp: e.target.value })} maxLength={6} />
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white rounded-2xl font-bold text-[16px] shadow-xl hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                        {isLoading ? <RefreshCw size={22} className="animate-spin" /> : (
                            isLogin ? <><LogIn size={20} /> ĐĂNG NHẬP</> : (step === 1 ? 'GỬI MÃ OTP' : 'XÁC NHẬN ĐĂNG KÝ')
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button type="button" onClick={() => { setIsLogin(!isLogin); setStep(1); setError(''); setSuccessMsg(''); }} className="text-[14px] font-semibold text-[#33A1FD] hover:underline flex items-center justify-center gap-2 mx-auto">
                        {isLogin ? 'Chưa có tài khoản? Tạo mới ngay' : <><ArrowLeft size={16} /> Quay lại đăng nhập</>}
                    </button>
                </div>
                
            </div>
        </div>
    );
}
