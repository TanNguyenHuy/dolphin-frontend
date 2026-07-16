import React from 'react';
import { X, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils';

export default function SalaryModal({ 
    salarySession, setShowSalaryModal, momoPhone, setMomoPhone 
}) {
    if (!salarySession) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-all animate-fade-in">
            <div className="liquid-glass bg-white/80 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] p-6 md:p-8 w-full max-w-[420px] animate-scale-up relative flex flex-col items-center text-center shadow-[0_24px_60px_rgba(0,0,0,0.2)] border border-white">
                
                {/* Nút X chuẩn 44px */}
                <button 
                    onClick={() => setShowSalaryModal(false)} 
                    className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center text-gray-500 bg-white/50 hover:bg-white hover:text-rose-500 border border-gray-100 rounded-full transition-all active:scale-90 shadow-sm"
                >
                    <X size={20} strokeWidth={2.5}/>
                </button>
                
                <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-emerald-100 border border-teal-200/50 shadow-inner rounded-full flex items-center justify-center mb-5 text-[#1DB2A0]">
                    <Wallet size={32} strokeWidth={2.5} />
                </div>
                
                <h2 className="text-[24px] font-black text-[#1D1D1F] tracking-tight mb-2">Phát Lương Đợt Bán</h2>
                <p className="text-[14px] text-gray-500 font-medium mb-6">Trích xuất <strong className="text-gray-700">30% lợi nhuận</strong> tự động</p>
                
                {salarySession.realProfit <= 0 ? (
                    <div className="w-full p-5 bg-rose-50/80 rounded-[20px] text-rose-600 font-bold text-[14px] border border-rose-200/50 shadow-sm">
                        Lợi nhuận đợt này đang âm hoặc bằng 0.<br/>Chưa thể phát lương!
                    </div>
                ) : (
                    <>
                        <div className="w-full bg-white/60 backdrop-blur-sm rounded-[24px] p-5 mb-6 border border-white shadow-sm text-left">
                            <div className="flex justify-between items-center text-[13px] md:text-[14px] font-bold text-gray-500 mb-3">
                                <span>Tổng lợi nhuận đợt:</span> 
                                <span className="text-[#1D1D1F] tabular-nums">{formatCurrency(salarySession.realProfit)}đ</span>
                            </div>
                            <div className="flex justify-between items-center text-[16px] md:text-[18px] font-black text-[#1D1D1F] pt-3 border-t border-gray-200/60">
                                <span>Lương (30%):</span> 
                                <span className="text-[#1DB2A0] tabular-nums bg-teal-50 px-3 py-1 rounded-lg border border-teal-100/50">{formatCurrency(Math.round(salarySession.realProfit * 0.3))}đ</span>
                            </div>
                        </div>
                        
                        <div className="w-full text-left mb-5">
                            <label className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1 block w-full text-left">
                                SĐT MoMo người nhận
                            </label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-4 bg-white/50 border border-gray-200/60 focus:border-[#1DB2A0] focus:bg-white focus:ring-4 focus:ring-[#1DB2A0]/20 rounded-[16px] text-[18px] font-black text-[#1D1D1F] tracking-widest text-center outline-none transition-all shadow-sm placeholder:text-gray-400 placeholder:font-medium placeholder:tracking-normal" 
                                placeholder="Ví dụ: 0912345678" 
                                value={momoPhone} 
                                onChange={e => setMomoPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                                maxLength={11} 
                            />
                        </div>
                        
                        {momoPhone.length >= 10 ? (
                            <div className="p-3 bg-white/80 rounded-[24px] border border-white shadow-sm mb-4 backdrop-blur-sm transition-all duration-300 animate-scale-up">
                                <img 
                                    src={`https://img.vietqr.io/image/momo-${momoPhone}-compact2.png?amount=${Math.round(salarySession.realProfit * 0.3)}&addInfo=PhatLuong`} 
                                    alt="VietQR MoMo" 
                                    className="w-48 h-48 mx-auto rounded-[16px]" 
                                />
                            </div>
                        ) : (
                            <div className="w-48 h-48 mx-auto bg-white/40 rounded-[24px] border border-dashed border-gray-300 flex items-center justify-center text-[13px] text-gray-400 font-bold p-4 text-center mb-4 shadow-inner transition-all duration-300">
                                Nhập đủ SĐT MoMo<br/>để tạo mã QR
                            </div>
                        )}
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Quét bằng MoMo, Zalo hoặc App Ngân hàng
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}