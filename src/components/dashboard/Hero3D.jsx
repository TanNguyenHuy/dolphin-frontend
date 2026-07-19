import React from 'react';
import Spline from '@splinetool/react-spline';
import { ChevronDown } from 'lucide-react';

export default function Hero3D() {
  return (
    <div className="relative w-full h-[100vh] min-h-[700px] flex flex-col items-center justify-between overflow-hidden pt-10">
      
      {/* CÁC KEYFRAME ANIMATION TỰ TẠO (Mây trôi, bọt biển) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-cloud {
          0% { transform: translateX(-20vw); opacity: 0; }
          20% { opacity: 0.6; }
          80% { opacity: 0.6; }
          100% { transform: translateX(120vw); opacity: 0; }
        }
        @keyframes rise-bubble {
          0% { transform: translateY(10vh) scale(0.5); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-80vh) scale(1.5); opacity: 0; }
        }
        .animate-cloud-1 { animation: float-cloud 28s linear infinite; }
        .animate-cloud-2 { animation: float-cloud 40s linear infinite; animation-delay: -15s; }
        .animate-cloud-3 { animation: float-cloud 35s linear infinite; animation-delay: -5s; }
        .animate-bubble-1 { animation: rise-bubble 6s ease-in infinite; animation-delay: 1s; }
        .animate-bubble-2 { animation: rise-bubble 9s ease-in infinite; animation-delay: 3s; }
        .animate-bubble-3 { animation: rise-bubble 7s ease-in infinite; animation-delay: 5s; }
      `}} />

      {/* ÁNH NẮNG MẶT TRỜI (Góc trên trái) */}
      <div className="absolute top-[-15%] left-[-5%] w-[50vw] h-[50vw] bg-yellow-100/40 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="absolute top-[10%] right-[10%] w-[30vw] h-[30vw] bg-teal-100/30 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* MÂY TRÔI BỒNG BỀNH */}
      <div className="absolute top-[10%] left-0 w-full h-full pointer-events-none z-0">
         <div className="animate-cloud-1 absolute top-[5%] w-[350px] h-[80px] bg-white/40 blur-2xl rounded-full"></div>
         <div className="animate-cloud-2 absolute top-[25%] w-[200px] h-[60px] bg-white/30 blur-xl rounded-full"></div>
         <div className="animate-cloud-3 absolute top-[15%] w-[500px] h-[120px] bg-white/20 blur-3xl rounded-full"></div>
      </div>

      {/* BỌT BIỂN NỔI LÊN TỪ ĐÁY */}
      <div className="absolute bottom-0 left-0 w-full h-full pointer-events-none z-10 overflow-hidden">
         <div className="animate-bubble-1 absolute bottom-0 left-[25%] w-5 h-5 bg-white/30 backdrop-blur-md rounded-full border border-white/60 shadow-sm"></div>
         <div className="animate-bubble-2 absolute bottom-0 left-[60%] w-8 h-8 bg-white/20 backdrop-blur-md rounded-full border border-white/50 shadow-sm"></div>
         <div className="animate-bubble-3 absolute bottom-0 left-[85%] w-3 h-3 bg-white/40 backdrop-blur-md rounded-full border border-white/80 shadow-sm"></div>
      </div>

      {/* KHÔNG GIAN BƠI LỘI CỦA CÁ HEO */}
      <div className="relative z-10 w-full h-[60%] flex items-end justify-center pointer-events-none mt-10">
        <div className="w-full h-full max-w-5xl cursor-default pointer-events-auto">
            {/* NHỚ DÁN LẠI LINK SPLINE CỦA BẠN VÀO ĐÂY */}
            <Spline scene="https://prod.spline.design/VyNZ79T8K-G8wS2W/scene.splinecode" />
        </div>
      </div>

      {/* KHU VỰC CHỮ VÀ NÚT CUỘN */}
      <div className="relative z-20 flex flex-col items-center pb-12 sm:pb-20">
        <h1 className="text-5xl sm:text-7xl font-black text-[#0B3B60] drop-shadow-[0_10px_20px_rgba(11,59,96,0.15)] tracking-tight uppercase mb-8">
          Dolphin 97ers
        </h1>
        <a href="#main-dashboard" className="animate-bounce bg-white/50 backdrop-blur-md p-3 rounded-full border-2 border-white/80 shadow-[0_8px_30px_rgba(0,0,0,0.1)] hover:bg-white hover:scale-110 hover:shadow-xl transition-all cursor-pointer">
          <ChevronDown size={32} className="text-[#0B3B60]" />
        </a>
      </div>

    </div>
  );
}