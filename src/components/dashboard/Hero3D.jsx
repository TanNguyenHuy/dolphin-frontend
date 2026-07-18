import React from 'react';
import Spline from '@splinetool/react-spline';
import { ChevronDown } from 'lucide-react';

export default function Hero3D() {
  return (
    // NỀN TRỜI: Chuyển màu từ xanh dương nhạt sang xanh biển
    <div className="relative w-full h-[100vh] min-h-[700px] bg-gradient-to-b from-[#e0f2fe] to-[#87CEEB] flex flex-col items-center justify-between overflow-hidden">
      
      {/* HIỆU ỨNG SÓNG BIỂN CHUYỂN ĐỘNG Ở ĐÁY (LIQUID WAVES) */}
      <div className="absolute bottom-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        {/* Lớp sóng mờ đằng sau */}
        <div className="absolute w-[200vw] h-[200vw] sm:w-[150vw] sm:h-[150vw] bg-white/20 rounded-[43%] animate-[spin_12s_linear_infinite] -bottom-[180vw] sm:-bottom-[130vw] left-1/2 -translate-x-1/2"></div>
        {/* Lớp sóng đậm đằng trước (Xoay ngược chiều để tạo hiệu ứng xô vào nhau) */}
        <div className="absolute w-[200vw] h-[200vw] sm:w-[150vw] sm:h-[150vw] bg-white/30 rounded-[40%] animate-[spin_15s_linear_infinite_reverse] -bottom-[185vw] sm:-bottom-[135vw] left-1/2 -translate-x-1/2"></div>
      </div>

      {/* KHÔNG GIAN BƠI LỘI CỦA CÁ HEO (Đẩy lên trên cùng) */}
      <div className="relative z-10 w-full h-[60%] flex items-end justify-center pointer-events-none mt-10">
        <div className="w-full h-full max-w-4xl cursor-default pointer-events-auto">
            {/* NHỚ DÁN LẠI LINK CỦA BẠN VÀO ĐÂY */}
            <Spline scene="https://prod.spline.design/yE0Td21FERbxVs-j/scene.splinecode" />
        </div>
      </div>

      {/* KHU VỰC CHỮ VÀ NÚT CUỘN (Nằm gọn dưới mặt nước) */}
      <div className="relative z-20 flex flex-col items-center pb-12 sm:pb-20">
        {/* Tên hiển thị lớn */}
        <h1 className="text-5xl sm:text-7xl font-black text-[#0B3B60] drop-shadow-xl tracking-tight uppercase mb-8">
          Dolphin 97ers
        </h1>
        
        {/* Nút mũi tên gọi cuộn xuống */}
        <a href="#main-dashboard" className="animate-bounce bg-white/50 backdrop-blur-md p-3 rounded-full border-2 border-white shadow-lg hover:bg-white hover:scale-110 transition-all cursor-pointer">
          <ChevronDown size={32} className="text-[#0B3B60]" />
        </a>
      </div>

    </div>
  );
}