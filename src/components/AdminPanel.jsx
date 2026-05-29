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
        const planName = newPlan === 'premium' ? 'PREMIUM' : newPlan === '100k' ? 'VVIP' : newPlan === '50k' ? 'VIP' : 'CƠ BẢN';
        confirmAction("Xác Nhận Đổi", `Đổi sang gói ${planName}?`, async () => {
            try {
                await axios.put(`${API_URL}/users/${id}/change-plan`, { plan: newPlan });
                fetchUsers();
                setConfirmModal({ show: false });
                showToast(`Đã đổi sang ${planName}!`, "success");
            } catch (e) { showToast("Lỗi!", "error"); setConfirmModal({ show: false }); }
        });
    };

    const submitCustomExpiry = (id) => {
        let seconds = 0;
        const val = parseInt(expiryVal);
        if (expiryUnit === 'seconds') seconds = val;
        if (expiryUnit === 'minutes') seconds = val * 60;
        if (expiryUnit === 'hours') seconds = val * 3600;
        if (expiryUnit === 'days') seconds = val * 86400;

        confirmAction("Ép Hạn", `Ép hạn còn ${val} ${expiryUnit}?`, async () => {
            try {
                const exactExpiryDate = new Date(Date.now() + seconds * 1000).toISOString();
                await axios.put(`${API_URL}/users/${id}/force-expiry`, { expiryDate: exactExpiryDate });
                fetchUsers();
                setEditExpiryId(null); 
                setConfirmModal({ show: false });
                showToast("Xong!", "success");
            } catch (e) { showToast("Lỗi!", "error"); setConfirmModal({ show: false }); }
        });
    };

    const handleDeleteUser = (id) => {
        confirmAction("Xóa", "Xóa vĩnh viễn?", async () => {
            try {
                await axios.delete(`${API_URL}/users/${id}`);
                fetchUsers();
                setConfirmModal({ show: false });
                showToast("Đã xóa!", "success");
            } catch (e) { showToast("Lỗi!", "error"); setConfirmModal({ show: false }); }
        }, true);
    };

    const handleRestrict = async (id, days) => {
        let restrictedUntil = null;
        let isBanned = false;
        if (days === 'forever') isBanned = true;
        else if (days !== '0') restrictedUntil = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
        await axios.put(`${API_URL}/users/${id}`, { restrictedUntil, isBanned });
        fetchUsers();
        showToast("Xong!", "success");
    };

    const handleRestrictChat = async (id, days) => {
        await axios.put(`${API_URL}/users/${id}/restrict-chat`, { days });
        fetchUsers();
        showToast("Xong!", "success");
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
        if (now > exp) return "Hết hạn";
        const diff = Math.abs(exp - now);
        const days = Math.floor(diff / 86400000);
        const hours = Math.floor((diff % 86400000) / 3600000);
        if (days > 0) return `${days}n ${hours}g`;
        return `Sắp hết`;
    };

    return (
        <div className="pb-20">
            <div className={`fixed top-5 right-5 z-[9999] transition-all duration-500 ${toast.show ? 'translate-x-0 opacity-100' : 'translate-x-[150%] opacity-0'}`}>
                <div className="flex items-center gap-3 px-6 py-4 rounded-[20px] shadow-2xl bg-white border border-gray-200">
                    <CheckCircle2 className="text-green-500" size={24}/>
                    <p className="font-bold text-[14px] text-gray-700">{toast.message}</p>
                </div>
            </div>

            {confirmModal.show && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
                    <div className="bg-white rounded-[30px] p-8 w-full max-w-[360px] text-center shadow-xl">
                        <HelpCircle size={40} className="mx-auto mb-4 text-indigo-500" />
                        <h2 className="text-[20px] font-black mb-2">{confirmModal.title}</h2>
                        <p className="text-[14px] text-gray-500 mb-8">{confirmModal.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmModal({ show: false })} className="flex-1 py-3 rounded-xl bg-gray-100 font-bold">Hủy</button>
                            <button onClick={confirmModal.onConfirm} className={`flex-1 py-3 rounded-xl font-bold text-white ${confirmModal.isDanger ? 'bg-red-500' : 'bg-indigo-500'}`}>Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedBill && (
                <div className="fixed inset-0 z-[999] bg-black/90 flex flex-col items-center justify-center p-4" onClick={() => setSelectedBill(null)}>
                    <img src={selectedBill} className="max-w-full max-h-[85vh] border-4 border-white rounded-[20px]" alt="Bill" />
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <button onClick={() => setView('DASHBOARD')} className="flex items-center gap-2 text-gray-500 font-bold bg-white px-6 py-3 rounded-full shadow-sm border"><ArrowLeft size={18} /> Dashboard</button>
                <h2 className="text-[28px] font-black text-gray-800">Quản Lý Thành Viên</h2>
            </div>

            <div className="space-y-4">
                {users.map(u => {
                    const restrictStatus = getRestrictStatus(u);
                    const chatRestrictStatus = getChatRestrictStatus(u);
                    const isAbandoned = !u.isApproved && !u.paymentImage && u.role !== 'admin';

                    return (
                        <div key={u._id} className="bg-white rounded-[24px] p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 border border-gray-100 shadow-sm">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-extrabold text-[17px] text-gray-800 truncate">{u.name}</h3>
                                    
                                    {/* ĐÃ FIX: NHÃN ĐỒNG BỘ W-24 NHƯNG DÙNG GRADIENT GỐC BÓNG BẨY */}
                                    {isAbandoned ? (
                                        <span className="w-24 h-7 flex items-center justify-center gap-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-300 bg-gray-200 text-gray-500 shadow-sm">CHƯA NẠP</span>
                                    ) : u.plan === 'premium' || u.role === 'admin' ? (
                                        <span className="w-24 h-7 flex items-center justify-center gap-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-md bg-gradient-to-r from-purple-500 to-blue-500 text-white"><Crown size={12}/> PREMIUM</span>
                                    ) : (
                                        <span className={`w-24 h-7 flex items-center justify-center gap-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-md ${
                                            u.plan === '100k' ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white' : 
                                            u.plan === '50k' ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800' : 
                                            'bg-gradient-to-r from-stone-300 to-stone-400 text-stone-800'
                                        }`}>
                                            {u.plan === '100k' ? <><Crown size={12}/> VVIP</> : u.plan === '50k' ? <><Star size={12}/> VIP</> : <><Eye size={12}/> CƠ BẢN</>}
                                        </span>
                                    )}
                                </div>
                                <p className="text-gray-400 text-[12px] flex items-center gap-1"><Mail size={12}/> {u.email}</p>
                                <div className="flex gap-2 mt-2">
                                    <div className="px-3 py-1 bg-gray-50 border rounded-full text-[10px] font-bold text-gray-500">
                                        Hạn: {u.plan === 'premium' ? 'Vô hạn' : getRemainingTime(u.planExpiry) || 'Chờ duyệt'}
                                    </div>
                                </div>
                            </div>

                            {u.role !== 'admin' && (
                                <div className="flex flex-wrap items-center gap-3">
                                    {u.paymentImage && <button onClick={() => setSelectedBill(u.paymentImage)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-[11px] font-black border border-blue-100 animate-pulse">XEM BILL</button>}
                                    
                                    {!u.isApproved && <button onClick={() => handleApprove(u._id)} className="bg-teal-500 text-white px-5 py-2 rounded-xl text-[11px] font-black shadow-md">DUYỆT</button>}

                                    <div className="flex gap-3 bg-gray-50 p-2 rounded-xl border">
                                        {u.plan === 'premium' && ['canPay', 'canEdit', 'canDelete'].map(p => (
                                            <label key={p} className="flex items-center gap-1 text-[11px] font-bold cursor-pointer">
                                                <input type="checkbox" checked={u.permissions?.[p]} onChange={() => togglePermission(u._id, u.permissions, p)} className="w-4 h-4 accent-teal-500"/> 
                                                <span className={u.permissions?.[p] ? 'text-gray-700' : 'text-gray-300'}>{p === 'canPay' ? 'Lương' : p === 'canEdit' ? 'Sửa' : 'Xóa'}</span>
                                            </label>
                                        ))}
                                        <label className="flex items-center gap-1 text-[11px] font-bold text-orange-600 cursor-pointer">
                                            <input type="checkbox" checked={u.permissions?.canViewDetail} onChange={() => togglePermission(u._id, u.permissions, 'canViewDetail')} className="w-4 h-4 accent-orange-500"/> 
                                            <span className={u.permissions?.canViewDetail ? 'text-orange-600' : 'text-orange-300'}>Chi Tiết</span>
                                        </label>
                                    </div>
                                    
                                    <select className="bg-white border rounded-xl px-3 py-2 text-[11px] font-bold outline-none" value={u.plan || '10k'} onChange={(e) => handleChangePlan(u._id, e.target.value)}>
                                        <option value="10k">CƠ BẢN (10k)</option>
                                        <option value="50k">VIP (50k)</option>
                                        <option value="100k">VVIP (100k)</option>
                                        <option value="premium">PREMIUM</option>
                                    </select>

                                    {(u.plan === '100k' || u.plan === 'premium') && (
                                        <select className="bg-orange-50 border border-orange-100 text-orange-600 px-3 py-2 rounded-xl text-[11px] font-bold" value={chatRestrictStatus} onChange={(e) => handleRestrictChat(u._id, e.target.value)}>
                                            <option value="0">Chat: Mở</option>
                                            <option value="1">Cấm 1 ngày</option>
                                            <option value="3">Cấm 3 ngày</option>
                                            <option value="forever">Cấm vĩnh viễn</option>
                                        </select>
                                    )}

                                    <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-red-500 bg-red-50 rounded-xl hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
