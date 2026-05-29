import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Crown, ArrowLeft, Clock, ShieldAlert, Mail, Eye, X, TimerReset, Check, CheckCircle2, AlertCircle, HelpCircle, MessageSquareOff, Star } from 'lucide-react';
import { API_URL } from '../utils';

export default function AdminPanel({ setView, authUser }) {
    const [users, setUsers] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);

    const [editExpiryId, setEditExpiryId] = useState(null);
    const [expiryVal, setExpiryVal] = useState(1);
    const [expiryUnit, setExpiryUnit] = useState('minutes'); 

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, isDanger: false });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const confirmAction = (title, message, onConfirm, isDanger = false) => {
        setConfirmModal({ show: true, title, message, onConfirm, isDanger });
    };

    useEffect(() => { 
        fetchUsers(); 
        const adminRadar = setInterval(fetchUsers, 5000); 
        return () => clearInterval(adminRadar);
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users`);
            setUsers(res.data);
        } catch (error) { console.error(error); }
    };

    const handleApprove = async (id) => {
        try {
            await axios.put(`${API_URL}/users/${id}/approve`);
            fetchUsers();
            showToast("Đã duyệt thành công!", "success");
        } catch (e) { showToast("Lỗi duyệt tài khoản!", "error"); }
    };

    const togglePermission = async (id, currentPermissions, field) => {
        const updated = { ...currentPermissions, [field]: !currentPermissions[field] };
        await axios.put(`${API_URL}/users/${id}`, { permissions: updated });
        fetchUsers();
        showToast("Đã cập nhật quyền!", "success");
    };

    const handleChangePlan = (id, newPlan, currentPermissions) => {
        const planName = newPlan === 'premium' ? '💎 PREMIUM' : newPlan === '100k' ? '🥇 VVIP' : newPlan === '50k' ? '🥈 VIP' : '🥉 CƠ BẢN';
        
        confirmAction("Xác Nhận Đổi Gói", `Sếp có chắc chắn đổi khách hàng này sang gói ${planName}? Hạn sử dụng sẽ được tính lại từ hôm nay!`, async () => {
            let canViewDetail = currentPermissions?.canViewDetail || false;
            if (newPlan === '50k' || newPlan === '100k' || newPlan === 'premium') canViewDetail = true;
            else canViewDetail = false;

            const updatedPermissions = { ...currentPermissions, canViewDetail };
            const updatePayload = { plan: newPlan, permissions: updatedPermissions };

            if (newPlan === 'premium') {
                updatePayload.planExpiry = null;
                updatePayload.isApproved = true;
            }

            try {
                await axios.put(`${API_URL}/users/${id}/change-plan`, updatePayload);
                fetchUsers();
                setConfirmModal({ show: false });
                showToast(`Đã nâng cấp lên ${planName}!`, "success");
            } catch (e) { showToast("Lỗi khi cập nhật gói!", "error"); setConfirmModal({ show: false }); }
        });
    };

    const submitCustomExpiry = (id) => {
        if (!expiryVal || expiryVal <= 0) return showToast("Vui lòng nhập số lượng hợp lệ!", "error");
        
        let seconds = 0;
        const val = parseInt(expiryVal);
        if (expiryUnit === 'seconds') seconds = val;
        if (expiryUnit === 'minutes') seconds = val * 60;
        if (expiryUnit === 'hours') seconds = val * 3600;
        if (expiryUnit === 'days') seconds = val * 86400;

        const unitName = expiryUnit === 'seconds' ? 'Giây' : expiryUnit === 'minutes' ? 'Phút' : expiryUnit === 'hours' ? 'Giờ' : 'Ngày';
        
        confirmAction("Xác Nhận Ép Hạn", `Sếp chắc chắn ép hạn sử dụng còn đúng ${val} ${unitName}?`, async () => {
            try {
                const exactExpiryDate = new Date(Date.now() + seconds * 1000).toISOString();
                await axios.put(`${API_URL}/users/${id}/force-expiry`, { expiryDate: exactExpiryDate });
                fetchUsers();
                setEditExpiryId(null); 
                setConfirmModal({ show: false });
                showToast("Đã cập nhật hạn sử dụng thành công!", "success");
            } catch (e) { showToast("Lỗi ép ngày!", "error"); setConfirmModal({ show: false }); }
        });
    };

    const handleDeleteUser = (id) => {
        confirmAction("Xóa Tài Khoản", "Xóa vĩnh viễn tài khoản này? Hành động không thể hoàn tác!", async () => {
            try {
                await axios.delete(`${API_URL}/users/${id}`);
                fetchUsers();
                setConfirmModal({ show: false });
                showToast("Đã xóa tài khoản thành công!", "success");
            } catch (e) { showToast("Lỗi xóa tài khoản!", "error"); setConfirmModal({ show: false }); }
        }, true);
    };

    const handleRestrict = async (id, days) => {
        let restrictedUntil = null;
        let isBanned = false;
        
        if (days === 'forever') {
            isBanned = true;
        } else if (days !== '0' && days !== 'restricted') {
            restrictedUntil = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
        }

        try {
            await axios.put(`${API_URL}/users/${id}`, { restrictedUntil, isBanned });
            fetchUsers();
            showToast(days === '0' ? "Đã gỡ bỏ hạn chế!" : "Đã cập nhật trạng thái hạn chế!", "success");
        } catch (error) { showToast("Lỗi cập nhật trạng thái!", "error"); }
    };

    const handleRestrictChat = async (id, days) => {
        try {
            await axios.put(`${API_URL}/users/${id}/restrict-chat`, { days });
            fetchUsers();
            showToast(days === '0' ? "Đã gỡ lệnh cấm chat!" : "Đã cấm chat thành công!", "success");
        } catch (error) { showToast("Lỗi cập nhật cấm chat!", "error"); }
    };

    const getRestrictStatus = (u) => {
        if (u.isBanned) return 'forever';
        if (u.restrictedUntil && new Date(u.restrictedUntil) > new Date()) return 'restricted';
        return '0';
    };

    const getChatRestrictStatus = (u) => {
        if (u.isChatBanned) return 'forever';
        if (u.chatRestrictedUntil && new Date(u.chatRestrictedUntil) > new Date()) return 'restricted';
        return '0';
    };

    const getRemainingTime = (expiryDate) => {
        if (!expiryDate) return null;
        const now = new Date(); const exp = new Date(expiryDate);
        if (now > exp) return "Đã hết hạn";
        
        const diff = Math.abs(exp - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        if (days > 0) return `Còn ${days} ngày ${hours} giờ`;
        if (hours > 0) return `Còn ${hours} giờ ${mins} phút`;
        if (mins > 0) return `Còn ${mins} phút ${secs} giây`;
        return `Còn ${secs} giây`;
    };

    const [, setTick] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="animate-fade-in-up pb-20">
            <div className={`fixed top-5 right-5 z-[9999] transition-all duration-500 ease-in-out ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'}`}>
                <div className={`flex items-center gap-3 px-6 py-4 rounded-[20px] shadow-2xl border ${toast.type === 'success' ? 'bg-white border-green-200 text-green-700' : 'bg-white border-red-200 text-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle2 size={24}/> : <AlertCircle size={24}/>}
                    <p className="font-bold text-[14px] tracking-wide">{toast.message}</p>
                </div>
            </div>

            {confirmModal.show && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all animate-fade-in">
                    <div className="bg-white rounded-[32px] p-6 md:p-8 w-full max-w-[400px] animate-scale-up text-center shadow-2xl border border-white">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${confirmModal.isDanger ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-indigo-50 text-indigo-500 border border-indigo-100'}`}>
                            {confirmModal.isDanger ? <AlertCircle size={32}/> : <HelpCircle size={32}/>}
                        </div>
                        <h2 className="text-[22px] font-black text-gray-800 mb-2">{confirmModal.title}</h2>
                        <p className="text-[14px] text-gray-500 font-medium mb-8 leading-relaxed">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal({ show: false })} className="flex-1 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">Hủy Bỏ</button>
                            <button onClick={confirmModal.onConfirm} className={`flex-1 py-3.5 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-all ${confirmModal.isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:opacity-90'}`}>
                                Xác Nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedBill && (
                <div className="fixed inset-0 z-[999] bg-black/90 flex flex-col items-center justify-center p-4 animate-fade-in">
                    <button onClick={() => setSelectedBill(null)} className="absolute top-10 right-10 text-white bg-white/10 hover:bg-white/20 p-4 rounded-full transition-all"><X size={30}/></button>
                    <img src={selectedBill} className="max-w-full max-h-[85vh] object-contain border-4 border-white rounded-[24px] shadow-2xl" alt="Bill" />
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <button onClick={() => setView('DASHBOARD')} className="flex items-center gap-2 text-gray-500 font-bold bg-white px-6 py-3 rounded-full shadow-sm border hover:text-[#26D0CE] transition-all"><ArrowLeft size={18} /> Dashboard</button>
                <h2 className="text-[28px] font-black text-gray-800">Cài Đặt Hệ Thống</h2>
            </div>

            <div className="space-y-4">
                {users.map(u => {
                    const restrictStatus = getRestrictStatus(u);
                    const chatRestrictStatus = getChatRestrictStatus(u);
                    const isRestricted = restrictStatus !== '0';
                    const isChatRestricted = chatRestrictStatus !== '0';

                    const isAbandoned = !u.isApproved && !u.paymentImage && u.role !== 'admin';

                    return (
                        <div key={u._id} className={`liquid-glass rounded-[30px] p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-[3px] transition-all shadow-sm ${isAbandoned ? 'border-gray-200 bg-gray-50/50 opacity-80' : (!u.isApproved && u.role !== 'admin' && u.plan !== 'premium' ? 'border-orange-300 bg-orange-50/50' : 'border-transparent hover:border-gray-200')}`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-extrabold text-[18px] text-gray-800">{u.name}</h3>
                                    
                                    {/* ĐÃ KHÔI PHỤC: Kích thước đồng nhất w-[95px] h-[26px], Màu Gradient Gốc như hình Sếp gửi */}
                                    {isAbandoned ? (
                                        <span className="w-[95px] h-[26px] flex items-center justify-center rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-300 bg-gray-200 text-gray-500 shadow-sm">CHƯA CHỌN</span>
                                    ) : u.plan === 'premium' || u.role === 'admin' ? (
                                        <span className="w-[95px] h-[26px] flex items-center justify-center gap-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-300 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md"><Crown size={12}/> PREMIUM</span>
                                    ) : (
                                        <span className={`w-[95px] h-[26px] flex items-center justify-center gap-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-md text-white ${
                                            u.plan === '100k' ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 border-yellow-500' : 
                                            u.plan === '50k' ? 'bg-gradient-to-r from-slate-400 to-slate-500 border-slate-400' : 
                                            'bg-gradient-to-r from-[#D7CCC8] to-[#A1887F] border-[#8D6E63]' 
                                        }`}>
                                            {u.plan === '100k' ? 'VVIP' : u.plan === '50k' ? 'VIP' : 'CƠ BẢN'}
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-gray-400 text-[13px] mb-3 flex items-center gap-1.5"><Mail size={12}/> {u.email}</p>
                                
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {u.role !== 'admin' ? (
                                        isAbandoned ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black shadow-sm bg-gray-100 text-gray-500 border border-gray-200">
                                                <Clock size={14}/> Khách chưa hoàn tất đăng ký...
                                            </div>
                                        ) : u.plan === 'premium' ? (
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black shadow-sm border border-purple-200 bg-purple-50 text-purple-700">
                                                <Clock size={14}/> Hạn sử dụng: Vô thời hạn
                                            </div>
                                        ) : u.isApproved ? (
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black shadow-sm border ${(!u.planExpiry || new Date() > new Date(u.planExpiry)) ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                                <Clock size={14}/> Hạn sử dụng: {getRemainingTime(u.planExpiry)}
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black shadow-sm bg-orange-100 text-orange-600 border border-orange-200">
                                                <Clock size={14}/> Đang chờ duyệt Bill...
                                            </div>
                                        )
                                    ) : null}
                                    
                                    {isRestricted && u.restrictedUntil && (
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black shadow-sm bg-red-50 text-red-600 border border-red-200">
                                            <ShieldAlert size={14}/> Hạn chế web đến: {new Date(u.restrictedUntil).toLocaleString('vi-VN')}
                                        </div>
                                    )}

                                    {isChatRestricted && (
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black shadow-sm bg-orange-50 text-orange-600 border border-orange-200">
                                            <MessageSquareOff size={14}/> Cấm Chat: {chatRestrictStatus === 'forever' ? 'Vĩnh viễn' : (u.chatRestrictedUntil ? new Date(u.chatRestrictedUntil).toLocaleString('vi-VN') : '')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {u.role !== 'admin' && (
                                <div className="flex flex-wrap items-center gap-3 xl:gap-4 mt-4 xl:mt-0">
                                    {isAbandoned ? (
                                        <button onClick={() => handleDeleteUser(u._id)} className="w-[42px] h-[42px] flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-95"><Trash2 size={18}/></button>
                                    ) : (
                                        <>
                                            {u.paymentImage ? (
                                                <button onClick={() => setSelectedBill(u.paymentImage)} className="flex items-center gap-2 bg-white border-2 border-blue-500 text-blue-600 px-5 py-2.5 rounded-2xl font-black text-[12px] hover:bg-blue-50 transition-all shadow-md active:scale-95 animate-pulse"><Eye size={16}/> XEM BILL</button>
                                            ) : (
                                                <span className="text-gray-400 text-[11px] italic bg-gray-100 px-4 py-2 rounded-xl">Chưa có Bill</span>
                                            )}

                                            <button onClick={() => handleApprove(u._id)} className={`px-6 xl:px-8 py-2.5 xl:py-3 rounded-2xl font-black text-[13px] shadow-lg transition-all active:scale-95 ${u.isApproved ? 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none' : 'bg-gradient-to-r from-[#1DB2A0] to-[#159a8a] text-white hover:opacity-90'}`}>
                                                {u.isApproved ? 'ĐÃ DUYỆT' : 'DUYỆT VÀO'}
                                            </button>

                                            <div className="flex flex-wrap gap-4 bg-white/90 p-3 rounded-2xl border border-gray-200 shadow-inner">
                                                {u.plan === 'premium' && (
                                                    <>
                                                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 cursor-pointer"><input type="checkbox" checked={u.permissions?.canPay} onChange={() => togglePermission(u._id, u.permissions, 'canPay')} className="accent-teal-500 w-4 h-4"/> P.Lương</label>
                                                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 cursor-pointer"><input type="checkbox" checked={u.permissions?.canEdit} onChange={() => togglePermission(u._id, u.permissions, 'canEdit')} className="accent-blue-500 w-4 h-4"/> Sửa</label>
                                                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 cursor-pointer"><input type="checkbox" checked={u.permissions?.canDelete} onChange={() => togglePermission(u._id, u.permissions, 'canDelete')} className="accent-red-500 w-4 h-4"/> Xóa</label>
                                                        <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                                                    </>
                                                )}
                                                <label className="flex items-center gap-1.5 text-[12px] font-bold text-orange-600 cursor-pointer"><input type="checkbox" checked={u.permissions?.canViewDetail} onChange={() => togglePermission(u._id, u.permissions, 'canViewDetail')} className="accent-orange-500 w-4 h-4"/> Xem Chi Tiết</label>
                                            </div>
                                            
                                            <div className="relative group">
                                                <select 
                                                    className="appearance-none text-[12px] font-black pl-9 pr-4 py-2.5 rounded-2xl outline-none cursor-pointer border-2 border-indigo-100 bg-indigo-50 text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-100"
                                                    value={u.plan || '10k'}
                                                    onChange={(e) => handleChangePlan(u._id, e.target.value, u.permissions)}
                                                >
                                                    <option value="10k">🥉 CƠ BẢN (10k)</option>
                                                    <option value="50k">🥈 VIP (50k)</option>
                                                    <option value="100k">🥇 VVIP (100k)</option>
                                                    <option value="premium">💎 PREMIUM</option>
                                                </select>
                                                <Crown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                                            </div>

                                            {u.plan !== 'premium' && (
                                                editExpiryId === u._id ? (
                                                    <div className="flex items-center gap-1 bg-pink-50 p-1 rounded-2xl border border-pink-200 shadow-inner animate-fade-in">
                                                        <input 
                                                            type="number" min="1" 
                                                            value={expiryVal} 
                                                            onChange={e => setExpiryVal(e.target.value)} 
                                                            className="w-14 px-2 py-1.5 text-[12px] font-black text-center rounded-xl border border-pink-200 outline-none focus:border-pink-400" 
                                                        />
                                                        <select 
                                                            value={expiryUnit} 
                                                            onChange={e => setExpiryUnit(e.target.value)} 
                                                            className="text-[12px] font-bold px-2 py-1.5 rounded-xl outline-none border border-pink-200 text-pink-700 bg-white cursor-pointer"
                                                        >
                                                            <option value="seconds">Giây</option>
                                                            <option value="minutes">Phút</option>
                                                            <option value="hours">Giờ</option>
                                                            <option value="days">Ngày</option>
                                                        </select>
                                                        <button onClick={() => submitCustomExpiry(u._id)} className="bg-pink-500 text-white p-1.5 rounded-xl hover:bg-pink-600 transition-colors shadow-sm"><Check size={16}/></button>
                                                        <button onClick={() => setEditExpiryId(null)} className="bg-white text-gray-500 border border-gray-200 p-1.5 rounded-xl hover:bg-gray-100 transition-colors shadow-sm"><X size={16}/></button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => { setEditExpiryId(u._id); setExpiryVal(1); setExpiryUnit('minutes'); }} 
                                                        className="flex items-center gap-1.5 text-[12px] font-bold px-3 py-2.5 rounded-2xl border-2 border-pink-100 bg-pink-50 text-pink-600 hover:border-pink-300 transition-all shadow-sm active:scale-95"
                                                    >
                                                        <TimerReset size={15} /> Sửa Hạn
                                                    </button>
                                                )
                                            )}

                                            {(u.plan === '100k' || u.plan === 'premium') && (
                                                <div className="relative group">
                                                    <select 
                                                        className={`appearance-none text-[12px] font-bold pl-9 pr-4 py-2.5 rounded-2xl outline-none cursor-pointer border transition-colors shadow-sm ${chatRestrictStatus !== '0' ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`} 
                                                        onChange={(e) => handleRestrictChat(u._id, e.target.value)} 
                                                        value={chatRestrictStatus}
                                                    >
                                                        <option value="0">Chat Bình thường</option>
                                                        <option value="1">Cấm Chat 1 ngày</option>
                                                        <option value="3">Cấm Chat 3 ngày</option>
                                                        <option value="7">Cấm Chat 7 ngày</option>
                                                        <option value="forever">Cấm Chat Vĩnh viễn</option>
                                                        {chatRestrictStatus === 'restricted' && <option value="restricted" disabled hidden>Đang bị cấm chat...</option>}
                                                    </select>
                                                    <MessageSquareOff size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${chatRestrictStatus !== '0' ? 'text-orange-500' : 'text-gray-400'}`} />
                                                </div>
                                            )}

                                            <select 
                                                className={`text-[12px] font-bold px-3 py-2.5 rounded-2xl outline-none cursor-pointer border transition-colors shadow-sm ${isRestricted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`} 
                                                onChange={(e) => handleRestrict(u._id, e.target.value)} 
                                                value={restrictStatus}
                                            >
                                                <option value="0">Web Bình thường</option>
                                                <option value="1">Khóa Web 1 ngày</option>
                                                <option value="2">Khóa Web 2 ngày</option>
                                                <option value="7">Khóa Web 7 ngày</option>
                                                <option value="forever">Khóa Web Vĩnh viễn</option>
                                                {restrictStatus === 'restricted' && <option value="restricted" disabled hidden>Đang bị khóa web...</option>}
                                            </select>
                                            
                                            <button onClick={() => handleDeleteUser(u._id)} className="w-[42px] h-[42px] flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-95"><Trash2 size={18}/></button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
