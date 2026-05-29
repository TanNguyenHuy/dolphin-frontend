import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock, Check, Crown, Star, Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [step, setStep] = useState('auth'); // 'auth' = Đăng nhập/Đăng ký | 'pricing' = Chọn gói
    const [planIndex, setPlanIndex] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', rememberMe: true });

    const plans = [
        { id: 'monthly', title: 'Cơ Bản', price: '10k', period: 'Tháng', icon: Eye, features: ['Chỉ xem thống kê tổng quan', 'Không xem được chi tiết', 'Hỗ trợ cơ bản'] },
        { id: 'half-year', title: 'Tiêu Chuẩn', price: '50k', period: '6 Tháng', icon: Star, features: ['Xem được thống kê tổng quan', 'Xem CHI TIẾT từng đợt bán', 'Hỗ trợ kỹ thuật 24/7'] },
        { id: 'yearly', title: 'V.I.P', price: '100k', period: 'Năm', icon: Crown, features: ['Tất cả tính năng gói 50k', 'Xuất báo cáo File Excel', 'Ưu tiên trải nghiệm tính năng mới'] }
    ];

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = isSignUp ? '/register' : '/login';
            const res = await axios.post(`${API_URL}${endpoint}`, formData);
            if (isSignUp) {
                // Đăng ký xong -> Chuyển sang màn hình chọn gói
                setStep('pricing'); 
            } else {
                // Đăng nhập thành công -> Vào hệ thống
                onLoginSuccess(res.data, formData.rememberMe);
            }
        } catch (err) { 
            alert(err.response?.data?.error || "Đã có lỗi xảy ra!"); 
        } finally { 
            setLoading(false); 
        }
    };

    const handleCompletePricing = () => {
        alert(`🎉 Chúc mừng bạn đã đăng ký gói ${plans[planIndex].title}! Vui lòng nhắn tin cho Admin để kích hoạt gói và đăng nhập.`);
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E0F7FA] font-sans p-4 relative overflow-hidden">
            {/* CSS Tùy chỉnh cho hiệu ứng trượt mượt mà */}
            <style dangerouslySetInnerHTML={{ __html: `
                .auth-container { background-color: #fff; border-radius: 30px; box-shadow: 0 14px 28px rgba(0,0,0,0.1); position: relative; overflow: hidden; width: 850px; max-width: 100%; min-height: 550px; transition: 0.6s ease-in-out; }
                .form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; }
                .sign-in-container { left: 0; width: 50%; z-index: 2; opacity: ${isSignUp ? '0' : '1'}; }
                .sign-up-container { left: 0; width: 50%; opacity: 0; z-index: 1; transform: ${isSignUp ? 'translateX(100%)' : 'none'}; opacity: ${isSignUp ? '1' : '0'}; z-index: 5; }
                .overlay-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100; transform: ${isSignUp ? 'translateX(-100%)' : 'none'}; }
                .overlay { background: linear-gradient(to right, #33A1FD, #26D0CE); color: #FFFFFF; position: relative; left: -100%; height: 100%; width: 200%; transform: ${isSignUp ? 'translateX(50%)' : 'translateX(0)'}; transition: transform 0.6s ease-in-out; }
                .overlay-panel { position: absolute; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 40px; text-align: center; top: 0; height: 100%; width: 50%; transition: transform 0.6s ease-in-out; }
                .overlay-right { right: 0; }
                .pricing-track { display: flex; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(-${planIndex * 100}%); width: 100%; }
            `}} />

            <div className="auth-container">
                {step === 'auth' ? (
                    <>
                        {/* FORM ĐĂNG KÝ */}
                        <div className="form-container sign-up-container p-8 md:p-12 flex flex-col justify-center">
                            <form onSubmit={handleAuth} className="flex flex-col items-center">
                                <h2 className="text-[28px] font-black text-[#1D1D1F] mb-6">Tạo Tài Khoản</h2>
                                <div className="w-full relative mb-3">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input required className="w-full bg-gray-50 border border-gray-100 p-3.5 pl-12 rounded-xl outline-none focus:border-[#26D0CE] transition-all" placeholder="Tên hiển thị" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                                </div>
                                <div className="w-full relative mb-3">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="email" required className="w-full bg-gray-50 border border-gray-100 p-3.5 pl-12 rounded-xl outline-none focus:border-[#26D0CE] transition-all" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="w-full relative mb-6">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="password" required className="w-full bg-gray-50 border border-gray-100 p-3.5 pl-12 rounded-xl outline-none focus:border-[#26D0CE] transition-all" placeholder="Mật khẩu" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                </div>
                                <button disabled={loading} className="w-full bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest shadow-md hover:opacity-90 transition-all disabled:opacity-50 active:scale-95">
                                    {loading ? 'Đang xử lý...' : 'ĐĂNG KÝ NGAY'}
                                </button>
                            </form>
                        </div>

                        {/* FORM ĐĂNG NHẬP */}
                        <div className="form-container sign-in-container p-8 md:p-12 flex flex-col justify-center">
                            <form onSubmit={handleAuth} className="flex flex-col items-center">
                                <h2 className="text-[28px] font-black text-[#1D1D1F] mb-6">Đăng Nhập</h2>
                                <div className="w-full relative mb-3">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="email" required className="w-full bg-gray-50 border border-gray-100 p-3.5 pl-12 rounded-xl outline-none focus:border-[#33A1FD] transition-all" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                                </div>
                                <div className="w-full relative mb-6">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input type="password" required className="w-full bg-gray-50 border border-gray-100 p-3.5 pl-12 rounded-xl outline-none focus:border-[#33A1FD] transition-all" placeholder="Mật khẩu" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                                </div>
                                <button disabled={loading} className="w-full bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest shadow-md hover:opacity-90 transition-all disabled:opacity-50 active:scale-95">
                                    {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                                </button>
                            </form>
                        </div>

                        {/* PANEL XANH TRƯỢT */}
                        <div className="overlay-container hidden md:block pointer-events-none">
                            <div className="overlay">
                                <div className="overlay-panel pointer-events-auto">
                                    <Crown size={60} className="mb-6 drop-shadow-md text-white/90" />
                                    <h2 className="text-3xl font-black mb-4 leading-tight">Mừng Trở Lại!</h2>
                                    <p className="mb-8 font-medium text-white/80">Quản lý dòng tiền, tồn kho và làm chủ công việc kinh doanh của bạn.</p>
                                    <button onClick={() => setIsSignUp(false)} className="border-2 border-white text-white px-10 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-[#33A1FD] transition-all active:scale-95">
                                        ĐĂNG NHẬP
                                    </button>
                                </div>
                                <div className="overlay-panel overlay-right pointer-events-auto">
                                    <Crown size={60} className="mb-6 drop-shadow-md text-white/90" />
                                    <h2 className="text-3xl font-black mb-4 leading-tight">Chào Người Mới!</h2>
                                    <p className="mb-8 font-medium text-white/80">Khởi đầu hành trình kinh doanh chuyên nghiệp cùng hệ thống Dolphin.</p>
                                    <button onClick={() => setIsSignUp(true)} className="border-2 border-white text-white px-10 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-white hover:text-[#26D0CE] transition-all active:scale-95">
                                        TẠO TÀI KHOẢN
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* CAROUSEL CHỌN GÓI (Hiển thị sau khi nhấn Đăng ký) */
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gray-50 absolute inset-0 z-[200]">
                        <h2 className="text-3xl font-black text-[#1D1D1F] mb-2">Hoàn tất Đăng ký</h2>
                        <p className="text-gray-500 text-sm mb-8 text-center max-w-md">Lướt qua các thẻ bên dưới để chọn gói dịch vụ phù hợp nhất với shop của bạn.</p>
                        
                        <div className="relative w-full max-w-[380px] overflow-hidden rounded-[30px] p-2">
                            <div className="pricing-track">
                                {plans.map((p, i) => (
                                    <div key={p.id} className="min-w-full flex justify-center px-2 transition-transform duration-500" style={{ transform: planIndex === i ? 'scale(1)' : 'scale(0.9)', opacity: planIndex === i ? 1 : 0.5 }}>
                                        <div className="bg-white border border-gray-100 rounded-[30px] p-8 shadow-xl text-center w-full">
                                            <div className="w-16 h-16 mx-auto bg-blue-50 text-[#33A1FD] rounded-2xl flex items-center justify-center mb-6"><p.icon size={32}/></div>
                                            <h3 className="font-bold text-xl mb-2 text-gray-800">{p.title}</h3>
                                            <div className="text-4xl font-black text-[#26D0CE] mb-6">{p.price}<span className="text-sm text-gray-400 font-medium">/{p.period}</span></div>
                                            <ul className="text-left space-y-3 mb-8">
                                                {p.features.map((f, idx) => (
                                                    <li key={idx} className="flex items-center gap-3 text-sm text-gray-600 font-medium"><Check size={18} className="text-[#1DB2A0] shrink-0"/> {f}</li>
                                                ))}
                                            </ul>
                                            <button onClick={handleCompletePricing} className="w-full py-3.5 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white rounded-xl font-bold uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all">CHỌN GÓI NÀY</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Nút điều hướng mũi tên */}
                            <button onClick={() => setPlanIndex(Math.max(0, planIndex-1))} className={`absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg text-gray-600 hover:text-[#33A1FD] transition-all z-10 ${planIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronLeft size={24}/></button>
                            <button onClick={() => setPlanIndex(Math.min(plans.length-1, planIndex+1))} className={`absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg text-gray-600 hover:text-[#33A1FD] transition-all z-10 ${planIndex === plans.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}><ChevronRight size={24}/></button>
                        </div>
                        <div className="flex gap-2 mt-6">
                            {plans.map((_, idx) => (
                                <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${planIndex === idx ? 'w-6 bg-[#26D0CE]' : 'w-2 bg-gray-300'}`}></div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
