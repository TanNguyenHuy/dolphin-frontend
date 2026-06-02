import React from 'react';
import { Star, Trash2, Crown, Clock, ShieldAlert, Mail, Eye, X, TimerReset, Check, MessageSquareOff } from 'lucide-react';

export default function UserCard({
    u, getRestrictStatus, getChatRestrictStatus, getRemainingTime,
    handleDeleteUser, setSelectedBill, handleApprove, togglePermission,
    handleChangePlan, editExpiryId, setEditExpiryId, expiryVal, setExpiryVal,
    expiryUnit, setExpiryUnit, submitCustomExpiry, handleRestrictChat, handleRestrict
}) {
    const restrictStatus = getRestrictStatus(u);
    const chatRestrictStatus = getChatRestrictStatus(u);
    const isRestricted = restrictStatus !== '0';
    const isChatRestricted = chatRestrictStatus !== '0';
    const isAbandoned = !u.isApproved && !u.paymentImage && u.role !== 'admin';

    return (
        <div className={`liquid-glass rounded-[30px] p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-[3px] transition-all shadow-sm ${isAbandoned ? 'border-gray-200 bg-gray-50/50 opacity-80' : (!u.isApproved && u.role !== 'admin' && u.plan !== 'premium' ? 'border-orange-300 bg-orange-50/50' : 'border-transparent hover:border-gray-200')}`}>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-extrabold text-[18px] text-gray-800">{u.name}</h3>
                    {isAbandoned ? (
                        <span className="w-[95px] h-[26px] flex items-center justify-center rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-300 bg-[linear-gradient(135deg,#E5E7EB_0%,#FFFFFF_50%,#D1D5DB_100%)] text-gray-500 shadow-[inset_0_1px_3px_rgba(255,255,255,1)]">CHƯA CHỌN</span>
                    ) : u.plan === 'premium' || u.role === 'admin' ? (
                        <span className="w-[95px] h-[26px] flex items-center justify-center gap-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[linear-gradient(135deg,#4C1D95_0%,#D8B4FE_40%,#7E22CE_60%,#312E81_100%)] text-white border border-[#E9D5FF] shadow-[inset_0_1px_4px_rgba(255,255,255,0.7),0_4px_10px_rgba(109,40,217,0.4)]"><Crown size={12}/> PREMIUM</span>
                    ) : (
                        <span className={`w-[95px] h-[26px] flex items-center justify-center gap-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                            u.plan === '100k' ? 'bg-[linear-gradient(135deg,#B45309_0%,#FDE68A_40%,#D97706_60%,#78350F_100%)] text-[#451A03] border border-[#FEF08A] shadow-[inset_0_1px_4px_rgba(255,255,255,0.8),0_4px_10px_rgba(180,83,9,0.4)]' : 
                            u.plan === '50k' ? 'bg-[linear-gradient(135deg,#64748B_0%,#F8FAFC_40%,#94A3B8_60%,#334155_100%)] text-[#0F172A] border border-[#FFFFFF] shadow-[inset_0_1px_4px_rgba(255,255,255,0.9),0_4px_10px_rgba(100,116,139,0.4)]' : 
                            'bg-[linear-gradient(135deg,#78350F_0%,#FBBF24_40%,#B45309_60%,#451A03_100%)] text-[#FFFBEB] border border-[#FCD34D] shadow-[inset_0_1px_4px_rgba(255,255,255,0.5),0_4px_10px_rgba(120,53,15,0.4)]' 
                        }`}>
                            {u.plan === '100k' ? <><Crown size={12}/> VVIP</> : u.plan === '50k' ? <><Star size={12}/> VIP</> : <><Eye size={12}/> CƠ BẢN</>}
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
    );
}