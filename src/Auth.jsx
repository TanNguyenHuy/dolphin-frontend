import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Eye, EyeOff, RefreshCw, KeyRound, Crown, Star, Check, QrCode, Clock, UploadCloud, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess, expiredEmail, onLogout }) {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [view, setView] = useState('LOGIN'); 
    
    // Nếu truyền vào expiredEmail thì nhảy thẳng sang bước chọn gói (pricing)
    const [step, setStep] = useState(expiredEmail ? 'pricing' : 'auth'); 
    const [registeredEmail, setRegisteredEmail] = useState(expiredEmail || ''); 
    
    const [otpStep, setOtpStep] = useState(1); 
    const [planIndex, setPlanIndex] = useState(1); 
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '', newPassword: '' });
    const [billBase64, setBillBase64] = useState(null); 

    // HỆ THỐNG THÔNG BÁO XỊN (TOAST)
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
    };

    const plans = [
        { 
            id: '10k', title: 'GÓI CƠ BẢN', price: '10,000', period: 'Tháng', icon: Eye, qrImage: '/qr-10k.jpg', 
            features: ['Xem thống kê tổng quan', 'Khóa xem chi tiết lô', 'Hỗ trợ cơ bản'],
            theme: { text: '#8D6E63', bgIcon: '#EFEBE9', gradBorder: 'from-[#D7CCC8] to-[#8D6E63]', shadow: 'shadow-[#8D6E63]/30', btn: 'bg-gradient-to-r from-[#D7CCC8] to-[#8D6E63]' }
        },
        { 
            id: '50k', title: 'GÓI VIP', price: '50,000', period: '6 Tháng', icon: Star, qrImage: '/qr-50k.jpg', 
            features: ['Xem đầy đủ thống kê', 'Xem chi tiết lô hàng', 'Hỗ trợ kỹ thuật 24/7'],
            theme: { text: '#64748B', bgIcon: '#F1F5F9', gradBorder: 'from-[#E2E8F0] to-[#64748B]', shadow: 'shadow-[#64748B]/30', btn: 'bg-gradient-to-r from-[#94A3B8] to-[#64748B]' }
        },
        { 
            id: '100k', title: 'GÓI VVIP', price: '100,000', period: 'Năm', icon: Crown, qrImage: '/qr-100k.jpg', 
            features: ['Đầy đủ tính năng cao cấp', 'Xuất Excel báo cáo', 'Ưu tiên tính năng mới'],
            theme: { text: '#D97706', bgIcon: '#FEF3C7', gradBorder: 'from-[#FDE68A] via-[#F59E0B] to-[#D97706]', shadow: 'shadow-[#F59E0B]/40', btn: 'bg-gradient-to-r from-[#FBBF24] to-[#D97706]' }
        }
    ];

    const [rememberMe, setRememberMe] = useState(false);
    
    useEffect(() => {
        const savedEmail = localStorage.getItem('rememberedEmail');
        const savedPass = localStorage.getItem('rememberedPass');
        if (savedEmail && savedPass) {
            setFormData(prev => ({ ...prev, email: savedEmail, password: savedPass }));
            setRememberMe(true);
        }
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setBillBase64(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const togglePanel = (toRegister) => {
        setIsRightPanelActive(toRegister);
        setView(toRegister ? 'REGISTER' : 'LOGIN');
        setOtpStep(1); 
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const type = view === 'REGISTER' ? 'register' : 'forgot';
            const res = await axios.post(`${API_URL}/send-otp`, { email: formData.email, type });
            showToast(res.data.message, 'success');
            setOtpStep(2); 
        } catch (err) {
            showToast(err.response?.data?.error || 'Lỗi gửi mail!', 'error');
        } finally { setLoading(false); } 
    };

    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true); 
        try {
            const endpoint = isRightPanelActive ? '/register' : '/login';
            const res = await axios.post(`${API_URL}${endpoint}`, formData);
            if (isRightPanelActive) { 
                setRegisteredEmail(formData.email); 
                setStep('pricing'); 
            }
            else {
                const user = res.data.user;
                if (user.role !== 'admin' && user.plan !== 'premium' && user.planExpiry && new Date(user.planExpiry) < new Date()) {
                    setRegisteredEmail(user.email); 
                    setStep('pricing'); 
                    showToast("⏳ Gói của bạn đã hết hạn, vui lòng gia hạn!", 'error');
                } else {
                    if (rememberMe) {
                        localStorage.setItem('rememberedEmail', formData.email);
                        localStorage.setItem('rememberedPass', formData.password);
                    } else {
                        localStorage.removeItem('rememberedEmail');
                        localStorage.removeItem('rememberedPass');
                    }
                    onLoginSuccess(user, true);
                }
            }
        } catch (err) { showToast(err.response?.data?.error || "Sai thông tin đăng nhập!", 'error'); }
        finally { setLoading(false); }
    };

    const handleSelectPlan = () => setStep('qr');

    const handleConfirmPayment = async () => {
        if (!billBase64) return showToast("Vui lòng tải ảnh màn hình đã chuyển khoản!", 'error');
        setLoading(true);
        try {
            await axios.put(`${API_URL}/update-plan`, { email: registeredEmail, plan: plans[planIndex].id, paymentImage: billBase64 });
            setStep('success');
            showToast("Gửi Bill thành công!", 'success');
        } catch (e) { showToast("Lỗi gửi Bill!", 'error'); }
        finally { setLoading(false); }
    };

    // ĐÃ FIX LỖI ĐĂNG XUẤT: Gỡ bỏ sạch sẽ dữ liệu để không kẹt
    const forceLogoutAndReset = () => {
        setStep('auth');
        setView('LOGIN');
        setIsRightPanelActive(false);
        setRegisteredEmail('');
        setBillBase64(null);
        setFormData({...formData, password: '', otp: '', newPassword: ''});
        
        localStorage.removeItem('authUser');
        sessionStorage.removeItem('authUser');
        
        if (onLogout) onLogout();
        showToast("Đã đăng xuất tài khoản an toàn!", 'success');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 font-sans box-border overflow-hidden relative">
            
            {/* TOAST THÔNG BÁO XỊN */}
            <div className={`fixed top-5 right-5 z-[9999] transition-all duration-500 ease-in-out ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'}`}>
                <div className={`flex items-center gap-3 px-6 py-4 rounded-[20px] shadow-2xl border ${toast.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={24}/> : <AlertCircle size={24}/>}
                    <p className="font-bold text-[14px] tracking-wide">{toast.message}</p>
                </div>
            </div>

            <div className={`relative w-full max-w-[850px] min-h-[550px] bg-white rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 ease-in-out`}>
                
                {/* LỚP 1: MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ */}
                <div className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-in-out bg-white ${step !== 'auth' ? '-translate-x-full' : 'translate-x-0'}`}>
                    <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-10 transition-all duration-700 ease-in-out ${isRightPanelActive ? 'md:translate-x-full opacity-100 z-20 pointer-events-auto' : 'opacity-0 pointer-events-none z-10'}`}>
                        <form onSubmit={otpStep === 1 ? handleSendOTP : handleAuth} className="flex flex-col items-center justify-center w-full h-full text-center">
                            <h1 className="font-extrabold text-[28px] md:text-[30px] mb-2 text-[#333]">Tạo Tài Khoản</h1>
                            <p className="text-[13px] text-gray-500 mb-6 font-medium">Tài khoản đầu tiên sẽ là Admin</p>

                            {otpStep === 1 ? (
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
                                    <button type="submit" disabled={loading} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-md">
                                        {loading ? <RefreshCw size={18} className="animate-spin" /> : 'ĐĂNG KÝ NGAY'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-5">
                                        <KeyRound size={18} className="text-[#26D0CE]" />
                                        <input required type="text" placeholder="Nhập mã OTP 6 số" className="bg-transparent outline-none border-none w-full ml-3 text-[16px] text-center font-bold tracking-[0.3em] text-gray-700" maxLength={6} value={formData.otp} onChange={e => setFormData({...formData, otp: e.target.value})} />
                                    </div>
                                    <button type="submit" disabled={loading} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-md mb-4">
                                        {loading ? <RefreshCw size={18} className="animate-spin" /> : 'XÁC NHẬN MÃ OTP'}
                                    </button>
                                </>
                            )}
                            <button type="button" onClick={() => togglePanel(false)} className="md:hidden mt-6 text-[#26D0CE] text-[13px] font-bold underline">Đã có tài khoản? Đăng nhập</button>
                        </form>
                    </div>

                    <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-10 transition-all duration-700 ease-in-out bg-white ${isRightPanelActive ? 'md:translate-x-full opacity-0 pointer-events-none z-10' : 'translate-x-0 opacity-100 z-20 pointer-events-auto'}`}>
                        <form onSubmit={view === 'FORGOT' && otpStep === 1 ? handleSendOTP : handleAuth} className="flex flex-col items-center justify-center w-full h-full text-center">
                            <div className="w-[65px] h-[65px] rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100 overflow-hidden bg-white">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                            </div>
                            <h1 className="font-extrabold text-[28px] md:text-[32px] mb-1 text-[#222]">
                                {view === 'LOGIN' ? 'Đăng Nhập' : 'Quên Mật Khẩu'}
                            </h1>
                            <p className="text-[13px] text-gray-500 mb-6 font-medium">
                                {view === 'LOGIN' ? 'Dolphin_97ers Financial Workspace' : 'Nhập email để nhận mã khôi phục'}
                            </p>

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
                                    <button type="submit" disabled={loading} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-md">
                                        {loading ? <RefreshCw size={18} className="animate-spin" /> : 'ĐĂNG NHẬP'}
                                    </button>
                                    <button type="button" onClick={() => { setView('FORGOT'); setOtpStep(1); setError(''); setSuccessMsg(''); }} className="mt-5 text-[13px] text-[#21C8F6] hover:text-[#26D0CE] font-semibold transition-colors">Quên mật khẩu?</button>
                                </>
                            ) : (
                                otpStep === 1 ? (
                                    <>
                                        <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-5">
                                            <Mail size={18} className="text-gray-400" />
                                            <input required type="email" placeholder="Email của bạn" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                        </div>
                                        <button type="submit" disabled={loading} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-md mb-4">
                                            {loading ? <RefreshCw size={18} className="animate-spin" /> : 'NHẬN MÃ OTP'}
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
                                        <button type="submit" disabled={loading} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-md mb-4">
                                            {loading ? <RefreshCw size={18} className="animate-spin" /> : 'ĐỔI MẬT KHẨU'}
                                        </button>
                                        <button type="button" onClick={() => { setView('LOGIN'); setError(''); }} className="text-[13px] text-gray-500 hover:text-[#26D0CE] font-semibold">Hủy</button>
                                    </>
                                )
                            )}
                            <button type="button" onClick={() => togglePanel(true)} className="md:hidden mt-6 text-[#26D0CE] text-[13px] font-bold underline">Chưa có tài khoản? Tạo ngay</button>
                        </form>
                    </div>

                    <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isRightPanelActive ? '-translate-x-full' : 'translate-x-0'}`}>
                        <div className={`bg-gradient-to-r from-[#26D0CE] to-[#21C8F6] relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
                            <div className={`absolute top-0 left-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
                                <h1 className="font-extrabold text-[36px] mb-4">Mừng Trở Lại!</h1>
                                <p className="text-[15px] font-medium tracking-wide leading-relaxed mb-8 opacity-95">Đăng nhập ngay để tiếp tục quản lý dòng tiền của bạn.</p>
                                <button onClick={() => togglePanel(false)} className="rounded-full border-[1.5px] border-white bg-transparent text-white text-[13px] font-bold py-3.5 px-12 tracking-widest uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#26D0CE]">ĐĂNG NHẬP</button>
                            </div>
                            <div className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
                                <h1 className="font-extrabold text-[36px] mb-4">Chào Người Mới!</h1>
                                <p className="text-[15px] font-medium tracking-wide leading-relaxed mb-8 opacity-95">Đăng ký để sử dụng không gian quản lý tài chính thông minh nhất.</p>
                                <button onClick={() => togglePanel(true)} className="rounded-full border-[1.5px] border-white bg-transparent text-white text-[13px] font-bold py-3.5 px-12 tracking-widest uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#26D0CE]">TẠO TÀI KHOẢN</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LỚP 2: MÀN HÌNH CHỌN GÓI */}
                <div className={`absolute inset-0 bg-gray-50/90 backdrop-blur-sm z-[55] flex flex-col items-center justify-center p-6 sm:p-10 transition-transform duration-700 ease-in-out overflow-y-auto ${step === 'pricing' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="text-center mb-10 mt-10 md:mt-0">
                        <h2 className="text-[28px] md:text-[34px] font-black text-gray-800 mb-2">Bảng Giá Dịch Vụ</h2>
                        <p className="text-gray-500 font-medium max-w-md mx-auto">Nâng cấp tài khoản để mở khóa toàn quyền kiểm soát dữ liệu bán hàng.</p>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-6 w-full max-w-[900px]">
                        {plans.map((p, i) => (
                            <div key={p.id} onClick={() => setPlanIndex(i)} className={`relative flex-1 p-[2px] rounded-[32px] cursor-pointer transition-all duration-300 group ${planIndex === i ? `bg-gradient-to-br ${p.theme.gradBorder} scale-105 shadow-2xl ${p.theme.shadow} z-10` : 'bg-gray-200 opacity-60 hover:opacity-100 scale-100 hover:scale-105'}`}>
                                <div className="bg-white rounded-[30px] p-6 h-full flex flex-col relative overflow-hidden">
                                    {planIndex === i && <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${p.theme.gradBorder} blur-[40px] opacity-20 rounded-full pointer-events-none`}></div>}
                                    
                                    <div style={{ backgroundColor: p.theme.bgIcon, color: p.theme.text }} className="w-14 h-14 mx-auto rounded-[18px] flex items-center justify-center mb-5 relative z-10 shadow-sm"><p.icon size={26} strokeWidth={2.5}/></div>
                                    <h3 className="font-extrabold text-[16px] mb-2 text-center tracking-wide" style={{ color: p.theme.text }}>{p.title}</h3>
                                    
                                    <div className="text-[34px] font-black text-center mb-6 tracking-tight relative z-10" style={{ color: p.theme.text }}>
                                        {p.price}<span className="text-[14px] font-bold text-gray-400 ml-1">/ {p.period}</span>
                                    </div>
                                    
                                    <ul className="text-left space-y-4 mb-8 flex-1 relative z-10 px-2">
                                        {p.features.map((f, idx) => (
                                            <li key={idx} className="flex items-start gap-2.5 text-[13px] text-gray-600 font-semibold leading-relaxed">
                                                <div className={`mt-0.5 rounded-full p-0.5`} style={{ backgroundColor: p.theme.bgIcon }}><Check size={14} style={{ color: p.theme.text }} strokeWidth={3}/></div>
                                                {f}
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto">
                                        <button className={`w-full py-3.5 rounded-xl font-bold text-white text-[13px] tracking-widest shadow-md transition-all ${planIndex === i ? p.theme.btn : 'bg-gray-300 text-gray-500'}`}>
                                            {planIndex === i ? 'ĐANG CHỌN' : 'CHỌN GÓI NÀY'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={handleSelectPlan} className="mt-12 bg-gray-900 text-white px-12 py-4 rounded-full font-black text-[14px] shadow-2xl active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2 hover:bg-black">
                        TIẾP TỤC THANH TOÁN <ArrowRight size={18}/>
                    </button>
                    
                    {/* NÚT ĐĂNG XUẤT ĐÃ ĐƯỢC FIX LẠI */}
                    <button onClick={forceLogoutAndReset} className="mt-6 text-gray-500 font-bold text-[13px] underline hover:text-red-500 transition-colors">
                        Trở về Đăng Nhập / Dùng tài khoản khác
                    </button>
                </div>

                {/* LỚP 3: QUÉT QR & TẢI BILL */}
                <div className={`absolute inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 sm:p-10 transition-transform duration-700 ease-in-out overflow-y-auto ${step === 'qr' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-14 w-full max-w-[1000px]">
                        <div className="text-center lg:text-left flex-1 w-full mt-10 lg:mt-0">
                            <h2 className="text-[28px] md:text-[36px] font-black text-gray-800 mb-3 leading-tight">Hoàn tất<br className="hidden lg:block"/>Thanh toán</h2>
                            <p className="text-gray-500 mb-8 font-medium text-[15px] leading-relaxed">Bạn đang chọn <strong style={{ color: plans[planIndex].theme.text }}>{plans[planIndex].title} ({plans[planIndex].price})</strong>. Vui lòng quét mã và tải ảnh xác nhận lệnh chuyển tiền lên hệ thống.</p>
                            
                            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all mb-6">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {billBase64 ? <Check className="text-green-500 mb-3" size={36}/> : <UploadCloud className="text-gray-400 mb-3" size={36}/>}
                                    <p className="text-[13px] text-gray-600 font-bold tracking-wide">{billBase64 ? "ĐÃ CHỌN ẢNH THÀNH CÔNG" : "BẤM VÀO ĐỂ TẢI ẢNH BILL"}</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>

                            <button onClick={handleConfirmPayment} disabled={loading || !billBase64} className={`w-full text-white py-4 rounded-full font-black text-[14px] uppercase tracking-widest shadow-xl disabled:bg-gray-300 disabled:shadow-none active:scale-95 transition-all ${plans[planIndex].theme.btn}`}>
                                {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐÃ CHUYỂN'}
                            </button>
                            <div className="text-center mt-6">
                                <button type="button" onClick={() => setStep('pricing')} className="text-gray-400 hover:text-gray-600 font-bold text-[13px] underline transition-colors">Quay lại chọn gói</button>
                            </div>
                        </div>

                        <div className={`p-[4px] rounded-[44px] bg-gradient-to-br ${plans[planIndex].theme.gradBorder} shadow-2xl w-[320px] sm:w-[400px] shrink-0`}>
                            <div className="bg-white rounded-[40px] p-4 h-[400px] sm:h-[480px] flex items-center justify-center overflow-hidden relative">
                                <img src={plans[planIndex].qrImage} className="w-full h-full object-contain rounded-[24px]" alt="QR" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                                <div className="hidden text-gray-400 text-sm italic text-center px-4 absolute">Ảnh mã QR chưa có trong thư mục public</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LỚP 4: THÀNH CÔNG & CHỜ DUYỆT */}
                <div className={`absolute inset-0 bg-green-50/80 backdrop-blur-md z-[70] flex flex-col items-center justify-center p-8 transition-transform duration-700 ease-in-out ${step === 'success' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="w-28 h-28 bg-white shadow-2xl shadow-green-200 text-green-500 rounded-full flex items-center justify-center mb-8 animate-bounce"><Check size={60} strokeWidth={4}/></div>
                    <h2 className="text-[32px] font-black text-[#1D1D1F] mb-4 text-center">Đã Gửi Yêu Cầu!</h2>
                    <p className="text-gray-600 text-[16px] mb-12 text-center max-w-[400px] font-medium leading-relaxed">
                        Hệ thống đã nhận được Bill thanh toán của bạn. Vui lòng giữ nguyên màn hình này, hệ thống sẽ tự động đưa bạn vào Workspace ngay khi Admin xác nhận.
                    </p>
                    {/* NÚT ĐĂNG XUẤT ĐÃ ĐƯỢC FIX LẠI */}
                    <button onClick={forceLogoutAndReset} className="text-gray-500 font-bold text-[13px] underline hover:text-red-500 transition-colors">
                        Đăng Xuất
                    </button>
                </div>

            </div>
        </div>
    ); 
}
