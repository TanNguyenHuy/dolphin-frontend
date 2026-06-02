import React from 'react';
import { Check } from 'lucide-react';

export default function SuccessStatus({
    step, expiredEmail, forceLogoutAndReset, handleBackToLogin
}) {
    return (
        <div className={`absolute inset-0 bg-green-50/90 backdrop-blur-md z-[70] overflow-y-auto custom-scrollbar transition-transform duration-700 ease-in-out ${step === 'success' ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex flex-col items-center justify-center min-h-full w-full p-6 sm:p-8 py-12">
                <div className="w-24 h-24 md:w-28 md:h-28 bg-white shadow-2xl shadow-green-200 text-green-500 rounded-full flex items-center justify-center mb-6 md:mb-8 animate-bounce"><Check size={50} strokeWidth={4}/></div>
                <h2 className="text-[28px] md:text-[32px] font-black text-[#1D1D1F] mb-3 md:mb-4 text-center">Đã Gửi Yêu Cầu!</h2>
                
                {expiredEmail ? (
                    <>
                        <p className="text-gray-600 text-[15px] md:text-[16px] mb-10 md:mb-12 text-center max-w-[400px] font-medium leading-relaxed">
                            Hệ thống đã nhận được Bill thanh toán gia hạn của bạn. Vui lòng giữ nguyên màn hình này, hệ thống sẽ tự động đưa bạn vào Workspace ngay khi Admin xác nhận.
                        </p>
                        <button onClick={forceLogoutAndReset} className="text-gray-500 font-bold text-[13px] md:text-[14px] underline hover:text-red-500 transition-colors pb-4 md:pb-0">
                            Đăng Xuất
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-gray-600 text-[15px] md:text-[16px] mb-10 md:mb-12 text-center max-w-[400px] font-medium leading-relaxed">
                            Tài khoản của bạn đã được tạo và Bill thanh toán đã gửi thành công! Vui lòng đợi Admin kiểm tra. Sau khi được duyệt, bạn có thể Đăng nhập để sử dụng.
                        </p>
                        <button onClick={handleBackToLogin} className="text-[#1DB2A0] font-bold text-[13px] md:text-[14px] underline hover:text-[#159a8a] transition-colors pb-4 md:pb-0">
                            Trở về màn hình Đăng Nhập
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}