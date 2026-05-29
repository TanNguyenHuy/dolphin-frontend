import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Crown, ArrowLeft, Clock, ShieldAlert } from 'lucide-react';
import { API_URL } from '../utils';

export default function AdminPanel({ setView, authUser }) {
    const [users, setUsers] = useState([]);

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${API_URL}/users`);
            setUsers(res.data);
        } catch (error) { console.error("Lỗi fetch users:", error); }
    };

    const togglePermission = async (id, currentPermissions, field) => {
        const updated = { ...currentPermissions, [field]: !currentPermissions[field] };
        await axios.put(`${API_URL}/users/${id}`, { permissions: updated });
        fetchUsers();
    };

    const handleApprove = async (id, isApproved) => {
        await axios.put(`${API_URL}/users/${id}`, { isApproved: !isApproved });
        fetchUsers();
    };

    const handleRestrict = async (id, days) => {
        let restrictedUntil = null;
        let isBanned = false;

        if (days === 'forever') {
            isBanned = true; // Cấm vĩnh viễn
        } else if (days !== '0' && days !== 'restricted') {
            // Cộng thêm số ngày Hạn chế vào thời điểm hiện tại
            restrictedUntil = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
        }

        await axios.put(`${API_URL}/users/${id}`, { restrictedUntil, isBanned });
        fetchUsers();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Xóa vĩnh viễn người dùng này? Hành động không thể hoàn tác!")) {
            await axios.delete(`${API_URL}/users/${id}`);
            fetchUsers();
        }
    };

    const getRestrictStatus = (u) => {
        if (u.isBanned) return 'forever';
        if (u.restrictedUntil && new Date(u.restrictedUntil) > new Date()) return 'restricted';
        return '0';
    };

    return (
        <div className="animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
                <button onClick={() => setView('DASHBOARD')} className="flex items-center gap-2 text-[#5c5c5c] hover:text-[#1DB2A0] font-semibold bg-white/50 px-4 py-2 rounded-full shadow-sm transition-colors active:scale-95 border border-white/60">
                    <ArrowLeft size={16} /> Về Dashboard
                </button>
                <h2 className="text-[24px] md:text-[28px] font-black text-[#1D1D1F] tracking-tight">Quản lý Tài Khoản</h2>
            </div>

            <div className="space-y-4">
                {users.map(u => {
                    const restrictStatus = getRestrictStatus(u);
                    const isRestricted = restrictStatus !== '0';

                    return (
                        <div key={u._id} className="liquid-glass rounded-[24px] p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 transition-all hover:bg-white/60 shadow-sm border border-white/50">
                            
                            {/* THÔNG TIN NGƯỜI DÙNG */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-[16px] text-[#1D1D1F] truncate">{u.name}</h3>
                                    {u.role === 'admin' && <Crown size={16} className="text-[#FF9500] shrink-0"/>}
                                    
                                    {/* HIỂN THỊ TÊN GÓI Ở ĐÂY */}
                                    {u.role !== 'admin' && (
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                            u.plan === '100k' ? 'bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20' : 
                                            u.plan === '50k' ? 'bg-[#26D0CE]/10 text-[#26D0CE] border border-[#26D0CE]/20' : 
                                            'bg-gray-100 text-gray-500 border border-gray-200'
                                        }`}>
                                            {u.plan === '100k' ? 'Gói V.I.P' : u.plan === '50k' ? 'Gói Tiêu Chuẩn' : 'Gói Cơ Bản'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-[13px] text-[#5c5c5c] truncate">{u.email}</p>
                                
                                {/* HIỂN THỊ ĐỒNG HỒ ĐẾM NGƯỢC NẾU BỊ HẠN CHẾ */}
                                {restrictStatus === 'restricted' && u.restrictedUntil && (
                                    <p className="text-[12px] text-[#FF3B30] mt-1.5 flex items-center gap-1 font-semibold">
                                        <Clock size={12}/> Hạn chế đến: {new Date(u.restrictedUntil).toLocaleString('vi-VN')}
                                    </p>
                                )}
                            </div>

                            {/* KHU VỰC CÁC NÚT BẤM VÀ QUYỀN */}
                            {u.role !== 'admin' ? (
                                <div className="flex flex-wrap items-center gap-3 shrink-0">
                                    <button onClick={() => handleApprove(u._id, u.isApproved)} className={`px-4 py-2.5 text-[13px] font-bold rounded-xl transition-all shadow-sm active:scale-95 ${u.isApproved ? 'text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200' : 'text-white bg-gradient-to-r from-[#1DB2A0] to-[#159a8a] hover:opacity-90 border border-transparent'}`}>
                                        {u.isApproved ? 'Hủy Duyệt' : 'Duyệt Vào'}
                                    </button>
                                    
                                    <div className="flex flex-wrap items-center gap-4 bg-white/70 border border-gray-200 rounded-xl px-4 py-2.5 shadow-inner">
                                        <label className="flex items-center gap-1.5 cursor-pointer text-[13px] font-semibold text-gray-700 hover:text-[#1DB2A0] transition-colors">
                                            <input type="checkbox" checked={u.permissions?.canPay || false} onChange={() => togglePermission(u._id, u.permissions, 'canPay')} className="accent-[#1DB2A0] w-4 h-4 cursor-pointer"/> P.Lương
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer text-[13px] font-semibold text-gray-700 hover:text-[#33A1FD] transition-colors">
                                            <input type="checkbox" checked={u.permissions?.canEdit || false} onChange={() => togglePermission(u._id, u.permissions, 'canEdit')} className="accent-[#33A1FD] w-4 h-4 cursor-pointer"/> Sửa
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer text-[13px] font-semibold text-gray-700 hover:text-[#FF3B30] transition-colors">
                                            <input type="checkbox" checked={u.permissions?.canDelete || false} onChange={() => togglePermission(u._id, u.permissions, 'canDelete')} className="accent-[#FF3B30] w-4 h-4 cursor-pointer"/> Xóa
                                        </label>
                                        {/* NÚT QUYỀN XEM CHI TIẾT */}
                                        <label className="flex items-center gap-1.5 cursor-pointer text-[13px] font-semibold text-gray-700 hover:text-[#FF9500] transition-colors border-l pl-3 ml-1 border-gray-300">
                                            <input type="checkbox" checked={u.permissions?.canViewDetail || false} onChange={() => togglePermission(u._id, u.permissions, 'canViewDetail')} className="accent-[#FF9500] w-4 h-4 cursor-pointer"/> Xem Chi Tiết
                                        </label>
                                    </div>

                                    {/* MENU CHỌN NGÀY HẠN CHẾ */}
                                    <select 
                                        className={`text-[13px] font-bold px-3 py-2.5 rounded-xl outline-none cursor-pointer border transition-colors shadow-sm ${isRestricted ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/30' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                        onChange={(e) => handleRestrict(u._id, e.target.value)}
                                        value={restrictStatus}
                                    >
                                        <option value="0">Bình thường</option>
                                        <option value="1">Hạn chế 1 ngày</option>
                                        <option value="2">Hạn chế 2 ngày</option>
                                        <option value="3">Hạn chế 3 ngày</option>
                                        <option value="7">Hạn chế 7 ngày</option>
                                        <option value="forever">Cấm vĩnh viễn</option>
                                        {restrictStatus === 'restricted' && <option value="restricted" disabled hidden>Đang bị hạn chế...</option>}
                                    </select>

                                    <button onClick={() => handleDelete(u._id)} className="w-[40px] h-[40px] flex items-center justify-center bg-white border border-gray-200 text-[#FF3B30] rounded-xl hover:bg-[#FF3B30] hover:text-white transition-all shadow-sm active:scale-95" title="Xóa tài khoản"><Trash2 size={16}/></button>
                                </div>
                            ) : (
                                <div className="px-4 py-2.5 bg-[#FF9500]/10 text-[#FF9500] text-[13px] font-bold rounded-xl border border-[#FF9500]/20 flex items-center gap-2 shrink-0 shadow-sm">
                                    <ShieldAlert size={16}/> Quyền Tối Cao
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
