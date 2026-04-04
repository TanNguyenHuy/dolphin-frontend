import React, { useState } from 'react';
import axios from 'axios';
import { Eye, EyeOff, RefreshCw } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess }) {
    const [view, setView] = useState('LOGIN'); // 'LOGIN', 'REGISTER', 'FORGOT'
    const [step, setStep] = useState(1); // 1: Nhập thông tin, 2: Nhập OTP
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '', newPassword: '' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError(''); setSuccessMsg(''); setIsLoading(true);
        try {
            const type = view === 'REGISTER' ? 'register' : 'forgot';
            const res = await axios.post(`${API_URL}/send-otp`, { email: formData.email, type });
            setSuccessMsg(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi gửi mail!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccessMsg(''); setIsLoading(true);

        try {
            if (view === 'LOGIN') {
                const res = await axios.post(`${API_URL}/login`, { email: formData.email, password: formData.password });
                if (res.data.user) onLoginSuccess(res.data.user, true);
            } 
            else if (view === 'REGISTER') {
                await axios.post(`${API_URL}/register`, formData);
                // Tạo xong KHÔNG VÀO TRANG CHỦ, bắt quay lại Login
                setSuccessMsg('Tạo tài khoản thành công! Vui lòng đăng nhập.');
                setView('LOGIN');
                setStep(1);
                setFormData({ ...formData, password: '', otp: '' });
            } 
            else if (view === 'FORGOT') {
                await axios.post(`${API_URL}/reset-password`, { email: formData.email, otp: formData.otp, newPassword: formData.newPassword });
                setSuccessMsg('Đổi mật khẩu thành công! Vui lòng đăng nhập.');
                setView('LOGIN');
                setStep(1);
                setFormData({ ...formData, password: '', otp: '', newPassword: '' });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Sai thông tin!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-aurora font-sans">
            <div className="w-full max-w-[420px] bg-white/70 backdrop-blur-2xl rounded-[32px] p-8 shadow-xl border border-white/50">
                
                <div className="flex flex-col items-center mb-8">
                    {/* TRẢ LẠI LOGO CŨ CỦA SẾP */}
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 mb-4 overflow-hidden">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" onError={(e) => e.target.style.display='none'} />
                    </div>
                    <h1 className="text-[24px] font-bold text-[#1D1D1F] tracking-tight text-center">
                        {view === 'LOGIN' ? 'Mừng Trở Lại!' : (view === 'REGISTER' ? 'Tạo Tài Khoản' : 'Quên Mật Khẩu')}
                    </h1>
                    <p className="text-[13px] text-[#5c5c5c] font-medium mt-1 text-center">
                        {view === 'LOGIN' ? 'Dolphin_97ers Financial Workspace' : (view === 'REGISTER' ? 'Tài khoản đầu tiên sẽ là Admin' : 'Nhập email để nhận mã khôi phục')}
                    </p>
                </div>

                {error && <div className="mb-6 p-3.5 bg-[#FF3B30]/10 rounded-2xl text-[#FF3B30] text-[13px] font-bold text-center">{error}</div>}
                {successMsg && <div className="mb-6 p-3.5 bg-[#1DB2A0]/10 rounded-2xl text-[#1DB2A0] text-[13px] font-bold text-center">{successMsg}</div>}

                <form onSubmit={view !== 'LOGIN' && step === 1 ? handleSendOTP : handleSubmit} className="space-y-3.5">
                    
                    {view === 'REGISTER' && step === 1 && (
                        <input required type="text" placeholder="Tên của bạn" className="w-full px-4 py-3.5 bg-white border border-[#e5e5ea] rounded-2xl outline-none focus:border-[#26D0CE] text-[14px]" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    )}

                    {step === 1 && (
                        <input required type="email" placeholder="Email" className="w-full px-4 py-3.5 bg-white border border-[#e5e5ea] rounded-2xl outline-none focus:border-[#26D0CE] text-[14px]" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                    )}

                    {view === 'LOGIN' && (
                        <div className="relative">
                            <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" className="w-full pl-4 pr-12 py-3.5 bg-white border border-[#e5e5ea] rounded-2xl outline-none focus:border-[#26D0CE] text-[14px]" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868B]">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                        </div>
                    )}

                    {step === 2 && (
                        <>
                            <input required type="text" placeholder="Nhập mã OTP (6 số)" className="w-full px-4 py-3.5 bg-white border border-[#e5e5ea] rounded-2xl outline-none focus:border-[#26D0CE] text-[14px] text-center font-bold tracking-widest" value={formData.otp} onChange={e => setFormData({ ...formData, otp: e.target.value })} maxLength={6} />
                            {view === 'FORGOT' && (
                                <input required type="password" placeholder="Mật khẩu mới" className="w-full px-4 py-3.5 bg-white border border-[#e5e5ea] rounded-2xl outline-none focus:border-[#26D0CE] text-[14px]" value={formData.newPassword} onChange={e => setFormData({ ...formData, newPassword: e.target.value })} />
                            )}
                            {view === 'REGISTER' && (
                                <input required type="password" placeholder="Mật khẩu của bạn" className="w-full px-4 py-3.5 bg-white border border-[#e5e5ea] rounded-2xl outline-none focus:border-[#26D0CE] text-[14px]" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                            )}
                        </>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full py-3.5 bg-[#42d4d2] text-white rounded-2xl font-bold text-[14px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2">
                        {isLoading ? <RefreshCw size={18} className="animate-spin" /> : (view === 'LOGIN' ? 'ĐĂNG NHẬP' : (step === 1 ? 'GỬI MÃ OTP' : 'XÁC NHẬN'))}
                    </button>
                </form>

                <div className="mt-6 flex flex-col items-center gap-3">
                    {view === 'LOGIN' ? (
                        <>
                            <button type="button" onClick={() => { setView('FORGOT'); setError(''); setSuccessMsg(''); }} className="text-[13px] text-[#5c5c5c] hover:text-[#1D1D1F]">Quên mật khẩu?</button>
                            <button type="button" onClick={() => { setView('REGISTER'); setError(''); setSuccessMsg(''); }} className="text-[13px] text-[#42d4d2] font-semibold hover:underline">Chưa có tài khoản? Tạo mới ngay</button>
                        </>
                    ) : (
                        <button type="button" onClick={() => { setView('LOGIN'); setStep(1); setError(''); setSuccessMsg(''); }} className="text-[13px] text-[#5c5c5c] hover:text-[#1D1D1F] flex items-center gap-1">← Đã có tài khoản? Đăng nhập</button>
                    )}
                </div>
                
            </div>
        </div>
    );
}
