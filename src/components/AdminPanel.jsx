import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Crown, ChevronLeft } from 'lucide-react';
import { API_URL } from '../utils';

export default function AdminPanel({ setView, authUser }) {
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => { 
        try { const res = await axios.get(`${API_URL}/users`); setUsersList(res.data); } 
        catch(err) {} 
    };

    const handleUpdateUser = async (id, updateData) => { 
        try { await axios.put(`${API_URL}/users/${id}`, updateData); fetchUsers(); } 
        catch(err) { alert('Lỗi cập nhật user!'); } 
    };

    const handleDeleteUser = async (id) => { 
        if(window.confirm('Xóa vĩnh viễn tài khoản này?')) { 
            try { await axios.delete(`${API_URL}/users/${id}`); fetchUsers(); } 
            catch(err) {} 
        } 
    };

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200/60">
                <button onClick={() => setView('DASHBOARD')} className="flex items-center gap-1.5 text-[#1A5B82] hover:text-[#0B3B60] font-semibold bg-white/30 px-4 py-2 rounded-full border border-white/40 shadow-sm"><ChevronLeft size={18}/> Về Dashboard</button>
                <h2 className="text-[20px] md:text-[24px] font-black text-[#1D1D1F]">Quản lý Tài Khoản</h2>
            </div>
            <div className="grid gap-4">
                {usersList.map((user) => {
                    const id = user._id || user.id;
                    const perms = user.permissions || { canView: false, canEdit: false, canDelete: false };
                    const isMe = (authUser.id === id) || (authUser._id === id);

                    return (
                        <div key={id} className={`liquid-glass p-4 rounded-[20px] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${user.isBanned ? 'border-[#FF3B30]/30 bg-[#FF3B30]/5' : ''}`}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-[#1D1D1F] text-[16px]">{user.name}</h3>
                                    {user.role === 'admin' && <Crown size={14} className="text-[#FF9500]" title="Chủ tịch"/>}
                                    {!user.isApproved && <span className="bg-[#FF9500] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">CHỜ DUYỆT</span>}
                                    {user.isBanned && <span className="bg-[#FF3B30] text-white text-[9px] px-2 py-0.5 rounded-full font-bold">BỊ CẤM</span>}
                                </div>
                                <p className="text-[13px] text-[#5c5c5c] font-medium">{user.email}</p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* KHỐI DUYỆT */}
                                {!user.isApproved ? (
                                    <button onClick={() => handleUpdateUser(id, { isApproved: true })} className="bg-[#1DB2A0] hover:bg-[#158f80] text-white text-[12px] font-bold px-4 py-2 rounded-xl transition shadow-sm">Duyệt Vào</button>
                                ) : (
                                    <button onClick={() => handleUpdateUser(id, { isApproved: false })} disabled={isMe} className="bg-white/40 hover:bg-white text-[#5c5c5c] text-[12px] font-bold px-3 py-2 rounded-xl transition border border-white/50 disabled:opacity-50">Hủy Duyệt</button>
                                )}

                                {/* KHỐI PHÂN QUYỀN */}
                                <div className="flex gap-1 bg-white/30 p-1 rounded-xl border border-white/50 items-center">
                                    <label className={`flex items-center gap-1.5 px-2 py-1 ${isMe ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/40 rounded-lg transition'}`}>
                                        <input type="checkbox" checked={perms.canView} onChange={(e) => handleUpdateUser(id, { permissions: { ...perms, canView: e.target.checked } })} disabled={isMe} className="accent-[#33A1FD]" />
                                        <span className="text-[12px] font-semibold text-[#1D1D1F]">Xem</span>
                                    </label>
                                    <div className="w-[1px] h-4 bg-white/60"></div>
                                    <label className={`flex items-center gap-1.5 px-2 py-1 ${isMe ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white/40 rounded-lg transition'}`}>
                                        <input type="checkbox" checked={perms.canEdit} onChange={(e) => handleUpdateUser(id, { permissions: { ...perms, canEdit: e.target.checked } })} disabled={isMe} className="accent-[#26D0CE]" />
                                        <span className="text-[12px] font-semibold text-[#1D1D1F]">Sửa</span>
                                    </label>
                                    <div className="w-[1px] h-4 bg-white/60"></div>
                                    <label className={`flex items-center gap-1.5 px-2 py-1 ${isMe ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-[#FF3B30]/10 rounded-lg transition'}`}>
                                        <input type="checkbox" checked={perms.canDelete} onChange={(e) => handleUpdateUser(id, { permissions: { ...perms, canDelete: e.target.checked } })} disabled={isMe} className="accent-[#FF3B30]" />
                                        <span className="text-[12px] font-semibold text-[#1D1D1F]">Xóa</span>
                                    </label>
                                </div>

                                {/* KHỐI TRỪNG PHẠT */}
                                {!isMe && (
                                    <>
                                        <button onClick={() => handleUpdateUser(id, { isBanned: !user.isBanned })} className={`px-3 py-2 text-[12px] font-bold rounded-xl transition border shadow-sm ${user.isBanned ? 'bg-[#1DB2A0]/10 text-[#1DB2A0] border-[#1DB2A0]/20 hover:bg-[#1DB2A0]/20' : 'bg-white/40 text-[#FF3B30] border-white/50 hover:bg-[#FF3B30]/10'}`}>
                                            {user.isBanned ? 'Mở Khóa' : 'Cấm Cửa'}
                                        </button>
                                        <button onClick={() => handleDeleteUser(id)} className="w-9 h-9 flex justify-center items-center bg-[#FF3B30]/10 hover:bg-[#FF3B30] text-[#FF3B30] hover:text-white rounded-xl transition-colors shadow-sm"><Trash2 size={16}/></button>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}