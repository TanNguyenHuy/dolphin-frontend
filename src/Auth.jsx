import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Eye, EyeOff, RefreshCw, KeyRound, Crown, Star, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess }) {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [view, setView] = useState('LOGIN'); 
    const [step, setStep] = useState(1); 
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '', newPassword: '' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // --- BIẾN STATE CHO MÀN HÌNH CHỌN GÓI ---
    const [showPricing, setShowPricing] = useState(false);
    const [planIndex, setPlanIndex] = useState(1); // Mặc định chọn gói giữa (Tiêu chuẩn)

    const plans = [
        { id: 'monthly', title: 'Cơ Bản', price: '10k', period: 'Tháng', icon: Eye, color: '#64748b', features: ['Chỉ xem thống kê tổng quan', 'Không xem được chi tiết lô', 'Hỗ trợ cơ bản'] },
        { id: 'half-year', title: 'Tiêu Chuẩn', price: '50k', period: '6 Tháng', icon: Star, color: '#26D0CE', features: ['Xem đầy đủ thống kê', 'Xem CHI TIẾT đợt bán', 'Hỗ trợ kỹ thuật 24/7'] },
        { id: 'yearly', title: 'V.I.P', price: '100k', period: 'Năm', icon: Crown, color: '#FF9500', features: ['Mọi tính năng gói 50k', 'Xuất báo cáo File Excel', 'Ưu tiên trải nghiệm tính năng mới'] }
    ];

    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savedPass = localStorage.getItem('rememberedPass');
        if (savedEmail && savedPass) {
            setFormData(prev => ({ ...prev, email: savedEmail, password: savedPass }));
            setRememberMe(true);
        }
    }, []);

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
                if (res.data.user) {
                    if (rememberMe) {
                        localStorage.setItem('rememberedEmail', formData.email);
                        localStorage.setItem('rememberedPass', formData.password);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                        localStorage.removeItem('rememberedPass');
                    }
                    onLoginSuccess(res.data.user, true);
                }
            } 
            else if (view === 'REGISTER') {
                // Đăng ký tài khoản
                await axios.post(`${API_URL}/register`, formData);
                
                // THAY VÌ HIỆN THÔNG BÁO VÀ VỀ LOGIN -> MỞ MÀN HÌNH CHỌN GÓI
                setShowPricing(true); 
            } 
            else if (view === 'FORGOT') {
                await axios.post(`${API_URL}/reset-password`, { email: formData.email, otp: formData.otp, newPassword: formData.newPassword });
                setSuccessMsg('Đổi mật khẩu thành công! Vui lòng đăng nhập.');
                setView('LOGIN'); setStep(1);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Sai thông tin!');
        } finally {
            setIsLoading(false);
        }
    };

    // Khi người dùng bấm hoàn tất chọn gói
    const handleCompletePricing = () => {
        alert(`🎉 Bạn đã đăng ký thành công gói ${plans[planIndex].title}! Vui lòng thanh toán và liên hệ Admin để kích hoạt tài khoản.`);
        setShowPricing(false); // Ẩn màn hình chọn gói
        togglePanel(false); // Trượt về màn hình đăng nhập để họ tự login
        setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 font-sans box-border">
            <div className={`relative w-full max-w-[850px] min-h-[550px] bg-white rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 ease-in-out ${isRightPanelActive ? 'right-panel-active' : ''}`}>
                
                {/* ======================= MÀN HÌNH CHỌN GÓI (CAROUSEL) CHỈ HIỆN SAU KHI ĐĂNG KÝ ======================= */}
                {showPricing && (
                    <div className="absolute inset-0 bg-white z-[999] flex flex-col items-center justify-center p-8 animate-fade-in">
                        <h2 className="text-[28px] font-black text-[#1D1D1F] mb-2">Chọn Gói Dịch Vụ</h2>
                        <p className="text-gray-500 text-[14px] mb-8 text-center">Lướt qua để chọn gói phù hợp nhất với shop của bạn</p>
                        
                        <div className="relative w-full max-w-[340px] overflow-hidden py-4">
                            {/* Track chứa các thẻ trượt ngang */}
                            <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${planIndex * 100}%)` }}>
                                {plans.map((p, i) => (
                                    <div key={p.id} className="min-w-full flex justify-center px-2 transition-all duration-500" style={{ opacity: planIndex === i ? 1 : 0.3, transform: planIndex === i ? 'scale(1)' : 'scale(0.9)' }}>
                                        <div className="bg-white border-2 border-[#26D0CE] rounded-[24px] p-6 shadow-xl text-center w-full relative">
                                            {planIndex === i && <div className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] rounded-full flex items-center justify-center text-white shadow-lg"><Check size={16} strokeWidth={3}/></div>}
                                            <div className="w-14 h-14 mx-auto bg-[#E0F7FA] text-[#26D0CE] rounded-xl flex items-center justify-center mb-4"><p.icon size={28}/></div>
                                            <h3 className="font-bold text-[18px] mb-1 text-gray-800">{p.title}</h3>
                                            <div className="text-[32px] font-black text-[#26D0CE] mb-4 tracking-tight">{p.price}<span className="text-[12px] text-gray-400 font-medium">/{p.period}</span></div>
                                            <ul className="text-left space-y-3 mb-6">
                                                {p.features.map((f, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-[13px] text-gray-600 font-medium"><Check size={16} className="text-[#1DB2A0] shrink-0"/> {f}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Hai nút lật trái phải */}
                            <button onClick={() => setPlanIndex(Math.max(0, planIndex-1))} className={`absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white border border-gray-100 rounded-full shadow-md text-gray-600 hover:text-[#26D0CE] transition-all ${planIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronLeft size={20}/></button>
                            <button onClick={() => setPlanIndex(Math.min(plans.length-1, planIndex+1))} className={`absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white border border-gray-100 rounded-full shadow-md text-gray-600 hover:text-[#26D0CE] transition-all ${planIndex === plans.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronRight size={20}/></button>
                        </div>
                        
                        {/* Thanh chỉ báo (Dots) */}
                        <div className="flex gap-2 mt-4 mb-8">
                            {plans.map((_, idx) => (
                                <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${planIndex === idx ? 'w-6 bg-[#26D0CE]' : 'w-2 bg-gray-300'}`}></div>
                            ))}
                        </div>

                        <button onClick={handleCompletePricing} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-10 transition-transform active:scale-95 hover:opacity-90 shadow-md tracking-widest">
                            HOÀN TẤT VÀ ĐĂNG NHẬP
                        </button>
                    </div>
                )}


                {/* ======================= FORM ĐĂNG KÝ (BÊN PHẢI) ======================= */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-[40px] transition-all duration-700 ease-in-out z-10 ${isRightPanelActive ? 'md:translate-x-full opacity-100 z-20' : 'opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto'}`}>
                    <form onSubmit={step === 1 ? handleSendOTP : handleSubmit} className="flex flex-col items-center justify-center w-full h-full text-center">
                        <h1 className="font-extrabold text-[28px] md:text-[30px] mb-2 text-[#333]">Tạo Tài Khoản</h1>
                        <p className="text-[13px] text-gray-500 mb-6 font-medium">Tài khoản đầu tiên sẽ là Admin</p>
                        
                        {error && <span className="text-[#FF3B30] text-[13px] mb-3 font-semibold">{error}</span>}
                        {successMsg && <span className="text-[#1DB2A0] text-[13px] mb-3 font-semibold">{successMsg}</span>}

                        {step === 1 ? (
                            <>
                                <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-3">
                                    <User size={18} className="text-gray-400" />
                                    <input required type="text" placeholder="Tên hiển thị" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-gray-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-3">
                                    <Mail size={18} className="text-gray-400" />
                                    <input required type="email" placeholder="Email đăng nhập" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-6 relative">
                                    <Lock size={18} className="text-gray-400" />
                                    <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] pr-8 text-gray-700" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                </div>
                                <button type="submit" disabled={isLoading} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-md">
                                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'ĐĂNG KÝ NGAY'}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-5">
                                    <KeyRound size={18} className="text-[#26D0CE]" />
                                    <input required type="text" placeholder="Nhập mã OTP 6 số" className="bg-transparent outline-none border-none w-full ml-3 text-[16px] text-center font-bold tracking-[0.3em] text-gray-700" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} />
                                </div>
                                <button type="submit" disabled={isLoading} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-md">
                                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'XÁC NHẬN MÃ OTP'}
                                </button>
                            </>
                        )}
                        <button type="button" onClick={() => togglePanel(false)} className="md:hidden mt-6 text-[#26D0CE] text-[13px] font-bold underline">Đã có tài khoản? Đăng nhập</button>
                    </form>
                </div>

                {/* ======================= FORM ĐĂNG NHẬP / QUÊN MẬT KHẨU (BÊN TRÁI) ======================= */}
                <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-[40px] transition-all duration-700 ease-in-out z-20 bg-white ${isRightPanelActive ? 'md:translate-x-full opacity-0 pointer-events-none' : ''}`}>
                    <form onSubmit={view === 'FORGOT' && step === 1 ? handleSendOTP : handleSubmit} className="flex flex-col items-center justify-center w-full h-full text-center">
                        
                        <div className="w-[65px] h-[65px] rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100 overflow-hidden bg-white">
                            <img src="/logo.png" alt="Dolphin Logo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                        </div>
                        
                        <h1 className="font-extrabold text-[28px] md:text-[32px] mb-1 text-[#222]">
                            {view === 'LOGIN' ? 'Đăng Nhập' : 'Quên Mật Khẩu'}
                        </h1>
                        <p className="text-[13px] text-gray-500 mb-6 font-medium">
                            {view === 'LOGIN' ? 'Dolphin_97ers Financial Workspace' : 'Nhập email để nhận mã khôi phục'}
                        </p>

                        {error && <span className="text-[#FF3B30] text-[13px] mb-3 font-semibold">{error}</span>}
                        {successMsg && <span className="text-[#1DB2A0] text-[13px] mb-3 font-semibold">{successMsg}</span>}

                        {view === 'LOGIN' ? (
                            <>
                                <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-3">
                                    <Mail size={18} className="text-gray-400" />
                                    <input required type="email" placeholder="Email" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-4 relative">
                                    <Lock size={18} className="text-gray-400" />
                                    <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] pr-8 text-gray-700" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                </div>

                                <div className="flex items-center justify-between w-full px-2 mb-6">
                                    <label className="flex items-center cursor-pointer group">
                                        <input type="checkbox" className="mr-2 cursor-pointer w-[15px] h-[15px] accent-[#26D0CE]" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                        <span className="text-[13px] text-gray-500 group-hover:text-gray-800 transition-colors font-medium">Ghi nhớ tài khoản</span>
                                    </label>
                                </div>

                                <button type="submit" disabled={isLoading} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-md">
                                    {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'ĐĂNG NHẬP'}
                                </button>
                                
                                <button type="button" onClick={() => { setView('FORGOT'); setStep(1); setError(''); setSuccessMsg(''); }} className="mt-5 text-[13px] text-[#21C8F6] hover:text-[#26D0CE] font-semibold transition-colors">
                                    Quên mật khẩu?
                                </button>
                            </>
                        ) : (
                            step === 1 ? (
                                <>
                                    <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-5">
                                        <Mail size={18} className="text-gray-400" />
                                        <input required type="email" placeholder="Email của bạn" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                    </div>
                                    <button type="submit" disabled={isLoading} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-md mb-4">
                                        {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'NHẬN MÃ OTP'}
                                    </button>
                                    <button type="button" onClick={() => { setView('LOGIN'); setError(''); }} className="text-[13px] text-gray-500 hover:text-[#26D0CE] font-semibold">Quay lại đăng nhập</button>
                                </>
                            ) : (
                                <>
                                    <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-3">
                                        <KeyRound size={18} className="text-[#26D0CE]" />
                                        <input required type="text" placeholder="Mã OTP 6 số" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-center tracking-widest font-bold text-gray-700" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} />
                                    </div>
                                    <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-5 relative">
                                        <Lock size={18} className="text-gray-400" />
                                        <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu MỚI" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] pr-8 text-gray-700" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                                    </div>
                                    <button type="submit" disabled={isLoading} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-md mb-4">
                                        {isLoading ? <RefreshCw size={18} className="animate-spin" /> : 'ĐỔI MẬT KHẨU'}
                                    </button>
                                    <button type="button" onClick={() => { setView('LOGIN'); setError(''); }} className="text-[13px] text-gray-500 hover:text-[#26D0CE] font-semibold">Hủy</button>
                                </>
                            )
                        )}
                        <button type="button" onClick={() => togglePanel(true)} className="md:hidden mt-6 text-[#26D0CE] text-[13px] font-bold underline">Chưa có tài khoản? Tạo ngay</button>
                    </form>
                </div>

                {/* ======================= OVERLAY TRƯỢT MÀU XANH ======================= */}
                <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isRightPanelActive ? '-translate-x-full' : ''}`}>
                    <div className={`bg-gradient-to-r from-[#26D0CE] to-[#21C8F6] relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-1/2' : ''}`}>
                        
                        <div className={`absolute top-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
                            <h1 className="font-extrabold text-[36px] mb-4">Mừng Trở Lại!</h1>
                            <p className="text-[15px] font-medium tracking-wide leading-relaxed mb-8 opacity-95">
                                Đăng nhập ngay để tiếp tục quản lý dòng tiền của bạn.
                            </p>
                            <button onClick={() => togglePanel(false)} className="rounded-full border-[1.5px] border-white bg-transparent text-white text-[13px] font-bold py-3.5 px-12 tracking-widest uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#26D0CE]">
                                ĐĂNG NHẬP
                            </button>
                        </div>

                        <div className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
                            <h1 className="font-extrabold text-[36px] mb-4">Chào Người Mới!</h1>
                            <p className="text-[15px] font-medium tracking-wide leading-relaxed mb-8 opacity-95">
                                Đăng ký để sử dụng không gian quản lý tài chính thông minh nhất.
                            </p>
                            <button onClick={() => togglePanel(true)} className="rounded-full border-[1.5px] border-white bg-transparent text-white text-[13px] font-bold py-3.5 px-12 tracking-widest uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#26D0CE]">
                                TẠO TÀI KHOẢN
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    ); 
}
