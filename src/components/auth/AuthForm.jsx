import React from 'react';
import { Mail, Lock, User, Eye, EyeOff, RefreshCw, KeyRound } from 'lucide-react';

export default function AuthForm({
    step, isRightPanelActive, togglePanel, view, setView, otpStep, setOtpStep, 
    handleSendOTP, handleAuth, loading, formData, setFormData, 
    showPassword, setShowPassword, rememberMe, setRememberMe
}) {
    return (
        // Xóa bg-white để lộ lớp nền Glassmorphism của component cha
        <div className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-in-out ${step !== 'auth' ? '-translate-x-full' : 'translate-x-0'}`}>
            
            {/* PANEL TRÁI: ĐĂNG KÝ (TẠO TÀI KHOẢN) */}
            <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-12 transition-all duration-700 ease-in-out ${isRightPanelActive ? 'md:translate-x-full opacity-100 z-20 pointer-events-auto' : 'opacity-0 pointer-events-none z-10'}`}>
                <form onSubmit={otpStep === 1 ? handleSendOTP : handleAuth} className="flex flex-col items-center justify-center w-full max-w-[360px] h-full text-center">
                    <h1 className="font-black text-[28px] md:text-[36px] mb-2 text-[#1D1D1F] tracking-tight">Tạo Tài Khoản</h1>
                    <p className="text-[14px] text-gray-500 mb-8 font-bold">Tài khoản đầu tiên sẽ là Admin</p>

                    {otpStep === 1 ? (
                        <>
                            <div className="group relative w-full mb-4">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <User size={20} className="text-gray-400 group-focus-within:text-[#26D0CE] transition-colors" />
                                </div>
                                <input required type="text" placeholder="Tên hiển thị" 
                                    className="w-full pl-12 pr-5 py-4 bg-white/50 border border-white/60 rounded-[20px] outline-none text-[15px] font-bold text-[#1D1D1F] transition-all duration-300 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 placeholder:text-gray-400 placeholder:font-medium shadow-sm hover:bg-white/70"
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} 
                                />
                            </div>
                            <div className="group relative w-full mb-4">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail size={20} className="text-gray-400 group-focus-within:text-[#26D0CE] transition-colors" />
                                </div>
                                <input required type="email" placeholder="Email đăng nhập" 
                                    className="w-full pl-12 pr-5 py-4 bg-white/50 border border-white/60 rounded-[20px] outline-none text-[15px] font-bold text-[#1D1D1F] transition-all duration-300 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 placeholder:text-gray-400 placeholder:font-medium shadow-sm hover:bg-white/70"
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                                />
                            </div>
                            <div className="group relative w-full mb-8">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock size={20} className="text-gray-400 group-focus-within:text-[#26D0CE] transition-colors" />
                                </div>
                                <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" 
                                    className="w-full pl-12 pr-12 py-4 bg-white/50 border border-white/60 rounded-[20px] outline-none text-[15px] font-bold text-[#1D1D1F] transition-all duration-300 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 placeholder:text-gray-400 placeholder:font-medium shadow-sm hover:bg-white/70"
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-[#26D0CE] transition-colors">
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4 rounded-[20px] bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white font-black text-[15px] tracking-widest shadow-[0_8px_24px_rgba(38,208,206,0.3)] hover:shadow-[0_12px_32px_rgba(38,208,206,0.4)] active:scale-95 transition-all uppercase flex justify-center items-center gap-2">
                                {loading ? <RefreshCw size={20} className="animate-spin" /> : 'ĐĂNG KÝ NGAY'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="group relative w-full mb-6">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <KeyRound size={20} className="text-[#26D0CE]" />
                                </div>
                                <input required type="text" placeholder="Mã OTP 6 số" maxLength={6}
                                    className="w-full pl-12 pr-5 py-4 bg-white/50 border border-[#26D0CE]/50 rounded-[20px] outline-none text-[18px] font-black tracking-[0.3em] text-center text-[#1D1D1F] transition-all duration-300 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 shadow-sm"
                                    value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} 
                                />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4 rounded-[20px] bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white font-black text-[15px] tracking-widest shadow-[0_8px_24px_rgba(38,208,206,0.3)] hover:shadow-[0_12px_32px_rgba(38,208,206,0.4)] active:scale-95 transition-all uppercase flex justify-center items-center gap-2">
                                {loading ? <RefreshCw size={20} className="animate-spin" /> : 'XÁC NHẬN MÃ OTP'}
                            </button>
                        </>
                    )}
                    <button type="button" onClick={() => togglePanel(false)} className="md:hidden mt-8 text-[#1A5B82] hover:text-[#26D0CE] text-[14px] font-bold underline transition-colors">Đã có tài khoản? Đăng nhập</button>
                </form>
            </div>

            {/* PANEL PHẢI: ĐĂNG NHẬP (Làm mờ nếu chuyển sang Đăng Ký) */}
            <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-12 transition-all duration-700 ease-in-out ${isRightPanelActive ? 'md:translate-x-full opacity-0 pointer-events-none z-10' : 'translate-x-0 opacity-100 z-20 pointer-events-auto'}`}>
                <form onSubmit={view === 'FORGOT' && otpStep === 1 ? handleSendOTP : handleAuth} className="flex flex-col items-center justify-center w-full max-w-[360px] h-full text-center">
                    
                    <div className="w-[88px] h-[88px] rounded-[24px] flex items-center justify-center mb-6 shadow-sm border border-white/80 overflow-hidden bg-white/60 backdrop-blur-md transform hover:rotate-3 transition-transform">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                    </div>
                    
                    <h1 className="font-black text-[28px] md:text-[36px] mb-2 text-[#1D1D1F] tracking-tight">
                        {view === 'LOGIN' ? 'Đăng Nhập' : 'Quên Mật Khẩu'}
                    </h1>
                    <p className="text-[14px] text-gray-500 mb-8 font-bold">
                        {view === 'LOGIN' ? 'Dolphin_97ers Financial Workspace' : 'Nhập email để nhận mã khôi phục'}
                    </p>

                    {view === 'LOGIN' ? (
                        <>
                            <div className="group relative w-full mb-4">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Mail size={20} className="text-gray-400 group-focus-within:text-[#26D0CE] transition-colors" />
                                </div>
                                <input required type="email" placeholder="Email đăng nhập" 
                                    className="w-full pl-12 pr-5 py-4 bg-white/50 border border-white/60 rounded-[20px] outline-none text-[15px] font-bold text-[#1D1D1F] transition-all duration-300 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 placeholder:text-gray-400 placeholder:font-medium shadow-sm hover:bg-white/70"
                                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                                />
                            </div>
                            <div className="group relative w-full mb-5">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock size={20} className="text-gray-400 group-focus-within:text-[#26D0CE] transition-colors" />
                                </div>
                                <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" 
                                    className="w-full pl-12 pr-12 py-4 bg-white/50 border border-white/60 rounded-[20px] outline-none text-[15px] font-bold text-[#1D1D1F] transition-all duration-300 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 placeholder:text-gray-400 placeholder:font-medium shadow-sm hover:bg-white/70"
                                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-[#26D0CE] transition-colors">
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            <div className="flex items-center justify-between w-full px-2 mb-8">
                                <label className="flex items-center cursor-pointer group">
                                    <input type="checkbox" className="mr-2.5 cursor-pointer w-4 h-4 rounded border-gray-300 text-[#26D0CE] focus:ring-[#26D0CE] transition-colors" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                    <span className="text-[13px] text-gray-500 group-hover:text-[#1D1D1F] transition-colors font-bold">Ghi nhớ tài khoản</span>
                                </label>
                                <button type="button" onClick={() => { setView('FORGOT'); setOtpStep(1); }} className="text-[13px] text-[#33A1FD] hover:text-[#26D0CE] font-bold transition-colors">Quên mật khẩu?</button>
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-4 rounded-[20px] bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white font-black text-[15px] tracking-widest shadow-[0_8px_24px_rgba(38,208,206,0.3)] hover:shadow-[0_12px_32px_rgba(38,208,206,0.4)] active:scale-95 transition-all uppercase flex justify-center items-center gap-2">
                                {loading ? <RefreshCw size={20} className="animate-spin" /> : 'ĐĂNG NHẬP'}
                            </button>
                        </>
                    ) : (
                        otpStep === 1 ? (
                            <>
                                <div className="group relative w-full mb-6">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Mail size={20} className="text-gray-400 group-focus-within:text-[#26D0CE] transition-colors" />
                                    </div>
                                    <input required type="email" placeholder="Email của bạn" 
                                        className="w-full pl-12 pr-5 py-4 bg-white/50 border border-white/60 rounded-[20px] outline-none text-[15px] font-bold text-[#1D1D1F] transition-all duration-300 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 shadow-sm"
                                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} 
                                    />
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 rounded-[20px] bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white font-black text-[15px] tracking-widest shadow-[0_8px_24px_rgba(38,208,206,0.3)] hover:shadow-[0_12px_32px_rgba(38,208,206,0.4)] active:scale-95 transition-all uppercase flex justify-center items-center gap-2 mb-6">
                                    {loading ? <RefreshCw size={20} className="animate-spin" /> : 'NHẬN MÃ OTP'}
                                </button>
                                <button type="button" onClick={() => { setView('LOGIN'); }} className="text-[14px] text-gray-500 hover:text-[#1D1D1F] font-bold transition-colors">Quay lại đăng nhập</button>
                            </>
                        ) : (
                            <>
                                <div className="group relative w-full mb-4">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <KeyRound size={20} className="text-[#26D0CE]" />
                                    </div>
                                    <input required type="text" placeholder="Mã OTP 6 số" maxLength={6}
                                        className="w-full pl-12 pr-5 py-4 bg-white/50 border border-[#26D0CE]/50 rounded-[20px] outline-none text-[18px] font-black tracking-[0.3em] text-center text-[#1D1D1F] transition-all duration-300 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 shadow-sm"
                                        value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} 
                                    />
                                </div>
                                <div className="group relative w-full mb-8">
                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                        <Lock size={20} className="text-gray-400 group-focus-within:text-[#26D0CE] transition-colors" />
                                    </div>
                                    <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu MỚI" 
                                        className="w-full pl-12 pr-12 py-4 bg-white/50 border border-white/60 rounded-[20px] outline-none text-[15px] font-bold text-[#1D1D1F] transition-all duration-300 focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 shadow-sm"
                                        value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} 
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-400 hover:text-[#26D0CE] transition-colors">
                                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                    </button>
                                </div>
                                <button type="submit" disabled={loading} className="w-full py-4 rounded-[20px] bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white font-black text-[15px] tracking-widest shadow-[0_8px_24px_rgba(38,208,206,0.3)] hover:shadow-[0_12px_32px_rgba(38,208,206,0.4)] active:scale-95 transition-all uppercase flex justify-center items-center gap-2 mb-6">
                                    {loading ? <RefreshCw size={20} className="animate-spin" /> : 'ĐỔI MẬT KHẨU'}
                                </button>
                                <button type="button" onClick={() => { setView('LOGIN'); }} className="text-[14px] text-gray-500 hover:text-[#1D1D1F] font-bold transition-colors">Hủy & Quay lại</button>
                            </>
                        )
                    )}
                    <button type="button" onClick={() => togglePanel(true)} className="md:hidden mt-8 text-[#1A5B82] hover:text-[#26D0CE] text-[14px] font-bold underline transition-colors">Chưa có tài khoản? Tạo ngay</button>
                </form>
            </div>

            {/* LỚP PHỦ SLIDING OVERLAY (Tấm rèm di chuyển với hiệu ứng kính mờ) */}
            <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isRightPanelActive ? '-translate-x-full' : 'translate-x-0'}`}>
                {/* Gradient trong suốt (/95) kết hợp backdrop-blur để xuyên thấu thấy ánh sáng nền */}
                <div className={`bg-gradient-to-br from-[#26D0CE]/95 to-[#33A1FD]/95 backdrop-blur-md relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out border-l border-white/30 shadow-[-10px_0_30px_rgba(0,0,0,0.1)] ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
                    
                    <div className={`absolute top-0 left-0 flex flex-col items-center justify-center w-1/2 h-full px-14 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
                        <h1 className="font-black text-[44px] mb-4 drop-shadow-md tracking-tight">Mừng Trở Lại!</h1>
                        <p className="text-[16px] font-bold tracking-wide leading-relaxed mb-10 text-white/90 drop-shadow-sm">Đăng nhập ngay để tiếp tục quản lý dòng tiền của bạn một cách thông minh.</p>
                        <button onClick={() => togglePanel(false)} className="rounded-[20px] border-[2px] border-white/80 bg-white/10 hover:bg-white hover:text-[#26D0CE] text-white text-[15px] font-black py-4 px-14 tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-sm backdrop-blur-sm">
                            ĐĂNG NHẬP
                        </button>
                    </div>

                    <div className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-14 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
                        <h1 className="font-black text-[44px] mb-4 drop-shadow-md tracking-tight">Chào Người Mới!</h1>
                        <p className="text-[16px] font-bold tracking-wide leading-relaxed mb-10 text-white/90 drop-shadow-sm">Đăng ký để sử dụng không gian quản lý tài chính chuẩn UI/UX Pro Max.</p>
                        <button onClick={() => togglePanel(true)} className="rounded-[20px] border-[2px] border-white/80 bg-white/10 hover:bg-white hover:text-[#33A1FD] text-white text-[15px] font-black py-4 px-14 tracking-widest uppercase transition-all duration-300 active:scale-95 shadow-sm backdrop-blur-sm">
                            TẠO TÀI KHOẢN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}