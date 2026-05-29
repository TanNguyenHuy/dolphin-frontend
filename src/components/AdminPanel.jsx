import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Crown, ArrowLeft, Clock, ShieldAlert, Mail, Eye, X, TimerReset, Check } from 'lucide-react';
import { API_URL } from '../utils';

export default function AdminPanel({ setView, authUser }) {
    const [users, setUsers] = useState([]);
    const [selectedBill, setSelectedBill] = useState(null);

    // STATE CHO TÍNH NĂNG CHỈNH SỬA HẠN SỬ DỤNG
    const [editExpiryId, setEditExpiryId] = useState(null);
    const [expiryVal, setExpiryVal] = useState(1);
    const [expiryUnit, setExpiryUnit] = useState('minutes'); 

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

    const handleChangePlan = async (id, newPlan, currentPermissions) => {
        const planName = newPlan === 'premium' ? '💎 GÓI PREMIUM' : newPlan === '100k' ? '🥇 GÓI VVIP' : newPlan === '50k' ? '🥈 GÓI VIP' : '🥉 GÓI CƠ BẢN';
        if (!window.confirm(`Sếp có chắc chắn đổi khách hàng này sang ${planName}? Hạn sử dụng sẽ được tính lại từ hôm nay!`)) return;

        let canViewDetail = currentPermissions?.canViewDetail || false;
        if (newPlan === '50k' || newPlan === '100k' || newPlan === 'premium') canViewDetail = true;
        else canViewDetail = false;

        const updatedPermissions = { ...currentPermissions, canViewDetail };

        try {
            await axios.put(`${API_URL}/users/${id}/change-plan`, { plan: newPlan, permissions: updatedPermissions });
            fetchUsers();
        } catch (e) { alert("Lỗi khi cập nhật gói!"); }
    };

    // HÀM ÉP NGÀY CHUẨN XÁC THEO MÁY TÍNH CỦA SẾP
    const submitCustomExpiry = async (id) => {
        if (!expiryVal || expiryVal <= 0) return alert("Vui lòng nhập số lượng hợp lệ!");
        
        let seconds = 0;
        const val = parseInt(expiryVal);
        if (expiryUnit === 'seconds') seconds = val;
        if (expiryUnit === 'minutes') seconds = val * 60;
        if (expiryUnit === 'hours') seconds = val * 3600;
        if (expiryUnit === 'days') seconds = val * 86400;

        const unitName = expiryUnit === 'seconds' ? 'Giây' : expiryUnit === 'minutes' ? 'Phút' : expiryUnit === 'hours' ? 'Giờ' : 'Ngày';
        if (!window.confirm(`Xác nhận ép hạn sử dụng còn đúng ${val} ${unitName}?`)) return;

        try {
            // Tính toán thời điểm hết hạn chính xác tại máy Sếp rồi gửi string lên Server
            const exactExpiryDate = new Date(Date.now() + seconds * 1000).toISOString();
            
            await axios.put(`${API_URL}/users/${id}/force-expiry`, { expiryDate: exactExpiryDate });
            fetchUsers();
            setEditExpiryId(null); 
            alert("Đã cập nhật hạn sử dụng thành công!");
        } catch (e) { alert("Lỗi ép ngày!"); }
    };

    const handleRestrict = async (id, days) => {
        let restrictedUntil = null;
        let isBanned = false;
        if (days === 'forever') isBanned = true; 
        else if (days !== '0' && days !== 'restricted') restrictedUntil = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000).toISOString();
        await axios.put(`${API_URL}/users/${id}`, { restrictedUntil, isBanned });
        fetchUsers();
    };

    const getRestrictStatus = (u) => {
        if (u.isBanned) return 'forever';
        if (u.restrictedUntil && new Date(u.restrictedUntil) > new Date()) return 'restricted';
        return '0';
    };

    // HIỂN THỊ ĐẾM NGƯỢC CHI TIẾT TỚI TỪNG GIÂY
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
            {selectedBill && (
                <div className="fixed inset-0 z-[999] bg-black/90 flex flex-col items-center justify-center p-4">
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
                    const isRestricted = restrictStatus !== '0';

                    return (
                        <div key={u._id} className={`liquid-glass rounded-[30px] p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-[3px] transition-all shadow-sm ${!u.isApproved && u.role !== 'admin' && u.plan !== 'premium' ? 'border-orange-300 bg-orange-50/50' : 'border-transparent hover:border-gray-200'}`}>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-extrabold text-[18px] text-gray-800">{u.name}</h3>
                                    
                                    {u.plan === 'premium' || u.role === 'admin' ? (
                                        <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-purple-300 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md flex items-center gap-1"><Crown size={12}/> Gói Premium</span>
                                    ) : (
                                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border shadow-sm ${
                                            u.plan === '100k' ? 'bg-gradient-to-r from-[#FDE68A] to-[#F59E0B] text-white border-[#D97706]' : 
                                            u.plan === '50k' ? 'bg-gradient-to-r from-[#E2E8F0] to-[#94A3B8] text-white border-[#64748B]' : 
                                            'bg-gradient-to-r from-[#D7CCC8] to-[#A1887F] text-white border-[#8D6E63]' 
                                        }`}>
                                            {u.plan === '100k' ? 'Gói VVIP' : u.plan === '50k' ? 'Gói VIP' : 'Gói Cơ Bản'}
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-gray-400 text-[13px] mb-3 flex items-center gap-1.5"><Mail size={12}/> {u.email}</p>
                                
                                {u.role !== 'admin' ? (
                                    u.plan === 'premium' ? (
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
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black shadow-sm bg-red-50 text-red-600 border border-red-200 mt-2 ml-2">
                                        <ShieldAlert size={14}/> Hạn chế đến: {new Date(u.restrictedUntil).toLocaleString('vi-VN')}
                                    </div>
                                )}
                            </div>

                            {u.role !== 'admin' && (
                                <div className="flex flex-wrap items-center gap-3 xl:gap-4 mt-4 xl:mt-0">
                                    {u.paymentImage ? (
                                        <button onClick={() => setSelectedBill(u.paymentImage)} className="flex items-center gap-2 bg-white border-2 border-blue-500 text-blue-600 px-5 py-2.5 rounded-2xl font-black text-[12px] hover:bg-blue-50 transition-all shadow-md active:scale-95"><Eye size={16}/> XEM BILL</button>
                                    ) : (
                                        <span className="text-gray-400 text-[11px] italic bg-gray-100 px-4 py-2 rounded-xl">Chưa có Bill</span>
                                    )}

                                    <button onClick={() => handleApprove(u._id)} className={`px-6 xl:px-8 py-2.5 xl:py-3 rounded-2xl font-black text-[13px] shadow-lg transition-all active:scale-95 ${u.isApproved ? 'bg-gray-100 text-gray-400 border border-gray-200 shadow-none' : 'bg-gradient-to-r from-[#1DB2A0] to-[#159a8a] text-white hover:opacity-90'}`}>
                                        {u.isApproved ? 'ĐÃ DUYỆT' : 'DUYỆT VÀO'}
                                    </button>

                                    <div className="flex flex-wrap gap-4 bg-white/90 p-3 rounded-2xl border border-gray-200 shadow-inner">
                                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 cursor-pointer"><input type="checkbox" checked={u.permissions?.canPay} onChange={() => togglePermission(u._id, u.permissions, 'canPay')} className="accent-teal-500 w-4 h-4"/> P.Lương</label>
                                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 cursor-pointer"><input type="checkbox" checked={u.permissions?.canEdit} onChange={() => togglePermission(u._id, u.permissions, 'canEdit')} className="accent-blue-500 w-4 h-4"/> Sửa</label>
                                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 cursor-pointer"><input type="checkbox" checked={u.permissions?.canDelete} onChange={() => togglePermission(u._id, u.permissions, 'canDelete')} className="accent-red-500 w-4 h-4"/> Xóa</label>
                                        <label className="flex items-center gap-1.5 text-[12px] font-bold text-orange-600 cursor-pointer border-l pl-3 ml-1 border-gray-200"><input type="checkbox" checked={u.permissions?.canViewDetail} onChange={() => togglePermission(u._id, u.permissions, 'canViewDetail')} className="accent-orange-500 w-4 h-4"/> Xem Chi Tiết</label>
                                    </div>
                                    
                                    <div className="relative group">
                                        <select 
                                            className="appearance-none text-[12px] font-black pl-9 pr-4 py-2.5 rounded-2xl outline-none cursor-pointer border-2 border-indigo-100 bg-indigo-50 text-indigo-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-100"
                                            value={u.plan || '10k'}
                                            onChange={(e) => handleChangePlan(u._id, e.target.value, u.permissions)}
                                            title="Đổi gói - Thời gian sẽ được tính lại từ đầu"
                                        >
                                            <option value="10k">🥉 GÓI CƠ BẢN (10k)</option>
                                            <option value="50k">🥈 GÓI VIP (50k)</option>
                                            <option value="100k">🥇 GÓI VVIP (100k)</option>
                                            <option value="premium">💎 GÓI PREMIUM</option>
                                        </select>
                                        <Crown size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                                    </div>

                                    {/* MENU SỬA HẠN TÙY CHỈNH (INLINE EDIT) */}
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
                                                title="Sửa hạn sử dụng tùy ý"
                                            >
                                                <TimerReset size={15} /> Sửa Hạn
                                            </button>
                                        )
                                    )}

                                    <select className={`text-[12px] font-bold px-3 py-2.5 rounded-2xl outline-none cursor-pointer border transition-colors shadow-sm ${isRestricted ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`} onChange={(e) => handleRestrict(u._id, e.target.value)} value={restrictStatus}>
                                        <option value="0">Bình thường</option>
                                        <option value="1">Hạn chế 1 ngày</option>
                                        <option value="2">Hạn chế 2 ngày</option>
                                        <option value="7">Hạn chế 7 ngày</option>
                                        <option value="forever">Cấm vĩnh viễn</option>
                                    </select>
                                    
                                    <button onClick={async () => { if(window.confirm("Xóa vĩnh viễn tài khoản này?")) { await axios.delete(`${API_URL}/users/${u._id}`); fetchUsers(); } }} className="w-[42px] h-[42px] flex items-center justify-center text-red-500 bg-red-50 hover:bg-red-500 hover:text-white rounded-2xl transition-all shadow-sm active:scale-95"><Trash2 size={18}/></button>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
