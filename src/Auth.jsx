import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, KeyRound, CheckCircle2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const API_URL = 'https://dolphin-backend-dkev.onrender.com/api';

export default function Auth({ onLoginSuccess }) {
    const [viewMode, setViewMode] = useState('login'); // 'login', 'register', 'forgot'
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Hai State mới cho Mắt và Ghi nhớ
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const switchMode = (mode) => { setViewMode(mode); setError(''); setSuccessMsg(''); setOtp(''); setOtpSent(false); setShowPassword(false); };

    const handleSubmit = async (e) => {
        e.preventDefault(); setError(''); setSuccessMsg(''); setIsLoading(true);
        try {
            if (viewMode === 'register' || viewMode === 'forgot') {
                if (!otpSent) {
                    await axios.post(`${API_URL}/send-otp`, { email: formData.email, type: viewMode });
                    setOtpSent(true); setSuccessMsg('Mã OTP đã được gửi vào Email của bạn!');
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
                // Truyền thêm biến rememberMe ra ngoài cho App.jsx xử lý
                if (res.data.success) onLoginSuccess(res.data.user, rememberMe);
            }
        } catch (err) { setError(err.response?.data?.error || 'Có lỗi xảy ra!'); }
        finally { setIsLoading(false); }
    };

    return (
        <div className="auth-bg">
            <style>{`
                .auth-bg { background: #F0F8FA; display: flex; justify-content: center; align-items: center; height: 100vh; width: 100vw; font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif; margin: 0; }
                .auth-container { background-color: #fff; border-radius: 24px; box-shadow: 0 14px 28px rgba(0,0,0,0.1); position: relative; overflow: hidden; width: 850px; max-width: 90%; min-height: 500px; }
                .form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; width: 50%; display: flex; flex-direction: column; justify-content: center; padding: 0 40px; text-align: center; background: #fff;}
                .form-left { left: 0; z-index: 2; } .form-right { left: 0; z-index: 1; opacity: 0;}
                .auth-container.right-active .form-left { transform: translateX(100%); opacity: 0; z-index: 1;}
                .auth-container.right-active .form-right { transform: translateX(100%); opacity: 1; z-index: 5; animation: show 0.6s; }
                @keyframes show { 0%, 49.99% { opacity: 0; z-index: 1; } 50%, 100% { opacity: 1; z-index: 5; } }
                .overlay-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s; z-index: 100; }
                .auth-container.right-active .overlay-container { transform: translateX(-100%); }
                .overlay { background: linear-gradient(to right, #33A1FD, #26D0CE); color: #fff; position: relative; left: -100%; height: 100%; width: 200%; transform: translateX(0); transition: transform 0.6s; }
                .auth-container.right-active .overlay { transform: translateX(50%); }
                .overlay-panel { position: absolute; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 40px; text-align: center; top: 0; height: 100%; width: 50%; transform: translateX(0); transition: transform 0.6s; }
                .overlay-left { transform: translateX(-20%); } .auth-container.right-active .overlay-left { transform: translateX(0); }
                .overlay-right { right: 0; transform: translateX(0); } .auth-container.right-active .overlay-right { transform: translateX(20%); }
                .auth-input-group { background: #f4f6f8; padding: 14px 18px; margin: 8px 0; width: 100%; border-radius: 14px; display: flex; align-items: center; gap: 10px; border: 1px solid transparent; transition: all 0.3s; position: relative;}
                .auth-input-group:focus-within { border: 1px solid #26D0CE; background: #fff;}
                .auth-input-group input { background: transparent; border: none; outline: none; width: 100%; font-size: 15px; color: #1D1D1F;}
                .auth-input-group input:disabled { color: #8E8E93; }
                .auth-btn { border-radius: 20px; background: linear-gradient(to right, #33A1FD, #26D0CE); color: #fff; font-size: 13px; font-weight: bold; padding: 14px 50px; text-transform: uppercase; cursor: pointer; margin-top: 5px; border:none; width:100%;}
                .auth-btn:disabled { opacity: 0.6; } .auth-btn.ghost { background: transparent; border: 2px solid #fff; }
                .mobile-switch { display: none; color: #33A1FD; font-weight: bold; margin-top: 15px; cursor:pointer;}
                @media (max-width: 768px) { .auth-container { min-height: 550px; max-width: 95%; } .overlay-container { display: none; } .form-container { width: 100%; } .form-left { opacity: 1; z-index: 5; } .form-right { opacity: 0; z-index: 1; } .auth-container.right-active .form-left { opacity: 0; z-index: 1; transform: none;} .auth-container.right-active .form-right { opacity: 1; z-index: 5; transform: none;} .mobile-switch { display: block; } }
            `}</style>
            
            <div className={`auth-container ${viewMode === 'register' ? 'right-active' : ''}`}>
                
                {/* --- KHU VỰC BÊN TRÁI: ĐĂNG NHẬP HOẶC QUÊN MẬT KHẨU --- */}
                <div className="form-container form-left">
                    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                        {viewMode === 'forgot' ? (
                            <>
                                <button type="button" onClick={()=>switchMode('login')} className="absolute top-6 left-6 text-[#5c5c5c] flex items-center gap-1 hover:text-[#1A5B82] font-semibold"><ArrowLeft size={16}/> Quay lại</button>
                                <h1 className="text-[28px] font-black text-[#1D1D1F] mb-2">Khôi Phục Mật Khẩu</h1>
                                <span className="text-[#8E8E93] text-[13px] mb-6">Nhập Email để nhận mã xác minh</span>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 mb-4 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] rounded-full p-1 shadow-lg"><img src="/logo.png" className="w-full h-full object-cover rounded-full border-2 border-white"/></div>
                                <h1 className="text-[32px] font-black text-[#1D1D1F] mb-2">Đăng Nhập</h1>
                                <span className="text-[#8E8E93] text-[13px] mb-6">Dolphin_97ers Financial Workspace</span>
                            </>
                        )}

                        {error && <span className="text-[#FF3B30] font-bold mb-2 text-[13px] bg-[#FF3B30]/10 px-3 py-1.5 rounded-full">{error}</span>}
                        {successMsg && <span className="text-[#1DB2A0] font-bold mb-2 text-[13px] bg-[#1DB2A0]/10 px-3 py-1.5 rounded-full">{successMsg}</span>}

                        <div className="auth-input-group">
                            <Mail size={18} className="text-[#8E8E93] shrink-0"/>
                            <input type="email" placeholder="Email" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} disabled={otpSent}/>
                        </div>
                        
                        {(viewMode === 'login' || otpSent) && (
                            <div className="auth-input-group">
                                <Lock size={18} className="text-[#8E8E93] shrink-0"/>
                                <input type={showPassword ? "text" : "password"} placeholder={viewMode === 'forgot' ? "Mật khẩu MỚI" : "Mật khẩu"} required value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="pr-8"/>
                                <button type="button" className="absolute right-4 text-[#8E8E93] hover:text-[#1DB2A0] transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        )}

                        {viewMode === 'login' && (
                            <div className="w-full flex items-center justify-between mt-2 mb-3 px-2">
                                <label className="flex items-center gap-2 cursor-pointer text-[#5c5c5c] text-[13px] font-medium hover:text-[#1D1D1F] transition-colors">
                                    <input type="checkbox" className="w-4 h-4 rounded cursor-pointer" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}/>
                                    Ghi nhớ tôi
                                </label>
                                <span className="text-[#33A1FD] text-[13px] font-semibold cursor-pointer hover:underline" onClick={()=>switchMode('forgot')}>Quên mật khẩu?</span>
                            </div>
                        )}

                        {otpSent && viewMode === 'forgot' && (
                            <div className="auth-input-group border-[#26D0CE] bg-[#26D0CE]/5 mt-2"><KeyRound size={18} className="text-[#26D0CE]"/><input type="text" placeholder="Nhập mã OTP (6 số)" required value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} className="tracking-[4px] font-black text-center text-[#1A5B82] text-[18px]"/></div>
                        )}

                        <button className="auth-btn" type="submit" disabled={isLoading}>{isLoading ? 'Đang xử lý...' : (viewMode === 'forgot' ? (otpSent ? 'ĐẶT LẠI MẬT KHẨU' : 'GỬI MÃ KHÔI PHỤC') : 'ĐĂNG NHẬP')}</button>
                        
                        <a className="mobile-switch" onClick={() => switchMode('register')}>Chưa có tài khoản? Tạo mới</a>
                    </form>
                </div>
                
                {/* --- KHU VỰC BÊN PHẢI: ĐĂNG KÝ TÀI KHOẢN --- */}
                <div className="form-container form-right">
                    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                        <h1 className="text-[32px] font-black text-[#1D1D1F] mb-2">Tạo Tài Khoản</h1>
                        <span className="text-[#8E8E93] text-[13px] mb-6">Tài khoản đầu tiên sẽ là Admin (Chủ web)</span>
                        
                        {error && <span className="text-[#FF3B30] font-bold mb-2 text-[13px] bg-[#FF3B30]/10 px-3 py-1.5 rounded-full">{error}</span>}
                        {successMsg && <span className="text-[#1DB2A0] font-bold mb-2 text-[13px] bg-[#1DB2A0]/10 px-3 py-1.5 rounded-full"><CheckCircle2 size={14} className="inline"/> {successMsg}</span>}

                        <div className="auth-input-group"><User size={18} className="text-[#8E8E93] shrink-0"/><input type="text" placeholder="Tên hiển thị" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} disabled={otpSent}/></div>
                        <div className="auth-input-group"><Mail size={18} className="text-[#8E8E93] shrink-0"/><input type="email" placeholder="Email đăng nhập" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} disabled={otpSent}/></div>
                        
                        <div className="auth-input-group">
                            <Lock size={18} className="text-[#8E8E93] shrink-0"/>
                            <input type={showPassword ? "text" : "password"} placeholder="Mật khẩu" required value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="pr-8" disabled={otpSent}/>
                            <button type="button" className="absolute right-4 text-[#8E8E93] hover:text-[#1DB2A0] transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                        </div>
                        
                        {otpSent && (
                            <div className="auth-input-group border-[#26D0CE] bg-[#26D0CE]/5 mt-2"><KeyRound size={18} className="text-[#26D0CE] shrink-0"/><input type="text" placeholder="Mã OTP (6 số)" required value={otp} onChange={e=>setOtp(e.target.value)} maxLength={6} className="tracking-[4px] font-black text-center text-[#1A5B82] text-[18px]"/></div>
                        )}

                        <button className="auth-btn mt-6" type="submit" disabled={isLoading}>{isLoading ? 'Đang xử lý...' : (otpSent ? 'XÁC NHẬN & TẠO' : 'GỬI MÃ OTP QUA EMAIL')}</button>
                        {otpSent && <span className="text-[#33A1FD] text-[12px] cursor-pointer mt-3 font-semibold hover:underline" onClick={() => {setOtpSent(false); setSuccessMsg('');}}>Gửi lại mã?</span>}
                        <a className="mobile-switch" onClick={() => switchMode('login')}>Đã có tài khoản? Đăng nhập</a>
                    </form>
                </div>

                {/* VÙNG MÀU LẬT TRANG (CHỈ TRÊN PC) */}
                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h1 className="text-[36px] font-black mb-2">Mừng Trở Lại!</h1>
                            <p className="text-[15px] font-medium leading-relaxed px-4 mb-8">Đăng nhập ngay để tiếp tục quản lý dòng tiền của bạn.</p>
                            <button className="auth-btn ghost" onClick={() => switchMode('login')}>ĐĂNG NHẬP</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h1 className="text-[36px] font-black mb-2">Chào Người Mới!</h1>
                            <p className="text-[15px] font-medium leading-relaxed px-4 mb-8">Đăng ký để sử dụng không gian quản lý tài chính thông minh nhất.</p>
                            <button className="auth-btn ghost" onClick={() => switchMode('register')}>TẠO TÀI KHOẢN</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}