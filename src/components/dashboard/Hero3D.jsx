import React from 'react';
import Spline from '@splinetool/react-spline';
import { ChevronDown } from 'lucide-react';

export default function Hero3D() {
  return (
    // Khối này được set chiều cao h-screen để chiếm trọn 100% màn hình
    <div className="relative w-full h-screen bg-gradient-to-b from-[#e0f2fe] to-[#f0f9ff] flex items-center justify-center overflow-hidden">
      
      {/* KHÔNG GIAN 3D CỦA SPLINE */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <Spline scene="https://prod.spline.design/yE0Td21FERbxVs-j/scene.splinecode" />
      </div>

      {/* CHỮ HIỂN THỊ ĐÈ LÊN TRÊN */}
      <div className="relative z-10 flex flex-col items-center pointer-events-none text-center">
        <h1 className="text-5xl md:text-7xl font-black text-[#1A5B82] drop-shadow-lg mb-4 tracking-tight">
          Dolphin 97ers
        </h1>
        <p className="text-lg md:text-xl font-bold text-[#33A1FD] bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-sm border border-white/60">
          Hệ sinh thái Quản trị & Bán hàng
        </p>
      </div>

      {/* NÚT CUỘN XUỐNG BÁO HIỆU */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        {/* Thêm thẻ a trỏ link tới id="main-dashboard" */}
        <a href="#main-dashboard" className="block bg-white/50 backdrop-blur-sm p-2 rounded-full border border-white/60 hover:bg-white/80 transition-all cursor-pointer">
          <ChevronDown size={28} className="text-[#33A1FD]" />
        </a>
      </div>
      
    </div>
  );
}