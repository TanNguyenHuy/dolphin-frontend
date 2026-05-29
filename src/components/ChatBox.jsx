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
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {isOpen ? (
                <div className="w-[320px] h-[450px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 animate-scale-up">
                    <div className="bg-gradient-to-r from-[#1DB2A0] to-[#26D0CE] p-4 flex justify-between items-center text-white shadow-sm">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={20} />
                            <h3 className="font-bold text-[15px]">Cộng Đồng Người Bán</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors active:scale-95"><X size={18} /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
                        {messages.length === 0 ? (
                            <p className="text-center text-gray-400 text-[12px] italic mt-4">Chưa có tin nhắn nào. Bắt đầu trò chuyện!</p>
                        ) : (
                            messages.map((m, i) => (
                                <div key={i} className={`flex flex-col ${m.senderEmail === authUser.email ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-gray-400 mb-1 ml-1 font-medium">{m.senderName}</span>
                                    <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] break-words shadow-sm text-[13px] ${m.senderEmail === authUser.email ? 'bg-[#26D0CE] text-white rounded-br-none' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* HIỂN THỊ KHUNG NHẬP CHAT THEO QUYỀN */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        {plan === '50k' && !isAdmin ? (
                            <div className="text-center text-[12px] text-orange-500 font-medium bg-orange-50 p-2 rounded-xl border border-orange-100">
                                ⚠️ Gói VIP chỉ có thể xem Chat. Nâng cấp VVIP để gửi tin nhắn.
                            </div>
                        ) : isBanned && !isAdmin ? (
                            <div className="flex items-center justify-center gap-1 text-[12px] text-red-500 font-bold bg-red-50 p-2 rounded-xl border border-red-100">
                                <AlertCircle size={14}/> Bạn đang bị cấm Chat!
                            </div>
                        ) : (
                            <form onSubmit={sendMessage} className="flex items-center gap-2">
                                <input type="text" className="flex-1 bg-gray-100 border border-transparent focus:border-[#26D0CE] focus:bg-white rounded-full px-4 py-2.5 text-[13px] outline-none transition-all" placeholder="Nhập tin nhắn..." value={text} onChange={(e) => setText(e.target.value)} />
                                <button type="submit" disabled={!text.trim()} className="w-10 h-10 bg-[#1DB2A0] text-white rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-[#159a8a] transition-colors active:scale-95 shadow-md">
                                    <Send size={16} className="-ml-0.5" />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} className="w-14 h-14 bg-gradient-to-r from-[#1DB2A0] to-[#26D0CE] text-white rounded-full shadow-2xl flex items-center justify-center hover:opacity-90 transition-all active:scale-95">
                    <MessageCircle size={28} />
                </button>
            )}
        </div>
    );
}
