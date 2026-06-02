import React from 'react';
import { Check, ArrowRight } from 'lucide-react';

export default function PricingPlan({
    step, plans, planIndex, setPlanIndex, handleSelectPlan, forceLogoutAndReset
}) {
    return (
        <div className={`absolute inset-0 bg-gray-50/95 backdrop-blur-sm z-[55] overflow-y-auto md:overflow-hidden custom-scrollbar transition-transform duration-700 ease-in-out ${step === 'pricing' ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col items-center justify-start md:justify-center min-h-full w-full p-4 py-8 md:p-0">
                <div className="text-center mb-6 md:mb-8 mt-2 md:mt-0">
                    <h2 className="text-[26px] md:text-[32px] font-black text-gray-800 mb-1.5 md:mb-2">Bảng Giá Dịch Vụ</h2>
                    <p className="text-gray-500 font-medium text-[13px] md:text-[14px] max-w-md mx-auto">Nâng cấp tài khoản để mở khóa toàn quyền kiểm soát dữ liệu bán hàng.</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-[950px] px-2 md:px-0">
                    {plans.map((p, i) => (
                        <div key={p.id} onClick={() => setPlanIndex(i)} className={`relative flex-1 p-[3px] rounded-[36px] cursor-pointer transition-all duration-300 group ${planIndex === i ? `${p.theme.gradBorder} scale-105 shadow-2xl ${p.theme.shadow} z-10` : 'bg-gray-200 opacity-60 hover:opacity-100 scale-100 hover:scale-105'}`}>
                            <div className="bg-white rounded-[32px] p-5 md:p-8 h-full flex flex-col relative overflow-hidden">
                                {planIndex === i && <div className={`absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 ${p.theme.gradBorder} blur-[40px] opacity-20 rounded-full pointer-events-none`}></div>}
                                
                                <div style={{ backgroundColor: p.theme.bgIcon, color: p.theme.text }} className="w-12 h-12 md:w-14 md:h-14 mx-auto rounded-[16px] md:rounded-[18px] flex items-center justify-center mb-4 md:mb-5 relative z-10 shadow-sm"><p.icon size={24} strokeWidth={2.5}/></div>
                                <h3 className="font-extrabold text-[15px] md:text-[16px] mb-2 text-center tracking-wide" style={{ color: p.theme.text }}>{p.title}</h3>
                                
                                <div className="text-[30px] md:text-[36px] font-black text-center mb-5 md:mb-6 tracking-tight relative z-10" style={{ color: p.theme.text }}>
                                    {p.price}<span className="text-[12px] md:text-[13px] font-bold text-gray-400 ml-1">/ {p.period}</span>
                                </div>
                                
                                <ul className="text-left space-y-3 md:space-y-4 mb-6 md:mb-8 flex-1 relative z-10 px-1">
                                    {p.features.map((f, idx) => (
                                        <li key={idx} className="flex items-start gap-2.5 text-[12px] md:text-[14px] text-gray-600 font-semibold leading-relaxed">
                                            <div className={`mt-0.5 rounded-full p-0.5`} style={{ backgroundColor: p.theme.bgIcon }}><Check size={12} style={{ color: p.theme.text }} strokeWidth={3}/></div>
                                            {f}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-auto relative z-10">
                                    <button className={`w-full py-3 md:py-3.5 rounded-[16px] font-bold text-[12px] md:text-[13px] tracking-widest transition-all ${planIndex === i ? p.theme.btn : 'bg-gray-300 text-gray-500'}`}>
                                        {planIndex === i ? 'ĐANG CHỌN' : 'CHỌN GÓI NÀY'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button onClick={handleSelectPlan} className="mt-8 md:mt-10 bg-[linear-gradient(135deg,#111827,#000000)] text-white px-12 md:px-14 py-3.5 md:py-4 rounded-full font-black text-[13px] md:text-[14px] shadow-xl active:scale-95 transition-all uppercase tracking-widest flex items-center gap-2 hover:shadow-2xl">
                    TIẾP TỤC THANH TOÁN <ArrowRight size={18}/>
                </button>
                
                <button onClick={forceLogoutAndReset} className="mt-4 md:mt-5 text-gray-500 font-bold text-[12px] md:text-[13px] underline hover:text-red-500 transition-colors pb-4 md:pb-0">
                    Trở về Đăng Nhập / Dùng tài khoản khác
                </button>
            </div>
        </div>
    );
}