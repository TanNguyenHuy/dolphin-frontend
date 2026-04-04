import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Eye, EyeOff, RefreshCw, KeyRound } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess }) {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [view, setView] = useState('LOGIN'); 
    const [step, setStep] = useState(1); 
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '', newPassword: '' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const togglePanel = (toRegister) => {
        setIsRightPanelActive(toRegister);
        setView(toRegister ? 'REGISTER' : 'LOGIN');
        setStep(1); setError(''); setSuccessMsg('');
    };

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
                setSuccessMsg('Tạo tài khoản thành công! Vui lòng đăng nhập.');
                togglePanel(false); 
            } 
            else if (view === 'FORGOT') {
                await axios.post(`${API_URL}/reset-password`, { email: formData.email, otp: formData.otp, newPassword: formData.newPassword });
                setSuccessMsg('Đổi mật khẩu thành công! Vui lòng đăng nhập.');
                setView('LOGIN');
                setStep(1);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Sai thông tin!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 font-sans">
            <div className={`relative w-full max-w-[850px] h-[550px] bg-white rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 ease-in-out ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                
                {/* FORM ĐĂNG KÝ (BÊN PHẢI) */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-10 transition-all duration-700 ease-in-out z-10 ${isRightPanelActive ? 'translate-x-full opacity-100 z-20' : 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'}`}>
                    <form onSubmit={step === 1 ? handleSendOTP : handleSubmit} className="flex flex-col items-center justify-center w-full h-full text-center">
                        <h1 className="font-extrabold text-[28px] mb-2 text-[#333]">Tạo Tài Khoản</h1>
                        <p className="text-[13px] text-gray-500 mb-6">Tài khoản đầu tiên sẽ là Admin (Chủ trọ)</p>
                        
                        {error && <span className="text-[#FF3B30] text-xs mb-3 font-semibold px-2">{error}</span>}
                        {successMsg && <span className="text-[#1DB2A0] text-xs mb-3 font-semibold px-2">{successMsg}</span>}

                        {step === 1 ? (
                            <>
                                <div className="bg-[#f4f8f7] w-full rounded-[16px] flex items-center px-4 py-3.5 mb-3 border border-transparent focus-within:border-[#42d4d2] transition-colors">
                                    <User size={18} className="text-gray-400" />
                                    <input required type="text" placeholder="Tên hiển thị" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-gray-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="bg-[#f4f8f7] w-full rounded-[16px] flex items-center px-4 py-3.5 mb-3 border border-transparent focus-within:border-[#42d4d2] transition-colors">
                                    <Mail size={18} className="text-gray-400" />
                                    <input required type="email" placeholder="Email đăng nhập" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="bg-[#f4f8f7] w-full rounded-[16px] flex items-center px-4 py-3.5 mb-6 relative border border-transparent focus-within:border-[#42d4d2] transition-colors">
                                    <Lock size={18} className="text-gray-400" />
                                    <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] pr-8 text-gray-700" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                </div>
                                <button type="submit" disabled={isLoading} className="rounded-full bg-[#42d4d2] text-white text-[13px] font-bold py-3.5 px-8 tracking-wider transition-transform active:scale-95 hover:bg-[#3bc2c0] w-full shadow-[0_4px_15px_rgba(66,212,210,0.3)] flex justify-center uppercase">
                                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Gửi mã OTP qua Email'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="bg-[#f4f8f7] w-full rounded-[16px] flex items-center px-4 py-3.5 mb-5 border border-transparent focus-within:border-[#42d4d2] transition-colors">
                                    <KeyRound size={18} className="text-[#42d4d2]" />
                                    <input required type="text" placeholder="Nhập mã OTP 6 số" className="bg-transparent outline-none border-none w-full ml-3 text-[16px] text-center font-bold tracking-[0.3em] text-gray-700" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} />
                                </div>
                                <button type="submit" disabled={isLoading} className="rounded-full bg-[#42d4d2] text-white text-[13px] font-bold py-3.5 px-8 tracking-wider transition-transform active:scale-95 hover:bg-[#3bc2c0] w-full shadow-[0_4px_15px_rgba(66,212,210,0.3)] flex justify-center uppercase">
                                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Xác nhận đăng ký'}
                                </button>
                            </>
                        )}
                        <button type="button" onClick={() => togglePanel(false)} className="md:hidden mt-6 text-[#42d4d2] text-[13px] font-semibold underline">Đã có tài khoản? Đăng nhập</button>
                    </form>
                </div>

                {/* FORM ĐĂNG NHẬP / QUÊN MẬT KHẨU (BÊN TRÁI) */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-10 transition-all duration-700 ease-in-out z-20 bg-white ${isRightPanelActive ? 'translate-x-full opacity-0 pointer-events-none' : ''}`}>
                    <form onSubmit={view === 'FORGOT' && step === 1 ? handleSendOTP : handleSubmit} className="flex flex-col items-center justify-center w-full h-full text-center">
                        
                        {/* TRẢ LẠI LOGO XỊN CỦA SẾP */}
                        <div className="w-[52px] h-[52px] bg-[#42d4d2] rounded-full flex items-center justify-center mb-5 shadow-[0_4px_10px_rgba(66,212,210,0.3)] overflow-hidden">
                            <img src="/logo.png" alt="Dolphin Logo" className="w-[32px] h-[32px] object-contain" onError={(e) => { e.target.style.display='none'; }} />
                        </div>
                        
                        <h1 className="font-extrabold text-[28px] mb-2 text-[#333]">
                            {view === 'LOGIN' ? 'Đăng Nhập' : 'Quên Mật Khẩu'}
                        </h1>
                        <p className="text-[13px] text-gray-500 mb-6">
                            {view === 'LOGIN' ? 'Dolphin_97ers Financial Workspace' : 'Nhập email để nhận mã khôi phục'}
                        </p>

                        {error && <span className="text-[#FF3B30] text-xs mb-3 font-semibold px-2">{error}</span>}
                        {successMsg && <span className="text-[#1DB2A0] text-xs mb-3 font-semibold px-2">{successMsg}</span>}

                        {view === 'LOGIN' ? (
                            <>
                                <div className="bg-[#f4f8f7] w-full rounded-[16px] flex items-center px-4 py-3.5 mb-3 border border-transparent focus-within:border-[#42d4d2] transition-colors">
                                    <Mail size={18} className="text-gray-400" />
                                    <input required type="email" placeholder="Email" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="bg-[#f4f8f7] w-full rounded-[16px] flex items-center px-4 py-3.5 mb-5 relative border border-transparent focus-within:border-[#42d4d2] transition-colors">
                                    <Lock size={18} className="text-gray-400" />
                                    <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] pr-8 text-gray-700" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                </div>
                                <button type="submit" disabled={isLoading} className="rounded-full bg-[#42d4d2] text-white text-[13px] font-bold py-3.5 px-8 tracking-wider transition-transform active:scale-95 hover:bg-[#3bc2c0] w-full shadow-[0_4px_15px_rgba(66,212,210,0.3)] flex justify-center uppercase">
                                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Đăng Nhập'}
                                </button>
                                <button type="button" onClick={() => { setView('FORGOT'); setStep(1); setError(''); setSuccessMsg(''); }} className="mt-5 text-[13px] text-gray-500 hover:text-[#42d4d2] transition-colors font-medium">Quên mật khẩu?</button>
                            </>
                        ) : (
                            step === 1 ? (
                                <>
                                    <div className="bg-[#f4f8f7] w-full rounded-[16px] flex items-center px-4 py-3.5 mb-5 border border-transparent focus-within:border-[#42d4d2] transition-colors">
                                        <Mail size={18} className="text-gray-400" />
                                        <input required type="email" placeholder="Email của bạn" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="rounded-full bg-[#42d4d2] text-white text-[13px] font-bold py-3.5 px-8 tracking-wider transition-transform active:scale-95 hover:bg-[#3bc2c0] w-full shadow-[0_4px_15px_rgba(66,212,210,0.3)] flex justify-center uppercase mb-4">
                                        {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Nhận mã OTP'}
                                    </button>
                                    <button type="button" onClick={() => { setView('LOGIN'); setError(''); }} className="text-[13px] text-gray-500 hover:text-[#42d4d2] font-medium">Quay lại đăng nhập</button>
                                </>
                            ) : (
                                <>
                                    <div className="bg-[#f4f8f7] w-full rounded-[16px] flex items-center px-4 py-3.5 mb-3 border border-transparent focus-within:border-[#42d4d2] transition-colors">
                                        <KeyRound size={18} className="text-[#42d4d2]" />
                                        <input required type="text" placeholder="Mã OTP 6 số" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-center tracking-widest font-bold text-gray-700" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} />
                                    </div>
                                    <div className="bg-[#f4f8f7] w-full rounded-[16px] flex items-center px-4 py-3.5 mb-5 relative border border-transparent focus-within:border-[#42d4d2] transition-colors">
                                        <Lock size={18} className="text-gray-400" />
                                        <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu MỚI" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] pr-8 text-gray-700" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                    </div>
                                    <button type="submit" disabled={isLoading} className="rounded-full bg-[#42d4d2] text-white text-[13px] font-bold py-3.5 px-8 tracking-wider transition-transform active:scale-95 hover:bg-[#3bc2c0] w-full shadow-[0_4px_15px_rgba(66,212,210,0.3)] flex justify-center uppercase mb-4">
                                        {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'Đổi mật khẩu'}
                                    </button>
                                    <button type="button" onClick={() => { setView('LOGIN'); setError(''); }} className="text-[13px] text-gray-500 hover:text-[#42d4d2] font-medium">Hủy</button>
                                </>
                            )
                        )}
                        <button type="button" onClick={() => togglePanel(true)} className="md:hidden mt-6 text-[#42d4d2] text-[13px] font-semibold underline">Chưa có tài khoản? Tạo ngay</button>
                    </form>
                </div>

                {/* OVERLAY TRƯỢT (NỀN XANH) - CHỈ HIỆN TRÊN MÁY TÍNH */}
                <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isRightPanelActive ? '-translate-x-full' : ''}`}>
                    <div className={`bg-gradient-to-r from-[#42d4d2] to-[#3bc2c0] relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-1/2' : ''}`}>
                        
                        {/* Nội dung khi đang ở form Đăng ký (Nằm bên trái) */}
                        <div className={`absolute top-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
                            <h1 className="font-extrabold text-[32px] mb-4 drop-shadow-md">Mừng Trở Lại!</h1>
                            <p className="text-[14px] font-medium tracking-wide leading-relaxed mb-8 opacity-90">
                                Đăng nhập ngay để tiếp tục quản lý dòng tiền của bạn.
                            </p>
                            <button onClick={() => togglePanel(false)} className="rounded-full border border-white bg-transparent text-white text-[13px] font-bold py-3.5 px-10 tracking-widest uppercase transition-all hover:bg-white hover:text-[#42d4d2] active:scale-95 shadow-md">
                                Đăng Nhập
                            </button>
                        </div>

                        {/* Nội dung khi đang ở form Đăng nhập (Nằm bên phải) */}
                        <div className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
                            <h1 className="font-extrabold text-[32px] mb-4 drop-shadow-md">Chào Người Mới!</h1>
                            <p className="text-[14px] font-medium tracking-wide leading-relaxed mb-8 opacity-90">
                                Đăng ký để sử dụng không gian quản lý tài chính thông minh nhất.
                            </p>
                            <button onClick={() => togglePanel(true)} className="rounded-full border border-white bg-transparent text-white text-[13px] font-bold py-3.5 px-10 tracking-widest uppercase transition-all hover:bg-white hover:text-[#42d4d2] active:scale-95 shadow-md">
                                Tạo Tài Khoản
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
