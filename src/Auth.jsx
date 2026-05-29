import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Eye, EyeOff, RefreshCw, KeyRound, Crown, Star, Check, ChevronLeft, ChevronRight, QrCode, Clock, UploadCloud } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess }) {
    const [isRightPanelActive, setIsRightPanelActive] = useState(false);
    const [view, setView] = useState('LOGIN'); 
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

    // CẤU HÌNH MÀU SẮC ĐỒNG - BẠC - VÀNG
    const plans = [
        { id: '10k', title: 'Cơ Bản', price: '10,000', period: 'Tháng', icon: Eye, themeColor: '#8D6E63', bgLight: '#EFEBE9', qrImage: '/qr-10k.jpg', features: ['Xem thống kê tổng quan', 'Khóa xem chi tiết lô', 'Hỗ trợ cơ bản'] },
        { id: '50k', title: 'Tiêu Chuẩn', price: '50,000', period: '6 Tháng', icon: Star, themeColor: '#64748B', bgLight: '#F8FAFC', qrImage: '/qr-50k.jpg', features: ['Xem đầy đủ thống kê', 'Xem chi tiết lô hàng', 'Hỗ trợ kỹ thuật 24/7'] },
        { id: '100k', title: 'V.I.P', price: '100,000', period: 'Năm', icon: Crown, themeColor: '#F59E0B', bgLight: '#FFF8E1', qrImage: '/qr-100k.jpg', features: ['Đầy đủ tính năng cao cấp', 'Xuất Excel báo cáo', 'Ưu tiên tính năng mới'] }
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
                setStep('pricing'); 
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
        togglePanel(false); 
        setSuccessMsg('Đã gửi yêu cầu thành công! Vui lòng chờ Admin duyệt.');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4f9] p-4 font-sans box-border overflow-hidden relative">
            <style>{`.right-panel-active .sign-in-container { transform: translateX(100%); } .right-panel-active .sign-up-container { transform: translateX(100%); opacity: 1; z-index: 5; animation: show 0.6s; } .right-panel-active .overlay-container { transform: translateX(-100%); } .right-panel-active .overlay { transform: translateX(50%); }`}</style>
            
            <div className={`relative w-full max-w-[850px] min-h-[550px] bg-white rounded-[30px] shadow-[0_15px_45px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-700 ease-in-out ${isRightPanelActive && step === 'auth' ? 'right-panel-active' : ''}`}>
                
                {/* LỚP 1: ĐĂNG NHẬP / ĐĂNG KÝ */}
                <div className={`absolute inset-0 transition-transform duration-700 ${step !== 'auth' ? '-translate-x-full' : 'translate-x-0'}`}>
                    <div className="absolute top-0 left-0 w-full md:w-1/2 h-full flex flex-col items-center justify-center p-8 md:p-12 z-20 bg-white">
                        <form onSubmit={handleAuth} className="w-full text-center">
                            <img src="/logo.png" className="w-16 h-16 mx-auto mb-4 rounded-full border shadow-sm" alt="Logo" />
                            <h1 className="text-3xl font-black mb-2 text-gray-800">{isRightPanelActive ? 'Tạo Tài Khoản' : 'Đăng Nhập'}</h1>
                            {error && <p className="text-red-500 text-xs font-bold mb-4">{error}</p>}
                            {successMsg && <p className="text-green-500 text-xs font-bold mb-4">{successMsg}</p>}
                            <div className="space-y-3 mb-6">
                                {isRightPanelActive && <input required className="w-full bg-gray-100 p-3.5 rounded-xl outline-none" placeholder="Tên hiển thị" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />}
                                <input required className="w-full bg-gray-100 p-3.5 rounded-xl outline-none" type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                <div className="relative">
                                    <input required className="w-full bg-gray-100 p-3.5 rounded-xl outline-none pr-10" type={showPassword ? "text" : "password"} placeholder="Mật khẩu" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                                </div>
                            </div>
                            {!isRightPanelActive && (
                                <div className="flex items-center gap-2 mb-6">
                                    <input type="checkbox" id="remember" className="w-4 h-4 accent-[#26D0CE] cursor-pointer" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                                    <label htmlFor="remember" className="text-sm text-gray-500 cursor-pointer font-medium">Ghi nhớ tài khoản</label>
                                </div>
                            )}
                            <button className="w-full bg-gradient-to-r from-[#21C8F6] to-[#26D0CE] text-white py-3.5 rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">{loading ? '...' : (isRightPanelActive ? 'Đăng Ký' : 'Đăng Nhập')}</button>
                        </form>
                        <button onClick={() => setIsRightPanelActive(!isRightPanelActive)} className="md:hidden mt-6 text-[#26D0CE] font-bold underline">{isRightPanelActive ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}</button>
                    </div>
                    <div className="hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-50">
                        <div className="bg-gradient-to-r from-[#26D0CE] to-[#21C8F6] text-white h-full flex flex-col items-center justify-center p-12 text-center">
                            <h2 className="text-3xl font-black mb-4">{isRightPanelActive ? 'Mừng Trở Lại!' : 'Chào Người Mới!'}</h2>
                            <p className="mb-8 opacity-90">{isRightPanelActive ? 'Đăng nhập để tiếp tục quản lý dòng tiền.' : 'Khởi đầu hành trình kinh doanh chuyên nghiệp.'}</p>
                            <button onClick={() => setIsRightPanelActive(!isRightPanelActive)} className="border-2 border-white px-12 py-2.5 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-[#26D0CE] transition-all">CHUYỂN</button>
                        </div>
                    </div>
                </div>

                {/* LỚP 2: CHỌN GÓI */}
                <div className={`absolute inset-0 bg-[#f8fafc] z-[55] flex flex-col items-center justify-center p-6 transition-transform duration-700 ${step === 'pricing' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <h2 className="text-3xl font-black text-gray-800 mb-6">Chọn Gói Dịch Vụ</h2>
                    <div className="flex gap-4 w-full max-w-[800px] overflow-hidden">
                        {plans.map((p, i) => (
                            <div key={p.id} onClick={() => setPlanIndex(i)} style={{ borderColor: planIndex === i ? p.themeColor : 'transparent' }} className={`flex-1 p-6 rounded-3xl cursor-pointer transition-all border-4 ${planIndex === i ? 'bg-white shadow-2xl scale-105' : 'bg-gray-100 opacity-60'}`}>
                                <div style={{ backgroundColor: p.bgLight, color: p.themeColor }} className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"><p.icon /></div>
                                <h3 className="font-bold text-lg">{p.title}</h3>
                                <div style={{ color: p.themeColor }} className="text-2xl font-black my-2">{p.price}đ</div>
                                <ul className="text-[11px] space-y-1.5 text-gray-500 mb-6">
                                    {p.features.map(f => <li key={f} className="flex gap-1"><Check size={12} style={{ color: p.themeColor }}/> {f}</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <button onClick={handleSelectPlan} style={{ backgroundColor: plans[planIndex].themeColor }} className="mt-8 text-white px-16 py-4 rounded-full font-black shadow-xl active:scale-95 transition-all">TIẾP TỤC THANH TOÁN</button>
                </div>

                {/* LỚP 3: QUÉT QR & TẢI BILL */}
                <div className={`absolute inset-0 bg-white z-[60] flex flex-col items-center justify-center p-6 transition-transform duration-700 ${step === 'qr' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="flex flex-col lg:flex-row items-center gap-12 w-full max-w-[1000px]">
                        <div className="text-center lg:text-left flex-1">
                            <h2 className="text-3xl font-black text-gray-800 mb-2">Quét & Tải Bill</h2>
                            <p className="text-gray-500 mb-6 font-medium">Vui lòng quét mã và tải ảnh xác nhận lên để kích hoạt.</p>
                            
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all mb-4">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    {billBase64 ? <Check className="text-green-500 mb-2" size={32}/> : <UploadCloud className="text-gray-400 mb-2" size={32}/>}
                                    <p className="text-sm text-gray-500 font-bold">{billBase64 ? "ĐÃ CHỌN ẢNH BILL" : "BẤM ĐỂ TẢI ẢNH CHUYỂN KHOẢN"}</p>
                                </div>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>

                            <button onClick={handleConfirmPayment} disabled={loading || !billBase64} style={{ backgroundColor: plans[planIndex].themeColor }} className="w-full text-white py-4 rounded-2xl font-black shadow-lg disabled:bg-gray-300">XÁC NHẬN ĐÃ CHUYỂN {loading ? '...' : ''}</button>
                            <button type="button" onClick={() => setStep('pricing')} className="w-full mt-4 text-gray-400 font-bold text-sm underline border-none bg-transparent">Quay lại chọn gói</button>
                        </div>

                        <div style={{ borderColor: plans[planIndex].bgLight }} className="bg-white border-8 rounded-[40px] shadow-2xl p-4 w-[350px] lg:w-[420px] h-[350px] lg:h-[420px]">
                            <img src={plans[planIndex].qrImage} className="w-full h-full object-contain rounded-[20px]" alt="QR" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                            <div className="hidden text-gray-400 text-sm italic text-center px-4 mt-20">Sếp chưa thả ảnh qr-10k.jpg, qr-50k.jpg, qr-100k.jpg vào thư mục public</div>
                        </div>
                    </div>
                </div>

                {/* LỚP 4: THÀNH CÔNG */}
                <div className={`absolute inset-0 bg-green-50 z-[70] flex flex-col items-center justify-center p-8 transition-transform duration-700 ${step === 'success' ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="w-24 h-24 bg-white shadow-xl text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce"><Check size={50} strokeWidth={4}/></div>
                    <h2 className="text-3xl font-black text-gray-800 mb-4">Đã gửi yêu cầu!</h2>
                    <p className="text-gray-600 text-center max-w-sm mb-12 font-medium">Hệ thống đang kiểm tra Bill của bạn. Vui lòng chờ Admin duyệt vào trong vài phút.</p>
                    <button onClick={handleFinishAndLogin} className="bg-gray-800 text-white px-16 py-4 rounded-full font-black shadow-xl active:scale-95 transition-all uppercase tracking-widest">Đã Hiểu</button>
                </div>

            </div>
        </div>
    ); 
}
