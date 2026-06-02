import React from 'react';
import { Check, UploadCloud } from 'lucide-react';

export default function PaymentQR({
    step, setStep, plans, planIndex, billBase64, handleFileChange, handleConfirmPayment, loading
}) {
    return (
        <div className={`absolute inset-0 bg-white z-[60] overflow-y-auto custom-scrollbar transition-transform duration-700 ease-in-out ${step === 'qr' ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col items-center justify-center min-h-full w-full p-6 sm:p-10 py-12">
                <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-14 w-full max-w-[1000px]">
                    <div className="text-center lg:text-left flex-1 w-full mt-4 lg:mt-0">
                        <h2 className="text-[28px] md:text-[36px] font-black text-gray-800 mb-2 leading-tight">Hoàn tất<br className="hidden lg:block"/>Thanh toán</h2>
                        <p className="text-gray-500 mb-8 font-medium text-[15px] leading-relaxed">Bạn đang chọn <strong style={{ color: plans[planIndex].theme.text }}>{plans[planIndex].title} ({plans[planIndex].price})</strong>. Vui lòng quét mã và tải ảnh xác nhận lệnh chuyển tiền lên hệ thống.</p>
                        
                        <label className="flex flex-col items-center justify-center w-full h-32 md:h-36 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all mb-6">
                            <div className="flex flex-col items-center justify-center pt-4 pb-5">
                                {billBase64 ? <Check className="text-green-500 mb-2" size={32}/> : <UploadCloud className="text-gray-400 mb-2" size={32}/>}
                                <p className="text-[12px] md:text-[13px] text-gray-600 font-bold tracking-wide">{billBase64 ? "ĐÃ CHỌN ẢNH THÀNH CÔNG" : "BẤM VÀO ĐỂ TẢI ẢNH BILL"}</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>

                        <button onClick={handleConfirmPayment} disabled={loading || !billBase64} className={`w-full text-white py-3.5 rounded-full font-black text-[13px] uppercase tracking-widest shadow-xl disabled:bg-gray-300 disabled:shadow-none active:scale-95 transition-all ${plans[planIndex].theme.btn}`}>
                            {loading ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN ĐÃ CHUYỂN'}
                        </button>
                        <div className="text-center mt-5 md:mt-6 pb-4 md:pb-0">
                            <button type="button" onClick={() => setStep('pricing')} className="text-gray-400 hover:text-gray-600 font-bold text-[13px] underline transition-colors">Quay lại chọn gói</button>
                        </div>
                    </div>

                    <div className={`p-[4px] md:p-[5px] rounded-[36px] md:rounded-[44px] ${plans[planIndex].theme.gradBorder} shadow-2xl w-[280px] sm:w-[360px] shrink-0`}>
                        <div className="bg-white rounded-[32px] md:rounded-[40px] p-3 md:p-4 h-[360px] sm:h-[460px] flex items-center justify-center overflow-hidden relative">
                            <img src={plans[planIndex].qrImage} className="w-full h-full object-contain rounded-[20px]" alt="QR" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
                            <div className="hidden text-gray-400 text-sm italic text-center px-4 absolute">Ảnh mã QR chưa có trong thư mục public</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}