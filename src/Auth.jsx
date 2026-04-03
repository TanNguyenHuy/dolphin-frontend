import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, KeyRound, CheckCircle2, ArrowLeft, Eye, EyeOff, LogIn, UserPlus, RefreshCw } from 'lucide-react';

// DÁN LINK RENDER CỦA BẠN VÀO ĐÂY (Nhớ giữ lại chữ /api ở cuối nhé)
const API_URL = 'https://dolphin-backend-abcd.onrender.com/api';
export default function Auth({ onLoginSuccess }) {
    const [viewMode, setViewMode] = useState('login');
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const switchMode = (mode) => { setViewMode(mode); setError(''); setSuccessMsg(''); setOtp(''); setOtpSent(false); setShowPassword(false); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSuccessMsg(''); setIsLoading(true);
        try {
            if (viewMode === 'register' || viewMode === 'forgot') {
                if (!otpSent) {
                    await axios.post(`${API_URL}/send-otp`, { email: formData.email, type: viewMode });
                    setOtpSent(true); setSuccessMsg('Mã OTP đã được gửi vào Email!');
                } else {
                    if (viewMode === 'register') {
                        await axios.post(`${API_URL}/register`, { ...formData, otp });
                        alert('🎉 Tạo tài khoản thành công! Hãy đăng nhập.');
                        switchMode('login');
                    } else {
                        await axios.post(`${API_URL}/reset-password`, { email: formData.email, otp, newPassword: formData.password });
                        alert('✅ Khôi phục mật khẩu thành công! Hãy đăng nhập lại.');
                        switchMode('login');
                    }
                }
            } else {
                const res = await axios.post(`${API_URL}/login`, { email: formData.email, password: formData.password });
                if (res.data.success) onLoginSuccess(res.data.user, rememberMe);
            }
        } catch (err) { setError(err.response?.data?.error || 'Có lỗi xảy ra!'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#F0F8FA] relative overflow-hidden font-sans p-4">
            {/* Background Orbs */}
            <div className="absolute top-[-15%] left-[-15%] w-[65vw] h-[65vw] bg-[#33A1FD] rounded-full blur-[120px] opacity-40"></div>
            <div className="absolute bottom-[-15%] right-[-15%] w-[60vw] h-[60vw] bg-[#26D0CE] rounded-full blur-[120px] opacity-40"></div>

            {/* Form Card */}
            <div className="w-full max-w-[440px] bg-white/60 backdrop-blur-2xl border border-white/60 p-8 md:p-10 rounded-[32px] shadow-[0_24px_48px_rgba(0,0,0,0.08)] relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-white rounded-full p-1.5 shadow-md border border-[#26D0CE]/30">
                        <img src="/logo.png" className="w-full h-full object-cover rounded-full" alt="Logo" onError={(e) => e.target.style.display='none'}/>
                    </div>
                </div>

                <h1 className="text-[28px] font-black text-center text-[#1D1D1F] mb-1">
                    {viewMode === 'login' ? 'Mừng Trở Lại!' : viewMode === 'register' ? 'Tạo Tài Khoản' : 'Khôi Phục Mật Khẩu'}
                </h1>
                <p className="text-center text-[#5c5c5c] text-[14px] font-medium mb-8">
                    {viewMode === 'login' ? 'Dolphin_97ers Financial Workspace' : viewMode === 'register' ? 'Tài khoản đầu tiên sẽ là Admin' : 'Nhập email để nhận mã xác minh'}
                </p>

                {error && <div className="bg-[#FF3B30]/10 text-[#FF3B30] text-[13px] font-bold px-4 py-2.5 rounded-2xl mb-4 text-center">{error}</div>}
                {successMsg && <div className="bg-[#1DB2A0]/10 text-[#1DB2A0] text-[13px] font-bold px-4 py-2.5 rounded-2xl mb-4 text-center flex items-center justify-center gap-2"><CheckCircle2 size={16}/> {successMsg}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {viewMode === 'register' && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User size={18} className="text-[#8E8E93]" /></div>
                            <input type="text" placeholder="Tên hiển thị" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} disabled={otpSent} className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white/80 focus:border-[#26D0CE] focus:bg-white rounded-2xl text-[15px] font-medium text-[#1D1D1F] outline-none transition-all shadow-sm disabled:opacity-60" />
                        </div>
                    )}

                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail size={18} className="text-[#8E8E93]" /></div>
                        <input type="email" placeholder="Email" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} disabled={otpSent} className="w-full pl-11 pr-4 py-3.5 bg-white/50 border border-white/80 focus:border-[#26D0CE] focus:bg-white rounded-2xl text-[15px] font-medium text-[#1D1D1F] outline-none transition-all shadow-sm disabled:opacity-60" />
                    </div>

                    {(viewMode === 'login' || viewMode === 'register' || otpSent) && (
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock size={18} className="text-[#8E8E93]" /></div>
                            <input type={showPassword ? "text" : "password"} placeholder={viewMode === 'forgot' ? "Mật khẩu MỚI" : "Mật khẩu"} required value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} disabled={viewMode==='register' && otpSent} className="w-full pl-11 pr-12 py-3.5 bg-white/50 border border-white/80 focus:border-[#26D0CE] focus:bg-white rounded-2xl text-[15px] font-medium text-[#1D1D1F] outline-none transition-all shadow-sm disabled:opacity-60" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#8E8E93] hover:text-[#1DB2A0] transition-colors">
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    )}

                    {otpSent && (
                        <div className="relative mt-2">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><KeyRound size={18} className="text-[#26D0CE]" /></div>
                            <input type="text" placeholder="Nhập mã OTP (6 số)" required value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} className="w-full pl-11 pr-4 py-3.5 bg-[#26D0CE]/10 border border-[#26D0CE]/40 focus:border-[#26D0CE] focus:bg-[#26D0CE]/20 rounded-2xl text-[18px] font-black text-center text-[#1A5B82] outline-none transition-all shadow-sm tracking-[4px]" />
                        </div>
                    )}

                    {viewMode === 'login' && (
                        <div className="flex items-center justify-between pt-1 pb-2 px-1">
                            <label className="flex items-center gap-2 cursor-pointer text-[#5c5c5c] text-[13px] font-medium hover:text-[#1D1D1F] transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded text-[#26D0CE] focus:ring-[#26D0CE] cursor-pointer" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>
                                Ghi nhớ tôi
                            </label>
                            <button type="button" onClick={()=>switchMode('forgot')} className="text-[#33A1FD] text-[13px] font-semibold hover:underline">Quên mật khẩu?</button>
                        </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white rounded-2xl font-bold text-[15px] uppercase tracking-wide hover:opacity-90 transition-all shadow-[0_8px_16px_rgba(38,208,206,0.3)] disabled:opacity-50 active:scale-[0.98] flex justify-center items-center gap-2 mt-2">
                        {isLoading ? <RefreshCw size={20} className="animate-spin"/> : (
                            viewMode === 'login' ? <><LogIn size={20}/> ĐĂNG NHẬP</> :
                            viewMode === 'register' ? (otpSent ? 'XÁC NHẬN & TẠO' : <><UserPlus size={20}/> GỬI MÃ OTP</>) :
                            (otpSent ? 'ĐẶT LẠI MẬT KHẨU' : 'GỬI MÃ KHÔI PHỤC')
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/60 text-center">
                    {viewMode === 'login' ? (
                        <p className="text-[#5c5c5c] text-[14px] font-medium">Chưa có tài khoản? <button onClick={() => switchMode('register')} className="text-[#1A5B82] font-bold hover:underline">Tạo mới ngay</button></p>
                    ) : (
                        <p className="text-[#5c5c5c] text-[14px] font-medium flex items-center justify-center gap-1 cursor-pointer hover:text-[#1A5B82]" onClick={() => switchMode('login')}>
                            <ArrowLeft size={16}/> Đã có tài khoản? Đăng nhập
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}