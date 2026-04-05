import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send } from 'lucide-react';
import { API_URL } from '../utils';

export default function ChatBox({ authUser }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef(null);

    // Cuộn xuống tin nhắn mới nhất
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const res = await axios.get(`${API_URL}/chat`);
            setMessages(res.data);
        } catch (err) { console.error(err); }
    };

    // Tự động làm mới chat mỗi 3 giây khi mở hộp thoại
    useEffect(() => {
        let interval;
        if (isOpen) {
            fetchMessages();
            interval = setInterval(fetchMessages, 3000);
        }
        return () => clearInterval(interval);
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim() || isSending) return;
        setIsSending(true);
        try {
            await axios.post(`${API_URL}/chat`, {
                senderName: authUser.name,
                senderEmail: authUser.email,
                text: text.trim()
            });
            setText('');
            await fetchMessages();
        } catch (err) {
            console.error("Lỗi gửi tin nhắn", err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            {/* KHUNG CHAT MỞ RỘNG */}
            <div className={`transition-all duration-300 ease-in-out origin-bottom-right ${isOpen ? 'scale-100 opacity-100 mb-4' : 'scale-0 opacity-0 h-0 w-0 overflow-hidden'}`}>
                <div className="w-[320px] sm:w-[350px] h-[450px] bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-2xl flex flex-col overflow-hidden">
                    
                    {/* Header Chat */}
                    <div className="bg-gradient-to-r from-[#26D0CE] to-[#33A1FD] p-3 flex justify-between items-center text-white shadow-sm">
                        <div className="flex items-center gap-2">
                            <MessageCircle size={18} />
                            <h3 className="font-bold text-[15px] tracking-wide">Team Workspace</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Nội dung Chat */}
                    <div className="flex-1 p-3 overflow-y-auto custom-scrollbar flex flex-col gap-3 bg-[#f0f4f9]/50">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-400 text-[12px] my-auto italic">Chưa có ghi chú nào. Hãy là người đầu tiên!</div>
                        ) : (
                            messages.map((msg, i) => {
                                const isMe = msg.senderEmail === authUser.email;
                                return (
                                    <div key={msg._id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-full`}>
                                        <span className="text-[10px] text-gray-500 mb-0.5 px-1 font-medium">
                                            {isMe ? 'Bạn' : msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                        <div className={`px-3 py-2 rounded-[14px] text-[13px] max-w-[85%] break-words shadow-sm ${isMe ? 'bg-gradient-to-r from-[#33A1FD] to-[#26D0CE] text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                )
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Khung Nhập Liệu */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center">
                        <input 
                            type="text" 
                            placeholder="Nhập ghi chú..." 
                            className="flex-1 bg-[#f4f6f9] border-none outline-none rounded-full px-4 py-2 text-[13px] text-gray-700 placeholder-gray-400 focus:ring-1 focus:ring-[#26D0CE] transition-all"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={!text.trim() || isSending}
                            className="w-9 h-9 rounded-full bg-[#26D0CE] text-white flex items-center justify-center hover:bg-[#1DB2A0] transition-colors disabled:opacity-50 shrink-0"
                        >
                            <Send size={16} className="ml-0.5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* BONG BÓNG CHAT (NÚT BẤM) */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 ${isOpen ? 'bg-[#FF3B30] rotate-90' : 'bg-gradient-to-tr from-[#33A1FD] to-[#26D0CE] rotate-0'}`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={26} />}
            </button>
        </div>
    );
}
