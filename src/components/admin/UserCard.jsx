import React from 'react';
import { Trash2, Crown, Clock, ShieldAlert, Mail, Eye, X, TimerReset, Check, MessageSquareOff } from 'lucide-react';
import PlanBadge from './PlanBadge'; // Import chuẩn như bạn yêu cầu!

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
        <div className={`liquid-glass bg-white/60 backdrop-blur-xl rounded-[28px] md:rounded-[32px] p-5 md:p-6 flex flex-col gap-5 border border-white/80 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] ${isAbandoned ? 'border-gray-200/50 bg-gray-50/40 opacity-80' : (!u.isApproved && u.role !== 'admin' && u.plan !== 'premium' ? 'border-orange-300/50 bg-orange-50/40' : '')}`}>
            
            {/* PHẦN 1: THÔNG TIN & TRẠNG THÁI */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-black text-[20px] text-[#1D1D1F] tracking-tight">{u.name}</h3>
                        {/* GỌI TRỰC TIẾP PLAN BADGE CHUẨN CHỈ */}
                        {isAbandoned ? (
                            <span className="h-[28px] flex items-center justify-center px-4 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200/60 shadow-sm shrink-0">CHƯA CHỌN</span>
                        ) : (
                            <PlanBadge plan={u.role === 'admin' ? 'premium' : u.plan} />
                        )}
                    </div>
                    
                    <p className="text-gray-500 text-[13px] font-bold flex items-center gap-2 mb-3"><Mail size={14} className="text-gray-400"/> {u.email}</p>
                    
                    <div className="flex flex-wrap gap-2">
                        {u.role !== 'admin' ? (
                            isAbandoned ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm bg-gray-100/80 text-gray-500 border border-gray-200/60">
                                    <Clock size={12}/> Khách chưa hoàn tất đăng ký...
                                </div>
                            ) : u.plan === 'premium' ? (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border border-purple-200/60 bg-purple-50/80 text-purple-700">
                                    <Clock size={12}/> Hạn sử dụng: Vô thời hạn
                                </div>
                            ) : u.isApproved ? (
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm border ${(!u.planExpiry || new Date() > new Date(u.planExpiry)) ? 'bg-red-50/80 text-red-600 border-red-200/60 animate-pulse' : 'bg-teal-50/80 text-teal-700 border-teal-200/60'}`}>
                                    <Clock size={12}/> Hạn sử dụng: {getRemainingTime(u.planExpiry)}
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm bg-orange-50/80 text-orange-600 border border-orange-200/60">
                                    <Clock size={12}/> Đang chờ duyệt Bill...
                                </div>
                            )
                        ) : null}
                        
                        {isRestricted && u.restrictedUntil && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm bg-rose-50/80 text-rose-600 border border-rose-200/60">
                                <ShieldAlert size={12}/> Khóa web đến: {new Date(u.restrictedUntil).toLocaleString('vi-VN')}
                            </div>
                        )}

                        {isChatRestricted && (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold shadow-sm bg-orange-50/80 text-orange-600 border border-orange-200/60">
                                <MessageSquareOff size={12}/> Cấm Chat: {chatRestrictStatus === 'forever' ? 'Vĩnh viễn' : (u.chatRestrictedUntil ? new Date(u.chatRestrictedUntil).toLocaleString('vi-VN') : '')}
                            </div>
                        )}
                    </div>
                </div>

                {/* NÚT XEM BILL & DUYỆT */}
                {u.role !== 'admin' && !isAbandoned && (
                    <div className="flex gap-2 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
                        {u.paymentImage ? (
                            <button onClick={() => setSelectedBill(u.paymentImage)} className="flex-1 lg:flex-none items-center justify-center gap-1.5 bg-white border border-blue-200 text-blue-600 px-5 h-11 rounded-[14px] font-black text-[12px] hover:bg-blue-50 transition-all shadow-sm active:scale-95 animate-pulse flex"><Eye size={16} strokeWidth={2.5}/> XEM BILL</button>
                        ) : (
                            <span className="flex-1 lg:flex-none h-11 flex items-center justify-center text-gray-400 text-[11px] font-bold bg-gray-100/80 px-4 rounded-[14px] border border-gray-200/60">Chưa có Bill</span>
                        )}
                        <button onClick={() => handleApprove(u._id)} className={`flex-1 lg:flex-none h-11 px-6 rounded-[14px] font-black text-[12px] shadow-sm transition-all active:scale-95 ${u.isApproved ? 'bg-gray-100/80 text-gray-400 border border-gray-200/60' : 'bg-gradient-to-r from-[#1DB2A0] to-[#159a8a] text-white hover:opacity-90 shadow-[0_4px_12px_rgba(29,178,160,0.2)]'}`}>
                            {u.isApproved ? 'ĐÃ DUYỆT' : 'DUYỆT VÀO'}
                        </button>
                    </div>
                )}
            </div>

            {/* PHẦN 2: PHÂN QUYỀN */}
            {u.role !== 'admin' && !isAbandoned && (
                <div className="flex flex-wrap items-center gap-3 bg-white/60 p-3 rounded-[16px] border border-white shadow-inner">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-1 shrink-0">Phân quyền:</span>
                    {u.plan === 'premium' && (
                        <>
                            <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 cursor-pointer hover:text-[#1D1D1F] transition-colors"><input type="checkbox" checked={u.permissions?.canPay} onChange={() => togglePermission(u._id, u.permissions, 'canPay')} className="accent-teal-500 w-4 h-4 rounded-md cursor-pointer"/> Phát Lương</label>
                            <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 cursor-pointer hover:text-[#1D1D1F] transition-colors"><input type="checkbox" checked={u.permissions?.canEdit} onChange={() => togglePermission(u._id, u.permissions, 'canEdit')} className="accent-blue-500 w-4 h-4 rounded-md cursor-pointer"/> Sửa</label>
                            <label className="flex items-center gap-1.5 text-[12px] font-bold text-gray-600 cursor-pointer hover:text-[#1D1D1F] transition-colors"><input type="checkbox" checked={u.permissions?.canDelete} onChange={() => togglePermission(u._id, u.permissions, 'canDelete')} className="accent-rose-500 w-4 h-4 rounded-md cursor-pointer"/> Xóa</label>
                            <div className="w-[1px] h-4 bg-gray-300 mx-1 hidden sm:block"></div>
                        </>
                    )}
                    <label className="flex items-center gap-1.5 text-[12px] font-bold text-orange-600 cursor-pointer hover:text-orange-700 transition-colors"><input type="checkbox" checked={u.permissions?.canViewDetail} onChange={() => togglePermission(u._id, u.permissions, 'canViewDetail')} className="accent-orange-500 w-4 h-4 rounded-md cursor-pointer"/> Xem Chi Tiết</label>
                </div>
            )}

            {/* PHẦN 3: HÀNH ĐỘNG KIỂM SOÁT */}
            {u.role !== 'admin' && (
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-gray-200/50">
                    {!isAbandoned && (
                        <div className="relative group shrink-0">
                            <select 
                                className="appearance-none h-11 text-[12px] font-black pl-10 pr-5 rounded-[14px] outline-none cursor-pointer border border-indigo-200/60 bg-indigo-50/80 text-indigo-700 shadow-sm transition-all hover:bg-white focus:ring-4 focus:ring-indigo-500/20"
                                value={u.plan || '10k'}
                                onChange={(e) => handleChangePlan(u._id, e.target.value, u.permissions)}
                            >
                                <option value="10k">🥉 CƠ BẢN (10k)</option>
                                <option value="50k">🥈 VIP (50k)</option>
                                <option value="100k">🥇 VVIP (100k)</option>
                                <option value="premium">💎 PREMIUM</option>
                            </select>
                            <Crown size={16} strokeWidth={2.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" />
                        </div>
                    )}

                    {!isAbandoned && u.plan !== 'premium' && (
                        editExpiryId === u._id ? (
                            <div className="flex items-center gap-1.5 bg-pink-50/80 p-1.5 rounded-[14px] border border-pink-200/60 shadow-inner h-11 animate-fade-in shrink-0">
                                <input 
                                    type="number" min="1" 
                                    value={expiryVal} 
                                    onChange={e => setExpiryVal(e.target.value)} 
                                    className="w-12 h-full px-1 text-[13px] font-black text-center rounded-[10px] border border-pink-200 outline-none focus:border-pink-400 bg-white" 
                                />
                                <select 
                                    value={expiryUnit} 
                                    onChange={e => setExpiryUnit(e.target.value)} 
                                    className="h-full text-[12px] font-bold px-2 rounded-[10px] outline-none border border-pink-200 text-pink-700 bg-white cursor-pointer"
                                >
                                    <option value="seconds">Giây</option>
                                    <option value="minutes">Phút</option>
                                    <option value="hours">Giờ</option>
                                    <option value="days">Ngày</option>
                                </select>
                                <button onClick={() => submitCustomExpiry(u._id)} className="h-full w-8 flex items-center justify-center bg-pink-500 text-white rounded-[10px] hover:bg-pink-600 transition-colors shadow-sm"><Check size={16} strokeWidth={3}/></button>
                                <button onClick={() => setEditExpiryId(null)} className="h-full w-8 flex items-center justify-center bg-white text-gray-500 border border-gray-200 rounded-[10px] hover:bg-gray-100 transition-colors shadow-sm"><X size={16} strokeWidth={3}/></button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => { setEditExpiryId(u._id); setExpiryVal(1); setExpiryUnit('minutes'); }} 
                                className="flex items-center justify-center gap-2 h-11 text-[12px] font-bold px-4 rounded-[14px] border border-pink-200/60 bg-pink-50/80 text-pink-600 hover:bg-white transition-all shadow-sm active:scale-95 shrink-0"
                            >
                                <TimerReset size={16} strokeWidth={2.5}/> Sửa Hạn
                            </button>
                        )
                    )}

                    {!isAbandoned && (u.plan === '100k' || u.plan === 'premium') && (
                        <div className="relative group shrink-0">
                            <select 
                                className={`appearance-none h-11 text-[12px] font-bold pl-9 pr-5 rounded-[14px] outline-none cursor-pointer border transition-colors shadow-sm focus:ring-4 focus:ring-orange-500/20 ${chatRestrictStatus !== '0' ? 'bg-orange-50/80 text-orange-600 border-orange-200/60' : 'bg-white/80 text-gray-600 border-gray-200/60 hover:bg-white'}`} 
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
                            <MessageSquareOff size={16} strokeWidth={2.5} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${chatRestrictStatus !== '0' ? 'text-orange-500' : 'text-gray-400'}`} />
                        </div>
                    )}

                    {!isAbandoned && (
                        <select 
                            className={`h-11 text-[12px] font-bold px-4 rounded-[14px] outline-none cursor-pointer border transition-colors shadow-sm focus:ring-4 focus:ring-rose-500/20 shrink-0 ${isRestricted ? 'bg-rose-50/80 text-rose-600 border-rose-200/60' : 'bg-white/80 text-gray-600 border-gray-200/60 hover:bg-white'}`} 
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
                    )}
                    
                    <button onClick={() => handleDeleteUser(u._id)} className="w-11 h-11 flex items-center justify-center text-rose-500 bg-white hover:bg-rose-50 border border-gray-200/60 rounded-[14px] transition-all shadow-sm active:scale-90 ml-auto lg:ml-0 shrink-0"><Trash2 size={18} strokeWidth={2.5}/></button>
                </div>
            )}
        </div>
    );
}