import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, Send, X, AlertCircle } from 'lucide-react';
import { API_URL } from '../utils';

export default function ChatBox({ authUser }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const messagesEndRef = useRef(null);

    // PHÂN QUYỀN CHAT THEO YÊU CẦU CỦA SẾP
    const isAdmin = authUser?.role === 'admin';
    const plan = authUser?.plan || '10k';
    
    // Gói Cơ Bản (10k) không được nhìn thấy chat
    const canViewChat = isAdmin || plan === '50k' || plan === '100k' || plan === 'premium';
    
    // Kiểm tra xem có đang bị cấm chat không
    const isBanned = authUser?.isChatBanned || (authUser?.chatRestrictedUntil && new Date(authUser.chatRestrictedUntil) > new Date());
    
    // Chỉ VVIP và Premium mới được chat (và không bị cấm)
    const canChat = isAdmin || ((plan === '100k' || plan === 'premium') && !isBanned);

    useEffect(() => {
        if (isOpen && canViewChat) {
            fetchMessages();
            const interval = setInterval(fetchMessages, 3000);
            return () => clearInterval(interval);
        }
    }, [isOpen, canViewChat]);

    useEffect(() => {
        if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    if (!canViewChat) return null; // Khách Cơ Bản thì giấu luôn cái cục Chat đi

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${API_URL}/chat`);
            setMessages(res.data);
        } catch (e) {}
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim() || !canChat) return;
        const msg = text;
        setText('');
        try {
            await axios.post(`${API_URL}/chat`, { senderName: authUser.name, senderEmail: authUser.email, text: msg });
            fetchMessages();
        } catch (e) {}
    };

    return (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] font-sans">
            {isOpen ? (
                <div className="w-[340px] md:w-[380px] h-[500px] md:h-[600px] liquid-glass bg-white/50 backdrop-blur-2xl rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-white/80 animate-scale-up origin-bottom-right">
                    
                    {/* HEADER: Kính mờ sang trọng */}
                    <div className="bg-white/40 backdrop-blur-md p-5 flex justify-between items-center border-b border-white/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1DB2A0] to-[#26D0CE] flex items-center justify-center text-white shadow-sm">
                                <MessageCircle size={18} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-black text-[16px] text-[#1D1D1F] tracking-tight leading-tight">Cộng Đồng Bán Hàng</h3>
                                <p className="text-[11px] font-bold text-[#1DB2A0]">Online</p>
                            </div>
                        </div>
                        {/* Nút tắt chuẩn Touch Target 44px */}
                        <button onClick={() => setIsOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white/50 hover:bg-white text-gray-500 hover:text-rose-500 rounded-full transition-all shadow-sm active:scale-90 border border-white/60">
                            <X size={18} strokeWidth={2.5}/>
                        </button>
                    </div>
                    
                    {/* BODY: Danh sách tin nhắn */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-gradient-to-b from-transparent to-white/20">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-60">
                                <MessageCircle size={48} strokeWidth={1} className="mb-3"/>
                                <p className="text-[13px] font-medium italic">Chưa có tin nhắn nào.<br/>Hãy là người đầu tiên!</p>
                            </div>
                        ) : (
                            messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.senderEmail === authUser.email ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-gray-500 mb-1 ml-1 mr-1 font-bold tracking-wide">{m.senderName}</span>
                                    <div className={`px-4 py-3 rounded-[20px] max-w-[85%] break-words text-[14px] font-medium shadow-sm transition-all hover:shadow-md ${m.senderEmail === authUser.email ? 'bg-gradient-to-br from-[#33A1FD] to-[#26D0CE] text-white rounded-br-sm' : 'bg-white/90 backdrop-blur-sm border border-white text-[#1D1D1F] rounded-bl-sm'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} className="h-1" />
                    </div>

                    {/* FOOTER: Khung nhập liệu Liquid Input */}
                    <div className="p-4 md:p-5 bg-white/60 backdrop-blur-md border-t border-white/60">
                        {plan === '50k' && !isAdmin ? (
                            <div className="text-center text-[12px] text-orange-600 font-bold bg-orange-50/80 p-3 rounded-[16px] border border-orange-200/60 shadow-sm backdrop-blur-sm">
                                ⚠️ Gói VIP chỉ có quyền xem Chat.<br/>Nâng cấp lên VVIP để gửi tin nhắn!
                            </div>
                        ) : isBanned && !isAdmin ? (
                            <div className="flex items-center justify-center gap-1.5 text-[13px] text-rose-600 font-bold bg-rose-50/80 p-3 rounded-[16px] border border-rose-200/60 shadow-sm backdrop-blur-sm">
                                <AlertCircle size={16}/> Bạn đang bị cấm Chat!
                            </div>
                        ) : (
                            <form onSubmit={sendMessage} className="flex items-center gap-3">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-white/70 border border-white rounded-[20px] px-4 py-3.5 text-[14px] font-medium text-[#1D1D1F] outline-none transition-all focus:bg-white focus:border-[#26D0CE] focus:ring-4 focus:ring-[#26D0CE]/20 shadow-sm placeholder:text-gray-400" 
                                    placeholder="Nhập tin nhắn..." 
                                    value={text} 
                                    onChange={(e) => setText(e.target.value)} 
                                />
                                <button 
                                    type="submit" 
                                    disabled={!text.trim()} 
                                    className="w-12 h-12 shrink-0 bg-gradient-to-br from-[#1DB2A0] to-[#159a8a] text-white rounded-[18px] flex items-center justify-center disabled:opacity-50 transition-all active:scale-90 shadow-[0_4px_12px_rgba(29,178,160,0.3)] disabled:shadow-none hover:shadow-[0_8px_16px_rgba(29,178,160,0.4)]"
                                >
                                    <Send size={18} strokeWidth={2.5} className="-ml-0.5" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            ) : (
                /* NÚT MỞ CHAT LƠ LỬNG */
                <button 
                    onClick={() => setIsOpen(true)} 
                    className="group relative w-14 h-14 md:w-16 md:h-16 flex items-center justify-center outline-none transition-transform active:scale-90"
                >
                    {/* Hào quang phát sáng (Ping) */}
                    <div className="absolute inset-0 bg-[#26D0CE] rounded-full animate-ping opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    
                    {/* Nút bấm chính */}
                    <div className="relative w-full h-full bg-gradient-to-br from-[#33A1FD] to-[#26D0CE] text-white rounded-full shadow-[0_8px_24px_rgba(38,208,206,0.4)] flex items-center justify-center group-hover:shadow-[0_12px_32px_rgba(38,208,206,0.5)] transition-all">
                        <MessageCircle size={28} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-300" />
                    </div>
                </button>
            )}
        </div>
    );
}