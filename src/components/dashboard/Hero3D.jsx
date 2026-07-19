import React from 'react';
import Spline from '@splinetool/react-spline';
import { ChevronDown } from 'lucide-react';

export default function Hero3D() {
  return (
    // Xóa màu nền ở đây vì nền biển sẽ nằm ở App.jsx
    <div className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden pt-10">
      
      {/* KHÔNG GIAN BƠI LỘI CỦA CÁ HEO */}
      <div className="relative z-10 w-full h-[60%] flex items-end justify-center pointer-events-none mt-10">
        <div className="w-full h-full max-w-4xl cursor-default pointer-events-auto">
            {/* NHỚ DÁN LINK SPLINE MỚI VÀO ĐÂY */}
            <Spline scene="https://prod.spline.design/yE0Td21FERbxVs-j/scene.splinecode" />
        </div>
      </div>

      {/* KHU VỰC CHỮ VÀ NÚT CUỘN */}
      <div className="relative z-20 flex flex-col items-center pb-12 sm:pb-20">
        <h1 className="text-5xl sm:text-7xl font-black text-[#0B3B60] drop-shadow-xl tracking-tight uppercase mb-8">
          Dolphin 97ers
        </h1>
        <a href="#main-dashboard" className="animate-bounce bg-white/50 backdrop-blur-md p-3 rounded-full border-2 border-white shadow-lg hover:bg-white hover:scale-110 transition-all cursor-pointer">
          <ChevronDown size={32} className="text-[#0B3B60]" />
        </a>
      </div>

    </div>
  );
}