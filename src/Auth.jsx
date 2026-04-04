import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Eye, EyeOff, RefreshCw, KeyRound, Fish } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess }) {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false); // Điều khiển hiệu ứng trượt
    const [view, setView] = useState('LOGIN'); // 'LOGIN', 'REGISTER', 'FORGOT'
    const [step, setStep] = useState(1); // 1: Nhập info, 2: Nhập OTP
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '', newPassword: '' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Đổi tab (Trượt màn hình)
    const togglePanel = (toRegister) => {
        setIsRightPanelActive(toRegister);
        setView(toRegister ? 'REGISTER' : 'LOGIN');
        setStep(1);
        setError('');
        setSuccessMsg('');
    };

    // Mở tab Quên Mật Khẩu (Nằm đè lên Login)
    const openForgot = () => {
        setView('FORGOT');
        setStep(1);
        setError('');
        setSuccessMsg('');
    };

    // XỬ LÝ GỬI OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError(''); setSuccessMsg(''); setIsLoading(true);
        try {
            const type = view === 'REGISTER' ? 'register' : 'forgot';
            const res = await axios.post(`${API_URL}/send-otp`, { email: formData.email, type });
            setSuccessMsg(res.data.message);
            setStep(2); // Chuyển sang ô nhập mã 6 số
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi gửi mail!');
        } finally {
            setIsLoading(false);
        }
    };

    // XỬ LÝ ĐĂNG NHẬP / XÁC NHẬN ĐĂNG KÝ
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
                togglePanel(false); // Tạo xong trượt về Login
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
            {/* CONTAINER CHÍNH CHỨA HIỆU ỨNG TRƯỢT */}
            <div className={`relative w-full max-w-[850px] min-h-[550px] bg-white rounded-[30px] shadow-2xl overflow-hidden transition-all duration-700 ease-in-out ${isRightPanelActive ? 'right-panel-active' : ''}`} id="container">
                
                {/* 1. FORM ĐĂNG KÝ (BÊN PHẢI) */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex items-center justify-center p-10 transition-all duration-700 ease-in-out z-10 ${isRightPanelActive ? 'translate-x-full opacity-100 z-20' : 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'}`}>
                    <form onSubmit={step === 1 ? handleSendOTP : handleSubmit} className="flex flex-col items-center justify-center w-full h-full text-center">
                        <h1 className="font-bold text-[30px] mb-2 text-[#333]">Tạo Tài Khoản</h1>
                        <p className="text-[14px] text-gray-500 mb-6">Tài khoản đầu tiên sẽ là Admin (Chủ trọ)</p>
                        
                        {error && <span className="text-red-500 text-xs mb-3 font-semibold">{error}</span>}
                        {successMsg && <span className="text-green-500 text-xs mb-3 font-semibold">{successMsg}</span>}

                        {step === 1 ? (
                            <>
                                <div className="bg-[#f4f8f7] w-full rounded-full flex items-center px-4 py-3 mb-4">
                                    <User size={18} className="text-gray-400" />
                                    <input required type="text" placeholder="Tên hiển thị" className="bg-transparent outline-none border-none w-full ml-3 text-[14px]" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="bg-[#f4f8f7] w-full rounded-full flex items-center px-4 py-3 mb-4">
                                    <Mail size={18} className="text-gray-400" />
                                    <input required type="email" placeholder="Email đăng nhập" className="bg-transparent outline-none border-none w-full ml-3 text-[14px]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="bg-[#f4f8f7] w-full rounded-full flex items-center px-4 py-3 mb-6 relative">
                                    <Lock size={18} className="text-gray-400" />
                                    <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] pr-8" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                </div>
                                <button type="submit" disabled={isLoading} className="rounded-full border border-transparent bg-[#42d4d2] text-white text-[13px] font-bold py-3.5 px-12 tracking-wider uppercase transition-transform active:scale-95 hover:bg-[#3bc2c0] w-full shadow-md flex justify-center">
                                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'GỬI MÃ OTP QUA EMAIL'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="bg-[#f4f8f7] w-full rounded-full flex items-center px-4 py-4 mb-6">
                                    <KeyRound size={18} className="text-[#42d4d2]" />
                                    <input required type="text" placeholder="Nhập mã OTP 6 số" className="bg-transparent outline-none border-none w-full ml-3 text-[16px] text-center font-bold tracking-[0.3em]" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} />
                                </div>
                                <button type="submit" disabled={isLoading} className="rounded-full border border-transparent bg-[#42d4d2] text-white text-[13px] font-bold py-3.5 px-12 tracking-wider uppercase transition-transform active:scale-95 hover:bg-[#3bc2c0] w-full shadow-md flex justify-center">
                                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'XÁC NHẬN ĐĂNG KÝ'}
                                </button>
                            </>
                        )}
                        <button type="button" onClick={() => togglePanel(false)} className="md:hidden mt-6 text-[#42d4d2] text-sm underline">Đã có tài khoản? Đăng nhập</button>
                    </form>
                </div>

                {/* 2. FORM ĐĂNG NHẬP / QUÊN MẬT KHẨU (BÊN TRÁI) */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex items-center justify-center p-10 transition-all duration-700 ease-in-out z-20 bg-white ${isRightPanelActive ? 'translate-x-full opacity-0 pointer-events-none' : ''}`}>
                    <form onSubmit={view === 'FORGOT' && step === 1 ? handleSendOTP : handleSubmit} className="flex flex-col items-center justify-center w-full h-full text-center">
                        <div className="w-14 h-14 bg-[#42d4d2] rounded-full flex items-center justify-center mb-4 text-white shadow-md">
                            <Fish size={28} /> {/* Đổi thành logo sếp nếu cần */}
                        </div>
                        <h1 className="font-bold text-[30px] mb-2 text-[#333]">
                            {view === 'LOGIN' ? 'Đăng Nhập' : 'Quên Mật Khẩu'}
                        </h1>
                        <p className="text-[14px] text-gray-500 mb-6">
                            {view === 'LOGIN' ? 'Dolphin_97ers Financial Workspace' : 'Nhập email để nhận mã khôi phục'}
                        </p>

                        {error && <span className="text-red-500 text-xs mb-3 font-semibold">{error}</span>}
                        {successMsg && <span className="text-green-500 text-xs mb-3 font-semibold">{successMsg}</span>}

                        {view === 'LOGIN' ? (
                            <>
                                <div className="bg-[#f4f8f7] w-full rounded-full flex items-center px-4 py-3 mb-4">
                                    <Mail size={18} className="text-gray-400" />
                                    <input required type="email" placeholder="Email" className="bg-transparent outline-none border-none w-full ml-3 text-[14px]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="bg-[#f4f8f7] w-full rounded-full flex items-center px-4 py-3 mb-6 relative">
                                    <Lock size={18} className="text-gray-400" />
                                    <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] pr-8" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                </div>
                                <button type="submit" disabled={isLoading} className="rounded-full border border-transparent bg-[#42d4d2] text-white text-[13px] font-bold py-3.5 px-12 tracking-wider uppercase transition-transform active:scale-95 hover:bg-[#3bc2c0] w-full shadow-md flex justify-center">
                                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'ĐĂNG NHẬP'}
                                </button>
                                <button type="button" onClick={openForgot} className="mt-4 text-[13px] text-gray-500 hover:text-[#42d4d2] transition-colors border-b border-transparent hover:border-[#42d4d2]">Quên mật khẩu?</button>
                            </>
                        ) : (
                            // GIAO DIỆN QUÊN MẬT KHẨU
                            step === 1 ? (
                                <>
                                    <div className="bg-[#f4f8f7] w-full rounded-full flex items-center px-4 py-3 mb-6">
                                        <Mail size={18} className="text-gray-400" />
                                        <input required type="email" placeholder="Email của bạn" className="bg-transparent outline-none border-none w-full ml-3 text-[14px]" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="rounded-full border border-transparent bg-[#42d4d2] text-white text-[13px] font-bold py-3.5 px-12 tracking-wider uppercase transition-transform active:scale-95 hover:bg-[#3bc2c0] w-full shadow-md flex justify-center mb-4">
                                        {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'NHẬN MÃ OTP'}
                                    </button>
                                    <button type="button" onClick={() => setView('LOGIN')} className="text-[13px] text-gray-500 hover:text-[#42d4d2]">Quay lại Đăng nhập</button>
                                </>
                            ) : (
                                <>
                                    <div className="bg-[#f4f8f7] w-full rounded-full flex items-center px-4 py-3 mb-4">
                                        <KeyRound size={18} className="text-gray-400" />
                                        <input required type="text" placeholder="Mã OTP 6 số" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-center tracking-widest font-bold" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} />
                                    </div>
                                    <div className="bg-[#f4f8f7] w-full rounded-full flex items-center px-4 py-3 mb-6 relative">
                                        <Lock size={18} className="text-gray-400" />
                                        <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu MỚI" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] pr-8" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                    </div>
                                    <button type="submit" disabled={isLoading} className="rounded-full border border-transparent bg-[#42d4d2] text-white text-[13px] font-bold py-3.5 px-12 tracking-wider uppercase transition-transform active:scale-95 hover:bg-[#3bc2c0] w-full shadow-md flex justify-center mb-4">
                                        {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'ĐỔI MẬT KHẨU'}
                                    </button>
                                    <button type="button" onClick={() => setView('LOGIN')} className="text-[13px] text-gray-500 hover:text-[#42d4d2]">Hủy</button>
                                </>
                            )
                        )}
                        <button type="button" onClick={() => togglePanel(true)} className="md:hidden mt-6 text-[#42d4d2] text-sm underline">Chưa có tài khoản? Tạo ngay</button>
                    </form>
                </div>

                {/* 3. LỚP PHỦ HIỆU ỨNG TRƯỢT (OVERLAY - CHỈ HIỆN TRÊN DESKTOP) */}
                <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isRightPanelActive ? '-translate-x-full' : ''}`}>
                    <div className={`bg-gradient-to-r from-[#42d4d2] to-[#3bc2c0] bg-no-repeat bg-cover bg-center text-white relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-1/2' : ''}`}>
                        
                        {/* Overlay Đăng Nhập (Bên Trái của Overlay) */}
                        <div className={`absolute top-0 flex flex-col items-center justify-center w-1/2 h-full px-10 text-center transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
                            <h1 className="font-bold text-[32px] mb-4">Mừng Trở Lại!</h1>
                            <p className="text-[14px] font-light tracking-wide leading-relaxed mb-8">
                                Đăng nhập ngay để tiếp tục quản lý dòng tiền của bạn.
                            </p>
                            <button onClick={() => togglePanel(false)} className="rounded-full border-2 border-white bg-transparent text-white text-[13px] font-bold py-3 px-12 tracking-wider uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#42d4d2]">
                                ĐĂNG NHẬP
                            </button>
                        </div>

                        {/* Overlay Đăng Ký (Bên Phải của Overlay) */}
                        <div className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-10 text-center transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
                            <h1 className="font-bold text-[32px] mb-4">Chào Người Mới!</h1>
                            <p className="text-[14px] font-light tracking-wide leading-relaxed mb-8">
                                Đăng ký để sử dụng không gian quản lý tài chính thông minh nhất.
                            </p>
                            <button onClick={() => togglePanel(true)} className="rounded-full border-2 border-white bg-transparent text-white text-[13px] font-bold py-3 px-12 tracking-wider uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#42d4d2]">
                                TẠO TÀI KHOẢN
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
