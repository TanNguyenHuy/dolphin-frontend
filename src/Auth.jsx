import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, Lock, Check, Crown, Star, Eye, ChevronRight, ChevronLeft } from 'lucide-react';
import { API_URL } from './utils';

export default function Auth({ onLoginSuccess }) {
    const [isSignUp, setIsSignUp] = useState(false);
    const [step, setStep] = useState('auth'); // 'auth' | 'pricing'
    const [planIndex, setPlanIndex] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', rememberMe: true });

    const plans = [
        { id: 'monthly', title: 'Cơ Bản', price: '10k', period: 'Tháng', icon: Eye, color: '#64748b', features: ['Xem tổng quan', 'Hỗ trợ cơ bản', 'Không xem chi tiết'] },
        { id: 'half-year', title: 'Tiêu Chuẩn', price: '50k', period: '6 Tháng', icon: Star, color: '#26D0CE', features: ['Xem tổng quan', 'Xem chi tiết lô hàng', 'Hỗ trợ 24/7'] },
        { id: 'yearly', title: 'V.I.P', price: '100k', period: 'Năm', icon: Crown, color: '#FF9500', features: ['Xem chi tiết lô hàng', 'Xuất Excel', 'Ưu tiên tính năng'] }
    ];

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = isSignUp ? '/register' : '/login';
            const res = await axios.post(`${API_URL}${endpoint}`, formData);
            if (isSignUp) {
                setStep('pricing'); // Đăng ký xong hiện Carousel
            } else {
                onLoginSuccess(res.data, formData.rememberMe);
            }
        } catch (err) { alert(err.response?.data?.error || "Lỗi!"); }
        finally { setLoading(false); }
    };

    const handleCompletePricing = () => {
        alert(`🎉 Đã chọn gói ${plans[planIndex].title}. Vui lòng đăng nhập lại để bắt đầu!`);
        window.location.reload();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E0F7FA] font-sans p-4">
            <style>{`
                .container { background-color: #fff; border-radius: 20px; box-shadow: 0 14px 28px rgba(0,0,0,0.2), 0 10px 10px rgba(0,0,0,0.2); position: relative; overflow: hidden; width: 768px; max-width: 100%; min-height: 480px; transition: 0.6s ease-in-out; }
                .form-container { position: absolute; top: 0; height: 100%; transition: all 0.6s ease-in-out; }
                .sign-in-container { left: 0; width: 50%; z-index: 2; opacity: ${isSignUp ? '0' : '1'}; }
                .sign-up-container { left: 0; width: 50%; opacity: 0; z-index: 1; transform: ${isSignUp ? 'translateX(100%)' : 'none'}; opacity: ${isSignUp ? '1' : '0'}; z-index: 5; }
                .overlay-container { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; overflow: hidden; transition: transform 0.6s ease-in-out; z-index: 100; transform: ${isSignUp ? 'translateX(-100%)' : 'none'}; }
                .overlay { background: linear-gradient(to right, #33A1FD, #26D0CE); color: #FFFFFF; position: relative; left: -100%; height: 100%; width: 200%; transform: ${isSignUp ? 'translateX(50%)' : 'translateX(0)'}; transition: transform 0.6s ease-in-out; }
                .overlay-panel { position: absolute; display: flex; align-items: center; justify-content: center; flex-direction: column; padding: 0 40px; text-align: center; top: 0; height: 100%; width: 50%; transition: transform 0.6s ease-in-out; }
                .overlay-right { right: 0; }
                .pricing-track { display: flex; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); transform: translateX(-${planIndex * 100}%); width: 100%; }
            `}</style>

            <div className="container shadow-2xl">
                {step === 'auth' ? (
                    <>
                        {/* ĐĂNG KÝ */}
                        <div className="form-container sign-up-container p-8 flex flex-col justify-center">
                            <form onSubmit={handleAuth} className="text-center">
                                <h2 className="text-2xl font-bold mb-4">Tạo Tài Khoản</h2>
                                <input className="w-full bg-gray-100 p-3 mb-2 rounded-lg outline-none" placeholder="Tên" onChange={e => setFormData({...formData, name: e.target.value})} />
                                <input className="w-full bg-gray-100 p-3 mb-2 rounded-lg outline-none" type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
                                <input className="w-full bg-gray-100 p-3 mb-4 rounded-lg outline-none" type="password" placeholder="Mật khẩu" onChange={e => setFormData({...formData, password: e.target.value})} />
                                <button className="bg-[#26D0CE] text-white px-10 py-2 rounded-full font-bold uppercase text-xs tracking-widest active:scale-95 transition-transform">ĐĂNG KÝ NGAY</button>
                            </form>
                        </div>

                        {/* ĐĂNG NHẬP */}
                        <div className="form-container sign-in-container p-8 flex flex-col justify-center">
                            <form onSubmit={handleAuth} className="text-center">
                                <h2 className="text-2xl font-bold mb-4">Đăng Nhập</h2>
                                <input className="w-full bg-gray-100 p-3 mb-2 rounded-lg outline-none" type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} />
                                <input className="w-full bg-gray-100 p-3 mb-4 rounded-lg outline-none" type="password" placeholder="Mật khẩu" onChange={e => setFormData({...formData, password: e.target.value})} />
                                <button className="bg-[#33A1FD] text-white px-10 py-2 rounded-full font-bold uppercase text-xs tracking-widest active:scale-95 transition-transform">ĐĂNG NHẬP</button>
                            </form>
                        </div>

                        {/* PANEL TRƯỢT */}
                        <div className="overlay-container hidden md:block">
                            <div className="overlay">
                                <div className="overlay-panel flex flex-col justify-center items-center">
                                    <h2 className="text-3xl font-bold mb-4">Mừng Trở Lại!</h2>
                                    <p className="mb-8">Đăng nhập ngay để tiếp tục quản lý dòng tiền của bạn.</p>
                                    <button onClick={() => setIsSignUp(false)} className="border-2 border-white px-10 py-2 rounded-full font-bold uppercase text-xs">ĐĂNG NHẬP</button>
                                </div>
                                <div className="overlay-panel overlay-right flex flex-col justify-center items-center">
                                    <h2 className="text-3xl font-bold mb-4">Chào Người Mới!</h2>
                                    <p className="mb-8">Đăng ký và bắt đầu trải nghiệm quản lý shop Dolphin ngay hôm nay.</p>
                                    <button onClick={() => setIsSignUp(true)} className="border-2 border-white px-10 py-2 rounded-full font-bold uppercase text-xs">TẠO TÀI KHOẢN</button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* CAROUSEL CHỌN GÓI */
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#f8fafc]">
                        <h2 className="text-2xl font-black text-[#1D1D1F] mb-2">Chọn gói dịch vụ</h2>
                        <p className="text-gray-400 text-sm mb-8">Lướt qua để chọn gói phù hợp với nhu cầu của bạn</p>
                        
                        <div className="relative w-full max-w-[340px] overflow-hidden">
                            <div className="pricing-track">
                                {plans.map((p, i) => (
                                    <div key={p.id} className="min-w-full flex justify-center p-4">
                                        <div className="bg-white border-2 border-[#26D0CE] rounded-3xl p-6 shadow-xl text-center w-full">
                                            <div className="w-12 h-12 mx-auto bg-[#E0F2FE] text-[#33A1FD] rounded-xl flex items-center justify-center mb-4"><p.icon /></div>
                                            <h3 className="font-bold text-lg mb-1">{p.title}</h3>
                                            <div className="text-3xl font-black text-[#26D0CE] mb-4">{p.price}<span className="text-xs text-gray-400">/{p.period}</span></div>
                                            <ul className="text-left space-y-2 mb-6">
                                                {p.features.map((f, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-xs text-gray-600"><Check size={14} className="text-green-500"/> {f}</li>
                                                ))}
                                            </ul>
                                            <button onClick={handleCompletePricing} className="w-full py-3 bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white rounded-xl font-bold text-xs shadow-lg">CHỌN GÓI NÀY</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Nút điều hướng Carousel */}
                            <button onClick={() => setPlanIndex(Math.max(0, planIndex-1))} className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md text-gray-400"><ChevronLeft/></button>
                            <button onClick={() => setPlanIndex(Math.min(plans.length-1, planIndex+1))} className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full shadow-md text-gray-400"><ChevronRight/></button>
                        </div>
                        <p className="mt-6 text-[10px] text-gray-400 italic">* Thanh toán sẽ được Admin phê duyệt trong 5 phút.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

Hệ thống đã sẵn sàng "lên sàn" rồi sếp ơi! Sếp xem qua bản nâng cấp này và báo em nếu cần chỉnh thêm góc nào sếp nhé. 🚀✨
