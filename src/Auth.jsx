import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Eye, EyeOff, RefreshCw, KeyRound, Crown, Star, Check, QrCode, Clock, UploadCloud, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess, expiredEmail, onLogout }) {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [view, setView] = useState('LOGIN'); 
    const [step, setStep] = useState(expiredEmail ? 'pricing' : 'auth'); 
    const [registeredEmail, setRegisteredEmail] = useState(expiredEmail || ''); 
    const [otpStep, setOtpStep] = useState(1); 
    const [planIndex, setPlanIndex] = useState(1); 
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '', newPassword: '' });
    const [billBase64, setBillBase64] = useState(null); 
    const [toast, setToast] = useState({ show: false, message: '', type: 'error' });

    const showToast = (message, type = 'error') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'error' }), 4000);
    };

    // ĐÃ FIX: Nhãn Uniform size, Satin Matte mờ mịn nhẹ nhàng, bỏ chữ "GÓI"
    const plans = [
        { 
            id: '10k', title: 'CƠ BẢN', price: '10,000', period: 'Tháng', icon: Eye, qrImage: '/qr-10k.jpg', 
            features: ['Xem thống kê tổng quan', 'Khóa xem chi tiết lô', 'Hỗ trợ cơ bản'],
            theme: { 
                text: '#5D4037', bgIcon: '#EFEBE9', 
                gradBorder: 'bg-[#D7CCC8]', 
                shadow: 'shadow-sm', 
                btn: 'bg-gradient-to-b from-[#A1887F] to-[#8D6E63] text-white shadow-md' 
            }
        },
        { 
            id: '50k', title: 'VIP', price: '50,000', period: '6 Tháng', icon: Star, qrImage: '/qr-50k.jpg', 
            features: ['Xem đầy đủ thống kê', 'Xem chi tiết lô hàng', 'Hỗ trợ kỹ thuật 24/7'],
            theme: { 
                text: '#334155', bgIcon: '#F1F5F9', 
                gradBorder: 'bg-[#E2E8F0]', 
                shadow: 'shadow-sm', 
                btn: 'bg-gradient-to-b from-[#CBD5E1] to-[#94A3B8] text-slate-800 shadow-md' 
            }
        },
        { 
            id: '100k', title: 'VVIP', price: '100,000', period: 'Năm', icon: Crown, qrImage: '/qr-100k.jpg', 
            features: ['Đầy đủ tính năng cao cấp', 'Xuất Excel báo cáo', 'Ưu tiên tính năng mới'],
            theme: { 
                text: '#92400E', bgIcon: '#FEF3C7', 
                gradBorder: 'bg-[#FDE68A]', 
                shadow: 'shadow-sm', 
                btn: 'bg-gradient-to-b from-[#FCD34D] to-[#F59E0B] text-yellow-950 shadow-md' 
            }
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
        } catch (err) { 
            const errorMsg = err.response?.data?.error;
            if (errorMsg === 'INCOMPLETE_REGISTRATION') {
                setRegisteredEmail(err.response?.data?.email || formData.email);
                setStep('pricing');
                showToast("Vui lòng hoàn tất việc chọn gói và tải Bill lên nhé!", 'error');
            } else {
                showToast(errorMsg || "Sai thông tin đăng nhập!", 'error'); 
            }
        }
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

    const handleBackToLogin = () => {
        setStep('auth');
        setView('LOGIN');
        setIsRightPanelActive(false);
        setRegisteredEmail('');
        setBillBase64(null);
        setFormData({...formData, password: '', otp: '', newPassword: ''});
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 font-sans box-border overflow-hidden relative">
            <div className={`fixed top-5 right-5 z-[9999] transition-all duration-500 ease-in-out ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'}`}>
                <div className={`flex items-center gap-3 px-6 py-4 rounded-[20px] shadow-2xl border ${toast.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={24}/> : <AlertCircle size={24}/>}
                    <p className="font-bold text-[14px] tracking-wide">{toast.message}</p>
                </div>
            </div>

            <div className={`relative w-full max-w-[850px] min-h-[550px] bg-white rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 ease-in-out`}>
                <div className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-in-out bg-white ${step !== 'auth' ? '-translate-x-full' : 'translate-x-0'}`}>
                    <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-10 transition-all duration-700 ease-in-out ${isRightPanelActive ? 'md:translate-x-full opacity-100 z-20 pointer-events-auto' : 'opacity-0 pointer-events-none z-10'}`}>
                        <form onSubmit={otpStep === 1 ? handleSendOTP : handleAuth} className="flex flex-col items-center justify-center w-full h-full text-center">
                            <h1 className="font-extrabold text-[28px] md:text-[30px] mb-2 text-[#333]">Tạo Tài Khoản</h1>
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
                            <button type="submit" disabled={loading} className="rounded-full bg-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 hover:opacity-90 w-full flex justify-center uppercase shadow-md">
                                {loading ? <RefreshCw size={18} className="animate-spin" /> : 'ĐĂNG KÝ NGAY'}
                            </button>
                            <button type="button" onClick={() => togglePanel(false)} className="md:hidden mt-6 text-[#26D0CE] text-[13px] font-bold underline">Đã có tài khoản? Đăng nhập</button>
                        </form>
                    </div>

                    <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-10 transition-all duration-700 ease-in-out bg-white ${isRightPanelActive ? 'md:translate-x-full opacity-0 pointer-events-none z-10' : 'translate-x-0 opacity-100 z-20 pointer-events-auto'}`}>
                        <form onSubmit={view === 'FORGOT' && otpStep === 1 ? handleSendOTP : handleAuth} className="flex flex-col items-center justify-center w-full h-full text-center">
                            <div className="w-[65px] h-[65px] rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100 overflow-hidden bg-white">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; }} />
                            </div>
                            <h1 className="font-extrabold text-[28px] md:text-[32px] mb-1 text-[#222]">Đăng Nhập</h1>
                            <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-3">
                                <Mail size={18} className="text-gray-400" />
                                <input required type="email" placeholder="Email" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] text-gray-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                            <div className="bg-[#f4f6f9] w-full rounded-full flex items-center px-5 py-3.5 mb-4 relative">
                                <Lock size={18} className="text-gray-400" />
                                <input required type={showPassword ? 'text' : 'password'} placeholder="Mật khẩu" className="bg-transparent outline-none border-none w-full ml-3 text-[14px] pr-8 text-gray-700" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                            </div>
                            <button type="submit" disabled={loading} className="rounded-full bg-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 hover:opacity-90 w-full flex justify-center shadow-md">
                                {loading ? <RefreshCw size={18} className="animate-spin" /> : 'ĐĂNG NHẬP'}
                            </button>
                            <button type="button" onClick={() => togglePanel(true)} className="md:hidden mt-6 text-[#26D0CE] text-[13px] font-bold underline">Chưa có tài khoản? Tạo ngay</button>
                        </form>
                    </div>

                    <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isRightPanelActive ? '-translate-x-full' : 'translate-x-0'}`}>
                        <div className={`bg-[#26D0CE] relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
                            <div className="absolute top-0 left-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white">
                                <h1 className="font-extrabold text-[36px] mb-4">Mừng Trở Lại!</h1>
                                <button onClick={() => togglePanel(false)} className="rounded-full border-[1.5px] border-white bg-transparent text-white text-[13px] font-bold py-3.5 px-12 tracking-widest uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#26D0CE]">ĐĂNG NHẬP</button>
                            </div>
                            <div className="absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white">
                                <h1 className="font-extrabold text-[36px] mb-4">Chào Người Mới!</h1>
                                <button onClick={() => togglePanel(true)} className="rounded-full border-[1.5px] border-white bg-transparent text-white text-[13px] font-bold py-3.5 px-12 tracking-widest uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#26D0CE]">TẠO TÀI KHOẢN</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LỚP 2: MÀN HÌNH CHỌN GÓI - SATIN MATTE STYLE */}
                <div className={`absolute inset-0 bg-gray-50/95 backdrop-blur-sm z-[55] overflow-y-auto md:overflow-hidden transition-transform duration-700 ease-in-out ${step === 'pricing' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col items-center justify-center min-h-full w-full p-6 md:p-0">
                        <h2 className="text-[28px] font-black text-gray-800 mb-8">Bảng Giá Dịch Vụ</h2>
                        <div className="flex flex-col md:flex-row gap-6 w-full max-w-[780px]">
                            {plans.map((p, i) => (
                                <div key={p.id} onClick={() => setPlanIndex(i)} className={`relative flex-1 p-[2px] rounded-[24px] cursor-pointer transition-all duration-300 ${planIndex === i ? `${p.theme.gradBorder} scale-105 z-10` : 'bg-gray-200 opacity-60'}`}>
                                    <div className="bg-white rounded-[22px] p-6 h-[340px] flex flex-col items-center text-center">
                                        <div style={{ backgroundColor: p.theme.bgIcon, color: p.theme.text }} className="w-12 h-12 rounded-full flex items-center justify-center mb-4"><p.icon size={22} /></div>
                                        <h3 className="font-black text-[15px] mb-1" style={{ color: p.theme.text }}>{p.title}</h3>
                                        <div className="text-[28px] font-black mb-4" style={{ color: p.theme.text }}>{p.price}<span className="text-[12px] font-bold text-gray-400">/{p.period}</span></div>
                                        <ul className="text-left space-y-2 mb-6 flex-1">
                                            {p.features.map((f, idx) => (
                                                <li key={idx} className="flex items-start gap-2 text-[12px] text-gray-600 font-semibold"><Check size={12} className="mt-1" /> {f}</li>
                                            ))}
                                        </ul>
                                        <button className={`w-full py-2.5 rounded-xl font-bold text-[12px] uppercase tracking-wider transition-all ${planIndex === i ? p.theme.btn : 'bg-gray-100 text-gray-400'}`}>
                                            {planIndex === i ? 'ĐANG CHỌN' : 'CHỌN'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={handleSelectPlan} className="mt-8 bg-gray-900 text-white px-12 py-3.5 rounded-full font-black text-[13px] shadow-xl active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2 hover:bg-black">TIẾP TỤC THANH TOÁN <ArrowRight size={18}/></button>
                        <button onClick={forceLogoutAndReset} className="mt-4 text-gray-500 font-bold text-[12px] underline hover:text-red-500 transition-colors">Quay lại</button>
                    </div>
                </div>

                {/* LỚP 3: QUÉT QR & TẢI BILL */}
                <div className={`absolute inset-0 bg-white z-[60] overflow-y-auto transition-transform duration-700 ease-in-out ${step === 'qr' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col items-center justify-center min-h-full w-full p-8">
                        <div className="flex flex-col md:flex-row items-center gap-10 w-full max-w-[800px]">
                            <div className="flex-1">
                                <h2 className="text-[28px] font-black text-gray-800 mb-4">Thanh toán</h2>
                                <p className="text-gray-500 mb-6 text-[14px]">Bạn chọn <b>{plans[planIndex].title}</b>. Vui lòng nạp Bill xác nhận.</p>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all mb-6">
                                    {billBase64 ? <CheckCircle2 className="text-green-500" size={32}/> : <UploadCloud className="text-gray-400" size={32}/>}
                                    <p className="text-[12px] mt-2 font-bold text-gray-600">{billBase64 ? "ĐÃ CHỌN ẢNH" : "TẢI ẢNH BILL"}</p>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                                <button onClick={handleConfirmPayment} disabled={loading || !billBase64} className={`w-full py-3.5 rounded-xl font-bold text-white uppercase tracking-widest ${plans[planIndex].theme.btn} disabled:opacity-50`}>XÁC NHẬN</button>
                                <button onClick={() => setStep('pricing')} className="w-full mt-4 text-[12px] font-bold text-gray-400">Quay lại</button>
                            </div>
                            <div className={`p-1 rounded-[30px] ${plans[planIndex].theme.gradBorder} shadow-lg w-[300px] shrink-0`}>
                                <img src={plans[planIndex].qrImage} className="w-full h-full object-contain rounded-[28px]" alt="QR" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* LỚP 4: THÀNH CÔNG */}
                <div className={`absolute inset-0 bg-green-50 z-[70] flex flex-col items-center justify-center p-8 transition-transform duration-700 ease-in-out ${step === 'success' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <CheckCircle2 className="text-green-500 mb-6" size={80} />
                    <h2 className="text-[32px] font-black text-gray-800 mb-4">Đã Gửi Yêu Cầu!</h2>
                    <p className="text-gray-600 text-center max-w-[400px] mb-8 font-medium">Vui lòng đợi Admin duyệt để vào Workspace.</p>
                    <button onClick={handleBackToLogin} className="text-[#26D0CE] font-bold underline">Trở về Đăng Nhập</button>
                </div>
            </div>
        </div>
    ); 
}
