import React from 'react';
import { Mail, Lock, User, Eye, EyeOff, RefreshCw, KeyRound } from 'lucide-react';

export default function AuthForm({
    step, isRightPanelActive, togglePanel, view, setView, otpStep, setOtpStep, 
    handleSendOTP, handleAuth, loading, formData, setFormData, 
    showPassword, setShowPassword, rememberMe, setRememberMe
}) {
    return (
        <div className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-in-out bg-white ${step !== 'auth' ? '-translate-x-full' : 'translate-x-0'}`}>
            <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-12 transition-all duration-700 ease-in-out ${isRightPanelActive ? 'md:translate-x-full opacity-100 z-20 pointer-events-auto' : 'opacity-0 pointer-events-none z-10'}`}>
                <form onSubmit={otpStep === 1 ? handleSendOTP : handleAuth} className="flex flex-col items-center justify-center w-full h-full text-center">
                    <h1 className="font-extrabold text-[28px] md:text-[34px] mb-2 text-[#333]">Tạo Tài Khoản</h1>
                    <p className="text-[14px] text-gray-500 mb-8 font-medium">Tài khoản đầu tiên sẽ là Admin</p>

                    {otpStep === 1 ? (
                        <>
                            <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-4 mb-4">
                                <User size={20} className="text-gray-400" />
                                <input required type="text" placeholder="Tên hiển thị" className="bg-transparent outline-none border-none w-full ml-3 text-[15px] text-gray-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-4 mb-4">
                                <Mail size={20} className="text-gray-400" />
                                <input required type="email" placeholder="Email đăng nhập" className="bg-transparent outline-none border-none w-full ml-3 text-[15px] text-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-4 mb-8 relative">
                                <Lock size={20} className="text-gray-400" />
                                <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" className="bg-transparent outline-none border-none w-full ml-3 text-[15px] pr-8 text-gray-700" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                            </div>
                            <button type="submit" disabled={loading} className="rounded-full bg-[linear-gradient(135deg,#21C8F6,#26D0CE)] text-white text-[15px] font-bold py-4 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_15px_rgba(38,208,206,0.3)] tracking-wider">
                                {loading ? <RefreshCw size={20} className="animate-spin" /> : 'ĐĂNG KÝ NGAY'}
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-4 mb-6">
                                <KeyRound size={20} className="text-[#26D0CE]" />
                                <input required type="text" placeholder="Nhập mã OTP 6 số" className="bg-transparent outline-none border-none w-full ml-3 text-[18px] text-center font-bold tracking-[0.3em] text-gray-700" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} />
                            </div>
                            <button type="submit" disabled={loading} className="rounded-full bg-[linear-gradient(135deg,#21C8F6,#26D0CE)] text-white text-[15px] font-bold py-4 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_15px_rgba(38,208,206,0.3)] tracking-wider">
                                {loading ? <RefreshCw size={20} className="animate-spin" /> : 'XÁC NHẬN MÃ OTP'}
                            </button>
                        </>
                    )}
                    <button type="button" onClick={() => togglePanel(false)} className="md:hidden mt-8 text-[#26D0CE] text-[14px] font-bold underline">Đã có tài khoản? Đăng nhập</button>
                </form>
            </div>

            <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-12 transition-all duration-700 ease-in-out bg-white ${isRightPanelActive ? 'md:translate-x-full opacity-0 pointer-events-none z-10' : 'translate-x-0 opacity-100 z-20 pointer-events-auto'}`}>
                <form onSubmit={view === 'FORGOT' && otpStep === 1 ? handleSendOTP : handleAuth} className="flex flex-col items-center justify-center w-full h-full text-center">
                    <div className="w-[75px] h-[75px] rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 overflow-hidden bg-white">
                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                    </div>
                    <h1 className="font-extrabold text-[28px] md:text-[34px] mb-2 text-[#222]">
                        {view === 'LOGIN' ? 'Đăng Nhập' : 'Quên Mật Khẩu'}
                    </h1>
                    <p className="text-[14px] text-gray-500 mb-8 font-medium">
                        {view === 'LOGIN' ? 'Dolphin_97ers Financial Workspace' : 'Nhập email để nhận mã khôi phục'}
                    </p>

                    {view === 'LOGIN' ? (
                        <>
                            <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-4 mb-4">
                                <Mail size={20} className="text-gray-400" />
                                <input required type="email" placeholder="Email" className="bg-transparent outline-none border-none w-full ml-3 text-[15px] text-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-4 mb-5 relative">
                                <Lock size={20} className="text-gray-400" />
                                <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" className="bg-transparent outline-none border-none w-full ml-3 text-[15px] pr-8 text-gray-700" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                            </div>
                            <div className="flex items-center justify-between w-full px-2 mb-8">
                                <label className="flex items-center cursor-pointer group">
                                    <input type="checkbox" className="mr-2 cursor-pointer w-[16px] h-[16px] accent-[#26D0CE]" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                    <span className="text-[14px] text-gray-500 group-hover:text-gray-800 transition-colors font-medium">Ghi nhớ tài khoản</span>
                                </label>
                            </div>
                            <button type="submit" disabled={loading} className="rounded-full bg-[linear-gradient(135deg,#21C8F6,#26D0CE)] text-white text-[15px] font-bold py-4 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_15px_rgba(38,208,206,0.3)] tracking-wider">
                                {loading ? <RefreshCw size={20} className="animate-spin" /> : 'ĐĂNG NHẬP'}
                            </button>
                            <button type="button" onClick={() => { setView('FORGOT'); setOtpStep(1); }} className="mt-6 text-[14px] text-[#21C8F6] hover:text-[#26D0CE] font-semibold transition-colors">Quên mật khẩu?</button>
                        </>
                    ) : (
                        otpStep === 1 ? (
                            <>
                                <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-4 mb-6">
                                    <Mail size={20} className="text-gray-400" />
                                    <input required type="email" placeholder="Email của bạn" className="bg-transparent outline-none border-none w-full ml-3 text-[15px] text-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <button type="submit" disabled={loading} className="rounded-full bg-[linear-gradient(135deg,#21C8F6,#26D0CE)] text-white text-[15px] font-bold py-4 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_15px_rgba(38,208,206,0.3)] tracking-wider">
                                    {loading ? <RefreshCw size={20} className="animate-spin" /> : 'NHẬN MÃ OTP'}
                                </button>
                                <button type="button" onClick={() => { setView('LOGIN'); }} className="text-[14px] text-gray-500 hover:text-[#26D0CE] font-semibold">Quay lại đăng nhập</button>
                            </>
                        ) : (
                            <>
                                <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-4 mb-4">
                                    <KeyRound size={20} className="text-[#26D0CE]" />
                                    <input required type="text" placeholder="Mã OTP 6 số" className="bg-transparent outline-none border-none w-full ml-3 text-[15px] text-center tracking-widest font-bold text-gray-700" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} />
                                </div>
                                <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-4 mb-6 relative">
                                    <Lock size={20} className="text-gray-400" />
                                    <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu MỚI" className="bg-transparent outline-none border-none w-full ml-3 text-[15px] pr-8 text-gray-700" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                                </div>
                                <button type="submit" disabled={loading} className="rounded-full bg-[linear-gradient(135deg,#21C8F6,#26D0CE)] text-white text-[15px] font-bold py-4 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_15px_rgba(38,208,206,0.3)] mb-4 tracking-wider">
                                    {loading ? <RefreshCw size={20} className="animate-spin" /> : 'ĐỔI MẬT KHẨU'}
                                </button>
                                <button type="button" onClick={() => { setView('LOGIN'); }} className="text-[14px] text-gray-500 hover:text-[#26D0CE] font-semibold">Hủy</button>
                            </>
                        )
                    )}
                    <button type="button" onClick={() => togglePanel(true)} className="md:hidden mt-8 text-[#26D0CE] text-[14px] font-bold underline">Chưa có tài khoản? Tạo ngay</button>
                </form>
            </div>

            <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isRightPanelActive ? '-translate-x-full' : 'translate-x-0'}`}>
                <div className={`bg-[linear-gradient(135deg,#26D0CE,#21C8F6)] relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
                    <div className={`absolute top-0 left-0 flex flex-col items-center justify-center w-1/2 h-full px-14 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
                        <h1 className="font-extrabold text-[40px] mb-4">Mừng Trở Lại!</h1>
                        <p className="text-[16px] font-medium tracking-wide leading-relaxed mb-10 opacity-95">Đăng nhập ngay để tiếp tục quản lý dòng tiền của bạn.</p>
                        <button onClick={() => togglePanel(false)} className="rounded-full border-[2px] border-white bg-transparent text-white text-[14px] font-bold py-4 px-14 tracking-widest uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#26D0CE]">ĐĂNG NHẬP</button>
                    </div>
                    <div className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-14 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
                        <h1 className="font-extrabold text-[40px] mb-4">Chào Người Mới!</h1>
                        <p className="text-[16px] font-medium tracking-wide leading-relaxed mb-10 opacity-95">Đăng ký để sử dụng không gian quản lý tài chính thông minh nhất.</p>
                        <button onClick={() => togglePanel(true)} className="rounded-full border-[2px] border-white bg-transparent text-white text-[14px] font-bold py-4 px-14 tracking-widest uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#26D0CE]">TẠO TÀI KHOẢN</button>
                    </div>
                </div>
            </div>
        </div>
    );
}