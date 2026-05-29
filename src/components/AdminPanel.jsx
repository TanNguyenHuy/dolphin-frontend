import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Crown, ArrowLeft, Clock, ShieldAlert, Mail, Eye, X } from 'lucide-react';
import { API_URL } from '../utils';

export default function AdminPanel({ setView, authUser }) {
    const [users, setUsers] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);

    useEffect(() => { fetchUsers(); }, []);

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
        } catch (e) { alert("Lỗi duyệt!"); }
    };

    const togglePermission = async (id, currentPermissions, field) => {
        const updated = { ...currentPermissions, [field]: !currentPermissions[field] };
        await axios.put(`${API_URL}/users/${id}`, { permissions: updated });
        fetchUsers();
    };

    const getRemainingTime = (expiryDate) => {
        if (!expiryDate) return null;
        const now = new Date(); const exp = new Date(expiryDate);
        if (now > exp) return "Đã hết hạn";
        const diff = Math.abs(exp - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        return `Còn ${days} ngày ${hours} giờ`;
    };

    return (
        <div className="animate-fade-in-up pb-20">
            {/* MODAL XEM ẢNH BILL */}
            {selectedBill && (
                <div className="fixed inset-0 z-[999] bg-black/90 flex flex-col items-center justify-center p-4">
                    <button onClick={() => setSelectedBill(null)} className="absolute top-10 right-10 text-white bg-white/10 p-4 rounded-full"><X size={30}/></button>
                    <img src={selectedBill} className="max-w-full max-h-[85vh] object-contain border-4 border-white rounded-xl shadow-2xl" alt="Bill" />
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <button onClick={() => setView('DASHBOARD')} className="flex items-center gap-2 text-gray-500 font-bold bg-white px-6 py-3 rounded-full shadow-sm border"><ArrowLeft size={18} /> Dashboard</button>
                <h2 className="text-3xl font-black text-gray-800">Cài Đặt Hệ Thống</h2>
            </div>

            <div className="space-y-4">
                {users.map(u => (
                    <div key={u._id} className={`liquid-glass rounded-[30px] p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-2 transition-all ${!u.isApproved ? 'border-orange-200 bg-orange-50/30' : 'border-white'}`}>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-extrabold text-xl text-gray-800">{u.name}</h3>
                                
                                {/* HIỂN THỊ TÊN GÓI THEO MÀU SẮC ĐỒNG/BẠC/VÀNG/PREMIUM */}
                                {u.role === 'admin' ? (
                                    <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-purple-300 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md flex items-center gap-1">
                                        <Crown size={12}/> Gói Premium
                                    </span>
                                ) : (
                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter border ${
                                        u.plan === '100k' ? 'bg-[#FFF8E1] text-[#F59E0B] border-[#FFD54F]' : // Màu Vàng
                                        u.plan === '50k' ? 'bg-[#F8FAFC] text-[#64748B] border-[#CBD5E1]' : // Màu Bạc
                                        'bg-[#EFEBE9] text-[#8D6E63] border-[#D7CCC8]' // Màu Đồng
                                    }`}>
                                        {u.plan === '100k' ? 'Gói V.I.P' : u.plan === '50k' ? 'Gói Tiêu Chuẩn' : 'Gói Cơ Bản'}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm mb-3">{u.email}</p>
                            
                            {/* HIỆN HẠN SỬ DỤNG KHI ĐÃ DUYỆT */}
                            {u.isApproved && u.role !== 'admin' && (
                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${(!u.planExpiry || new Date() > new Date(u.planExpiry)) ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                                    <Clock size={14}/> {getRemainingTime(u.planExpiry)}
                                </div>
                            )}
                        </div>

                        {/* CỘT DUYỆT BILL & QUYỀN */}
                        {u.role !== 'admin' && (
                            <div className="flex flex-wrap items-center gap-4">
                                {u.paymentImage ? (
                                    <button onClick={() => setSelectedBill(u.paymentImage)} className="flex items-center gap-2 bg-white border-2 border-blue-500 text-blue-600 px-5 py-2.5 rounded-2xl font-black text-xs hover:bg-blue-50 transition-all shadow-md"><Eye size={16}/> XEM BILL</button>
                                ) : (
                                    <span className="text-gray-400 text-[10px] italic">Chưa có Bill</span>
                                )}

                                <button onClick={() => handleApprove(u._id)} className={`px-8 py-3 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-95 ${u.isApproved ? 'bg-gray-100 text-gray-400 border cursor-not-allowed' : 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:shadow-green-200'}`}>
                                    {u.isApproved ? 'ĐÃ DUYỆT VÀO' : 'DUYỆT VÀO'}
                                </button>

                                <div className="flex gap-4 bg-white/80 p-3 rounded-2xl border shadow-inner">
                                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 cursor-pointer"><input type="checkbox" checked={u.permissions?.canEdit} onChange={() => togglePermission(u._id, u.permissions, 'canEdit')} className="accent-blue-500 w-4 h-4"/> Sửa</label>
                                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 cursor-pointer"><input type="checkbox" checked={u.permissions?.canDelete} onChange={() => togglePermission(u._id, u.permissions, 'canDelete')} className="accent-red-500 w-4 h-4"/> Xóa</label>
                                    <label className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 cursor-pointer"><input type="checkbox" checked={u.permissions?.canViewDetail} onChange={() => togglePermission(u._id, u.permissions, 'canViewDetail')} className="accent-blue-500 w-4 h-4"/> Xem Chi Tiết</label>
                                </div>
                                
                                <button onClick={async () => { if(window.confirm("Xóa vĩnh viễn?")) { await axios.delete(`${API_URL}/users/${u._id}`); fetchUsers(); } }} className="p-3 text-red-400 bg-red-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={20}/></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
