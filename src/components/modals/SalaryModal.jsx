import React from 'react';
import { X, Wallet } from 'lucide-react';
import { formatCurrency } from '../../utils';

export default function SalaryModal({ 
    salarySession, 
    setShowSalaryModal, 
    momoPhone, 
    setMomoPhone 
}) {
    if (!salarySession) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all">
            <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-[380px] animate-scale-up relative flex flex-col items-center text-center shadow-2xl border border-white">
                <button 
                    onClick={() => setShowSalaryModal(false)} 
                    className="absolute top-5 right-5 text-gray-500 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors active:scale-95"
                >
                    <X size={20}/>
                </button>
                <div className="w-16 h-16 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center mb-4 text-[#1DB2A0]">
                    <Wallet size={32} />
                </div>
                <h2 className="text-[22px] font-black text-[#1D1D1F] tracking-tight mb-1">Phát Lương Đợt Bán</h2>
                <p className="text-[13px] text-gray-500 font-medium mb-6">Trích xuất 30% lợi nhuận</p>
                
                {salarySession.realProfit <= 0 ? (
                    <div className="w-full p-4 bg-red-50 rounded-2xl text-red-600 font-bold text-[14px] border border-red-100">
                        Lợi nhuận đợt này đang âm hoặc bằng 0.<br/>Chưa thể phát lương!
                    </div>
                ) : (
                    <>
                        <div className="w-full bg-gray-50 rounded-[20px] p-4 mb-4 border border-gray-100 text-left">
                            <div className="flex justify-between text-[13px] font-semibold text-gray-500 mb-2">
                                <span>Tổng lợi nhuận:</span> 
                                <span className="text-[#1D1D1F]">{formatCurrency(salarySession.realProfit)}đ</span>
                            </div>
                            <div className="flex justify-between text-[15px] font-black text-[#1D1D1F] pt-2 border-t border-gray-200">
                                <span>Lương (30%):</span> 
                                <span className="text-[#1DB2A0]">{formatCurrency(Math.round(salarySession.realProfit * 0.3))}đ</span>
                            </div>
                        </div>
                        
                        <div className="w-full text-left mb-4">
                            <label className="text-[12px] font-bold text-gray-500 mb-1.5 ml-1 block">SĐT MoMo người nhận:</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-[#1DB2A0] focus:bg-white rounded-[16px] text-[16px] font-bold text-[#1D1D1F] tracking-wider text-center outline-none transition-all" 
                                placeholder="Ví dụ: 0912345678" 
                                value={momoPhone} 
                                onChange={e => setMomoPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                                maxLength={11} 
                            />
                        </div>
                        
                        {momoPhone.length >= 10 ? (
                            <div className="p-2 bg-white rounded-[20px] border border-gray-100 shadow-sm mb-2">
                                <img 
                                    src={`https://img.vietqr.io/image/momo-${momoPhone}-compact2.png?amount=${Math.round(salarySession.realProfit * 0.3)}&addInfo=PhatLuong`} 
                                    alt="VietQR MoMo" 
                                    className="w-48 h-48 mx-auto" 
                                />
                            </div>
                        ) : (
                            <div className="w-48 h-48 mx-auto bg-gray-50 rounded-[20px] border border-dashed border-gray-300 flex items-center justify-center text-[12px] text-gray-400 font-medium p-4 text-center mb-2">
                                Nhập đủ SĐT MoMo để tạo mã QR
                            </div>
                        )}
                        <span className="text-[11px] font-medium text-gray-400 italic">Quét bằng MoMo, Zalo, hoặc App Ngân hàng</span>
                    </>
                )}
            </div>
        </div>
    );
}