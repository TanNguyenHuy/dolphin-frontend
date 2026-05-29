import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Eye, EyeOff, RefreshCw, KeyRound, Crown, Star, Check, ChevronLeft, ChevronRight, QrCode, Clock, ArrowRight, UploadCloud } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess }) {
    // Trạng thái trượt của Form (Đăng nhập / Đăng ký)
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [view, setView] = useState('LOGIN'); 
    
    // Trạng thái của 4 Lớp Màn hình (auth -> pricing -> qr -> success)
    const [step, setStep] = useState('auth'); 
    const [otpStep, setOtpStep] = useState(1); 
    const [planIndex, setPlanIndex] = useState(1); 
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', otp: '', newPassword: '' });
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState(''); 
    const [billBase64, setBillBase64] = useState(null); 

    const plans = [
        { id: '10k', title: 'Cơ Bản', price: '10,000', period: 'Tháng', icon: Eye, qrImage: '/qr-10k.jpg', features: ['Xem thống kê tổng quan', 'Khóa xem chi tiết lô', 'Hỗ trợ cơ bản'] },
        { id: '50k', title: 'Tiêu Chuẩn', price: '50,000', period: '6 Tháng', icon: Star, qrImage: '/qr-50k.jpg', features: ['Xem đầy đủ thống kê', 'Xem chi tiết lô hàng', 'Hỗ trợ kỹ thuật 24/7'] },
        { id: '100k', title: 'V.I.P', price: '100,000', period: 'Năm', icon: Crown, qrImage: '/qr-100k.jpg', features: ['Đầy đủ tính năng cao cấp', 'Xuất Excel báo cáo', 'Ưu tiên tính năng mới'] }
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
        setOtpStep(1); setError(''); setSuccessMsg('');
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError(''); setSuccessMsg(''); setLoading(true);
        try {
            const type = view === 'REGISTER' ? 'register' : 'forgot';
            const res = await axios.post(`${API_URL}/send-otp`, { email: formData.email, type });
            setSuccessMsg(res.data.message);
            setOtpStep(2); 
        } catch (err) {
            setError(err.response?.data?.error || 'Lỗi gửi mail!');
        } finally { setLoading(false); }
    };

    const handleAuth = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const endpoint = isRightPanelActive ? '/register' : '/login';
            const res = await axios.post(`${API_URL}${endpoint}`, formData);
            if (isRightPanelActive) { 
                setRegisteredEmail(formData.email); 
                setStep('pricing'); // Trượt sang chọn gói
            }
            else {
                const user = res.data.user;
                if (user.role !== 'admin' && user.planExpiry && new Date(user.planExpiry) < new Date()) {
                    setRegisteredEmail(user.email); setStep('pricing'); alert("⚠️ Gói đã hết hạn!");
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
        } catch (err) { setError(err.response?.data?.error || "Lỗi thông tin!"); }
        finally { setLoading(false); }
    };

    const handleSelectPlan = () => setStep('qr');

    const handleConfirmPayment = async () => {
        if (!billBase64) return alert("Vui lòng tải ảnh màn hình đã chuyển khoản!");
        setLoading(true);
        try {
            await axios.put(`${API_URL}/update-plan`, { email: registeredEmail, plan: plans[planIndex].id, paymentImage: billBase64 });
            setStep('success');
        } catch (e) { alert("Lỗi gửi Bill!"); }
        finally { setLoading(false); }
    };

    const handleFinishAndLogin = () => {
        setStep('auth');
        togglePanel(false); // Trượt về màn hình Đăng Nhập
        setSuccessMsg('Đã gửi yêu cầu thành công! Vui lòng chờ Admin duyệt.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 font-sans box-border overflow-hidden relative">
            <div className={`relative w-full max-w-[850px] min-h-[550px] bg-white rounded-[20px] shadow-[0_15px_40px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 ease-in-out`}>
                
                {/* =========================================================
                    LỚP 1: MÀN HÌNH ĐĂNG NHẬP / ĐĂNG KÝ (TRƯỢT MƯỢT MÀ)
                ========================================================= */}
                <div className={`absolute inset-0 w-full h-full transition-transform duration-700 ease-in-out bg-white ${step !== 'auth' ? '-translate-x-full' : 'translate-x-0'}`}>
                    
                    {/* KHUNG ĐĂNG KÝ (Nằm dưới, sẽ hiện lên và trượt sang phải khi Active) */}
                    <div className={`absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-10 transition-all duration-700 ease-in-out ${isRightPanelActive ? 'md:translate-x-full opacity-100 z-20 pointer-events-auto' : 'opacity-0 pointer-events-none z-10'}`}>
                        <form onSubmit={otpStep === 1 ? handleSendOTP : handleAuth} className="flex flex-col items-center justify-center w-full h-full text-center">
                            <h1 className="font-extrabold text-[28px] md:text-[30px] mb-2 text-[#333]">Tạo Tài Khoản</h1>
                            <p className="text-[13px] text-gray-500 mb-6 font-medium">Tài khoản đầu tiên sẽ là Admin</p>
                            
                            {error && <span className="text-[#FF3B30] text-[13px] mb-3 font-semibold">{error}</span>}
                            {successMsg && <span className="text-[#1DB2A0] text-[13px] mb-3 font-semibold">{successMsg}</span>}

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
                                    <button type="submit" disabled={loading} className="rounded-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white text-[14px] font-bold py-3.5 px-8 transition-transform active:scale-95 hover:opacity-90 w-full flex justify-center uppercase shadow-md">
                                        {loading ? <RefreshCw size={18} className="animate-spin" /> : 'XÁC NHẬN MÃ OTP'}
                                    </button>
                                </>
                            )}
                            <button type="button" onClick={() => togglePanel(false)} className="md:hidden mt-6 text-[#26D0CE] text-[13px] font-bold underline">Đã có tài khoản? Đăng nhập</button>
                        </form>
                    </div>

                    {/* KHUNG ĐĂNG NHẬP (Nằm trên, trượt sang phải và mờ đi khi Active) */}
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

                    {/* OVERLAY XANH TRƯỢT */}
                    <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isRightPanelActive ? '-translate-x-full' : 'translate-x-0'}`}>
                        <div className={`bg-gradient-to-r from-[#26D0CE] to-[#21C8F6] relative -left-full h-full w-[200%] transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
                            
                            {/* Panel Trái (Thông báo khi ở Form Đăng ký) */}
                            <div className={`absolute top-0 left-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-0' : '-translate-x-[20%]'}`}>
                                <h1 className="font-extrabold text-[36px] mb-4">Mừng Trở Lại!</h1>
                                <p className="text-[15px] font-medium tracking-wide leading-relaxed mb-8 opacity-95">Đăng nhập ngay để tiếp tục quản lý dòng tiền của bạn.</p>
                                <button onClick={() => togglePanel(false)} className="rounded-full border-[1.5px] border-white bg-transparent text-white text-[13px] font-bold py-3.5 px-12 tracking-widest uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#26D0CE]">ĐĂNG NHẬP</button>
                            </div>

                            {/* Panel Phải (Thông báo khi ở Form Đăng nhập) */}
                            <div className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center text-white transition-transform duration-700 ease-in-out ${isRightPanelActive ? 'translate-x-[20%]' : 'translate-x-0'}`}>
                                <h1 className="font-extrabold text-[36px] mb-4">Chào Người Mới!</h1>
                                <p className="text-[15px] font-medium tracking-wide leading-relaxed mb-8 opacity-95">Đăng ký để sử dụng không gian quản lý tài chính thông minh nhất.</p>
                                <button onClick={() => togglePanel(true)} className="rounded-full border-[1.5px] border-white bg-transparent text-white text-[13px] font-bold py-3.5 px-12 tracking-widest uppercase transition-transform active:scale-95 hover:bg-white hover:text-[#26D0CE]">TẠO TÀI KHOẢN</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================================
                    LỚP 2: MÀN HÌNH LƯỚT CHỌN GÓI
                ========================================================= */}
                <div className={`absolute inset-0 bg-[#f8fafc] z-[55] flex flex-col items-center justify-center p-6 transition-transform duration-700 ease-in-out ${step === 'pricing' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <h2 className="text-3xl font-black text-gray-800 mb-6">Chọn Gói Dịch Vụ</h2>
                    <div className="flex gap-4 w-full max-w-[800px] overflow-hidden">
                        {plans.map((p, i) => (
                            <div key={p.id} onClick={() => setPlanIndex(i)} className={`flex-1 p-6 rounded-3xl cursor-pointer transition-all border-4 ${planIndex === i ? 'bg-white border-[#26D0CE] shadow-2xl scale-105' : 'bg-gray-100 border-transparent opacity-60'}`}>
                                <div className="w-12 h-12 bg-blue-50 text-[#33A1FD] rounded-xl flex items-center justify-center mb-4"><p.icon /></div>
                                <h3 className="font-bold text-lg">{p.title}</h3>
                                <div className="text-2xl font-black text-[#26D0CE] my-2">{p.price}đ</div>
                                <ul className="text-[11px] space-y-1.5 text-gray-500 mb-6">
                                    {p.features.map(f => <li key={f} className="flex gap-1"><Check size={12} className="text-green-500"/> {f}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleSelectPlan} className="mt-8 bg-[#1D1D1F] text-white px-16 py-4 rounded-full font-black shadow-xl active:scale-95 transition-all">TIẾP TỤC THANH TOÁN</button>
                </div>

                {/* =========================================================
                    LỚP 3: QUÉT QR & TẢI BILL
                ========================================================= */}
                <div className={`absolute inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 transition-transform duration-700 ease-in-out ${step === 'qr' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col lg:flex-row items-center gap-12 w-full max-w-[1000px]">
                        <div className="text-center lg:text-left flex-1">
                            <h2 className="text-3xl font-black text-gray-800 mb-2">Quét & Tải Bill</h2>
                            <p className="text-gray-500 mb-6 font-medium">Vui lòng quét mã <b>{plans[planIndex].title}</b> và tải ảnh xác nhận lên.</p>
                            
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all mb-4">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {billBase64 ? <Check className="text-green-500 mb-2" size={32}/> : <UploadCloud className="text-gray-400 mb-2" size={32}/>}
                                    <p className="text-sm text-gray-500 font-bold">{billBase64 ? "ĐÃ CHỌN ẢNH BILL" : "BẤM ĐỂ TẢI ẢNH CHUYỂN KHOẢN"}</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>

                            <button onClick={handleConfirmPayment} disabled={loading || !billBase64} className="w-full bg-[#26D0CE] text-white py-4 rounded-2xl font-black shadow-lg disabled:bg-gray-300">XÁC NHẬN ĐÃ CHUYỂN {loading ? '...' : ''}</button>
                            <button type="button" onClick={() => setStep('pricing')} className="w-full mt-4 text-gray-400 font-bold text-sm underline border-none bg-transparent">Quay lại chọn gói</button>
                        </div>

                        {/* MÃ QR SIÊU TO */}
                        <div className="bg-white border-8 border-gray-100 rounded-[40px] shadow-2xl p-4 w-[350px] lg:w-[420px] h-[350px] lg:h-[420px]">
                            <img src={plans[planIndex].qrImage} className="w-full h-full object-contain rounded-[20px]" alt="QR" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                            <div className="hidden text-gray-400 text-sm italic text-center px-4 mt-20">Sếp chưa thả ảnh qr-10k.jpg, qr-50k.jpg, qr-100k.jpg vào thư mục public</div>
                        </div>
                    </div>
                </div>

                {/* =========================================================
                    LỚP 4: THÀNH CÔNG & CHỜ DUYỆT
                ========================================================= */}
                <div className={`absolute inset-0 bg-green-50 z-[70] flex flex-col items-center justify-center p-8 transition-transform duration-700 ease-in-out ${step === 'success' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="w-24 h-24 bg-white shadow-xl text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce"><Check size={50} strokeWidth={4}/></div>
                    <h2 className="text-3xl font-black text-gray-800 mb-4">Đã gửi yêu cầu!</h2>
                    <p className="text-gray-600 text-center max-w-sm mb-12 font-medium">Hệ thống đang kiểm tra Bill của bạn. Vui lòng chờ Admin kích hoạt trong vài phút.</p>
                    <button onClick={handleFinishAndLogin} className="bg-gray-800 text-white px-16 py-4 rounded-full font-black shadow-xl active:scale-95 transition-all uppercase tracking-widest">Đã Hiểu</button>
                </div>

            </div>
        </div>
    ); 
}
