import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Crown, Star, Eye } from 'lucide-react';
import { API_URL } from './utils';

// Import các Module vừa bóc tách
import Toast from './components/Toast';
import AuthForm from './components/auth/AuthForm';
import PricingPlan from './components/auth/PricingPlan';
import PaymentQR from './components/auth/PaymentQR';
import SuccessStatus from './components/auth/SuccessStatus';

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

    const plans = [
        { 
            id: '10k', title: 'GÓI CƠ BẢN', price: '10,000', period: 'Tháng', icon: Eye, qrImage: '/qr-10k.jpg', 
            features: ['Xem thống kê tổng quan', 'Khóa xem chi tiết lô', 'Hỗ trợ cơ bản'],
            theme: { 
                text: '#6D4C41', bgIcon: '#EFEBE9', 
                gradBorder: 'bg-[linear-gradient(135deg,#8B4513,#E3A869,#8B4513)]', 
                shadow: 'shadow-[#8B4513]/40', 
                btn: 'bg-[linear-gradient(135deg,#8B4513,#E3A869,#8B4513)] text-white border border-[#E3A869]/50 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_4px_15px_rgba(139,69,19,0.3)]' 
            }
        },
        { 
            id: '50k', title: 'GÓI VIP', price: '50,000', period: '6 Tháng', icon: Star, qrImage: '/qr-50k.jpg', 
            features: ['Xem đầy đủ thống kê', 'Xem chi tiết lô hàng', 'Hỗ trợ kỹ thuật 24/7'],
            theme: { 
                text: '#334155', bgIcon: '#F1F5F9', 
                gradBorder: 'bg-[linear-gradient(135deg,#94A3B8,#FFFFFF,#64748B)]', 
                shadow: 'shadow-[#64748B]/30', 
                btn: 'bg-[linear-gradient(135deg,#94A3B8,#FFFFFF,#94A3B8)] text-slate-800 border border-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_4px_15px_rgba(100,116,139,0.3)]' 
            }
        },
        { 
            id: '100k', title: 'GÓI VVIP', price: '100,000', period: 'Năm', icon: Crown, qrImage: '/qr-100k.jpg', 
            features: ['Đầy đủ tính năng cao cấp', 'Xuất Excel báo cáo', 'Ưu tiên tính năng mới'],
            theme: { 
                text: '#92400E', bgIcon: '#FEF3C7', 
                gradBorder: 'bg-[linear-gradient(135deg,#BF953F,#FCF6BA,#B38728,#FBF5B7,#AA771C)]', 
                shadow: 'shadow-[#F59E0B]/50', 
                btn: 'bg-[linear-gradient(135deg,#BF953F,#FCF6BA,#B38728)] text-yellow-900 border border-[#FCF6BA] shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_4px_15px_rgba(179,135,40,0.4)]' 
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
        <div className="min-h-screen flex items-center justify-center bg-aurora p-4 font-sans box-border overflow-hidden relative">
            
            {/* AMBIENT GLOWS: Hiệu ứng ánh sáng lơ lửng chuẩn Pro Max */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#38bdf8]/20 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }}></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#2dd4bf]/20 rounded-full blur-[120px] animate-pulse pointer-events-none" style={{ animationDuration: '12s', animationDirection: 'reverse' }}></div>

            <Toast toast={toast} />

            {/* MAIN CARD: Chuyển thành mặt kính lơ lửng (Floating Glass) */}
            <div className="relative w-full max-w-[1050px] min-h-[600px] md:min-h-[700px] liquid-glass bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[32px] md:rounded-[40px] shadow-[0_24px_80px_rgba(0,0,0,0.07)] overflow-hidden transition-all duration-700 ease-in-out z-10">
                
                <AuthForm 
                    step={step} isRightPanelActive={isRightPanelActive} togglePanel={togglePanel} 
                    view={view} setView={setView} otpStep={otpStep} setOtpStep={setOtpStep} 
                    handleSendOTP={handleSendOTP} handleAuth={handleAuth} loading={loading} 
                    formData={formData} setFormData={setFormData} showPassword={showPassword} 
                    setShowPassword={setShowPassword} rememberMe={rememberMe} setRememberMe={setRememberMe} 
                />
                <PricingPlan 
                    step={step} plans={plans} planIndex={planIndex} setPlanIndex={setPlanIndex} 
                    handleSelectPlan={handleSelectPlan} forceLogoutAndReset={forceLogoutAndReset} 
                />
                <PaymentQR 
                    step={step} setStep={setStep} plans={plans} planIndex={planIndex} 
                    billBase64={billBase64} handleFileChange={handleFileChange} 
                    handleConfirmPayment={handleConfirmPayment} loading={loading} 
                />
                <SuccessStatus 
                    step={step} expiredEmail={expiredEmail} 
                    forceLogoutAndReset={forceLogoutAndReset} handleBackToLogin={handleBackToLogin} 
                />
            </div>
        </div>
    ); 
}